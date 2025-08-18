import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });
const db = admin.firestore();

export const getMentorDashboardStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    
    const mentorId = context.auth.uid;
    const mentorshipsRef = db.collection("mentorships");

    const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
    const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');
    
    const [pendingSnapshot, acceptedSnapshot] = await Promise.all([
        pendingQuery.get(),
        acceptedQuery.get()
    ]);

    return {
        pendingRequests: pendingSnapshot.size,
        activeMentees: acceptedSnapshot.size,
    };
});
