import { DataSnapshot } from 'firebase/database';

export async function getArrayFromSnap(snapshot: DataSnapshot) {
  try {
    const eventArray = [];
    snapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();
      eventArray.push(eventData);
    });
    return eventArray;
  } catch (error) {
    throw error;
  }
}
