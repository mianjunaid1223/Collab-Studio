'use client';
import { useRef, MouseEvent } from 'react';
import type { Project, Contribution, User } from "@/lib/types";
import { cn } from '@/lib/utils';

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeSize: number;
  activeBlur: number;
  highlightUserId?: string | null;
}

export function WatercolorCanvas({ project, contributions, onContribute, user, activeColor, activeSize, activeBlur, highlightUserId }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Deduplicate contributions to prevent duplicate keys
  const uniqueContributions = contributions.filter((contribution, index, self) => 
    index === self.findIndex(c => c.id === contribution.id)
  );

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
      className="relative aspect-square w-full h-full bg-white shadow-2xl overflow-hidden cursor-pointer rounded-lg"
      onClick={handleCanvasClick}
      style={{
        backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {uniqueContributions.map((c, index) => {
        const isHighlighted = highlightUserId && c.userId.toString() === highlightUserId;
        const shouldDim = highlightUserId && !isHighlighted;
        return (
          <div
            key={`${c.id}-${index}`}
            className={cn(
              "absolute rounded-full transition-all duration-300",
              isHighlighted && "animate-subtle-pulse"
            )}
            style={{
              left: `${c.data.x}%`,
              top: `${c.data.y}%`,
              width: `${c.data.size * (isHighlighted ? 1.2 : 1)}%`,
              height: `${c.data.size * (isHighlighted ? 1.2 : 1)}%`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${c.data.color}${isHighlighted ? 'cc' : '99'} 0%, ${c.data.color}00 70%)`,
              filter: `blur(${c.data.blur ?? 8}px) ${isHighlighted ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : ''}`,
              zIndex: isHighlighted ? 10 : 1,
              opacity: shouldDim ? 0.3 : 1,
            }}
          />
        );
      })}

      {user && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
            Click to add a droplet of ink
        </div>
      )}
    </div>
  );
}
