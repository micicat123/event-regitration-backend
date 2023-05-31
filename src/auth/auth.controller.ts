import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { FastifyReply } from 'fastify';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() userRegisterDto: UserRegisterDto) {
    await this.authService.registerUser(userRegisterDto);
    return { message: 'User registered successfully' };
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
    reply.header('Set-Cookie', `jwt=${token}; HttpOnly; Path=/`);
    reply.send({ token });
  }

  @Post('logout')
  async logout(@Res() reply: FastifyReply) {
    reply.header('Set-Cookie', `jwt=; HttpOnly; Path=/; `);
    reply.send('logged out');
  }
}
