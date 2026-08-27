import Execution from '../models/Execution.js';
import AgentMemory from '../models/AgentMemory.js';
import Notification from '../models/Notification.js';
import { runPlannerAgent } from './plannerAgent.js';
import { runExecutionAgent } from './executionAgent.js';
import { runValidationAgent } from './validationAgent.js';
import { runRecoveryAgent } from './recoveryAgent.js';
import { runMonitoringAgent } from './monitoringAgent.js';
import { emitExecutionStep, emitExecutionStatus } from '../config/socket.js';

/**
 * Multi-Agent Orchestration Engine (Section 4)
 * Coordinates the 5-agent sequential lifecycle with real-time state controls.
 */
export const executeWorkflowRun = async (executionId, customInput = {}) => {
  const execution = await Execution.findById(executionId);
  if (!execution) {
    throw new Error(`Execution record ${executionId} not found.`);
  }

  const workflowId = execution.workflowId;
  const snapshot = execution.snapshot || {};
  const nodes = snapshot.nodes || [];
  const edges = snapshot.edges || [];

  execution.status = 'RUNNING';
  execution.startTime = new Date();
  await execution.save();

  emitExecutionStatus(executionId, { status: 'RUNNING', startTime: execution.startTime });

  await runMonitoringAgent({
    executionId,
    workflowId,
    agent: 'monitoring',
    level: 'info',
    message: `🚀 Execution run initialized for "${snapshot.name || 'Workflow'}"`,
    metadata: { status: 'RUNNING' },
  });

  let currentPayload = { ...execution.inputs, ...customInput };

  try {
    // -------------------------------------------------------------
    // STEP 1: PLANNER AGENT
    // -------------------------------------------------------------
    await runMonitoringAgent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      message: 'Planner Agent inspecting DAG graph topology & calculating execution route...',
    });

    const planResult = await runPlannerAgent({ nodes, edges });

    await AgentMemory.create({
      workflowId,
      executionId,
      agentId: 'planner',
      key: 'executionPlan',
      value: planResult.executionPlan,
      confidenceScore: planResult.confidenceScore,
    });

    await runMonitoringAgent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      message: `DAG verified with ${(planResult.confidenceScore * 100).toFixed(0)}% confidence score. Scheduled ${planResult.totalSteps} execution nodes.`,
      metadata: planResult.executionPlan,
    });

    // -------------------------------------------------------------
    // STEP 2: SEQUENTIAL NODE EXECUTION
    // -------------------------------------------------------------
    for (const node of planResult.orderedNodes) {
      // Re-fetch execution to inspect if operator requested PAUSE or CANCEL
      const freshExec = await Execution.findById(executionId);
      if (freshExec.status === 'CANCELLED') {
        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'monitoring',
          level: 'warning',
          message: `🛑 Execution cancelled by operator at node: ${node.data?.label || node.id}`,
        });
        return freshExec;
      }

      if (freshExec.status === 'PAUSED') {
        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'monitoring',
          level: 'warning',
          message: `⏸️ Execution paused by operator at node: ${node.data?.label || node.id}`,
        });
        return freshExec;
      }

      execution.currentNode = node.id;
      await execution.save();

      emitExecutionStep(executionId, {
        nodeId: node.id,
        nodeType: node.type,
        nodeLabel: node.data?.label || node.type,
        status: 'PROCESSING',
      });

      // --- Node Execution Step ---
      if (node.type === 'triggerNode' || node.type === 'aiNode' || node.type === 'actionNode') {
        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'execution',
          level: 'info',
          message: `Execution Agent processing: ${node.data?.label || node.type}`,
        });

        const execResult = await runExecutionAgent({ node, inputPayload: currentPayload });
        currentPayload = { ...currentPayload, ...execResult.data };

        await AgentMemory.create({
          workflowId,
          executionId,
          agentId: 'execution',
          key: `output_${node.id}`,
          value: execResult.data,
          confidenceScore: 0.95,
        });

        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'execution',
          level: 'success',
          message: execResult.message,
          metadata: execResult.data,
        });
      }

      // --- Logic / Validation Step ---
      if (node.type === 'logicNode') {
        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'validation',
          level: 'info',
          message: `Validation Agent verifying arithmetic formula: ${node.data?.rule || 'subtotal + tax == totalAmount'}`,
        });

        const valResult = await runValidationAgent({ node, inputData: currentPayload });

        await AgentMemory.create({
          workflowId,
          executionId,
          agentId: 'validation',
          key: `assertion_${node.id}`,
          value: valResult,
          confidenceScore: valResult.isValid ? 1.0 : 0.0,
        });

        if (!valResult.isValid) {
          await runMonitoringAgent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'error',
            message: valResult.message,
            metadata: valResult,
          });

          // Invoke Recovery Agent on assertion failure
          const recoveryResult = await runRecoveryAgent({
            error: { code: valResult.code, message: valResult.message },
            retryCount: execution.retryCount,
          });

          await runMonitoringAgent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'recovery',
            level: 'warning',
            message: recoveryResult.message,
            metadata: recoveryResult,
          });

          // Mark Execution as FAILED due to validation discrepancy
          execution.status = 'FAILED';
          execution.endTime = new Date();
          execution.duration = execution.endTime - execution.startTime;
          execution.error = {
            code: valResult.code,
            message: valResult.message,
          };
          execution.outputs = currentPayload;
          await execution.save();

          emitExecutionStatus(executionId, {
            status: 'FAILED',
            duration: execution.duration,
            error: execution.error,
          });

          await Notification.create({
            owner: execution.owner,
            workflowId,
            executionId,
            type: 'VALIDATION_ERROR',
            title: 'Validation Agent Assertion Discrepancy',
            message: valResult.message,
          });

          return execution;
        }

        await runMonitoringAgent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'validation',
          level: 'success',
          message: valResult.message,
          metadata: valResult.mathProof,
        });
      }
    }

    // -------------------------------------------------------------
    // STEP 3: FINALIZATION
    // -------------------------------------------------------------
    execution.status = 'COMPLETED';
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;
    execution.outputs = currentPayload;
    execution.currentNode = null;
    await execution.save();

    emitExecutionStatus(executionId, {
      status: 'COMPLETED',
      duration: execution.duration,
      outputs: execution.outputs,
    });

    await runMonitoringAgent({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: 'success',
      message: `🎉 Workflow execution completed successfully in ${execution.duration}ms.`,
      metadata: { duration: execution.duration, status: 'COMPLETED' },
    });

    await Notification.create({
      owner: execution.owner,
      workflowId,
      executionId,
      type: 'EXECUTION_SUCCESS',
      title: 'Workflow Execution Completed',
      message: `Successfully processed invoice for ${currentPayload.vendorName || 'Vendor'} (Total: $${currentPayload.totalAmount || '0.00'})`,
    });

    return execution;
  } catch (error) {
    console.error('Orchestration runtime exception:', error);

    const recoveryResult = await runRecoveryAgent({
      error: { code: error.code || 'RUNTIME_EXCEPTION', message: error.message },
      retryCount: execution.retryCount,
    });

    await runMonitoringAgent({
      executionId,
      workflowId,
      agent: 'recovery',
      level: 'error',
      message: recoveryResult.message,
      metadata: { error: error.message },
    });

    execution.status = 'FAILED';
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;
    execution.error = {
      code: error.code || 'RUNTIME_EXCEPTION',
      message: error.message,
      stack: error.stack,
    };
    execution.outputs = currentPayload;
    await execution.save();

    emitExecutionStatus(executionId, {
      status: 'FAILED',
      duration: execution.duration,
      error: execution.error,
    });

    return execution;
  }
};

