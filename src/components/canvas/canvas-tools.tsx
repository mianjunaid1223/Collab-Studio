'use client';

import type { CanvasType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "./color-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Waves, Circle, Square, Minus, Plus, Blend, Music, Brush, Eraser, PaintBucket, Palette } from "lucide-react";

interface CanvasToolsProps {
  canvasType: CanvasType;
  activeColor: string;
  onColorChange: (color: string) => void;
  activeShape: 'Square' | 'Circle';
  onShapeChange: (shape: 'Square' | 'Circle') => void;
  activeSize: number;
  onSizeChange: (size: number) => void;
  activeWidth: number;
  onWidthChange: (width: number) => void;
  activeWaveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  onWaveformChange: (waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => void;
  activeBlur: number;
  onBlurChange: (blur: number) => void;
  activeBPM: number;
  onBPMChange: (bpm: number) => void;
  // Paint canvas tools
  activeTool?: string;
  onToolChange?: (tool: string) => void;
  activeBrushSize?: number;
  onBrushSizeChange?: (size: number) => void;
}

export function CanvasTools({ 
    canvasType, 
    activeColor, onColorChange,
    activeShape, onShapeChange,
    activeSize, onSizeChange,
    activeWidth, onWidthChange,
    activeWaveform, onWaveformChange,
    activeBlur, onBlurChange,
    activeBPM, onBPMChange,
    activeTool, onToolChange,
    activeBrushSize, onBrushSizeChange
}: CanvasToolsProps) {
    
    return (
        <div className="space-y-4">
            {/* Paint Canvas Tools */}
            {canvasType === 'Paint' && (
                <>
                    <ColorPicker selectedColor={activeColor} onColorSelect={onColorChange} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Paint Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={activeTool === 'brush' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onToolChange?.('brush')}
                                    className="flex items-center gap-2"
                                >
                                    <Brush className="h-4 w-4" />
                                    Brush
                                </Button>
                                <Button
                                    variant={activeTool === 'eraser' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onToolChange?.('eraser')}
                                    className="flex items-center gap-2"
                                >
                                    <Eraser className="h-4 w-4" />
                                    Eraser
                                </Button>
                                <Button
                                    variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onToolChange?.('rectangle')}
                                    className="flex items-center gap-2"
                                >
                                    <Square className="h-4 w-4" />
                                    Rectangle
                                </Button>
                                <Button
                                    variant={activeTool === 'circle' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onToolChange?.('circle')}
                                    className="flex items-center gap-2"
                                >
                                    <Circle className="h-4 w-4" />
                                    Circle
                                </Button>
                                <Button
                                    variant={activeTool === 'bucket' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onToolChange?.('bucket')}
                                    className="flex items-center gap-2 col-span-2"
                                >
                                    <PaintBucket className="h-4 w-4" />
                                    Background
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Brush Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                    value={[activeBrushSize || 5]}
                                    onValueChange={(v) => onBrushSizeChange?.(v[0])}
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="text-center text-sm text-muted-foreground mt-2">
                                {activeBrushSize || 5}px
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Mosaic Canvas Tools */}
            {canvasType === 'Mosaic' && (
                <>
                    <ColorPicker selectedColor={activeColor} onColorSelect={onColorChange} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Tile Shape</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={activeShape} onValueChange={onShapeChange as (value: string) => void} className="flex gap-4">
                                <Label htmlFor="shape-square" className="flex flex-col items-center gap-2 cursor-pointer p-2 rounded-md border border-transparent has-[:checked]:border-primary">
                                    <Square className="h-8 w-8"/>
                                    <RadioGroupItem value="Square" id="shape-square" />
                                </Label>
                                 <Label htmlFor="shape-circle" className="flex flex-col items-center gap-2 cursor-pointer p-2 rounded-md border border-transparent has-[:checked]:border-primary">
                                    <Circle className="h-8 w-8"/>
                                    <RadioGroupItem value="Circle" id="shape-circle" />
                                </Label>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Watercolor Canvas Tools */}
            {canvasType === 'Watercolor' && (
                 <>
                    <ColorPicker selectedColor={activeColor} onColorSelect={onColorChange} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Droplet Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                    value={[activeSize]}
                                    onValueChange={(v) => onSizeChange(v[0])}
                                    min={5}
                                    max={40}
                                    step={1}
                                />
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Droplet Blur</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex items-center gap-2">
                                <Blend className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                    value={[activeBlur]}
                                    onValueChange={(v) => onBlurChange(v[0])}
                                    min={0}
                                    max={20}
                                    step={1}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Embroidery Canvas Tools */}
            {canvasType === 'Embroidery' && (
                <>
                    <ColorPicker selectedColor={activeColor} onColorSelect={onColorChange} />
                     <Card>
                        <CardHeader>
                            <CardTitle>Thread Width</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-foreground" />
                                <Slider
                                    value={[activeWidth]}
                                    onValueChange={(v) => onWidthChange(v[0])}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                />
                               <div className="h-3 w-3 rounded-full bg-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* AudioVisual Canvas Tools */}
            {canvasType === 'AudioVisual' && (
              <>
                <Card>
                    <CardHeader>
                        <CardTitle>Sound Wave</CardTitle>
                        <CardDescription>Change the texture of the sound.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Select onValueChange={onWaveformChange} defaultValue={activeWaveform}>
                            <SelectTrigger>
                                <div className="flex items-center gap-2">
                                <Waves className="h-4 w-4" />
                                <SelectValue placeholder="Select a sound wave" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sine">Sine (Smooth)</SelectItem>
                                <SelectItem value="square">Square (Buzzy)</SelectItem>
                                <SelectItem value="triangle">Triangle (Mellow)</SelectItem>
                                <SelectItem value="sawtooth">Sawtooth (Harsh)</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                      <CardTitle>Playback Speed</CardTitle>
                      <CardDescription>{activeBPM} BPM</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-muted-foreground" />
                          <Slider
                              value={[activeBPM]}
                              onValueChange={(v) => onBPMChange(v[0])}
                              min={60}
                              max={240}
                              step={5}
                          />
                      </div>
                  </CardContent>
                </Card>
              </>
            )}
        </div>
    );
}
