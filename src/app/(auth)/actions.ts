'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect, { User, Project } from '@/lib/mongodb';
import type { User as UserType, CanvasType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { canvasTypes } from '@/lib/types';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'session';

// --- Auth Schemas ---

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- Auth Actions ---

export async function signup(values: z.infer<typeof signupSchema>) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return { error: 'Database is not configured. Please contact the administrator.' };
    }

    const existingUser = await User.findOne({ email: values.email });
    if (existingUser) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);
    
    const newUser = new User({
      name: values.username,
      email: values.email,
      password: hashedPassword,
      avatar: `https://placehold.co/100x100.png?text=${values.username.charAt(0)}`,
    });

    await newUser.save();
    
    await createAndSetSession(newUser._id.toString());
    
    return { success: true };

  } catch (error: any) {
    console.error(error);
    if (error.message.includes("JWT_SECRET")) {
      return { error: 'Authentication service is not configured on the server.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return { error: 'Database is not configured. Please contact the administrator.' };
    }

    const user = await User.findOne({ email: values.email });
    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(values.password, (user as any).password);
        if (!isPasswordValid) {
            return { error: 'Invalid email or password.' };
        }

        await createAndSetSession(user._id.toString());
        
        return { success: true };

    } catch (error: any) {
        console.error(error);
        if (error.message.includes("JWT_SECRET")) {
            return { error: 'Authentication service is not configured on the server.' };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', { expires: new Date(0) });
}

// --- Session Management ---
async function createAndSetSession(userId: string) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('Please define the JWT_SECRET environment variable');
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

export async function getCurrentUser(): Promise<UserType | null> {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.warn('JWT_SECRET not defined. Authentication is disabled.');
        return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const conn = await dbConnect();
        if (!conn) {
          return null;
        }
        const user = await User.findById(decoded.userId).select('-password');
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        // This can happen if the token is invalid or expired.
        // It's normal, so we don't need to log an error.
        return null;
    }
}

// --- Data Actions ---

const createProjectSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    canvasType: z.enum(canvasTypes),
});

export async function createProject(values: z.infer<typeof createProjectSchema>) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "You must be logged in to create a project." };
    }

    try {
        const conn = await dbConnect();
        if (!conn) {
            return { error: 'Database is not configured. Please contact the administrator.' };
        }
        const newProject = new Project({
            ...values,
            createdBy: user.id,
            creatorName: user.name,
            creatorAvatar: user.avatar,
            contributorCount: 1,
        });

        await newProject.save();
        revalidatePath('/explore');
        return { success: true, projectId: newProject._id.toString() };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create project.' };
    }
}

// --- Admin Actions ---

export async function archiveProject(projectId: string) {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    
    try {
        const conn = await dbConnect();
        if (!conn) return { error: 'Database is not configured.' };
        
        await Project.findByIdAndUpdate(projectId, { status: 'Archived' });
        revalidatePath(`/project/${projectId}`);
        revalidatePath('/explore');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to archive project.' };
    }
}

export async function deleteProject(projectId: string) {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    
    try {
        const conn = await dbConnect();
        if (!conn) return { error: 'Database is not configured.' };

        await Project.findByIdAndDelete(projectId);
        revalidatePath('/explore');
    } catch (error) {
        console.error(error);
        return { error: 'Failed to delete project.' };
    }
    redirect('/explore');
}
