import { Server } from 'socket.io';
import env from './env.js';

let ioInstance = null;

/**
 * Initialize Socket.IO Server attached to HTTP Server instance
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for local dev / testing
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket) => {
    // Client joins room for a specific execution run
    socket.on('join_execution', (executionId) => {
      if (executionId) {
        const roomName = `execution:${executionId}`;
        socket.join(roomName);
      }
    });

    socket.on('leave_execution', (executionId) => {
      if (executionId) {
        const roomName = `execution:${executionId}`;
        socket.leave(roomName);
      }
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });
  });

  return ioInstance;
};

/**
 * Get active Socket.IO server instance
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Broadcast live step transition
 */
export const emitExecutionStep = (executionId, stepData) => {
  if (ioInstance && executionId) {
    ioInstance.to(`execution:${executionId}`).emit('execution:step', stepData);
    ioInstance.emit('execution:step_global', { executionId, ...stepData });
  }
};

/**
 * Broadcast live audit log entry
 */
export const emitExecutionLog = (executionId, logData) => {
  if (ioInstance && executionId) {
    ioInstance.to(`execution:${executionId}`).emit('execution:log', logData);
  }
};

/**
 * Broadcast execution status change (COMPLETED, FAILED, PAUSED, CANCELLED)
 */
export const emitExecutionStatus = (executionId, statusData) => {
  if (ioInstance && executionId) {
    ioInstance.to(`execution:${executionId}`).emit('execution:status', statusData);
    ioInstance.emit('metrics:refresh', { executionId });
  }
};

/**
 * Broadcast updated dashboard metrics
 */
export const emitDashboardMetrics = (metricsData) => {
  if (ioInstance) {
    ioInstance.emit('metrics:update', metricsData);
  }
};

export default {
  initSocket,
  getIO,
  emitExecutionStep,
  emitExecutionLog,
  emitExecutionStatus,
  emitDashboardMetrics,
};
