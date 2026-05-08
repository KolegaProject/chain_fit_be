import { createdResponse, successResponse } from "../../utils/response.js";
import cashflowService from "./cashflow.service.js";

class CashflowController {
  async create(req, res) {
    const userId = req.user.id;
    const gymId = Number(req.params.id);

    const { name, amount, transactionType, cashflowType, date, note } =
      req.body;

    const cashflow = await cashflowService.create(userId, {
      name,
      amount: Number(amount),
      transactionType,
      cashflowType,
      date: new Date(date),
      note,
      gymId,
    });

    return createdResponse(res, cashflow);
  }

  async update(req, res) {
    const userId = req.user.id;
    const gymId = Number(req.params.id);
    const cashflowId = Number(req.params.cashflowId);

    const { name, amount, transactionType, cashflowType, date, note } =
      req.body;

    const cashflow = await cashflowService.update(userId, cashflowId, {
      name,
      amount: amount == null ? undefined : Number(amount),
      transactionType,
      cashflowType,
      date: date == null ? undefined : new Date(date),
      note,
      gymId,
    });

    return successResponse(res, cashflow);
  }

  async delete(req, res) {
    const userId = req.user.id;
    const gymId = Number(req.params.id);
    const cashflowId = Number(req.params.cashflowId);

    const cashflow = await cashflowService.delete(userId, gymId, cashflowId);

    return successResponse(res, cashflow);
  }

  async index(req, res) {
    const userId = req.user.id;
    const gymId = Number(req.params.id);



    const {
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const cashflows = await cashflowService.getAll(userId, gymId, search, limit, offset);

    return successResponse(res, cashflows);
  }

  async show(req, res) {
    const userId = req.user.id;
    const gymId = Number(req.params.id);
    const cashflowId = Number(req.params.cashflowId);

    const cashflow = await cashflowService.getById(userId, gymId, cashflowId);

    return successResponse(res, cashflow);
  }
}

export default new CashflowController();
