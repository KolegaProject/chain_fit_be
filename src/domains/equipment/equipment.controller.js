import equipmentService from "./equipment.service.js";
import { createdResponse, successResponse } from "../../utils/response.js";

class EquipmentController {
  
  async create(req, res) {
    const result = await equipmentService.create(req.user.id, req.body);
    return createdResponse(res, result);
  }

  async findAll(req, res) {
    const result = await equipmentService.findAll(req.user.id, req.query);
    return successResponse(res, result);
  }

  async findOne(req, res) {
    const { id } = req.params;
    const result = await equipmentService.findOne(req.user.id, id);
    return successResponse(res, result);
  }

  async update(req, res) {
    const { id } = req.params;
    const result = await equipmentService.update(req.user.id, id, req.body);
    return successResponse(res, result);
  }

  async delete(req, res) {
    const { id } = req.params;
    await equipmentService.delete(req.user.id, id);
    return successResponse(res, 'Equipment berhasil dihapus');
  }
}

export default new EquipmentController();