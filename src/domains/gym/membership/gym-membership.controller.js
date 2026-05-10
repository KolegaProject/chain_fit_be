import { createdResponse, successResponse } from "../../../utils/response.js";
import gymMembershipService from "./gym-membership.service.js";


class GymMembershipController {

    async getMembership(req, res){
        const userId = req.user.id;
        const membership = await gymMembershipService.getAllMemberships(userId);
        return successResponse(res, membership);
    }
    
    async index(req, res){
        const gymId = Number(req.params.id);
        const membership = await gymMembershipService.getAllUserMembership(gymId);
        return successResponse(res, membership);
    }

    async show(req, res){
        const gymId = Number(req.params.id);
        const memberId = Number(req.params.membershipId);
        const membership = await gymMembershipService.getUserMembershipById(gymId, memberId);
        return successResponse(res, membership);
    }
    
    
    async create(req, res){
        const {name, email, paketId} = req.body;
        const gymId = Number(req.params.id);

        const membership = await gymMembershipService.createMembership({name, email}, gymId, paketId);
        return createdResponse(res, membership);
    }


    async update(req, res){
        const paketId = req.body.paketId;
        const membershipId = Number(req.params.membershipId);
        const membership = await gymMembershipService.updateMembership(membershipId, paketId);
        return successResponse(res, membership);
    }
    
    async delete(req, res){
        const membershipId = Number(req.params.membershipId);
        const membership = await gymMembershipService.removeMembership(membershipId)

        return successResponse(res, membership);

    }
}

export default new GymMembershipController();