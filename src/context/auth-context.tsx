'use client';

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    pass: string,
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const auth = getAuth(app);
const db = getFirestore(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify user is an admin
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setUser(user);
        } else {
          setUser(null);
          // Optionally sign out non-admin users trying to access admin resources
          // await signOut(auth);
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
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        callbacks.onSuccess();
      } else {
        await signOut(auth);
        callbacks.onError('Access denied. Not an authorized admin.');
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid credentials. Please try again.';
      }
      callbacks.onError(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
