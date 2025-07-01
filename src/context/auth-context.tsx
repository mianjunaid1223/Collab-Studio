'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, type Auth, getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUserProfile, type User as AppUser } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  appUser: AppUser | null;
  auth: Auth | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  auth: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    if (app) {
      const authInstance = getAuth(app);
      setAuth(authInstance);
      
      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        setLoading(true);
        setUser(user);
        if (user) {
          const profile = await getUserProfile(user.uid);
          setAppUser(profile);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, appUser, auth, loading }}>
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
