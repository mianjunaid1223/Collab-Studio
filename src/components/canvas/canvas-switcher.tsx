'use client';

import type { Project, Contribution, User, CanvasType } from "@/lib/types";
import { EmbroideryCanvas } from "./embroidery-canvas";
import { MosaicCanvas } from "./mosaic-canvas";
import { WatercolorCanvas } from "./watercolor-canvas";
import { AudioVisualCanvas } from "./audiovisual-canvas";

interface CanvasSwitcherProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeShape: 'Square' | 'Circle';
  activeSize: number;
  activeWidth: number;
  activeWaveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

export function CanvasSwitcher({ project, contributions, onContribute, user, ...toolProps }: CanvasSwitcherProps) {
  
  switch (project.canvasType) {
    case 'Embroidery':
      return <EmbroideryCanvas 
        project={project} 
        contributions={contributions} 
        onContribute={onContribute} 
        user={user} 
        activeWidth={toolProps.activeWidth}
        activeColor={toolProps.activeColor}
        />;
    case 'Mosaic':
      return <MosaicCanvas 
        project={project}
        contributions={contributions}
        onContribute={onContribute}
        user={user}
        activeColor={toolProps.activeColor}
        activeShape={toolProps.activeShape}
        />;
    case 'Watercolor':
      return <WatercolorCanvas
        project={project}
        contributions={contributions}
        onContribute={onContribute}
        user={user}
        activeColor={toolProps.activeColor}
        activeSize={toolProps.activeSize}
       />;
    case 'AudioVisual':
      return <AudioVisualCanvas 
        project={project} 
        contributions={contributions} 
        onContribute={onContribute} 
        user={user}
        activeWaveform={toolProps.activeWaveform}
        />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Unknown Canvas Type</h2>
          <p className="text-muted-foreground">The canvas type '{project.canvasType}' is not supported.</p>
        </div>
      );
  }
}
