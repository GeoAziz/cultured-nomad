
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

// --- CONFIGURATION ---
// Initialize Firebase Admin SDK
// Make sure your .env file has GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
console.log("Firebase Initialized.");

// --- USER DATA ---
// The list of users you provided
const users = [
    { uid: 'AHk45V1bWmeRnYwvIv1YxOf7rZX2', email: 'Kristi.Waelchi1@hotmail.com', role: 'mentor' },
    { uid: 'NjzZxvP77SZTeF7miAQGndCljML2', email: 'Paula_Hessel7@yahoo.com', role: 'member' },
    { uid: 'flpUnLWO4DU40YN2nAfG2bfzicy2', email: 'Leslie.Lowe39@hotmail.com', role: 'member' },
    { uid: 'nTUgokVQbCMGSAvSszykvK824GJ2', email: 'Kayla.Cremin@gmail.com', role: 'mentor' },
    { uid: 'lqXFYZcalcTLazODX3YnvXSzLg02', email: 'Randall_Fay@gmail.com', role: 'mentor' },
    { uid: 'gdzW3KSBF9PZ85KwOnVILZBPdLJ3', email: 'Christina_Harris60@hotmail.com', role: 'admin' },
    { uid: '5NVPf7SyavPnaLlGnlVBY2ADfZw1', email: 'Clarence.Ernser93@yahoo.com', role: 'member' },
    { uid: 'Ja4CaFg8gxRXqj4Cb3JiEfTFIB12', email: 'Felix_Christiansen@hotmail.com', role: 'member' },
    { uid: 'AGJdAMOWtcOzGZ3m2jbRFi08zXz1', email: 'Ms.Joanne@gmail.com', role: 'member' },
    { uid: 'Ky0d7RYaPTdY0ducz6wyrROqTjk2', email: 'Courtney.Robel@hotmail.com', role: 'admin' },
];

const mentors = users.filter(u => u.role === 'mentor');
const members = users.filter(u => u.role === 'member');
const admins = users.filter(u => u.role === 'admin');

// Helper to get a random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];


// --- SEEDING FUNCTIONS ---

async function seedUsers() {
    console.log("Seeding users...");
    const promises = users.map(user => {
        const userRef = db.collection('users').doc(user.uid);
        const name = faker.person.fullName();
        return userRef.set({
            uid: user.uid,
            name: name,
            email: user.email,
            role: user.role,
            isMentor: user.role === 'mentor',
            avatar: faker.image.avatar(),
            banner: `https://placehold.co/1200x400.png`,
            dataAiHint: 'woman portrait',
            dataAiHintBanner: 'abstract purple',
            bio: faker.person.bio(),
            industry: faker.helpers.arrayElement(['Tech', 'Fintech', 'Creative', 'Healthcare', 'AI/ML', 'Fashion']),
            interests: faker.helpers.arrayElements(['AI', 'Web3', 'VR/AR', 'Bio-Tech', 'Quantum Computing'], 2),
            joinedAt: Timestamp.fromDate(faker.date.past()),
        });
    });
    await Promise.all(promises);
    console.log("✅ Users seeded.");
}

async function seedEvents() {
    console.log("Seeding events...");
    const eventTypes = ['Workshop', 'Mixer', 'Fireside Chat', 'Panel'];
    const eventHosts = mentors.map(m => m.name);
    const eventImages = [
        { url: 'https://placehold.co/600x400.png', hint: 'tech conference' },
        { url: 'https://placehold.co/600x400.png', hint: 'networking event' },
        { url: 'https://placehold.co/600x400.png', hint: 'women coding' },
    ];
    
    const promises = Array.from({ length: 5 }).map(async (_, i) => {
        const eventRef = db.collection('events').doc(`event_${i + 1}`);
        const { url, hint } = getRandomItem(eventImages);
        await eventRef.set({
            title: faker.company.catchPhrase(),
            date: Timestamp.fromDate(faker.date.future()),
            type: getRandomItem(eventTypes),
            host: getRandomItem(eventHosts),
            image: url,
            dataAiHint: hint,
        });
    });
    await Promise.all(promises);
    console.log("✅ Events seeded.");
}


async function seedEventRsvps() {
    console.log("Seeding event RSVPs...");
    const rsvpUsers = [...members, ...mentors]; // Admins typically don't RSVP
    const promises = rsvpUsers.map(user => {
        const eventId = `event_${faker.number.int({ min: 1, max: 5 })}`;
        const rsvpRef = db.collection('event_rsvps').doc(`${user.uid}_${eventId}`);
        return rsvpRef.set({
            userId: user.uid,
            eventId: eventId,
            createdAt: Timestamp.now(),
        });
    });
    await Promise.all(promises);
    console.log("✅ Event RSVPs seeded.");
}

