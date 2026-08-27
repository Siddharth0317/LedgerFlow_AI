import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_SECRET = process.env.CREDENTIAL_ENCRYPTION_KEY || 'agentflow_secret_key_32_bytes_len!';

// Ensure key is exactly 32 bytes (256 bits)
const getKey = () => {
  return crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();
};

/**
 * Encrypt plain text using AES-256-CBC
 * @param {string} text Plaintext to encrypt
 * @returns {string} iv:encrypted_hex
 */
export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt cipher text using AES-256-CBC
 * @param {string} encryptedText iv:encrypted_hex
 * @returns {string} Decrypted plaintext
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
    return encryptedText;
  }
  try {
    const [ivHex, cipherHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
};

export default {
  encrypt,
  decrypt,
};
