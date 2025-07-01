'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, Contribution, User } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Play, Square as StopIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
  activeWaveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  activeBPM: number;
}

const COLS = 16;
const ROWS = 8; 
const PITCHES = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63]; // C Major scale, high to low

export function AudioVisualCanvas({ project, contributions, onContribute, user, activeWaveform, activeBPM }: CanvasProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    const grid = new Map<string, boolean>();
    contributions.forEach(c => {
        if (c.data?.col !== undefined && c.data?.row !== undefined) {
            grid.set(`${c.data.col},${c.data.row}`, true);
        }
    });

    const secondsPerStep = (60 / activeBPM) / 2; // 8th notes

    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameId = useRef<number>();
    const schedulerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const nextNoteTimeRef = useRef(0.0);
    const stepRef = useRef(0);

    const scheduleNotes = useCallback(() => {
        if (!audioContextRef.current) return;
        const ac = audioContextRef.current;

        while (nextNoteTimeRef.current < ac.currentTime + 0.1) {
            const current_col = stepRef.current;
            for (let row = 0; row < ROWS; row++) {
                if (grid.has(`${current_col},${row}`)) {
                    const osc = ac.createOscillator();
                    const gainNode = ac.createGain();
                    osc.connect(gainNode);
                    gainNode.connect(ac.destination);
                    osc.type = activeWaveform;
                    osc.frequency.value = PITCHES[row];
                    gainNode.gain.setValueAtTime(0.3, nextNoteTimeRef.current);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, nextNoteTimeRef.current + secondsPerStep * 0.9);
                    osc.start(nextNoteTimeRef.current);
                    osc.stop(nextNoteTimeRef.current + secondsPerStep * 0.9);
                }
            }
            nextNoteTimeRef.current += secondsPerStep;
            stepRef.current = (stepRef.current + 1) % COLS;
        }
        schedulerTimerRef.current = setTimeout(scheduleNotes, 25.0);
    }, [grid, activeWaveform, secondsPerStep]);
    
    const visualScheduler = useCallback(() => {
        if (isPlaying && audioContextRef.current) {
            const timeSincePlayStart = audioContextRef.current.currentTime - (nextNoteTimeRef.current - (stepRef.current + COLS) * secondsPerStep);
            const step = Math.floor(timeSincePlayStart / secondsPerStep) % COLS;
            setCurrentStep(step);
        }
        animationFrameId.current = requestAnimationFrame(visualScheduler);
    }, [isPlaying, secondsPerStep]);


    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if(schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            setCurrentStep(-1);
        } else {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            audioContextRef.current.resume();
            setIsPlaying(true);
            stepRef.current = 0;
            nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.1;
            scheduleNotes();
            animationFrameId.current = requestAnimationFrame(visualScheduler);
        }
    };
    
    useEffect(() => {
        return () => {
            if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    const handleCellClick = (col: number, row: number) => {
        if (!user) return;
        const key = `${col},${row}`;
        // The `active` property will be true if we are adding a note, false if removing.
        onContribute({ col, row, active: !grid.has(key) });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/20 gap-4">
             <div 
                className="grid bg-card border-2 border-border shadow-2xl relative overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    width: 'min(90vw, 90vh)',
                    aspectRatio: `${COLS} / ${ROWS}`,
                }}
            >
                {Array.from({ length: COLS * ROWS }).map((_, i) => {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    const isActive = grid.has(`${col},${row}`);
                    const isPlayingNote = isPlaying && col === currentStep;

                    return (
                        <div
                            key={`${col}-${row}`}
                            className={cn(
                                'w-full h-full border-r border-b border-muted/20 flex items-center justify-center',
                                user ? 'cursor-pointer' : ''
                            )}
                            onClick={() => handleCellClick(col, row)}
                        >
                            <div className={cn(
                                'w-3/4 h-3/4 rounded-sm transition-all duration-200',
                                {
                                    'bg-destructive animate-pulse': isPlayingNote && isActive, // Red and pulsing when playing
                                    'bg-primary': isActive && !isPlayingNote, // Primary color when active but not playing
                                    'bg-muted hover:bg-muted-foreground/20': !isActive, // Muted when inactive
                                }
                            )} />
                        </div>
                    );
                })}
            </div>
            <Button onClick={togglePlay} size="lg" className="w-32">
                {isPlaying ? <StopIcon className="mr-2" /> : <Play className="mr-2" />}
                {isPlaying ? 'Stop' : 'Play'}
            </Button>
        </div>
    );
}
