const equipmentService = require("./equipment.service");
import { createdResponse, successResponse } from "../../utils/response.js";
const { createEquipmentSchema, updateEquipmentSchema} = require("./equipment.schema");

class EquipmentController {
  async createEquipment(req, res) {
    try {
      const { error, value } = createEquipmentSchema.validate(req.body);
      if (error) {
        throw new Error(error.details[0].message);
      }

      const { gymId } = req.params;
      const equipment = await equipmentService.createEquipment(
        parseInt(gymId),
        value
      );

      createdResponse(res, equipment);
    } catch (error) {
      throw new Error("Gagal menambahkan alat: " + error.message);
    }
  }

  async getEquipmentsByGym(req, res) {
    try {
      const { gymId } = req.params;
      const equipments = await equipmentService.getEquipmentByGymId(
        parseInt(gymId)
      );

      successResponse(res, equipments);
    } catch (error) {
      throw new Error("Gagal mengambil data alat: " + error.message);
    }
  }

  async getEquipmentById(req, res) {
    try {
      const { equipmentId } = req.params;
      const equipment = await equipmentService.getEquipmentById(
        parseInt(equipmentId)
      );

      if (!equipment) {
        throw new Error("Alat tidak ditemukan");
      }

      successResponse(res, equipment);
    } catch (error) {
      throw new Error("Gagal mengambil detail alat: " + error.message);
    }
  }

  async updateEquipment(req, res) {
    try {
      const { error, value } = updateEquipmentSchema.validate(req.body);
      if (error) {
        throw new Error("Validasi gagal: " + error.details[0].message);
      }

      const { equipmentId } = req.params;
      const equipment = await equipmentService.updateEquipment(
        parseInt(equipmentId),
        value
      );

      successResponse(res, equipment);
    } catch (error) {
      throw new Error("Gagal memperbarui alat: " + error.message);
    }
  }

  async deleteEquipment(req, res) {
    try {
      const { equipmentId } = req.params;
      await equipmentService.deleteEquipment(parseInt(equipmentId));

      successResponse(res, { message: "Alat berhasil dihapus" });
    } catch (error) {
      throw new Error("Gagal menghapus alat: " + error.message);
    }
  }
}

module.exports = new EquipmentController();