"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMentorDashboardStats = exports.createBroadcast = exports.publishStory = exports.logMood = exports.requestMentorship = exports.sendMessage = exports.rsvpToEvent = exports.updateUserProfile = exports.onUserDelete = exports.assignUserRole = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const story_summarizer_flow_1 = require("../../src/ai/flows/story-summarizer-flow");
// Simple notification sender stub (replace with your actual implementation)
async function sendNotification({ toUserId, message }) {
    // Example: Add notification to Firestore
    await admin.firestore().collection("notifications").add({
        toUserId,
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
    });
}
admin.initializeApp();
const db = admin.firestore();
// --- AUTH FUNCTIONS ---
/**
 * Triggered on new user creation to set up their profile in Firestore.
 * This will NOT run for users created via the Admin SDK (e.g. seeding script).
 */
exports.assignUserRole = functions.auth.user().onCreate(async (user) => {
    // Check if the user was created by an admin by checking for provider data.
    // Client-side signups (email/password) will have a 'password' provider.
    // Admin SDK created users will have an empty providerData array.
    if (user.providerData.some(p => p.providerId === 'password')) {
        const { uid, email, displayName, photoURL } = user;
        const userRef = db.collection("users").doc(uid);
        console.log(`New user signup from client: ${email}. Creating profile.`);
        return userRef.set({
            uid,
            name: displayName || email,
            email,
            avatar: photoURL || `https://placehold.co/150x150.png`,
            role: "member", // Default role
            bio: "New member of the Cultured Nomads sisterhood!",
            interests: [],
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            isMentor: false,
        });
    }
    console.log(`Skipping profile creation for admin-created user: ${user.email}`);
    return null;
});
/**
 * Triggered on user deletion to clean up their data.
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    const { uid } = user;
    const userRef = db.collection("users").doc(uid);
    // TODO: Add cleanup for other user-related data like stories, messages, etc.
    // This can be complex, consider a batch job or more targeted deletions.
    return userRef.delete();
});
// --- CALLABLE FUNCTIONS ---
/**
 * Allows a user to update their own profile information.
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to update your profile.");
    }
    const { name, bio } = data;
    const userId = context.auth.uid;
    const userRef = db.collection("users").doc(userId);
    const updateData = {};
    if (name)
        updateData.name = name;
    if (bio)
        updateData.bio = bio;
    if (Object.keys(updateData).length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "No profile data provided to update.");
    }
    // Update Firestore document
    await userRef.update(updateData);
    // Update Firebase Auth profile
    if (name) {
        await admin.auth().updateUser(userId, {
            displayName: name,
        });
    }
    return { status: "success", message: "Profile updated successfully." };
});
/**
 * Allows a user to RSVP to an event.
 */
exports.rsvpToEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to RSVP.");
    }
    const { eventId, rsvp } = data;
    const userId = context.auth.uid;
    const rsvpRef = db.collection("event_rsvps").doc(`${userId}_${eventId}`);
    if (rsvp) {
        await rsvpRef.set({
            userId,
            eventId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Optional: Notify event host
        return { status: "success", message: "RSVP successful." };
    }
    else {
        await rsvpRef.delete();
        return { status: "success", message: "RSVP removed." };
    }
});
/**
 * Sends a message from one user to another.
 */
exports.sendMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to send messages.");
    }
    const { to, messageContent } = data;
    const from = context.auth.uid;
    if (!to || !messageContent) {
        throw new functions.https.HttpsError("invalid-argument", "Message must have a recipient and content.");
    }
    const message = {
        from,
        to,
        content: messageContent,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        participants: [from, to].sort()
    };
    await db.collection("messages").add(message);
    // Optional: Send a notification to the recipient
    await sendNotification({
        toUserId: to,
        message: `You have a new message from a member.`,
    });
    return { status: "success" };
});
/**
 * Allows a user to request mentorship from a mentor.
 */
exports.requestMentorship = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { mentorId, message, userBio } = data;
    const userId = context.auth.uid;
    const mentorRef = db.collection("users").doc(mentorId);
    const mentorDoc = await mentorRef.get();
    if (!mentorDoc.exists || !((_a = mentorDoc.data()) === null || _a === void 0 ? void 0 : _a.isMentor)) {
        throw new functions.https.HttpsError("not-found", "Mentor not found or user is not a mentor.");
    }
    const mentorship = {
        userId,
        mentorId,
        status: "pending", // pending, accepted, declined
        message,
        userBio, // Added for more context
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("mentorships").add(mentorship);
    await sendNotification({ toUserId: mentorId, message: `You have a new mentorship request from a member.` });
    return { status: "pending" };
});
/**
 * Logs a user's mood for the wellness tracker.
 */
