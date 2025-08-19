
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
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, auth, db } from '@/lib/firebase/firebase_config';
import { useRouter } from 'next/navigation';

export type UserRole = 'MEMBER' | 'ADMIN' | 'MENTOR' | 'SEEKER' | 'TECHIE';

export interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    bio?: string;
    avatar?: string;
    industry?: string;
    expertise?: string[];
    interests?: string[];
    joinedAt?: Date;
    lastActive?: Date;
    preferences?: {
      notifications: boolean;
      emailUpdates: boolean;
      visibility: 'public' | 'private';
    };
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
    bio: string,
    interests: string[],
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
        // Set the Firebase Auth token cookie with 1-hour expiry
        const token = await firebaseUser.getIdToken();
        const expiry = Date.now() + (60 * 60 * 1000); // 1 hour from now
        document.cookie = `firebase-auth-token=${token}; path=/;`;
        document.cookie = `firebase-token-expiry=${expiry}; path=/;`;
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
              const data = userDoc.data();
              const userProfile = { 
                uid: firebaseUser.uid, 
                ...data,
                role: (data.role || 'MEMBER').toUpperCase() as UserRole 
              } as UserProfile;
              console.log('Setting user with role:', userProfile.role);
              setUser(userProfile);
          } else {
            setUser({ // Set a temporary user to avoid being logged out
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                role: 'MEMBER' as UserRole // Default role
            });
          }
        } catch (error) {
          console.error("[AuthContext] Error fetching user document:", error);
          setUser(null); // Explicitly set user to null on error
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
        unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    pass: string,
    callbacks: { onSuccess: (role: UserRole) => void; onError: (msg: string) => void }
  ) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userProfile = { 
          uid: userCredential.user.uid, 
          ...userData,
          role: userData.role.toUpperCase() as UserRole
        } as UserProfile;
        callbacks.onSuccess(userProfile.role);
      } else {
        await signOut(auth);
        callbacks.onError("Your user profile could not be found. Please contact support.");
      }
    } catch (error: any) {
      callbacks.onError(getFirebaseAuthErrorMessage(error.code));
    } finally {
        setLoading(false);
    }
  };


  const signup = async (
    email: string,
    pass: string,
    name: string,
    bio: string,
    interests: string[],
    callbacks: { onSuccess: () => void; onError: (msg: string) => void }
  ) => {
    setLoading(true);
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const { user: newUser } = userCredential;

          await updateProfile(newUser, { 
            displayName: name,
            photoURL: `https://placehold.co/150x150.png` 
          });
          
          const userProfileData: UserProfile = {
             uid: newUser.uid,
             name,
             email,
             avatar: `https://placehold.co/150x150.png`,
             role: "MEMBER", // Default role
             bio: bio || "New member of the Cultured Nomads sisterhood!",
             interests: interests || [],
          };
          
          const userRef = doc(db, 'users', newUser.uid);
          await setDoc(userRef, {
             ...userProfileData,
             joinedAt: serverTimestamp(),
             isMentor: false,
          });

          setUser(userProfileData);
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
    // Clear the auth token cookie
    document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
