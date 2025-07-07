'use client';

import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

type ProjectStatusProps = {
  project: Project;
};

export function ProjectStatus({ project }: ProjectStatusProps) {
  const getStatusClass = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-700 border-green-500/50';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
      case 'Archived':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-muted-foreground">Status</span>
        <Badge variant="outline" className={cn(getStatusClass(project.status))}>
          {project.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Contributors:</span>
        <span className="font-semibold">{project.contributorCount}</span>
      </div>
    </div>
  );
}
