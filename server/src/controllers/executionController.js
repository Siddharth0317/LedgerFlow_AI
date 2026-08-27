import Execution from '../models/Execution.js';
import ExecutionLog from '../models/ExecutionLog.js';
import Workflow from '../models/Workflow.js';
import orchestrator from '../agents/orchestrator.js';

/**
 * @desc    Trigger a workflow execution run
 * @route   POST /api/workflows/:id/execute
 * @access  Private
 */
export const triggerWorkflowExecution = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
        code: 'WORKFLOW_NOT_FOUND',
      });
    }

    // Create immutable execution record
    const execution = await Execution.create({
      workflowId: workflow._id,
      owner: req.user._id,
      snapshot: workflow.toObject(),
      status: 'PENDING',
      inputs: req.body.inputs || {
        source: 'manual_trigger',
        sampleInvoice: true,
        vendorName: 'Infosys BPM Limited',
        invoiceDate: new Date().toISOString().split('T')[0],
        subtotal: 18400.0,
        tax: 3312.0, // 18% GST
        totalAmount: 21712.0,
        currency: 'INR',
      },
    });

    // Execute multi-agent orchestration
    const completedExecution = await orchestrator.executeWorkflowRun(
      execution._id,
      req.body.inputs
    );

    res.status(201).json({
      success: true,
      message: 'Workflow execution processed successfully',
      execution: completedExecution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated execution history for user
 * @route   GET /api/executions
 * @access  Private
 */
export const getExecutions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, workflowId } = req.query;
    const owner = req.user._id;

    const query = { owner };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (workflowId) {
      query.workflowId = workflowId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [executions, total] = await Promise.all([
      Execution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('workflowId', 'name')
        .lean(),
      Execution.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      executions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get execution details by ID
 * @route   GET /api/executions/:id
 * @access  Private
 */
export const getExecutionById = async (req, res, next) => {
  try {
    const execution = await Execution.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate('workflowId', 'name description');

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution record not found',
        code: 'EXECUTION_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      execution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chronological execution logs timeline
 * @route   GET /api/executions/:id/timeline
 * @access  Private
 */
export const getExecutionTimeline = async (req, res, next) => {
  try {
    const execution = await Execution.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution record not found',
        code: 'EXECUTION_NOT_FOUND',
      });
    }

    const logs = await ExecutionLog.find({ executionId: req.params.id })
      .sort({ timestamp: 1 })
      .lean();

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pause active execution run
 * @route   POST /api/executions/:id/pause
 * @access  Private
 */
export const pauseExecutionHandler = async (req, res, next) => {
  try {
    const execution = await orchestrator.pauseExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Execution paused successfully',
      execution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resume paused execution run
 * @route   POST /api/executions/:id/resume
 * @access  Private
 */
export const resumeExecutionHandler = async (req, res, next) => {
  try {
    const execution = await orchestrator.resumeExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Execution resumed successfully',
      execution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel active execution run
 * @route   POST /api/executions/:id/cancel
 * @access  Private
 */
export const cancelExecutionHandler = async (req, res, next) => {
  try {
    const execution = await orchestrator.cancelExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Execution cancelled successfully',
      execution,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  triggerWorkflowExecution,
  getExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecutionHandler,
  resumeExecutionHandler,
  cancelExecutionHandler,
};
