'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PixelCanvasProps {
  width: number;
  height: number;
  palette: string[];
  selectedColor: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 40;
const GRID_COLOR = 'rgba(0,0,0,0.1)';

const PixelCanvas: React.FC<PixelCanvasProps> = ({ width, height, selectedColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [pixels, setPixels] = useState<Map<string, string>>(new Map());
  const [isMounted, setIsMounted] = useState(false);
  const touchCache = useRef<{ distance: number | null }>({ distance: null });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const draw = useCallback(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    for (const [key, color] of pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }

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
  }, [width, height, zoom, pan, isMounted, pixels]);

  useEffect(() => {
    if (!isMounted) return;
    
    const setInitialView = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth > 0 && clientHeight > 0) {
        const newZoom = Math.min(clientWidth / width, clientHeight / height) * 0.9;
        setZoom(newZoom);
        setPan({
          x: (clientWidth - width * newZoom) / 2,
          y: (clientHeight - height * newZoom) / 2,
        });
      }
    };
    
    setInitialView();
    window.addEventListener('resize', setInitialView);
    return () => window.removeEventListener('resize', setInitialView);
  }, [isMounted, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true);
    setLastPanPosition({ x: clientX, y: clientY });
  };
  
  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning) return;
    const dx = clientX - lastPanPosition.x;
    const dy = clientY - lastPanPosition.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPanPosition({ x: clientX, y: clientY });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scrollDelta = -e.deltaY;
    const zoomFactor = Math.pow(1.005, scrollDelta);
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const placePixel = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    if (!coords) return;
    
    const pixelX = Math.floor(coords.x);
    const pixelY = Math.floor(coords.y);

    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
      setPixels(prevPixels => {
        const newPixels = new Map(prevPixels);
        newPixels.set(`${pixelX},${pixelY}`, selectedColor);
        return newPixels;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey) {
      e.preventDefault();
      handlePanStart(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handlePanMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      handlePanEnd();
    } else if (e.button === 0 && !e.ctrlKey) {
        placePixel(e.clientX, e.clientY);
    }
  };

  const getTouchDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList) => {
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
        setIsPanning(false);
        touchCache.current.distance = getTouchDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
        handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && touchCache.current.distance !== null) {
        const newDist = getTouchDistance(e.touches);
        const {x: centerX, y: centerY} = getTouchCenter(e.touches);
        const zoomFactor = newDist / touchCache.current.distance;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const screenX = centerX - rect.left;
        const screenY = centerY - rect.top;

        const worldX = (screenX - pan.x) / zoom;
        const worldY = (screenY - pan.y) / zoom;
        const newPanX = screenX - worldX * newZoom;
        const newPanY = screenY - worldY * newZoom;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
        touchCache.current.distance = newDist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (isPanning && e.touches.length === 0) {
          handlePanEnd();
      }
      if (e.touches.length < 2) {
        touchCache.current.distance = null;
      }
  };
  
  return (
    <div className="w-full h-full bg-muted/20 overflow-hidden relative touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handlePanEnd}
        onWheel={handleZoom}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full"
        style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
      />
    </div>
  );
};

export default PixelCanvas;
