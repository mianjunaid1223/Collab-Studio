// In a real application, these functions would interact with a database like Firestore.

export type Project = {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  createdBy: string; // This will be a user ID
  creatorName: string;
  creatorAvatar: string;
  status: 'Active' | 'Completed' | 'Archived';
  completionPercentage: number; // This would be calculated based on pixels placed
  contributorCount: number;
  theme: string;
  createdAt: any; // Firestore timestamp
};

export type User = {
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
  userId: string;
};
