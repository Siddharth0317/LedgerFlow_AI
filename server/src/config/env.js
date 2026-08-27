import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or fallback to current directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agentflow_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_agentflow_change_me_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Check for critical missing secrets in production
if (env.NODE_ENV === 'production') {
  const criticalVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = criticalVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[WARNING] Missing critical production environment variables: ${missing.join(', ')}`);
  }
}

export default env;
