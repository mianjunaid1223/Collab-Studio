
import { getProjectById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import CanvasClient from './canvas-client';

export default async function CanvasPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return <CanvasClient project={project} />;
}
