import { createdResponse, successResponse } from "../../utils/response.js";
import paketMemberService from "./paket-member.service.js";

class PaketMembershipController {
    async createPaket(req, res){
        const {name, price, durationDays} = req.body;
        const userId = req.user.id;
        const gymId = parseInt(req.params.id);
        const paket = await paketMemberService.createPaket({name, price, durationDays}, userId, gymId);
        return createdResponse(res, paket);
    }   
    
    async index(req, res){
        const gymId = parseInt(req.params.id);
        const paket = await paketMemberService.getAllPaket(gymId);
        return successResponse(res, paket) 
    }
    
    async show(req, res){
        const gymId = parseInt(req.params.id);
        const paketId = parseInt(req.params.paketId);
        const paket = await paketMemberService.getPaketById(gymId, paketId)
        return successResponse(res, paket);
    }
    
    async update(req, res){
        const gymId = parseInt(req.params.id);
        const paketId = parseInt(req.params.paketId);
        const userId = req.user.id;
        const {name, price, durationDays} = req.body;
        const paket = await paketMemberService.updatePaket(gymId, paketId, userId, {name, price, durationDays})
        
        return successResponse(res, paket)
    }
    
    async delete(req, res){
        const gymId = parseInt(req.params.id);
        const paketId = parseInt(req.params.paketId);
        const userId = req.user.id;
        const paket = await paketMemberService.deletePaket(gymId, paketId, userId);

        return successResponse(res, paket);

    }
}

export default new PaketMembershipController();