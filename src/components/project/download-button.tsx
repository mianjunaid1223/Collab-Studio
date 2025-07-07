'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Project, Contribution } from "@/lib/types";

interface DownloadButtonProps {
    project: Project;
    contributions: Contribution[];
}

// Helper to sanitize filenames
const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

// SVG Generation Logic
const generateSvgContent = (project: Project, contributions: Contribution[]): string => {
    const width = 800;
    const height = 800;
    let elements = '';

    switch (project.canvasType) {
        case 'Embroidery':
            elements = contributions.map(c => 
                `<line x1="${c.data.startX}" y1="${c.data.startY}" x2="${c.data.endX}" y2="${c.data.endY}" stroke="${c.data.color}" stroke-width="${c.data.width}" stroke-linecap="round" />`
            ).join('');
            return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: #fdfdf5;">${elements}</svg>`;

        case 'Mosaic':
            const tileSize = 800 / 32;
            elements = contributions.map(c => {
                const props = `fill="${c.data.color}"`;
                if (c.data.shape === 'Circle') {
                    return `<circle cx="${c.data.x * tileSize + tileSize / 2}" cy="${c.data.y * tileSize + tileSize / 2}" r="${tileSize / 2}" ${props} />`;
                }
                return `<rect x="${c.data.x * tileSize}" y="${c.data.y * tileSize}" width="${tileSize}" height="${tileSize}" ${props} />`;
            }).join('');
            return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: #f0f0f0;">${elements}</svg>`;

        case 'Watercolor':
             elements = contributions.map((c, i) => `
                <defs>
                    <radialGradient id="grad${i}">
                    <stop offset="0%" stop-color="${c.data.color}" stop-opacity="0.6" />
                    <stop offset="70%" stop-color="${c.data.color}" stop-opacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="${c.data.x}%" cy="${c.data.y}%" r="${c.data.size / 2}%" fill="url(#grad${i})" style="filter: blur(${c.data.blur}px);" />
            `).join('');
            return `<svg width="${width}" height="${height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">${elements}</svg>`;

        case 'Paint':
            elements = contributions.map(c => {
                switch (c.data.tool) {
                    case 'brush':
                    case 'eraser':
                        if (c.data.points && c.data.points.length > 0) {
                            const pathData = c.data.points.map((point: any, idx: number) => 
                                `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                            ).join(' ');
                            return `<path d="${pathData}" stroke="${c.data.color || '#000000'}" stroke-width="${c.data.brushSize || 5}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
                        }
                        return '';
                    case 'rectangle':
                        return `<rect x="${c.data.x}" y="${c.data.y}" width="${c.data.width}" height="${c.data.height}" fill="${c.data.color || '#000000'}" />`;
                    case 'circle':
                        return `<circle cx="${c.data.x + c.data.radius}" cy="${c.data.y + c.data.radius}" r="${c.data.radius}" fill="${c.data.color || '#000000'}" />`;
                    case 'bucket':
                        return `<rect x="0" y="0" width="${width}" height="${height}" fill="${c.data.color || '#000000'}" />`;
                    default:
                        return '';
                }
            }).join('');
            return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">${elements}</svg>`;

        default:
            return '';
    }
};

// JSON Generation Logic
const generateJsonContent = (contributions: Contribution[]): string => {
    const sequence = contributions.map(c => ({
        col: c.data.col,
        row: c.data.row,
        time: c.createdAt,
    }));
    return JSON.stringify({ sequence }, null, 2);
}


export function DownloadButton({ project, contributions }: DownloadButtonProps) {

    const handleDownload = async () => {
        if (project.canvasType === 'AudioVisual') {
            // Generate audio file for AudioVisual canvas
            await downloadAudioFile();
        } else {
            // Generate PNG for visual canvases
            await downloadPngFile();
        }
    };

    const downloadPngFile = async () => {
        const svgContent = generateSvgContent(project, contributions);
        if (!svgContent) return;

        // Create an SVG element
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        // Create an image element to render the SVG
        const img = new Image();
        img.onload = () => {
            // Create a canvas to convert SVG to PNG
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 800;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Set transparent background
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw the image
                ctx.drawImage(img, 0, 0);
                
                // Convert to PNG and download
                canvas.toBlob((blob) => {
                    if (blob) {
                        const pngUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = pngUrl;
                        a.download = `${sanitizeFilename(project.title)}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(pngUrl);
                    }
                }, 'image/png');
            }
            
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    };

    const downloadAudioFile = async () => {
        try {
            // Create audio context for generating the audio
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Generate audio sequence from contributions
            const audioSequence = generateAudioSequence(contributions);
            const duration = 10; // 10 seconds
            const sampleRate = audioContext.sampleRate;
            const length = sampleRate * duration;
            
            // Create an offline audio context for rendering
            const offlineContext = new OfflineAudioContext(1, length, sampleRate);
            
            // Render the audio sequence
            audioSequence.forEach(({ time, frequency, waveform }) => {
                const oscillator = offlineContext.createOscillator();
                const gainNode = offlineContext.createGain();
                
                oscillator.type = waveform;
                oscillator.frequency.setValueAtTime(frequency, time);
                gainNode.gain.setValueAtTime(0.1, time);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(offlineContext.destination);
                
                oscillator.start(time);
                oscillator.stop(time + 0.1);
            });
            
            // Render the audio buffer
            const audioBuffer = await offlineContext.startRendering();
            
            // Convert to WAV and download
            const wavBlob = audioBufferToWav(audioBuffer);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sanitizeFilename(project.title)}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error generating audio file:', error);
            // Fallback to JSON download
            const fileContent = generateJsonContent(contributions);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sanitizeFilename(project.title)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const generateAudioSequence = (contributions: Contribution[]) => {
        const PITCHES = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63];
        return contributions.map((c, index) => ({
            time: index * 0.125, // 8th notes at 120 BPM
            frequency: PITCHES[c.data.row] || 440,
            waveform: c.data.waveform || 'sine'
        }));
    };

    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert audio data
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    return (
        <Button className="w-full mt-4" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download {project.canvasType === 'AudioVisual' ? 'Audio' : 'Artwork'}
        </Button>
    );
}
