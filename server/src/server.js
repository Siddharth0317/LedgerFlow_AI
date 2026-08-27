import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Initialize Express App
const app = express();

// Security Middleware (Helmet)
app.use(helmet());

// CORS Configuration - Strictly restricted to CLIENT_URL
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (Morgan)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check endpoint (Section 5.1)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);

// 404 Fallback
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

// Start Server Function
const startServer = async () => {
  try {
    // Attempt MongoDB connection
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Agentflow_AI Server running on port ${env.PORT}`);
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

export default app;
