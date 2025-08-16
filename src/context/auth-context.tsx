
'use client';

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase_config';

export interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    role: 'member' | 'admin' | 'mentor';
    avatar?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (
    email: string,
    pass:string,
    callbacks: { onSuccess: (role: string) => void; onError: (msg: string) => void }
  ) => Promise<void>;
  signup: (
    email: string,
    pass: string,
    name: string,
    callbacks: { onSuccess: () => void; onError: (msg:string) => void }
  ) => Promise<void>;
  logout: () => void;
  sendPasswordReset: (
    email: string,
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const getFirebaseAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Invalid email or password.";
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/weak-password":
            return "Password should be at least 6 characters.";
        default:
            console.error("Unhandled Firebase Auth Error Code:", errorCode);
            return "An unexpected error occurred. Please try again.";
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userProfile = { uid: firebaseUser.uid, ...userDoc.data() } as UserProfile;
            
            if (firebaseUser.displayName !== userProfile.name || firebaseUser.photoURL !== userProfile.avatar) {
                await updateProfile(firebaseUser, { 
                    displayName: userProfile.name, 
                    photoURL: userProfile.avatar 
                });
            }
            setUser(userProfile);
        } else {
          // This can happen if a user is created in Auth but not in Firestore,
          // or if they are deleted from Firestore. We create a basic profile
          // to prevent the app from breaking.
          console.warn(`No Firestore document found for user ${firebaseUser.uid}. Creating one.`);
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'New User',
            role: 'member', // Default role
            avatar: firebaseUser.photoURL || `https://placehold.co/150x150.png`
          };
          await setDoc(userDocRef, newUserProfile);
          setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    pass: string,
    callbacks: { onSuccess: (role: string) => void; onError: (msg: string) => void }
  ) => {
    setLoading(true);
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      // 2. Fetch the user's profile from Firestore to get their role
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        // The onAuthStateChanged listener will handle setting the global user state.
        // We just call the success callback to handle routing.
        callbacks.onSuccess(userRole);
      } else {
        // This is a failsafe for a rare condition where an auth user exists
        // but has no corresponding Firestore document.
        callbacks.onError("User profile not found in database. Please contact support.");
      }
    } catch (error: any) {
      // If signInWithEmailAndPassword fails, this block will execute
      callbacks.onError(getFirebaseAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };


  const signup = async (
    email: string,
    pass: string,
    name: string,
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => {
    setLoading(true);
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const { user: newUser } = userCredential;

          await updateProfile(newUser, { displayName: name });
          
          // The `assignUserRole` cloud function will create the Firestore doc.
          // The `onAuthStateChanged` listener will then pick it up.
          callbacks.onSuccess();

      } catch (error: any) {
          callbacks.onError(getFirebaseAuthErrorMessage(error.code));
      } finally {
        setLoading(false);
      }
  };

  const sendPasswordReset = async (
    email: string,
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => {
    try {
        await sendPasswordResetEmail(auth, email);
        callbacks.onSuccess();
    } catch(error: any) {
        callbacks.onError(getFirebaseAuthErrorMessage(error.code));
    }
  }

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    sendPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
