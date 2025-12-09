const express = require('express');
const router = express.Router();
const equipmentController = require('./equipment.controller');
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class EquipmentRoutes extends BaseRoutes {
     routes() {
        this.router.get("/:id/gym-staff", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["PENJAGA"]),
            validateCredentials(gymSchema, "params"),
            tryCatch(gymPenjagaController.index),
        ]);
    }
}

// Middleware untuk cek role PENJAGA
const checkPenjagaRole = (req, res, next) => {
  if (req.user.role !== 'PENJAGA') {
    return res.status(403).json({
      success: false,
      message: 'Hanya penjaga yang dapat mengakses endpoint ini'
    });
  }
  next();
};

// GET - Semua orang bisa
router.get('/gym/:gymId', authMiddleware, equipmentController.getEquipmentsByGym.bind(equipmentController));

// GET - Semua orang bisa
router.get('/:equipmentId', authMiddleware, equipmentController.getEquipmentById.bind(equipmentController));

// CREATE - Hanya PENJAGA
router.post('/gym/:gymId', authMiddleware, checkPenjagaRole, equipmentController.createEquipment.bind(equipmentController));

// UPDATE - Hanya PENJAGA
router.put('/:equipmentId', authMiddleware, checkPenjagaRole, equipmentController.updateEquipment.bind(equipmentController));

// DELETE - Hanya PENJAGA
router.delete('/:equipmentId', authMiddleware, checkPenjagaRole, equipmentController.deleteEquipment.bind(equipmentController));

module.exports = router;