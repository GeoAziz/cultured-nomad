// Minimal script to test Firestore message query for mentor
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const mentorUid = 'AHk45V1bWmeRnYwvIv1YxOf7rZX2'; // Kristi.Waelchi1@hotmail.com

async function testQuery() {
  console.log('Testing Firestore query for mentor UID:', mentorUid);
  const messagesRef = db.collection('messages');
  const snapshot = await messagesRef.where('participants', 'array-contains', mentorUid).get();
  console.log('Query returned', snapshot.size, 'messages.');
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`Message ${doc.id}:`, {
      from: data.from,
      to: data.to,
      participants: data.participants,
      content: data.content,
      timestamp: data.timestamp
    });
  }
}

testQuery().catch(err => {
  console.error('Query error:', err);
});
