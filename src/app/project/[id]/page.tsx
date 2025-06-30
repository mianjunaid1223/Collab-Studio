
import { getProjectById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Users, Brush } from 'lucide-react';
import { ProjectStatus } from '@/components/project/project-status';
import { mockUsers } from '@/lib/mock-data';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const contributors = mockUsers.slice(0, Math.min(mockUsers.length, project.contributorCount)).slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2">{project.theme}</Badge>
              <h1 className="text-4xl font-bold font-headline">{project.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground pt-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={project.creatorAvatar} alt={project.createdBy} />
                  <AvatarFallback>{project.createdBy.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by <Link href={`/profile/${project.createdBy}`} className="font-medium text-primary hover:underline">{project.createdBy}</Link></span>
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
                <p className="text-muted-foreground mb-4">Join other contributors and place your pixels on the canvas.</p>
                 <Button asChild size="lg">
                    <Link href={`/project/${project.id}/canvas`}>
                        <Brush className="mr-2 h-5 w-5"/>
                        Start Painting
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
                <Button className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download as PNG
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Contributors ({project.contributorCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {contributors.map(user => (
                <Link href={`/profile/${user.name}`} key={user.id} className="flex items-center space-x-3 hover:bg-muted p-2 rounded-md">
                   <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">Contributed {user.totalContributions.toLocaleString()} pixels</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
