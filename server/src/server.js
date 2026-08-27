import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { startExecutionWorker } from './workers/executionWorker.js';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Initialize Express App
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO Server & Background Queue Worker
const io = initSocket(httpServer);
startExecutionWorker();

// Security Middleware (Helmet)
app.use(helmet());

// CORS Configuration - Supports CLIENT_URL, Vercel deployments, and local development
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200,
  })
);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (Morgan)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Root API Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'LedgerFlow_AI Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: 'https://github.com/Siddharth0317/LedgerFlow_AI#readme',
    healthCheck: '/api/health',
    clientUrl: env.CLIENT_URL || 'https://ledger-flow-ai-drab.vercel.app',
  });
});

// Health check endpoint (Section 5.1)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    websockets: 'active',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Fallback
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

// Start Server Function
const startServer = async () => {
  try {
    // Attempt MongoDB connection
    await connectDB();

    const server = httpServer.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 LedgerFlow_AI Server running on port ${env.PORT}`);
      console.log(`⚡ WebSockets: Socket.IO initialized`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 CORS Origin: ${env.CLIENT_URL}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
      console.log('====================================================');
    });

    return server;
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server if file executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, httpServer, io };
export default app;
