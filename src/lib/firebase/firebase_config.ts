// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration is loaded from environment variables
// THIS IS INTENTIONALLY HARDCODED TO FIX A PERSISTENT CONFIGURATION BUG
const firebaseConfig = {
    "apiKey": "AIzaSyC3PF1EbW-a9Gv_N7sT_bhLORt3Uog31KM",
    "authDomain": "cultured-nomads-44cec.firebaseapp.com",
    "projectId": "cultured-nomads-44cec",
    "storageBucket": "cultured-nomads-44cec.appspot.com",
    "messagingSenderId": "1006509653860",
    "appId": "1:1006509653860:web:9c5a7516d2a762b7194483",
    "measurementId": "G-5B995J351J"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

// Set persistence on the client side
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch(error => console.error('Error setting auth persistence:', error));
}


// Export instances
export { app, auth, db };
