'use server';

import { z } from 'zod';
import { createUserProfile, getUserProfile } from '@/lib/firestore';
import { db } from '@/lib/firebase';

const FIREBASE_NOT_CONFIGURED_ERROR = "Firebase is not configured. Please add your credentials to a .env.local file.";

export async function handleGoogleUser(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null; }) {
  if (!db) return { error: FIREBASE_NOT_CONFIGURED_ERROR };
  try {
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
      if (!user.email) {
          throw new Error("Google user email is not available.");
      }
      await createUserProfile(user.uid, {
        name: user.displayName || 'Google User',
        email: user.email,
        avatar: user.photoURL || 'https://placehold.co/100x100.png',
      });
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  userId: z.string()
});

export async function createUserInDb(values: z.infer<typeof createUserSchema>) {
  if (!db) return { error: FIREBASE_NOT_CONFIGURED_ERROR };
  try {
    await createUserProfile(values.userId, {
      name: values.username,
      email: values.email,
      avatar: 'https://placehold.co/100x100.png',
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
