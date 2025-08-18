
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

export type UserRole = 'member' | 'admin' | 'mentor' | 'seeker' | 'techie';

export interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    role: 'member' | 'admin' | 'mentor' | 'seeker' | 'techie';
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // First, wait for Firebase Auth to initialize
  useEffect(() => {
    const waitForAuth = auth.authStateReady().then(() => {
      console.log('[AuthProvider] Firebase Auth initialized');
      setAuthInitialized(true);
    });
    return () => {
      // No cleanup needed
    };
  }, []);

  // Then, set up the auth state listener only after auth is ready
  useEffect(() => {
    if (!authInitialized) return;
    console.log('[AuthProvider] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userProfile = { uid: firebaseUser.uid, ...userDoc.data() } as UserProfile;
            
            // Sync Firebase Auth profile with Firestore profile if they differ
            const needsUpdate = (firebaseUser.displayName !== userProfile.name && userProfile.name) || 
                                (firebaseUser.photoURL !== userProfile.avatar && userProfile.avatar);

            if (needsUpdate) {
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
          // This case can happen if the client-side signup document write is slow or fails,
          // and the onAuthStateChanged listener runs before the doc is created.
          // The `assignUserRole` function will eventually create it.
          console.warn(`No Firestore document found for user ${firebaseUser.uid}. This might be a new sign-up.`);
          // Create a temporary profile to avoid a null user state.
           const temporaryProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                role: 'member', // Default assumption
                avatar: firebaseUser.photoURL || `https://placehold.co/150x150.png`
            }
            setUser(temporaryProfile);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
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
      callbacks.onError(getFirebaseAuthErrorMessage(error.code));
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

          // Update the user's Auth profile immediately
          await updateProfile(newUser, { 
            displayName: name,
            photoURL: `https://placehold.co/150x150.png` 
          });
          
          // We manually create the profile here as well so the user doesn't have to wait 
          // for the Cloud Function to trigger. This provides a faster UI response.
          const userRef = doc(db, 'users', newUser.uid);
          await setDoc(userRef, {
             uid: newUser.uid,
             name,
             email,
             avatar: `https://placehold.co/150x150.png`,
             role: "member", // Default role
             bio: bio || "New member of the Cultured Nomads sisterhood!",
             interests: interests || [],
             joinedAt: serverTimestamp(),
             isMentor: false,
          });

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

  // Show nothing until Firebase Auth is initialized
  if (!authInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
