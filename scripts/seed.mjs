
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import the service account key
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log('--- Starting database seed ---');

  try {
    // 1. Read users from the users.md file
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const usersPath = resolve(__dirname, '../src/lib/users.md');
    const usersFile = await readFile(usersPath, 'utf-8');
    const usersToCreate = usersFile
      .split('\n')
      .filter(line => line.trim() !== '') // Skip empty lines
      .map(line => {
        const [email, name, role] = line.split(',').map(s => s.trim());
        return { email, name, role };
      });

    if (usersToCreate.length === 0) {
      console.log('No users found in users.md. Aborting seed.');
      return;
    }

    console.log(`Found ${usersToCreate.length} users to create.`);

    // 2. Create users sequentially for clearer logging
    for (const userData of usersToCreate) {
      const { email, name, role } = userData;
      const password = 'password123'; // Standard password for all seeded users

      try {
        console.log(`Creating user: ${email} with role: ${role}`);

        // Create user in Firebase Authentication
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
        });

        const uid = userRecord.uid;

        // Create user document in Firestore
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.set({
          uid,
          name,
          email,
          role,
          avatar: `https://placehold.co/150x150.png`,
          bio: `A passionate ${role} in the Cultured Nomads sisterhood.`,
          interests: [],
          joinedAt: new Date(),
          isMentor: role === 'mentor',
        });

        console.log(`Successfully created user ${email} (UID: ${uid})`);

      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.warn(`User with email ${email} already exists. Skipping.`);
        } else {
          console.error(`Error creating user ${email}:`, error.message);
          // Optional: decide if you want to stop the whole script on a single failure
          // throw error; 
        }
      }
    }

    console.log('--- Seeding finished successfully! ---');
  } catch (error) {
    console.error('\n--- Seeding failed! ---');
    console.error('An error occurred during the seeding process:', error);
    process.exit(1); // Exit with an error code
  }
}

seedDatabase();
