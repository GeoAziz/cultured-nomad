// Script to check and fix Firestore message documents for missing/incorrect participants array
// Usage: node scripts/check-fix-messages.mjs
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const mentorUid = 'AHk45V1bWmeRnYwvIv1YxOf7rZX2'; // Kristi.Waelchi1@hotmail.com
const seekerUids = ['mentee1', 'mentee2']; // Add more if needed

async function checkAndFixMessages() {
  console.log('--- Checking messages for mentor:', mentorUid);
  const messagesRef = db.collection('messages');
  const snapshot = await messagesRef.get();
  let fixedCount = 0;
  let errorCount = 0;
  let missingParticipants = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const id = doc.id;
    if (!Array.isArray(data.participants)) {
      console.log(`[MISSING] Message ${id} missing participants array.`);
      missingParticipants.push(id);
      // Attempt to fix: infer from 'from' and 'to' fields
      if (data.from && data.to) {
        const participants = [data.from, data.to].sort();
        await doc.ref.update({ participants });
        console.log(`[FIXED] Added participants [${participants.join(', ')}] to message ${id}`);
        fixedCount++;
      } else {
        console.log(`[ERROR] Cannot fix message ${id}: missing 'from' or 'to' field.`);
        errorCount++;
      }
      continue;
    }
    // Check if mentor is a participant
    if (!data.participants.includes(mentorUid)) {
      console.log(`[SKIP] Message ${id} does not include mentor as participant.`);
      continue;
    }
    // Check if participants array matches expected
    if (data.participants.length !== 2) {
      console.log(`[WARN] Message ${id} has unexpected participants array:`, data.participants);
    }
    // Log message details for debugging
    console.log(`[OK] Message ${id}: participants=${JSON.stringify(data.participants)}, from=${data.from}, to=${data.to}`);
  }

  console.log('--- Summary ---');
  console.log('Total messages checked:', snapshot.size);
  console.log('Messages fixed:', fixedCount);
  console.log('Errors:', errorCount);
  console.log('Messages missing participants:', missingParticipants);
}

checkAndFixMessages().catch(err => {
  console.error('Script error:', err);
});
