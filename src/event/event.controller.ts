import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUpdateEventDto } from './dto/create-update-event.dto';
import { AuthenticatedRequest } from 'src/interfaces/authenticatedRequest';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createEvent(
    @Body() createEventDto: CreateUpdateEventDto,
    @Res() reply: FastifyReply,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.eventService.createEvent(createEventDto, request.user.uid);
    const createdEvent = {
      eventName: createEventDto.eventName,
      location: createEventDto.location,
      date: createEventDto.date,
      hour: createEventDto.hour,
      maxUsers: createEventDto.maxUsers,
      description: createEventDto.description,
    };
    reply.send({ event: createdEvent });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':event_id')
  async updateEvent(
    @Body() updateEventDto: CreateUpdateEventDto,
    @Res() reply: FastifyReply,
    @Param('event_id') event_id: string,
  ) {
    await this.eventService.updateEvent(updateEventDto, event_id);
    const updatedEvent = {
      eventName: updateEventDto.eventName,
      location: updateEventDto.location,
      date: updateEventDto.date,
      hour: updateEventDto.hour,
      maxUsers: updateEventDto.maxUsers,
      description: updateEventDto.description,
    };
    reply.send({ event: updatedEvent });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getEventsByUserId(
    @Res() reply: FastifyReply,
    @Req() request: AuthenticatedRequest,
  ) {
    const response = await this.eventService.getEventsByUserId(
      request.user.uid,
    );
    reply.send(response);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':last_date')
  async getUpcomingEvents(
    @Res() reply: FastifyReply,
    @Param('last_date') lastDate: string,
  ) {
    const response = await this.eventService.getUpcomingEvents(lastDate);
    reply.send(response);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('search/:location/:date')
  async getSearchedEvents(
    @Res() reply: FastifyReply,
    @Param('location') location: string,
    @Param('date') date: string,
  ) {
    const response = await this.eventService.getSearchedEvents(location, date);
    reply.send(response);
  }
}
