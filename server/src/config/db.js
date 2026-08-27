import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

/**
 * Connects to MongoDB database with robust event logging and error handling.
 */
export const connectDB = async () => {
  if (isConnected) {
    console.log('ℹ️  MongoDB connection already established.');
    return;
  }

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️  MongoDB connection disconnected.');
  });

  // Handle process termination gracefully
  const gracefulShutdown = async (signal) => {
    try {
      await mongoose.connection.close();
      console.log(`🔌 MongoDB connection closed due to app termination (${signal}).`);
      process.exit(0);
    } catch (err) {
      console.error(`❌ Error during MongoDB disconnection: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    return conn;
  } catch (error) {
    console.error(`❌ Initial MongoDB connection failed: ${error.message}`);
    // In dev mode, we log the error and allow the server to remain responsive for health checks
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
