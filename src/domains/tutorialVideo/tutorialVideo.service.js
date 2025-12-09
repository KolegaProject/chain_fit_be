import prisma from "../../config/db.js";
import BaseError from "../../base_classes/base-error.js";

class TutorialVideoService {
  
  // Helper: Dapatkan Gym ID milik Owner
  async _getAuthorizedGymIds(user) {
    if (user.role === 'OWNER') {
      const gyms = await prisma.gym.findMany({
        where: { ownerId: user.id },
        select: { id: true }
      });
      
      if (gyms.length === 0) {
        throw BaseError.notFound('Anda tidak memiliki gym');
      }

      return gyms.map(g => g.id);
    }
    
    else if (user.role === 'MEMBER') {
      const memberships = await prisma.membership.findMany({
        where: {
          userId: user.id,
          status: 'AKTIF',
          endDate: { gte: new Date() }
        },
        select: { gymId: true }
      });

      if (memberships.length === 0) {
        throw BaseError.notFound('Anda tidak memiliki membership aktif di gym manapun');
      }

      return memberships.map(m => m.gymId);
    }
    
    else {
      throw BaseError.forbidden('Role tidak diizinkan');
    }
  }

  // 1. Create Video
  async create(ownerId, data) {
    const targetEquipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
      include: { gym: true }
    });

    if (!targetEquipment) {
      throw BaseError.notFound('Equipment tidak ditemukan');
    }

    if (targetEquipment.gym.ownerId !== ownerId) {
      throw BaseError.forbidden('Anda tidak memiliki akses ke equipment gym ini');
    }

    return await prisma.tutorialVideo.create({
      data: {
        gymId: targetEquipment.gymId,
        equipmentId: data.equipmentId,
        title: data.title,
        url: data.url,
        description: data.description
      }
    });
  }

  // 2. Get All Videos (Bisa filter by specific Equipment)
  async findAll(user, query) {
    const { page = 1, limit = 10, search, equipmentId } = query;
    const skip = (page - 1) * limit;

    const authorizedGymIds = await this._getAuthorizedGymIds(user);

    const whereCondition = {
      gymId: { in: authorizedGymIds },
      ...(equipmentId && { equipmentId: parseInt(equipmentId) }),
      ...(search && {
        title: { contains: search }
      })
    };

    const [videos, total] = await Promise.all([
      prisma.tutorialVideo.findMany({
        where: whereCondition,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: {
            select: { id: true, name: true, photo: true }
          },
          gym: {
            select: { id: true, name: true } 
          }
        }
      }),
      prisma.tutorialVideo.count({ where: whereCondition })
    ]);

    return {
      data: videos,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 3. Get One Video
  async findOne(user, videoId) {
    const authorizedGymIds = await this._getAuthorizedGymIds(user);

    const video = await prisma.tutorialVideo.findFirst({
      where: {
        id: parseInt(videoId),
        gymId: { in: authorizedGymIds }
      },
      include: {
        equipment: {
          select: { id: true, name: true }
        },
        gym: {
          select: { name: true }
        }
      }
    });

    if (!video) {
      throw BaseError.notFound('Video tidak ditemukan atau Anda tidak memiliki akses membership di gym ini');
    }

    return video;
  }

  // 4. Update Video
  async update(ownerId, videoId, data) {
    const video = await prisma.tutorialVideo.findFirst({
      where: { id: parseInt(videoId) },
      include: { gym: true }
    });

    if (!video) throw BaseError.notFound('Video tidak ditemukan');
    
    if (video.gym.ownerId !== ownerId) {
      throw BaseError.forbidden('Anda tidak berhak mengedit video ini');
    }

    if (data.equipmentId && data.equipmentId !== video.equipmentId) {
        const targetEquipment = await prisma.equipment.findUnique({
            where: { id: data.equipmentId },
            include: { gym: true }
        });

        if (!targetEquipment || targetEquipment.gym.ownerId !== ownerId) {
            throw BaseError.unauthorized('Equipment tujuan tidak valid atau bukan milik Anda');
        }
        
        if (targetEquipment.gymId !== video.gymId) {
             throw BaseError.forbidden('Equipment harus berada di gym yang sama');
        }
    }

    return await prisma.tutorialVideo.update({
      where: { id: parseInt(videoId) },
      data: data
    });
  }

  // 5. Delete Video
  async delete(ownerId, videoId) {
    const video = await prisma.tutorialVideo.findFirst({
      where: { id: parseInt(videoId) },
      include: { gym: true }
    });

    if (!video) throw  BaseError.notFound('Video tidak ditemukan');

    if (video.gym.ownerId !== ownerId) {
      throw BaseError.forbidden('Anda tidak berhak menghapus video ini');
    }

    return await prisma.tutorialVideo.delete({
      where: { id: parseInt(videoId) }
    });
  }
}

export default new TutorialVideoService();