exports.logMood = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { mood, notes } = data;
    const userId = context.auth.uid;
    if (!mood) {
        throw new functions.https.HttpsError("invalid-argument", "Mood is a required field.");
    }
    await db.collection("mood_logs").doc(userId).collection("logs").add({
        mood,
        notes,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Optional: Return a motivational quote
    const quotes = ["You are a powerhouse of innovation.", "Your potential is limitless.", "Embrace your journey."];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return { status: "success", quote };
});
/**
 * Publishes a new story or journal entry.
 */
exports.publishStory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to publish.");
    }
    const { title, content, tags, isAnonymous } = data;
    const userId = context.auth.uid;
    // Generate excerpt using AI
    const { excerpt } = await (0, story_summarizer_flow_1.summarizeStory)({ content });
    const storyData = {
        title,
        content,
        excerpt,
        tags: tags || [],
        isAnonymous: !!isAnonymous,
        userId: userId,
        author: isAnonymous ? "Anonymous Nomad" : context.auth.token.name || "A Nomad",
        avatar: isAnonymous ? "https://placehold.co/50x50.png" : context.auth.token.picture || "https://placehold.co/50x50.png",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        commentCount: 0,
    };
    await db.collection("stories").add(storyData);
    return { status: "published" };
});
/**
 * Creates a system-wide broadcast.
 */
exports.createBroadcast = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    // Role check happens on the client, but double-check here for security
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const userDoc = await db.collection('users').doc(uid).get();
    if (((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "You must be an admin to create a broadcast.");
    }
    const { title, message, type } = data;
    if (!title || !message || !type) {
        throw new functions.https.HttpsError("invalid-argument", "Title, message, and type are required.");
    }
    await db.collection("broadcasts").add({
        title,
        message,
        type, // 'info', 'warning', 'success'
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: ((_c = context.auth) === null || _c === void 0 ? void 0 : _c.uid) || null,
    });
    return { status: "success", message: "Broadcast created." };
});
/**
 * Gets statistics for the mentor dashboard.
 */
exports.getMentorDashboardStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const mentorId = context.auth.uid;
    try {
        const mentorshipsRef = db.collection("mentorships");
        const sessionsRef = db.collection("mentoring_sessions");
        const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
        const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');
        const totalSessionsQuery = sessionsRef.where('mentorId', '==', mentorId);
        const upcomingSessionsQuery = sessionsRef.where('mentorId', '==', mentorId).where('startTime', '>', new Date());
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
            upcomingSessions: upcomingSessionsSnapshot.size,
        };
    }
    catch (error) {
        console.error("Error in getMentorDashboardStats:", error);
        console.log('[getMentorDashboardStats] Incoming request:', {
            data,
            contextAuth: context.auth,
            headers: context.rawRequest ? context.rawRequest.headers : 'no rawRequest',
            origin: context.rawRequest ? context.rawRequest.headers['origin'] : 'no origin',
            referer: context.rawRequest ? context.rawRequest.headers['referer'] : 'no referer',
        });
        if (!context.auth) {
            console.error('[getMentorDashboardStats] No auth context!');
            throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
        }
        const mentorId = context.auth.uid;
        console.log(`[getMentorDashboardStats] Function called for mentorId: ${mentorId}`);
        try {
            const mentorshipsRef = db.collection("mentorships");
            const sessionsRef = db.collection("mentoring_sessions");
            // Queries
            const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
            const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');
            const totalSessionsQuery = sessionsRef.where('mentorId', '==', mentorId);
            // Firestore doesn't support inequality filters on different fields, so we filter in code.
            const upcomingSessionsQuery = sessionsRef
                .where('mentorId', '==', mentorId)
                .where('startTime', '>=', new Date())
                .orderBy('startTime', 'asc');
            const [pendingSnapshot, acceptedSnapshot, totalSessionsSnapshot, upcomingSessionsSnapshot] = await Promise.all([
                pendingQuery.get(),
                acceptedQuery.get(),
                totalSessionsQuery.get(),
                upcomingSessionsQuery.get()
            ]);
            const stats = {
                pendingRequests: pendingSnapshot.size,
                activeMentees: acceptedSnapshot.size,
                totalSessions: totalSessionsSnapshot.size,
                upcomingSessions: upcomingSessionsSnapshot.size,
            };
            console.log(`[getMentorDashboardStats] Successfully calculated stats for ${mentorId}:`, stats);
            return stats;
        }
        catch (error) {
            console.error(`[getMentorDashboardStats] Error for mentorId: ${mentorId}`, error);
            if (error instanceof Error) {
                // Throw a more specific error to the client
                throw new functions.https.HttpsError("internal", `An error occurred while fetching mentor stats: ${error.message}`);
            }
            // Generic error for unknown issues
            throw new functions.https.HttpsError("internal", "An unknown error occurred while fetching mentor stats.");
        }
    }
});
//# sourceMappingURL=index.js.map