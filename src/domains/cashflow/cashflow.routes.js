import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import { gymSchema } from "../gym/gym.schema.js";
import { cashflowSchema, createCashflowSchema, getAllCashflowSchema, updateCashflowSchema } from "./cashflow.schema.js";
import cashflowController from "./cashflow.controller.js";


class AttendanceRoutes extends BaseRoutes{
    routes(){
        this.router.post('/:id/cashflow',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(gymSchema, 'params'),
            validateCredentials(createCashflowSchema),
            tryCatch(cashflowController.create)
        );

        this.router.put('/:id/cashflow/:cashflowId',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(cashflowSchema, 'params'),
            validateCredentials(updateCashflowSchema),
            tryCatch(cashflowController.update)
        );

        this.router.delete('/:id/cashflow/:cashflowId',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(cashflowSchema, 'params'),
            tryCatch(cashflowController.delete)
        );

        this.router.get('/:id/cashflow',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(gymSchema, 'params'),
            validateCredentials(getAllCashflowSchema),
            tryCatch(cashflowController.index)
        );
        this.router.get('/:id/cashflow/:cashflowId',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(cashflowSchema, "params"),
            tryCatch(cashflowController.show)
        ); 
    }
}
export default new AttendanceRoutes().router;