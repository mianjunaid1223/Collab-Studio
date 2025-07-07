'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Paint: { icon: '🎨', hint: 'digital paint' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusClass = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Archived':
        return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  const modeDetails = canvasModeDetails[project.canvasType] || { icon: <HelpCircle className="h-4 w-4" />, hint: 'art' };

  return (
    <Link href={`/project/${project.id}`} className="group">
      <Card className="w-full h-full flex flex-col transition-all duration-300 bg-card hover:bg-accent/50 hover:-translate-y-1">
        <CardHeader className="p-0">
          <div
            className="aspect-video w-full rounded-t-lg bg-secondary overflow-hidden relative"
          >
             <Image 
                src={`https://placehold.co/400x225.png`}
                data-ai-hint={modeDetails.hint}
                width={400} 
                height={225} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-100" 
            />
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={cn('backdrop-blur-md bg-background/50', getStatusClass(project.status))}>
                {project.status}
              </Badge>
            </div>
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-lg font-headline font-semibold text-primary-foreground truncate group-hover:text-primary">{project.title}</h3>
             </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-4">
           <div className="flex items-center text-sm text-muted-foreground">
            <Avatar className="h-6 w-6 mr-2 border-2 border-secondary">
              <AvatarImage src={project.creatorAvatar} alt={project.creatorName} />
              <AvatarFallback>{project.creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>by {project.creatorName}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-3 pb-3 px-4">
           <div className="flex items-center">
             <Badge variant="secondary" className="flex items-center gap-1.5">
                {modeDetails.icon}
                {project.canvasType || "Unknown"}
            </Badge>
           </div>
           <div className="flex items-center gap-1.5">
             <Users className="h-4 w-4" />
             <span>{project.contributorCount}</span>
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
