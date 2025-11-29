import { createdResponse, successResponse } from "../../../utils/response.js";
import gymPenjagaService from "./gym-penjaga.service.js";

class GymPenjagaController {

    async createPenjaga(req, res){
        const {username, name, email, password} = req.body;
        const ownerId = req.user.id;
        const penjaga = await gymPenjagaService.createPenjagaGym({username, name, email, password}, ownerId);
        return createdResponse(res, penjaga);
    }

    async deletePenjaga(req, res){
        const {userId} = req.body;
        const ownerId = req.user.id;
        const penjaga = await gymPenjagaService.deletePenjagaGym(userId, ownerId);
        return successResponse(res, penjaga);
    }

    async index(req, res){
        const ownerId = req.user.id;
        
        // gym id
        const {id} = req.body;
        
        const penjaga = await gymPenjagaService.getAllPenjaga({ownerId, id});
        return successResponse(res, penjaga);
    }

    async show(req, res){
        const {id} = req.body;
        const userId = parseInt(req.params.userId);
        const ownerId = req.user.id;
        const penjaga = await gymPenjagaService.getPenjagaById({userId, id, ownerId})
        return successResponse(res, penjaga);
    }
    
    async profile(req, res){
        const userId = req.user.id;
        const penjaga = await gymPenjagaService.getPenjagaProfile(userId);
        return successResponse(res, penjaga);
    }

    async update(req, res){
        const {name, email, password} = req.body;
        let imageProfile = null;
        if(req.files){
            imageProfile = req.files.image;

        }
        
        const userId = parseInt(req.params.userId);
        const ownerId = req.user.id;
        const penjaga = await gymPenjagaService.updatePenjaga(userId, {name, email, password}, imageProfile, ownerId);

        if(!penjaga) throw new Error("Failed to update profile penjaga");

        return successResponse(res, penjaga)
    }

    async updateStaffPassword(req, res){
        const { old_password, new_password, confirm_password } = req.body;
        if(new_password !== confirm_password){
            throw Error("Failed to update staff password")
        }
        const id = parseInt(req.params.userId);
        const ownerId = req.user.id;
        
        const message = await gymPenjagaService.updatePasswordProfile({ownerId, id}, old_password, new_password);

        if (!message) {
            throw Error("Failed to update staff password");
        }

        return successResponse(res, message);
    }
}

export default new GymPenjagaController();