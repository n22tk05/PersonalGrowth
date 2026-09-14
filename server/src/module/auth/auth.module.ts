import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import AuthRepository from './auth.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') ?? configService.get<string>('JWT_SECRET') ?? 'fallbackSecretKey',
        signOptions: { 
          expiresIn: (configService.get<string>('ACCESS_TOKEN_TIME') ?? configService.get<string>('JWT_EXPIRES_IN') ?? '15m') as any
        },
      }),
    }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
