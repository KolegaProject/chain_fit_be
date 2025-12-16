import Joi from "joi";
import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { uploadFile } from "../../utils/saveImage.js";
import { hashPassword } from "../../utils/passwordConfig.js";


class GymService {


    async createGym(data, img=[]){
        if(!img){
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
                    facility: data.fac
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

    async deleteGym(userId, id){
        const checkGym = await prisma.gym.findFirst({
            where: {
                id: id,
                ownerId: userId
            }
        })
        if(!checkGym) throw BaseError.notFound("Gym not found");
        
        const gym = await prisma.gym.delete({
            where: {
                id: checkGym.id
            }
        })
        if(!gym) throw new Error("Gym not deleted")

        return "succesfully delete gym"
    }

    // nanti dulu bingung
    async updateGym(data, userId, id){
        console.log(data);
        
        const checkGym = await prisma.gym.findFirst({
            where: {
                id,
                ownerId: userId
            }
        });
        if(!checkGym) throw BaseError.notFound("Gym not found");

        // jangan pake update gambar dulu cuman data aja
        // data = {name, maxCapacity, address, jamOperasional}
        const updateGym = await prisma.gym.update({
            where: {
                id: checkGym.id
            },
            data: data
        })
        if(!updateGym) throw new Error("failed to update gym");
        return updateGym;

    }


    async getAllGym(search){
        const where = {};
        if(search){
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
                name: true,
                maxCapacity: true,
                id: true,
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
        return gym;
    }

    async getGymById(id){
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
        if(!gym) throw BaseError.notFound("gym not found");
        return gym;
    }
    
    async getListGymNotVerifed(){
        const gym = await prisma.gym.findMany({
            where: {
                verified: "PENDING"
            },
        })
        return gym;
    }

    async getListGymNotVerifedById(id){
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
        if(!gym) throw BaseError.notFound("gym not found");

        return gym;
    }

    async verifedGym(id){
        const gym = await prisma.gym.findUnique({
            where: {
                id: id,
                verified: "PENDING"
            },
        })
        if(!gym) throw BaseError.notFound("gym not found");

        await prisma.gym.update({
            where: {
                id: gym.id
            },
            data: {
                verified: "APPROVED"
            }
        })

        return "successfully verified gym"
    }

    async rejectedGym(id){
        const gym = await prisma.gym.findUnique({
            where: {
                id: id,
                verified: "PENDING"
            },
        })  
        if(!gym) throw BaseError.notFound("gym not found");

        await prisma.gym.update({
            where: {
                id: gym.id
            },
            data: {
                verified: "REJECTED"
            }
        })

        return "Rejected gym"
    }



    async getGymByOwnerId(userId){
        const gym = await prisma.gym.findMany({
            where: {
                ownerId: userId
            }
        });
        return gym;
    }


    // create penjaga gym
    async createPenjagaGym(data, ownerId){
        const checkGym = await prisma.gym.findFirst({
            where: {
                ownerId
            }
        });
        if(!checkGym) throw BaseError.notFound("gym not found");

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

        return {message: "Succefully create penjaga", data: user};
    }

    async deletePenjagaGym(userId, ownerId){
        const findUser = await prisma.user.findFirst({
            where: {
                id: userId,
                role: "PENJAGA",
                gym: {
                    ownerId: ownerId
                }
            }
        });
        
        if(!findUser) throw BaseError.notFound("Penjaga not found")

        await prisma.user.delete({
            where: {
                id: findUser.id
            }
        })
        return {message: "Succesfully delete penjaga"};
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
    async getPenjagaById(data){
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
        if(!penjaga) throw BaseError.notFound("Penjaga not found")
            return penjaga
    }

}

export default new GymService();