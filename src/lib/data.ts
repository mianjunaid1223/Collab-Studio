'use server';

import dbConnect, { Project, User, Contribution } from './mongodb';
import type { Project as ProjectType, User as UserType, Contribution as ContributionType, CanvasType } from './types';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';

export async function getProjects(count?: number): Promise<ProjectType[]> {
  noStore();
  try {
    const conn = await dbConnect();
    if (!conn) {
      console.warn("Database not connected. Returning empty array for getProjects.");
      return [];
    }
    const query = Project.find().sort({ createdAt: -1 });
    if (count) {
      query.limit(count);
    }
    const projects = await query.exec();
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getCompletedProjects(count: number): Promise<ProjectType[]> {
    noStore();
    try {
      const conn = await dbConnect();
      if (!conn) {
        console.warn("Database not connected. Returning empty array for getCompletedProjects.");
        return [];
      }
      const projects = await Project.find({ status: 'Completed' })
        .sort({ createdAt: -1 })
        .limit(count)
        .exec();
      return JSON.parse(JSON.stringify(projects));
    } catch (error) {
        console.error('Failed to fetch completed projects:', error);
        return [];
    }
}

export async function getProjectById(id: string): Promise<ProjectType | null> {
  noStore();
  try {
    const conn = await dbConnect();
    if (!conn) {
      console.warn(`Database not connected. Returning null for getProjectById(${id}).`);
      return null;
    }
    const project = await Project.findById(id).exec();
    return project ? JSON.parse(JSON.stringify(project)) : null;
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserType | null> {
    noStore();
    try {
      const conn = await dbConnect();
      if (!conn) {
        console.warn(`Database not connected. Returning null for getUserProfile(${userId}).`);
        return null;
      }
      const user = await User.findById(userId).select('-password').exec();
      return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return null;
    }
}

// --- Contribution Functions ---

export async function getProjectContributions(projectId: string): Promise<ContributionType[]> {
    noStore();
    try {
        const conn = await dbConnect();
        if (!conn) {
            console.warn(`Database not connected. Returning empty array for getProjectContributions(${projectId}).`);
            return [];
        }
        const contributions = await Contribution.find({ projectId }).sort({ createdAt: 'asc' }).exec();
        return JSON.parse(JSON.stringify(contributions));
    } catch (error) {
        console.error(`Failed to fetch contributions for project ${projectId}:`, error);
        return [];
    }
}

export async function addContribution(projectId: string, userId: string, type: CanvasType, data: any) {
    try {
        const conn = await dbConnect();
        if (!conn) {
            return { error: 'Database is not configured. Contribution cannot be saved.' };
        }
        
        await Contribution.create({ projectId, userId, type, data });
        
        // In a real app, you would also update contributor counts and user stats here,
        // possibly in a transaction or a background job for better performance and consistency.
        
        revalidatePath(`/project/${projectId}/canvas`);
        return { success: true };
    } catch (error) {
        console.error('Failed to add contribution:', error);
        return { error: "Could not save contribution. Please try again." };
    }
}

export async function getContributors(projectId: string): Promise<UserType[]> {
    noStore();
    try {
        const conn = await dbConnect();
        if (!conn) {
            console.warn(`Database not connected. Returning empty array for getContributors(${projectId}).`);
            return [];
        }
        
        // This implementation can be slow and expensive on projects with many contributions.
        // A better approach for production would be to maintain a 'contributors' array on the Project model.
        const distinctUserIds = await Contribution.find({ projectId }).distinct('userId').exec();

        if (!distinctUserIds || distinctUserIds.length === 0) {
            // If no contributions, the creator is the only contributor
            const project = await Project.findById(projectId).select('createdBy').exec();
            if(!project) return [];
            const creator = await User.findById(project.createdBy).select('-password').exec();
            return creator ? JSON.parse(JSON.stringify([creator])) : [];
        }
        
        const contributors = await User.find({
            '_id': { $in: distinctUserIds }
        }).select('-password').exec();

        return JSON.parse(JSON.stringify(contributors));
    } catch (error) {
        console.error('Failed to get contributors:', error);
        return [];
    }
}
