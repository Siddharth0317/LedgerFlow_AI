import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      default: null,
    },
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      default: null,
    },
    type: {
      type: String,
      enum: ['EXECUTION_SUCCESS', 'EXECUTION_FAILED', 'VALIDATION_ERROR', 'AUTH_EXPIRED', 'SYSTEM'],
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

NotificationSchema.index({ owner: 1, read: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
