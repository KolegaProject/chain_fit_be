import BaseRoutes from "../../../base_classes/base-route.js";
import authTokenMiddleware from "../../../middlewares/auth-token-middleware.js";
import validateCredentials from "../../../middlewares/validate-credentials-middleware.js";
import tryCatch from "../../../utils/tryCatcher.js";
import { changePasswordSchema } from "../../auth/auth-schema.js";
import { getGymSchema, gymSchema } from "../gym.schema.js";
import gymPenjagaController from "./gym-penjaga.controller.js";
import { createPenjagaSchema, getPenjagaSchema, updatePenjagaSchema } from "./gym-penjaga.schema.js";

class GymPenjagaRoutes extends BaseRoutes {
    routes(){
        this.router.post("/", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(createPenjagaSchema),
            tryCatch(gymPenjagaController.createPenjaga),
        ]);

        this.router.delete("/", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(getPenjagaSchema),
            tryCatch(gymPenjagaController.deletePenjaga),
        ]);

        this.router.get("/", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(gymSchema), 
            tryCatch(gymPenjagaController.index),
        ])

        this.router.get("/profile", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["PENJAGA"]),
            tryCatch(gymPenjagaController.profile)
        ])

        this.router.get("/:userId", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(gymSchema),
            validateCredentials(getGymSchema, "params"),
            tryCatch(gymPenjagaController.show),
        ]);
        
        this.router.put("/:userId", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(updatePenjagaSchema),
            validateCredentials(getGymSchema, "params"),
            tryCatch(gymPenjagaController.update),
        ])

        this.router.patch("/:userId/update-password", [
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(["OWNER"]),
            validateCredentials(changePasswordSchema),
            validateCredentials(getGymSchema, "params"),
            tryCatch(gymPenjagaController.updateStaffPassword),
        ])

    } 
}

export default new GymPenjagaRoutes().router;