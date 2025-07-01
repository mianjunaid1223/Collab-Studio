'use client';
import { useState } from 'react';
import type { Project, Contribution, User } from "@/lib/types";

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeColor: string;
  activeChar: string;
}

const GRID_SIZE = 24;

export function TypographicCanvas({ project, contributions, onContribute, user, activeColor, activeChar }: CanvasProps) {
    const grid = new Map<string, Contribution['data']>();
    contributions.forEach(c => {
        if (c.data?.x !== undefined && c.data?.y !== undefined) {
            grid.set(`${c.data.x},${c.data.y}`, c.data);
        }
    });

    const handleCellClick = (x: number, y: number) => {
        if (!user || !activeChar) return;
        onContribute({ x, y, color: activeColor, char: activeChar });
    };

    return (
        <div className="flex items-center justify-center w-full h-full p-4 md:p-8">
            <div 
                className="grid bg-card border-2 border-border shadow-2xl font-mono"
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
                            className="w-full h-full border-r border-b border-muted/20 cursor-pointer flex items-center justify-center text-xl md:text-2xl lg:text-3xl select-none"
                            onClick={() => handleCellClick(x, y)}
                        >
                            {cellData ? (
                                <span style={{ color: cellData.color }}>{cellData.char}</span>
                            ) : (
                                user && activeChar && <span className="text-muted-foreground/30 opacity-0 hover:opacity-100 transition-opacity">{activeChar}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
