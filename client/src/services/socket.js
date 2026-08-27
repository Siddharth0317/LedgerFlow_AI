import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize or get active Socket.IO client singleton
 */
export const getSocket = () => {
  if (!socket) {
    const serverUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // Connected to Socket.IO Server
    });

    socket.on('disconnect', () => {
      // Disconnected from Socket.IO Server
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection warning:', error.message);
    });
  }

  return socket;
};

/**
 * Join an execution room for real-time live log & step streaming
 * @param {string} executionId
 */
export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join_execution', executionId);
  }
};

/**
 * Leave an execution room
 * @param {string} executionId
 */
export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave_execution', executionId);
  }
};

export default {
  getSocket,
  joinExecutionRoom,
  leaveExecutionRoom,
};
