import mongoose from 'mongoose';

const WorkflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workflow owner is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
      index: true,
    },
    triggerConfig: {
      type: {
        type: String,
        enum: ['gmail', 'manual', 'webhook', 'schedule'],
        default: 'manual',
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    nodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    edges: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: ['Invoice', 'Operations'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying by owner and status
WorkflowSchema.index({ owner: 1, status: 1 });
WorkflowSchema.index({ owner: 1, createdAt: -1 });

const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);

export default Workflow;
