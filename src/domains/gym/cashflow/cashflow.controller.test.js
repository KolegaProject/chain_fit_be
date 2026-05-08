import { describe, test, expect, jest, afterEach } from '@jest/globals';

import CashflowController from './cashflow.controller.js';
import cashflowService from './cashflow.service.js';

function createMockRes() {
  return {
    statusCode: null,
    jsonPayload: null,
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (payload) {
      this.jsonPayload = payload;
      return this;
    })
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CashflowController', () => {
  test('create should map body values and return created response', async () => {
    jest.spyOn(cashflowService, 'create').mockResolvedValue({
      id: 1,
      name: 'Membership Payment',
      amount: 50000
    });

    const req = {
      user: { id: 9 },
      params: { id: '4' },
      body: {
        name: 'Membership Payment',
        amount: '50000',
        transactionType: 'INCOME',
        cashflowType: 'MEMBERSHIP',
        date: '2026-05-08T10:00:00.000Z',
        note: 'Monthly membership'
      }
    };
    const res = createMockRes();

    await CashflowController.create(req, res);

    expect(cashflowService.create).toHaveBeenCalledWith(9, {
      name: 'Membership Payment',
      amount: 50000,
      transactionType: 'INCOME',
      cashflowType: 'MEMBERSHIP',
      date: new Date('2026-05-08T10:00:00.000Z'),
      note: 'Monthly membership',
      gymId: 4
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 1,
      data: {
        id: 1,
        name: 'Membership Payment',
        amount: 50000
      },
      errors: null
    });
  });

  test('update should convert amount/date and return success response', async () => {
    jest.spyOn(cashflowService, 'update').mockResolvedValue({
      id: 2,
      name: 'Updated Cashflow',
      amount: 75000
    });

    const req = {
      user: { id: 15 },
      params: {
        id: '7',
        cashflowId: '2'
      },
      body: {
        name: 'Updated Cashflow',
        amount: '75000',
        transactionType: 'EXPENSE',
        cashflowType: 'MAINTENANCE',
        date: '2026-05-09T08:30:00.000Z',
        note: 'Repair treadmill'
      }
    };
    const res = createMockRes();

    await CashflowController.update(req, res);

    expect(cashflowService.update).toHaveBeenCalledWith(15, 2, {
      name: 'Updated Cashflow',
      amount: 75000,
      transactionType: 'EXPENSE',
      cashflowType: 'MAINTENANCE',
      date: new Date('2026-05-09T08:30:00.000Z'),
      note: 'Repair treadmill',
      gymId: 7
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 2,
      name: 'Updated Cashflow',
      amount: 75000
    });
  });

  test('update should pass undefined for amount and date when null', async () => {
    jest.spyOn(cashflowService, 'update').mockResolvedValue({
      id: 3,
      name: 'Partial Update'
    });

    const req = {
      user: { id: 11 },
      params: {
        id: '5',
        cashflowId: '3'
      },
      body: {
        name: 'Partial Update',
        amount: null,
        transactionType: 'INCOME',
        cashflowType: 'OTHER',
        date: null,
        note: 'Only note update'
      }
    };
    const res = createMockRes();

    await CashflowController.update(req, res);

    expect(cashflowService.update).toHaveBeenCalledWith(11, 3, {
      name: 'Partial Update',
      amount: undefined,
      transactionType: 'INCOME',
      cashflowType: 'OTHER',
      date: undefined,
      note: 'Only note update',
      gymId: 5
    });
  });

  test('delete should call service with numeric ids and return success response', async () => {
    jest.spyOn(cashflowService, 'delete').mockResolvedValue({
      message: 'Cashflow deleted successfully'
    });

    const req = {
      user: { id: 21 },
      params: {
        id: '3',
        cashflowId: '8'
      }
    };
    const res = createMockRes();

    await CashflowController.delete(req, res);

    expect(cashflowService.delete).toHaveBeenCalledWith(21, 3, 8);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      message: 'Cashflow deleted successfully'
    });
  });

  test('index should compute offset from page and limit then return success response', async () => {
    jest.spyOn(cashflowService, 'getAll').mockResolvedValue([
      { id: 10, name: 'Cash A' },
      { id: 11, name: 'Cash B' }
    ]);

    const req = {
      user: { id: 31 },
      params: { id: '6' },
      query: {
        search: 'cash',
        page: 2,
        limit: 5
      }
    };
    const res = createMockRes();

    await CashflowController.index(req, res);

    expect(cashflowService.getAll).toHaveBeenCalledWith(31, 6, 'cash', 5, 5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
  });

  test('index should use default page and limit when query is empty', async () => {
    jest.spyOn(cashflowService, 'getAll').mockResolvedValue([]);

    const req = {
      user: { id: 45 },
      params: { id: '2' },
      query: {}
    };
    const res = createMockRes();

    await CashflowController.index(req, res);

    expect(cashflowService.getAll).toHaveBeenCalledWith(45, 2, undefined, 10, 0);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 0,
      data: [],
      errors: null
    });
  });

  test('show should call service with numeric ids and return success response', async () => {
    jest.spyOn(cashflowService, 'getById').mockResolvedValue({
      id: 4,
      name: 'Cashflow Detail'
    });

    const req = {
      user: { id: 50 },
      params: {
        id: '9',
        cashflowId: '4'
      }
    };
    const res = createMockRes();

    await CashflowController.show(req, res);

    expect(cashflowService.getById).toHaveBeenCalledWith(50, 9, 4);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 4,
      name: 'Cashflow Detail'
    });
  });
});
