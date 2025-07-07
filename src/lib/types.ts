import type { Types } from 'mongoose';
import type { Server as NetServer, Socket } from 'net';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';

export const canvasTypes = ['Embroidery', 'Mosaic', 'Watercolor', 'AudioVisual', 'Paint'] as const;
export type CanvasType = typeof canvasTypes[number];

// This type is used to attach the Socket.IO server instance to the
// Next.js API response object. This is a standard pattern for using
// Socket.IO with Next.js's API routes.
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

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
  isAdmin: boolean;
};

export type Contribution = {
  _id: Types.ObjectId;
  id: string;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  userName?: string; // Added for UI display
  userAvatar?: string; // Added for UI display
  type: CanvasType;
  data: any; 
  createdAt: Date;
};
