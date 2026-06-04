import { describe, test, expect, jest, afterEach } from '@jest/globals';

import MembershipTransactionController from './membership-transaction.controller.js';
import membershipTransactionService from './membership-transaction.service.js';

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

describe('MembershipTransactionController', () => {
  test('index should return membership transaction history for authenticated member', async () => {
    jest.spyOn(membershipTransactionService, 'getAllTransaction').mockResolvedValue([
      {
        id: 1,
        userId: 99,
        gymId: 10,
        orderId: 'GYM-10-1-abc123',
        amount: '102000.00',
        status: 'PAID'
      },
      {
        id: 2,
        userId: 99,
        gymId: 11,
        orderId: 'GYM-11-2-def456',
        amount: '152000.00',
        status: 'PENDING'
      }
    ]);

    const req = {
      user: { id: 99 }
    };
    const res = createMockRes();

    await MembershipTransactionController.index(req, res);

    expect(membershipTransactionService.getAllTransaction).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 2,
      data: [
        {
          id: 1,
          userId: 99,
          gymId: 10,
          orderId: 'GYM-10-1-abc123',
          amount: '102000.00',
          status: 'PAID'
        },
        {
          id: 2,
          userId: 99,
          gymId: 11,
          orderId: 'GYM-11-2-def456',
          amount: '152000.00',
          status: 'PENDING'
        }
      ],
      errors: null
    });
  });
});
