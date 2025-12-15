import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { generateToken, parseJWT } from "../../utils/jwtTokenConfig.js";

class AttendanceService {

    async getAllAttendace(gymId){
        const attendance = await prisma.attendance.findMany({
            where: {
                gymId: gymId,
                checkOutAt: null,
            },
        });

        return attendance;
    }

    async getAttendanceToken(user_id, gymId){
        const member = await prisma.membership.findFirst({
            where: {
                gymId: gymId,
                userId: user_id,
                status: 'AKTIF',
                endDate: {
                    gte: new Date(),
                },
            },
            select: {
                id: true,
            }
        });
        if(!member) throw BaseError.notFound("Attendance not found");

        const token = generateToken(member.id, '15m');

        return {token, memberId: `GYM${gymId}-MEMBERSHIP${member.id}`};
    }


    async checkIn(data, penjagaId){

        const decoded = parseJWT(data);
        if(!decoded || !decoded.id) throw BaseError.unauthorized("Invalid token");
        

        // Cek membership AKTIF
        const activeMembership = await prisma.membership.findFirst({
            where: {
                id: decoded.id,
                status: 'AKTIF',
                endDate: {
                    gte: new Date(),
                },
            },
        });
        if(!activeMembership) throw BaseError.badRequest("User does not have an active membership");


        // cek penjaga gym
        const penjaga =  await prisma.user.findFirst({
            where: {
                id: penjagaId,
                role: 'PENJAGA',
                gymId: activeMembership.gymId,
            },
        });
        if(!penjaga) throw BaseError.forbidden("You are not authorized to check in members for this gym");
        // Cek apakah sudah check in
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                membershipId: activeMembership.id,
                gymId: activeMembership.gymId,
                checkOutAt: null,
            },
        });
        if(existingAttendance) throw BaseError.badRequest("User already checked in");
        const attendance = await prisma.attendance.create({
            data: {
                gymId: activeMembership.gymId,
                membershipId: activeMembership.id,
                checkInAt: new Date(),
                createdById: penjagaId,
            },
            select: {
                membership: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });
        return {message: "Check-in successful", attendance: attendance.membership.user};
    }

    // ga perlu login penjaga untuk check out
    async checkOut(memberId){
        
        const member = await prisma.membership.findFirst({
            where: {
                userId: memberId,
            },
            select: {
                id: true,
                gymId: true,
            }
        });

        if(!member) throw BaseError.notFound("Membership not found");

        const attendance = await prisma.attendance.findFirst({
            where: {
                membershipId: member.id,
                gymId: member.gymId,
                checkOutAt: null,
            },
        });
        if(!attendance) throw BaseError.badRequest("User has not checked in");

        await prisma.attendance.update({
            where: {
                id: attendance.id,
            },
            data: {
                checkOutAt: new Date(),
            },
        });

        return {message: "Check-out successful"};
    }

    async getAttendanceHistory(gymId){
        const attendance = await prisma.attendance.findMany({
            where: {
                gymId: gymId,
                
            },
        });
        return attendance;
    }

    async getMemberAttendanceHistory(memberId){
        const attendance = await prisma.attendance.findMany({
            where: {
                membership: {
                    userId: memberId,
                },
            },
        });

        return attendance;
    }
}

export default new AttendanceService();