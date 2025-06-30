'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  palette: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ palette, selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {palette.map((color) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={cn(
                'h-10 w-10 rounded-md border-2 transition-transform transform hover:scale-110 flex items-center justify-center',
                selectedColor === color ? 'border-primary ring-2 ring-ring' : 'border-muted'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            >
              {selectedColor === color && <Check className="h-6 w-6 text-white mix-blend-difference" />}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
