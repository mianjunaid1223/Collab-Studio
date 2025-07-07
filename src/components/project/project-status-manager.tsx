'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Project, User } from '@/lib/types';
import { Settings, Lock, Archive, CheckCircle } from 'lucide-react';

interface ProjectStatusManagerProps {
  project: Project;
  user: User | null;
  onStatusUpdate: (newStatus: Project['status']) => void;
}

export function ProjectStatusManager({ project, user, onStatusUpdate }: ProjectStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const isOwner = user && project.createdBy.toString() === user.id;

  if (!isOwner) {
    return null; // Only show to project owners
  }

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (newStatus === project.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/project/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        onStatusUpdate(newStatus);
        toast({
          title: "Status Updated",
          description: `Project status changed to ${newStatus.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDescription = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return 'Users can contribute to this canvas and it appears in public listings.';
      case 'Completed':
        return 'Canvas is marked as finished. Users can view but not contribute.';
      case 'Archived':
        return 'Canvas is hidden from public view and contributions are disabled.';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4" />;
      case 'Completed':
        return <Lock className="h-4 w-4" />;
      case 'Archived':
        return <Archive className="h-4 w-4" />;
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Canvas Status Management
        </CardTitle>
        <CardDescription>
          Control who can access and contribute to your canvas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge variant="outline" className={cn(getStatusClass(project.status))}>
            {getStatusIcon(project.status)}
            {project.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Change Status:</label>
          <Select 
            value={project.status} 
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="Completed">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Completed
                </div>
              </SelectItem>
              <SelectItem value="Archived">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Status Info:</strong> {getStatusDescription(project.status)}
        </div>

        {project.status === 'Archived' && (
          <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <strong>Note:</strong> This canvas is archived and hidden from public view. 
            Live collaboration is disabled to conserve resources.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
