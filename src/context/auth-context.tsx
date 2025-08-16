'use client';

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
} from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase_config';
import { useRouter } from 'next/navigation';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User authenticated' : 'No user');
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data loaded:', { role: userData.role });
            setUser({ uid: user.uid, ...userData } as UserProfile);
          } else {
            console.warn('No user document found for authenticated user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        console.log('No authenticated user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    pass: string,
    callbacks: { onSuccess: (role: string) => void; onError: (msg: string) => void }
  ) => {
    try {
      console.log('Starting auth process...', { email });
      
      // First, check if Firebase is properly initialized
      if (!auth) {
        console.error('Firebase Auth is not initialized');
        throw new Error('Authentication service is not available');
      }
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, pass);
      } catch (error: any) {
        console.error('Firebase auth error:', {
          code: error?.code,
          message: error?.message,
          name: error?.name,
          stack: error?.stack
        });
        throw error;
      }

      console.log('Auth successful, fetching user doc...');
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef)
        .catch(error => {
          console.error('Firestore error:', {
            code: error.code,
            message: error.message,
            fullError: error
          });
          throw error;
        });

      if (userDoc.exists()) {
        const userProfile = { uid: userCredential.user.uid, ...userDoc.data() } as UserProfile;
        console.log('User profile found:', { role: userProfile.role });
        setUser(userProfile);
        callbacks.onSuccess(userProfile.role);
      } else {
        console.error('No user document found for uid:', userCredential.user.uid);
        await signOut(auth);
        callbacks.onError('User profile not found. Please contact support.');
      }
    } catch (error: any) {
      console.error('Login error caught:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
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
          const newUserProfile: Omit<UserProfile, 'uid' | 'role'> & {uid: string, role: string, bio: string, interests: string[], joinedAt: Date, isMentor: boolean} = {
              uid: newUser.uid,
              name,
              email,
              role: 'member', // default role
              avatar: `https://placehold.co/150x150.png`,
              bio: "New member of the Cultured Nomads sisterhood!",
              interests: [],
              joinedAt: new Date(),
              isMentor: false,
          };
          await setDoc(userDocRef, newUserProfile);
          setUser(newUserProfile as UserProfile);


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
    setUser(null);
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
