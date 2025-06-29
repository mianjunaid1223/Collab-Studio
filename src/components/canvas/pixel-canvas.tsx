'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PixelCanvasProps {
  width: number;
  height: number;
  palette: string[];
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 30;
const GRID_COLOR = 'rgba(0,0,0,0.1)';

const PixelCanvas: React.FC<PixelCanvasProps> = ({ width, height, palette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(palette[0]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // TODO: Draw placed pixels data here

    if (zoom > 5) {
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

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(0, 0, width, height);
    
    ctx.restore();
  }, [width, height, zoom, pan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
        if(canvas) {
            draw();
        }
    }
    window.addEventListener('resize', handleResize);

    if (canvas && canvas.clientWidth > 0) {
        const newZoom = Math.min(canvas.clientWidth / width, canvas.clientHeight / height) * 0.9;
        setZoom(newZoom);
        setPan({
            x: (canvas.clientWidth - width * newZoom) / 2,
            y: (canvas.clientHeight - height * newZoom) / 2,
        });
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [width, height, draw]);

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
    if (e.button === 1 || e.ctrlKey) {
      e.preventDefault();
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
    } else if (e.button === 0) {
        placePixel(e);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scrollDelta = -e.deltaY;
    const zoomFactor = Math.pow(1.005, scrollDelta);

    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * zoomFactor));

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

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
      className="w-full h-full bg-muted/50 touch-none"
      style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
    />
  );
};

export default PixelCanvas;
