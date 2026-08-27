import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
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
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Metrics overview
  const metrics = [
    {
      label: 'Active Automations',
      value: '4',
      change: '+1 from last week',
      icon: GitFork,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Invoices Processed',
      value: '1,248',
      change: '+18.4% volume',
      icon: PlaySquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Math Validation Rate',
      value: '99.8%',
      change: 'Formula enforced',
      icon: CheckCircle2,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Recovery Interventions',
      value: '0',
      change: '100% automated resolution',
      icon: ShieldCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  // Active automations mock list
  const activeWorkflows = [
    {
      id: 'wf-1',
      name: 'Gmail Invoice to Google Sheets & Slack',
      trigger: 'Gmail OAuth (New Invoice Email)',
      status: 'active',
      lastRun: '12 mins ago',
      successRate: '100%',
    },
    {
      id: 'wf-2',
      name: 'Vendor Expense Math & Tax Assertion Pipeline',
      trigger: 'Webhook Dispatcher',
      status: 'active',
      lastRun: '1 hour ago',
      successRate: '99.4%',
    },
    {
      id: 'wf-3',
      name: 'Daily AP Reconciliation & Discord Alerts',
      trigger: 'Scheduled Cron (08:00 AM)',
      status: 'draft',
      lastRun: 'Yesterday',
      successRate: '100%',
    },
  ];

  // Real-time multi-agent activity stream
  const agentActivity = [
    {
      id: 'act-1',
      agent: 'Validation Agent',
      action: 'Verified math formula ($1,240.00 + $124.00 = $1,364.00)',
      time: '2 mins ago',
      status: 'success',
    },
    {
      id: 'act-2',
      agent: 'Execution Agent',
      action: 'Gemini extraction completed for INV-90234.pdf',
      time: '3 mins ago',
      status: 'success',
    },
    {
      id: 'act-3',
      agent: 'Planner Agent',
      action: 'Topological DAG validated with 99.4% confidence score',
      time: '4 mins ago',
      status: 'success',
    },
    {
      id: 'act-4',
      agent: 'Monitoring Agent',
      action: 'Live Socket.IO metrics dispatched to operator console',
      time: '6 mins ago',
      status: 'info',
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
                  Autonomous agents are currently monitoring connected communication channels and enforcing mathematical assertions on all incoming invoices.
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
                  <h3 className="font-semibold text-white text-base">Active Automations</h3>
                </div>
                <Link
                  href="/workflows"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-800/80">
                  {activeWorkflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-white">{wf.name}</span>
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
                        <p className="text-xs text-slate-400 font-mono">{wf.trigger}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{wf.lastRun}</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-medium">
                          {wf.successRate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Agent Activity Feed (1 Col) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-base">Agent Activity</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              </div>

              <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-4 space-y-3.5 shadow-sm">
                {agentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300">{item.agent}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.action}</p>
                  </div>
                ))}

                <Link
                  href="/executions"
                  className="block w-full py-2.5 text-center text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors"
                >
                  Open Live Execution Inspector →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
