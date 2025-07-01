import { getProjectById, getProjectContributions } from '@/lib/data';
import { notFound } from 'next/navigation';
import CanvasClient from './canvas-client';
import { Contribution } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CanvasPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const initialContributions: Contribution[] = await getProjectContributions(project.id);

  return <CanvasClient project={project} initialContributions={initialContributions} />;
}
