'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shapes, Droplets, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { createProject } from '@/app/(auth)/actions';
import { canvasTypes, type CanvasType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  canvasType: z.enum(canvasTypes, { required_error: "You must select a canvas type."}),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

const canvasModeDetails: Record<CanvasType, { icon: React.ReactNode, description: string }> = {
  Embroidery: { icon: '🪡', description: "Users stitch thread lines onto a fabric-style canvas." },
  Mosaic: { icon: <Shapes className="h-4 w-4" />, description: "Users place shape tiles on a grid." },
  Watercolor: { icon: <Droplets className="h-4 w-4" />, description: "Users drop virtual ink that spreads and blends." },
  AudioVisual: { icon: <Music className="h-4 w-4" />, description: "Users place notes to create a playable soundscape." },
  Paint: { icon: '🎨', description: "Digital painting with brushes, shapes, and fill tools like MS Paint." },
};

export default function CreateProjectPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { user, loading } = useAuth();

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  async function onSubmit(values: CreateProjectValues) {
    startTransition(async () => {
      const result = await createProject(values);

      if (result.success && result.projectId) {
        toast({
          title: "Project Created!",
          description: "Your new canvas is ready for collaboration.",
        });
        router.push(`/project/${result.projectId}`);
      } else {
        toast({
          title: "Error Creating Project",
          description: result.error || "Failed to create project. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Create a New Canvas</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Set the stage for a new collaborative masterpiece.
        </p>
      </div>

       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 rounded-lg border bg-card p-8">
              <div>
                <h3 className="text-xl font-semibold font-headline">Step 1: The Vision</h3>
                <p className="text-muted-foreground mt-1">Describe the artwork you want to create with the community.</p>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Enchanted Forest at Dusk'" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the scene, mood, and key elements you envision for your canvas."
                        rows={4}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6 rounded-lg border bg-card p-8">
                <div>
                    <h3 className="text-xl font-semibold font-headline">Step 2: The Medium</h3>
                    <p className="text-muted-foreground mt-1">Choose the type of canvas for this project.</p>
                </div>
               <FormField
                  control={form.control}
                  name="canvasType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canvas Medium</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a medium for your project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {canvasTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{canvasModeDetails[type as CanvasType].icon}</span>
                                <div className="flex flex-col">
                                  <span>{type}</span>
                                  <span className="text-xs text-muted-foreground">{canvasModeDetails[type as CanvasType].description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="flex justify-end">
              <Button size="lg" className="w-full md:w-auto" type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 animate-spin" />}
                {isPending ? 'Creating...' : 'Launch Project'}
              </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
