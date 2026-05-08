import { describe, test, expect, jest, afterEach } from '@jest/globals';

import PaketMembershipController from './paket-member.controller.js';
import paketMemberService from './paket-member.service.js';

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

describe('PaketMembershipController', () => {
  test('createPaket should validate benefits array, call service, and return created response', async () => {
    jest.spyOn(paketMemberService, 'createPaket').mockResolvedValue([
      { id: 1, name: 'Paket Silver' },
      { id: 2, name: 'Paket Gold' }
    ]);

    const req = {
      body: [
        {
          name: 'Paket Silver',
          price: 100000,
          durationDays: 30,
          benefit: ['Akses gym bebas', 'Air mineral']
        },
        {
          name: 'Paket Gold',
          price: 200000,
          durationDays: 60,
          benefit: ['Akses gym bebas', 'Sauna']
        }
      ],
      user: { id: 10 },
      params: { id: '5' }
    };
    const res = createMockRes();

    await PaketMembershipController.createPaket(req, res);

    expect(paketMemberService.createPaket).toHaveBeenCalledWith(req.body, 10, 5);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 2,
      data: [
        { id: 1, name: 'Paket Silver' },
        { id: 2, name: 'Paket Gold' }
      ],
      errors: null
    });
  });

  test('createPaket should throw when one benefit field is not an array', async () => {
    const req = {
      body: [
        {
          name: 'Paket Broken',
          price: 50000,
          durationDays: 15,
          benefit: 'Akses gym bebas'
        }
      ],
      user: { id: 7 },
      params: { id: '2' }
    };
    const res = createMockRes();

    await expect(PaketMembershipController.createPaket(req, res)).rejects.toThrow(
      'Benefit must be an array. Example: ["Akses gym bebas","Foto bareng mas rusdi"]'
    );
  });

  test('index should parse gym id and use req.user.id', async () => {
    jest.spyOn(paketMemberService, 'getAllPaket').mockResolvedValue([
      { id: 1, name: 'Silver' },
      { id: 2, name: 'Gold' }
    ]);

    const req = {
      params: { id: '9' },
      user: { id: 21 }
    };
    const res = createMockRes();

    await PaketMembershipController.index(req, res);

    expect(paketMemberService.getAllPaket).toHaveBeenCalledWith(9, 21);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(2);
    expect(res.jsonPayload.data).toEqual([
      { id: 1, name: 'Silver' },
      { id: 2, name: 'Gold' }
    ]);
  });

  test('show should parse gym id and paket id then return success response', async () => {
    jest.spyOn(paketMemberService, 'getPaketById').mockResolvedValue({
      id: 4,
      name: 'Paket Detail'
    });

    const req = {
      params: {
        id: '3',
        paketId: '4'
      },
      user: { id: 33 }
    };
    const res = createMockRes();

    await PaketMembershipController.show(req, res);

    expect(paketMemberService.getPaketById).toHaveBeenCalledWith(3, 4, 33);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 4,
      name: 'Paket Detail'
    });
  });

  test('update should pass parsed ids and body fields to service', async () => {
    jest.spyOn(paketMemberService, 'updatePaket').mockResolvedValue({
      id: 8,
      name: 'Updated Paket'
    });

    const req = {
      params: {
        id: '6',
        paketId: '8'
      },
      user: { id: 40 },
      body: {
        name: 'Updated Paket',
        price: 300000,
        durationDays: 90,
        benefit: ['Trainer', 'Sauna']
      }
    };
    const res = createMockRes();

    await PaketMembershipController.update(req, res);

    expect(paketMemberService.updatePaket).toHaveBeenCalledWith(6, 8, 40, {
      name: 'Updated Paket',
      price: 300000,
      durationDays: 90,
      benefit: ['Trainer', 'Sauna']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.data).toEqual({
      id: 8,
      name: 'Updated Paket'
    });
  });

  test('delete should parse ids and return success response', async () => {
    jest.spyOn(paketMemberService, 'deletePaket').mockResolvedValue({
      message: 'Paket deleted successfully'
    });

    const req = {
      params: {
        id: '11',
        paketId: '13'
      },
      user: { id: 52 }
    };
    const res = createMockRes();

    await PaketMembershipController.delete(req, res);

    expect(paketMemberService.deletePaket).toHaveBeenCalledWith(11, 13, 52);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: {
        message: 'Paket deleted successfully'
      },
      errors: null
    });
  });
});
