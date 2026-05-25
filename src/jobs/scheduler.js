import cron from "node-cron";
import logger from "../utils/logger.js";
import { expiresMembership } from "./membership-expire.jobs.js";
import { remindMembershipExpiringSoon } from "./membership-expire-reminder.jobs.js";

export function startSchedulers() {
    // (async () => {
    //     const res = await expiresMembership();
    //     logger.info(`[JOB][MANUAL] expire-memberships: ${JSON.stringify(res)}`);
    // })();

    (async () => {
        try {
            const expireRes = await expiresMembership();
            logger.info(`[JOB][MANUAL] expire-memberships: ${JSON.stringify(expireRes)}`);

            const reminderRes = await remindMembershipExpiringSoon();
            logger.info(
                `[JOB][MANUAL] remind-membership-expiring-soon: ${JSON.stringify(reminderRes)}`
            );
        } catch (e) {
            logger.error("[JOB][MANUAL] scheduler error:", e);
        }
    })();
    cron.schedule(
        "5 0 * * *",
        async () => {
            try {
                const res = await expiresMembership();
                logger.info(`[JOB] expire-memberships: ${JSON.stringify(res)}`);
            } catch (e) {
                logger.error("[JOB] expire-memberships error:", e);
            }
        },
        { timezone: "Asia/Jakarta" }
    );

    cron.schedule(
        "0 8 * * *",
        async () => {
            try {
                const res = await remindMembershipExpiringSoon();
                logger.info(
                    `[JOB] remind-membership-expiring-soon: ${JSON.stringify(res)}`
                );
            } catch (e) {
                logger.error("[JOB] remind-membership-expiring-soon error:", e);
            }
        },
        { timezone: "Asia/Jakarta" }
    );
}