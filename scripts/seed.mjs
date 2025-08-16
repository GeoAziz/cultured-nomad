
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

// Hardcoded user data based on credentials.md
const usersToSeed = [
    // Admins
    { email: 'Christina_Harris60@hotmail.com', role: 'admin', name: 'Christina Harris', isMentor: false, industry: 'Tech', bio: 'Admin user', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'woman portrait' },
    { email: 'Courtney.Robel@hotmail.com', role: 'admin', name: 'Courtney Robel', isMentor: false, industry: 'Tech', bio: 'Admin user', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'professional woman' },

    // Mentors
    { email: 'Kristi.Waelchi1@hotmail.com', role: 'mentor', name: 'Kristi Waelchi', isMentor: true, industry: 'Fintech', bio: 'Fintech mentor with 10+ years of experience.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'woman smile' },
    { email: 'Kayla.Cremin@gmail.com', role: 'mentor', name: 'Kayla Cremin', isMentor: true, industry: 'AI/ML', bio: 'AI researcher and enthusiast.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'woman tech' },
    { email: 'Randall_Fay@gmail.com', role: 'mentor', name: 'Randall Fay', isMentor: true, industry: 'Web3', bio: 'Building the decentralized future.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'man professional' },

    // Members
    { email: 'Paula_Hessel7@yahoo.com', role: 'member', name: 'Paula Hessel', isMentor: false, industry: 'Creative', bio: 'Creative director and storyteller.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'creative woman' },
    { email: 'Leslie.Lowe39@hotmail.com', role: 'member', name: 'Leslie Lowe', isMentor: false, industry: 'Healthcare', bio: 'Innovating in health-tech.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'woman healthcare' },
    { email: 'Clarence.Ernser93@yahoo.com', role: 'member', name: 'Clarence Ernser', isMentor: false, industry: 'Fashion', bio: 'Fashion-tech founder.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'man fashion' },
    { email: 'Felix_Christiansen@hotmail.com', role: 'member', name: 'Felix Christiansen', isMentor: false, industry: 'Tech', bio: 'Aspiring software engineer.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'man tech' },
    { email: 'Ms.Joanne@gmail.com', role: 'member', name: 'Joanne Kertzmann', isMentor: false, industry: 'Creative', bio: 'Graphic designer and artist.', avatar: 'https://placehold.co/150x150.png', dataAiHint: 'woman artist' },
];

const defaultPassword = 'password123';

console.log('--- Starting database seed ---');

try {
    const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    for (const userData of usersToSeed) {
        const { email, role, name, isMentor, industry, bio, avatar, dataAiHint } = userData;
        console.log(`Processing user: ${email} with role: ${role}`);

        try {
            // Create user in Firebase Auth
            const userRecord = await auth.createUser({
                email: email,
                password: defaultPassword,
                displayName: name,
                photoURL: avatar,
            });

            console.log(`  -> Successfully created Auth user: ${userRecord.uid}`);

            // Create user profile in Firestore
            const userDocRef = db.collection('users').doc(userRecord.uid);
            await userDocRef.set({
                uid: userRecord.uid,
                email: email,
                role: role,
                name: name,
                isMentor: isMentor,
                industry: industry,
                bio: bio,
                avatar: avatar,
                dataAiHint: dataAiHint,
                joinedAt: new Date(),
            });

            console.log(`  -> Successfully created Firestore profile for ${email}`);

        } catch (error) {
            console.error(`  -> Error processing user ${email}:`, error.message);
        }
    }

    console.log('--- Seeding finished successfully! ---');
    // The process will exit automatically when the script is done.

} catch (error) {
    console.error('--- Seeding failed! ---');
    console.error('An error occurred during the seeding process:', error.message);
    process.exit(1); // Exit with an error code
}
