import BaseError from "../../../base_classes/base-error.js";
import prisma from "../../../config/db.js";

class CashflowService {
  async create(userId, cashflowData) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw BaseError.notFound("User not found");

    return await prisma.gymCashflow.create({
      data: cashflowData,
    });
  }

  async update(userId, cashflowId, cashflowData) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw BaseError.notFound("User not found");

    const cashflow = await prisma.gymCashflow.findFirst({
      where: {
        id: cashflowId,
        gymId: cashflowData.gymId,
      },
    });

    const checkCashflowExists = await prisma.gymCashflow.findFirst({
      where: {
        id: cashflowId,
        gym: {
          id: cashflow.gymId,
          OR: [
            { ownerId: user.id },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
      },
    });

    if (!checkCashflowExists) throw BaseError.notFound("Cashflow not found");

    return await prisma.gymCashflow.update({
      where: {
        id: checkCashflowExists.id,
      },
      data: {
        ...cashflowData,
        updatedById: user.id,
      },
    });
  }

  async delete(userId, gymId, cashflowId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw BaseError.notFound("User not found");

    const cashflow = await prisma.gymCashflow.findFirst({
      where: {
        id: cashflowId,
        gymId: gymId
      },
    });

    const checkCashflowExists = await prisma.gymCashflow.findFirst({
      where: {
        id: cashflowId,
        gym: {
          id: cashflow.gymId,
          OR: [
            { ownerId: user.id },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
      },
    });

    if (!checkCashflowExists) throw BaseError.notFound("Cashflow not found");

    await prisma.gymCashflow.update({
      where: {
        id: cashflow.id,
      },
      data: {
        deletedById: user.id,
        isDeleted: true,
      },
    });
  }

  // search 
  async getAll(userId, gymId, search, limit, offset) {
    const take = limit ? Number(limit) : 10;
    const skip = offset ? Number(offset) : 0;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw BaseError.notFound("User not found");

    return prisma.gymCashflow.findMany({
      where: {
        isDeleted: false,
        gymId: gymId,
        gym: {
          OR: [
            {
              ownerId: user.id,
            },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },

        // search hanya jalan kalau search ada isinya
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(userId, gymId, cashflowId){
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw BaseError.notFound("User not found");

    return prisma.gymCashflow.findFirst({
      where: {
        isDeleted: false,
        id: cashflowId,
        gymId: gymId,
        gym: {
          OR: [
            {
              ownerId: user.id,
            },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
      },
    });
  }
}

export default new CashflowService();


// laporan pendapatan dan pengeluaran

// buat dashboard


