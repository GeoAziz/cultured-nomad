
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

// --- Configuration ---
const TOTAL_ADMINS = 2;
const TOTAL_MENTORS = 3;
const TOTAL_MEMBERS = 5;
const DEFAULT_PASSWORD = 'password123';

// --- Initialize Firebase Admin SDK ---
try {
  initializeApp({
    credential: cert(serviceAccount),
  });
} catch (e) {
  if (e.code !== 'app/duplicate-app') {
    console.error('Firebase Admin SDK initialization error:', e);
    process.exit(1);
  }
}

const auth = getAuth();
const db = getFirestore();

// --- Data Generation ---
const generateUser = (role) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: `https://placehold.co/150x150.png`,
  role: role,
  bio: faker.lorem.paragraph(),
  interests: [faker.commerce.department(), faker.commerce.department()],
  industry: faker.company.bsNoun(),
  isMentor: role === 'mentor',
  joinedAt: new Date(),
  dataAiHint: 'woman portrait',
});

const admins = Array.from({ length: TOTAL_ADMINS }, () => generateUser('admin'));
const mentors = Array.from({ length: TOTAL_MENTORS }, () => generateUser('mentor'));
const members = Array.from({ length: TOTAL_MEMBERS }, () => generateUser('member'));
const allUsers = [...admins, ...mentors, ...members];

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log('--- Starting database seed ---');
  console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);

  for (const user of allUsers) {
    try {
      console.log(`\nProcessing user: ${user.email} (${user.role})`);

      // 1. Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: user.email,
        password: DEFAULT_PASSWORD,
        displayName: user.name,
        photoURL: user.avatar,
      });
      console.log(` -> Successfully created Auth user with UID: ${userRecord.uid}`);

      // 2. Create user document in Firestore
      const userDocRef = db.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        uid: userRecord.uid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        interests: user.interests,
        industry: user.industry,
        isMentor: user.isMentor,
        joinedAt: user.joinedAt,
        dataAiHint: user.dataAiHint,
      });
      console.log(` -> Successfully created Firestore document for UID: ${userRecord.uid}`);

    } catch (error) {
      console.error(`\n--- Seeding FAILED for user ${user.email} ---`);
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      // Stop the entire process if one user fails
      process.exit(1);
    }
  }

  console.log('\n--- Database seeded successfully! ---');
  console.log('Created a total of ' + allUsers.length + ' users.');
}

seedDatabase().catch((error) => {
  console.error('\n--- An unexpected error occurred during the seed process ---');
  console.error(error);
  process.exit(1);
});
