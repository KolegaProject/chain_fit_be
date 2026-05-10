import cron from "node-cron";
import logger from "../utils/logger.js";
import { expiresMembership } from "./membership-expire.jobs.js";

export function startSchedulers() {
    (async () => {
    const res = await expiresMembership();
        logger.info(`[JOB][MANUAL] expire-memberships: ${JSON.stringify(res)}`);
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
}