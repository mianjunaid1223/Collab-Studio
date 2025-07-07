'use client';
import { useState } from 'react';
import type { Project, Contribution, User } from "@/lib/types";
import { cn } from '@/lib/utils';

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeShape: 'Square' | 'Circle';
  highlightUserId?: string | null;
}

const GRID_SIZE = 32;

export function MosaicCanvas({ project, contributions, onContribute, user, activeColor, activeShape, highlightUserId }: CanvasProps) {
    const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

    const grid = new Map<string, Contribution['data']>();
    contributions.forEach(c => {
        if (c.data?.x !== undefined && c.data?.y !== undefined) {
            grid.set(`${c.data.x},${c.data.y}`, c.data);
        }
    });

    const handleCellClick = (x: number, y: number) => {
        if (!user) return;
        onContribute({ x, y, color: activeColor, shape: activeShape });
    };

    return (
        <div 
            className="grid bg-white border-2 border-border/20 shadow-2xl aspect-square w-full h-full rounded-lg"
            style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
        >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const key = `${x},${y}`;
                const cellData = grid.get(key);
                
                // Find the contribution for this cell to check highlighting
                const contribution = contributions.find(c => c.data?.x === x && c.data?.y === y);
                const isHighlighted = highlightUserId && contribution && contribution.userId.toString() === highlightUserId;
                const shouldDim = highlightUserId && !isHighlighted && cellData;

                return (
                    <div
                        key={key}
                        className={cn(
                          "w-full h-full border-r border-b border-muted/20 cursor-pointer flex items-center justify-center transition-all duration-300",
                          isHighlighted && "ring-2 ring-blue-400 ring-inset z-10",
                          shouldDim && "opacity-30"
                        )}
                        onClick={() => handleCellClick(x, y)}
                        onMouseEnter={() => setHoveredCell({ x, y })}
                        onMouseLeave={() => setHoveredCell(null)}
                    >
                         {cellData ? (
                            <div 
                                className={cn(
                                  'w-full h-full transition-all duration-300',
                                  cellData.shape === 'Circle' && 'rounded-full',
                                  isHighlighted && 'scale-110 shadow-lg animate-subtle-pulse'
                                )}
                                style={{ backgroundColor: cellData.color }}
                            />
                        ) : hoveredCell && hoveredCell.x === x && hoveredCell.y === y && user && (
                            <div 
                                className={cn('w-full h-full transition-colors duration-100', activeShape === 'Circle' && 'rounded-full')}
                                style={{ backgroundColor: activeColor, opacity: 0.5 }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
