'use client';

import { useState } from 'react';
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const predefinedPalettes = [
  { name: 'Cosmic', colors: ['#0A1931', '#185ADB', '#FFC947', '#EFEFEF', '#42A5F5', '#64B5F6'] },
  { name: 'Forest', colors: ['#2F4858', '#33658A', '#86BBD8', '#F6AE2D', '#F26419', '#E3F2FD'] },
  { name: 'Sunset', colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#F39C12', '#8E44AD', '#BDC3C7'] },
  { name: 'Retro', colors: ['#000000', '#FF00FF', '#00FFFF', '#FFFF00', '#FF4500', '#FFFFFF'] },
];

export default function CreateProjectPage() {
  const [selectedPalette, setSelectedPalette] = useState<string[]>(predefinedPalettes[0].colors);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Create a New Canvas</CardTitle>
          <CardDescription>
            Describe your vision with words and a palette. Let the community bring it to life.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., 'Enchanted Forest at Dusk'" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the scene, mood, and key elements you envision for your canvas."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (pixels)</Label>
              <Input id="width" type="number" placeholder="64" defaultValue="64" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (pixels)</Label>
              <Input id="height" type="number" placeholder="64" defaultValue="64" />
            </div>
          </div>
           <div className="space-y-2">
            <Label>Choose a Palette</Label>
            <div className="space-y-2">
              {predefinedPalettes.map(palette => (
                <div key={palette.name}>
                  <button 
                    onClick={() => setSelectedPalette(palette.colors)}
                    className={cn(
                        "w-full text-left p-2 rounded-md border-2 flex items-center gap-2",
                        JSON.stringify(selectedPalette) === JSON.stringify(palette.colors) ? "border-primary" : "border-border"
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
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full">Create Project</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
