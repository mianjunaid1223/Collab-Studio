'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Picker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
           <Label htmlFor="color-picker-input" className="sr-only">Color Picker</Label>
           <Input 
             id="color-picker-input"
             type="color" 
             value={selectedColor}
             onChange={(e) => onColorSelect(e.target.value)}
             className="p-0 h-12 w-12 cursor-pointer border-2 border-muted"
            />
           <div className="flex flex-col">
              <Label htmlFor="color-hex-input" className="text-xs text-muted-foreground">HEX Code</Label>
              <Input
                id="color-hex-input"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="font-mono"
              />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
