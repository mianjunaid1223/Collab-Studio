
// This file now serves as our in-memory "database" and data access layer.
// In a real application, these functions would interact with a database like Firestore.

export type Project = {
  id: string;
  title: string;
  description: string;
  palette: string[];
  width: number;
  height: number;
  createdBy: string;
  creatorAvatar: string;
  status: 'Active' | 'Completed' | 'Archived';
  completionPercentage: number;
  contributorCount: number;
  theme: string;
  createdAt: Date;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  totalContributions: number;
};

export const mockUsers: User[] = [
  { id: 'user1', name: 'PixelPioneer', avatar: 'https://placehold.co/100x100.png', streak: 12, totalContributions: 1204 },
  { id: 'user2', name: 'CanvasCreator', avatar: 'https://placehold.co/100x100.png', streak: 5, totalContributions: 850 },
  { id: 'user3', name: 'ArtisanAlly', avatar: 'https://placehold.co/100x100.png', streak: 2, totalContributions: 312 },
  { id: 'user4', name: 'DotDrawer', avatar: 'https://placehold.co/100x100.png', streak: 0, totalContributions: 50 },
  { id: 'user5', name: 'CurrentUser', avatar: 'https://placehold.co/100x100.png', streak: 1, totalContributions: 0 },
];

export const projects: Project[] = [
  {
    id: 'proj1',
    title: 'Cosmic Ocean',
    description: 'A vast, shimmering ocean under a sky full of strange constellations. Think bioluminescent waves and swirling galaxies reflected on the water.',
    palette: ['#0A1931', '#185ADB', '#FFC947', '#EFEFEF', '#42A5F5', '#64B5F6'],
    width: 64,
    height: 64,
    createdBy: 'PixelPioneer',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Active',
    completionPercentage: 78,
    contributorCount: 42,
    theme: 'Sci-Fi',
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 'proj2',
    title: 'Enchanted Forest',
    description: 'A magical forest with glowing mushrooms, ancient trees with faces, and tiny sprites flitting through the air. The mood should be mysterious and whimsical.',
    palette: ['#2F4858', '#33658A', '#86BBD8', '#F6AE2D', '#F26419', '#E3F2FD'],
    width: 128,
    height: 128,
    createdBy: 'CanvasCreator',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Active',
    completionPercentage: 45,
    contributorCount: 89,
    theme: 'Fantasy',
    createdAt: new Date('2023-10-25T14:30:00Z'),
  },
  {
    id: 'proj3',
    title: 'City Sunset',
    description: 'A bustling metropolis skyline as the sun sets, casting long shadows and painting the sky in fiery oranges, purples, and pinks.',
    palette: ['#2C3E50', '#E74C3C', '#ECF0F1', '#F39C12', '#8E44AD', '#BDC3C7'],
    width: 96,
    height: 64,
    createdBy: 'ArtisanAlly',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Completed',
    completionPercentage: 100,
    contributorCount: 120,
    theme: 'Urban',
    createdAt: new Date('2023-09-15T18:00:00Z'),
  },
  {
    id: 'proj4',
    title: 'Pixel Portrait',
    description: 'A community-driven attempt to recreate a famous painting, like the Mona Lisa or The Starry Night, using only a limited palette.',
    palette: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    width: 64,
    height: 96,
    createdBy: 'PixelPioneer',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Completed',
    completionPercentage: 100,
    contributorCount: 215,
    theme: 'Art',
    createdAt: new Date('2023-08-01T12:00:00Z'),
  },
    {
    id: 'proj5',
    title: 'Underwater Kingdom',
    description: 'Create the lost city of Atlantis. Coral castles, schools of exotic fish, and maybe a hidden kraken in the depths. Focus on vibrant blues and greens.',
    palette: ['#003B46', '#07575B', '#66A5AD', '#C4DFE6', '#FFFFFF'],
    width: 100,
    height: 100,
    createdBy: 'DotDrawer',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Active',
    completionPercentage: 22,
    contributorCount: 15,
    theme: 'Fantasy',
    createdAt: new Date('2023-10-28T09:00:00Z'),
  },
    {
    id: 'proj6',
    title: 'Retro Arcade',
    description: 'A classic 80s arcade scene. Neon lights, bulky cabinets, and classic video game characters making an appearance.',
    palette: ['#000000', '#FF00FF', '#00FFFF', '#FFFF00', '#FF4500'],
    width: 80,
    height: 60,
    createdBy: 'CanvasCreator',
    creatorAvatar: 'https://placehold.co/100x100.png',
    status: 'Archived',
    completionPercentage: 95,
    contributorCount: 77,
    theme: 'Retro',
    createdAt: new Date('2023-07-20T20:00:00Z'),
  },
];


// Data Access Functions
export async function getProjects(): Promise<Project[]> {
  // We'll sort by creation date to show newest first.
  return Promise.resolve(projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return Promise.resolve(projects.find(p => p.id === id));
}
