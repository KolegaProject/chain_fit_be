import { createdResponse, successResponse } from "../../utils/response.js";
import attendanceService from "./attendance.service.js";

class AttendanceController {
    async index(req, res){
        const gymId = parseInt(req.params.gymId);
        const attendance = await attendanceService.getAllAttendace(gymId);
        return successResponse(res, attendance);
    }

    async getAttendanceToken(req, res){
        const user_id = req.user.id;
        const token = await attendanceService.getAttendanceToken(user_id);
        return createdResponse(res, {token});
    }

    async checkIn(req, res){
        const {token} = req.body;
        const penjagaId = req.user.id;
        const attendance = await attendanceService.checkIn(token, penjagaId);
        return createdResponse(res, attendance);
    }

    async checkOut(req, res){
        const user_id = req.body.userId;
        const attendance = await attendanceService.checkOut(user_id);
        return successResponse(res, attendance);
    }

    async getAttendanceHistory(req, res){
        const gymId = parseInt(req.params.gymId);
        const attendanceHistory = await attendanceService.getAttendanceHistory(gymId);
        return successResponse(res, attendanceHistory);
    }

    // absen manual oleh penjaga untuk yang bukan member (sekalian create transaksi pendapatan)
    // checkout manual oleh penjaga untuk yang bukan member
}
export default new AttendanceController();