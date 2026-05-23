import BaseError from "../../../base_classes/base-error.js";
import prisma from "../../../config/db.js";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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

  async getTrendOverview(userId, gymId, year) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw BaseError.notFound("User not found");

    const gym = await prisma.gym.findFirst({
      where: {
        id: gymId,
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
      select: {
        id: true,
      },
    });

    if (!gym) throw BaseError.notFound("Gym not found");

    const targetYear = Number.isInteger(year) ? year : new Date().getUTCFullYear();
    const startDate = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear + 1, 0, 1, 0, 0, 0, 0));

    const cashflows = await prisma.gymCashflow.findMany({
      where: {
        gymId,
        isDeleted: false,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        transactionType: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const incomeSeries = MONTH_LABELS.map((month, index) => ({
      month,
      monthNumber: index + 1,
      total: 0,
    }));

    const expenseSeries = MONTH_LABELS.map((month, index) => ({
      month,
      monthNumber: index + 1,
      total: 0,
    }));

    for (const item of cashflows) {
      const monthIndex = new Date(item.date).getUTCMonth();
      const amount = Number(item.amount);

      if (item.transactionType === "PENDAPATAN") {
        incomeSeries[monthIndex].total += amount;
      }

      if (item.transactionType === "PENGELUARAN") {
        expenseSeries[monthIndex].total += amount;
      }
    }

    const totalIncome = incomeSeries.reduce((sum, item) => sum + item.total, 0);
    const totalExpense = expenseSeries.reduce((sum, item) => sum + item.total, 0);

    return {
      year: targetYear,
      gymId,
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      incomeTrend: incomeSeries,
      expenseTrend: expenseSeries,
    };
  }
}

export default new CashflowService();


// laporan pendapatan dan pengeluaran

// buat dashboard


