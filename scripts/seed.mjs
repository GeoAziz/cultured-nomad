
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {faker} from '@faker-js/faker';

// The service account key is now imported from the root directory.
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

// --- INITIALIZATION ---
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(app);
const auth = getAuth(app);

// --- CONFIGURATION ---
const DEFAULT_PASSWORD = 'password123';
const USERS_TO_CREATE = {
    admins: 2,
    mentors: 3,
    members: 5,
};

// --- HELPER FUNCTIONS ---

const createCulturedNomadUser = async (role, isMentor = false) => {
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] });
    const avatar = `https://placehold.co/150x150.png`;
    const industry = faker.person.jobArea();
    
    try {
        console.log(`Creating user: ${email} with role: ${role}`);

        // 1. Create user in Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            emailVerified: true,
            password: DEFAULT_PASSWORD,
            displayName: name,
            photoURL: avatar,
            disabled: false,
        });

        const uid = userRecord.uid;

        // 2. Create user profile in Firestore
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.set({
            uid,
            name,
            email,
            avatar,
            role,
            bio: faker.person.bio(),
            industry: industry,
            interests: [faker.person.jobType(), faker.person.jobType()],
            isMentor,
            joinedAt: new Date(),
        });

        console.log(`Successfully created user ${uid} (${email})`);
        return { uid, email, role };
    } catch (error) {
        console.error(`Error creating ${role} user ${email}:`, error.message);
        // Re-throw the error to be caught by Promise.all
        throw error;
    }
};


// --- MAIN SEEDING LOGIC ---

const seedDatabase = async () => {
    console.log('--- Starting database seed ---');

    const creationPromises = [];

    // Create Admins
    for (let i = 0; i < USERS_TO_CREATE.admins; i++) {
        creationPromises.push(createCulturedNomadUser('admin'));
    }

    // Create Mentors
    for (let i = 0; i < USERS_TO_CREATE.mentors; i++) {
        creationPromises.push(createCulturedNomadUser('mentor', true));
    }

    // Create Members
    for (let i = 0; i < USERS_TO_CREATE.members; i++) {
        creationPromises.push(createCulturedNomadUser('member'));
    }

    try {
        const results = await Promise.all(creationPromises);
        console.log('\n--- Seeding finished successfully! ---');
        console.log(`${results.length} users created in total.`);
        console.log(`\nDefault password for all users: ${DEFAULT_PASSWORD}`);
        
        // You can find the full list of created users with their roles in credentials.md
        // For quick access, here are some created emails:
        const admins = results.filter(u => u.role === 'admin');
        const mentors = results.filter(u => u.role === 'mentor');
        const members = results.filter(u => u.role === 'member');
        
        if (admins.length > 0) console.log(`\nAdmin example: ${admins[0].email}`);
        if (mentors.length > 0) console.log(`Mentor example: ${mentors[0].email}`);
        if (members.length > 0) console.log(`Member example: ${members[0].email}`);

    } catch (error) {
        console.error('\n--- Seeding failed! ---');
        console.error('An error occurred during the seeding process. Not all users may have been created.', error.message);
        process.exit(1); // Exit with error code
    }
};

seedDatabase().then(() => {
    process.exit(0); // Exit successfully
});
