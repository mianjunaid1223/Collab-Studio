import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, User, Pixel } from './types';

// --- User Functions ---

export async function createUserProfile(
  userId: string,
  data: { name: string; email: string; avatar: string }
): Promise<void> {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    streak: 0,
    totalContributions: 0,
  });
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return null;
}

// --- Project Functions ---

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'completionPercentage' | 'contributorCount'>): Promise<string> {
  const projectWithTimestamp = {
    ...projectData,
    status: 'Active' as const,
    completionPercentage: 0,
    contributorCount: 1,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'projects'), projectWithTimestamp);
  return docRef.id;
}

export async function getProjects(count?: number): Promise<Project[]> {
  const projectsRef = collection(db, 'projects');
  const q = count 
    ? query(projectsRef, orderBy('createdAt', 'desc'), limit(count))
    : query(projectsRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}


export async function getCompletedProjects(count: number): Promise<Project[]> {
    const q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}


export async function getProjectById(id: string): Promise<Project | null> {
  const projectDoc = await getDoc(doc(db, 'projects', id));
  if (projectDoc.exists()) {
    return { id: projectDoc.id, ...projectDoc.data() } as Project;
  }
  return null;
}

// --- Pixel Functions ---

export function streamProjectPixels(projectId: string, callback: (pixels: Map<string, string>) => void) {
  const pixelsRef = collection(db, `projects/${projectId}/pixels`);
  
  return onSnapshot(pixelsRef, (snapshot) => {
    const pixels = new Map<string, string>();
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        pixels.set(doc.id, data.color); // doc.id is "x,y"
    });
    callback(pixels);
  });
}

export async function placePixel(projectId: string, userId: string, x: number, y: number, color: string) {
    const pixelRef = doc(db, `projects/${projectId}/pixels`, `${x},${y}`);
    await setDoc(pixelRef, { color, userId, updatedAt: serverTimestamp() });

    // In a real app, you'd also update contributor counts and user stats here,
    // possibly in a transaction or a cloud function for better performance and consistency.
}

export async function getContributors(projectId: string): Promise<User[]> {
    // This is a simplified version. A real implementation would be more complex.
    // It would likely involve aggregating contributor IDs from pixels
    // and then fetching their profiles. For now, we return a mock list.
    const mockContributors: User[] = [
        // This part needs a more robust implementation with Cloud Functions
        // to avoid heavy client-side reads.
    ];
    return mockContributors;
}
