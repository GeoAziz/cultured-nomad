
import admin from 'firebase-admin';
import { serviceAccount } from '../serviceAccountKey.json' assert { type: 'json' };

const usersToSeed = [
    // Admins
    { email: 'Christina_Harris60@hotmail.com', role: 'admin', name: 'Christina Harris', isMentor: false, industry: 'Tech' },
    { email: 'Courtney.Robel@hotmail.com', role: 'admin', name: 'Courtney Robel', isMentor: false, industry: 'Fintech' },
    // Mentors
    { email: 'Kristi.Waelchi1@hotmail.com', role: 'mentor', name: 'Kristi Waelchi', isMentor: true, industry: 'Creative' },
    { email: 'Kayla.Cremin@gmail.com', role: 'mentor', name: 'Kayla Cremin', isMentor: true, industry: 'Healthcare' },
    { email: 'Randall_Fay@gmail.com', role: 'mentor', name: 'Randall Fay', isMentor: true, industry: 'AI/ML' },
    // Members
    { email: 'Paula_Hessel7@yahoo.com', role: 'member', name: 'Paula Hessel', isMentor: false, industry: 'Fashion' },
    { email: 'Leslie.Lowe39@hotmail.com', role: 'member', name: 'Leslie Lowe', isMentor: false, industry: 'Tech' },
    { email: 'Clarence.Ernser93@yahoo.com', role: 'member', name: 'Clarence Ernser', isMentor: false, industry: 'Fintech' },
    { email: 'Felix_Christiansen@hotmail.com', role: 'member', name: 'Felix Christiansen', isMentor: false, industry: 'Creative' },
    { email: 'Ms.Joanne@gmail.com', role: 'member', name: 'Joanne', isMentor: false, industry: 'Healthcare' },
];

const defaultPassword = 'password123';

async function seedDatabase() {
  console.log('--- Starting database seed ---');

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    for (const userData of usersToSeed) {
        try {
            console.log(`Creating user: ${userData.email} with role: ${userData.role}`);
            
            // 1. Create Auth user
            const userRecord = await auth.createUser({
                email: userData.email,
                password: defaultPassword,
                displayName: userData.name,
                photoURL: `https://placehold.co/150x150.png?text=${userData.name.charAt(0)}`,
            });
            
            // 2. Create Firestore user document
            await db.collection('users').doc(userRecord.uid).set({
                uid: userRecord.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                isMentor: userData.isMentor,
                industry: userData.industry,
                avatar: userRecord.photoURL,
                bio: `A passionate ${userData.role} in the ${userData.industry} field.`,
                interests: [userData.industry],
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Successfully created: ${userData.email}`);

        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.warn(`User already exists, skipping: ${userData.email}`);
            } else {
                console.error(`Error creating user ${userData.email}:`, error.message);
                // We'll allow the script to continue to try and seed other users
            }
        }
    }

    console.log('--- Seeding finished successfully! ---');

  } catch (error) {
    console.error('--- Seeding failed! ---');
    console.error('An unexpected error occurred during the seeding process:', error);
    process.exit(1);
  }
}

seedDatabase();
