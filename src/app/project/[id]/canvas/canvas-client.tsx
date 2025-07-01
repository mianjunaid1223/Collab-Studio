'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Project, Contribution, CanvasType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { addContribution, getProjectContributions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { CanvasSwitcher } from '@/components/canvas/canvas-switcher';
import { CanvasTools } from '@/components/canvas/canvas-tools';

export default function CanvasClient({ project, initialContributions }: { project: Project, initialContributions: Contribution[] }) {
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Tool state
  const [activeColor, setActiveColor] = useState('#64B5F6');
  const [activeChar, setActiveChar] = useState('A');

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(async () => {
        try {
            const newContributions = await getProjectContributions(project.id);
            setContributions(newContributions);
        } catch (error) {
            console.error("Failed to poll for contributions", error);
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [project.id]);

  const handleContribute = useCallback(async (data: any) => {
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You must be logged in to contribute.",
            variant: "destructive",
        });
        return;
    }
    
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

    try {
        const result = await addContribution(project.id, user.id, project.canvasType, data);
        if (result.error) {
            toast({
                title: "Error Saving Contribution",
                description: result.error,
                variant: "destructive",
            });
            setContributions(c => c.filter(c => c.id !== optimisticContribution.id));
        }
    } catch (error) {
        console.error("Failed to add contribution:", error);
        toast({
            title: "Error",
            description: "Could not save contribution. Please try again.",
            variant: "destructive",
        });
        setContributions(c => c.filter(c => c.id !== optimisticContribution.id));
    }
  }, [project.id, project.canvasType, user, toast]);

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
            activeChar={activeChar}
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
             activeChar={activeChar}
             onCharChange={setActiveChar}
           />
        </div>
      </aside>
    </div>
  );
}