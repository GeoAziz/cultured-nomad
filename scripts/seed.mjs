
import {faker} from '@faker-js/faker';
import admin from 'firebase-admin';
import {config} from 'dotenv';

// Load environment variables from .env file
config();

// Initialize Firebase Admin SDK
// Make sure you have the serviceAccountKey.json in your project root
// and GOOGLE_APPLICATION_CREDENTIALS is set in your .env file.
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  console.error('----------------------------------------------------------------');
  console.error('🔥 Firebase Admin SDK initialization failed.');
  console.error('🔥 Please ensure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly.');
  console.error('🔥 You should have a .env file with: GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json');
  console.error('----------------------------------------------------------------');
  process.exit(1);
}


const auth = admin.auth();
const db = admin.firestore();

// --- CONFIGURATION ---
const USER_COUNT = 10; // Total number of users to create
const ADMIN_COUNT = 2; // Number of users to be admins
const MENTOR_COUNT = 3; // Number of users to be mentors
const PASSWORD = 'password123'; // Default password for all test users

const industries = ['Tech', 'Fintech', 'Creative', 'Healthcare', 'AI/ML', 'Fashion', 'Web3', 'Gaming'];
const interests = ['AI', 'Blockchain', 'UX/UI Design', 'VR/AR', 'Quantum Computing', 'Sustainability', 'Art', 'Music'];
const storyMoods = ['Wins', 'Fails', 'Lessons', 'Real Talk'];

const createUsers = async () => {
  console.log(`🌱 Starting to seed database with ${USER_COUNT} users...`);
  const userPromises = Array(USER_COUNT).fill(null).map(async (_, index) => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email({firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1]});

    try {
      // 1. Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password: PASSWORD,
        displayName: fullName,
        emailVerified: true,
      });

      // 2. Determine user role
      let role = 'member';
      let isMentor = false;
      if (index < ADMIN_COUNT) {
        role = 'admin';
        // Set custom claim for admin role
        await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
      } else if (index < ADMIN_COUNT + MENTOR_COUNT) {
        role = 'mentor';
        isMentor = true;
      }

      // 3. Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        name: fullName,
        email,
        avatar: `https://i.pravatar.cc/150?u=${userRecord.uid}`,
        role,
        bio: faker.lorem.paragraph(),
        industry: faker.helpers.arrayElement(industries),
        interests: faker.helpers.arrayElements(interests, {min: 2, max: 4}),
        joinedAt: admin.firestore.Timestamp.fromDate(faker.date.past()),
        isMentor,
        banner: `https://placehold.co/1200x400.png`,
        dataAiHint: 'woman portrait',
        dataAiHintBanner: 'abstract purple',
      });
      
      console.log(`✅ Created ${role}: ${email} (Password: ${PASSWORD}) (UID: ${userRecord.uid})`);
      return userRecord;
    } catch (error) {
      console.error(`❌ Failed to create user ${email}:`, error.message);
      return null;
    }
  });

  return (await Promise.all(userPromises)).filter(Boolean);
};

const createEvents = async () => {
    console.log('🌱 Seeding events...');
    const eventPromises = Array(5).fill(null).map(async () => {
        const event = {
            title: faker.company.catchPhrase(),
            date: admin.firestore.Timestamp.fromDate(faker.date.future()),
            type: faker.helpers.arrayElement(['Workshop', 'Mixer', 'Fireside Chat', 'Panel']),
            host: faker.person.fullName(),
            image: `https://placehold.co/600x400.png`,
            dataAiHint: faker.helpers.arrayElement(['business meeting', 'conference', 'presentation', 'workshop', 'networking event']),
        };
        await db.collection('events').add(event);
    });
    await Promise.all(eventPromises);
    console.log('✅ Events seeded.');
}

const createStories = async (users) => {
    if (users.length === 0) return;
    console.log('🌱 Seeding stories...');
    const storyPromises = Array(15).fill(null).map(async () => {
        const user = faker.helpers.arrayElement(users);
        const story = {
            title: faker.lorem.sentence(5),
            excerpt: faker.lorem.paragraph(2),
            content: faker.lorem.paragraphs(5),
            mood: faker.helpers.arrayElement(storyMoods),
            author: user.displayName,
            avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
            userId: user.uid,
            createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent()),
            likes: faker.number.int({ min: 0, max: 150 }),
            commentCount: faker.number.int({ min: 0, max: 45 }),
            dataAiHint: 'woman portrait',
        };
        await db.collection('stories').add(story);
    });
    await Promise.all(storyPromises);
    console.log('✅ Stories seeded.');
}


const seedDatabase = async () => {
  console.log('--- Starting Database Seed ---');
  const users = await createUsers();
  await createEvents();
  await createStories(users);
  console.log('--- Database Seed Finished ---');
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
