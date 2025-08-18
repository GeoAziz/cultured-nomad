import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const mentors = [
  { email: 'Kristi.Waelchi1@hotmail.com', uid: 'AHk45V1bWmeRnYwvIv1YxOf7rZX2' },
  { email: 'Kayla.Cremin@gmail.com', uid: 'nTUgokVQbCMGSAvSszykvK824GJ2' },
  { email: 'Randall_Fay@gmail.com', uid: 'lqXFYZcalcTLazODX3YnvXSzLg02' },
];

const mentees = [
  { name: 'Alice', uid: 'mentee1' },
  { name: 'Bob', uid: 'mentee2' },
  { name: 'Charlie', uid: 'mentee3' },
];


// Seed mentorships
const mentorships = [];
mentors.forEach((mentor, i) => {
  mentees.forEach((mentee, j) => {
    mentorships.push({
      mentorId: mentor.uid,
      mentorEmail: mentor.email,
      menteeId: mentee.uid,
      menteeName: mentee.name,
      status: j % 2 === 0 ? 'pending' : 'accepted',
      createdAt: new Date(),
    });
  });
});

// Seed mentoring sessions
const sessions = [
  ...mentors.flatMap((mentor, i) => [
    {
      mentorId: mentor.uid,
      menteeId: `mentee${i+1}`,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      topic: 'Goal Setting',
      status: 'upcoming',
    },
    {
      mentorId: mentor.uid,
      menteeId: `mentee${i+2}`,
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      topic: 'Career Planning',
      status: 'upcoming',
    },
    {
      mentorId: mentor.uid,
      menteeId: `mentee${i+1}`,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      topic: 'Feedback',
      status: 'completed',
    },
    {
      mentorId: mentor.uid,
      menteeId: `mentee${i+2}`,
      startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      topic: 'Networking',
      status: 'completed',
    },
  ])
];

// Seed mentor resources
const resources = [
  ...mentors.flatMap((mentor, i) => [
    {
      mentorId: mentor.uid,
      title: `Resource ${i*2+1}`,
      url: `https://example.com/resource${i*2+1}`,
      sharedAt: new Date(),
    },
    {
      mentorId: mentor.uid,
      title: `Resource ${i*2+2}`,
      url: `https://example.com/resource${i*2+2}`,
      sharedAt: new Date(),
    },
  ])
];

// Seed mentor ratings
const ratings = [
  ...mentors.flatMap((mentor, i) => [
    {
      mentorId: mentor.uid,
      rating: 4.5 + i * 0.2,
      reviewer: `mentee${i+1}`,
      reviewedAt: new Date(),
    },
    {
      mentorId: mentor.uid,
      rating: 4.0 + i * 0.3,
      reviewer: `mentee${i+2}`,
      reviewedAt: new Date(),
    },
  ])
];

async function seedAllMentorData() {
  for (const mentorship of mentorships) {
    await db.collection('mentorships').add(mentorship);
    console.log(`Added mentorship: ${mentorship.mentorEmail} -> ${mentorship.menteeName} [${mentorship.status}]`);
  }
  for (const session of sessions) {
    await db.collection('mentoring_sessions').add(session);
    console.log(`Added session for mentor: ${session.mentorId}, topic: ${session.topic}`);
  }
  for (const resource of resources) {
    await db.collection('mentor_resources').add(resource);
    console.log(`Added resource for mentor: ${resource.mentorId}, title: ${resource.title}`);
  }
  for (const rating of ratings) {
    await db.collection('mentor_ratings').add(rating);
    console.log(`Added rating for mentor: ${rating.mentorId}, rating: ${rating.rating}`);
  }
  console.log('All mentor data seeding complete.');
}

seedAllMentorData();
