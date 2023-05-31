import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { AuthService } from 'src/auth/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':event_id')
  async addRegistration(
    @Res() reply: FastifyReply,
    @Req() request: FastifyRequest,
    @Param('event_id') event_id: string,
  ) {
    const user_id: string = await this.authService.userId(request);
    await this.registrationService.addRegistration(event_id, user_id);
    reply.send('Registered to event successfully.');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':registration_id')
  async deleteRegistration(
    @Res() reply: FastifyReply,
    @Param('registration_id') registration_id: string,
  ) {
    await this.registrationService.deleteRegistration(registration_id);
    reply.send('Unregistered from event successfully');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsersRegistrations(
    @Res() reply: FastifyReply,
    @Req() request: FastifyRequest,
  ) {
    const user_id: string = await this.authService.userId(request);
    const response = await this.registrationService.getUsersRegistrations(
      user_id,
    );
    reply.send(response);
  }
}
