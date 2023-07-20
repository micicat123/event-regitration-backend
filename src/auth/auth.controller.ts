import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as admin from 'firebase-admin';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/interfaces/authenticatedRequest';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() userRegisterDto: UserRegisterDto) {
    const user = await this.authService.registerUser(userRegisterDto);
    return { user: user };
  }

  @Post('login')
  async getToken(
    @Body() userLoginDto: UserLoginDto,
    @Res() reply: FastifyReply,
  ) {
    const { username, password } = userLoginDto;
    const payload = { username, password };
    await this.authService.validateUser(payload);

    const token = await this.authService.generateToken(payload);
    reply.header('Set-Cookie', `jwt=${token}; Path=/`);
    reply.send({ token });
  }

  @Post('logout')
  async logout(@Res() reply: FastifyReply) {
    reply.header('Set-Cookie', `jwt=; Path=/; `);
    reply.status(200);
    reply.send({ message: 'logged out' });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUser(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    const user = await admin.auth().getUser(request.user.uid);
    reply.send({ user: user });
  }
}
