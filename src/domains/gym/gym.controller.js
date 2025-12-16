import { createdResponse, successResponse } from "../../utils/response.js";
import gymService from "./gym.service.js";

class GymController {

    async create(req, res){
        const {namaGym, maxCapacity, address, jamOperasional, lat, long, facility} = req.body;
        const maxCp = Number(maxCapacity);
        const latitude = Number(lat);
        const longitude = Number(long);
        const fac = JSON.parse(facility)
        if(!Array.isArray(fac)) throw new Error(`Facility must be a JSON array string. Example: ["Sauna","Loker"]`)
        const ownerId = req.user.id;
        const img = req.files.image;
        

        const gym = await gymService.createGym({namaGym, maxCp, address, ownerId, jamOperasional, latitude, longitude, facility, fac}, img)

        if(!gym) throw new Error("Failed to create gym");

        return createdResponse(res, gym);
    }

    async update(req, res){
            let maxCapacity, latitude, longitude, facility;

            const {name, maxCp, address, jamOperasional, lat, long, fac} = req.body;
            if(maxCapacity) maxCapacity = Number(maxCp);
            if(lat) latitude = Number(lat);
            if(long) longitude = Number(long);
            if(fac) facility = JSON.parse(fac)
            const ownerId = req.user.id;
            const id = Number(req.params.id);

            const gym = await gymService.updateGym({name, maxCapacity, address, jamOperasional, latitude, longitude, facility}, ownerId, id);

            if(!gym) throw new Error("Failed to update gym");

            return successResponse(res, gym);
    }
    
    async delete(req, res){
        const {id} = req.params;
        const userId = req.user.id;
        const gym = await gymService.deleteGym(userId, id);
        if(!gym) throw new Error("Failed to delete gym");
        return successResponse(res, gym);
    }

    async index(req, res){
        const search = req.query.search;
        const gym = await gymService.getAllGym(search);
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
            throw new Error("Failed to get list gym");
        }
        
        return successResponse(res, response);
    }
    
    async showGymNotVerified(req, res){
        const id = parseInt(req.params.id);
        const response = await gymService.getListGymNotVerifedById(id);
        
        if (!response) {
            throw new Error("Failed to get list gym");
        }
        return successResponse(res, response);
    }
    
    async verified(req, res){
        const id = parseInt(req.params.id);
        const response = await gymService.verifedGym(id);
        
        if (!response) {
            throw new Error("Failed to verified gym");
        }

        return successResponse(res, response);
    }

    async rejected(req, res){
        const id = Number(req.params.id);
        const response = await gymService.rejectedGym(id);

        if(!response) throw new Error("Failed to rejected gym");
        return successResponse(res, response)
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