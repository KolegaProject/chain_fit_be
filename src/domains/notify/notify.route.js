import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import notifyController from "./notify.controller.js";


class NotifyRoutes extends BaseRoutes{
    routes(){

        this.router.post('/', 
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['MEMBER']),
            tryCatch(notifyController.saveFcmToken)
        );
        this.router.delete('/', 
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['MEMBER']),
            tryCatch(notifyController.deleteFcmToken)
        );
    }
}

export default new NotifyRoutes().router;
