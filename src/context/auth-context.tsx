
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
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app, auth, db } from '@/lib/firebase/firebase_config';
import { useRouter } from 'next/navigation';

export type UserRole = 'member' | 'admin' | 'mentor' | 'seeker' | 'techie';

export interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    avatar?: string;
    banner?: string;
    bio?: string;
    dataAiHint?: string;
    dataAiHintBanner?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (
    email: string,
    pass:string,
    callbacks: { onSuccess: (role: UserRole) => void; onError: (msg: string) => void }
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
        case "auth/api-key-not-valid":
             return "The Firebase API Key is not valid. Please check your configuration.";
        case "permission-denied":
        case "auth/permission-denied":
             return "Email/Password sign-in is not enabled for this project. Please enable it in the Firebase console under Authentication > Sign-in method.";
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
               try {
                 await updateProfile(firebaseUser, { 
                    displayName: userProfile.name, 
                    photoURL: userProfile.avatar 
                });
               } catch (e) {
                 console.error("Error updating firebase user profile", e)
               }
            }
            setUser(userProfile);
        } else {
          console.warn(`No Firestore document found for user ${firebaseUser.uid}. This might be a new sign-up.`);
          // Create a default profile if it doesn't exist, which can happen on first signup.
           const basicProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                role: 'member',
                avatar: firebaseUser.photoURL || `https://placehold.co/150x150.png`
            }
            setUser(basicProfile);
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
    callbacks: { onSuccess: (role: UserRole) => void; onError: (msg: string) => void }
  ) => {
    try {
      console.log('Starting auth process...', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, pass)
        .catch(error => {
          console.error('Firebase auth error:', {
            code: error.code,
            message: error.message,
            fullError: error
          });
          throw error;
        });

      console.log('Auth successful, fetching user doc...');
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userRole = userDoc.data().role || 'member';
        callbacks.onSuccess(userRole);
      } else {
        // This case should not be hit if seeding is correct, but as a fallback.
        console.warn("User authenticated but no profile found in Firestore. This is unexpected.");
        await signOut(auth);
        callbacks.onError("Your user profile could not be found. Please contact support.");
      }
    } catch (error: any) {
      console.error("Login function error:", error);
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
    setUser(null);
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
