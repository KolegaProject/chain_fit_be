
import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { changePasswordSchema } from "../auth/auth-schema.js";


// GYM DOMAIN
import gymController from "./gym.controller.js";
import { createGymSchema, getGymSchema, gymSchema } from "./gym.schema.js";

// PAKET MEMBER DOMAIN
import {
  createPaketGymSchema,
  paketGymSchema,
  updatePaketGymSchema,
} from "../membership_paket/paket-member.schema.js";
import paketMemberController from "../membership_paket/paket-member.controller.js";

// PENJAGA GYM DOMAIN
import gymPenjagaController from "./penjaga/gym-penjaga.controller.js";
import { createPenjagaSchema, getPenjagaSchema, updatePenjagaSchema } from "./penjaga/gym-penjaga.schema.js";

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

    // staff gym
    this.router.post("/:id/gym-staff", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(createPenjagaSchema),
      tryCatch(gymPenjagaController.createPenjaga),
    ]);
    
    this.router.delete("/:id/gym-staff", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      validateCredentials(getPenjagaSchema),
      tryCatch(gymPenjagaController.deletePenjaga),
    ]);

    this.router.get("/:id/gym-staff", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymPenjagaController.index),
    ]);
    
    this.router.get("/:id/gym-staff/profile", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["PENJAGA"]),
      validateCredentials(gymSchema, "params"),
      tryCatch(gymPenjagaController.profile), 
    ]);
    
    this.router.get("/:id/gym-staff/:userId", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(getPenjagaSchema, "params"),
      tryCatch(gymPenjagaController.show),
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

    // ========== Gym list & create ==========
    this.router.post("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER"]),
      validateCredentials(createGymSchema),
      tryCatch(gymController.create),
    ]);

    this.router.get("/", [
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(["OWNER", "MEMBER", "PENJAGA"]),
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
