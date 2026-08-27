import ExecutionLog from '../models/ExecutionLog.js';

/**
 * Monitoring Agent (Section 4.5)
 * Writes audit records to ExecutionLogs & formats real-time event updates.
 */
export const runMonitoringAgent = async ({
  executionId,
  workflowId,
  nodeId = null,
  agent,
  level = 'info',
  message,
  metadata = {},
}) => {
  try {
    const logEntry = await ExecutionLog.create({
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: new Date(),
    });

    return logEntry;
  } catch (error) {
    console.error('Monitoring Agent failed to persist execution log:', error.message);
    return null;
  }
};

export default { runMonitoringAgent };
