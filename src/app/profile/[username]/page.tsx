
import { mockUsers, getProjects } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/project/project-card';
import { Flame, Droplets } from 'lucide-react';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // User data is still mocked for now
  const user = mockUsers.find((u) => u.name === params.username);

  if (!user) {
    notFound();
  }

  const allProjects = await getProjects();
  // Contributions are mocked, showing first 3 projects as an example
  const contributedProjects = allProjects.slice(0, 3); 
  const createdProjects = allProjects.filter(p => p.createdBy === user.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-bold font-headline">{user.name}</h1>
            <div className="flex justify-center md:justify-start items-center gap-6 mt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">{user.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">{user.totalContributions.toLocaleString()} pixels contributed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="creations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="contributions">Contributions (mock)</TabsTrigger>
          <TabsTrigger value="creations">Creations</TabsTrigger>
        </TabsList>
        <TabsContent value="contributions" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contributedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="creations" className="mt-6">
          {createdProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {createdProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>{user.name} hasn't created any projects yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
