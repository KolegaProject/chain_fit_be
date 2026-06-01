import prisma from "../config/db.js";
import logger from "../utils/logger.js";
import NotifyService from "../domains/notify/notify.service.js";

export async function remindMembershipExpiringSoon() {
  const now = new Date();

  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  return prisma.$transaction(async (tx) => {
    const lockRows =
      await tx.$queryRaw`SELECT GET_LOCK('job_remind_membership_expiring_soon', 0) AS got`;

    const gotVal = lockRows?.[0]?.got;
    const got = Number(gotVal) === 1;

    if (!got) {
      return {
        skipped: true,
        reason: "locked_by_another_runner",
      };
    }

    try {
      const memberships = await tx.membership.findMany({
        where: {
          status: "AKTIF",
          endDate: {
            gt: now,
            lte: threeDaysLater,
          },
        },
        select: {
          id: true,
          userId: true,
          gymId: true,
          endDate: true,
          gym: {
            select: {
              name: true,
            },
          },
          package: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        skipped: false,
        found: memberships.length,
        memberships,
      };
    } finally {
      await tx.$queryRaw`SELECT RELEASE_LOCK('job_remind_membership_expiring_soon')`;
    }
  }).then(async (res) => {
    if (res.skipped || !res.memberships) {
      return res;
    }

    let sent = 0;
    let failed = 0;

    for (const membership of res.memberships) {
      try {
        await NotifyService.notifyUser(
          membership.userId,
          {
            title: "Membership Akan Berakhir",
            message: `Membership ${membership.gym?.name ?? "gym"} kamu akan berakhir kurang dari 3 hari lagi.`,
            type: "membership_expiring_soon",
            data: {
              membershipId: membership.id,
              gymId: membership.gymId,
              packageName: membership.package?.name ?? "",
              endDate: membership.endDate,
            },
          },
          {
            channels: ["fcm"],
          }
        );

        sent++;
      } catch (error) {
        failed++;

        logger.error(
          `[JOB] failed to send membership reminder for membership ${membership.id}:`,
          error
        );
      }
    }

    return {
      skipped: false,
      found: res.found,
      sent,
      failed,
    };
  });
}