import prisma from "../config/db.js"

export async function expiresMembership(){
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const lockRows =
      await tx.$queryRaw`SELECT GET_LOCK('job_expire_memberships', 0) AS got`;
    const gotVal = lockRows?.[0]?.got;

    const got = Number(gotVal) === 1;
    if (!got) return { skipped: true, reason: "locked_by_another_runner" };

    try {
      // 1. Matikan paket yang sudah kadaluarsa
      const resExpire = await tx.membership.updateMany({
        where: { status: "AKTIF", endDate: { lt: now } },
        data: { status: "TIDAK" },
      });

      // 2. Aktifkan paket antrean yang tanggal mulainya sudah tiba
      const resActivate = await tx.membership.updateMany({
        where: { status: "TIDAK", startDate: { lte: now }, endDate: { gt: now } },
        data: { status: "AKTIF" },
      });

      return { skipped: false, expiredCount: resExpire.count, activatedCount: resActivate.count };
    } finally {
      await tx.$queryRaw`SELECT RELEASE_LOCK('job_expire_memberships')`;
    }
  });
}