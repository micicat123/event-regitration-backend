import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { FirebaseApp } from 'firebase/app';

@Module({
  providers: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
