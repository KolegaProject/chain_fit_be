import { createdResponse, successResponse } from "../../utils/response.js";
import paketMemberService from "./paket-member.service.js";

class PaketMembershipController {
    async createPaket(req, res){
        const body = req.body;
        
          for (const p of body) {
            if (!Array.isArray(p.benefit)) {
                throw new Error(
                    `Benefit must be an array. Example: ["Akses gym bebas","Foto bareng mas rusdi"]`
                );
            }
        }
        const userId = req.user.id;
        const gymId = parseInt(req.params.id);
        const paket = await paketMemberService.createPaket(body, userId, gymId);
        return createdResponse(res, paket);
    }   
    
    async index(req, res){
        const gymId = parseInt(req.params.id);
        const userId = req.user.id;
        const paket = await paketMemberService.getAllPaket(gymId, userId);
        return successResponse(res, paket) 
    }
    
    async show(req, res){
        const gymId = parseInt(req.params.id);
        const paketId = parseInt(req.params.paketId);
        const userId = req.user.id;
        const paket = await paketMemberService.getPaketById(gymId, paketId, userId)
        return successResponse(res, paket);
    }
    
    async update(req, res){
        const gymId = parseInt(req.params.id);
        const paketId = parseInt(req.params.paketId);
        const userId = req.user.id;
        const {name, price, durationDays, benefit} = req.body;
        const paket = await paketMemberService.updatePaket(gymId, paketId, userId, {name, price, durationDays, benefit})
        
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