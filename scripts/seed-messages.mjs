// Script to clean up all messages and seed new valid messages for mentors and seekers
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const mentors = [
  { uid: 'AHk45V1bWmeRnYwvIv1YxOf7rZX2', name: 'Kristi.Waelchi1' },
  { uid: 'nTUgokVQbCMGSAvSszykvK824GJ2', name: 'Kayla.Cremin' },
];
const seekers = [
  { uid: 'mentee1', name: 'alice.seeker' },
  { uid: 'mentee2', name: 'bob.seeker' },
];

async function cleanupMessages() {
  const messagesRef = db.collection('messages');
  const snapshot = await messagesRef.get();
  let deleted = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    deleted++;
  }
  console.log(`Deleted ${deleted} existing messages.`);
}

async function seedMessages() {
  let created = 0;
  for (const mentor of mentors) {
    for (const seeker of seekers) {
      // Mentor to seeker
      await db.collection('messages').add({
        from: mentor.uid,
        to: seeker.uid,
        content: `Hello ${seeker.name}, this is ${mentor.name}!`,
        timestamp: new Date(),
        read: false,
        participants: [mentor.uid, seeker.uid].sort(),
      });
      // Seeker to mentor
      await db.collection('messages').add({
        from: seeker.uid,
        to: mentor.uid,
        content: `Hi ${mentor.name}, this is ${seeker.name}.`,
        timestamp: new Date(),
        read: false,
        participants: [mentor.uid, seeker.uid].sort(),
      });
      created += 2;
    }
  }
  console.log(`Created ${created} new messages for mentors and seekers.`);
}

async function main() {
  console.log('Cleaning up all existing messages...');
  await cleanupMessages();
  console.log('Seeding new valid messages for mentors and seekers...');
  await seedMessages();
  console.log('Done!');
}

main().catch(err => {
  console.error('Script error:', err);
});
