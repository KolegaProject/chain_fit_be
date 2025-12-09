import BaseRoutes from "../../base_classes/base-route.js";
import equipmentController from "./equipment.controller.js";
import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import {createEquipment,updateEquipment, queryEquipment,} from "./equipment.schema.js";

class EquipmentRoutes extends BaseRoutes {
  routes() {
    // 1. Create Equipment
    this.router.post("/",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      validateCredentials(createEquipment),
      tryCatch(equipmentController.create)
    );

    // 2. Get All Equipment (Pagination)
    this.router.get("/",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER' || 'PENJAGA']),
      validateCredentials(queryEquipment),
      tryCatch(equipmentController.findAll)
    );

    // 3. Get One Equipment
    this.router.get("/:id",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      tryCatch(equipmentController.findOne)
    );

    // 4. Update Equipment
    this.router.patch("/:id",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      validateCredentials(updateEquipment),
      tryCatch(equipmentController.update)
    );

    // 5. Delete Equipment
    this.router.delete("/:id",
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      tryCatch(equipmentController.delete)
    );
  }
}

export default new EquipmentRoutes().router;