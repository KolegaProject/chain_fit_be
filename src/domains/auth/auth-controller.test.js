import { describe, test, expect, jest, afterEach } from '@jest/globals';

import AuthController from './auth-controller.js';
import AuthService from './auth-service.js';

function createMockRes() {
  return {
    statusCode: null,
    jsonPayload: null,
    redirectedTo: null,
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (payload) {
      this.jsonPayload = payload;
      return this;
    }),
    redirect: jest.fn(function (url) {
      this.redirectedTo = url;
      return this;
    })
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AuthController', () => {
  test('login should return success response with tokens', async () => {
    jest.spyOn(AuthService, 'login').mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token'
    });

    const req = {
      body: {
        username: 'johndoe',
        password: 'secret123'
      }
    };
    const res = createMockRes();

    await AuthController.login(req, res);

    expect(AuthService.login).toHaveBeenCalledWith('johndoe', 'secret123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token'
      },
      errors: null
    });
  });

  test('registerOwner should pass request body to AuthService and return success response', async () => {
    jest.spyOn(AuthService, 'registerOwner').mockResolvedValue({
      message: 'User registered successfully.'
    });

    const req = {
      body: {
        name: 'Owner Name',
        username: 'owner1',
        email: 'owner@example.com',
        password: 'securepass'
      }
    };
    const res = createMockRes();

    await AuthController.registerOwner(req, res);

    expect(AuthService.registerOwner).toHaveBeenCalledWith({
      name: 'Owner Name',
      username: 'owner1',
      email: 'owner@example.com',
      password: 'securepass'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: { message: 'User registered successfully.' },
      errors: null
    });
  });

  test('updatePassword should throw when confirm password does not match', async () => {
    const req = {
      user: { id: 10 },
      body: {
        old_password: 'old-pass',
        new_password: 'new-pass',
        confirm_password: 'different-pass'
      }
    };
    const res = createMockRes();

    await expect(AuthController.updatePassword(req, res)).rejects.toThrow(
      'Failed to update user password'
    );
  });

  test('updatePassword should call AuthService and return success response when passwords match', async () => {
    jest.spyOn(AuthService, 'updatePasswordProfile').mockResolvedValue({
      message: 'Password updated successfully'
    });

    const req = {
      user: { id: 7 },
      body: {
        old_password: 'old-pass',
        new_password: 'new-pass',
        confirm_password: 'new-pass'
      }
    };
    const res = createMockRes();

    await AuthController.updatePassword(req, res);

    expect(AuthService.updatePasswordProfile).toHaveBeenCalledWith(7, 'old-pass', 'new-pass');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toEqual({
      code: 200,
      status: 'OK',
      recordsTotal: 1,
      data: { message: 'Password updated successfully' },
      errors: null
    });
  });

  test('verifyResetPassword should redirect to failed page when token verification fails', async () => {
    const previousFeUrl = process.env.FE_URL;
    process.env.FE_URL = 'https://frontend.example.com';

    jest.spyOn(AuthService, 'verifyResetPassword').mockResolvedValue({
      status: 400,
      message: 'Invalid token'
    });

    const req = {
      params: {
        token: 'bad-token'
      }
    };
    const res = createMockRes();

    try {
      await AuthController.verifyResetPassword(req, res);

      expect(AuthService.verifyResetPassword).toHaveBeenCalledWith('bad-token');
      expect(res.redirect).toHaveBeenCalledWith(
        'https://frontend.example.com/reset-password?verify=failed&message=Invalid token'
      );
    } finally {
      process.env.FE_URL = previousFeUrl;
    }
  });

  test('verifyResetPassword should redirect to success page when token verification succeeds', async () => {
    const previousFeUrl = process.env.FE_URL;
    process.env.FE_URL = 'https://frontend.example.com';

    jest.spyOn(AuthService, 'verifyResetPassword').mockResolvedValue({
      status: 200,
      message: 'Password verification successfully',
      data: 'valid-token'
    });

    const req = {
      params: {
        token: 'valid-token'
      }
    };
    const res = createMockRes();

    try {
      await AuthController.verifyResetPassword(req, res);

      expect(AuthService.verifyResetPassword).toHaveBeenCalledWith('valid-token');
      expect(res.redirect).toHaveBeenCalledWith(
        'https://frontend.example.com/reset-password?verify=success&token=valid-token'
      );
    } finally {
      process.env.FE_URL = previousFeUrl;
    }
  });
});
