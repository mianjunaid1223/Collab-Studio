'use client';
import { useState, useRef, useEffect } from 'react';
import PixelCanvas, { type PixelCanvasHandle } from '@/components/canvas/pixel-canvas';
import { ColorPicker } from '@/components/canvas/color-picker';
import type { Project } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

export default function CanvasClient({ project }: { project: Project }) {
  const [selectedColor, setSelectedColor] = useState(project.palette[0]);
  const canvasHandleRef = useRef<PixelCanvasHandle>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResetView = () => {
    canvasHandleRef.current?.resetCanvas();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-background text-foreground">
      <div className="flex-grow bg-muted/20 relative flex items-center justify-center">
        {isClient ? (
          <PixelCanvas 
            ref={canvasHandleRef}
            width={project.width} 
            height={project.height} 
            palette={project.palette}
            selectedColor={selectedColor} 
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading Canvas...</p>
          </div>
        )}
         <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
            <Button asChild variant="secondary" className="pointer-events-auto">
                <Link href={`/project/${project.id}`}>
                    <ArrowLeft />
                    Back to Details
                </Link>
            </Button>
            <Button variant="secondary" onClick={handleResetView} className="pointer-events-auto">
                <RefreshCw />
                Reset View
            </Button>
         </div>
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
           <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold text-foreground mb-2">How to Use:</h3>
            <ul className="list-none space-y-2">
                <li><span className="font-semibold">Pan:</span> Middle-click or <kbd className="px-1.5 py-0.5 border rounded-sm bg-background">Ctrl</kbd> + drag.</li>
                <li><span className="font-semibold">Zoom:</span> <kbd className="px-1.5 py-0.5 border rounded-sm bg-background">Ctrl</kbd> + scroll, or pinch gesture.</li>
                <li><span className="font-semibold">Place Pixel:</span> Left-click or tap.</li>
            </ul>
           </div>
        </div>
      </aside>
    </div>
  );
}
