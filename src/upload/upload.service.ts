import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk/clients/all';
import { v4 as uuidv4 } from 'uuid';
import { get, getDatabase, ref, set } from 'firebase/database';
import * as admin from 'firebase-admin';
import { JwtService } from '@nestjs/jwt';

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3 = new S3({
  region: 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

@Injectable()
export class UploadService {
  constructor(private readonly jwtService: JwtService) {}

  async uploadFile(
    dataBuffer: Buffer,
    fileName: string,
    folder: string,
    fileType: string,
  ): Promise<string> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: AWS_S3_BUCKET_NAME,
        Body: dataBuffer,
        Key: `EventRegistration/${folder}/${uuidv4()}-${fileName}`,
        Metadata: { contentType: fileType },
      })
      .promise();

    return uploadResult.Key;
  }

  async retrieveImage(key: string) {
    try {
      const object = await s3
        .getObject({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: key,
        })
        .promise();

      return object;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to retrieve image file: ${error}`);
    }
  }

  async deleteImage(key: string) {
    try {
      const object = await s3
        .deleteObject({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: key,
        })
        .promise();

      return object;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to retrieve image file: ${error}`);
    }
  }

  //updating image fields in db
  async updateEvent(key: string, event_id: string) {
    const db = getDatabase();
    const eventRef = ref(db, 'events/' + event_id);

    const snapshot = await get(eventRef);
    const eventData = snapshot.val();

    set(eventRef, {
      eventName: eventData.eventName,
      location: eventData.location,
      date: eventData.date,
      hour: eventData.hour,
      maxUsers: eventData.maxUsers,
      description: eventData.description,
      image: key,
      userId: eventData.userId,
    });
  }

  async updateUser(key: string, user_id: string) {
    await admin.auth().setCustomUserClaims(user_id, { photoKey: key });
  }

  //getting image key from db
  async getEventImageKey(event_id: string) {
    const db = getDatabase();
    const eventRef = ref(db, 'events/' + event_id);

    const snapshot = await get(eventRef);
    const eventData = snapshot.val();
    return eventData.image;
  }

  async getUserImageKey(user_id: string) {
    const user = await admin.auth().getUser(user_id);
    try {
      return user.customClaims.photoKey;
    } catch (error) {
      return '';
    }
  }
}
