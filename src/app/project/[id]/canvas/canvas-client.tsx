'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Project, Contribution, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info, PanelLeft, Settings2, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CanvasSwitcher } from '@/components/canvas/canvas-switcher';
import { CanvasTools } from '@/components/canvas/canvas-tools';
import { ProjectStatus } from '@/components/project/project-status';
import { ProjectStatusManager } from '@/components/project/project-status-manager';
import { DownloadButton } from '@/components/project/download-button';
import { ContributionFilter } from '@/components/canvas/contribution-filter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CanvasClient({ project: initialProject, initialContributions }: { project: Project, initialContributions: Contribution[] }) {
  console.log('CanvasClient: Received initial contributions:', initialContributions.length);
  
  const [project, setProject] = useState<Project>(initialProject);
  
  // Deduplicate initial contributions to prevent duplicate keys
  const deduplicatedContributions = initialContributions.filter((contribution, index, self) => {
    const id = contribution.id || contribution._id?.toString();
    return index === self.findIndex(c => (c.id || c._id?.toString()) === id);
  });
  
  console.log('CanvasClient: After deduplication:', deduplicatedContributions.length);
  
  const [contributions, setContributions] = useState<Contribution[]>(deduplicatedContributions);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const isMobile = useIsMobile();

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Tool state
  const [activeColor, setActiveColor] = useState('#64B5F6');
  const [activeShape, setActiveShape] = useState<'Square' | 'Circle'>('Square');
  const [activeSize, setActiveSize] = useState(20);
  const [activeWidth, setActiveWidth] = useState(3);
  const [activeWaveform, setActiveWaveform] = useState<"sine" | "square" | "triangle" | "sawtooth">("sine");
  const [activeBlur, setActiveBlur] = useState(8);
  const [activeBPM, setActiveBPM] = useState(120);
  // Paint canvas tools
  const [activeTool, setActiveTool] = useState('brush');
  const [activeBrushSize, setActiveBrushSize] = useState(5);

  // Filter state
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>(deduplicatedContributions);
  const [highlightUserId, setHighlightUserId] = useState<string | null>(null);

  // Update filtered contributions when main contributions array changes
  useEffect(() => {
    setFilteredContributions(contributions);
  }, [contributions]);

  useEffect(() => {
    setIsClient(true);
    
    const initSocket = async () => {
      // Don't connect socket for archived or completed projects
      if (project.status === 'Archived' || project.status === 'Completed') {
        console.log('Socket connection disabled for', project.status, 'project');
        return;
      }

      try {
        const { io } = await import('socket.io-client');
        
        // Get the current origin for the connection
        const origin = process.env.NEXT_PUBLIC_APP_URL || 
                      (typeof window !== 'undefined' ? window.location.origin : '');
        
        console.log('Connecting to Socket.IO server at:', origin);
        
        const newSocket = io(origin, { 
          path: '/api/socket', 
          addTrailingSlash: false,
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          upgrade: true,
          rememberUpgrade: false,
          timeout: 20000,
          forceNew: true,
          autoConnect: true,
        });

        newSocket.on('connect', () => {
          console.log('Socket.IO connected');
          newSocket.emit('join-project', project.id);
          setSocket(newSocket);
          setIsSocketConnected(true);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          toast({
            title: "Connection Issue",
            description: "Real-time features may not work properly. Try refreshing the page.",
            variant: "destructive",
          });
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          setIsSocketConnected(false);
        });

        newSocket.on('error', (error) => {
          console.error('Socket.IO error:', error);
        });

        newSocket.on('contribution-broadcast', (newContribution: Contribution) => {
          setContributions((prev) => {
            // Check if this contribution already exists to prevent duplicates
            const exists = prev.some(c => c.id === newContribution.id);
            if (exists) {
              return prev; // Don't add duplicate
            }
            return [...prev, newContribution];
          });
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
      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time updates",
          variant: "destructive",
        });
      }
    };

    initSocket();

    return () => {
        socket?.disconnect();
    }
  }, [project.id, project.canvasType, project.status, toast]);
  
  useEffect(() => {
    if (!isMobile) {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    } else {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
  }, [isMobile]);

  // Add responsive breakpoint handler for better panel management
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Close panels on smaller screens to prevent overlap
      if (width < 1280) { // xl breakpoint
        if (width >= 768 && width <= 1080) { // Problematic tablet range
          setLeftPanelOpen(false);
          setRightPanelOpen(false);
        }
      } else {
        // On desktop, open panels by default
        if (!isMobile) {
          setLeftPanelOpen(true);
          setRightPanelOpen(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const handleContribute = useCallback(async (data: any) => {
    console.log('Client: handleContribute called with data:', data);
    
    if (!user) {
        console.log('Client: No user logged in');
        toast({ title: "Not Logged In", description: "You must be logged in to contribute.", variant: "destructive" });
        return;
    }

    // Prevent contributions on non-active projects
    if (project.status !== 'Active') {
        console.log('Client: Project not active:', project.status);
        toast({ 
          title: "Contributions Disabled", 
          description: `This canvas is ${project.status.toLowerCase()} and no longer accepts contributions.`,
          variant: "destructive" 
        });
        return;
    }

    console.log('Client: Socket connected:', socket?.connected);

    // Try socket first, fallback to direct API call
    if (socket && socket.connected) {
      console.log('Client: Using socket to send contribution');
      socket.emit('new-contribution', {
        projectId: project.id,
        userId: user.id,
        type: project.canvasType,
        data,
      });
    } else {
      console.log('Client: Using API fallback to send contribution');
      // Fallback: Direct API call when socket is not available
      try {
        const response = await fetch('/api/contributions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: project.id,
            userId: user.id,
            type: project.canvasType,
            data,
          }),
        });

        console.log('Client: API response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('Client: API response data:', result);
          if (result.newContribution) {
            // Manually update contributions since we don't have real-time
            setContributions(prev => [...prev, result.newContribution]);
          }
          toast({
            title: "Contribution Added",
            description: "Your contribution has been saved (offline mode).",
          });
        } else {
          const errorData = await response.json();
          console.error('Client: API error response:', errorData);
          throw new Error('Failed to save contribution');
        }
      } catch (error) {
        console.error('Client: Error saving contribution:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save your contribution. Please try again.",
          variant: "destructive",
        });
      }
    }

  }, [project.id, project.canvasType, project.status, user, toast, socket]);

  // Add keyboard support for panels
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full w-full flex bg-background text-foreground">
      
      {/* Left Panel */}
      <aside className={cn(
        "bg-card border-r flex flex-col transition-transform duration-300 ease-in-out",
        "fixed xl:relative top-0 xl:top-0 bottom-0 left-0 z-30 w-80",
        leftPanelOpen ? 'translate-x-0' : '-translate-x-full',
        "xl:translate-x-0"
      )}>
        <div className="p-4 space-y-4 h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between">
              <Button asChild variant="outline" className="w-fit">
                  <Link href={`/project/${project.id}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Project
                  </Link>
              </Button>
               <Button 
                 size="icon" 
                 variant="ghost" 
                 onClick={() => setLeftPanelOpen(false)} 
                 className="xl:hidden"
                 aria-label="Close left panel"
               >
                  <X className="h-5 w-5" />
               </Button>
            </div>
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
            <ProjectStatusManager 
              project={project} 
              user={user} 
              onStatusUpdate={(newStatus) => setProject(prev => ({ ...prev, status: newStatus }))}
            />
            <ContributionFilter
              contributions={contributions}
              project={project}
              user={user}
              onFilterChange={setFilteredContributions}
              onHighlightChange={setHighlightUserId}
            />
            <DownloadButton project={project} contributions={contributions} />
        </div>
      </aside>
      
       {(isMobile || (typeof window !== 'undefined' && window.innerWidth < 1280)) && (leftPanelOpen || rightPanelOpen) && (
        <div 
          className="fixed inset-0 z-20 bg-black/60 xl:hidden backdrop-blur-sm"
          onClick={() => { 
            setLeftPanelOpen(false); 
            setRightPanelOpen(false); 
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setLeftPanelOpen(false);
              setRightPanelOpen(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Close panels"
        />
      )}
      
      {/* Center Area (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
              <Button size="icon" variant="ghost" onClick={() => setLeftPanelOpen(true)} className="xl:hidden">
                  <PanelLeft />
              </Button>
              
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  project.status === 'Active' && isSocketConnected ? "bg-green-500" : "bg-yellow-500"
                )} />
                {project.status === 'Active' 
                  ? (isSocketConnected ? "Live" : "Offline")
                  : project.status
                }
              </div>
              
              <Button size="icon" variant="ghost" onClick={() => setRightPanelOpen(true)} className="xl:hidden">
                  <Settings2 />
              </Button>
          </header>

          <main className="flex-1 bg-muted/30 relative flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4 min-h-0">
            {/* Status Banner for Non-Active Projects */}
            {project.status !== 'Active' && (
              <div className="absolute top-2 left-2 right-2 z-10 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-center text-sm">
                <strong>This canvas is {project.status.toLowerCase()}</strong>
                {project.status === 'Completed' && ' - View only, contributions are disabled.'}
                {project.status === 'Archived' && ' - This canvas is no longer publicly visible.'}
              </div>
            )}
            
            {isClient ? (
              <div className={cn(
                "w-full h-full flex items-center justify-center p-2",
                project.status !== 'Active' ? 'pt-16' : ''
              )}>
                <div className="w-full h-full max-w-[min(90vw,90vh,768px)] max-h-[min(90vw,90vh,768px)] aspect-square">
                  <CanvasSwitcher 
                    project={project}
                    contributions={filteredContributions}
                    onContribute={handleContribute}
                    user={user}
                    activeColor={activeColor}
                    activeShape={activeShape}
                    activeSize={activeSize}
                    activeWidth={activeWidth}
                    activeWaveform={activeWaveform}
                    activeBlur={activeBlur}
                    activeBPM={activeBPM}
                    activeTool={activeTool}
                    activeBrushSize={activeBrushSize}
                    filteredContributions={filteredContributions}
                    highlightUserId={highlightUserId}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading Canvas...</p>
              </div>
            )}
          </main>
      </div>

       {/* Right Panel */}
       <aside className={cn(
        "bg-card border-l flex flex-col transition-transform duration-300 ease-in-out",
        "fixed xl:relative top-0 xl:top-0 bottom-0 right-0 z-30 w-80",
        rightPanelOpen ? 'translate-x-0' : 'translate-x-full',
        "xl:translate-x-0"
        )}>
           <div className="p-4 space-y-4 h-full flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-headline">Tools</h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setRightPanelOpen(false)} 
                  className="xl:hidden"
                  aria-label="Close right panel"
                >
                    <X className="h-5 w-5" />
                </Button>
              </div>
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
                 activeTool={activeTool}
                 onToolChange={setActiveTool}
                 activeBrushSize={activeBrushSize}
                 onBrushSizeChange={setActiveBrushSize}
               />
            </div>
      </aside>
    </div>
  );
}
