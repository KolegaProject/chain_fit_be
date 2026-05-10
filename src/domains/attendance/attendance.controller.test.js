import { describe, test, expect, jest, afterEach } from '@jest/globals';

import AttendanceController from './attendance.controller.js';
import attendanceService from './attendance.service.js';

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

describe('AttendanceController', () => {
  test('index should parse gymId and return success response', async () => {
    jest.spyOn(attendanceService, 'getAllAttendace').mockResolvedValue([
      { id: 1, userId: 10 },
      { id: 2, userId: 11 }
    ]);

    const req = {
      params: {
        gymId: '5'
      }
    };
    const res = createMockRes();

    await AttendanceController.index(req, res);

    expect(attendanceService.getAllAttendace).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 2,
      data: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 }
      ],
      errors: null
    });
  });

  test('getAttendanceToken should call service with user id and gym id then return created response', async () => {
    jest.spyOn(attendanceService, 'getAttendanceToken').mockResolvedValue('attendance-token-123');

    const req = {
      user: { id: 44 },
      params: {
        id: '8'
      }
    };
    const res = createMockRes();

    await AttendanceController.getAttendanceToken(req, res);

    expect(attendanceService.getAttendanceToken).toHaveBeenCalledWith(44, 8);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 1,
      data: { token: 'attendance-token-123' },
      errors: null
    });
  });

  test('checkIn should call service with token and penjaga id then return created response', async () => {
    jest.spyOn(attendanceService, 'checkIn').mockResolvedValue({
      id: 100,
      status: 'CHECKED_IN'
    });

    const req = {
      user: { id: 9 },
      body: {
        token: 'member-token'
      }
    };
    const res = createMockRes();

    await AttendanceController.checkIn(req, res);

    expect(attendanceService.checkIn).toHaveBeenCalledWith('member-token', 9);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonPayload).toEqual({
      code: 201,
      status: 'Created',
      recordsTotal: 1,
      data: {
        id: 100,
        status: 'CHECKED_IN'
      },
      errors: null
    });
  });

  test('checkOut should call service with userId from body and return success response', async () => {
    jest.spyOn(attendanceService, 'checkOut').mockResolvedValue({
      message: 'Checkout success'
    });

    const req = {
      body: {
        userId: 77
      }
    };
    const res = createMockRes();

    await AttendanceController.checkOut(req, res);

    expect(attendanceService.checkOut).toHaveBeenCalledWith(77);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: { message: 'Checkout success' },
      errors: null
    });
  });

  test('getAttendanceHistory should parse gymId and return success response', async () => {
    jest.spyOn(attendanceService, 'getAttendanceHistory').mockResolvedValue([
      { id: 1, status: 'CHECKED_OUT' }
    ]);

    const req = {
      params: {
        gymId: '12'
      }
    };
    const res = createMockRes();

    await AttendanceController.getAttendanceHistory(req, res);

    expect(attendanceService.getAttendanceHistory).toHaveBeenCalledWith(12);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload.recordsTotal).toBe(1);
    expect(res.jsonPayload.data).toEqual([
      { id: 1, status: 'CHECKED_OUT' }
    ]);
  });

  test('getMyAttendanceHistory should use req.user.id and return success response', async () => {
    jest.spyOn(attendanceService, 'getMemberAttendanceHistory').mockResolvedValue([
      { id: 3, gymId: 2 },
      { id: 4, gymId: 2 }
    ]);

    const req = {
      user: { id: 101 }
    };
    const res = createMockRes();

    await AttendanceController.getMyAttendanceHistory(req, res);

    expect(attendanceService.getMemberAttendanceHistory).toHaveBeenCalledWith(101);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 2,
      data: [
        { id: 3, gymId: 2 },
        { id: 4, gymId: 2 }
      ],
      errors: null
    });
  });
});
