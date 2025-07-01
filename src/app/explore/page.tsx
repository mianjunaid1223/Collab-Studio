import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCard } from "@/components/project/project-card";
import { getProjects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { Search } from "lucide-react";

export default async function ExplorePage() {
  const allProjects: Project[] = await getProjects();
  const ongoingProjects = allProjects.filter(p => p.status === 'Active');
  const completedProjects = allProjects.filter(p => p.status === 'Completed');

  // Note: Filtering logic is not implemented yet as it requires more complex queries.
  // This is a placeholder for future functionality.

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-2">Explore Canvases</h1>
        <p className="text-lg text-muted-foreground">Find a project that inspires you and start contributing.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-background/95 py-4 z-10 backdrop-blur-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by title or creator..." className="pl-10" />
        </div>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small ( &lt; 64x64 )</SelectItem>
              <SelectItem value="medium">Medium ( 64x64 - 128x128 )</SelectItem>
              <SelectItem value="large">Large ( &gt; 128x128 )</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="sci-fi">Sci-Fi</SelectItem>
              <SelectItem value="urban">Urban</SelectItem>
              <SelectItem value="retro">Retro</SelectItem>
              <SelectItem value="art">Art</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold font-headline mb-6">Active Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ongoingProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {ongoingProjects.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No active projects found. Why not create one?</p>}
      </div>

       <div className="mt-16">
        <h2 className="text-3xl font-bold font-headline mb-6 text-center">Completed Works</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {completedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {completedProjects.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No masterpieces have been completed yet.</p>}
       </div>
    </div>
  );
}
