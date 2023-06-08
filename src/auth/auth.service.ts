import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import 'firebase/compat/auth';
import * as admin from 'firebase-admin';
import firebase from 'firebase/compat/app';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: { username: string; password: string }) {
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async userId(request: FastifyRequest): Promise<string> {
    let jwt;
    try {
      const cookie = request.headers['cookie'];
      const jwtCookie = cookie
        .split(';')
        .find((c) => c.trim().startsWith('jwt='));
      jwt = jwtCookie.split('=')[1];
    } catch (e) {
      throw new Error('Failed to verify JWT token');
    }

    try {
      const data = await this.jwtService.verify(jwt, {
        secret: process.env.JWT_SECRET,
      });
      const username = data['username'];

      const userRecord = await admin.auth().getUserByEmail(username);
      const userId: string = userRecord.uid;
      return userId;
    } catch (error) {
      throw new Error('Failed to verify JWT token');
    }
  }

  async validateUser(payload: JwtPayloadDto) {
    const { username, password } = payload;
    let user;

    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(username, password);
      user = userCredential.user;
    } catch (error) {
      throw new BadRequestException('Invalid username or password.');
    }

    if (!user.emailVerified) {
      throw new BadRequestException(
        'Email not verified. Please check your email for verification instructions.',
      );
    }

    return user;
  }

  async registerUser(userDto: UserRegisterDto) {
    if (userDto.password != userDto.passwordConfirm) {
      throw new BadRequestException(`Passwords do not match.`);
    }

    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(userDto.email, userDto.password);

      const user = userCredential.user;
      await user.sendEmailVerification();

      await user.updateProfile({
        displayName: `${userDto.firstName} ${userDto.lastName}`,
      });

      return user;
    } catch (error) {
      if (error.code == 'auth/weak-password') {
        throw new BadRequestException(
          'Password must be at least 6 characters long.',
        );
      } else if (error.code == 'auth/email-already-in-use') {
        throw new BadRequestException('This email address is already in use.');
      } else if (error.code == 'auth/invalid-email') {
        throw new BadRequestException('Email is badly formatted.');
      }
    }
  }
}
