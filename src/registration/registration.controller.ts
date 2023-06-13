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
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticatedRequest } from 'src/interfaces/authenticatedRequest';

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
    @Req() request: AuthenticatedRequest,
    @Param('event_id') event_id: string,
  ) {
    await this.registrationService.addRegistration(event_id, request.user.uid);
    reply.send({ message: 'Registered to event successfully.' });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':registration_id')
  async deleteRegistration(
    @Res() reply: FastifyReply,
    @Param('registration_id') registration_id: string,
  ) {
    await this.registrationService.deleteRegistration(registration_id);
    reply.send({ message: 'Unregistered from event successfully' });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsersRegistrations(
    @Res() reply: FastifyReply,
    @Req() request: AuthenticatedRequest,
  ) {
    const response = await this.registrationService.getUsersRegistrations(
      request.user.uid,
    );
    reply.send(response);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/past')
  async getUsersPastRegistrations(
    @Res() reply: FastifyReply,
    @Req() request: AuthenticatedRequest,
  ) {
    const response = await this.registrationService.getPastRegistrations(
      request.user.uid,
    );
    reply.send(response);
  }
}
