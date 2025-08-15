'use client';

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useRouter } from 'next/navigation';

export interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    role: 'member' | 'admin';
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
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
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

const auth = getAuth(app);
const db = getFirestore(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setUser({ uid: user.uid, ...userDoc.data() } as UserProfile);
        } else {
            // This case might happen if user doc creation fails during signup
            setUser(null);
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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        callbacks.onSuccess(userDoc.data().role);
      } else {
        await signOut(auth);
        callbacks.onError('User profile not found. Please contact support.');
      }
    } catch (error: any) {
      callbacks.onError(getFirebaseAuthErrorMessage(error.code));
    }
  };

  const signup = async (
    email: string,
    pass: string,
    name: string,
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const { user: newUser } = userCredential;

          await updateProfile(newUser, { displayName: name });

          // Create user document in Firestore
          const userDocRef = doc(db, 'users', newUser.uid);
          await setDoc(userDocRef, {
              uid: newUser.uid,
              name,
              email,
              role: 'member', // default role
              avatar: `https://placehold.co/150x150.png`,
              bio: "New member of the Cultured Nomads sisterhood!",
              interests: [],
              joinedAt: new Date(),
              isMentor: false,
          });

          callbacks.onSuccess();
      } catch (error: any) {
          callbacks.onError(getFirebaseAuthErrorMessage(error.code));
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
            return "An unexpected error occurred. Please try again.";
    }
};
