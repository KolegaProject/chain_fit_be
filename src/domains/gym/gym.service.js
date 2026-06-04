import Joi from "joi";
import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { uploadFile } from "../../utils/saveImage.js";
import { hashPassword } from "../../utils/passwordConfig.js";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

class GymService {


    async createGym(data, img = []) {
        if (!img) {
            throw new Error("Please upload image");
        }


        return await prisma.$transaction(async (tx) => {
            const gym = await tx.gym.create({
                data: {
                    ownerId: data.ownerId,
                    name: data.namaGym,
                    maxCapacity: data.maxCp,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    jamOperasional: data.jamOperasional,
                    address: data.address,
                    facility: data.fac,
                    tag: data.tag,
                    description: data.description
                }
            });

            const gymUrlPath = `image-profile/${gym.ownerId}/${gym.id}`;
            const uploadedImageUrls = await uploadFile(gymUrlPath, img);

            if (!uploadedImageUrls || !uploadedImageUrls.length) {
                throw new Error("failed to upload image");
            }

            const gymImagesData = uploadedImageUrls.map((url) => ({
                gymId: gym.id,
                url,
            }));

            await tx.gymImage.createMany({
                data: gymImagesData,
            });

            return gym;
        });
    }

    async deleteGym(userId, id) {
        const checkGym = await prisma.gym.findFirst({
            where: {
                id: id,
                ownerId: userId
            }
        })
        if (!checkGym) throw BaseError.notFound("Gym not found");

        const gym = await prisma.gym.delete({
            where: {
                id: checkGym.id
            }
        })
        if (!gym) throw new Error("Gym not deleted")

        return "succesfully delete gym"
    }

    async updateGym(data, userId, id, img = []) {
        return await prisma.$transaction(async (tx) => {
            const checkGym = await tx.gym.findFirst({
                where: {
                    id,
                    ownerId: userId
                },
                include: {
                    gymImage: true
                }
            });
            if (!checkGym) throw BaseError.notFound("Gym not found");

            const updateGym = await tx.gym.update({
                where: {
                    id: checkGym.id
                },
                data: data
            });
            if (!updateGym) throw new Error("failed to update gym");

            if (img && img.length > 0) {
                const gymUrlPath = `image-profile/${checkGym.ownerId}/${checkGym.id}`;
                const uploadedImageUrls = await uploadFile(gymUrlPath, img);

                if (!uploadedImageUrls || !uploadedImageUrls.length) {
                    throw new Error("failed to upload image");
                }

                await tx.gymImage.deleteMany({
                    where: {
                        gymId: checkGym.id
                    }
                });

                await tx.gymImage.createMany({
                    data: uploadedImageUrls.map((url) => ({
                        gymId: checkGym.id,
                        url,
                    })),
                });
            }

            return await tx.gym.findUnique({
                where: { id: checkGym.id },
                include: {
                    gymImage: {
                        select: {
                            id: true,
                            url: true
                        }
                    }
                }
            });
        });

    }


    async getAllGym(search) {
        const where = {};
        if (search) {
            where.name = {
                contains: search,
            }
        }

        const gym = await prisma.gym.findMany({
            where: {
                ...where,
                verified: "APPROVED"
            },
            select: {
                id: true,
                name: true,
                maxCapacity: true,
                id: true,
                address: true,
                jamOperasional: true,
                tag: true,
                latitude: true,
                longitude: true,
                facility: true,
                description: true,
                gymImage: {
                    select: {
                        id: true,
                        url: true
                    }
                }
            }
        })
        return gym;
    }

    async getGymById(id) {
        const gym = await prisma.gym.findFirst({
            where: {
                id,
                verified: "APPROVED"
            },
            include: {
                gymImage: {
                    select: {
                        id: true,
                        url: true
                    }
                }
            }
        })
        if (!gym) throw BaseError.notFound("gym not found");
        return gym;
    }

