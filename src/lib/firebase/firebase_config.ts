
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC87QSxzIcatmngHU1n3u9JVnHq5JAbjME",
  authDomain: "cultered-nomads.firebaseapp.com",
  projectId: "cultered-nomads",
  storageBucket: "cultered-nomads.appspot.com",
  messagingSenderId: "422626062362",
  appId: "1:422626062362:web:76b01c2b2c5a47ed78a1a3",
  measurementId: "G-FG5F9XMR62"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics can be initialized where needed
