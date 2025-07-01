'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, type Auth, getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUserProfile, type User as AppUser } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  appUser: AppUser | null;
  auth: Auth | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Initialize Firebase Auth on the client. It's safe to do this at the module level
// because this is a client component module.
const auth = app ? getAuth(app) : null;

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  auth: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false); // If firebase isn't configured, stop loading.
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch the user's profile from Firestore
        try {
            const profile = await getUserProfile(currentUser.uid);
            setAppUser(profile);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (auth) {
        await firebaseSignOut(auth);
    }
  };

  const value = { user, appUser, auth, loading, signOut };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
