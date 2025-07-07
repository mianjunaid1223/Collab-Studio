import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO, Contribution } from '@/lib/types';
import { saveContribution } from '@/lib/data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === 'GET') {
    // Handle GET requests (Socket.IO handshake)
    if (res.socket.server.io) {
      console.log('Socket.IO server already running');
      res.status(200).json({ success: true, message: 'Socket.IO server running' });
      return;
    }

    console.log('Setting up new Socket.IO server...');
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? false  // In production, be more restrictive
          : true,  // Allow all origins in development
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });
    
    res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-project', (projectId: string) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('new-contribution', async (contributionData: { projectId: string; userId: string; type: Contribution['type']; data: any }) => {
      try {
        const result = await saveContribution(
          contributionData.projectId,
          contributionData.userId,
          contributionData.type,
          contributionData.data
        );

        if (result) {
          const { newContribution, removedData, updatedProject } = result;
          
          if (newContribution) {
            // Broadcast the new contribution to all clients in the project room
            io.to(contributionData.projectId).emit('contribution-broadcast', newContribution);
          }
          if (removedData) {
            // Broadcast that a contribution was removed (for audiovisual note toggling)
            io.to(contributionData.projectId).emit('contribution-removed', removedData);
          }
          
          // Broadcast the project update (e.g., progress change)
          io.to(contributionData.projectId).emit('project-updated', updatedProject);
        }
      } catch (error) {
        console.error('Error handling new contribution:', error);
        socket.emit('contribution-error', 'Failed to save contribution.');
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

    res.status(200).json({ success: true, message: 'Socket.IO server initialized' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default socketHandler;
