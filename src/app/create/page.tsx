'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { createProject } from '@/app/(auth)/actions';
import { canvasTypes, type CanvasType } from '@/lib/types';
import { SewingPinIcon, Shapes, Droplets, Type, Music } from 'lucide-react';

const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  canvasType: z.enum(canvasTypes, { required_error: "You must select a canvas type."}),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

const canvasModeDetails: Record<CanvasType, { icon: React.ReactNode, description: string }> = {
  Embroidery: { icon: '🪡', description: "Users stitch thread lines onto a fabric-style canvas." },
  Mosaic: { icon: <Shapes className="h-4 w-4" />, description: "Users earn and place shape tiles (triangles, circles, etc.) on a grid." },
  Watercolor: { icon: <Droplets className="h-4 w-4" />, description: "Users drop virtual ink that spreads and blends with others." },
  Typographic: { icon: <Type className="h-4 w-4" />, description: "Contributors place letters/emojis to form visual poetry." },
  AudioVisual: { icon: <Music className="h-4 w-4" />, description: "Users place marks tied to tones, creating a playable soundscape." },
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
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Create a New Canvas</CardTitle>
              <CardDescription>
                Describe your vision and choose a medium. The community will bring it to life.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

               <FormField
                  control={form.control}
                  name="canvasType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canvas Medium</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isPending}>
                            <SelectValue placeholder="Select a medium for your project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {canvasTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                {canvasModeDetails[type].icon}
                                <span>{type}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
