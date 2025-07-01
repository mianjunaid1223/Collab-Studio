'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Project, Contribution, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CanvasSwitcher } from '@/components/canvas/canvas-switcher';
import { CanvasTools } from '@/components/canvas/canvas-tools';

export default function CanvasClient({ project, initialContributions }: { project: Project, initialContributions: Contribution[] }) {
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Tool state
  const [activeColor, setActiveColor] = useState('#64B5F6');
  const [activeShape, setActiveShape] = useState<'Square' | 'Circle'>('Square');
  const [activeSize, setActiveSize] = useState(20);
  const [activeWidth, setActiveWidth] = useState(3);
  const [activeWaveform, setActiveWaveform] = useState<"sine" | "square" | "triangle" | "sawtooth">("sine");

  useEffect(() => {
    setIsClient(true);
    
    // This fetch ensures the server-side socket is initialized before we try to connect
    const initSocket = async () => {
      await fetch('/api/socket');
      const { io } = await import('socket.io-client');
      
      const newSocket = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server!');
        newSocket.emit('join-project', project.id);
        setSocket(newSocket);
      });

      newSocket.on('contribution-broadcast', (newContribution: Contribution) => {
        // We only add the contribution if it's from another user,
        // as we've already added our own optimistically.
        if (newContribution.userId !== user?.id) {
          setContributions((prev) => [...prev, newContribution]);
        }
      });
      
      newSocket.on('contribution-error', (errorMessage: string) => {
        toast({
          title: "Contribution Error",
          description: errorMessage,
          variant: "destructive",
        });
        // A more robust implementation would roll back the optimistic update.
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server.');
        setSocket(null);
      });
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
    // We don't include `socket` in the dependency array to prevent re-connecting on every state change.
    // The connection should persist for the lifetime of the component.
  }, [project.id, user?.id, toast]);


  const handleContribute = useCallback(async (data: any) => {
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You must be logged in to contribute.",
            variant: "destructive",
        });
        return;
    }
     if (!socket) {
        toast({
            title: "Not Connected",
            description: "You are not connected to the live session. Please refresh.",
            variant: "destructive"
        });
        return;
    }
    
    // Optimistic update
    const optimisticContribution: Contribution = {
        id: new Date().toISOString(),
        _id: new Date().toISOString() as any,
        projectId: project._id,
        userId: user.id,
        type: project.canvasType,
        data,
        createdAt: new Date(),
    };
    setContributions(prev => [...prev, optimisticContribution]);

    // Emit event to the server instead of calling a server action
    socket.emit('new-contribution', {
      projectId: project.id,
      userId: user.id,
      type: project.canvasType,
      data,
    });

  }, [project.id, project.canvasType, user, toast, socket]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-background text-foreground">
      <div className="flex-grow bg-muted/20 relative flex items-center justify-center overflow-hidden">
        {isClient ? (
          <CanvasSwitcher 
            project={project}
            contributions={contributions}
            onContribute={handleContribute}
            user={user}
            activeColor={activeColor}
            activeShape={activeShape}
            activeSize={activeSize}
            activeWidth={activeWidth}
            activeWaveform={activeWaveform}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading Canvas...</p>
          </div>
        )}
         <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <Button asChild variant="secondary" className="pointer-events-auto">
                <Link href={`/project/${project.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Details
                </Link>
            </Button>
         </div>
      </div>
      <aside className="w-full lg:w-80 p-4 border-l bg-card flex-shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-headline">{project.title}</h1>
            <p className="text-sm text-muted-foreground">by {project.creatorName}</p>
          </div>
          <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center"><Info className="h-4 w-4 mr-2"/>Prompt</h3>
            <p>{project.description}</p>
           </div>
           
           <h3 className="font-semibold text-foreground">Tools</h3>
           <CanvasTools
             canvasType={project.canvasType}
             activeColor={activeColor}
             onColorChange={setActiveColor}
             activeShape={activeShape}
             onShapeChange={setActiveShape}
             activeSize={activeSize}
             onSizeChange={setActiveSize}
             activeWidth={activeWidth}
             onWidthChange={setActiveWidth}
             activeWaveform={activeWaveform}
             onWaveformChange={setActiveWaveform}
           />
        </div>
      </aside>
    </div>
  );
}
