import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { getUserEquipmentSchema } from "./equipment.schema.js";
import equipmentController from "./equipment.controller.js";


class EquipmentRoutes extends BaseRoutes{
    routes(){

        this.router.get('/me', 
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['MEMBER']),
            validateCredentials(getUserEquipmentSchema, 'query'),
            tryCatch(equipmentController.getEquipmentUser)
        );
    }
}

export default new EquipmentRoutes().router;
