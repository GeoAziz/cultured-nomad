// scripts/seed.mjs
import admin from 'firebase-admin';
import { faker } from '@faker-js/faker';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore();
const auth = getAuth();
const defaultPassword = 'password123';

const seedCollection = async (collectionName, data) => {
  console.log(`Seeding ${collectionName}...`);
  for (const item of data) {
    try {
      // 1. Create the user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: item.email,
        emailVerified: true,
        password: defaultPassword,
        displayName: item.name,
        photoURL: item.avatar,
        disabled: false,
      });

      console.log(`Successfully created new user: ${item.name} (${userRecord.uid})`);

      // 2. Create the user document in Firestore, using the UID from Auth
      const docRef = db.collection(collectionName).doc(userRecord.uid);
      await docRef.set({
        ...item,
        uid: userRecord.uid, // Ensure UID is stored in Firestore
        joinedAt: new Date(),
      });

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`Skipping: User with email ${item.email} already exists.`);
      } else {
        console.error(`Error creating user ${item.name}:`, error);
      }
    }
  }
  console.log(`Seeding for ${collectionName} complete.`);
};

const createUsers = () => {
  const roles = ['admin', 'mentor', 'member'];
  const userCounts = { admin: 2, mentor: 3, member: 5 };
  const users = [];

  roles.forEach(role => {
    for (let i = 0; i < userCounts[role]; i++) {
        const name = faker.person.fullName();
        users.push({
            name: name,
            email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
            avatar: faker.image.avatar(),
            role: role,
            bio: faker.person.bio(),
            interests: [faker.word.noun(), faker.word.noun(), faker.word.noun()],
            isMentor: role === 'mentor',
            industry: faker.person.jobArea(),
        });
    }
  });
  return users;
};

const createEvents = () => {
  const events = [];
  for (let i = 0; i < 5; i++) {
    events.push({
      title: faker.company.catchPhrase(),
      date: faker.date.future(),
      type: faker.helpers.arrayElement(['Workshop', 'Mixer', 'Fireside Chat']),
      host: faker.person.fullName(),
      image: `https://placehold.co/600x400.png`,
      dataAiHint: 'conference event'
    });
  }
  return events;
};

const createStories = () => {
  const stories = [];
  const moods = ['Wins', 'Fails', 'Lessons', 'Real Talk'];
  for (let i = 0; i < 10; i++) {
     const isAnon = faker.datatype.boolean();
     stories.push({
      title: faker.lorem.sentence(5),
      content: faker.lorem.paragraphs(3),
      excerpt: faker.lorem.paragraph(),
      tags: [faker.lorem.word(), faker.lorem.word()],
      mood: faker.helpers.arrayElement(moods),
      isAnonymous: isAnon,
      userId: faker.string.uuid(),
      author: isAnon ? "Anonymous Nomad" : faker.person.fullName(),
      avatar: isAnon ? "https://placehold.co/50x50.png" : faker.image.avatar(),
      createdAt: new Date(),
      likes: faker.number.int({ min: 0, max: 150 }),
      commentCount: faker.number.int({ min: 0, max: 20 }),
     })
  }
  return stories;
}

const seedDatabase = async () => {
  console.log('Starting database seed...');
  
  const usersToSeed = createUsers();
  const eventsToSeed = createEvents();
  const storiesToSeed = createStories();

  await seedCollection('users', usersToSeed);
  await seedCollection('events', eventsToSeed);
  await seedCollection('stories', storiesToSeed);

  console.log('---------------------------------');
  console.log('Database seeding finished!');
  console.log('You can now log in with the following credentials:');
  console.log('Default Password for all users:', defaultPassword);
  console.log('---------------------------------');
  process.exit(0);
};

seedDatabase().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
