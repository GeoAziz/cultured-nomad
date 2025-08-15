import admin from 'firebase-admin';
import {faker} from '@faker-js/faker';

// IMPORTANT: Path to your service account key file
import serviceAccount from '../serviceAccountKey.json' with {type: 'json'};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://cultered-nomads.firebaseio.com`,
});

const db = admin.firestore();

const seedUsers = async (count = 10) => {
    const usersCollection = db.collection('users');
    console.log('Seeding users...');
    for (let i = 0; i < count; i++) {
        const name = faker.person.fullName();
        const isMentor = faker.datatype.boolean(0.3); // 30% chance of being a mentor
        await usersCollection.doc(faker.string.uuid()).set({
            name: name,
            email: faker.internet.email({firstName: name.split(' ')[0]}),
            avatar: faker.image.avatar(),
            role: isMentor ? 'Mentor' : faker.helpers.arrayElement(['Techie', 'Seeker']),
            bio: faker.person.bio(),
            industry: faker.helpers.arrayElement(['Tech', 'Fintech', 'Creative', 'Healthcare', 'AI/ML', 'Fashion']),
            interests: faker.helpers.arrayElements(['AI', 'Web3', 'Design', 'Growth', 'Leadership'], {min: 1, max: 3}),
            joinedAt: admin.firestore.Timestamp.fromDate(faker.date.past()),
            isMentor: isMentor
        });
    }
    console.log(`${count} users seeded.`);
};

const seedEvents = async (count = 5) => {
    const eventsCollection = db.collection('events');
    const users = await db.collection('users').where('isMentor', '==', true).get();
    const mentors = users.docs.map(doc => ({id: doc.id, ...doc.data()}));

    if (mentors.length === 0) {
        console.log('Cannot seed events, no mentors found. Seed users first.');
        return;
    }

    console.log('Seeding events...');
    for (let i = 0; i < count; i++) {
        const host = faker.helpers.arrayElement(mentors);
        await eventsCollection.add({
            title: faker.lorem.words(3),
            date: admin.firestore.Timestamp.fromDate(faker.date.future()),
            type: faker.helpers.arrayElement(['Virtual Workshop', 'AMA Session', 'In-Person Meetup']),
            host: host.name,
            hostId: host.id,
            image: faker.image.urlLoremFlickr({ category: 'business' }),
            dataAiHint: 'abstract technology',
        });
    }
    console.log(`${count} events seeded.`);
};

const seedStories = async (count = 8) => {
    const storiesCollection = db.collection('stories');
    const users = await db.collection('users').get();
    const allUsers = users.docs.map(doc => ({id: doc.id, ...doc.data()}));

    if (allUsers.length === 0) {
        console.log('Cannot seed stories, no users found. Seed users first.');
        return;
    }

    console.log('Seeding stories...');
    for (let i = 0; i < count; i++) {
        const author = faker.helpers.arrayElement(allUsers);
        const isAnonymous = faker.datatype.boolean(0.2);

        await storiesCollection.add({
            title: faker.lorem.sentence(),
            excerpt: faker.lorem.paragraph(),
            content: faker.lorem.paragraphs(5),
            mood: faker.helpers.arrayElement(['Wins', 'Fails', 'Lessons', 'Real Talk']),
            author: isAnonymous ? 'Anonymous' : author.name,
            avatar: isAnonymous ? 'https://placehold.co/50x50.png' : author.avatar,
            userId: isAnonymous ? null : author.id,
            createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent()),
            likes: faker.number.int({min: 0, max: 150}),
            commentCount: faker.number.int({min: 0, max: 20})
        });
    }
    console.log(`${count} stories seeded.`);
};


const seedDatabase = async () => {
    console.log('Starting database seed...');
    await seedUsers();
    await seedEvents();
    await seedStories();
    console.log('Database seeding complete!');
    process.exit(0);
};

seedDatabase().catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
});
