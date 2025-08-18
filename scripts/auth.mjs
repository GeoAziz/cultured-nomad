import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const auth = getAuth();
const db = getFirestore();

const users = [
  // Mentors (match seed-mentorships.mjs)
  { email: 'Kristi.Waelchi1@hotmail.com', uid: 'AHk45V1bWmeRnYwvIv1YxOf7rZX2', role: 'mentor' },
  { email: 'Kayla.Cremin@gmail.com', uid: 'nTUgokVQbCMGSAvSszykvK824GJ2', role: 'mentor' },
  // Seekers
  { email: 'alice.seeker@example.com', uid: 'mentee1', role: 'seeker' },
  { email: 'bob.seeker@example.com', uid: 'mentee2', role: 'seeker' },
  // Members
  { email: 'member.one@example.com', uid: 'member1', role: 'member' },
  { email: 'member.two@example.com', uid: 'member2', role: 'member' },
  // Techies
  { email: 'techie.one@example.com', uid: 'techie1', role: 'techie' },
  { email: 'techie.two@example.com', uid: 'techie2', role: 'techie' },
  // Admins
  { email: 'admin.one@example.com', uid: 'admin1', role: 'admin' },
  { email: 'admin.two@example.com', uid: 'admin2', role: 'admin' },
];

const defaultPassword = 'password123';

async function cleanupUsers() {
  const existingUsers = await auth.listUsers();
  for (const user of existingUsers.users) {
    try {
      await auth.deleteUser(user.uid);
      console.log(`Deleted user: ${user.email}`);
    } catch (err) {
      console.error(`Error deleting user ${user.email}:`, err);
    }
  }
}

async function createUsers() {
  for (const user of users) {
    try {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: defaultPassword,
        emailVerified: true
      });
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0],
        avatar: `https://placehold.co/150x150.png`,
        bio: `Bio for ${user.email}`,
        interests: [],
        joinedAt: new Date(),
        isMentor: user.role === 'mentor',
      });
      console.log(`Created user: ${user.email} (${user.role})`);
    } catch (err) {
      if (err.code === 'auth/uid-already-exists' || err.code === 'auth/email-already-exists') {
        console.log(`User ${user.email} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${user.email}:`, err);
      }
    }
  }
}

async function main() {
  console.log('Cleaning up existing users...');
  await cleanupUsers();
  console.log('Creating new users for all roles...');
  await createUsers();
  console.log('All users created!');
}

main();
