// crud
import BaseError from "../../base_classes/base-error.js";
import prisma from "../../config/db.js";
import { uploadFile } from "../../utils/saveImage.js";

class EquipmentService {
  // equipment
  // yang bisa dapat liat alat gym adalah member (dia detect dari membership dia), owner (dia punya gymnya), penjaga (dia staff gymnya)
  async getAllEquipments(gymId, userId, option) {
    const { search, healthStatus } = option;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw BaseError.notFound("User not found");
    }

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });
    if (!gym) {
      throw BaseError.notFound("Gym not found");
    }


    if (user.role === "OWNER" && gym.ownerId !== user.id) {
      throw BaseError.forbidden(
        "You are not authorized to access equipments of this gym"
      );
    }

    if (user.role === "PENJAGA" && user.gymId !== gymId) {
      throw BaseError.forbidden(
        "You are not authorized to access equipments of this gym"
      );
    }


    const where = {
      gymId,
    };

    // optional search (abaikan kalau kosong / hanya spasi)
    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (healthStatus) {
        where.healthStatus = healthStatus;
    }

    const equipments = await prisma.equipment.findMany({
      where,
    });

    return equipments;
  }

  // get equipment by id
  async getEquipmentById(equipmentId, gymId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw BaseError.notFound("User not found");

    const checkGym = await prisma.gym.findUnique({
      where: { id: gymId },
    });
    if (!checkGym) throw BaseError.notFound("Gym not found");

    if (user.role === "OWNER" && checkGym.ownerId !== userId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (user.role === "PENJAGA" && user.gymId !== gymId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        gymId,
      },
    });
    if (!equipment) throw BaseError.notFound("Equipment not found");
    return equipment;
  }

  async createEquipment(gymId, userId, equipmentData, imageUrl) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw BaseError.notFound("User not found");

    const checkGym = await prisma.gym.findUnique({
      where: { id: gymId },
    });
    if (!checkGym) throw BaseError.notFound("Gym not found");

    if (user.role === "OWNER" && checkGym.ownerId !== userId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (user.role === "PENJAGA" && user.gymId !== gymId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (imageUrl) {
      const gymUrlPath = `equipment-images/${gymId}`;
      const uploadedUrls = await uploadFile(gymUrlPath, imageUrl);
      if (!uploadedUrls || !uploadedUrls.length) {
        throw new Error("Failed to upload equipment image");
      }
      equipmentData.photo = uploadedUrls[0];
    }

    return prisma.equipment.create({
      data: {
        ...equipmentData,
        gymId,
      },
    });
  }

  async updateEquipment(equipmentId, gymId, userId, updateData, imageUrl) {
    console.log(updateData);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw BaseError.notFound("User not found");

    const checkGym = await prisma.gym.findUnique({
      where: { id: gymId },
    });
    if (!checkGym) throw BaseError.notFound("Gym not found");

    if (user.role === "OWNER" && checkGym.ownerId !== userId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (user.role === "PENJAGA" && user.gymId !== gymId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (imageUrl) {
      const gymUrlPath = `equipment-images/${checkGym.id}`;
      const uploadedUrls = await uploadFile(gymUrlPath, imageUrl);
      if (!uploadedUrls || !uploadedUrls.length) {
        throw new Error("Failed to upload equipment image");
      }
      updateData.photo = uploadedUrls[0];
    }

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!existingEquipment) throw BaseError.notFound("Equipment not found");

    // create history if health status changed
    if (
      updateData.healthStatus &&
      updateData.healthStatus !== existingEquipment.healthStatus
    ) {
      let type = "PERBAIKAN";
      if (updateData.healthStatus === "RUSAK") {
        type = "KERUSAKAN";
      }

      await prisma.equipmentHistory.create({
        data: {
          equipmentId: equipmentId,
          gymId: gymId,
          date: new Date(),
          type: type,
          description: `Health status changed from ${existingEquipment.healthStatus} to ${updateData.healthStatus}`,
          reportedById: userId,
        },
      });
    }
    const eq= await prisma.equipment.update({
      where: {
        id: equipmentId,
        gymId,
      },
      data: {
        ...updateData,
      },
    });
    return eq;
  }

  async deleteEquipment(equipmentId, gymId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw BaseError.notFound("User not found");
    const checkGym = await prisma.gym.findUnique({
      where: { id: gymId },
    });
    if (!checkGym) throw BaseError.notFound("Gym not found");

    if (user.role === "OWNER" && checkGym.ownerId !== userId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    if (user.role === "PENJAGA" && user.gymId !== gymId) {
      throw BaseError.forbidden(
        "You are not authorized to access this equipment"
      );
    }

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        gymId,
      },
    });
    if (!equipment) throw BaseError.notFound("Equipment not found");

    await prisma.equipment.deleteMany({
      where: {
        id: equipmentId,
        gymId: checkGym.id,
      },
    });
    return { message: "Equipment deleted successfully" };
  }

  async getEquipmentHistory(equipmentId, gymId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw BaseError.notFound("User not found");
    if (user.role === "OWNER") {
      const gym = await prisma.gym.findFirst({
        where: {
          id: gymId,
          ownerId: user.id,
        },
      });
      if (!gym) {
        throw BaseError.forbidden("You are not the owner of this gym");
      }
    }
    if (user.gymId !== gymId && user.role === "PENJAGA") {
      throw BaseError.forbidden(
        "You are not authorized to view equipment history in this gym"
      );
    }
    return prisma.equipmentHistory.findMany({
      where: {
        equipmentId,
        gymId,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async getEquipmentHistoryById(historyId, equipmentId, gymId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw BaseError.notFound("User not found");
    if (user.role === "OWNER") {
      const gym = await prisma.gym.findFirst({
        where: {
          id: gymId,
          ownerId: user.id,
        },
      });
      if (!gym) {
        throw BaseError.forbidden("You are not the owner of this gym");
      }
    }
    if (user.gymId !== gymId && user.role === "PENJAGA") {
      throw BaseError.forbidden(
        "You are not authorized to view equipment history in this gym"
      );
    }
    return prisma.equipmentHistory.findFirst({
      where: {
        id: historyId,
        equipmentId,
        gymId,
      },
    });
  }


  // search for member me/equipments
  async searchEquipmentsForMember(search, filter, userId) {
    const equipmentWhere = {
        healthStatus: "BAIK",
    };
    if (search) {
      equipmentWhere.name = {
        contains: search,
      };
    }

    if (filter) {
      equipmentWhere.gymId = filter;
    }
    const searchEq =  prisma.equipment.findMany({
      where: {
        ...equipmentWhere,
        gym: {
          memberships: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    if(!searchEq) throw BaseError.notFound("Equipment not found");
    return searchEq
  }
}

export default new EquipmentService();
