
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Set persistence to local storage
// It's safe to call this every time, it doesn't re-apply if already set.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch(error => console.error('Error setting auth persistence:', error));
}


// Initialize Firestore
export const db = getFirestore(app);
