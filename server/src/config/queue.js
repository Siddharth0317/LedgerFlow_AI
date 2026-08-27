import EventEmitter from 'events';
import orchestrator from '../agents/orchestrator.js';
import { emitExecutionStatus } from './socket.js';

class InMemoryExecutionQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.concurrency = 5;
    this.activeJobs = 0;
    this.stats = {
      completed: 0,
      failed: 0,
      total: 0,
    };
  }

  /**
   * Add a workflow execution job to queue
   * @param {Object} jobData { executionId, inputs, workflowId }
   */
  async add(jobData) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      data: jobData,
      timestamp: Date.now(),
      status: 'waiting',
    };

    this.queue.push(job);
    this.stats.total++;
    this.emit('job:added', job);

    // Trigger queue consumer asynchronously
    setImmediate(() => this.processNext());

    return job;
  }

  async processNext() {
    if (this.queue.length === 0 || this.activeJobs >= this.concurrency) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    job.status = 'active';
    this.activeJobs++;
    this.emit('job:active', job);

    try {
      const { executionId, inputs } = job.data;
      const result = await orchestrator.executeWorkflowRun(executionId, inputs);

      job.status = 'completed';
      job.result = result;
      this.stats.completed++;
      this.emit('job:completed', job);
      emitExecutionStatus(executionId, { status: result.status, duration: result.duration });
    } catch (err) {
      job.status = 'failed';
      job.error = err.message;
      this.stats.failed++;
      this.emit('job:failed', job);
    } finally {
      this.activeJobs--;
      this.processNext();
    }
  }

  getStatus() {
    return {
      adapter: 'in-memory-worker',
      waiting: this.queue.length,
      active: this.activeJobs,
      completed: this.stats.completed,
      failed: this.stats.failed,
      total: this.stats.total,
    };
  }
}

// Singleton Queue Instance
export const executionQueue = new InMemoryExecutionQueue();

export default {
  executionQueue,
};
