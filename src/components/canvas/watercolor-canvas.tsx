'use client';
import { useRef, MouseEvent } from 'react';
import type { Project, Contribution, User } from "@/lib/types";

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeSize: number;
  activeBlur: number;
}

export function WatercolorCanvas({ project, contributions, onContribute, user, activeColor, activeSize, activeBlur }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!user || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onContribute({ x, y, color: activeColor, size: activeSize, blur: activeBlur });
  };

  return (
    <div 
      ref={canvasRef}
      className="relative aspect-square w-full bg-card shadow-2xl overflow-hidden cursor-pointer rounded-lg"
      onClick={handleCanvasClick}
      style={{
        backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {contributions.map((c) => (
        <div
          key={c.id}
          className="absolute rounded-full"
          style={{
            left: `${c.data.x}%`,
            top: `${c.data.y}%`,
            width: `${c.data.size}%`,
            height: `${c.data.size}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${c.data.color}99 0%, ${c.data.color}00 70%)`,
            filter: `blur(${c.data.blur ?? 8}px)`,
          }}
        />
      ))}

      {user && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
            Click to add a droplet of ink
        </div>
      )}
    </div>
  );
}
