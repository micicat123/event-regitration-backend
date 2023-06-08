import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import firebase from 'firebase/compat/app';
import {
  adminConfigTest,
  firebaseConfigTest,
} from '../src/common/firebase.config';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { get, getDatabase, query, ref, remove, set } from 'firebase/database';
const FormData = require('form-data');
const fs = require('fs');
dotenv.config();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    firebase.initializeApp(firebaseConfigTest);
    admin.initializeApp({
      credential: admin.credential.cert(adminConfigTest),
      databaseURL: process.env.TEST_FIREBASE_DATABASE_URL,
    });
    app = moduleFixture.createNestApplication();

    await app.init();
  });
  afterAll(async () => {
    //delete created user
    const user = await admin.auth().getUserByEmail('test@gmail.com');
    const userId: string = user.uid;
    await admin.auth().deleteUser(userId);

    //delete created event
    const database = getDatabase();
    const eventsRef = ref(database, 'events');
    const eventsQuery = query(eventsRef);
    const eventsSnapshot = await get(eventsQuery);
    eventsSnapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();
      if (eventData.location === 'Velenje, letni kino') {
        const eventKey = childSnapshot.key;
        const eventRef = ref(database, 'events/' + eventKey);
        remove(eventRef);
      }
    });

    //update changed event
    const updatedEventRef = ref(
      database,
      'events/' + '2952053d-28f8-4546-9165-c2179219c283',
    );
    const updatededEventsnapshot = await get(updatedEventRef);
    const eventData = updatededEventsnapshot.val();

    set(updatedEventRef, {
      eventName: 'testing event',
      location: eventData.location,
      date: eventData.date,
      hour: eventData.hour,
      maxUsers: eventData.maxUsers,
      description: eventData.description,
      image: eventData.image,
      userId: eventData.userId,
    });

    //delete registrations
    const eventRef = ref(database, 'registrations');
    await remove(eventRef);

    await app.close();
  });

  //AUTH ENDPOINTS
  describe('/auth/register (POST)', () => {
    it('should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@gmail.com',
          password: 'test123',
          passwordConfirm: 'test123',
          firstName: 'Testeron',
          lastName: 'Makaron',
        })
        .expect(201);
    });

    it('should return error because user already exists', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@gmail.com',
          password: 'test123',
          passwordConfirm: 'test123',
          firstName: 'Testeron',
          lastName: 'Makaron',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            `This email address is already in use.`,
          );
        });
    });

    it('should return error because email is not in correct format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test',
          password: 'test123',
          passwordConfirm: 'test123',
          firstName: 'Testeron',
          lastName: 'Makaron',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(`Email is badly formatted.`);
        });
    });

    it('should return error because passwords do not match', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test123@gmail.com',
          password: 'test',
          passwordConfirm: 'test123',
          firstName: 'Testeron',
          lastName: 'Makaron',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(`Passwords do not match.`);
        });
    });

    it('should return error because passwords is too short', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test123@gmail.com',
          password: '123',
          passwordConfirm: '123',
          firstName: 'Testeron',
          lastName: 'Makaron',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            `Password must be at least 6 characters long.`,
          );
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should return access_token of user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'mici.zep@gmail.com', password: '123456' })
        .expect(201)
        .then((res) => {
          const responseJson = JSON.parse(res.text);
          expect(responseJson.token).toBeDefined();
          userToken = responseJson.token;
        });
    });

    it('should return error because credentials are not correct', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'wrong', password: 'wrong' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(`Invalid username or password.`);
        });
    });

    it('should return error because email is not verified', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'test@gmail.com', password: 'test123' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            `Email not verified. Please check your email for verification instructions.`,
          );
        });
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should log the user out and return a success message', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('logged out');
        });
    });
  });

  //EVENT ENDPOINTS
  describe('/event (POST)', () => {
    it('should create a new event', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];

      return request(app.getHttpServer())
        .post('/event')
        .set('authorization', `Bearer ${userToken}`)
        .set('cookie', `jwt=${userToken}`)
        .send({
          eventName: 'testing event',
          location: 'Velenje, letni kino',
          date: formattedDate,
          hour: '12:12',
          maxUsers: 200,
          description: 'super event',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.event).toEqual({
            eventName: 'testing event',
            location: 'Velenje, letni kino',
            date: formattedDate,
            hour: '12:12',
            maxUsers: 200,
            description: 'super event',
          });
        });
    });
  });

  describe('/event/event_id (PUT)', () => {
    it('should update an event', () => {
      return request(app.getHttpServer())
        .put('/event/2952053d-28f8-4546-9165-c2179219c283')
        .set('authorization', `Bearer ${userToken}`)
        .send({
          eventName: 'changed event name',
          location: 'testna lokacija',
          date: '9999-12-12',
          hour: '12:12',
          maxUsers: 200,
          description: 'event for testing',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.event).toEqual({
            eventName: 'changed event name',
            location: 'testna lokacija',
            date: '9999-12-12',
            hour: '12:12',
            maxUsers: 200,
            description: 'event for testing',
          });
        });
    });
  });

  describe('/event/user (GET)', () => {
    it('should return events posted by user', () => {
      return request(app.getHttpServer())
        .get('/event/user')
        .set('authorization', `Bearer ${userToken}`)
        .set('cookie', `jwt=${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
        });
    });
  });

  describe('/event/last_date (GET)', () => {
    it('should get upcoming events', () => {
      return request(app.getHttpServer())
        .get('/event/0')
        .set('authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined;
          expect(res.body.length).toBeLessThan(7);
        });
    });
  });

  describe('event/search/:location/:date (GET)', () => {
    it('should get upcoming events', () => {
      return request(app.getHttpServer())
        .get('/event/search/testna lokacija/9999-12-12')
        .set('authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toEqual({
            date: '9999-12-12',
            description: 'event for testing',
            eventName: 'changed event name',
            hour: '12:12',
            image: '',
            location: 'testna lokacija',
            maxUsers: 200,
            userId: '0uDB7ml5draoiiHVEkO1Yw0PqMz1',
          });
        });
    });
  });

  //REGISTRATION ENDPOINTS
  describe('/registration/event_id (POST)', () => {
    it('should create a new registration to event', () => {
      return request(app.getHttpServer())
        .post('/registration/2952053d-28f8-4546-9165-c2179219c283')
        .set('authorization', `Bearer ${userToken}`)
        .set('cookie', `jwt=${userToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toEqual('Registered to event successfully.');
        });
    });
  });

  describe('/registration/event_id (DELETE)', () => {
    it('should remove registration to event', () => {
      return request(app.getHttpServer())
        .delete('/registration/12345')
        .set('authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual(
            'Unregistered from event successfully',
          );
        });
    });
  });

  describe('/registration (GET)', () => {
    it('should get users registrations', () => {
      return request(app.getHttpServer())
        .get('/registration')
        .set('authorization', `Bearer ${userToken}`)
        .set('cookie', `jwt=${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toEqual({
            date: '9999-12-12',
            description: 'event for testing',
            eventName: 'changed event name',
            hour: '12:12',
            image: '',
            location: 'testna lokacija',
            maxUsers: 200,
            userId: '0uDB7ml5draoiiHVEkO1Yw0PqMz1',
          });
        });
    });
  });

  //MAIL ENDPOINT
  describe('/mail (POST)', () => {
    it('should send mails for all events starting tommorow', () => {
      return request(app.getHttpServer())
        .post('/mail')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual('Mails sent successfully.');
        });
    });
  });

  //UPLOAD ENDPOINTS
  describe('/upload (POST)', () => {
    it('shouldnt upload image, because of invalid repository', async () => {
      return request(app.getHttpServer())
        .post('/upload/wrongRepo')
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe('Invalid folder');
        });
    });
    /*
    it('should upload image to event folder in AWS S3', async () => {
      return request(app.getHttpServer())
        .post('/upload/events/2952053d-28f8-4546-9165-c2179219c283')
        .attach('file', './test/images/test.png')
        .expect(200)
        .then((response) => {
          expect(response.body.message).toBe('image successfully uploaded');
        });
    });*/
  });
});
