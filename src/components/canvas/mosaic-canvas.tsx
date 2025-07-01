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
}

const GRID_SIZE = 32;

export function MosaicCanvas({ project, contributions, onContribute, user, activeColor }: CanvasProps) {
    const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

    const grid = new Map<string, Contribution['data']>();
    contributions.forEach(c => {
        if (c.data?.x !== undefined && c.data?.y !== undefined) {
            grid.set(`${c.data.x},${c.data.y}`, c.data);
        }
    });

    const handleCellClick = (x: number, y: number) => {
        if (!user) return;
        onContribute({ x, y, color: activeColor });
    };

    return (
        <div className="flex items-center justify-center w-full h-full p-4 md:p-8">
            <div 
                className="grid bg-card border-2 border-border shadow-2xl"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                    width: 'min(90vw, 90vh)',
                    height: 'min(90vw, 90vh)',
                    aspectRatio: '1 / 1',
                }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const key = `${x},${y}`;
                    const cellData = grid.get(key);

                    return (
                        <div
                            key={key}
                            className="w-full h-full border-r border-b border-muted/20 cursor-pointer"
                            style={{ backgroundColor: cellData ? cellData.color : 'transparent' }}
                            onClick={() => handleCellClick(x, y)}
                            onMouseEnter={() => setHoveredCell({ x, y })}
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            {hoveredCell && hoveredCell.x === x && hoveredCell.y === y && !cellData && user && (
                                <div 
                                    className="w-full h-full transition-colors duration-100"
                                    style={{ backgroundColor: activeColor, opacity: 0.5 }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
