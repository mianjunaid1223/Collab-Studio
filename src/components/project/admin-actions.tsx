'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { archiveProject, deleteProject } from "@/app/(auth)/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Archive, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AdminActions({ projectId }: { projectId: string }) {
    const [isArchiving, setIsArchiving] = useState(false);
    const { toast } = useToast();

    const handleArchive = async () => {
        setIsArchiving(true);
        const result = await archiveProject(projectId);
        if (result.success) {
            toast({ title: 'Project Archived' });
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setIsArchiving(false);
    }
    
    const handleDelete = async () => {
        // The server action will handle redirection
        const result = await deleteProject(projectId);
        if (result?.error) {
             toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    }

    return (
        <div className="space-y-2">
            <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleArchive} 
                disabled={isArchiving}
            >
                {isArchiving ? <Loader2 className="animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                Archive Project
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete Project
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        project and all of its contributions.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete project
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
