import { getProjectById, getContributors, getProjectContributions } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Brush, Shapes, Droplets, Music, ShieldAlert, HelpCircle } from 'lucide-react';
import { ProjectStatus } from '@/components/project/project-status';
import type { Project, Contribution } from '@/lib/types';
import { getCurrentUser } from '@/app/(auth)/actions';
import { AdminActions } from '@/components/project/admin-actions';
import { DownloadButton } from '@/components/project/download-button';


const canvasModeDetails: Partial<Record<Project['canvasType'], { icon: React.ReactNode }>> = {
  Embroidery: { icon: '🪡' },
  Mosaic: { icon: <Shapes className="h-4 w-4" /> },
  Watercolor: { icon: <Droplets className="h-4 w-4" /> },
  AudioVisual: { icon: <Music className="h-4 w-4" /> },
};


export default async function ProjectPage({ params }: { params: { id:string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const [user, contributors, contributions] = await Promise.all([
    getCurrentUser(),
    getContributors(project.id),
    getProjectContributions(project.id)
  ]);
  
  const modeDetails = canvasModeDetails[project.canvasType] ?? { icon: <HelpCircle className="h-4 w-4" /> };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-none bg-transparent">
            <div className="p-2">
               <Badge variant="secondary" className="w-fit mb-4 flex items-center gap-2">
                {modeDetails.icon}
                {project.canvasType}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{project.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground pt-4">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={project.creatorAvatar} alt={project.creatorName} />
                  <AvatarFallback>{project.creatorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by <Link href={`/profile/${project.createdBy}`} className="font-medium text-primary hover:underline">{project.creatorName}</Link></span>
              </div>
            </div>
            <CardContent className="p-2 pt-6">
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </CardContent>
          </Card>
          
           <Card className="mt-8 bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/20">
             <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <CardTitle className="text-2xl">Enter the Canvas</CardTitle>
                  <p className="text-muted-foreground mt-1">Join others and bring this vision to life.</p>
                </div>
                 <Button asChild size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20">
                    <Link href={`/project/${project.id}/canvas`}>
                        <Brush className="mr-2 h-5 w-5"/>
                        Start Creating
                    </Link>
                 </Button>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Canvas Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectStatus project={project} />
              {project.status === 'Completed' && (
                 <DownloadButton project={project} contributions={contributions} />
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Contributors ({contributors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-96 overflow-y-auto">
              {contributors.length > 0 ? contributors.map(contributor => (
                <Link href={`/profile/${contributor.id}`} key={contributor.id} className="flex items-center space-x-3 hover:bg-accent p-2 rounded-md transition-colors">
                   <Avatar>
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{contributor.name}</span>
                  </div>
                </Link>
              )) : <p className="text-sm text-muted-foreground p-2">Be the first to contribute!</p>}
            </CardContent>
          </Card>

          {user?.isAdmin && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  Admin Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminActions projectId={project.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
