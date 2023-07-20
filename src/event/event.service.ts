import { Injectable } from '@nestjs/common';
import {
  equalTo,
  get,
  getDatabase,
  limitToFirst,
  orderByChild,
  query,
  ref,
  set,
  startAfter,
  startAt,
} from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { CreateUpdateEventDto } from './dto/create-update-event.dto';
import { getArrayFromSnap } from '../common/getArrayFromSnapshot';

@Injectable()
export class EventService {
  async createEvent(
    createEventDto: CreateUpdateEventDto,
    user_id: string,
  ): Promise<void> {
    const db = getDatabase();
    const event_id = uuidv4();

    await set(ref(db, 'events/' + event_id), {
      eventName: createEventDto.eventName,
      location: createEventDto.location,
      date: createEventDto.date,
      hour: createEventDto.hour,
      maxUsers: createEventDto.maxUsers,
      description: createEventDto.description,
      image: '',
      userId: user_id,
    });

    //send email notification
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    admin
      .auth()
      .listUsers()
      .then((listUsersResult) => {
        listUsersResult.users.forEach((user) => {
          const msg = {
            to: user.email,
            from: 'noreplay.mici@gmail.com',
            subject: `New event: ${createEventDto.eventName}`,
            text: `Hello,

We are excited to announce a new event: ${createEventDto.eventName}!

Date: ${createEventDto.date}
Time: ${createEventDto.hour}
Location: ${createEventDto.location}

This event is a fantastic opportunity to go out and be yourself. We have limited spots available, so make sure to mark your calendar and secure your spot.

If you have any questions or need further information, feel free to reach out to us.

Thank you for your attention, and we look forward to seeing you at the event.

Best regards,
Marcel Zep
Event Coordinator`,
            html: `<p>Hello,</p>

<p>We are excited to announce a new event: <strong>${createEventDto.eventName}</strong>!</p>
<p><strong>Date:</strong> ${createEventDto.date}</p>
<p><strong>Time:</strong> ${createEventDto.hour}</p>
<p><strong>Location:</strong> ${createEventDto.location}</p>
<p>This event is a fantastic opportunity to go out and be yourself. We have limited spots available, so make sure to mark your calendar and secure your spot.</p>
<p>If you have any questions or need further information, feel free to reach out to us.</p>
<p>Thank you for your attention, and we look forward to seeing you at the event.</p>
<p>Best regards,<br>
Marcel Zep<br>
Event Coordinator</p>
`,
          };
          sgMail
            .send(msg)
            .then(() => {
              console.log(`Email sent to ${user.email}`);
            })
            .catch((error) => {
              console.error(`Error sending email to ${user.email}:`, error);
            });
        });
      })
      .catch((error) => {
        console.log('Error fetching users:', error);
      });*/
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

  async getSearchedEvents(location: string, date: string) {
    try {
      const db = getDatabase();

      const eventsRef = ref(db, 'events');
      const dateQuery = query(eventsRef, orderByChild('date'), startAt(date));
      const snapshot = await get(dateQuery);
      const filteredEvents = [];
      snapshot.forEach((childSnapshot) => {
        const eventId = childSnapshot.key;
        const eventData = childSnapshot.val();
        const lowercaseLocation = location.toLowerCase();
        const lowercaseEventDataLocation = eventData.location.toLowerCase();
        if (lowercaseEventDataLocation.includes(lowercaseLocation)) {
          const eventWithId = { id: eventId, ...eventData };
          filteredEvents.push(eventWithId);
        }
      });
      const limitedEvents = filteredEvents.slice(0, 15);
      return limitedEvents;
    } catch (error) {
      console.error('Error retrieving events:', error);
      throw error;
    }
  }
}
