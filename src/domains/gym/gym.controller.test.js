import { describe, test, expect, jest, afterEach } from '@jest/globals';

import GymController from './gym.controller.js';
import gymService from './gym.service.js';

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

describe('GymController', () => {
  test('create should map request body, parse numbers/json, and return created response', async () => {
    jest.spyOn(gymService, 'createGym').mockResolvedValue({
      id: 1,
      name: 'Alpha Gym'
    });

    const req = {
      body: {
        namaGym: 'Alpha Gym',
        maxCapacity: '120',
        address: 'Jl. Fitness 1',
        jamOperasional: '06:00-22:00',
        lat: '-6.2',
        long: '106.8',
        facility: '["Sauna","Loker"]',
        tag: 'premium',
        description: 'Main branch'
      },
      user: { id: 88 },
      files: {
        image: [{ originalname: 'gym.png' }]
      }
    };
    const res = createMockRes();

    await GymController.create(req, res);

    expect(gymService.createGym).toHaveBeenCalledWith(
      {
        namaGym: 'Alpha Gym',
        maxCp: 120,
        address: 'Jl. Fitness 1',
        ownerId: 88,
        jamOperasional: '06:00-22:00',
        latitude: -6.2,
        longitude: 106.8,
        fac: ['Sauna', 'Loker'],
        tag: 'premium',
        description: 'Main branch'
      },
      [{ originalname: 'gym.png' }]
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 1,
      data: {
        id: 1,
        name: 'Alpha Gym'
      },
      errors: null
    });
  });

  test('create should throw when facility is not a JSON array string', async () => {
    const req = {
      body: {
        namaGym: 'Broken Gym',
        maxCapacity: '50',
        address: 'Jl. Error',
        jamOperasional: '08:00-20:00',
        lat: '-6.1',
        long: '106.7',
        facility: '{"name":"Sauna"}',
        tag: 'basic',
        description: 'Invalid facility format'
      },
      user: { id: 1 },
      files: {
        image: []
      }
    };
    const res = createMockRes();

    await expect(GymController.create(req, res)).rejects.toThrow(
      'Facility must be a JSON array string. Example: ["Sauna","Loker"]'
    );
  });

  test('update should parse optional numeric and json fields then return success response', async () => {
    jest.spyOn(gymService, 'updateGym').mockResolvedValue({
      id: 7,
      name: 'Updated Gym'
    });

    const req = {
      params: { id: '7' },
      user: { id: 55 },
      body: {
        name: 'Updated Gym',
        maxCp: '150',
        address: 'Jl. Update',
        jamOperasional: '05:00-23:00',
        lat: '-6.3',
        long: '107.0',
        fac: '["WiFi","Cafe"]',
        tag: 'elite',
        description: 'Renovated branch'
      }
    };
    const res = createMockRes();

    await GymController.update(req, res);

    expect(gymService.updateGym).toHaveBeenCalledWith(
      {
        name: 'Updated Gym',
        maxCapacity: 150,
        address: 'Jl. Update',
        jamOperasional: '05:00-23:00',
        latitude: -6.3,
        longitude: 107,
        facility: ['WiFi', 'Cafe'],
        tag: 'elite',
        description: 'Renovated branch'
      },
      55,
      7
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 7,
      name: 'Updated Gym'
    });
  });

  test('delete should call service with user id and route id then return success response', async () => {
    jest.spyOn(gymService, 'deleteGym').mockResolvedValue('succesfully delete gym');

    const req = {
      params: { id: '9' },
      user: { id: 22 }
    };
    const res = createMockRes();

    await GymController.delete(req, res);

    expect(gymService.deleteGym).toHaveBeenCalledWith(22, 9);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: 'succesfully delete gym',
      errors: null
    });
  });

  test('index should pass search query to service', async () => {
    jest.spyOn(gymService, 'getAllGym').mockResolvedValue([
      { id: 1, name: 'Gym A' },
      { id: 2, name: 'Gym B' }
    ]);

    const req = {
      query: {
        search: 'gym'
      }
    };
    const res = createMockRes();

    await GymController.index(req, res);

    expect(gymService.getAllGym).toHaveBeenCalledWith('gym');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
  });

  test('show should parse id and return success response', async () => {
    jest.spyOn(gymService, 'getGymById').mockResolvedValue({
      id: 10,
      name: 'Gym Detail'
    });

    const req = {
      params: { id: '10' }
    };
    const res = createMockRes();

    await GymController.show(req, res);

    expect(gymService.getGymById).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 10,
      name: 'Gym Detail'
    });
  });

  test('gymNotVerified should return success response with pending gyms', async () => {
    jest.spyOn(gymService, 'getListGymNotVerifed').mockResolvedValue([
      { id: 3, verified: 'PENDING' }
    ]);

    const req = {};
    const res = createMockRes();

    await GymController.gymNotVerified(req, res);

    expect(gymService.getListGymNotVerifed).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual([
      { id: 3, verified: 'PENDING' }
    ]);
  });

  test('showGymNotVerified should parse id and return success response', async () => {
    jest.spyOn(gymService, 'getListGymNotVerifedById').mockResolvedValue({
      id: 4,
      verified: 'PENDING'
    });

    const req = {
      params: { id: '4' }
    };
    const res = createMockRes();

    await GymController.showGymNotVerified(req, res);

    expect(gymService.getListGymNotVerifedById).toHaveBeenCalledWith(4);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 4,
      verified: 'PENDING'
    });
  });

  test('verified should parse id, pass status, and return success response', async () => {
    jest.spyOn(gymService, 'verifedGym').mockResolvedValue('Successfully verified gym');

    const req = {
      params: { id: '12' },
      body: { status: 'APPROVED' }
    };
    const res = createMockRes();

    await GymController.verified(req, res);

    expect(gymService.verifedGym).toHaveBeenCalledWith(12, 'APPROVED');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toBe('Successfully verified gym');
  });

  test('gymOwner should use req.user.id and return owner gyms', async () => {
    jest.spyOn(gymService, 'getGymByOwnerId').mockResolvedValue([
      { id: 20, ownerId: 99 }
    ]);

    const req = {
      user: { id: 99 }
    };
    const res = createMockRes();

    await GymController.gymOwner(req, res);

    expect(gymService.getGymByOwnerId).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual([
      { id: 20, ownerId: 99 }
    ]);
  });
});
