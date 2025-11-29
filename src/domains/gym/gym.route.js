import gymController from "./gym.controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { createGymSchema, getGymSchema, gymSchema } from "./gym.schema.js";
import { registerSchema } from "../auth/auth-schema.js";

class GymRoutes extends BaseRoutes {
  routes() {
    // ========== Verified gym (ADMIN) ==========
    this.router.get("/verified-gym", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["ADMIN"]),
      tryCatch(gymController.gymNotVerified),
    ]);

    this.router.get("/verified-gym/:id", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["ADMIN"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.showGymNotVerified),
    ]);

    this.router.post("/verified-gym/:id/verify", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["ADMIN"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.verified),
    ]);

    // ========== Manage penjaga (OWNER) ==========
    // this.router.post("/penjaga", [
    //   authTokenMiddleware.authenticate,
    //   authTokenMiddleware.authorizeUser(["OWNER"]),
    //   validateCredentials(registerSchema),
    //   tryCatch(gymController.createPenjaga),
    // ]);

    // this.router.delete("/penjaga", [
    //   authTokenMiddleware.authenticate,
    //   authTokenMiddleware.authorizeUser(["OWNER"]),
    //   validateCredentials(getGymSchema),
    //   tryCatch(gymController.deletePenjaga),
    // ]);

    // this.router.get("/penjaga", [
    //   authTokenMiddleware.authenticate,
    //   authTokenMiddleware.authorizeUser(["OWNER"]),
    //   validateCredentials(gymSchema),
    //   tryCatch(gymController.indexPenjaga),
      
    // ])

    // this.router.get("/penjaga/:userId", [
    //   authTokenMiddleware.authenticate,
    //   authTokenMiddleware.authorizeUser(["OWNER"]),
    //   validateCredentials(gymSchema),
    //   validateCredentials(getGymSchema, "params"),
    //   tryCatch(gymController.showPenjaga),
    // ]);




    // ========== Gym milik owner ==========
    this.router.get("/owner", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      tryCatch(gymController.gymOwner),
    ]);

    // ========== Gym list & create ==========
    this.router.post("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(createGymSchema),
      tryCatch(gymController.create),
    ]);

    this.router.get("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "MEMBER"]),
      tryCatch(gymController.index),
    ]);

    // ========== Update gym (saran) ==========
    // this.router.patch("/:id", [
    //   authTokenMiddleware.authenticate,
    //   authTokenMiddleware.authorizeUser(["OWNER"]),
    //   validateCredentials(gymSchema, "params"),
    //   // tambahin schema body updateGymSchema kalau udah ada
    //   tryCatch(gymController.update),
    // ]);

    // ========== Detail & delete by id  ==========
    this.router.get("/:id", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "MEMBER"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.show),
    ]);
    this.router

    this.router.delete("/:id", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.delete),
    ]);
  }
}

export default new GymRoutes().router;
