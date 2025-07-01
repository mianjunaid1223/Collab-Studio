
import { getProjectById, getContributors, getProjectContributions } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Brush, Shapes, Droplets, Music, ShieldAlert, HelpCircle } from 'lucide-react';
import { ProjectStatus } from '@/components/project/project-status';
import type { Project, Contribution, User } from '@/lib/types';
import { getCurrentUser } from '@/app/(auth)/actions';
import { AdminActions } from '@/components/project/admin-actions';
import { DownloadButton } from '@/components/project/download-button';


const canvasModeDetails: Partial<Record<Project['canvasType'], { icon: React.ReactNode }>> = {
  Embroidery: { icon: '🪡' },
  Mosaic: { icon: <Shapes className="h-4 w-4" /> },
  Watercolor: { icon: <Droplets className="h-4 w-4" /> },
  AudioVisual: { icon: <Music className="h-4 w-4" /> },
};


export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  // Fetch all necessary data in parallel
  const [user, contributors, contributions] = await Promise.all([
    getCurrentUser(),
    getContributors(project.id),
    getProjectContributions(project.id)
  ]);
  
  const modeDetails = canvasModeDetails[project.canvasType] || { icon: <HelpCircle className="h-4 w-4" /> };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 flex items-center gap-2">
                {modeDetails.icon}
                {project.canvasType}
              </Badge>
              <h1 className="text-4xl font-bold font-headline">{project.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground pt-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={project.creatorAvatar} alt={project.creatorName} />
                  <AvatarFallback>{project.creatorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by <Link href={`/profile/${project.createdBy}`} className="font-medium text-primary hover:underline">{project.creatorName}</Link></span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
             <CardHeader>
                <CardTitle>Enter the Canvas</CardTitle>
             </CardHeader>
             <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Join other contributors and bring the vision to life.</p>
                 <Button asChild size="lg">
                    <Link href={`/project/${project.id}/canvas`}>
                        <Brush className="mr-2 h-5 w-5"/>
                        Start Creating
                    </Link>
                 </Button>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Contributors ({contributors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {contributors.length > 0 ? contributors.map(contributor => (
                <Link href={`/profile/${contributor.id}`} key={contributor.id} className="flex items-center space-x-3 hover:bg-muted p-2 rounded-md">
                   <Avatar>
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{contributor.name}</span>
                    {/* Contribution count per user is a future improvement */}
                    {/* <span className="text-xs text-muted-foreground">Contributed {user.totalContributions.toLocaleString()} times</span> */}
                  </div>
                </Link>
              )) : <p className="text-sm text-muted-foreground">Be the first to contribute!</p>}
            </CardContent>
          </Card>

          {user?.isAdmin && (
            <Card className="border-destructive/50">
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
