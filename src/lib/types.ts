import type { Types } from 'mongoose';

export const canvasTypes = ['Embroidery', 'Mosaic', 'Watercolor', 'Typographic', 'AudioVisual'] as const;
export type CanvasType = typeof canvasTypes[number];

export type Project = {
  _id: Types.ObjectId;
  id: string;
  title: string;
  description: string;
  canvasType: CanvasType;
  width?: number; // Optional, for grid-based modes
  height?: number; // Optional, for grid-based modes
  createdBy: Types.ObjectId;
  creatorName: string;
  creatorAvatar: string;
  status: 'Active' | 'Completed' | 'Archived';
  completionPercentage: number;
  contributorCount: number;
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

export type Contribution = {
  _id: Types.ObjectId;
  id: string;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  type: CanvasType;
  data: any; 
  createdAt: Date;
};
