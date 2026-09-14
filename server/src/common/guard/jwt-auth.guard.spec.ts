import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn(),
    };
    guard = new JwtAuthGuard(jwtServiceMock, configServiceMock);
  });

  const createMockContext = (authHeader?: string) => {
    const request: any = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Vui lòng đăng nhập để tiếp tục'),
    );
  });

  it('should verify token with JWT_ACCESS_SECRET and attach user to request', async () => {
    const context = createMockContext('Bearer valid-token');
    const mockPayload = { id: 'user-123', email: 'test@example.com' };

    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'my-production-secret';
      return null;
    });

    jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(configServiceMock.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: 'my-production-secret',
    });
    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual(mockPayload);
  });

  it('should fallback to fallbackSecretKey if no secret configured', async () => {
    const context = createMockContext('Bearer valid-token');
    configServiceMock.get.mockReturnValue(null);
    jwtServiceMock.verifyAsync.mockResolvedValue({ id: 'u1' });

    await guard.canActivate(context);

    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: 'fallbackSecretKey',
    });
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const context = createMockContext('Bearer expired-token');
    configServiceMock.get.mockReturnValue('secret');
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn'),
    );
  });
});
