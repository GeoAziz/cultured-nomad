import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getMentorDashboardStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    
    const mentorId = context.auth.uid;
    const mentorshipsRef = db.collection("mentorships");
    const sessionsRef = db.collection("mentoring_sessions");

    const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
    const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');
    const totalSessionsQuery = sessionsRef.where('mentorId', '==', mentorId);
    const upcomingSessionsQuery = sessionsRef.where('mentorId', '==', mentorId).where('startTime', '>', new Date());
    
    const [
        pendingSnapshot, 
        acceptedSnapshot,
        totalSessionsSnapshot,
        upcomingSessionsSnapshot
    ] = await Promise.all([
        pendingQuery.get(),
        acceptedQuery.get(),
        totalSessionsQuery.get(),
        upcomingSessionsQuery.get()
    ]);

    return {
        pendingRequests: pendingSnapshot.size,
        activeMentees: acceptedSnapshot.size,
        totalSessions: totalSessionsSnapshot.size,
        upcomingSessions: upcomingSessionsSnapshot.size,
    };
});
