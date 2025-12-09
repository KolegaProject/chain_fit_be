const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EquipmentService {
  async createEquipment(gymId, data) {
    try {
      const equipment = await prisma.equipment.create({
        data: {
          gymId,
          ...data
        }
      });
      return equipment;
    } catch (error) {
      throw error;
    }
  }

  async getEquipmentByGymId(gymId) {
    try {
      const equipments = await prisma.equipment.findMany({
        where: { gymId },
        include: {
          histories: {
            orderBy: { createdAt: 'desc' }
          },
          tutorialVideos: true
        }
      });
      return equipments;
    } catch (error) {
      throw error;
    }
  }

  async getEquipmentById(equipmentId) {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        include: {
          gym: true,
          histories: {
            orderBy: { createdAt: 'desc' }
          },
          tutorialVideos: true
        }
      });
      return equipment;
    } catch (error) {
      throw error;
    }
  }

  async updateEquipment(equipmentId, data) {
    try {
      const equipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data
      });
      return equipment;
    } catch (error) {
      throw error;
    }
  }

  async deleteEquipment(equipmentId) {
    try {
      const equipment = await prisma.equipment.delete({
        where: { id: equipmentId }
      });
      return equipment;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EquipmentService();