import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtPayLoad } from '../../module/auth/auth.type.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if(!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục')
      
    }

    try {
      const secret =
        this.configService.get<string>('JWT_ACCESS_SECRET') ??
        this.configService.get<string>('JWT_SECRET') ??
        'fallbackSecretKey';
      const payload = await this.jwtService.verifyAsync<JwtPayLoad>(token, {
        secret
      })
      
      request['user'] = payload
      return true  
    } catch (err) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn')
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
      const raw = request.headers.authorization;
      if (!raw) return undefined;
      const [type, token] = raw.trim().split(/\s+/);
      return type?.toLowerCase() === 'bearer' ? token : undefined;
    }
}
