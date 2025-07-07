     'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Project, Contribution, User } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Brush, Eraser, PaintBucket, Square, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeTool: string;
  activeBrushSize: number;
  highlightUserId?: string | null;
}

type PaintTool = 'brush' | 'eraser' | 'rectangle' | 'circle' | 'bucket';

export function PaintCanvas({ 
  project, 
  contributions, 
  onContribute, 
  user, 
  activeColor, 
  activeTool, 
  activeBrushSize,
  highlightUserId
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [currentTool, setCurrentTool] = useState<PaintTool>(activeTool as PaintTool || 'brush');

  // Deduplicate contributions to prevent duplicate keys
  const uniqueContributions = contributions.filter((contribution, index, self) => 
    index === self.findIndex(c => c.id === contribution.id)
  );

  // Initialize canvas and redraw contributions
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;
    overlayCanvas.width = 800;
    overlayCanvas.height = 800;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Redraw all contributions
    uniqueContributions.forEach(contribution => {
      const data = contribution.data;
      if (!data) return;

      // Check if this contribution should be highlighted or dimmed
      const isHighlighted = highlightUserId && contribution.userId.toString() === highlightUserId;
      const shouldDim = highlightUserId && !isHighlighted;

      ctx.globalAlpha = shouldDim ? 0.3 : 1;
      ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';
      
      switch (data.tool) {
        case 'brush':
        case 'eraser':
          if (data.points && data.points.length > 1) {
            ctx.strokeStyle = data.color || '#000000';
            ctx.lineWidth = data.brushSize || 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(data.points[0].x, data.points[0].y);
            
            for (let i = 1; i < data.points.length; i++) {
              ctx.lineTo(data.points[i].x, data.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          ctx.fillStyle = data.color || '#000000';
          ctx.fillRect(data.x, data.y, data.width, data.height);
          break;
        case 'circle':
          ctx.fillStyle = data.color || '#000000';
          ctx.beginPath();
          // Use diameter instead of radius
          const radius = data.diameter / 2;
          ctx.arc(data.x + radius, data.y + radius, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'bucket':
          // Background fill
          ctx.fillStyle = data.color || '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
      }
      
      ctx.globalAlpha = 1; // Reset alpha
    });
  }, [uniqueContributions, highlightUserId]);

  // Update tool when activeTool prop changes
  useEffect(() => {
    setCurrentTool(activeTool as PaintTool || 'brush');
  }, [activeTool]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const drawPreview = useCallback((coords: { x: number; y: number }) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !startPoint) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    ctx.strokeStyle = activeColor;
    ctx.fillStyle = activeColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (currentTool === 'rectangle') {
      const width = coords.x - startPoint.x;
      const height = coords.y - startPoint.y;
      ctx.strokeRect(
        Math.min(startPoint.x, coords.x),
        Math.min(startPoint.y, coords.y),
        Math.abs(width),
        Math.abs(height)
      );
    } else if (currentTool === 'circle') {
      const diameter = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));
      const radius = diameter / 2;
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.setLineDash([]); // Reset line dash
  }, [startPoint, activeColor, currentTool]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user) return;
    
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPoint(coords);

    if (currentTool === 'bucket') {
      // Handle background fill immediately
      onContribute({
        tool: 'bucket',
        color: activeColor,
        x: coords.x,
        y: coords.y
      });
      return;
    }

    if (currentTool === 'brush' || currentTool === 'eraser') {
      // Start a new stroke
      setCurrentStroke([coords]);
    }
  }, [user, getCanvasCoords, currentTool, activeColor, onContribute]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (!isDrawing || !user || !startPoint) {
      return;
    }

    if (currentTool === 'brush' || currentTool === 'eraser') {
      // Add point to current stroke and draw live preview
      const newStroke = [...currentStroke, coords];
      setCurrentStroke(newStroke);

      // Draw live preview on overlay
      const overlayCanvas = overlayCanvasRef.current;
      const overlayCtx = overlayCanvas?.getContext('2d');
      if (overlayCtx && overlayCanvas && currentStroke.length > 0) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayCtx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
        overlayCtx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : activeColor;
        overlayCtx.lineWidth = activeBrushSize;
        overlayCtx.lineCap = 'round';
        overlayCtx.lineJoin = 'round';
        
        overlayCtx.beginPath();
        overlayCtx.moveTo(currentStroke[0].x, currentStroke[0].y);
        
        for (let i = 1; i < newStroke.length; i++) {
          overlayCtx.lineTo(newStroke[i].x, newStroke[i].y);
        }
        overlayCtx.stroke();
      }
    } else {
      // Draw shape preview
      drawPreview(coords);
    }
  }, [isDrawing, user, startPoint, getCanvasCoords, currentTool, activeColor, activeBrushSize, currentStroke, drawPreview]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !user || !startPoint) return;

    const coords = getCanvasCoords(e);

    // Clear overlay
    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas?.getContext('2d');
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    if (currentTool === 'rectangle') {
      const width = coords.x - startPoint.x;
      const height = coords.y - startPoint.y;
      onContribute({
        tool: 'rectangle',
        color: activeColor,
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (currentTool === 'circle') {
      const diameter = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));
      onContribute({
        tool: 'circle',
        color: activeColor,
        x: startPoint.x - diameter / 2,
        y: startPoint.y - diameter / 2,
        diameter: diameter
      });
    } else if (currentTool === 'brush' || currentTool === 'eraser') {
      // Send the complete stroke
      const finalStroke = [...currentStroke, coords];
      if (finalStroke.length > 1) {
        onContribute({
          tool: currentTool,
          color: currentTool === 'eraser' ? '#ffffff' : activeColor,
          brushSize: activeBrushSize,
          points: finalStroke
        });
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentStroke([]);
  }, [isDrawing, user, getCanvasCoords, currentTool, activeColor, activeBrushSize, startPoint, onContribute, currentStroke]);

  const toolButtons = [
    { tool: 'brush' as PaintTool, icon: Brush, label: 'Brush' },
    { tool: 'eraser' as PaintTool, icon: Eraser, label: 'Eraser' },
    { tool: 'rectangle' as PaintTool, icon: Square, label: 'Rectangle' },
    { tool: 'circle' as PaintTool, icon: Circle, label: 'Circle' },
    { tool: 'bucket' as PaintTool, icon: PaintBucket, label: 'Background' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Tool Selection */}
      <div className="flex gap-2 p-2 bg-card rounded-lg border">
        {toolButtons.map(({ tool, icon: Icon, label }) => (
          <Button
            key={tool}
            variant={currentTool === tool ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool(tool)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Canvas Container */}
      <div className="relative w-full h-full aspect-square">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full bg-white border-2 border-border shadow-2xl rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
        <canvas
          className="absolute inset-0 w-full h-full cursor-crosshair rounded-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setStartPoint(null);
            setCurrentStroke([]);
            // Clear overlay on mouse leave
            const overlayCanvas = overlayCanvasRef.current;
            const overlayCtx = overlayCanvas?.getContext('2d');
            if (overlayCtx && overlayCanvas) {
              overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            }
          }}
        />
      </div>

      {user && (
        <div className="text-sm text-muted-foreground text-center">
          Click and drag to paint • Select tools above • Background fills entire canvas
        </div>
      )}
    </div>
  );
}
