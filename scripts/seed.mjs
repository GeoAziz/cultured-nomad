
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Initialize Firebase Admin SDK
// The SDK will automatically pick up the service account file path from the environment variable.
initializeApp();

const db = getFirestore();
const auth = getAuth();

console.log('Firebase Admin SDK Initialized.');

const users = [
    { email: "Kristi.Waelchi1@hotmail.com", uid: "AHk45V1bWmeRnYwvIv1YxOf7rZX2", role: "mentor" },
    { email: "Paula_Hessel7@yahoo.com", uid: "NjzZxvP77SZTeF7miAQGndCljML2", role: "member" },
    { email: "Leslie.Lowe39@hotmail.com", uid: "flpUnLWO4DU40YN2nAfG2bfzicy2", role: "member" },
    { email: "Kayla.Cremin@gmail.com", uid: "nTUgokVQbCMGSAvSszykvK824GJ2", role: "mentor" },
    { email: "Randall_Fay@gmail.com", uid: "lqXFYZcalcTLazODX3YnvXSzLg02", role: "mentor" },
    { email: "Christina_Harris60@hotmail.com", uid: "gdzW3KSBF9PZ85KwOnVILZBPdLJ3", role: "admin" },
    { email: "Clarence.Ernser93@yahoo.com", uid: "5NVPf7SyavPnaLlGnlVBY2ADfZw1", role: "member" },
    { email: "Felix_Christiansen@hotmail.com", uid: "Ja4CaFg8gxRXqj4Cb3JiEfTFIB12", role: "member" },
    { email: "Ms.Joanne@gmail.com", uid: "AGJdAMOWtcOzGZ3m2jbRFi08zXz1", role: "member" },
    { email: "Courtney.Robel@hotmail.com", uid: "Ky0d7RYaPTdY0ducz6wyrROqTjk2", role: "admin" }
];

const main = async () => {
    try {
        console.log('Starting database seed...');

        const mentors = users.filter(u => u.role === 'mentor');
        const members = users.filter(u => u.role === 'member');
        const admins = users.filter(u => u.role === 'admin');

        // Create a batch writer for efficiency
        const batch = db.batch();

        // 1. Create User Profiles
        console.log('Creating user profiles...');
        for (const user of users) {
            const userRef = db.collection('users').doc(user.uid);
            const name = faker.person.fullName();
            batch.set(userRef, {
                uid: user.uid,
                name: name,
                email: user.email,
                role: user.role,
                avatar: faker.image.avatar(),
                isMentor: user.role === 'mentor',
                bio: faker.lorem.paragraph(),
                interests: [faker.company.buzzNoun(), faker.company.buzzNoun()],
                industry: faker.company.bsBuzz(),
                banner: 'https://placehold.co/1200x400.png',
                dataAiHint: 'woman portrait',
                dataAiHintBanner: 'abstract purple',
                joinedAt: new Date(),
            });
            console.log(`- Profile for ${name} (${user.email})`);
        }
        
        // 2. Seed Events and RSVPs
        console.log('Creating events and RSVPs...');
        const eventIds = [];
        for (let i = 0; i < 5; i++) {
            const eventRef = db.collection('events').doc();
            eventIds.push(eventRef.id);
            batch.set(eventRef, {
                title: faker.company.catchPhrase(),
                date: faker.date.future(),
                type: faker.helpers.arrayElement(['Workshop', 'Mixer', 'Fireside Chat']),
                host: faker.person.fullName(),
                image: 'https://placehold.co/600x400.png',
                dataAiHint: 'conference event',
            });
        }
        
        // Have some users RSVP
        for(let i = 0; i < 5; i++) {
            const user = faker.helpers.arrayElement(users);
            const eventId = faker.helpers.arrayElement(eventIds);
            const rsvpRef = db.collection('event_rsvps').doc(`${user.uid}_${eventId}`);
            batch.set(rsvpRef, {
                userId: user.uid,
                eventId: eventId,
                createdAt: new Date(),
            });
             console.log(`- ${user.email} RSVP'd to event ${eventId}`);
        }

        // 3. Publish Stories
        console.log('Publishing stories...');
        const nonAdmins = [...members, ...mentors];
        for (const user of nonAdmins) {
            const storyRef = db.collection('stories').doc();
            batch.set(storyRef, {
                title: faker.lorem.sentence(5),
                content: faker.lorem.paragraphs(3),
                excerpt: faker.lorem.paragraph(2),
                tags: [faker.lorem.word(), faker.lorem.word()],
                mood: faker.helpers.arrayElement(['Wins', 'Fails', 'Lessons', 'Real Talk']),
                isAnonymous: faker.datatype.boolean(),
                userId: user.uid,
                author: user.email.split('@')[0],
                avatar: faker.image.avatar(),
                createdAt: new Date(),
                likes: [],
                commentCount: faker.number.int({ min: 0, max: 50 }),
            });
            console.log(`- Story published by ${user.email}`);
        }

        // 4. Send Messages
        console.log('Sending messages...');
        for (let i = 0; i < 10; i++) {
            const sender = faker.helpers.arrayElement(users);
            let recipient = faker.helpers.arrayElement(users);
            // Ensure sender and recipient are not the same
            while (sender.uid === recipient.uid) {
                recipient = faker.helpers.arrayElement(users);
            }

            const messageRef = db.collection('messages').doc();
            batch.set(messageRef, {
                from: sender.uid,
                to: recipient.uid,
                participants: [sender.uid, recipient.uid].sort(),
                content: faker.lorem.sentence(),
                timestamp: faker.date.recent(),
                read: faker.datatype.boolean(),
            });
            console.log(`- Message from ${sender.email} to ${recipient.email}`);
        }

        // 5. Create Mentorship Requests
        console.log('Creating mentorship requests...');
        if (mentors.length > 0 && members.length > 0) {
            for (let i = 0; i < 3; i++) {
                const member = faker.helpers.arrayElement(members);
                const mentor = faker.helpers.arrayElement(mentors);
                const mentorshipRef = db.collection('mentorships').doc();
                batch.set(mentorshipRef, {
                    userId: member.uid,
                    mentorId: mentor.uid,
                    status: "pending",
                    message: faker.lorem.paragraph(),
                    createdAt: new Date(),
                });
                console.log(`- Mentorship request from ${member.email} to ${mentor.email}`);

                // 6. Send Notification for mentorship request
                const notifRef = db.collection('notifications').doc(mentor.uid).collection('user_notifications').doc();
                batch.set(notifRef, {
                    message: `You have a new mentorship request from a member.`,
                    read: false,
                    createdAt: new Date(),
                });
                 console.log(`- Notification sent to ${mentor.email}`);
            }
        }

        // 7. Log Moods
        console.log('Logging moods...');
        for (const user of users) {
            const moodRef = db.collection('mood_logs').doc(user.uid).collection('logs').doc();
            batch.set(moodRef, {
                mood: faker.helpers.arrayElement(['Celebrating', 'Productive', 'Relaxed', 'Reflective', 'Overwhelmed']),
                notes: faker.lorem.sentence(),
                timestamp: faker.date.recent(),
            });
            console.log(`- Mood logged for ${user.email}`);
        }
        
        await batch.commit();
        console.log('Database seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

main();
