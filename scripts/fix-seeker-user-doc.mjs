import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load Firebase config from your local file
const firebaseConfig = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp(firebaseConfig);
const db = getFirestore();

const seekerUIDs = ['mentee1', 'mentee2'];

async function fixSeekerUserDoc(uid) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      uid,
      role: 'SEEKER',
      name: `Seeker ${uid}`,
      email: '',
      avatar: 'https://placehold.co/150x150.png',
      bio: 'Auto-fixed seeker profile',
      interests: [],
      joinedAt: new Date(),
    });
    console.log(`Created new seeker user document for ${uid}.`);
  } else {
    const data = userDoc.data();
    if (data.role !== 'SEEKER') {
      await userRef.set({ ...data, role: 'SEEKER' }, { merge: true });
      console.log(`Updated user role to SEEKER for ${uid}.`);
    } else {
      console.log(`User document for ${uid} already exists and role is SEEKER.`);
    }
  }
}

async function main() {
  for (const uid of seekerUIDs) {
    await fixSeekerUserDoc(uid);
  }
  console.log('Seeker user docs fixed!');
}

main().catch(console.error);
