import { Injectable } from '@nestjs/common';
import {
  DataSnapshot,
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  remove,
  set,
} from 'firebase/database';
import { getArrayFromSnap } from 'src/common/getArrayFromSnapshot';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegistrationService {
  async addRegistration(event_id: string, user_id: string): Promise<void> {
    const db = getDatabase();
    const registration_id = uuidv4();

    await set(ref(db, 'registrations/' + registration_id), {
      eventId: event_id,
      userId: user_id,
    });
  }

  async deleteRegistration(registration_id: string): Promise<void> {
    const db = getDatabase();
    const eventRef = ref(db, 'registrations/' + registration_id);
    await remove(eventRef);
  }

  async getUsersRegistrations(user_id: string) {
    try {
      const db = getDatabase();

      const registrationsRef = ref(db, 'registrations');
      const registrationQuery = query(
        registrationsRef,
        orderByChild('userId'),
        equalTo(user_id),
      );
      const snapshot = await get(registrationQuery);

      const event_ids: string[] = [];
      snapshot.forEach((childSnapshot) => {
        const eventData = childSnapshot.val();
        event_ids.push(eventData.eventId);
      });

      const eventData = [];

      const promises = event_ids.map(async (eventId) => {
        const eventRef = ref(db, 'events/' + eventId);
        const data = await get(eventRef);
        eventData.push(data);
      });
      await Promise.all(promises);
      return eventData;
    } catch (error) {
      console.error('Error retrieving registrations:', error);
      throw error;
    }
  }
}
