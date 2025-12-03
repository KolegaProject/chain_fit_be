import Joi from "joi";
import BaseError from "../../../base_classes/base-error.js";
import { hashPassword, matchPassword } from "../../../utils/passwordConfig.js";
import prisma from "../../../config/db.js";
import { uploadFile } from "../../../utils/saveImage.js";

class GymPenjagaService {

    async createPenjagaGym(data, ownerId, gymId){
        const checkGym = await prisma.gym.findFirst({
            where: {
                id: gymId,
                ownerId,
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

    async deletePenjagaGym(userId, ownerId, gymId){
        const findUser = await prisma.user.findFirst({
            where: {
                id: userId,
                role: "PENJAGA",
                gym: {
                    ownerId: ownerId,
                    id: gymId
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

    async getPenjagaProfile(id){
        const penjaga = await prisma.user.findFirst({
            where: {
                id: id,
                role: "PENJAGA"
            },
            select: {
                name: true,
                username: true,
                email: true,
                profileImage: true
            }
        });
        if(!penjaga) throw BaseError.notFound("User not found");
        return penjaga
    }

    async updatePenjaga(id, data, imageProfile, ownerId){
        
        const checkUser = await prisma.user.findFirst({
            where: {
                id,
                gym: {
                    ownerId: ownerId
                }
            }
        })
        if(!checkUser) throw BaseError.notFound("Penjaga not found");

        if(imageProfile){
            const profileUserUrl = `profile-user/${checkUser.gymId}/${checkUser.id}`;
            const uploadImageUrl = await uploadFile(profileUserUrl, imageProfile);
            if (!uploadImageUrl || !uploadImageUrl.length) {
                throw new Error("failed to upload image");
            }

            data.profileImage = uploadImageUrl[0];
        }

        const user = await prisma.user.update({
            where: {
                id: checkUser.id
            },
            data,
            select: {
                name: true,
                email: true
            }
        })
        return user;
    }

    // data (ownerId, id)
    async updatePasswordProfile(data, oldPassword, newPassword) {
        const user = await prisma.user.findFirst({
            where: {
                id: data.id,
                gym: {
                    ownerId: data.ownerId
                }
            },
            
        })

        if (!user) throw BaseError.notFound("User not found");

        const isMatch = await matchPassword(oldPassword, user.password);

        if (!isMatch) {
            throw new Joi.ValidationError("Wrong Password", [{'message': 'Wrong Password', 'path': ['old_password']}]);
        }

        if (oldPassword === newPassword) {
            throw new Joi.ValidationError("New password cannot be the same as the old password", [{'message': 'New password cannot be the same as the old password', 'path': ['new_password']}]);
        }

        user.password = await hashPassword(newPassword);
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: user.password
            }
        })

        return { message: "Password updated successfully" };
    }
}

export default new GymPenjagaService();