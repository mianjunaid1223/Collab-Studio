
'use client';
import { useState } from 'react';
import PixelCanvas from '@/components/canvas/pixel-canvas';
import { ColorPicker } from '@/components/canvas/color-picker';
import type { Project } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CanvasClient({ project }: { project: Project }) {
  const [selectedColor, setSelectedColor] = useState(project.palette[0]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-background text-foreground">
      <div className="flex-grow bg-muted/20 relative">
        <PixelCanvas 
          width={project.width} 
          height={project.height} 
          palette={project.palette}
          selectedColor={selectedColor} 
        />
         <Button asChild variant="secondary" className="absolute top-4 left-4 z-10">
            <Link href={`/project/${project.id}`}>
                <ArrowLeft />
                Back to Details
            </Link>
         </Button>
      </div>
      <aside className="w-full lg:w-80 p-4 border-l bg-card flex-shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-headline">{project.title}</h1>
            <p className="text-sm text-muted-foreground">by {project.createdBy}</p>
          </div>
          <ColorPicker 
            palette={project.palette} 
            selectedColor={selectedColor} 
            onColorSelect={setSelectedColor} 
          />
        </div>
      </aside>
    </div>
  );
}
