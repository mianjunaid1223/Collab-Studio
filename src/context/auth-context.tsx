'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, type Auth, getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUserProfile, type User as AppUser } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

// Initialize Firebase Auth immediately when this client module is loaded.
// This prevents race conditions where components try to use auth before it's ready.
const auth: Auth | null = app ? getAuth(app) : null;

type AuthContextType = {
  user: User | null;
  appUser: AppUser | null;
  auth: Auth | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  auth: auth, // Provide the initialized auth instance directly.
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const profile = await getUserProfile(currentUser.uid);
          setAppUser(profile);
        } else {
          setAppUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If firebase is not configured, stop loading and show the app.
      setLoading(false);
    }
  }, []);

  const value = { user, appUser, auth, loading };

  // While the initial user state is being determined, we can show a loader.
  // This prevents a flash of unauthenticated content.
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
