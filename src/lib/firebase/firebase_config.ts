
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth as getFirebaseAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration is loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Conditionally add measurementId only if it exists
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }),
};

// A function to initialize and get the Firebase App instance
function getAppInstance(): FirebaseApp {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

// A function to get the Firebase Auth instance
function getAuthInstance(): Auth {
    const app = getAppInstance();
    const auth = getFirebaseAuth(app);
    // It's safe to call this every time, it doesn't re-apply if already set.
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence)
        .catch(error => console.error('Error setting auth persistence:', error));
    }
    return auth;
}


// Export functions to get instances
export const app = getAppInstance();
export const auth = getAuthInstance();
export const db = getFirestore(app);
