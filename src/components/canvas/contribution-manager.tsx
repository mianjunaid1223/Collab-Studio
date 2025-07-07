'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Shield } from 'lucide-react';
import type { Contribution, User, Project } from '@/lib/types';

interface ContributionManagerProps {
  contribution: Contribution;
  user: User | null;
  project: Project;
  onRemove: (contributionId: string) => void;
}

export function ContributionManager({ contribution, user, project, onRemove }: ContributionManagerProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const isOwner = user.id === project.createdBy.toString();
  const isContributor = user.id === contribution.userId.toString();
  const canRemove = isOwner || isContributor;

  if (!canRemove) return null;

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const response = await fetch('/api/contribution/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contributionId: contribution.id,
          projectId: project.id,
        }),
      });

      if (response.ok) {
        onRemove(contribution.id);
        toast({
          title: "Contribution Removed",
          description: "The contribution has been successfully removed.",
        });
      } else {
        throw new Error('Failed to remove contribution');
      }
    } catch (error) {
      console.error('Error removing contribution:', error);
      toast({
        title: "Removal Failed",
        description: "Failed to remove the contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isRemoving}
        >
          {isOwner && !isContributor ? (
            <Shield className="h-3 w-3" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Contribution</AlertDialogTitle>
          <AlertDialogDescription>
            {isOwner && !isContributor
              ? "As the project owner, you can remove any contribution. This action cannot be undone."
              : "You can remove your own contributions. This action cannot be undone."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
            {isRemoving ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
