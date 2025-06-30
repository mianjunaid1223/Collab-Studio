
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTransition } from 'react';

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
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createProjectSchema, createProjectAction } from './actions';

const predefinedPalettes = [
  { name: 'Cosmic', colors: ['#0A1931', '#185ADB', '#FFC947', '#EFEFEF', '#42A5F5', '#64B5F6'] },
  { name: 'Forest', colors: ['#2F4858', '#33658A', '#86BBD8', '#F6AE2D', '#F26419', '#E3F2FD'] },
  { name: 'Sunset', colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#F39C12', '#8E44AD', '#BDC3C7'] },
  { name: 'Retro', colors: ['#000000', '#FF00FF', '#00FFFF', '#FFFF00', '#FF4500', '#FFFFFF'] },
];

type CreateProjectValues = z.infer<typeof createProjectSchema>;

export default function CreateProjectPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      width: 64,
      height: 64,
      palette: predefinedPalettes[0].colors,
    },
  });

  const selectedPalette = form.watch('palette');

  async function onSubmit(values: CreateProjectValues) {
    startTransition(async () => {
      try {
        await createProjectAction(values);
        toast({
          title: "Project Created!",
          description: "Your new canvas is ready for collaboration.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
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
                Describe your vision with words and a palette. Let the community bring it to life.
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
                name="palette"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Choose a Palette</FormLabel>
                     <FormControl>
                        <div className="space-y-2">
                          {predefinedPalettes.map(palette => (
                            <div key={palette.name}>
                              <button
                                type="button"
                                onClick={() => form.setValue('palette', palette.colors, { shouldValidate: true })}
                                disabled={isPending}
                                className={cn(
                                    "w-full text-left p-2 rounded-md border-2 flex items-center gap-2 transition-colors disabled:opacity-50",
                                    JSON.stringify(selectedPalette) === JSON.stringify(palette.colors) ? "border-primary ring-2 ring-primary/20" : "border-border"
                                )}
                              >
                                {JSON.stringify(selectedPalette) === JSON.stringify(palette.colors) ? <Check className="h-5 w-5 text-primary"/> : <div className="h-5 w-5"/>}
                                <span className="font-medium">{palette.name}</span>
                                <div className="flex gap-1 ml-auto">
                                  {palette.colors.map(color => <div key={color} className="h-5 w-5 rounded" style={{backgroundColor: color}}/>)}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                     </FormControl>
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
