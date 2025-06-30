'use server';

import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from '@/lib/firestore';

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const FIREBASE_NOT_CONFIGURED_ERROR = "Firebase is not configured. Please add your credentials to a .env.local file.";

async function handleGoogleSignIn(user: import('firebase/auth').User) {
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
      await createUserProfile(user.uid, {
        name: user.displayName || 'Google User',
        email: user.email!,
        avatar: user.photoURL || 'https://placehold.co/100x100.png',
      });
    }
}


export async function signup(values: z.infer<typeof signupSchema>) {
  if (!auth) return FIREBASE_NOT_CONFIGURED_ERROR;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    await createUserProfile(userCredential.user.uid, {
      name: values.username,
      email: values.email,
      avatar: 'https://placehold.co/100x100.png',
    });
  } catch (error: any) {
    return error.message;
  }
}

export async function login(values: z.infer<typeof loginSchema>) {
  if (!auth) return FIREBASE_NOT_CONFIGURED_ERROR;
  try {
    await signInWithEmailAndPassword(auth, values.email, values.password);
  } catch (error: any) {
    return error.message;
  }
}

export async function loginWithGoogle() {
  if (!auth) return FIREBASE_NOT_CONFIGURED_ERROR;
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await handleGoogleSignIn(result.user);
  } catch (error: any) {
    return error.message;
  }
}

export async function signOut() {
  if (!auth) return FIREBASE_NOT_CONFIGURED_ERROR;
  await firebaseSignOut(auth);
}
