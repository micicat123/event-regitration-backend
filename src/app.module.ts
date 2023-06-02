import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { AuthService } from './auth/auth.service';
import { EventModule } from './event/event.module';
import { RegistrationModule } from './registration/registration.module';
import { UploadModule } from './upload/upload.module';
dotenv.config();

@Module({
  imports: [
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    EventModule,
    RegistrationModule,
    UploadModule,
  ],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, JwtModule],
})
export class AppModule {}
