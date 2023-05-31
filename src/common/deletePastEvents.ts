import { DataSnapshot, getDatabase, ref, remove } from 'firebase/database';

export async function deletePastEvents(snapshot: DataSnapshot) {
  try {
    const eventArray = [];
    const db = getDatabase();
    const currentTime = Date.now();

    snapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();
      const eventDate = new Date(eventData.date);

      if (eventDate.getTime() < currentTime) {
        const eventKey = childSnapshot.key;
        const eventRef = ref(db, 'events/' + eventKey);
        remove(eventRef);
      } else {
        eventArray.push(eventData);
      }
    });

    return eventArray;
  } catch (error) {
    throw error;
  }
}
