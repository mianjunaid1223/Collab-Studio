'use client';

import type { Project, Contribution, User, CanvasType } from "@/lib/types";
import { EmbroideryCanvas } from "./embroidery-canvas";
import { MosaicCanvas } from "./mosaic-canvas";
import { WatercolorCanvas } from "./watercolor-canvas";
import { AudioVisualCanvas } from "./audiovisual-canvas";
import { PaintCanvas } from "./paint-canvas";

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
  activeBlur: number;
  activeBPM: number;
  // Paint canvas tools
  activeTool: string;
  activeBrushSize: number;
  // Filtering and highlighting
  filteredContributions?: Contribution[];
  highlightUserId?: string | null;
}

export function CanvasSwitcher({ project, contributions, onContribute, user, filteredContributions, highlightUserId, ...toolProps }: CanvasSwitcherProps) {
  
  // Use filtered contributions if provided, otherwise use all contributions
  const displayContributions = filteredContributions || contributions;
  
  switch (project.canvasType) {
    case 'Embroidery':
      return <EmbroideryCanvas 
        project={project} 
        contributions={displayContributions} 
        onContribute={onContribute} 
        user={user} 
        activeWidth={toolProps.activeWidth}
        activeColor={toolProps.activeColor}
        highlightUserId={highlightUserId}
        />;
    case 'Mosaic':
      return <MosaicCanvas 
        project={project}
        contributions={displayContributions}
        onContribute={onContribute}
        user={user}
        activeColor={toolProps.activeColor}
        activeShape={toolProps.activeShape}
        highlightUserId={highlightUserId}
        />;
    case 'Watercolor':
      return <WatercolorCanvas
        project={project}
        contributions={displayContributions}
        onContribute={onContribute}
        user={user}
        activeColor={toolProps.activeColor}
        activeSize={toolProps.activeSize}
        activeBlur={toolProps.activeBlur}
        highlightUserId={highlightUserId}
       />;
    case 'AudioVisual':
      return <AudioVisualCanvas 
        project={project} 
        contributions={displayContributions} 
        onContribute={onContribute} 
        user={user}
        activeWaveform={toolProps.activeWaveform}
        activeBPM={toolProps.activeBPM}
        highlightUserId={highlightUserId}
        />;
    case 'Paint':
      return <PaintCanvas
        project={project}
        contributions={displayContributions}
        onContribute={onContribute}
        user={user}
        activeColor={toolProps.activeColor}
        activeTool={toolProps.activeTool}
        activeBrushSize={toolProps.activeBrushSize}
        highlightUserId={highlightUserId}
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