async function seedStories() {
    console.log("Seeding stories...");
    const storyUsers = [...members, ...mentors];
    const moods = ['Wins', 'Fails', 'Lessons', 'Real Talk'];
    const promises = storyUsers.map(async (user) => {
        const userProfile = (await db.collection('users').doc(user.uid).get()).data();
        const storyRef = db.collection('stories').doc();
        await storyRef.set({
            title: faker.lorem.sentence(5),
            content: faker.lorem.paragraphs(3),
            excerpt: faker.lorem.paragraph(),
            tags: faker.helpers.arrayElements(['startup', 'funding', 'tech', 'leadership'], 2),
            mood: getRandomItem(moods),
            isAnonymous: faker.datatype.boolean(0.2), // 20% chance of being anonymous
            userId: user.uid,
            author: userProfile.name,
            avatar: userProfile.avatar,
            createdAt: Timestamp.fromDate(faker.date.past()),
            likes: faker.number.int({ min: 0, max: 150 }),
            commentCount: faker.number.int({ min: 0, max: 20 }),
        });
    });
    await Promise.all(promises);
    console.log("✅ Stories seeded.");
}


async function seedMessages() {
    console.log("Seeding messages...");
    const promises = Array.from({ length: 15 }).map(async () => {
        let fromUser = getRandomItem(users);
        let toUser = getRandomItem(users);
        // Ensure users don't message themselves
        while (fromUser.uid === toUser.uid) {
            toUser = getRandomItem(users);
        }

        const messageRef = db.collection('messages').doc();
        return messageRef.set({
            from: fromUser.uid,
            to: toUser.uid,
            participants: [fromUser.uid, toUser.uid].sort(), // For easier querying
            content: faker.lorem.sentence(),
            timestamp: Timestamp.fromDate(faker.date.recent()),
            read: faker.datatype.boolean(),
        });
    });
    await Promise.all(promises);
    console.log("✅ Messages seeded.");
}

async function seedMentorshipRequests() {
    console.log("Seeding mentorship requests...");
    if (members.length === 0 || mentors.length === 0) {
        console.log("⚠️ Not enough members or mentors to seed requests.");
        return;
    }
    const promises = members.slice(0, 2).map(member => { // First 2 members request mentorship
        const mentor = getRandomItem(mentors);
        const mentorshipRef = db.collection('mentorships').doc();
        return mentorshipRef.set({
            userId: member.uid,
            mentorId: mentor.uid,
            status: faker.helpers.arrayElement(['pending', 'accepted']),
            message: `Hi ${mentor.email}, I'd love to learn more about your experience in ${faker.person.jobArea()}.`,
            createdAt: Timestamp.now(),
        });
    });
    await Promise.all(promises);
    console.log("✅ Mentorship requests seeded.");
}

async function seedMoodLogs() {
    console.log("Seeding mood logs...");
    const moods = ['Celebrating', 'Productive', 'Relaxed', 'Reflective', 'Overwhelmed'];
    const promises = users.map(user => {
        const moodLogRef = db.collection('mood_logs').doc(user.uid).collection('logs').doc();
        return moodLogRef.set({
            mood: getRandomItem(moods),
            notes: faker.lorem.sentence(),
            timestamp: Timestamp.fromDate(faker.date.recent()),
        });
    });
    await Promise.all(promises);
    console.log("✅ Mood logs seeded.");
}

async function seedNotifications() {
    console.log("Seeding notifications...");
    const notifTypes = [
        "You have a new message.",
        "Your mentorship request was accepted!",
        "A new event has been posted.",
        "Welcome to the sisterhood!"
    ];

    const promises = users.map(user => {
        const notifRef = db.collection('notifications').doc(user.uid).collection('user_notifications').doc();
        return notifRef.set({
            message: getRandomItem(notifTypes),
            read: faker.datatype.boolean(0.3), // 30% are read
            createdAt: Timestamp.now(),
        });
    });
    await Promise.all(promises);
    console.log("✅ Notifications seeded.");
}


async function clearCollections() {
    console.log("Clearing existing data...");
    const collectionNames = ['users', 'events', 'event_rsvps', 'stories', 'messages', 'mentorships', 'mood_logs', 'notifications'];
    for (const name of collectionNames) {
        const collectionRef = db.collection(name);
        const snapshot = await collectionRef.limit(500).get();
        if (snapshot.empty) {
            console.log(`- Collection '${name}' is empty, skipping.`);
            continue;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            // Special handling for subcollections
            if (name === 'mood_logs' || name === 'notifications') {
                // This is a simplified clear, for full recursive delete a different approach is needed
            }
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`- Cleared ${snapshot.size} documents from '${name}'.`);
    }
    console.log("✅ All specified collections cleared.");
}

// --- MAIN SCRIPT ---
async function seedDatabase() {
    try {
        await clearCollections();
        await seedUsers();
        await seedEvents();
        await seedStories();
        await seedMessages();
        await seedEventRsvps();
        await seedMentorshipRequests();
        await seedMoodLogs();
        await seedNotifications();
        console.log("\n🚀🚀🚀 Database seeding complete! Your universe is populated. 🚀🚀🚀");
    } catch (error) {
        console.error("🔥🔥🔥 An error occurred during seeding:", error);
    }
}

seedDatabase();
