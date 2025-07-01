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

    const handleDownload = () => {
        let fileContent = '';
        let fileExtension = '';
        let mimeType = '';

        if (project.canvasType === 'AudioVisual') {
            fileContent = generateJsonContent(contributions);
            fileExtension = 'json';
            mimeType = 'application/json';
        } else {
            fileContent = generateSvgContent(project, contributions);
            fileExtension = 'svg';
            mimeType = 'image/svg+xml';
        }

        if (!fileContent) return;

        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFilename(project.title)}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Button className="w-full mt-4" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Artwork
        </Button>
    );
}
