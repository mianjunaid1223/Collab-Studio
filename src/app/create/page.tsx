'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
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
import { createProjectSchema, createProjectAction } from './actions';
import { useAuth } from '@/context/auth-context';

type CreateProjectValues = z.infer<typeof createProjectSchema>;

const themes = ['Fantasy', 'Sci-Fi', 'Urban', 'Nature', 'Abstract', 'Retro', 'Art'];

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
      width: 64,
      height: 64,
      theme: 'Fantasy',
    },
  });

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  async function onSubmit(values: CreateProjectValues) {
    startTransition(async () => {
      try {
        await createProjectAction(values);
        toast({
          title: "Project Created!",
          description: "Your new canvas is ready for collaboration.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create project. Please try again.",
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
                Describe your vision. The community will bring it to life, one pixel at a time.
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
                    <FormLabel>Description</FormLabel>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (pixels)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (pixels)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isPending}>
                            <SelectValue placeholder="Select a theme for your project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {themes.map(theme => (
                            <SelectItem key={theme} value={theme}>{theme}</SelectItem>
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
