import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  remove,
} from 'firebase/database';

export async function deletePastEvents() {
  try {
    const deletedEventIds = [];
    const db = getDatabase();
    const eventsRef = ref(db, 'events');
    const eventsQuery = query(eventsRef);
    const snapshot = await get(eventsQuery);
    const currentTime = Date.now();

    snapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();
      const eventDate = new Date(eventData.date);

      if (eventDate.getTime() < currentTime) {
        const eventKey = childSnapshot.key;
        const eventRef = ref(db, 'events/' + eventKey);
        remove(eventRef);
        deletedEventIds.push(eventKey);
      }
    });

    /*
    for (const event_id of deletedEventIds) {
      const registrationsRef = ref(db, 'registrations/');
      const registrationsQuery = query(
        registrationsRef,
        orderByChild('eventId'),
        equalTo(event_id),
      );
      get(registrationsQuery).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const registrationKey = childSnapshot.key;
          const registrationRef = ref(db, `registrations/${registrationKey}`);
          remove(registrationRef);
        });
      });
    }*/
  } catch (error) {
    throw error;
  }
}
