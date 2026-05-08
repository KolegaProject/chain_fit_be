import { describe, test, expect, jest, afterEach } from '@jest/globals';

import GymMembershipController from './gym-membership.controller.js';
import gymMembershipService from './gym-membership.service.js';

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

describe('GymMembershipController', () => {
  test('getMembership should use req.user.id and return success response', async () => {
    jest.spyOn(gymMembershipService, 'getAllMemberships').mockResolvedValue([
      { id: 1, gymId: 3 },
      { id: 2, gymId: 4 }
    ]);

    const req = {
      user: { id: 17 }
    };
    const res = createMockRes();

    await GymMembershipController.getMembership(req, res);

    expect(gymMembershipService.getAllMemberships).toHaveBeenCalledWith(17);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 2,
      data: [
        { id: 1, gymId: 3 },
        { id: 2, gymId: 4 }
      ],
      errors: null
    });
  });

  test('index should parse gym id and return all user memberships', async () => {
    jest.spyOn(gymMembershipService, 'getAllUserMembership').mockResolvedValue([
      { id: 10, userId: 5 },
      { id: 11, userId: 6 }
    ]);

    const req = {
      params: {
        id: '9'
      }
    };
    const res = createMockRes();

    await GymMembershipController.index(req, res);

    expect(gymMembershipService.getAllUserMembership).toHaveBeenCalledWith(9);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
    expect(res.jsonPayload.data).toEqual([
      { id: 10, userId: 5 },
      { id: 11, userId: 6 }
    ]);
  });

  test('show should parse gymId and membershipId then return success response', async () => {
    jest.spyOn(gymMembershipService, 'getUserMembershipById').mockResolvedValue({
      id: 21,
      userId: 8,
      gymId: 7
    });

    const req = {
      params: {
        id: '7',
        membershipId: '21'
      }
    };
    const res = createMockRes();

    await GymMembershipController.show(req, res);

    expect(gymMembershipService.getUserMembershipById).toHaveBeenCalledWith(7, 21);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 21,
      userId: 8,
      gymId: 7
    });
  });

  test('create should pass name email body and gymId params to service', async () => {
    jest.spyOn(gymMembershipService, 'createMembership').mockResolvedValue({
      id: 30,
      status: 'AKTIF'
    });

    const req = {
      params: {
        id: '4'
      },
      body: {
        name: 'Budi',
        email: 'budi@example.com',
        paketId: 2
      }
    };
    const res = createMockRes();

    await GymMembershipController.create(req, res);

    expect(gymMembershipService.createMembership).toHaveBeenCalledWith(
      {
        name: 'Budi',
        email: 'budi@example.com'
      },
      4,
      2
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 1,
      data: {
        id: 30,
        status: 'AKTIF'
      },
      errors: null
    });
  });

  test('update should parse membershipId and pass paketId to service', async () => {
    jest.spyOn(gymMembershipService, 'updateMembership').mockResolvedValue({
      id: 55,
      paketId: 3
    });

    const req = {
      params: {
        membershipId: '55'
      },
      body: {
        paketId: 3
      }
    };
    const res = createMockRes();

    await GymMembershipController.update(req, res);

    expect(gymMembershipService.updateMembership).toHaveBeenCalledWith(55, 3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 55,
      paketId: 3
    });
  });

  test('delete should parse membershipId and return success response', async () => {
    jest.spyOn(gymMembershipService, 'removeMembership').mockResolvedValue({
      message: 'Membership removed successfully'
    });

    const req = {
      params: {
        membershipId: '77'
      }
    };
    const res = createMockRes();

    await GymMembershipController.delete(req, res);

    expect(gymMembershipService.removeMembership).toHaveBeenCalledWith(77);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: {
        message: 'Membership removed successfully'
      },
      errors: null
    });
  });
});
