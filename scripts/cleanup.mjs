
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Import the service account key
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function deleteAllUsers() {
  console.log('--- Starting User Cleanup ---');

  try {
    // 1. Delete all Firebase Authentication users
    const listUsersResult = await auth.listUsers(1000);
    const uidsToDelete = listUsersResult.users.map(user => user.uid);

    if (uidsToDelete.length > 0) {
      const result = await auth.deleteUsers(uidsToDelete);
      console.log(`Successfully deleted ${result.successCount} users from Authentication.`);
      if (result.failureCount > 0) {
        console.warn(`Failed to delete ${result.failureCount} users from Authentication.`);
        result.errors.forEach(err => console.error(err.error.toJSON()));
      }
    } else {
      console.log('No users found in Firebase Authentication to delete.');
    }

    // 2. Delete all documents from the 'users' collection in Firestore
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.limit(500).get(); // Batch delete in chunks
    
    if (snapshot.empty) {
      console.log('No documents found in the "users" collection to delete.');
      console.log('--- Cleanup Finished ---');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`Successfully deleted ${snapshot.size} documents from the "users" collection.`);

    // If there might be more than 500 users, you'd need to loop this process
    if (snapshot.size === 500) {
        console.log("Warning: There may be more user documents to delete. Rerunning might be necessary for large collections.");
    }

    console.log('--- Cleanup Finished Successfully ---');
  } catch (error) {
    console.error('\n--- Cleanup Failed! ---');
    console.error('An error occurred during the cleanup process:', error);
    process.exit(1);
  }
}

deleteAllUsers();
