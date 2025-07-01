import type { Project, Contribution, User } from "@/lib/types";

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
}

export function EmbroideryCanvas({ project, contributions, onContribute, user }: CanvasProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold font-headline">Embroidery Canvas</h2>
        <p className="text-muted-foreground mt-2">Project: {project.title}</p>
        <p className="mt-4">This mode is under construction.</p>
        <p>Total Stitches: {contributions.length}</p>
      </div>
    </div>
  );
}
