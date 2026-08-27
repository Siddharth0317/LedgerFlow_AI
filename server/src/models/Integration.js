import mongoose from 'mongoose';

const IntegrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'slack', 'discord'],
      required: [true, 'Provider is required'],
      index: true,
    },
    credentials: {
      accessToken: { type: String, default: null }, // AES-256 Encrypted
      refreshToken: { type: String, default: null }, // AES-256 Encrypted
      expiryDate: { type: Date, default: null },
      webhookUrl: { type: String, default: null }, // AES-256 Encrypted
      scopes: [{ type: String }],
    },
    metadata: {
      email: { type: String, default: null },
      channelName: { type: String, default: null },
      botName: { type: String, default: null },
      sheetId: { type: String, default: null },
      workspaceName: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

IntegrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

const Integration = mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema);

export default Integration;
