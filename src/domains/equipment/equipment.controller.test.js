import { describe, test, expect, jest, afterEach } from '@jest/globals';

import EquipmentController from './equipment.controller.js';
import equipmentService from './equipment.service.js';

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

describe('EquipmentController', () => {
  test('create should map request values and return success response', async () => {
    jest.spyOn(equipmentService, 'createEquipment').mockResolvedValue({
      id: 1,
      name: 'Bench Press',
      jumlah: 3
    });

    const req = {
      params: { id: '12' },
      user: { id: 99 },
      files: {
        image: [{ originalname: 'bench.png' }]
      },
      body: {
        name: 'Bench Press',
        videoURL: 'https://video.example/bench',
        jum: '3',
        description: 'Chest machine'
      }
    };
    const res = createMockRes();

    await EquipmentController.create(req, res);

    expect(equipmentService.createEquipment).toHaveBeenCalledWith(
      12,
      99,
      {
        name: 'Bench Press',
        videoURL: 'https://video.example/bench',
        jumlah: 3,
        description: 'Chest machine'
      },
      [{ originalname: 'bench.png' }]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: {
        id: 1,
        name: 'Bench Press',
        jumlah: 3
      },
      errors: null
    });
  });

  test('update should convert params and optional jumlah correctly', async () => {
    jest.spyOn(equipmentService, 'updateEquipment').mockResolvedValue({
      id: 5,
      name: 'Treadmill',
      healthStatus: 'BAIK'
    });

    const req = {
      params: { id: '7', equipId: '5' },
      user: { id: 10 },
      files: {
        image: [{ originalname: 'treadmill.jpg' }]
      },
      body: {
        name: 'Treadmill',
        healthStatus: 'BAIK',
        videoURL: 'https://video.example/treadmill',
        jumlah: '4',
        description: 'Cardio machine'
      }
    };
    const res = createMockRes();

    await EquipmentController.update(req, res);

    expect(equipmentService.updateEquipment).toHaveBeenCalledWith(
      5,
      7,
      10,
      {
        name: 'Treadmill',
        healthStatus: 'BAIK',
        videoURL: 'https://video.example/treadmill',
        jumlah: 4,
        description: 'Cardio machine'
      },
      [{ originalname: 'treadmill.jpg' }]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 5,
      name: 'Treadmill',
      healthStatus: 'BAIK'
    });
  });

  test('update should pass undefined jumlah when body.jumlah is null', async () => {
    jest.spyOn(equipmentService, 'updateEquipment').mockResolvedValue({
      id: 6,
      name: 'Rowing Machine'
    });

    const req = {
      params: { id: '8', equipId: '6' },
      user: { id: 77 },
      body: {
        name: 'Rowing Machine',
        healthStatus: 'RUSAK',
        videoURL: 'https://video.example/row',
        jumlah: null,
        description: 'Broken machine'
      }
    };
    const res = createMockRes();

    await EquipmentController.update(req, res);

    expect(equipmentService.updateEquipment).toHaveBeenCalledWith(
      6,
      8,
      77,
      {
        name: 'Rowing Machine',
        healthStatus: 'RUSAK',
        videoURL: 'https://video.example/row',
        jumlah: undefined,
        description: 'Broken machine'
      },
      undefined
    );
  });

  test('delete should call service and return success response', async () => {
    jest.spyOn(equipmentService, 'deleteEquipment').mockResolvedValue({
      message: 'Equipment deleted successfully'
    });

    const req = {
      params: { id: '4', equipId: '11' },
      user: { id: 20 }
    };
    const res = createMockRes();

    await EquipmentController.delete(req, res);

    expect(equipmentService.deleteEquipment).toHaveBeenCalledWith(11, 4, 20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      message: 'Equipment deleted successfully'
    });
  });

  test('index should pass search and healthStatus query to service', async () => {
    jest.spyOn(equipmentService, 'getAllEquipments').mockResolvedValue([
      { id: 1, name: 'Bench Press' },
      { id: 2, name: 'Dumbbell' }
    ]);

    const req = {
      params: { id: '3' },
      user: { id: 50 },
      query: {
        search: 'bench',
        healthStatus: 'BAIK'
      }
    };
    const res = createMockRes();

    await EquipmentController.index(req, res);

    expect(equipmentService.getAllEquipments).toHaveBeenCalledWith(3, 50, {
      search: 'bench',
      healthStatus: 'BAIK'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
  });

  test('show should call service with numeric ids and return success response', async () => {
    jest.spyOn(equipmentService, 'getEquipmentById').mockResolvedValue({
      id: 2,
      name: 'Cable Machine'
    });

    const req = {
      params: { id: '9', equipId: '2' },
      user: { id: 12 }
    };
    const res = createMockRes();

    await EquipmentController.show(req, res);

    expect(equipmentService.getEquipmentById).toHaveBeenCalledWith(2, 9, 12);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 2,
      name: 'Cable Machine'
    });
  });
});
