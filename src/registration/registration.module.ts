import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [RegistrationService, AuthService, JwtService],
  controllers: [RegistrationController],
})
export class RegistrationModule {}
