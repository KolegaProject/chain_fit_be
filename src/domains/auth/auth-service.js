import BaseError from "../../base_classes/base-error.js";
import { generateVerifEmail } from "../../utils/bodyEmail.js";
import sendEmail from "../../utils/sendEmail.js";
import { parseJWT, generateToken } from "../../utils/jwtTokenConfig.js";
import joi from "joi";
import prisma from "../../config/db.js";
import { hashPassword, matchPassword } from "../../utils/passwordConfig.js";
import { uploadFile } from "../../utils/saveImage.js";


class AuthService {

    async registerOwner(userData){
        const emailExist = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        });

        const usernameExist = await prisma.user.findUnique({
            where: {
                username: userData.username,
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
            throw new joi.ValidationError(validation, stack);
        }

        userData.role = "OWNER"
        userData.password = await hashPassword(userData.password);
        const createdUser = await prisma.user.create({
            data: userData
        });

        if (!createdUser) {
            throw Error("Failed to register");
        } 
        return {message: "User registered successfully."};


    }


    // all user
    async login(username, password) {
        let user = await prisma.user.findFirst({
            where: {
                username: username
            }
        });
        if(!user){
            user = await prisma.user.findFirst({
                where: {
                    email: username
                }
            });
            if (!user) {
                throw BaseError.badRequest("Invalid credentials");
            }
        }

        const isMatch = await matchPassword(password, user.password);
        
        if (!isMatch) {
            throw BaseError.badRequest("Invalid credentials");
        }


        const accessToken = generateToken({id: user.id, account_type: user.role}, "1d");
        const refreshToken = generateToken(user.id, "365d");

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    // Login via Google / Facebook
    async loginWithSocialAccount(provider, username) {
        const allowedProviders = ["google", "facebook"];

        // if (!username) {
        //     throw BaseError.badRequest("Username is required");
        // }

        if (!allowedProviders.includes(provider)) {
            throw BaseError.badRequest("Unsupported provider.");
        }

        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        });
        if (!user) {
            throw BaseError.badRequest("Invalid credentials"); // atau notFound bila ingin 404
        }

        const accessToken = generateToken({ id: user.id, account_type: user.role }, "1d");
        const refreshToken = generateToken(user.id, "365d");

        return { access_token: accessToken, refresh_token: refreshToken};
    }

    // register user
    async register(data) {
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
            throw new joi.ValidationError(validation, stack);
        }

        data.password = await hashPassword(data.password);
        const createdUser = await prisma.user.create({
            data: data
        });

        if (!createdUser) {
            throw Error("Failed to register");
        }


        return {message: "User registered successfully."};
    }

    
    async getProfile(id) {
        const u = await prisma.user.findUnique({
        where: { id: id },
        select: {
            id: true, username: true, email: true, role: true, profileImage: true, name: true,
            gym: { select: { id: true, name: true } },          // untuk staff
            gymsOwned: { where: {
                verified: "APPROVED"
            },select: { id: true, name: true } },    // untuk owner
            memberships: {                                      // opsional untuk member
            where: { status: "AKTIF", endDate: { gte: new Date() } },
            select: { gym: { select: { id: true, name: true } } }
            }
        }
        });

        let gyms = [];
        if (u.role === "PENJAGA" && u.gym) gyms = [u.gym];
        else if (u.role === "OWNER") gyms = u.gymsOwned;
        else if (u.role === "MEMBER") gyms = u.memberships.map(m => m.gym);

        const defaultGymId = gyms[0]?.id ?? null;

        return { user: { id:u.id, username:u.username, email:u.email, role:u.role, profileImage:u.profileImage, name: u.name }, gyms, defaultGymId };
    }

    async updateProfile(id, data, imgProfile) {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!user) {
            throw BaseError.notFound("User not found");
        }
        if(data.username){
            const usernameExist = await prisma.user.findUnique({
                where: {
                    username: data.username
                }
            });
            if (usernameExist) {
                let validation = "Username already taken.";
                let message = {
                        message: "Username already taken.",
                        path: ["email"]
                };
                throw new joi.ValidationError(validation, message);
            }
        }


        if(imgProfile){
            const profileUserUrl = `profile-user/${user.id}`;
            const uploadImageUrl = await uploadFile(profileUserUrl, imgProfile);
            if (!uploadImageUrl || !uploadImageUrl.length) {
                throw new Error("failed to upload image");
            }

            data.profileImage = uploadImageUrl[0];
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: data,
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        return updatedUser;
    }

    async updatePasswordProfile(id, oldPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user) {
            throw BaseError.notFound("User not found");
        }

        const isMatch = await matchPassword(oldPassword, user.password);

        if (!isMatch) {
            throw new joi.ValidationError("Wrong Password", [{'message': 'Wrong Password', 'path': ['old_password']}]);
        }

        if (oldPassword === newPassword) {
            throw new joi.ValidationError("New password cannot be the same as the old password", [{'message': 'New password cannot be the same as the old password', 'path': ['new_password']}]);
        }

        user.password = await hashPassword(newPassword);
        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                password: user.password
            }
        })

        return { message: "Password updated successfully" };
    }
    
    async refreshToken(token) {
        
        const decoded = parseJWT(token);
        
        if (!decoded) {
            throw BaseError.unauthorized("Invalid token");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            throw BaseError.notFound("User not found");
        }

        const accessToken = generateToken(user.id, "1d");

        return accessToken;
    }

    async generateEmailResetPassword(email){
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                name: true,
                id: true,
                email: true,
                role: true
            }
        })
        if(!user){
            throw BaseError.notFound("user not found");
        }

        const token = generateToken(user.id, "5m");
            const verificationLink = `${process.env.BE_URL}/api/v1/auth/verify-reset-password/${token}`;
            console.log("link: ", verificationLink);
        
        const emailHtml = generateVerifEmail(verificationLink);

        sendEmail(
                user.email,
                "Reset password dari Mou: Journaling",
                "Silankah mengklik link di bawah",
                emailHtml
        );

        return {message: "Successfully send reset password. Please check your email to reset your password"};
    }

    async verifyResetPassword(token){
        const decoded = parseJWT(token);

        if(!decoded){
            return { status: 400, message: "Invalid token" };
        }

        const user = await  prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                name: true,
                id: true,
                email: true,
                role: true
            }
        });
        

        if (!user) {
            return { status: 400, message: "User Not Found" }
        }

        return {status: 200, message: "Password verification successfully", data: token}
    }

    async resetPassword(newPassword, token){
        const decoded = parseJWT(token);
        console.log(decoded);
        

        if(!decoded){
            return { status: 400, message: "Invalid token" };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            }
        })
        if(!user){
            throw BaseError.notFound("user not found");
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

        return {message: "Password reset succesfully"}
    }

    // async verify(token) {
    //     const decoded = parseJWT(token);
        
    //     if (!decoded) {
    //         return { status: 400, message: "Invalid token" };
    //     }
    //     console.log(decoded.id);
        

    //     const user = await  prisma.user.findUnique({
    //         where: {
    //             id: decoded.id
    //         }
    //     });

    //     if (!user) {
    //         return { status: 400, message: "User Not Found" }
    //     }

    //     if (user.verifiedAt){
    //         return { status: 400, message: "Email already verified" };
    //     }

    //     await prisma.user.update({
    //         where: {
    //             id: user.id
    //         },
    //         data: {
    //             verifiedAt: new Date()
    //         }
    //     });

    //     return { status: 200, message: "Email verified successfully" };
    // }

}

export default new AuthService();