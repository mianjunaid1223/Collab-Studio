
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, type Auth, getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { getUserProfile, type User as AppUser } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  appUser: AppUser | null;
  auth: Auth | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

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
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);

  useEffect(() => {
    const app = getFirebaseApp();
    if (app) {
      const auth = getAuth(app);
      setAuthInstance(auth);

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
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

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    if (authInstance) {
      await firebaseSignOut(authInstance);
    }
  };

  const value = { user, appUser, auth: authInstance, loading, signOut };

  if (loading && !authInstance) {
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
