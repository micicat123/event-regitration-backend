import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import firebase from 'firebase/compat/app';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from 'fastify-cookie';
import * as dotenv from 'dotenv';
import multipart from '@fastify/multipart';
import { adminConfig, firebaseConfig } from './common/firebase.config';
dotenv.config();

const initSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Event registration')
    .setDescription('Event registration API')
    .setVersion('1.0')
    .addTag('Event registration')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  firebase.initializeApp(firebaseConfig);

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  initSwagger(app);
  app.enableCors();
  app.register(fastifyCookie);
  app.register(multipart);

  await app.listen(8000);
}
bootstrap();
