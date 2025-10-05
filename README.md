# 🎨 Pixel Canvas Collab

> A collaborative digital canvas for mindfulness and teamwork - Create beautiful art together, one contribution at a time.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7.5-green?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

## ✨ Overview

**Pixel Canvas Collab** is a unique digital mindfulness and teamwork tool that enables users to create beautiful artwork collaboratively. The platform emphasizes patience, interpretation, and human creativity—no AI, no shortcuts, just pure handcrafted digital art.

### 🎯 Core Philosophy

- **Text-Based Creation**: Projects start with only a text description—no image uploads allowed
- **Community Interpretation**: Contributors interpret the vision and bring it to life piece by piece
- **Real-Time Collaboration**: Watch artwork evolve as users worldwide contribute simultaneously
- **Mindful Experience**: Designed to promote focus, calmness, and collaborative creativity

## 🌟 Key Features

### 🖼️ Multiple Canvas Types

The platform supports 5 distinct canvas types, each offering a unique creative experience:

1. **🧵 Embroidery** - Create digital embroidery patterns with thread-like strokes
2. **🎨 Mosaic** - Build intricate mosaics with colorful tiles
3. **💧 Watercolor** - Paint with flowing watercolor effects
4. **🎵 AudioVisual** - Place musical notes that create both visual and audio experiences
5. **🖌️ Paint** - Traditional digital painting with brush strokes

### 🔐 User Authentication

- Email/password authentication
- Google OAuth integration
- Secure session management with JWT tokens
- User profiles with contribution tracking

### 🎯 Collaborative Features

- **Real-Time Updates**: Socket.io-powered live canvas updates
- **Contributor Profiles**: View user stats, streaks, and contribution history
- **Project Discovery**: Explore ongoing and completed projects
- **Canvas Progress Tracking**: Visual indicators showing completion percentage
- **Conflict Handling**: Smart handling of simultaneous contributions

### 📊 Project Management

- **Create Projects**: Start new collaborative canvases with descriptions and canvas types
- **Explore Page**: Browse active, completed, and archived projects with filters and search
- **Admin Controls**: Archive or delete projects (admin users only)
- **Download Artwork**: Export completed canvases as PNG, WAV (for AudioVisual), or JSON

### 🎨 User Experience

- **Zoomable Canvas**: Intuitive pan and zoom controls
- **Color Picker**: Full-featured color selection tools
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Mode**: Beautiful dark theme with calming blue color palette
- **Minimalist UI**: Clean interface focusing on the canvas as the primary element

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components based on Radix UI
- **Lucide React** - Icon library
- **Socket.io Client** - Real-time communication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Socket.io Server** - WebSocket server for real-time updates
- **MongoDB with Mongoose** - Database and ODM
- **JWT & bcrypt** - Authentication and security
- **Zod** - Schema validation

### Development Tools
- **React Hook Form** - Form management
- **Genkit AI** - AI integration capabilities
- **ESLint & TypeScript** - Code quality
- **Turbopack** - Fast development builds

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- MongoDB database (local or cloud instance like MongoDB Atlas)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mianjunaid1223/Collab-Studio.git
   cd Collab-Studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/pixel-canvas-collab
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pixel-canvas-collab
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Google OAuth (Optional - for Google sign-in)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # App URL (for production)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Genkit AI (Optional - if using AI features)
   GOOGLE_GENAI_API_KEY=your-genkit-api-key
   ```

4. **Set up MongoDB**
   
   If using a local MongoDB instance:
   ```bash
   # Make sure MongoDB is running
   mongod
   ```
   
   Or sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available) and use the connection string.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Running Different Modes

```bash
# Development with Turbopack (fast refresh)
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# AI Development (Genkit)
npm run genkit:dev
npm run genkit:watch
```

### First Steps

1. **Sign Up**: Create an account or sign in with Google
2. **Explore**: Browse existing projects on the Explore page
3. **Create**: Start your own collaborative canvas with a description
4. **Contribute**: Add your interpretation to active projects
5. **Track**: View your profile to see your contributions and streaks

## 📁 Project Structure

```
Collab-Studio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes (login, signup)
│   │   ├── create/            # Project creation page
│   │   ├── explore/           # Project exploration page
│   │   ├── profile/           # User profile pages
│   │   ├── project/           # Individual project pages
│   │   │   └── [id]/canvas/  # Canvas view and interaction
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── canvas/            # Canvas type implementations
│   │   ├── layout/            # Layout components (header, footer)
│   │   ├── project/           # Project-related components
│   │   └── ui/                # shadcn/ui components
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and configurations
│   │   ├── mongodb.ts         # MongoDB connection and models
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── data.ts            # Data fetching functions
│   ├── pages/                 # Pages Router (for Socket.io API)
│   │   └── api/socket.ts      # Socket.io server endpoint
│   └── ai/                    # AI integration (Genkit)
├── docs/                      # Documentation
│   └── blueprint.md           # Project blueprint and design guidelines
├── public/                    # Static assets
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## 🎨 Canvas Types Explained

