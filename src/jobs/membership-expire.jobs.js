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
      const res = await tx.membership.updateMany({
        where: { status: "AKTIF", endDate: { lt: now } },
        data: { status: "TIDAK" },
      });

      return { skipped: false, updated: res.count };
    } finally {
      await tx.$queryRaw`SELECT RELEASE_LOCK('job_expire_memberships')`;
    }
  });
}