import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import firebase from 'firebase/compat/app';
import { ServiceAccount } from 'firebase-admin';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from 'fastify-cookie';
const fileUpload = require('fastify-file-upload');
import * as dotenv from 'dotenv';
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

  const firebaseConfig = {
    apiKey: 'AIzaSyAEi8f6yu04JtKQA3Zc4of53B1wh3fe4Kc',
    authDomain: 'eventregistration-b5d62.firebaseapp.com',
    databaseURL:
      'https://eventregistration-b5d62-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'eventregistration-b5d62',
    storageBucket: 'eventregistration-b5d62.appspot.com',
    messagingSenderId: '895500668110',
    appId: '1:895500668110:web:608e893d71d88f38c0549f',
  };
  firebase.initializeApp(firebaseConfig);

  const adminConfig: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  initSwagger(app);
  app.enableCors();
  app.register(fastifyCookie);
  app.register(fileUpload);

  await app.listen(8000);
}
bootstrap();
