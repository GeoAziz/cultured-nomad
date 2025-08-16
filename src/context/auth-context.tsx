
'use client';

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
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
import { doc, getDoc } from 'firebase/firestore';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userProfile = { uid: firebaseUser.uid, ...userDoc.data() } as UserProfile;
            
            // Sync Auth object with Firestore data if needed
            if (firebaseUser.displayName !== userProfile.name || firebaseUser.photoURL !== userProfile.avatar) {
                await updateProfile(firebaseUser, { 
                    displayName: userProfile.name, 
                    photoURL: userProfile.avatar 
                });
            }
            
            setUser(userProfile);
        } else {
          // This can happen if a user is deleted from Firestore but not Auth.
          // Treat them as logged out.
          setUser(null);
          await signOut(auth);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    pass: string,
    callbacks: { onSuccess: (role: string) => void; onError: (msg: string) => void }
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state.
      // We just need to get the role for the callback.
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        callbacks.onSuccess(userDoc.data().role);
      } else {
        // This is a failsafe, onAuthStateChanged should handle this.
        throw new Error("User profile not found in database.");
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

          // The user document is now created by the `assignUserRole` cloud function.
          // We only need to update the auth profile display name.
          await updateProfile(newUser, { displayName: name });
          
          // onAuthStateChanged will pick up the new user and their profile.
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
    // onAuthStateChanged will set user to null
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
            console.error("Unhandled Firebase Auth Error Code:", errorCode);
            return "An unexpected error occurred. Please try again.";
    }
};
