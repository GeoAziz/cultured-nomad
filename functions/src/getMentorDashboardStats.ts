import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// No need to import or use cors for onCall functions
const db = admin.firestore();

// Removed unused MentorStats interface

export const getMentorDashboardStats = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
        }
        
        const mentorId = context.auth.uid;
        const mentorshipsRef = db.collection("mentorships");

        const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
        const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');

        // Query for sessions
        const sessionsRef = db.collection("mentoring_sessions");
        const now = admin.firestore.Timestamp.now();
        
        const totalSessionsQuery = sessionsRef.where('mentorId', '==', mentorId);
        const upcomingSessionsQuery = sessionsRef
            .where('mentorId', '==', mentorId)
            .where('startTime', '>', now)
            .orderBy('startTime', 'asc');

        const [pendingSnapshot, acceptedSnapshot, totalSessionsSnapshot, upcomingSessionsSnapshot] = await Promise.all([
            pendingQuery.get(),
            acceptedQuery.get(),
            totalSessionsQuery.get(),
            upcomingSessionsQuery.get()
        ]);

        return {
            pendingRequests: pendingSnapshot.size,
            activeMentees: acceptedSnapshot.size,
            totalSessions: totalSessionsSnapshot.size,
            upcomingSessions: upcomingSessionsSnapshot.size
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new functions.https.HttpsError("internal", error.message);
        } else {
            throw new functions.https.HttpsError("internal", "An unknown error occurred");
        }
    }
});
