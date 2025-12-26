import { Prisma } from "@prisma/client";
import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";

class PaketMembershipService {
    async createPaket(data, userId, gymId){
        const checkGym = await prisma.gym.findFirst({
            where: {
                id: gymId,
                OR: [
                    {
                        ownerId: userId
                    },
                    {
                        staff: {
                            some: {
                                id: userId
                            }
                        }
                    }  
                ]
            }
        });

        if(!checkGym) throw BaseError.notFound("gym not found")

        try{
            const items = data.map((p)=>({
                ...p,
                gymId: checkGym.id
            }));
            const createPaket = await prisma.membershipPackage.createMany({
                data: items
            })
            if(createPaket.count < 1){
                throw new Error("failed to create membership package")
            }
            return {message: "Succesfully add data"}
        }catch(err){
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                // ini lebih cocok 409 / conflict daripada notFound
                throw new Error('Name package is already used for this gym');
            }
                throw err;
        }
    }

    async getAllPaket(gymId, userId){
        const checkOwnerOrStaff = this.checkOwnerOrStaff(gymId, userId);
        const paket = await prisma.membershipPackage.findMany({
            where: {
                gymId: gymId,
                ...(!checkOwnerOrStaff ? {}: {gym: {verified: "APPROVED"}})
            }
        })
        return paket;
    }

    async getPaketById(gymId, paketId, userId){
        const checkOwnerOrStaff = this.checkOwnerOrStaff(gymId, userId);
        const paket = await prisma.membershipPackage.findFirst({
            where: {
                id: paketId,
                gymId: gymId,
                ...(!checkOwnerOrStaff ? {}: {gym: {verified: "APPROVED"}})
            }
        })
        if(!paket) throw BaseError.notFound("Paket not found");

        return paket;
    }

    async deletePaket(gymId, paketId, userId){
        const paket = await prisma.membershipPackage.findFirst({
            where: {
                id: paketId,
                gymId: gymId,
                OR: [
                    {
                        gym: {
                            ownerId: userId
                        }
                    },
                    {
                        gym: {
                            staff: {
                                some: {
                                    id: userId
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true
            }
        })
        if(!paket) throw BaseError.notFound("paket not found");
        await prisma.membershipPackage.delete({
            where: {
                id: paket.id
            }
        })
        return {message: "Succesfully delete package"}
    }

    async updatePaket(gymId, paketId, userId, data){
        const paket = await prisma.membershipPackage.findFirst({
            where: {
                id: paketId,
                gymId: gymId,
                OR: [
                    {
                        gym: {
                            ownerId: userId
                        }
                    },
                    {
                        gym: {
                            staff: {
                                some: {
                                    id: userId
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true
            }
        })
        if(!paket) throw BaseError.notFound("paket not found");
        try {
            const updatePaket = await prisma.membershipPackage.update({
                where: {
                    id: paket.id
                },
                data: data
            });
            return updatePaket
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                // ini lebih cocok 409 / conflict daripada notFound
                throw BaseError.conflict('Name package is already used for this gym');
            }
            throw err;
        }
    }

    async checkOwnerOrStaff(gymId, userId){
        const checkOwnerOrStaff = userId ? await prisma.gym.findFirst({
            where: {
                id: gymId,
                OR: [
                    {staff: {some: {id: userId}}},
                    {ownerId: userId},
                ]
        }}
        ): null;
        console.log(checkOwnerOrStaff);
        
        return checkOwnerOrStaff;
    }
    
}

export default new PaketMembershipService();