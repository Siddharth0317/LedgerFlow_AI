import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bot,
  Zap,
  Cpu,
  Scale,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Loader2,
  Code2,
} from 'lucide-react';

export default function ExecutionInspectorPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'data' | 'proof'

  const fetchExecutionData = useCallback(async () => {
    if (!id) return;
    try {
      const [execRes, logsRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);

      if (execRes.data?.success) setExecution(execRes.data.execution);
      if (logsRes.data?.success) setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load execution details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExecutionData();
    // Poll every 3 seconds if status is RUNNING or PENDING
    const interval = setInterval(() => {
      if (execution?.status === 'RUNNING' || execution?.status === 'PENDING') {
        fetchExecutionData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchExecutionData, execution?.status]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/pause`);
      await fetchExecutionData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/resume`);
      await fetchExecutionData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/cancel`);
      await fetchExecutionData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'planner':
        return <Cpu className="w-3.5 h-3.5 text-blue-400" />;
      case 'execution':
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 'validation':
        return <Scale className="w-3.5 h-3.5 text-emerald-400" />;
      case 'recovery':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'success':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            SUCCESS
          </span>
        );
      case 'warning':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
            WARNING
          </span>
        );
      case 'error':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
            ERROR
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            INFO
          </span>
        );
    }
  };

  if (loading || !execution) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs font-mono">Connecting to live execution timeline...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const subtotal = execution.outputs?.subtotal;
  const tax = execution.outputs?.tax;
  const totalAmount = execution.outputs?.totalAmount;
  const isMathValid = subtotal !== undefined && tax !== undefined && totalAmount !== undefined
    ? Math.abs((subtotal + tax) - totalAmount) < 0.01
    : null;

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution Inspector — Agentflow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0F1424]/90 border border-slate-800/90 shadow-sm">
            <div className="flex items-center space-x-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to History"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {execution.workflowId?.name || execution.snapshot?.name || 'Execution Run'}
                  </h2>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      execution.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : execution.status === 'RUNNING'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'
                        : execution.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>ID: {execution._id}</span>
                  <span>•</span>
                  <span>Duration: {execution.duration ? `${execution.duration}ms` : 'In progress'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Pause / Resume / Cancel */}
            <div className="flex items-center space-x-2.5">
              {execution.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {execution.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              {(execution.status === 'RUNNING' || execution.status === 'PAUSED') && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}

              <Link
                href={`/workflows/${execution.workflowId?._id || execution.workflowId}`}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
              >
                <span>Edit Canvas</span>
              </Link>
            </div>
          </div>

          {/* 5-Agent Pipeline Visual Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { key: 'planner', name: '1. Planner Agent', role: 'DAG Order Verified', color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
              { key: 'execution', name: '2. Execution Agent', role: 'Gemini Parsing', color: 'border-purple-500/40 bg-purple-950/20 text-purple-400' },
              { key: 'validation', name: '3. Validation Agent', role: 'Math Proof Enforced', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
              { key: 'recovery', name: '4. Recovery Agent', role: 'Retry / Backoff', color: 'border-amber-500/40 bg-amber-950/20 text-amber-400' },
              { key: 'monitoring', name: '5. Monitoring Agent', role: 'Audit Log Broadcast', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400' },
            ].map((agent) => (
              <div
                key={agent.key}
                className={`p-3.5 rounded-2xl border ${agent.color} backdrop-blur-sm flex flex-col justify-between space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{agent.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{agent.role}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'logs', label: 'Live Audit Logs', count: logs.length },
              { id: 'data', label: 'Extracted Financial JSON' },
              { id: 'proof', label: 'Mathematical Formula Integrity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'logs' && (
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-4 space-y-2 shadow-sm font-mono text-xs max-h-[520px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-2.5 overflow-hidden">
                    <div className="p-1 rounded-lg bg-slate-800 shrink-0">
                      {getAgentIcon(log.agent)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200 capitalize font-sans text-xs">
                          {log.agent} Agent
                        </span>
                        {getLevelBadge(log.level)}
                      </div>
                      <p className="text-slate-400 text-xs font-sans leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="p-5 rounded-2xl bg-[#0A0E1A] border border-slate-800 text-xs font-mono overflow-x-auto">
              <pre className="text-indigo-300 leading-relaxed">
                {JSON.stringify(execution.outputs || execution.inputs || {}, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'proof' && (
            <div className="p-6 rounded-2xl bg-[#0F1424]/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Financial Arithmetic Assertion Proof</h3>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    isMathValid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {isMathValid ? 'ASSERTION PASSED (Delta = $0.00)' : 'ASSERTION FAILED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Subtotal</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">
                    ${subtotal !== undefined ? parseFloat(subtotal).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Tax</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">
                    + ${tax !== undefined ? parseFloat(tax).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Total Amount</span>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    = ${totalAmount !== undefined ? parseFloat(totalAmount).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Formula: <code>| (subtotal + tax) - totalAmount | &lt; 0.01</code>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
