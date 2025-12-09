import prisma from "../../config/db.js";
import BaseError from "../../base_classes/base-error.js";

class EquipmentService {
  /**
   * Helper untuk mendapatkan Gym milik owner.
   * Jika owner belum punya gym, throw error.
   */
  async _getOwnerGym(ownerId) {
    const gym = await prisma.gym.findFirst({
      where: { ownerId: ownerId },
      select: { id: true }
    });

    if (!gym) {
      throw BaseError.notFound('Gym tidak ditemukan untuk Owner ini');
    }
    return gym;
  }

  // 1. Create Equipment
  async create(ownerId, data) {
    // Pastikan equipment dibuat di gym milik owner tersebut
    const gym = await this._getOwnerGym(ownerId);

    return await prisma.equipment.create({
      data: {
        gymId: gym.id,
        name: data.name,
        healthStatus: data.healthStatus,
        photo: data.photo
      }
    });
  }

  // 2. Get All Equipment (Pagination + Search + Security Check)
  async findAll(ownerId, query) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const gym = await this._getOwnerGym(ownerId);

    // Filter kondisi: Milik gym owner INI dan opsional search nama
    const whereCondition = {
      gymId: gym.id,
      ...(search && {
        name: { contains: search}
      })
    };

    const [equipments, total] = await Promise.all([
      prisma.equipment.findMany({
        where: whereCondition,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          healthStatus: true,
          photo: true,
          createdAt: true
        }
      }),
      prisma.equipment.count({ where: whereCondition })
    ]);

    return {
      data: equipments,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 3. Get One Equipment Detail
  async findOne(ownerId, equipmentId) {
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(equipmentId),
        gym: {
          ownerId: ownerId // SECURITY: Hanya bisa lihat jika gym-nya milik owner ini
        }
      },
      include: {
        histories: {
          take: 5, // Tampilkan 5 history terakhir (opsional)
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!equipment) {
      throw BaseError.notFound('Equipment tidak ditemukan atau bukan milik Anda');
    }

    return equipment;
  }

  // 4. Update Equipment
  async update(ownerId, equipmentId, data) {
    // Cek eksistensi dan kepemilikan dulu
    await this.findOne(ownerId, equipmentId);

    return await prisma.equipment.update({
      where: { id: parseInt(equipmentId) },
      data: data
    });
  }

  // 5. Delete Equipment
  async delete(ownerId, equipmentId) {
    // Cek eksistensi dan kepemilikan dulu
    await this.findOne(ownerId, equipmentId);

    return await prisma.equipment.delete({
      where: { id: parseInt(equipmentId) }
    });
  }
}

export default new EquipmentService();