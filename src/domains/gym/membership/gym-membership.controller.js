import { createdResponse, successResponse } from "../../../utils/response.js";
import gymMembershipService from "./gym-membership.service.js";


class GymMembershipController {

    async getMembership(req, res){
        const userId = req.user.id;
        const membership = await gymMembershipService.getAllMemberships(userId);
        return successResponse(res, membership);
    }
}

export default new GymMembershipController();