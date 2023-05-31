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
import { AuthService } from 'src/auth/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUpdateEventDto } from './dto/create-update-event.dto';

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
    @Req() request: FastifyRequest,
  ) {
    const user_id: string = await this.authService.userId(request);
    await this.eventService.createEvent(createEventDto, user_id);
    reply.send('Event created successfully');
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
    reply.send('Event updated successfully');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getEventsByUserId(
    @Res() reply: FastifyReply,
    @Req() request: FastifyRequest,
  ) {
    const user_id: string = await this.authService.userId(request);
    const response = await this.eventService.getEventsByUserId(user_id);
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
}
