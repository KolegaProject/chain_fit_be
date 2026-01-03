import BaseError from "../../../base_classes/base-error.js";
import prisma from "../../../config/db.js";
import { addDays, generatePassword, usernameFromEmail } from "../../../utils/generateRegisterUser.js";
import { hashPassword } from "../../../utils/passwordConfig.js";


class GymMembershipService {
    // membership
    // yang bisa dapat liat membership gym adalah member (dia detect dari membership dia), owner (dia punya gymnya), penjaga (dia staff gymnya)
    async getAllMemberships(userId) {

        const membership = await prisma.membership.findMany({
            where: {
                userId: userId,
                startDate:{
                    lte: new Date(),
                },
                endDate: {
                    gte: new Date(),
                },
            },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                gym: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    }
                },
                package: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        durationDays: true
                    }
                }
            }
        });
        if(!membership || membership.length === 0) throw BaseError.notFound("membership not found");
        return membership;
    }


    // crud member
    // data (name, email)
    async createMembership(data, gymId, paketId) {
        // 1) Pastikan requester punya akses ke gym (owner / staff)
        const gym = await prisma.gym.findFirst({
        where: {
            id: gymId
        },
        });

        if (!gym) throw BaseError.notFound("Gym not found");

        // 2) Pastikan paket ada DAN milik gym tsb
        const paket = await prisma.membershipPackage.findFirst({
        where: {
            id: paketId,
            gymId: gym.id,
        },
        });

        if (!paket) throw BaseError.notFound("Paket gym not found");

        // 3) Cek user sudah terdaftar (email unique)
        const existingUser = await prisma.user.findFirst({
            where: { email: data.email },
            select: {id: true },
        });

        if (existingUser) throw BaseError.badRequest("User already registered");

        // 4) Generate credential & tanggal membership
        const plainPassword = generatePassword();
        const now = new Date();
        const endDate = addDays(now, paket.durationDays);

        // 5) Transaction: create user + membership + cashflow (+ transaksi pemasukan)
        const result = await prisma.$transaction(async (tx) => {
        // username dari email, jaga-jaga kalau bentrok
        const baseUsername = usernameFromEmail(data.email);
        let username = baseUsername;

        for (let i = 0; i < 5; i++) {
            const taken = await tx.user.findUnique({ where: { username } });
            if (!taken) break;
            username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
        }

        const user = await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                username, // dari email sebelum "@"
                password: await hashPassword(plainPassword),
                role: "MEMBER",
            },
        });

        const membership = await tx.membership.create({
            data: {
                gymId: gym.id,
                userId: user.id,
                packageId: paket.id,
                status: "AKTIF",
                startDate: now,
                endDate,
            },
        });

        await tx.gymCashflow.create({
            data: {
            name: `Pendaftaran gym - ${paket.name}`,
            jumlah: paket.price,
            type: "CASH",
            },
        });

        // (Opsional tapi bagus) Catat juga ke model Transaction (income)

            return { user, membership };
        });

        return {
            message: "Successfully create user",
            password: plainPassword,
            userId: result.user.name,
        };
    }

    // update membereship manual
    async updateMembership(membershipId, paketId) {
        const now = new Date();

        await prisma.$transaction(async (tx) => {
            const membership = await tx.membership.findFirst({
                where: { id: membershipId },
                select: {
                    id: true,
                    userId: true,
                    gymId: true,
                    startDate: true,
                    endDate: true, 
                    status: true,
                    user: true
                },
                orderBy: { endDate: "desc" },
            });

            if (!membership) throw BaseError.notFound("Membership not found");


            const paket = await tx.membershipPackage.findFirst({
                where: { id: paketId, gymId: membership.gymId },
            });
            if (!paket) throw BaseError.notFound("Paket gym not found");
            
            const isActive = membership.status === "AKTIF" && membership.endDate > now;
            const startDate = isActive ? membership.startDate : now;
            const baseEnd = isActive ? membership.endDate : now;
            const endDate = addDays(baseEnd, paket.durationDays);

            await tx.gymCashflow.create({
                data: {
                    name: `Update membership - ${membership.user.name}`,
                    jumlah: paket.price,
                    type: "CASH"
                }
            });

            await tx.membership.update({
                where: { id: membership.id },
                data: {
                    packageId: paket.id,
                    status: "AKTIF",
                    startDate,
                    endDate,
                },
            });

            return "Succesfully updated user member";
        });
    }

    // delete user where status tidak aktif
    async removeMembership(membershipId) {
        const now = new Date();

        await prisma.$transaction(async (tx) => {
            const membership = await tx.membership.findFirst({
                where: { id: membershipId },
                orderBy: { endDate: "desc" },
            });

            if (!membership) throw BaseError.notFound("Membership not found");

            const expired = membership.endDate < now || membership.status === "TIDAK";
            if (!expired) {
                throw BaseError.badRequest("Membership still activated");
            }

            await tx.attendance.deleteMany({
                where: { membershipId: membership.id },
            });

            await tx.membership.delete({
                where: { id: membership.id },
            });
        });

        return { message: "Succesfully delete membership" };
    }


    async getAllUserMembership(gymId) {
        const members = await prisma.membership.findMany({
            where: { gymId },
            select: {
            id: true,
            status: true,
            endDate: true,
            user: { select: { name: true, email: true } },
            },
            orderBy: { endDate: "desc" },
        });

        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        return members.map((m) => {
            const isActive = m.status === "AKTIF" && m.endDate.getTime() >= now;
            const masaAktifHari = isActive
            ? Math.max(0, Math.ceil((m.endDate.getTime() - now) / dayMs))
            : 0;

            return {
                id: m.id,
                status: m.status,
                masaAktifHari,
                user: m.user,
            };
        });
    }

    async getUserMembershipById(gymId, membershipId){
        const member = await prisma.membership.findFirst({
            where: {
                gymId: gymId,
                id: membershipId
            }
        })
        if(!member) throw BaseError.notFound("Member not found")
        return member; 
    }

}


export default new GymMembershipService();
