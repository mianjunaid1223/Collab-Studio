'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PixelCanvasProps {
  width: number;
  height: number;
  palette: string[];
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 20;
const GRID_COLOR = '#CCCCCC';

const PixelCanvas: React.FC<PixelCanvasProps> = ({ width, height, palette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(palette[0]);
  const { toast } = useToast();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas display size
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply pan and zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // TODO: Draw placed pixels data here

    // Draw grid
    if (zoom > 4) { // Only draw grid when zoomed in enough
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1 / zoom;
      
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [width, height, zoom, pan]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasCoords = (e: React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey) { // Middle mouse button or Ctrl+Click for panning
      setIsPanning(true);
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPosition.x;
      const dy = e.clientY - lastPanPosition.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    } else if (e.button === 0) { // Left click to place pixel
        placePixel(e);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - e.deltaY * 0.01));
    const zoomFactor = newZoom / zoom;

    const newPanX = mouseX - (mouseX - pan.x) * zoomFactor;
    const newPanY = mouseY - (mouseY - pan.y) * zoomFactor;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };
    
  const placePixel = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    const pixelX = Math.floor(coords.x);
    const pixelY = Math.floor(coords.y);

    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
      console.log(`Placing pixel at (${pixelX}, ${pixelY}) with color ${selectedColor}`);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.fillStyle = selectedColor;
      ctx.fillRect(pixelX, pixelY, 1, 1);
      ctx.restore();

      toast({
        title: "Pixel Placed!",
        description: `You placed a pixel at (${pixelX}, ${pixelY}).`,
      });
    }
  };


  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPanning(false)}
      onWheel={handleWheel}
      className="w-full h-[70vh] bg-gray-200 cursor-crosshair touch-none"
      style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
    />
  );
};

export default PixelCanvas;
