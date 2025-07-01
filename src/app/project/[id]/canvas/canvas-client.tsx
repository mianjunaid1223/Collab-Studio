'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Project, Contribution, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info, Users, PanelLeft, PanelRight, Settings2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CanvasSwitcher } from '@/components/canvas/canvas-switcher';
import { CanvasTools } from '@/components/canvas/canvas-tools';
import { ProjectStatus } from '@/components/project/project-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


export default function CanvasClient({ project: initialProject, initialContributions }: { project: Project, initialContributions: Contribution[] }) {
  const [project, setProject] = useState<Project>(initialProject);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);

  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);

  // Tool state
  const [activeColor, setActiveColor] = useState('#64B5F6');
  const [activeShape, setActiveShape] = useState<'Square' | 'Circle'>('Square');
  const [activeSize, setActiveSize] = useState(20);
  const [activeWidth, setActiveWidth] = useState(3);
  const [activeWaveform, setActiveWaveform] = useState<"sine" | "square" | "triangle" | "sawtooth">("sine");
  const [activeBlur, setActiveBlur] = useState(8);
  const [activeBPM, setActiveBPM] = useState(120);

  useEffect(() => {
    setIsClient(true);
    
    const initSocket = async () => {
      await fetch('/api/socket');
      const { io } = await import('socket.io-client');
      
      const newSocket = io({ path: '/api/socket', addTrailingSlash: false });

      newSocket.on('connect', () => {
        newSocket.emit('join-project', project.id);
        setSocket(newSocket);
      });

      newSocket.on('contribution-broadcast', (newContribution: Contribution) => {
        setContributions((prev) => [...prev, newContribution]);
      });
      
      newSocket.on('contribution-removed', (removedData: any) => {
        if (project.canvasType === 'AudioVisual' && removedData.col !== undefined && removedData.row !== undefined) {
            setContributions((prev) => 
                prev.filter(c => !(c.data.col === removedData.col && c.data.row === removedData.row))
            );
        }
      });

      newSocket.on('project-updated', (updatedProject: Project) => {
        setProject(updatedProject);
      });
      
      newSocket.on('contribution-error', (errorMessage: string) => {
        toast({
          title: "Contribution Error",
          description: errorMessage,
          variant: "destructive",
        });
      });

      newSocket.on('disconnect', () => setSocket(null));
      setSocket(newSocket);
    };

    initSocket();

    return () => socket?.disconnect();
  }, [project.id, project.canvasType, toast]);

  useEffect(() => {
    setLeftPanelOpen(!isMobile);
    setRightPanelOpen(!isMobile);
  }, [isMobile]);


  const handleContribute = useCallback(async (data: any) => {
    if (!user) {
        toast({ title: "Not Logged In", description: "You must be logged in to contribute.", variant: "destructive" });
        return;
    }
     if (!socket || !socket.connected) {
        toast({ title: "Not Connected", description: "You are not connected to the live session. Please refresh.", variant: "destructive" });
        return;
    }
    
    socket.emit('new-contribution', {
      projectId: project.id,
      userId: user.id,
      type: project.canvasType,
      data,
    });

  }, [project.id, project.canvasType, user, toast, socket]);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      
      {/* Left Panel Toggle */}
      <div className={cn("absolute top-4 left-4 z-20 transition-transform", leftPanelOpen && "translate-x-[20rem]")}>
          <Button size="icon" variant="ghost" className="bg-background/80 hover:bg-background rounded-full backdrop-blur-sm" onClick={() => setLeftPanelOpen(!leftPanelOpen)}>
              <PanelLeft className={cn("transition-transform", leftPanelOpen && "rotate-180")} />
          </Button>
      </div>

      {/* Left Panel: Project Info */}
      <aside className={cn(
          "absolute lg:static top-0 left-0 z-10 h-full w-80 p-4 border-r bg-card flex-shrink-0 overflow-y-auto transition-transform -translate-x-full lg:translate-x-0",
          leftPanelOpen && "translate-x-0 shadow-2xl lg:shadow-none"
        )}>
        <div className="space-y-6 h-full flex flex-col">
            <Button asChild variant="outline" className="w-full">
                <Link href={`/project/${project.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Project Details
                </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold font-headline">{project.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground pt-1">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={project.creatorAvatar} alt={project.creatorName} />
                  <AvatarFallback>{project.creatorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>by <Link href={`/profile/${project.createdBy}`} className="font-medium text-primary hover:underline">{project.creatorName}</Link></span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border flex-grow">
              <h3 className="font-semibold text-foreground mb-2 flex items-center"><Info className="h-4 w-4 mr-2"/>Prompt</h3>
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>
            <ProjectStatus project={project} />
        </div>
      </aside>

      {/* Center: Canvas Area */}
      <main className="flex-grow bg-muted/30 relative flex items-center justify-center overflow-hidden p-4 lg:p-8">
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
            activeBlur={activeBlur}
            activeBPM={activeBPM}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading Canvas...</p>
          </div>
        )}
      </main>

      {/* Right Panel Toggle */}
       <div className={cn("absolute top-4 right-4 z-20 transition-transform", rightPanelOpen && "-translate-x-[20rem]")}>
          <Button size="icon" variant="ghost" className="bg-background/80 hover:bg-background rounded-full backdrop-blur-sm" onClick={() => setRightPanelOpen(!rightPanelOpen)}>
              <Settings2 className={cn("transition-transform", rightPanelOpen && "rotate-90")} />
          </Button>
      </div>

       {/* Right Panel: Tools */}
      <aside className={cn(
        "absolute lg:static top-0 right-0 z-10 h-full w-80 p-4 border-l bg-card flex-shrink-0 overflow-y-auto transition-transform translate-x-full lg:translate-x-0",
        rightPanelOpen && "translate-x-0 shadow-2xl lg:shadow-none"
        )}>
           <div className="space-y-6">
              <h2 className="text-2xl font-bold font-headline">Tools</h2>
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
                 activeBlur={activeBlur}
                 onBlurChange={setActiveBlur}
                 activeBPM={activeBPM}
                 onBPMChange={setActiveBPM}
               />
            </div>
      </aside>
    </div>
  );
}
