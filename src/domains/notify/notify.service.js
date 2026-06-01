import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { getIo } from "../../config/socket.js";
import firebaseAdmin from "../../config/firebase.js";


function normalizeData(data = {}) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
    );
}


class NotifyService {
    async notifyUser(userId, payload, options = {}) {
        const channels = options.channels ?? ["fcm", "socket"];

        if (channels.includes("socket")) {
            await this.sendSocketNotification(userId, payload);
        }

        if (channels.includes("fcm")) {
            await this.sendFcmNotification(userId, payload);
        }
    }

    async sendSocketNotification(userId, payload) {
        const io = getIo();

        io.to(`user:${userId}`).emit("new_notification", {
            title: payload.title,
            message: payload.message,
            type: payload.type ?? "general",
            data: payload.data ?? {},
        });
    }

    async sendFcmNotification(userId, payload) {
        const tokens = await prisma.userFcmToken.findMany({
            where: { userId },
        });

        for (const item of tokens) {
            try {
                await firebaseAdmin.messaging().send({
                    token: item.fcmToken,
                    notification: {
                        title: payload.title,
                        body: payload.message,
                    },
                    data: {
                        type: payload.type ?? "general",
                        ...normalizeData(payload.data),
                    },
                });
            } catch (error) {
                const invalidTokenErrors = [
                    "messaging/registration-token-not-registered",
                    "messaging/invalid-registration-token",
                ];

                if (invalidTokenErrors.includes(error.code)) {
                    await prisma.userFcmToken.delete({
                        where: { id: item.id },
                    });
                }
            }
        }
    }


    async saveUserFcmToken(userId, token, platform) {
        return prisma.userFcmToken.upsert({
            where: {
                fcmToken: token,
            },
            update: {
                userId,
                platform,
            },
            create: {
                userId,
                fcmToken: token,
                platform,
            },
        });
    }

    async deleteUserFcmToken(userId, token) {
        return prisma.userFcmToken.deleteMany({
            where: {
                userId,
                fcmToken: token,
            },
        });
    }



}

export default new NotifyService();