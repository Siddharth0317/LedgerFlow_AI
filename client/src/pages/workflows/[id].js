import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import CanvasToolbar from '../../components/WorkflowCanvas/CanvasToolbar';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import { Loader2, Bot, CheckCircle2, Play, AlertCircle, X } from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const currentWorkflow = useWorkflowStore((state) => state.currentWorkflow);
  const isLoading = useWorkflowStore((state) => state.isLoading);
  const fetchWorkflowById = useWorkflowStore((state) => state.fetchWorkflowById);

  const [executing, setExecuting] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testLogs, setTestLogs] = useState([]);

  useEffect(() => {
    if (id) {
      fetchWorkflowById(id);
    }
  }, [id, fetchWorkflowById]);

  const handleExecuteTest = () => {
    setTestModalOpen(true);
    setExecuting(true);
    setTestLogs([
      { agent: 'Planner Agent', message: 'Validating DAG acyclic graph topology...', status: 'success', time: '0ms' },
    ]);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        { agent: 'Execution Agent', message: 'Simulated Gmail trigger payload loaded (Sample INV-2026-001.pdf)', status: 'success', time: '+180ms' },
      ]);
    }, 600);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        { agent: 'Execution Agent', message: 'Gemini extraction: Vendor=Acme Corp, Subtotal=$1,200.00, Tax=$120.00, Total=$1,320.00', status: 'success', time: '+620ms' },
      ]);
    }, 1300);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        { agent: 'Validation Agent', message: 'Math assertion verified: |($1200 + $120) - $1320| = 0.00 < 0.01', status: 'success', time: '+840ms' },
      ]);
    }, 1900);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        { agent: 'Monitoring Agent', message: 'Row appended to Google Sheets & Slack confirmation dispatched.', status: 'success', time: '+1120ms' },
      ]);
      setExecuting(false);
    }, 2500);
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

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