### 🧵 Embroidery Canvas
Create digital embroidery patterns with smooth, thread-like strokes. Each contribution adds delicate lines that build up into intricate designs reminiscent of traditional needlework.

### 🎨 Mosaic Canvas
Build colorful mosaics tile by tile. Contributors place individual colored tiles on a grid to create pixel-perfect artwork, similar to classical mosaic art.

### 💧 Watercolor Canvas
Paint with flowing watercolor effects. Contributions blend and flow naturally, creating soft, artistic compositions with transparent color overlays.

### 🎵 AudioVisual Canvas
A unique canvas type that combines visual and audio elements. Place musical notes on a grid that creates both a visual pattern and an audible musical sequence. Completed projects can be exported as audio files (WAV format).

### 🖌️ Paint Canvas
Traditional digital painting experience. Contributors use brush strokes to paint directly on the canvas, with smooth blending and layering capabilities.

## 🌐 Real-Time Features

The application uses **Socket.io** for real-time collaboration:

- **Live Canvas Updates**: See contributions appear instantly as others add them
- **Connection Status**: Visual indicators show real-time connection status
- **Conflict Resolution**: Automatic handling of simultaneous contributions
- **Room-Based Communication**: Each project has its own Socket.io room for efficient updates

### Socket.io Configuration

The Socket.io server is configured with:
- WebSocket and polling fallback
- CORS support for development and production
- Automatic reconnection handling
- Project-specific rooms for isolated updates

## 👥 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing component structure
- Keep components focused and reusable
- Write meaningful commit messages
- Test on both desktop and mobile viewports
- Ensure dark mode compatibility

## 🎨 Design Guidelines

The application follows a calm, minimalist design philosophy:

- **Primary Color**: Soft muted blue (#64B5F6) for calmness and focus
- **Background**: Light desaturated blue (#E3F2FD) for a gentle backdrop
- **Accent Color**: Brighter analogous blue (#42A5F5) for interactive elements
- **Typography**: 
  - Headlines: Poppins (sans-serif) for modern, clean look
  - Body: PT Sans (sans-serif) for readability
- **Icons**: Minimalist outlined style (Lucide React)
- **Animations**: Subtle, non-disruptive feedback

## 🔒 Security

- **Authentication**: Secure JWT-based session management
- **Password Hashing**: bcrypt with salt rounds
- **Environment Variables**: Sensitive data stored in `.env.local`
- **CORS Configuration**: Properly configured for production
- **Input Validation**: Zod schemas for all form inputs

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MONGODB_URI is set correctly
echo $MONGODB_URI

# For local MongoDB, ensure it's running
mongod --version
```

### Socket.io Connection Problems
- Check browser console for connection errors
- Verify NEXT_PUBLIC_APP_URL is set correctly
- Ensure port 3000 is not blocked by firewall

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npm run typecheck
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Socket.io](https://socket.io/) - Real-time communication
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

## 📧 Contact & Support

- **GitHub Issues**: For bug reports and feature requests
- **Project Repository**: [mianjunaid1223/Collab-Studio](https://github.com/mianjunaid1223/Collab-Studio)

---

Made with ❤️ for collaborative creativity and digital mindfulness.
