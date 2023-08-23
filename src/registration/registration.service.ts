import { Injectable } from '@nestjs/common';
import {
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
        let registrationId: string | null = null;
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().eventId === eventId) {
            registrationId = childSnapshot.key;
          }
        });

        eventData.push({
          eventId: eventId,
          registrationId: registrationId,
          eventData: data,
        });
      });
      await Promise.all(promises);
      return eventData;
    } catch (error) {
      console.error('Error retrieving registrations:', error);
      throw error;
    }
  }

  async getPastRegistrations(user_id) {
    try {
      const db = getDatabase();

      const registrationsRef = ref(db, 'registrations');
      const registrationQuery = query(
        registrationsRef,
        orderByChild('userId'),
        equalTo(user_id),
      );
      const snapshot = await get(registrationQuery);

      const eventRegistrations = [];
      snapshot.forEach((childSnapshot) => {
        const eventData = childSnapshot.val();
        eventRegistrations.push({
          eventId: eventData.eventId,
          registrationId: childSnapshot.key,
        });
      });

      const eventData = [];

      for (const { eventId, registrationId } of eventRegistrations) {
        const eventRef = ref(db, `events/${eventId}`);
        const eventSnapshot = await get(eventRef);
        const event = eventSnapshot.val();

        const currentDate = new Date().toISOString().split('T')[0];

        if (event.date < currentDate) {
          eventData.push({
            eventId: eventId,
            registrationId: registrationId,
            eventData: event,
          });
        }
      }

      return eventData;
    } catch (error) {
      console.error('Error retrieving registrations:', error);
      throw error;
    }
  }
}
