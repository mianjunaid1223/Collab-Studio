'use client';

import type { Project, Contribution, User } from "@/lib/types";
import { EmbroideryCanvas } from "./embroidery-canvas";
import { MosaicCanvas } from "./mosaic-canvas";
import { WatercolorCanvas } from "./watercolor-canvas";
import { TypographicCanvas } from "./typographic-canvas";
import { AudioVisualCanvas } from "./audiovisual-canvas";

interface CanvasSwitcherProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
}

export function CanvasSwitcher({ project, contributions, onContribute, user }: CanvasSwitcherProps) {
  const props = { project, contributions, onContribute, user };

  switch (project.canvasType) {
    case 'Embroidery':
      return <EmbroideryCanvas {...props} />;
    case 'Mosaic':
      return <MosaicCanvas {...props} />;
    case 'Watercolor':
      return <WatercolorCanvas {...props} />;
    case 'Typographic':
      return <TypographicCanvas {...props} />;
    case 'AudioVisual':
      return <AudioVisualCanvas {...props} />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Unknown Canvas Type</h2>
          <p className="text-muted-foreground">The canvas type '{project.canvasType}' is not supported.</p>
        </div>
      );
  }
}
