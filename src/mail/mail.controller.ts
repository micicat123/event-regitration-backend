import { Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendEmails(@Res() reply: FastifyReply) {
    await this.mailService.sendEmails();
    reply.status(200);
    reply.send({ message: 'Mails sent successfully.' });
  }
}
