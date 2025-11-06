import { Server as SocketIOServer } from 'socket.io';
import userModel from './models/userModel.js';

export const initialSocketServer = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    const { userID } = socket.handshake.query;

    if (userID) {
      onlineUsers.set(userID, socket.id);
      console.log(`✅ User ${userID} connected`);
    }

    let user;

    // Set the user's status to online in the database
    try {
      user = await userModel.findByIdAndUpdate(userID, { isOnline: true }, { new: true });

      if (!user) {
        console.warn(`User with ID ${userID} not found in the database.`);
      } else {
        console.log(`User ${user.name}  is now online.`);

        // Emit event for all users to update their chat lists
        io.emit('newUserData', { userID, isOnline: true });
      }
    } catch (error) {
      console.error("Error updating user's online status:", error);
    }

    // Join Room
    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User join room:', room);
    });

    //------------------------- Listen for new message event--------------->
    socket.on('NewMessageAdded', (data) => {
      // data: { chatId, message }
      try {
        const { chatId } = data || {};
        console.log('New Message Added: ', data);
        if (chatId) {
          io.to(chatId).emit('fetchMessages', data);
          io.to(chatId).emit('newMessageSummary', data);
        } else {
          io.emit('fetchMessages', data);
        }
      } catch (e) {
        console.error('Error emitting NewMessageAdded:', e);
      }
    });

    // ----------------------------Handle Typing---------------------------->

    // Typing
    socket.on('typing', (room) => {
      console.log(' start Troom:', room);
      socket.in(room).emit('typing');
    });

    socket.on('stop typing', (room) => {
      console.log(' stop Troom:', room);

      socket.in(room).emit('stop typing');
    });

    // -------------------------Handle Realtime Notifications----------------->
    socket.on('notification', (notification) => {
      io.emit('newNotification', notification);
    });

    // Message reactions
    socket.on('messageReaction', ({ chatId, reaction }) => {
      if (chatId && reaction) {
        io.to(chatId).emit('messageReaction', { chatId, reaction });
      }
    });

    // Mark read broadcast
    socket.on('markRead', ({ chatId, userId }) => {
      if (chatId) {
        io.to(chatId).emit('messagesRead', { chatId, userId });
      }
    });
    // -------------------------Handle disconnect User----------------->
    socket.on('disconnect', async () => {
      console.log(`User with ID: ${userID} disconnected!`);

      try {
        if (user) {
          await userModel.findByIdAndUpdate(userID, { isOnline: false }, { new: true });
          console.log(`User ${user.name}  is now offline.`);

          // Emit event for all users to update their chat lists
          io.emit('newUserData', { userID, isOnline: false });
        } else {
          console.warn(`User ${userID} was not found when disconnecting.`);
        }
      } catch (error) {
        console.error("Error updating user's offline status:", error);
      }
    });
  });
};
