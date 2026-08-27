import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';
import aiService from '../services/aiService.js';

// Default initial workflow template nodes & edges for new visual workflows
const getDefaultWorkflowNodesAndEdges = () => {
  const nodes = [
    {
      id: 'node-trigger-1',
      type: 'triggerNode',
      position: { x: 80, y: 150 },
      data: {
        label: 'Gmail Invoice Ingestion',
        triggerType: 'gmail',
        description: 'Monitors incoming emails with attachments matching invoice criteria',
        query: 'label:inbox has:attachment filename:pdf invoice',
        pollingInterval: '5m',
        enabled: true,
      },
    },
    {
      id: 'node-ai-1',
      type: 'aiNode',
      position: { x: 420, y: 150 },
      data: {
        label: 'Gemini Document Parser',
        model: 'gemini-1.5-pro',
        temperature: 0.1,
        extractionFields: ['vendorName', 'invoiceDate', 'subtotal', 'tax', 'totalAmount', 'lineItems'],
        confidenceThreshold: 0.85,
        description: 'Multi-modal OCR & invoice JSON extraction agent',
      },
    },
    {
      id: 'node-logic-1',
      type: 'logicNode',
      position: { x: 760, y: 150 },
      data: {
        label: 'Financial Formula Assertion',
        rule: 'subtotal + tax == totalAmount',
        tolerance: 0.01,
        failAction: 'route_recovery',
        description: 'Validates arithmetic integrity before sheet commitment',
      },
    },
    {
      id: 'node-action-1',
      type: 'actionNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Google Sheet & Slack Alert',
        actionType: 'google-sheets',
        sheetId: 'Auto-Detect',
        channel: '#finance-ops',
        description: 'Appends ledger row & notifies channel',
      },
    },
  ];

  const edges = [
    {
      id: 'edge-1-2',
      source: 'node-trigger-1',
      target: 'node-ai-1',
      animated: true,
      data: { label: 'Raw Email & PDF' },
    },
    {
      id: 'edge-2-3',
      source: 'node-ai-1',
      target: 'node-logic-1',
      animated: true,
      data: { label: 'Extracted JSON' },
    },
    {
      id: 'edge-3-4',
      source: 'node-logic-1',
      target: 'node-action-1',
      animated: true,
      data: { label: 'Validated Record' },
    },
  ];

  return { nodes, edges };
};

/**
 * @desc    Get aggregated workflow metrics for dashboard
 * @route   GET /api/workflows/dashboard
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const owner = req.user._id;

    const [
      totalWorkflows,
      activeWorkflows,
      draftWorkflows,
      pausedWorkflows,
      totalExecutions,
      completedExecutions,
    ] = await Promise.all([
      Workflow.countDocuments({ owner }),
      Workflow.countDocuments({ owner, status: 'active' }),
      Workflow.countDocuments({ owner, status: 'draft' }),
      Workflow.countDocuments({ owner, status: 'paused' }),
      Execution.countDocuments({ owner }),
      Execution.countDocuments({ owner, status: 'COMPLETED' }),
    ]);

    const mathValidationRate =
      totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '100.0';

    res.status(200).json({
      success: true,
      stats: {
        totalWorkflows,
        activeWorkflows,
        draftWorkflows,
        pausedWorkflows,
        totalInvoicesProcessed: completedExecutions,
        mathValidationRate: totalExecutions > 0 ? parseFloat(mathValidationRate) : 0,
        activeAgents: 5,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workflows for authenticated user with pagination & search
 * @route   GET /api/workflows
 * @access  Private
 */
export const getWorkflows = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const owner = req.user._id;

    const query = { owner };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [workflows, total] = await Promise.all([
      Workflow.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Workflow.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      workflows,
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
 * @desc    Create a new workflow
 * @route   POST /api/workflows
 * @access  Private
 */
export const createWorkflow = async (req, res, next) => {
  try {
    const { name, description, triggerConfig, nodes, edges, tags, status } = req.body;

    let initialNodes = nodes;
    let initialEdges = edges;

    // Provide default template canvas if empty
    if (!initialNodes || initialNodes.length === 0) {
      const template = getDefaultWorkflowNodesAndEdges();
      initialNodes = template.nodes;
      initialEdges = template.edges;
    }

    const workflow = await Workflow.create({
      name: name || 'Untitled Invoice Workflow',
      description: description || 'Autonomous multi-agent invoice processing graph',
      owner: req.user._id,
      status: status || 'draft',
      triggerConfig: triggerConfig || { type: 'gmail', config: {} },
      nodes: initialNodes,
      edges: initialEdges || [],
      tags: tags || ['Invoice', 'Operations'],
      version: 1,
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workflow by ID
 * @route   GET /api/workflows/:id
 * @access  Private
 */
export const getWorkflowById = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update workflow metadata and visual canvas graph
 * @route   PUT /api/workflows/:id
 * @access  Private
 */
export const updateWorkflow = async (req, res, next) => {
  try {
    const { name, description, status, triggerConfig, nodes, edges, tags } = req.body;

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

    if (name !== undefined) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (status !== undefined) workflow.status = status;
    if (triggerConfig !== undefined) workflow.triggerConfig = triggerConfig;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (tags !== undefined) workflow.tags = tags;

    // Increment version counter on canvas edits
    workflow.version = (workflow.version || 1) + 1;

    await workflow.save();

    res.status(200).json({
      success: true,
      message: 'Workflow saved successfully',
      workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Duplicate an existing workflow
 * @route   POST /api/workflows/:id/duplicate
 * @access  Private
 */
export const duplicateWorkflow = async (req, res, next) => {
  try {
    const sourceWorkflow = await Workflow.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!sourceWorkflow) {
      return res.status(404).json({
        success: false,
        message: 'Source workflow not found to duplicate',
        code: 'WORKFLOW_NOT_FOUND',
      });
    }

    const cloned = await Workflow.create({
      name: `${sourceWorkflow.name} (Copy)`,
      description: sourceWorkflow.description,
      owner: req.user._id,
      status: 'draft',
      triggerConfig: sourceWorkflow.triggerConfig,
      nodes: sourceWorkflow.nodes,
      edges: sourceWorkflow.edges,
      tags: sourceWorkflow.tags,
      version: 1,
    });

    res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      workflow: cloned,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a workflow
 * @route   DELETE /api/workflows/:id
 * @access  Private
 */
export const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndDelete({
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

    res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate visual workflow graph from natural language prompt
 * @route   POST /api/workflows/generate
 * @access  Private
 */
export const generateWorkflowFromPrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a prompt describing your financial workflow automation.',
        code: 'PROMPT_REQUIRED',
      });
    }

    const generatedGraph = await aiService.generateWorkflowGraph(prompt.trim());

    res.status(200).json({
      success: true,
      graph: generatedGraph,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateWorkflowFromPrompt,
};
