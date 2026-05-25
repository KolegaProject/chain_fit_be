import { createdResponse, successResponse } from "../../utils/response.js";
import notifyService from "./notify.service.js";

class NotifyController {
    async saveFcmToken(req, res) {
            const userId = req.user.id;
            const { token, platform } = req.body;

            if (!token) {
                return res.status(400).json({
                    message: "FCM token is required",
                });
            }

            await notifyService.saveUserFcmToken(userId, token, platform);

            return createdResponse(res, "FCM token saved successfully");
    }

    async deleteFcmToken(req, res) {
            const userId = req.user.id;
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    message: "FCM token is required",
                });
            }

            await notifyService.deleteUserFcmToken(userId, token);

            return successResponse(res, "FCM token deleted successfully");
    }

}

export default new NotifyController();