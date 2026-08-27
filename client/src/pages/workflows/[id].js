import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import CanvasToolbar from '../../components/WorkflowCanvas/CanvasToolbar';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import { Loader2, Bot, CheckCircle2, Play, AlertCircle, X, ExternalLink, ArrowRight } from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const currentWorkflow = useWorkflowStore((state) => state.currentWorkflow);
  const isLoading = useWorkflowStore((state) => state.isLoading);
  const fetchWorkflowById = useWorkflowStore((state) => state.fetchWorkflowById);

  const [executing, setExecuting] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testLogs, setTestLogs] = useState([]);
  const [activeExecution, setActiveExecution] = useState(null);
  const [executionError, setExecutionError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchWorkflowById(id);
    }
  }, [id, fetchWorkflowById]);

  const handleExecuteTest = async () => {
    if (!id) return;
    setTestModalOpen(true);
    setExecuting(true);
    setExecutionError(null);
    setActiveExecution(null);
    setTestLogs([
      { agent: 'Planner Agent', message: 'Initializing multi-agent execution pipeline...', status: 'info', time: '0ms' },
    ]);

    try {
      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: {
          vendorName: 'Acme Cloud Infrastructure',
          subtotal: 2400.0,
          tax: 240.0,
          totalAmount: 2640.0,
        },
      });

      if (res.data?.success && res.data?.execution) {
        const exec = res.data.execution;
        setActiveExecution(exec);

        // Fetch real timeline logs from backend
        const timelineRes = await api.get(`/executions/${exec._id}/timeline`);
        if (timelineRes.data?.success) {
          const fetchedLogs = timelineRes.data.logs.map((log, idx) => ({
            agent: log.agent.toUpperCase() + ' Agent',
            message: log.message,
            status: log.level,
            time: `+${idx * 150}ms`,
          }));
          setTestLogs(fetchedLogs);
        }
      } else {
        throw new Error(res.data?.message || 'Execution failed');
      }
    } catch (err) {
      console.error('Execution run error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to trigger workflow execution';
      setExecutionError(errMsg);
      setTestLogs((prev) => [
        ...prev,
        { agent: 'Recovery Agent', message: errMsg, status: 'error', time: 'err' },
      ]);
    } finally {
      setExecuting(false);
    }
  };

  if (isLoading || !currentWorkflow) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center text-slate-300">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-sm font-semibold text-white">Loading Workflow Canvas</p>
          <p className="text-xs text-slate-500 font-mono mt-1">Initializing graph coordinates...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{currentWorkflow?.name || 'Canvas Editor'} — Agentflow_AI</title>
      </Head>

      <div className="h-screen w-screen bg-[#080C15] flex flex-col overflow-hidden text-slate-100">
        {/* Top Canvas Toolbar */}
        <CanvasToolbar onExecute={handleExecuteTest} />

        {/* Workspace Canvas Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Node Palette */}
          <NodePalette />

          {/* Center React Flow Interactive Canvas */}
          <div className="flex-1 h-full relative overflow-hidden">
            <WorkflowCanvas />
          </div>

          {/* Right Node Configuration Inspector */}
          <NodeConfigPanel />
        </div>

        {/* Test Execution Simulation Modal */}
        {testModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-xl bg-[#0F1424] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Execution Run Preview</h3>
                    <p className="text-xs text-slate-400">Multi-agent dry run test</p>
                  </div>
                </div>
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Execution Agent Stream */}
              <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-slate-900 font-mono text-xs space-y-2.5 max-h-72 overflow-y-auto">
                {testLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-indigo-400 font-bold">[{log.agent}]</span>{' '}
                      <span>{log.message}</span>{' '}
                      <span className="text-slate-500 text-[10px]">({log.time})</span>
                    </div>
                  </div>
                ))}

                {executing && (
                  <div className="flex items-center space-x-2 text-indigo-400 pt-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Agent execution in progress...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                {activeExecution ? (
                  <Link
                    href={`/executions/${activeExecution._id}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
                  >
                    <span>Inspect Run in Live Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
