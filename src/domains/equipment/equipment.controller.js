import { createdResponse, successResponse } from "../../utils/response.js";
import equipmentService from "./equipment.service.js";

class EquipmentController {

    async create(req, res){
        const gymId =  Number(req.params.id);
        const userId = req.user.id;
        const imageUrl = req.files?.image;
        const {name, videoURL, jum, description} = req.body;
        const jumlah = Number(jum);
        const equipment = await equipmentService.createEquipment(gymId, userId, {name, videoURL, jumlah, description}, imageUrl)

        if(!equipment) throw new Error("Failed to create equipment");
        return successResponse(res, equipment);
    }

    async update(req, res){
        const equipId = Number(req.params.equipId);
        const {name, healthStatus, videoURL, jumlah: jmlRow, description} = req.body;
        const gymId = Number(req.params.id);
        const userId = req.user.id;
        const imageUrl = req.files?.image;
        const equipment = await equipmentService.updateEquipment(equipId, gymId, userId, {name, healthStatus, videoURL,  jumlah: jmlRow == null? undefined: Number(jmlRow), description}, imageUrl);
        if(!equipment) throw new Error("Failed to update equipment");
        return successResponse(res, equipment);
    }

    async delete(req, res){
        const equipId = Number(req.params.equipId);
        const gymId = Number(req.params.id);
        const userId = req.user.id;
        const equipment = await equipmentService.deleteEquipment(equipId, gymId, userId);
        if(!equipment) throw new Error("Failed to delete equipment");
        return successResponse(res, equipment);
    }

    async index(req, res){
        const gymId = Number(req.params.id);
        const userId = req.user.id;
        const search = req.query.search;
        const healthStatus = req.query.healthStatus;
        const equipment = await equipmentService.getAllEquipments(gymId, userId, {search, healthStatus});
        return successResponse(res, equipment);
    }
    
    async show(req, res){
        const userId = req.user.id;
        const gymId = Number(req.params.id);
        const equipId = Number(req.params.equipId);
        const equipment = await equipmentService.getEquipmentById(equipId, gymId, userId);
        return successResponse(res, equipment);
    }

    async getAllHistoryEquipment(req, res){
        const equipId = Number(req.params.equipId);
        const gymId = Number(req.params.id);
        const userId = req.user.id;
        const history = await equipmentService.getHistoryEquipment(equipId, gymId, userId);
        return successResponse(res, history);
    }

    async getHistoryEquipmentById(req, res){
        const equipId = Number(req.params.equipId);
        const historyId = Number(req.params.historyId);
        const gymId = Number(req.params.id);
        const userId = req.user.id;
        const history = await equipmentService.getEquipmentHistoryById(historyId, equipId, gymId, userId);
        return successResponse(res, history);
    }


    async getEquipmentUser(req, res){
        const userId = req.user.id;
        const search = req.query.search;
        const filter = Number(req.query.filter);
        const equipment = await equipmentService.searchEquipmentsForMember(search, filter, userId);
        return successResponse(res, equipment);
    }

}

export default new EquipmentController();

