
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// --- CONFIGURATION ---
const BATCH_SIZE = 10; // Number of users to create per batch
const USERS_TO_CREATE = {
  admin: 2,
  mentor: 3,
  member: 5,
};

// --- INITIALIZE FIREBASE ADMIN ---
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const auth = getAuth();
const db = getFirestore();

// --- HELPER FUNCTIONS ---

const defaultPassword = 'password123';

const industries = ['Tech', 'Fintech', 'Creative', 'Healthcare', 'AI/ML', 'Fashion'];
const roles = ['Mentor', 'Techie', 'Seeker', 'Member']; // Expanded roles
const interests = ['Web3', 'AI Ethics', 'VR/AR', 'Sustainable Tech', 'UX Design'];
const getRole = (type) => {
    switch (type) {
        case 'admin': return 'admin';
        case 'mentor': return 'mentor';
        default: return faker.helpers.arrayElement(['member', 'techie', 'seeker']);
    }
}

/**
 * Creates a user in both Firebase Auth and Firestore.
 * @param {object} userData - The user data to create.
 * @returns {Promise<void>}
 */
async function createUser(userData) {
  const { email, name, role, isMentor } = userData;
  console.log(`Creating user: ${name} (${email}) with role ${role}`);
  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      emailVerified: true,
      password: defaultPassword,
      displayName: name,
      photoURL: `https://placehold.co/150x150.png?text=${name.charAt(0)}`,
    });
    console.log(`Successfully created Auth user: ${userRecord.uid}`);

    // 2. Create user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      uid: userRecord.uid,
      name,
      email,
      role,
      isMentor: !!isMentor,
      avatar: userRecord.photoURL,
      industry: faker.helpers.arrayElement(industries),
      bio: `A passionate ${role} in the ${industries[Math.floor(Math.random() * industries.length)]} space. Eager to connect and grow with the sisterhood!`,
      interests: faker.helpers.arrayElements(interests, 3),
      joinedAt: new Date(),
      banner: 'https://placehold.co/1200x400.png',
      dataAiHint: 'woman portrait'
    });
    console.log(`Successfully created Firestore doc for: ${name}`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
        console.warn(`User with email ${email} already exists. Skipping.`);
    } else {
        console.error('Error creating user:', name, error);
    }
  }
}

// --- MAIN SEEDING LOGIC ---

async function seedDatabase() {
  console.log('--- Starting database seed ---');

  const allUsers = [];

  // Generate Admins
  for (let i = 0; i < USERS_TO_CREATE.admin; i++) {
    allUsers.push({
      name: faker.person.fullName(),
      email: faker.internet.email({firstName: 'Admin'}).toLowerCase(),
      role: 'admin',
      isMentor: false,
    });
  }

  // Generate Mentors
  for (let i = 0; i < USERS_TO_CREATE.mentor; i++) {
    allUsers.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: 'mentor',
      isMentor: true,
    });
  }

  // Generate Members
  for (let i = 0; i < USERS_TO_CREATE.member; i++) {
    allUsers.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: getRole('member'),
      isMentor: false,
    });
  }
  
  console.log(`Generated ${allUsers.length} total users. Now creating in batches...`);
  
  // Create users in batches
  for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
    const batch = allUsers.slice(i, i + BATCH_SIZE);
    console.log(`--- Processing batch ${i / BATCH_SIZE + 1} ---`);
    await Promise.all(batch.map(user => createUser(user)));
  }

  console.log('--- Database seeding complete! ---');
  console.log(`\nDefault password for all users is: ${defaultPassword}\n`);
}

seedDatabase().catch(error => {
  console.error('An unexpected error occurred during seeding:', error);
});
