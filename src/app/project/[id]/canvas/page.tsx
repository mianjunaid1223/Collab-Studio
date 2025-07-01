import { getProjectById, getProjectPixels } from '@/lib/data';
import { notFound } from 'next/navigation';
import CanvasClient from './canvas-client';

export const dynamic = 'force-dynamic';

export default async function CanvasPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const initialPixels = await getProjectPixels(project.id);

  return <CanvasClient project={project} initialPixels={initialPixels} />;
}