/**
 * Pause active execution run
 */
export const pauseExecution = async (executionId, ownerId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: ownerId });
  if (!execution) throw new Error('Execution not found');

  if (execution.status === 'RUNNING') {
    execution.status = 'PAUSED';
    await execution.save();

    emitExecutionStatus(executionId, { status: 'PAUSED' });

    await runMonitoringAgent({
      executionId,
      workflowId: execution.workflowId,
      agent: 'monitoring',
      level: 'warning',
      message: 'Operator paused execution run.',
    });
  }
  return execution;
};

/**
 * Resume paused execution run
 */
export const resumeExecution = async (executionId, ownerId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: ownerId });
  if (!execution) throw new Error('Execution not found');

  if (execution.status === 'PAUSED') {
    execution.status = 'RUNNING';
    await execution.save();

    emitExecutionStatus(executionId, { status: 'RUNNING' });

    // Trigger continuation asynchronously
    executeWorkflowRun(executionId, execution.inputs);
  }
  return execution;
};

/**
 * Cancel execution run
 */
export const cancelExecution = async (executionId, ownerId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: ownerId });
  if (!execution) throw new Error('Execution not found');

  execution.status = 'CANCELLED';
  execution.endTime = new Date();
  if (execution.startTime) {
    execution.duration = execution.endTime - execution.startTime;
  }
  await execution.save();

  emitExecutionStatus(executionId, { status: 'CANCELLED', duration: execution.duration });

  await runMonitoringAgent({
    executionId,
    workflowId: execution.workflowId,
    agent: 'monitoring',
    level: 'warning',
    message: 'Operator cancelled execution run.',
  });

  return execution;
};

export default {
  executeWorkflowRun,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
