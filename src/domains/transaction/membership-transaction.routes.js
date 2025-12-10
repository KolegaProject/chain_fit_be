import tryCatch from "../../utils/tryCatcher.js";
import membershipTransactionController from "./membership-transaction.controller.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { createSnapSchema } from "./membership-transaction.schema.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class MembershipTransactionRoutes extends BaseRoutes {
  routes() {
    this.router.post("/create-snap",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["MEMBER"]),
      validateCredentials(createSnapSchema),
      tryCatch(membershipTransactionController.createSnap)
    );

    this.router.post("/webhook-midtrans",
      tryCatch(membershipTransactionController.webhookHandler)
    );
  }
}

export default new MembershipTransactionRoutes().router;