'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProject, getUserProfile } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

export const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  width: z.coerce.number().int().min(16, { message: "Width must be at least 16px." }).max(256, { message: "Width must be at most 256px." }),
  height: z.coerce.number().int().min(16, { message: "Height must be at least 16px." }).max(256, { message: "Height must be at most 256px." }),
  theme: z.string().min(1, { message: "A theme must be selected." }),
});

export async function createProjectAction(values: z.infer<typeof createProjectSchema>) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be logged in to create a project.');
  }

  const userProfile = await getUserProfile(currentUser.uid);
  if (!userProfile) {
    throw new Error('User profile not found.');
  }

  const validation = createProjectSchema.safeParse(values);
  if (!validation.success) {
    throw new Error('Invalid project data.');
  }

  const newProjectData = {
    ...validation.data,
    createdBy: currentUser.uid,
    creatorName: userProfile.name,
    creatorAvatar: userProfile.avatar,
  };

  const newProjectId = await createProject(newProjectData);
  
  revalidatePath('/explore');
  revalidatePath('/');
  revalidatePath(`/profile/${currentUser.uid}`);

  redirect(`/project/${newProjectId}`);
}
