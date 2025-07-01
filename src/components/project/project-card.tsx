'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Users, Shapes, Droplets, Music, HelpCircle } from 'lucide-react';

type ProjectCardProps = {
  project: Project;
};

const canvasModeDetails: Partial<Record<Project['canvasType'], { icon: React.ReactNode, hint: string }>> = {
  Embroidery: { icon: '🪡', hint: 'embroidery thread' },
  Mosaic: { icon: <Shapes className="h-4 w-4" />, hint: 'mosaic tiles' },
  Watercolor: { icon: <Droplets className="h-4 w-4" />, hint: 'watercolor paint' },
  AudioVisual: { icon: <Music className="h-4 w-4" />, hint: 'sound wave' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusClass = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-700 border-green-500/50';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
      case 'Archived':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
    }
  };

  const modeDetails = canvasModeDetails[project.canvasType] || { icon: <HelpCircle className="h-4 w-4" />, hint: 'art' };

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="w-full h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader>
          <div
            className="aspect-video w-full rounded-md bg-muted overflow-hidden flex items-center justify-center"
          >
             <Image 
                src={`https://placehold.co/400x225/e3f2fd/64b5f6.png?text=${encodeURIComponent(project.title)}`}
                data-ai-hint={modeDetails.hint}
                width={400} 
                height={225} 
                alt={project.title} 
                className="w-full h-full object-cover" 
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <Badge variant="outline" className={cn('mb-2', getStatusClass(project.status))}>
            {project.status}
          </Badge>
          <CardTitle className="text-xl font-headline mb-2">{project.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={project.creatorAvatar} alt={project.creatorName} />
              <AvatarFallback>{project.creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>by {project.creatorName}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Progress</span>
              <span>{project.completionPercentage}%</span>
            </div>
            <Progress value={project.completionPercentage} aria-label={`${project.completionPercentage}% complete`} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
           <div className="flex items-center">
             <Badge variant="secondary" className="flex items-center gap-1.5">
                {modeDetails.icon}
                {project.canvasType || "Unknown"}
            </Badge>
           </div>
           <div className="flex items-center">
             <Users className="h-4 w-4 mr-1.5" />
             <span>{project.contributorCount}</span>
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
