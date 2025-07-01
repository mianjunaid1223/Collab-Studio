'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import PixelCanvas, { type PixelCanvasHandle } from '@/components/canvas/pixel-canvas';
import { ColorPicker } from '@/components/canvas/color-picker';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { placePixel, getProjectPixels } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function CanvasClient({ project, initialPixels }: { project: Project, initialPixels: Map<string, string> }) {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [pixels, setPixels] = useState<Map<string, string>>(initialPixels);
  const canvasHandleRef = useRef<PixelCanvasHandle>(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Note: To make this truly real-time, a WebSocket or server-sent events
    // implementation would be needed to push pixel updates from the server.
    // For now, we'll fetch pixels periodically as a simple polling mechanism.
    const interval = setInterval(async () => {
        const newPixels = await getProjectPixels(project.id);
        setPixels(newPixels);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [project.id]);

  const handleResetView = () => {
    canvasHandleRef.current?.resetCanvas();
  };

  const handlePlacePixel = useCallback(async (x: number, y: number, color: string) => {
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You must be logged in to place pixels.",
            variant: "destructive",
        });
        return;
    }
    
    // Optimistically update the UI
    const newPixels = new Map(pixels);
    newPixels.set(`${x},${y}`, color);
    setPixels(newPixels);

    try {
        const result = await placePixel(project.id, user.id, x, y, color);
        if (result.error) {
            // Revert optimistic update on error
            toast({
                title: "Error Placing Pixel",
                description: result.error,
                variant: "destructive",
            });
            setPixels(pixels); // Revert to original state
        }
    } catch (error) {
        console.error("Failed to place pixel:", error);
        toast({
            title: "Error",
            description: "Could not place pixel. Please try again.",
            variant: "destructive",
        });
        setPixels(pixels); // Revert to original state
    }
  }, [project.id, user, toast, pixels]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-background text-foreground">
      <div className="flex-grow bg-muted/20 relative flex items-center justify-center overflow-hidden">
        {isClient ? (
          <PixelCanvas 
            ref={canvasHandleRef}
            width={project.width} 
            height={project.height}
            pixels={pixels}
            selectedColor={selectedColor}
            onPixelPlace={handlePlacePixel}
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
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Details
                </Link>
            </Button>
            <Button variant="secondary" onClick={handleResetView} className="pointer-events-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset View
            </Button>
         </div>
      </div>
      <aside className="w-full lg:w-80 p-4 border-l bg-card flex-shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-headline">{project.title}</h1>
            <p className="text-sm text-muted-foreground">by {project.creatorName}</p>
          </div>
          <ColorPicker 
            selectedColor={selectedColor} 
            onColorSelect={setSelectedColor} 
          />
           <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center"><Info className="h-4 w-4 mr-2"/>Controls</h3>
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
