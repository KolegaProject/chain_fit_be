import membershipTransactionService from "./membership-transaction.service.js";
import { successResponse, createdResponse } from "../../utils/response.js";


class MembershipTransactionController {
  async createSnap(req, res) {
    const { packageId, gymId } = req.body;

    const userId = req.user.id;
    const snapData = await membershipTransactionService.createSnap(packageId,userId,gymId);
    return createdResponse(res, snapData);
  }

  async webhookHandler(req, res) {
    const data = req.body;
    console.log("Received Midtrans webhook:", data);
    const webhookResult = await membershipTransactionService.notificationSnap(data);
    return successResponse(res, webhookResult);
  }

}
export default new MembershipTransactionController();