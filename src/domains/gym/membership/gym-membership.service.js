import BaseError from "../../../base_classes/base-error.js";
import prisma from "../../../config/db.js";


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
}


export default new GymMembershipService();
