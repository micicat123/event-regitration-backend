import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [UploadService, JwtService, AuthService],
  controllers: [UploadController],
})
export class UploadModule {}
