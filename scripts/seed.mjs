// @ts-check
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

// --- CONFIGURATION ---
const USER_COUNT = 15;
const STORIES_PER_USER = 2;
const EVENT_COUNT = 5;
const DEFAULT_PASSWORD = 'password123';
// --- END CONFIGURATION ---

console.log('--- 🚀 Starting Zizo System Seed Script ---');

// Initialize Firebase Admin SDK
// This requires you to have a service account key file and the path set in your .env
// GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json
try {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error(
    '❌ Firebase Admin SDK initialization failed. Make sure you have a serviceAccountKey.json and have set the GOOGLE_APPLICATION_CREDENTIALS environment variable in a .env file.'
  );
  console.error(error);
  process.exit(1);
}

const auth = getAuth();
const db = getFirestore();

/**
 * Creates a batch of users in Firebase Authentication.
 * @param {number} count The number of users to create.
 * @returns {Promise<Array<{uid: string, email: string, password: string}>>}
 */
async function createAuthUsers(count) {
  console.log(`\n--- 🧍 Creating ${count} users in Firebase Auth... ---`);
  const userPromises = [];
  const userCredentials = [];

  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const password = DEFAULT_PASSWORD;
    const name = faker.person.fullName();
    
    const userPromise = auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
      disabled: false,
    }).then(userRecord => {
        console.log(`   -> Auth user created: ${email}`);
        userCredentials.push({ uid: userRecord.uid, email, password, name });
    }).catch(error => {
        console.error(`   -> Error creating auth user ${email}:`, error.message);
    });
    userPromises.push(userPromise);
  }

  await Promise.all(userPromises);
  console.log(`✅ Auth user creation complete. Total created: ${userCredentials.length}`);
  return userCredentials;
}

/**
 * Creates user profile documents in Firestore.
 * @param {Array<{uid: string, email: string, name: string}>} users
 */
async function createFirestoreUsers(users) {
    console.log(`\n--- 📝 Creating ${users.length} user profiles in Firestore... ---`);
    const batch = db.batch();

    const roles = ['Mentor', 'Techie', 'Seeker'];
    const industries = ['Tech', 'Fintech', 'Creative', 'Healthcare', 'AI/ML', 'Fashion'];

    users.forEach(user => {
        const userRef = db.collection('users').doc(user.uid);
        const role = faker.helpers.arrayElement(roles);
        
        batch.set(userRef, {
            uid: user.uid,
            name: user.name,
            email: user.email,
            avatar: faker.image.avatar(),
            banner: 'https://placehold.co/1200x400.png',
            dataAiHintBanner: 'abstract purple',
            role: role,
            industry: faker.helpers.arrayElement(industries),
            bio: faker.lorem.paragraph(),
            isMentor: role === 'Mentor',
            joinedAt: new Date(),
        });
    });

    await batch.commit();
    console.log('✅ Firestore user profiles created successfully.');
}

/**
 * Creates stories for users.
 * @param {Array<{uid: string, name: string, avatar: string}>} users
 */
async function createStories(users) {
    console.log(`\n--- 📖 Creating stories for users... ---`);
    const batch = db.batch();
    const moods = ['Wins', 'Fails', 'Lessons', 'Real Talk'];

    users.forEach(user => {
        for(let i=0; i<STORIES_PER_USER; i++) {
            const storyRef = db.collection('stories').doc();
            batch.set(storyRef, {
                userId: user.uid,
                author: user.name,
                avatar: `https://i.pravatar.cc/150?u=${user.email}`,
                title: faker.lorem.sentence(),
                excerpt: faker.lorem.sentences(2),
                content: faker.lorem.paragraphs(3),
                mood: faker.helpers.arrayElement(moods),
                likes: faker.number.int({ min: 0, max: 150 }),
                commentCount: faker.number.int({ min: 0, max: 20 }),
                createdAt: faker.date.recent({ days: 30 }),
            });
        }
    });

    await batch.commit();
    console.log('✅ Stories created successfully.');
}

/**
 * Creates events.
 * @param {Array<{uid: string, name: string}>} users
 */
async function createEvents(users) {
     console.log(`\n--- 🗓️ Creating ${EVENT_COUNT} events... ---`);
     const batch = db.batch();
     const eventTypes = ['Workshop', 'Mixer', 'Fireside Chat', 'Demo Day'];
     const eventImages = [
         { url: 'https://placehold.co/600x400.png', hint: 'people networking' },
         { url: 'https://placehold.co/600x400.png', hint: 'woman coding' },
         { url: 'https://placehold.co/600x400.png', hint: 'conference stage' },
         { url: 'https://placehold.co/600x400.png', hint: 'virtual reality' },
     ]

     for (let i = 0; i < EVENT_COUNT; i++) {
        const eventRef = db.collection('events').doc();
        const randomHost = faker.helpers.arrayElement(users);
        const randomImage = faker.helpers.arrayElement(eventImages);

        batch.set(eventRef, {
            title: faker.company.catchPhrase(),
            date: faker.date.future({ years: 0.5 }),
            type: faker.helpers.arrayElement(eventTypes),
            host: randomHost.name,
            hostId: randomHost.uid,
            image: randomImage.url,
            dataAiHint: randomImage.hint,
        });
     }
     await batch.commit();
     console.log('✅ Events created successfully.');
}


/**
 * Main seeding function.
 */
async function main() {
  const users = await createAuthUsers(USER_COUNT);

  if(users.length > 0) {
    await createFirestoreUsers(users);
    await createStories(users);
    await createEvents(users);

    console.log('\n\n--- ✅ SEEDING COMPLETE ---');
    console.log('Below are the credentials for the newly created users.');
    console.log('You can now use these to log in and test the application.');
    console.table(users.map(u => ({ email: u.email, password: u.password, uid: u.uid })));
    console.log('---------------------------\n');
  } else {
    console.log('\n--- ⚠️ No users were created. Halting script. ---');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('❌ An unexpected error occurred during the seeding process:');
  console.error(error);
  process.exit(1);
});