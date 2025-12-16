import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { changePasswordSchema } from "../auth/auth-schema.js";

// GYM DOMAIN
import gymController from "./gym.controller.js";
import { createGymSchema, getGymSchema, gymSchema, queryGymSchema, updateGymSchema } from "./gym.schema.js";

// PAKET MEMBER DOMAIN
import {
  createPaketGymSchema,
  paketGymSchema,
  updatePaketGymSchema,
} from "../membership_paket/paket-member.schema.js";
import paketMemberController from "../membership_paket/paket-member.controller.js";

// PENJAGA GYM DOMAIN
import gymPenjagaController from "./penjaga/gym-penjaga.controller.js";
import {
  createPenjagaSchema,
  getPenjagaSchema,
  updatePenjagaSchema,
} from "./penjaga/gym-penjaga.schema.js";

// EQUIPMENT DOMAIN
import { createEquipmentSchema, deleteEquipmentSchema,  getHistoryEquipmentByIdSchema, showEquipmentSchema, updateEquipmentSchema } from "../equipment/equipment.schema.js";
import equipmentController from "../equipment/equipment.controller.js";
import gymMembershipController from "./membership/gym-membership.controller.js";

class GymRoutes extends BaseRoutes {
  routes() {

    // membership
    this.router.get("/me/memberships", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["MEMBER"]),
      tryCatch(gymMembershipController.getMembership),
    ]);

    // profile penjaga
    this.router.get("/gym-staff/me", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["PENJAGA"]),
      tryCatch(gymPenjagaController.profile),
    ]);

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

    this.router.post("/verified-gym/:id/rejected", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["ADMIN"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.rejected)
    ]);

    // staff gym
    this.router.post("/:id/gym-staff", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(createPenjagaSchema),
      tryCatch(gymPenjagaController.createPenjaga),
    ]);



    this.router.get("/:id/gym-staff", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymPenjagaController.index),
    ]);

    this.router.get("/:id/gym-staff/:userId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(getPenjagaSchema, "params"),
      tryCatch(gymPenjagaController.show),
    ]);

    this.router.delete("/:id/gym-staff/:userId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(getPenjagaSchema, "params"),
      tryCatch(gymPenjagaController.deletePenjaga),
    ]);

    this.router.put("/:id/gym-staff/:userId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(getPenjagaSchema, "params"),
      validateCredentials(updatePenjagaSchema),
      tryCatch(gymPenjagaController.update),
    ]);

    this.router.patch("/:id/gym-staff/:userId/update-password", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(getPenjagaSchema, "params"),
      validateCredentials(changePasswordSchema),
      tryCatch(gymPenjagaController.updateStaffPassword),
    ]);

    // ========== Gym milik owner ==========
    this.router.get("/owner", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      tryCatch(gymController.gymOwner),
    ]);

    // equipment API for gym owner and penjaga
    this.router.post(
      "/:id/equipment",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(createEquipmentSchema),
      tryCatch(equipmentController.create)
    );

    this.router.put(
      "/:id/equipment/:equipId",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(deleteEquipmentSchema, "params"),
      validateCredentials(updateEquipmentSchema),
      tryCatch(equipmentController.update)
    );

    this.router.delete(
      "/:id/equipment/:equipId",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(deleteEquipmentSchema, "params"),
      tryCatch(equipmentController.delete)
    );

    this.router.get(
      "/:id/equipment",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(showEquipmentSchema, "query"),
      tryCatch(equipmentController.index)
    );
    
    this.router.get(
      "/:id/equipment/:equipId",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(deleteEquipmentSchema, "params"),
      tryCatch(equipmentController.show)
    );

    this.router.get(
      "/:id/equipment/:equipId/history",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(deleteEquipmentSchema, "params"),
      tryCatch(equipmentController.getAllHistoryEquipment)
    );

    this.router.get(
      "/:id/equipment/:equipId/history/:historyId",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(getHistoryEquipmentByIdSchema, "params"),
      tryCatch(equipmentController.getHistoryEquipmentById)
    );

    // ========== Gym list & create ==========
    this.router.post("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(createGymSchema),
      tryCatch(gymController.create),
    ]);
    this.router.put("/:id", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(updateGymSchema),
      tryCatch(gymController.update)
    ])

    this.router.get("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "MEMBER", "PENJAGA"]),
      validateCredentials(queryGymSchema, "query"),
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
      authTokenMiddleware.authorizeUser(["OWNER", "MEMBER", "PENJAGA"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.show),
    ]);

    this.router.delete("/:id", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymController.delete),
    ]);




    // paket member API
    this.router.post("/:id/paket-member", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(createPaketGymSchema),
      tryCatch(paketMemberController.createPaket),
    ]);

    this.router.get("/:id/paket-member", [
      authTokenMiddleware.authenticate,
      validateCredentials(gymSchema, "params"),
      tryCatch(paketMemberController.index),
    ]);
    this.router.get("/:id/paket-member/:paketId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(paketGymSchema, "params"),
      tryCatch(paketMemberController.show),
    ]);

    this.router.put("/:id/paket-member/:paketId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(paketGymSchema, "params"),
      validateCredentials(updatePaketGymSchema),
      tryCatch(paketMemberController.update),
    ]);

    this.router.delete("/:id/paket-member/:paketId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "PENJAGA"]),
      validateCredentials(paketGymSchema, "params"),
      tryCatch(paketMemberController.delete),
    ]);
  }
}

export default new GymRoutes().router;

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

// import BaseRoutes from "../../../base_classes/base-route.js";
// import authTokenMiddleware from "../../../middlewares/auth-token-middleware.js";
// import validateCredentials from "../../../middlewares/validate-credentials-middleware.js";
// import tryCatch from "../../../utils/tryCatcher.js";
// import { changePasswordSchema } from "../../auth/auth-schema.js";
// import { getGymSchema, gymSchema } from "../gym.schema.js";
// import gymPenjagaController from "./gym-penjaga.controller.js";
// import { createPenjagaSchema, getPenjagaSchema, updatePenjagaSchema } from "./gym-penjaga.schema.js";

// class GymPenjagaRoutes extends BaseRoutes {
//     routes(){
//         this.router.post("/", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(createPenjagaSchema),
//             tryCatch(gymPenjagaController.createPenjaga),
//         ]);

//         this.router.delete("/", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(getPenjagaSchema),
//             tryCatch(gymPenjagaController.deletePenjaga),
//         ]);

//         this.router.get("/", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(gymSchema),
//             tryCatch(gymPenjagaController.index),
//         ])

//         this.router.get("/profile", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["PENJAGA"]),
//             tryCatch(gymPenjagaController.profile)
//         ])

//         this.router.get("/:userId", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(gymSchema),
//             validateCredentials(getGymSchema, "params"),
//             tryCatch(gymPenjagaController.show),
//         ]);

//         this.router.put("/:userId", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(updatePenjagaSchema),
//             validateCredentials(getGymSchema, "params"),
//             tryCatch(gymPenjagaController.update),
//         ])

//         this.router.patch("/:userId/update-password", [
//             authTokenMiddleware.authenticate,
//             authTokenMiddleware.authorizeUser(["OWNER"]),
//             validateCredentials(changePasswordSchema),
//             validateCredentials(getGymSchema, "params"),
//             tryCatch(gymPenjagaController.updateStaffPassword),
//         ])

//     }
// }

// export default new GymPenjagaRoutes().router;
