import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import BaseRoutes from "../../base_classes/base-route.js";
import attendanceController from "./attendance.controller.js";
import { attendanceSchema, checkInSchema } from "./attendance.schema.js";


class AttendanceRoutes extends BaseRoutes{
    routes(){

        this.router.post('/qr/me',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['MEMBER']),
            tryCatch(attendanceController.getAttendanceToken)
        );

        this.router.post('/check-in',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['PENJAGA']),
            validateCredentials(checkInSchema),
            tryCatch(attendanceController.checkIn)
        );

        this.router.post('/check-out',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['PENJAGA']),
            tryCatch(attendanceController.checkOut)
        );

        this.router.get('/history/:gymId',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(attendanceSchema, 'params'),
            tryCatch(attendanceController.getAttendanceHistory)
        );
        this.router.get('/:gymId',
            authTokenMiddleware.authenticate,
            authTokenMiddleware.authorizeUser(['OWNER', 'PENJAGA']),
            validateCredentials(attendanceSchema, "params"),
            tryCatch(attendanceController.index)
        ); 
    }
}
export default new AttendanceRoutes().router;