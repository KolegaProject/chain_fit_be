import { describe, test, expect, jest, afterEach } from '@jest/globals';

import GymPenjagaController from './gym-penjaga.controller.js';
import gymPenjagaService from './gym-penjaga.service.js';

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

describe('GymPenjagaController', () => {
  test('createPenjaga should map body and ids then return created response', async () => {
    jest.spyOn(gymPenjagaService, 'createPenjagaGym').mockResolvedValue({
      message: 'Succefully create penjaga',
      data: { username: 'staff1', name: 'Staff One' }
    });

    const req = {
      body: {
        username: 'staff1',
        name: 'Staff One',
        email: 'staff1@example.com',
        password: 'secret123'
      },
      user: { id: 99 },
      params: { id: '5' }
    };
    const res = createMockRes();

    await GymPenjagaController.createPenjaga(req, res);

    expect(gymPenjagaService.createPenjagaGym).toHaveBeenCalledWith(
      {
        username: 'staff1',
        name: 'Staff One',
        email: 'staff1@example.com',
        password: 'secret123'
      },
      99,
      5
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload.data).toEqual({
      message: 'Succefully create penjaga',
      data: { username: 'staff1', name: 'Staff One' }
    });
  });

  test('deletePenjaga should parse params and return success response', async () => {
    jest.spyOn(gymPenjagaService, 'deletePenjagaGym').mockResolvedValue({
      message: 'Succesfully delete penjaga'
    });

    const req = {
      params: {
        id: '7',
        userId: '15'
      },
      user: { id: 20 }
    };
    const res = createMockRes();

    await GymPenjagaController.deletePenjaga(req, res);

    expect(gymPenjagaService.deletePenjagaGym).toHaveBeenCalledWith(15, 20, 7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      message: 'Succesfully delete penjaga'
    });
  });

  test('index should use owner id and parsed gym id', async () => {
    jest.spyOn(gymPenjagaService, 'getAllPenjaga').mockResolvedValue([
      { id: 1, name: 'Staff A' },
      { id: 2, name: 'Staff B' }
    ]);

    const req = {
      user: { id: 77 },
      params: { id: '9' }
    };
    const res = createMockRes();

    await GymPenjagaController.index(req, res);

    expect(gymPenjagaService.getAllPenjaga).toHaveBeenCalledWith({ ownerId: 77, id: 9 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
  });

  test('show should parse gym id and user id then return success response', async () => {
    jest.spyOn(gymPenjagaService, 'getPenjagaById').mockResolvedValue({
      id: 4,
      name: 'Staff Detail'
    });

    const req = {
      user: { id: 50 },
      params: {
        id: '3',
        userId: '4'
      }
    };
    const res = createMockRes();

    await GymPenjagaController.show(req, res);

    expect(gymPenjagaService.getPenjagaById).toHaveBeenCalledWith({
      userId: 4,
      id: 3,
      ownerId: 50
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 4,
      name: 'Staff Detail'
    });
  });

  test('profile should use logged in user id and return success response', async () => {
    jest.spyOn(gymPenjagaService, 'getPenjagaProfile').mockResolvedValue({
      id: 101,
      name: 'My Staff Profile'
    });

    const req = {
      user: { id: 101 }
    };
    const res = createMockRes();

    await GymPenjagaController.profile(req, res);

    expect(gymPenjagaService.getPenjagaProfile).toHaveBeenCalledWith(101);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 101,
      name: 'My Staff Profile'
    });
  });

  test('update should pass parsed ids, body, image, and owner id to service', async () => {
    jest.spyOn(gymPenjagaService, 'updatePenjaga').mockResolvedValue({
      id: 6,
      name: 'Updated Staff'
    });

    const req = {
      params: {
        id: '2',
        userId: '6'
      },
      user: { id: 11 },
      body: {
        name: 'Updated Staff',
        email: 'updated@example.com',
        password: 'newpass123'
      },
      files: {
        image: [{ originalname: 'profile.png' }]
      }
    };
    const res = createMockRes();

    await GymPenjagaController.update(req, res);

    expect(gymPenjagaService.updatePenjaga).toHaveBeenCalledWith(
      2,
      6,
      {
        name: 'Updated Staff',
        email: 'updated@example.com',
        password: 'newpass123'
      },
      [{ originalname: 'profile.png' }],
      11
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 6,
      name: 'Updated Staff'
    });
  });

  test('updateStaffPassword should throw when confirm password does not match', async () => {
    const req = {
      params: {
        id: '8',
        userId: '3'
      },
      user: { id: 14 },
      body: {
        old_password: 'old-pass',
        new_password: 'new-pass',
        confirm_password: 'different-pass'
      }
    };
    const res = createMockRes();

    await expect(GymPenjagaController.updateStaffPassword(req, res)).rejects.toThrow(
      'Failed to update staff password'
    );
  });

  test('updateStaffPassword should pass ids and passwords to service then return success response', async () => {
    jest.spyOn(gymPenjagaService, 'updatePasswordProfile').mockResolvedValue({
      message: 'Password updated successfully'
    });

    const req = {
      params: {
        id: '8',
        userId: '3'
      },
      user: { id: 14 },
      body: {
        old_password: 'old-pass',
        new_password: 'new-pass',
        confirm_password: 'new-pass'
      }
    };
    const res = createMockRes();

    await GymPenjagaController.updateStaffPassword(req, res);

    expect(gymPenjagaService.updatePasswordProfile).toHaveBeenCalledWith(
      { ownerId: 14, id: 3, gymId: 8 },
      'old-pass',
      'new-pass'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      message: 'Password updated successfully'
    });
  });
});
