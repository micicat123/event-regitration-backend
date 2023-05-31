import { Injectable } from '@nestjs/common';
import {
  DataSnapshot,
  child,
  endAt,
  equalTo,
  get,
  getDatabase,
  limitToFirst,
  onValue,
  orderByChild,
  orderByValue,
  query,
  ref,
  set,
  startAfter,
  startAt,
} from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { CreateUpdateEventDto } from './dto/create-update-event.dto';
import firebase from 'firebase/compat/app';
import { getArrayFromSnap } from 'src/common/getArrayFromSnapshot';

@Injectable()
export class EventService {
  async createEvent(
    createEventDto: CreateUpdateEventDto,
    user_id: string,
  ): Promise<void> {
    const db = getDatabase();
    const event_id = uuidv4();

    set(ref(db, 'events/' + event_id), {
      eventName: createEventDto.eventName,
      location: createEventDto.location,
      date: createEventDto.date,
      hour: createEventDto.hour,
      maxUsers: createEventDto.maxUsers,
      description: createEventDto.description,
      image: '',
      userId: user_id,
    });

    set(ref(db, 'users/' + user_id + '/events/' + event_id), true);
  }

  async updateEvent(updateEventDto: CreateUpdateEventDto, event_id: string) {
    const db = getDatabase();
    const eventRef = ref(db, 'events/' + event_id);

    const snapshot = await get(eventRef);
    const eventData = snapshot.val();

    set(eventRef, {
      eventName: updateEventDto.eventName,
      location: updateEventDto.location,
      date: updateEventDto.date,
      hour: updateEventDto.hour,
      maxUsers: updateEventDto.maxUsers,
      description: updateEventDto.description,
      image: eventData.image,
      userId: eventData.userId,
    });
  }

  async getEventsByUserId(user_id: string) {
    try {
      const db = getDatabase();

      const eventsRef = ref(db, 'events');
      const eventsQuery = query(
        eventsRef,
        orderByChild('userId'),
        equalTo(user_id),
      );
      const snapshot = await get(eventsQuery);

      const eventArray = await getArrayFromSnap(snapshot);

      eventArray.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      return eventArray;
    } catch (error) {
      console.error('Error retrieving events:', error);
      throw error;
    }
  }

  async getUpcomingEvents(last_date: string) {
    try {
      const db = getDatabase();

      const eventsRef = ref(db, 'events');
      let eventsQuery;
      if (last_date == '0') {
        eventsQuery = query(eventsRef, orderByChild('date'), limitToFirst(7));
      } else {
        eventsQuery = query(
          eventsRef,
          orderByChild('date'),
          limitToFirst(7),
          startAfter(last_date),
        );
      }

      const snapshot = await get(eventsQuery);
      const eventArray = await getArrayFromSnap(snapshot);
      return eventArray;
    } catch (error) {
      console.error('Error retrieving events:', error);
      throw error;
    }
  }
}
