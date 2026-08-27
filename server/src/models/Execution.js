import mongoose from 'mongoose';

const ExecutionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: [true, 'Workflow reference is required'],
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Execution owner is required'],
      index: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Workflow immutable snapshot is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    currentNode: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // milliseconds
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      code: { type: String, default: null },
      message: { type: String, default: null },
      stack: { type: String, default: null },
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ExecutionSchema.index({ owner: 1, createdAt: -1 });
ExecutionSchema.index({ workflowId: 1, status: 1 });

const Execution = mongoose.models.Execution || mongoose.model('Execution', ExecutionSchema);

export default Execution;
