'use client';

import type { CanvasType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "./color-picker";

interface CanvasToolsProps {
  canvasType: CanvasType;
  activeColor: string;
  onColorChange: (color: string) => void;
  activeChar: string;
  onCharChange: (char: string) => void;
}

export function CanvasTools({ canvasType, activeColor, onColorChange, activeChar, onCharChange }: CanvasToolsProps) {
    if (canvasType === 'Embroidery') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thread Color</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Your thread color is uniquely assigned to you for this canvas.</p>
                </CardContent>
            </Card>
        );
    }

    if (canvasType === 'AudioVisual') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sequencer</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Click the grid to place notes. Each row is a different pitch. Press play to hear your composition.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4">
            {(canvasType === 'Mosaic' || canvasType === 'Watercolor' || canvasType === 'Typographic') && (
                <ColorPicker selectedColor={activeColor} onColorSelect={onColorChange} />
            )}

            {canvasType === 'Typographic' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Character</CardTitle>
                        <CardDescription>Select the letter or emoji to place.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="char-input" className="sr-only">Character</Label>
                        <Input
                            id="char-input"
                            maxLength={2}
                            value={activeChar}
                            onChange={(e) => onCharChange(e.target.value.slice(0, 2))}
                            className="text-2xl h-12 text-center font-mono"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
