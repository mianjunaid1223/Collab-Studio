'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, Contribution, User } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Play, Square as StopIcon } from 'lucide-react';

interface CanvasProps {
  project: Project;
  contributions: Contribution[];
  onContribute: (data: any) => Promise<void>;
  user: User | null;
}

const COLS = 16;
const ROWS = 8; 
const PITCHES = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63]; // C Major scale, high to low
const BPM = 120;
const SECONDS_PER_STEP = (60 / BPM) / 2; // 8th notes

export function AudioVisualCanvas({ project, contributions, onContribute, user }: CanvasProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    const grid = new Map<string, boolean>();
    contributions.forEach(c => {
        if (c.data?.col !== undefined && c.data?.row !== undefined) {
            grid.set(`${c.data.col},${c.data.row}`, true);
        }
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const schedulerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const visualTimerRef = useRef<NodeJS.Timeout | null>(null);
    const nextNoteTimeRef = useRef(0.0);
    const stepRef = useRef(0);

    const scheduleNotes = useCallback(() => {
        if (!audioContextRef.current) return;
        while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
            for (let row = 0; row < ROWS; row++) {
                if (grid.has(`${stepRef.current},${row}`)) {
                    const osc = audioContextRef.current.createOscillator();
                    const gainNode = audioContextRef.current.createGain();
                    osc.connect(gainNode);
                    gainNode.connect(audioContextRef.current.destination);
                    osc.type = 'sine';
                    osc.frequency.value = PITCHES[row];
                    gainNode.gain.setValueAtTime(0.3, nextNoteTimeRef.current);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, nextNoteTimeRef.current + SECONDS_PER_STEP * 0.9);
                    osc.start(nextNoteTimeRef.current);
                    osc.stop(nextNoteTimeRef.current + SECONDS_PER_STEP * 0.9);
                }
            }
            nextNoteTimeRef.current += SECONDS_PER_STEP;
            stepRef.current = (stepRef.current + 1) % COLS;
        }
        schedulerTimerRef.current = setTimeout(scheduleNotes, 25.0);
    }, [grid]);
    
    const updateVisuals = useCallback(() => {
       if (!audioContextRef.current || !isPlaying) return;
       
       const nextStepIndex = stepRef.current;
       const currentTime = audioContextRef.current.currentTime;
       const timeToNextNote = nextNoteTimeRef.current - currentTime - (COLS - nextStepIndex) * SECONDS_PER_STEP;
       
       const visualStep = (stepRef.current - 1 + COLS) % COLS;
       setCurrentStep(visualStep);
       
       visualTimerRef.current = setTimeout(updateVisuals, SECONDS_PER_STEP * 1000);
    }, [isPlaying]);


    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if(schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
            if(visualTimerRef.current) clearTimeout(visualTimerRef.current);
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
            updateVisuals();
        }
    };
    
    useEffect(() => {
        return () => {
            if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
            if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    const handleCellClick = (col: number, row: number) => {
        if (!user) return;
        const key = `${col},${row}`;
        onContribute({ col, row, active: !grid.has(key) });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/20 gap-4">
             <div 
                className="grid bg-card border-2 border-border shadow-2xl"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    width: 'min(90vw, 80vh)',
                    aspectRatio: '16 / 8',
                }}
            >
                {Array.from({ length: COLS * ROWS }).map((_, i) => {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    const isActive = grid.has(`${col},${row}`);
                    const isPlayingStep = isPlaying && col === currentStep;

                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`w-full h-full border-r border-b border-muted/20 flex items-center justify-center transition-colors duration-100 ${user ? 'cursor-pointer' : ''} ${isPlayingStep ? 'bg-accent' : ''}`}
                            onClick={() => handleCellClick(col, row)}
                        >
                            <div className={`w-3/4 h-3/4 rounded-sm transition-colors ${isActive ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/20'}`} />
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