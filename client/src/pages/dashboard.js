import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  GitFork,
  PlaySquare,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Network,
  Bot,
  Layers,
  Clock,
  ShieldCheck,
  Loader2,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    draftWorkflows: 0,
    totalInvoicesProcessed: 0,
    mathValidationRate: 0,
    activeAgents: 5,
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, workflowsRes, executionsRes] = await Promise.all([
        api.get('/workflows/dashboard'),
        api.get('/workflows', { params: { limit: 5 } }),
        api.get('/executions', { params: { limit: 4 } }),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats || {});
      if (workflowsRes.data?.success) setRecentWorkflows(workflowsRes.data.workflows || []);
      if (executionsRes.data?.success) setRecentExecutions(executionsRes.data.executions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = [
    {
      label: 'Active Automations',
      value: stats.activeWorkflows || '0',
      change: `${stats.totalWorkflows || 0} total workflows`,
      icon: GitFork,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Invoices Processed',
      value: (stats.totalInvoicesProcessed || 0).toLocaleString(),
      change: '100% autonomous flow',
      icon: PlaySquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Math Validation Rate',
      value: stats.mathValidationRate !== undefined ? `${stats.mathValidationRate}%` : '0%',
      change: 'Arithmetic proof assertion',
      icon: CheckCircle2,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Autonomous Agents',
      value: `${stats.activeAgents || 5}`,
      change: 'Sequential pipeline active',
      icon: Bot,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Operations Console — Agentflow_AI</title>
        </Head>

        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1.5">
                  <Bot className="w-4 h-4" />
                  <span>OPERATOR SESSION ACTIVE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome back, {user?.name || 'Operator'}
                </h2>
                <p className="mt-1 text-sm text-slate-400 max-w-xl">
                  Autonomous agents are standing by to monitor incoming invoice emails, extract financial data, and verify mathematical integrity.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  href="/workflows/builder"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Prompt Studio</span>
                </Link>
                <Link
                  href="/workflows"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Workflow</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="p-5 rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{metric.label}</span>
                    <div className={`p-2 rounded-xl border ${metric.bg}`}>
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">{metric.value}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{metric.change}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two-Column Layout: Active Workflows & Live Agent Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Automations Table (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-white text-base">Your Automations</h3>
                </div>
                {recentWorkflows.length > 0 && (
                  <Link
                    href="/workflows"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="py-16 text-center rounded-2xl bg-[#0F1424]/60 border border-slate-800 p-6">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-mono">Loading automations...</p>
                </div>
              ) : recentWorkflows.length === 0 ? (
                <div className="rounded-2xl bg-[#0F1424]/60 border border-slate-800/80 p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">No workflows yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Design a custom invoice DAG or generate an automation graph in seconds with AI.
                  </p>
                  <div className="pt-2 flex items-center justify-center space-x-3">
                    <Link
                      href="/workflows"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
                    >
                      Create Workflow
                    </Link>
                    <Link
                      href="/workflows/builder"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                    >
                      Use AI Prompt
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-800/80">
                    {recentWorkflows.map((wf) => (
                      <Link
                        key={wf._id}
                        href={`/workflows/${wf._id}`}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors block"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-white hover:text-indigo-300 transition-colors">
                              {wf.name}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                wf.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-700/30 text-slate-400 border-slate-700'
                              }`}
                            >
                              {wf.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            {wf.description || `${wf.nodes?.length || 0} configured DAG nodes`}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(wf.updatedAt || wf.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span className="font-mono text-indigo-400 font-medium">
                            v{wf.version || 1}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Agent Activity Feed (1 Col) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-base">Recent Executions</h3>
                </div>
                {recentExecutions.length > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-4 space-y-3.5 shadow-sm">
                {recentExecutions.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">No execution runs yet</p>
                    <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                      Run an invoice workflow to view live multi-agent execution telemetry.
                    </p>
                  </div>
                ) : (
                  recentExecutions.map((exec) => (
                    <Link
                      key={exec._id}
                      href={`/executions/${exec._id}`}
                      className="block p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-300 line-clamp-1">
                          {exec.workflowId?.name || exec.snapshot?.name || 'Execution Run'}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            exec.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : exec.status === 'RUNNING'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {exec.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{exec.duration ? `${exec.duration}ms` : 'In progress'}</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(exec.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </Link>
                  ))
                )}

                <Link
                  href="/executions"
                  className="block w-full py-2.5 text-center text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors"
                >
                  Open Live Execution History →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
