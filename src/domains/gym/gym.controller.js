import { createdResponse, successResponse } from "../../utils/response.js";
import gymService from "./gym.service.js";

class GymController {

    async create(req, res){
        const {namaGym, maxCapacity, address} = req.body;
        const maxCap = parseInt(maxCapacity, 10);
        const ownerId = req.user.id;
        const img = req.files.image;
        console.log(img);
        

        const gym = await gymService.createGym({namaGym, maxCap, address, ownerId}, img)

        if(!gym) throw new Error("Failed to create gym");

        return successResponse(res, gym);
    }

    async update(req, res){

    }
    
    async delete(req, res){
        const {id} = req.params;
        const userId = req.user.id;
        const gym = await gymService.deleteGym(userId, id);
        if(!gym) throw new Error("Failed to delete gym");
        return successResponse(res, gym);
    }

    async index(req, res){
        const gym = await gymService.getAllGym();
        return successResponse(res, gym);
    }
    
    async show(req, res){
        const id = parseInt(req.params.id);
        const gym = await gymService.getGymById(id);
        return successResponse(res, gym);
    }


    async gymNotVerified(req, res) {

        const response = await gymService.getListGymNotVerifed();
        
        if (!response) {
            throw Error("Failed to get list gym");
        }
        
        return successResponse(res, response);
    }
    
    async showGymNotVerified(req, res){
        const id = parseInt(req.params.id);
        const response = await gymService.getListGymNotVerifedById(id);
        
        if (!response) {
            throw Error("Failed to get list gym");
        }
        return successResponse(res, response);
    }
    
    async verified(req, res){
        const id = parseInt(req.params.id);
        const response = await gymService.verifedGym(id);
        
        if (!response) {
            throw Error("Failed to verified gym");
        }

        return successResponse(res, response);
    }

    async gymOwner(req, res){
        const ownerId = req.user.id;
        
        const gym = await gymService.getGymByOwnerId(ownerId);
        return successResponse(res, gym);
    }


    async createPenjaga(req, res){
        const {username, name, email, password} = req.body;
        const ownerId = req.user.id;
        const penjaga = await gymService.createPenjagaGym({username, name, email, password}, ownerId);
        return createdResponse(res, penjaga);
    }

    async deletePenjaga(req, res){
        const {userId} = req.body;
        const ownerId = req.user.id;
        const penjaga = await gymService.deletePenjagaGym(userId, ownerId);
        return successResponse(res, penjaga);
    }

    async indexPenjaga(req, res){
        const ownerId = req.user.id;
        // gym id
        const {id} = req.body;
        const penjaga = await gymService.getAllPenjaga({ownerId, id});
        return successResponse(res, penjaga);
    }

    async showPenjaga(req, res){
        const {id} = req.body;
        const userId = parseInt(req.params.userId);
        const ownerId = req.user.id;
        const penjaga = await gymService.getPenjagaById({userId, id, ownerId})
        return successResponse(res, penjaga);
    }

}

export default new GymController();