    async getGymDashboardOverview(id, userId) {
        const gym = await prisma.gym.findFirst({
            where: {
                id,
                verified: "APPROVED",
                ownerId: userId
            },
            select: {
                id: true,
                name: true,
                address: true,
                jamOperasional: true,
                gymImage: {
                    select: {
                        id: true,
                        url: true
                    }
                }
            }
        })
        if (!gym) throw BaseError.notFound("gym not found");

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const [
            totalMember,
            activeStaff,
            totalEquipment,
            allCashflows,
            recentTransactions,
            equipments,
        ] = await Promise.all([
            prisma.membership.count({
                where: {
                    gymId: id,
                    status: "AKTIF",
                    endDate: {
                        gte: now,
                    },
                },
            }),
            prisma.user.count({
                where: {
                    role: "PENJAGA",
                    gymId: id,
                },
            }),
            prisma.equipment.count({
                where: {
                    gymId: id,
                },
            }),
            prisma.gymCashflow.findMany({
                where: {
                    gymId: id,
                    isDeleted: false,
                },
                select: {
                    amount: true,
                    transactionType: true,
                    date: true,
                },
                orderBy: {
                    date: "desc",
                },
            }),
            prisma.gymCashflow.findMany({
                where: {
                    gymId: id,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    name: true,
                    amount: true,
                    transactionType: true,
                    cashflowType: true,
                    date: true,
                    note: true,
                },
                orderBy: {
                    date: "desc",
                },
                take: 5,
            }),
            prisma.equipment.findMany({
                where: {
                    gymId: id,
                },
                select: {
                    id: true,
                    name: true,
                    healthStatus: true,
                    jumlah: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            }),
        ]);

        const incomeTrendMap = new Map();
        const expenseTrendMap = new Map();

        for (let i = 0; i < 7; i++) {
            const day = new Date(sevenDaysAgo);
            day.setDate(sevenDaysAgo.getDate() + i);
            const key = day.toISOString().slice(0, 10);
            incomeTrendMap.set(key, {
                date: key,
                dayLabel: DAY_LABELS[day.getDay()],
                total: 0,
            });
            expenseTrendMap.set(key, {
                date: key,
                dayLabel: DAY_LABELS[day.getDay()],
                total: 0,
            });
        }

        let totalIncome = 0;
        let totalExpense = 0;

        for (const cashflow of allCashflows) {
            const amount = Number(cashflow.amount);
            const cashflowDate = new Date(cashflow.date);
            const dateKey = cashflowDate.toISOString().slice(0, 10);

            if (cashflow.transactionType === "PENDAPATAN") {
                totalIncome += amount;
                if (incomeTrendMap.has(dateKey)) {
                    incomeTrendMap.get(dateKey).total += amount;
                }
            }

            if (cashflow.transactionType === "PENGELUARAN") {
                totalExpense += amount;
                if (expenseTrendMap.has(dateKey)) {
                    expenseTrendMap.get(dateKey).total += amount;
                }
            }
        }

        return {
            ...gym,
            summary: {
                totalMember,
                activeStaff,
                totalEquipment,
                totalIncome,
            },
            trends: {
                incomeLast7Days: Array.from(incomeTrendMap.values()),
                expenseLast7Days: Array.from(expenseTrendMap.values()),
            },
            recentTransactions: recentTransactions.map((item) => ({
                ...item,
                amount: Number(item.amount),
            })),
            facilityConditions: equipments.map((item) => ({
                id: item.id,
                name: item.name,
                healthStatus: item.healthStatus,
                quantity: item.jumlah,
                conditionPercent: item.healthStatus === "BAIK" ? 100 : 30,
            })),
            balance: {
                totalIncome,
                totalExpense,
                netBalance: totalIncome - totalExpense,
            },
        };
    }

    async getListGymNotVerifed() {
        const gym = await prisma.gym.findMany({
            where: {
                verified: "PENDING"
            },
        })
        return gym;
    }

    async getListGym() {
        const gym = await prisma.gym.findMany({})
        return gym;
    }

    

    async getListGymNotVerifedById(id) {
        const gym = await prisma.gym.findUnique({
            where: {
                id: id,
                verified: "PENDING"

            },
            include: {
                owner: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            }
        })
        if (!gym) throw BaseError.notFound("gym not found");

        return gym;
    }

    async verifedGym(id, status) {
        let verif = "APPROVED"
        let message = "Successfully verified gym"
        const gym = await prisma.gym.findFirst({
            where: {
                id: id,
                verified: {
                    in: ["PENDING", "REJECTED"]
                }
            },
        })
        if (!gym) throw BaseError.notFound("gym not found");
        if (gym.verified === "REJECTED" && status === "REJECTED") {
            throw BaseError.badRequest("Gym already rejected");
        }
        if (status !== verif) {
            verif = "REJECTED"
            message = "Rejected gym"
        }
        await prisma.gym.update({
            where: {
                id: gym.id
            },
            data: {
                verified: verif
            }
        })

        return message;
    }

    async getGymByOwnerId(userId) {
        const gym = await prisma.gym.findMany({
            where: {
                ownerId: userId
            }
        });
        return gym;
    }


    // create penjaga gym
    async createPenjagaGym(data, ownerId) {
        const checkGym = await prisma.gym.findFirst({
            where: {
                ownerId
            }
        });
        if (!checkGym) throw BaseError.notFound("gym not found");

        const emailExist = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        const usernameExist = await prisma.user.findUnique({
            where: {
                username: data.username,
            }
        })

        if (emailExist || usernameExist) {
            let validation = "";
            let stack = [];

            if (usernameExist) {
                validation = "Username already taken.";

                stack.push({
                    message: "Username already taken.",
                    path: ["username"]
                });
            }

            if (emailExist) {
                validation += "Email already taken.";

                stack.push({
                    message: "Email already taken.",
                    path: ["email"]
                });
            }
            throw new Joi.ValidationError(validation, stack);
        }

        data.role = "PENJAGA"
        data.gymId = checkGym.id;
        data.password = await hashPassword(data.password);
        const user = await prisma.user.create({
            data: data,
            select: {
                username: true,
                name: true
            }
        });

        return { message: "Succefully create penjaga", data: user };
    }

    async deletePenjagaGym(userId, ownerId) {
        const findUser = await prisma.user.findFirst({
            where: {
                id: userId,
                role: "PENJAGA",
                gym: {
                    ownerId: ownerId
                }
            }
        });

        if (!findUser) throw BaseError.notFound("Penjaga not found")

        await prisma.user.delete({
            where: {
                id: findUser.id
            }
        })
        return { message: "Succesfully delete penjaga" };
    }

    // dapetin semua penjaga di gym tertentu or dapetin semua penajga di owner itu 

    async getAllPenjaga(data) {

        const penjaga = await prisma.user.findMany({
            where: {
                role: "PENJAGA",
                gym: {
                    ownerId: data.ownerId,
                    ...(data.id ? { id: data.id } : {})
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,

            }
        });

        return penjaga;
    }

    // dapetin penjaga by id
    async getPenjagaById(data) {
        console.log(data);

        const penjaga = await prisma.user.findFirst({
            where: {
                id: data.userId,
                role: "PENJAGA",
                gym: {
                    ownerId: data.ownerId,
                    ...(data.id ? { id: data.id } : {})
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                gym: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (!penjaga) throw BaseError.notFound("Penjaga not found")
        return penjaga
    }

    // perpanjang member manual

}

export default new GymService();