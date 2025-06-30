
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { projects, type Project } from '@/lib/mock-data';

export const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  width: z.coerce.number().int().min(16, { message: "Width must be at least 16px." }).max(256, { message: "Width must be at most 256px." }),
  height: z.coerce.number().int().min(16, { message: "Height must be at least 16px." }).max(256, { message: "Height must be at most 256px." }),
  palette: z.array(z.string()).min(1, { message: "A palette must be selected." }),
});

export async function createProjectAction(values: z.infer<typeof createProjectSchema>) {
  const validation = createProjectSchema.safeParse(values);
  if (!validation.success) {
    throw new Error('Invalid project data.');
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`, // More unique ID
    ...validation.data,
    createdBy: 'CurrentUser', // Placeholder for authenticated user
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Active',
    completionPercentage: 0,
    contributorCount: 1,
    theme: 'Community', // Placeholder theme
    createdAt: new Date(),
  };

  projects.unshift(newProject);
  
  revalidatePath('/explore');
  revalidatePath('/');
  revalidatePath('/profile/CurrentUser');

  redirect(`/project/${newProject.id}`);
}
