# Pixel Canvas Collab

[![Year Built](https://img.shields.io/badge/Year%20Built-2025-blue.svg)](#)


A collaborative digital canvas platform for mindfulness and creative teamwork. Create artwork collectively, one contribution at a time.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7.5-green?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

---

## Overview

Pixel Canvas Collab is a digital teamwork platform designed for synchronous creative collaboration. Users construct shared visual compositions through iterative contributions. Projects originate from text prompts rather than imported raster images, allowing contributors to interpret themes and assemble canvases collaboratively.

## Core Philosophy

| Principle | Architectural Application |
|---|---|
| Text-Driven Initialization | Projects begin with a conceptual text prompt. Image uploads are restricted to preserve interpretive freedom. |
| Collective Interpretation | Independent contributors contribute stroke elements or grid coordinates based on the project description. |
| Synchronous Execution | Real-time WebSocket broadcasting allows participants to observe incoming contributions live. |
| Mindful Interaction | Interfaces emphasize focus, calmness, and deliberate, measured input steps. |

---

## Key Capabilities

### Specialized Canvas Types

| Canvas Medium | Rendering Technique | Functional Description |
|---|---|---|
| Embroidery | Vector Stroke Simulation | Simulates thread-like paths with tension and layered overlap reminiscent of textile work |
| Mosaic | Coordinate Tile Grid | Snaps discrete color tiles onto a fixed dimension matrix |
| Watercolor | Dispersion Shader | Blends transparent layers with soft bleed gradients |
| AudioVisual | Synesthetic Audio Matrix | Positions musical note coordinates that produce acoustic pitch sequences and visual patterns |
| Paint | Raster Brush Canvas | Freehand raster stroke painting with customizable opacity and brush diameters |

### User Authentication and Identity

Authentication supports email and password credentials alongside Google OAuth providers. Sessions are verified using signed JWT tokens stored in HTTP-only cookies. User profiles track active streaks, completed canvases, and cumulative contribution counts.

### Collaborative Capabilities

| Feature | Scope |
|---|---|
| Real-Time Canvas Synchronization | Socket.io server dispatches state mutations to connected room participants with sub-100ms latency |
| Contributor Analytics | Public profiles display contribution history, activity heatmaps, and streak tracking |
| Completion Tracking | Dynamic completion meters track canvas coverage against target thresholds |
| Concurrency Control | Server-side validation handles simultaneous cell or stroke updates without state corruption |

### Project Management

| Capability | Scope |
|---|---|
| Project Creation | Provisions a canvas instance with text requirements, palette constraints, and canvas type |
| Discovery Directory | Search and filter ongoing, completed, and archived canvases |
| Administrative Controls | Role-based permissions to archive or delete active projects |
| Export Pipelines | Renders final canvases as high-resolution PNG images, WAV audio files (AudioVisual), or JSON manifests |

### Interface and Viewport Controls

The workspace includes coordinate pan and zoom transformations, a multi-spectrum color picker, fully responsive desktop and mobile viewports, and a high-contrast dark theme utilizing a muted blue palette.

---

## Technical Stack

| Layer | Technology | Version / Purpose |
|---|---|---|
| Frontend Framework | Next.js | 15.3.3 (App Router architecture) |
| UI Library | React | 18.3.1 |
| Type System | TypeScript | 5.0 |
| Utility Styling | Tailwind CSS | Utility-first design tokens |
| Component Primitives | shadcn/ui | Radix UI accessible headless components |
| Icon Set | Lucide React | Outlined vector iconography |
| Real-Time Client | Socket.io Client | 4.7.5 client WebSocket driver |
| API Handlers | Next.js Route Handlers | Serverless API endpoints |
| Real-Time Server | Socket.io Server | Custom server entry in pages/api/socket.ts |
| Database & ODM | MongoDB & Mongoose | Document datastore and schema models |
| Security & Auth | JWT & bcrypt | Session tokens and password hashing |
| Validation | Zod | Schema parsing for API bodies and forms |
| AI Integration | Google Genkit AI | Development flows and assistant tooling |
| Build Toolchain | Turbopack | Incremental bundler for development builds |

---

## Installation and Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- MongoDB 6.0+ instance (local service or MongoDB Atlas)

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/mianjunaid1223/Collab-Studio.git
cd Collab-Studio
```

2. Install dependencies:

```bash
npm install
```

3. Configure runtime environment variables:

Create a .env.local file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pixel-canvas-collab

# JWT Secret Token
JWT_SECRET=replace-with-a-cryptographically-secure-random-string

# Google OAuth Credentials (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Deployment Origin
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Genkit API Key (Optional)
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

4. Verify MongoDB availability:

Ensure the MongoDB daemon is active locally:

```bash
mongod --version
```

5. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Execution Modes

| Command | Action |
|---|---|
| npm run dev | Launches development server with Turbopack fast refresh |
| npm run build | Compiles production assets and server bundles |
| npm start | Executes production server build |
| npm run typecheck | Runs TypeScript compiler to verify type correctness |
| npm run lint | Evaluates code quality via ESLint |
| npm run genkit:dev | Launches Google Genkit developer workspace |
| npm run genkit:watch | Monitors Genkit AI schema changes |

---

## Directory Organization

```
Collab-Studio/
|-- src/
|   |-- app/                    # Next.js App Router route hierarchy
|   |   |-- (auth)/            # Authentication viewports (login, registration)
|   |   |-- create/            # Canvas project creation workflow
|   |   |-- explore/           # Discoverable project directory
|   |   |-- profile/           # User profile and contribution telemetry
|   |   |-- project/           # Dynamic project routes
|   |   |   `-- [id]/canvas/  # Interactive canvas workspace
|   |   `-- page.tsx           # Landing page
|   |-- components/            # Reusable UI component modules
|   |   |-- canvas/            # Medium implementations (Embroidery, Mosaic, Paint, etc.)
|   |   |-- layout/            # Navigation bar, footers, containers
|   |   |-- project/           # Project cards, metadata headers, progress bars
|   |   `-- ui/                # shadcn/ui component primitives
|   |-- context/               # React Context state providers
|   |-- hooks/                 # Custom React interaction hooks
|   |-- lib/                   # Utility libraries and data clients
|   |   |-- mongodb.ts         # Mongoose connection pool and schemas
|   |   |-- types.ts           # Shared TypeScript interfaces
|   |   `-- data.ts            # Query fetchers and mutations
|   |-- pages/                 # Pages router compatibility layer
|   |   `-- api/socket.ts      # Socket.io WebSocket server handler
|   `-- ai/                    # Google Genkit integration modules
|-- docs/                      # Technical specifications and blueprints
|   `-- blueprint.md           # System blueprint documentation
|-- public/                    # Static assets, branding, icons
|-- next.config.ts             # Next.js compiler settings
|-- tailwind.config.ts         # Tailwind design system configuration
|-- tsconfig.json              # TypeScript compilation rules
`-- package.json               # Package dependencies and scripts
```

---

## Canvas Mechanics Detailed

### Embroidery Canvas
Renders continuous vector filaments across a virtual cloth texture. Line width, tension, and thread layering are calculated on every mouse displacement to approximate embroidery stitches.

### Mosaic Canvas
Snaps discrete colored square or hexagonal tiles into an integer coordinate matrix. Users select a palette tone and populate open grid cells. Suitable for structured pixel art and pattern design.

### Watercolor Canvas
Calculates pigment transparency and boundary bleed using an HTML5 2D canvas context. Overlapping strokes accumulate density organically, mimicking aqueous paint dispersion on paper.

### AudioVisual Canvas
Associates spatial coordinates with musical frequencies and synthesizers. The horizontal axis maps to temporal beats, while the vertical axis maps to musical pitch. Users can trigger sequential playback or export the composition as an uncompressed WAV audio file.

### Paint Canvas
A freehand digital brush workspace supporting adjustable brush sizes, opacity blends, and stroke smoothing algorithms.

---

## Real-Time Socket Architecture

Real-time collaboration is powered by Socket.io:

- Room Isolation: Each canvas operates within an isolated room identifier (project:projectId) ensuring broadcast traffic is restricted to active collaborators.
- Fallback Channels: Automatically falls back from raw WebSockets to long-polling when traversing restrictive enterprise firewalls.
- State Serialization: Contributions are serialized as compact coordinate-color-stroke tuples before broadcast to minimize packet overhead.
- Automatic Reconnection: Maintains client queues during transient network drops and synchronizes canvas delta states upon reconnection.

---

## Design Specifications

The platform UI uses a calm, functional aesthetic:

| Surface Token | Value | Visual Purpose |
|---|---|---|
| Primary Tone | #64B5F6 | Action buttons, active tabs, focus indicators |
| Background Canvas | #E3F2FD | Base background layer reducing eye fatigue |
| Interactive Accent | #42A5F5 | Hover states and interactive tooltips |
| Header Typography | Poppins | Bold, modern geometric sans-serif |
| Body Typography | PT Sans | High-legibility paragraph text |
| Iconography | Lucide React | Consistent 1.5px stroke width outline icons |

---

## Security Specifications

1. Session Integrity: JSON Web Tokens (JWT) are signed server-side and stored in secure cookies, mitigating script-based token theft.
2. Password Security: Passwords are salted and hashed using bcrypt before storage in MongoDB.
3. Secret Separation: All database URIs, API keys, and signing secrets are managed through environment variables excluded from source control.
4. Payload Validation: All incoming API payloads are parsed through strict Zod schemas to reject unexpected data fields.

---

## Troubleshooting Guide

### MongoDB Connection Errors

Ensure the database daemon is running locally or verify Atlas network access rules:

```bash
# Test local database listener
mongod --version

# Verify environment variable presence
node -e "console.log(process.env.MONGODB_URI ? 'Defined' : 'Missing')"
```

### WebSocket Connection Issues

If canvas edits fail to reflect in real time:
- Open browser developer tools and inspect the Network tab under the WS filter.
- Confirm NEXT_PUBLIC_APP_URL accurately reflects your host origin.
- Verify your local firewall allows port 3000 communication.

### Build and Cache Invalidation

```bash
# Clear Next.js build cache
rm -rf .next

# Reinstall dependencies cleanly
rm -rf node_modules package-lock.json
npm install

# Run type audit
npm run typecheck
```

---

## License

This project is licensed under the MIT License. See the LICENSE file for complete terms.

---

## Technical Inquiries

- Issue Tracker: https://github.com/mianjunaid1223/Collab-Studio/issues
- Repository: https://github.com/mianjunaid1223/Collab-Studio
