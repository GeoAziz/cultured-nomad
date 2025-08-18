import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

const corsHandler = cors({ origin: true });
const db = admin.firestore();

// --- AUTH FUNCTIONS ---

/**
 * Triggered on new user creation to set up their profile in Firestore.
 * This will NOT run for users created via the Admin SDK (e.g. seeding script).
 */
export const assignUserRole = functions.auth.user().onCreate(async (user) => {
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
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
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
export const updateUserProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to update your profile.");
    }

    const { name, bio } = data;
    const userId = context.auth.uid;
    const userRef = db.collection("users").doc(userId);

    const updateData: { name?: string; bio?: string } = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

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
export const rsvpToEvent = functions.https.onCall(async (data, context) => {
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
  } else {
    await rsvpRef.delete();
    return { status: "success", message: "RSVP removed." };
  }
});


/**
 * Helper function to send a notification to a user.
 */
async function sendNotification({ toUserId, message }: { toUserId: string; message: string }) {
    await db.collection("notifications").add({
        toUserId,
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
    });
}

/**
 * Sends a message from one user to another.
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
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
export const requestMentorship = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { mentorId, message, userBio } = data;
    const userId = context.auth.uid;

    const mentorRef = db.collection("users").doc(mentorId);
    const mentorDoc = await mentorRef.get();

    if (!mentorDoc.exists || !mentorDoc.data()?.isMentor) {
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
export const logMood = functions.https.onCall(async (data, context) => {
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
    const quote = quotes[Math.floor(Math.random()*quotes.length)];

    return { status: "success", quote };
});

/**
 * Publishes a new story or journal entry.
 */
export const publishStory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to publish.");
    }

    const { title, content, tags, isAnonymous } = data;
    const userId = context.auth.uid;

        // Generate excerpt using AI
        const { excerpt } = await summarizeStory({ content });
    
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
    
    
    // Dummy summarizeStory implementation
    async function summarizeStory({ content }: { content: string }): Promise<{ excerpt: string }> {
        // Simple excerpt: first 100 characters
        return { excerpt: content.slice(0, 100) + (content.length > 100 ? "..." : "") };
    }

    await db.collection("stories").add(storyData);

    return { status: "published" };
});

/**
 * Creates a system-wide broadcast.
 */
export const createBroadcast = functions.https.onCall(async (data, context) => {
    // Role check happens on the client, but double-check here for security
    const uid = context.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.data()?.role !== 'admin') {
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
        createdBy: context.auth!.uid,
    });

    return { status: "success", message: "Broadcast created." };
});

/**
 * Gets statistics for the mentor dashboard.
 */
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
