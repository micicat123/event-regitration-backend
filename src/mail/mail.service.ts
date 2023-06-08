import { Injectable } from '@nestjs/common';
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
} from 'firebase/database';
import * as admin from 'firebase-admin';
import { deletePastEvents } from '../common/deletePastEvents';

@Injectable()
export class MailService {
  async sendEmails(): Promise<void> {
    const db = getDatabase();
    deletePastEvents();

    //get event ids that will start tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];

    const eventsRef = ref(db, 'events');
    const eventsQuery = query(
      eventsRef,
      orderByChild('date'),
      equalTo(formattedDate),
    );
    const eventsSnapshot = await get(eventsQuery);
    const eventsArray = [];
    eventsSnapshot.forEach((childSnapshot) => {
      eventsArray.push(childSnapshot.key);
    });

    //get user ids that are registered to events starting tommorow
    const registrationsRef = ref(db, 'registrations');
    const registrationsQuery = query(registrationsRef, orderByChild('eventId'));
    const registrationsSnapshot = await get(registrationsQuery);

    const userIdsSet = new Set<string>();
    registrationsSnapshot.forEach((registration) => {
      const eventId = registration.val().eventId;
      if (eventsArray.includes(eventId)) {
        userIdsSet.add(registration.val().userId);
      }
    });
    const userIds: string[] = Array.from(userIdsSet);

    //for each user id get email
    const emails = [];
    for (const user_id of userIds) {
      const user = await admin.auth().getUser(user_id);
      emails.push(user.email);
    }

    //send all emails
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    for (const email of emails) {
      const msg = {
        to: email,
        from: 'noreplay.mici@gmail.com',
        subject: 'Nextup event starts tomorrow',
        text: `Hello,

Just a friendly reminder that the Nextup event will start tomorrow, ${formattedDate}.

Make sure to mark your calendar and don't miss out on this exciting opportunity. 

If you have any questions or need further information, feel free to reach out to us.

Thank you for your attention, and we hope to see you at the Nextup event.

Best regards,
Marcel Zep
Event Coordinator`,
        html: `<p>Hello,</p>

<p>Just a friendly reminder that the Nextup event will start tomorrow, <strong>${formattedDate}</strong>.</p>
<p>Make sure to mark your calendar and don't miss out on this exciting opportunity.</p>
<p>If you have any questions or need further information, feel free to reach out to us.</p>
<p>Thank you for your attention, and we hope to see you at the Nextup event.</p>
<p>Best regards,<br>
Marcel Zep<br>
Event Coordinator</p>
`,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log(`Email sent to ${email}`);
        })
        .catch((error) => {
          console.error(`Error sending email to ${email}:`, error);
        });
    }
  }
}
