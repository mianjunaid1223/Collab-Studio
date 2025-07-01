import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '@/lib/types';
import { saveContribution } from '@/lib/data';
import type { Contribution } from '@/lib/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Setting up new Socket.IO server...');
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
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
          // Save the contribution to the database
          const newContribution = await saveContribution(
            contributionData.projectId,
            contributionData.userId,
            contributionData.type,
            contributionData.data
          );

          if (newContribution) {
            // Broadcast the saved contribution to all clients in the project room
            io.to(contributionData.projectId).emit('contribution-broadcast', newContribution);
          }
        } catch (error) {
          console.error('Error handling new contribution:', error);
          // Optionally, emit an error back to the original sender
          socket.emit('contribution-error', 'Failed to save contribution.');
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  } else {
    console.log('Socket.IO server already running.');
  }
  res.end();
};

export default socketHandler;
