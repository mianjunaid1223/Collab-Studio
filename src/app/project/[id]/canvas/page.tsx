import { getProjectById } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import CanvasClient from './canvas-client';

export const dynamic = 'force-dynamic';

export default async function CanvasPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return <CanvasClient project={project} />;
}
