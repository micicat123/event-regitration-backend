import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from 'src/auth/auth.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly authService: AuthService,
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    required: false,
  })
  @Post(':folder/:id?')
  async create(
    @Req() request,
    @Res() response: FastifyReply,
    @Param('folder') folder: string,
    @Param('id') id?: string,
  ) {
    try {
      const user_id: string = await this.authService.userId(request);
      let s3Key;

      if (folder != 'events' && folder != 'profile_pictures') {
        response.status(400);
        response.send('Invalid folder');
      } else {
        //delete current image if any
        if (folder == 'events') {
          s3Key = await this.uploadService.getEventImageKey(id);
        } else {
          s3Key = await this.uploadService.getUserImageKey(user_id);
        }
        if (s3Key != '') {
          await this.uploadService.deleteImage(s3Key);
        }

        //upload new image
        const key = await this.uploadService.uploadFile(
          request.body.file.data,
          request.body.file.name,
          folder,
          request.body.file.mimetype,
        );

        //update database
        if (folder == 'events') {
          await this.uploadService.updateEvent(key, id);
        } else {
          await this.uploadService.updateUser(key, user_id);
        }

        response.status(201);
        response.send('image successfully uploaded');
      }
    } catch (error) {
      response.status(500);
      response.send(`Failed to upload image file: ${error.message}`);
    }
  }

  @ApiParam({
    name: 'id',
    required: false,
  })
  @Get(':folder/:id?')
  async get(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Param('folder') folder: string,
    @Param('id') id?: string,
  ) {
    if (folder != 'events' && folder != 'profile_pictures') {
      response.status(400);
      response.send('Invalid folder');
    } else {
      let s3Key: string;

      if (folder == 'profile_pictures') {
        const user_id: string = await this.authService.userId(request);
        s3Key = await this.uploadService.getUserImageKey(user_id);
      } else {
        s3Key = await this.uploadService.getEventImageKey(id);
      }

      try {
        const image: any = await this.uploadService.retrieveImage(s3Key);
        response.header('Content-Type', image.Metadata['contenttype']);
        response.send(image.Body);
      } catch (error) {
        console.error(error);
        response.status(500);
        response.send(`Failed to retrieve image: ${error.message}`);
      }
    }
  }
}
