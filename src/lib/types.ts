import type { Types } from 'mongoose';

export type Project = {
  _id: Types.ObjectId;
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  createdBy: Types.ObjectId;
  creatorName: string;
  creatorAvatar: string;
  status: 'Active' | 'Completed' | 'Archived';
  completionPercentage: number;
  contributorCount: number;
  theme: string;
  createdAt: Date;
};

export type User = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  totalContributions: number;
};

export type Pixel = {
  x: number;
  y: number;
  color: string;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
};
