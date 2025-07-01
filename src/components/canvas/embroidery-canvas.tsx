'use client';
import { useState, useRef, MouseEvent } from 'react';
import type { Project, Contribution, User } from "@/lib/types";

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeWidth: number;
  activeColor: string;
}

export function EmbroideryCanvas({ project, contributions, onContribute, user, activeWidth, activeColor }: CanvasProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{x: number, y: number} | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const getSVGCoords = (e: MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        return { x: svgP.x, y: svgP.y };
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (!user) return;
        e.preventDefault();
        setIsDrawing(true);
        const coords = getSVGCoords(e);
        setStartPoint(coords);
        setCurrentPoint(coords);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing || !user) return;
        e.preventDefault();
        setCurrentPoint(getSVGCoords(e));
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!isDrawing || !user || !startPoint || !currentPoint) return;
        e.preventDefault();
        if (Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y) > 10) { // minimum stitch length
            onContribute({
                startX: startPoint.x,
                startY: startPoint.y,
                endX: currentPoint.x,
                endY: currentPoint.y,
                color: activeColor,
                width: activeWidth,
            });
        }
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
    };
    
    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-muted/20">
            <svg
                ref={svgRef}
                viewBox="0 0 800 800"
                className="aspect-square bg-card shadow-2xl cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // End drawing if mouse leaves canvas
                style={{
                  width: 'min(90vw, 90vh)',
                  backgroundColor: '#fdfdf5',
                  backgroundImage: 'linear-gradient(rgba(180,160,150,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,150,0.05) 1px, transparent 1px)',
                  backgroundSize: '15px 15px',
                }}
            >
                {contributions.map((c) => (
                    <line
                        key={c.id}
                        x1={c.data.startX}
                        y1={c.data.startY}
                        x2={c.data.endX}
                        y2={c.data.endY}
                        stroke={c.data.color}
                        strokeWidth={c.data.width || 3}
                        strokeLinecap="round"
                    />
                ))}
                {isDrawing && startPoint && currentPoint && (
                    <line
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={currentPoint.x}
                        y2={currentPoint.y}
                        stroke={activeColor}
                        strokeWidth={activeWidth}
                        strokeLinecap="round"
                        strokeDasharray="5,5"
                    />
                )}
            </svg>
        </div>
    );
}
