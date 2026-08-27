import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import {
  GitFork,
  Plus,
  Search,
  Sparkles,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowsPage() {
  const router = useRouter();
  const workflows = useWorkflowStore((state) => state.workflows);
  const isLoading = useWorkflowStore((state) => state.isLoading);
  const fetchWorkflows = useWorkflowStore((state) => state.fetchWorkflows);
  const createWorkflow = useWorkflowStore((state) => state.createWorkflow);
  const duplicateWorkflow = useWorkflowStore((state) => state.duplicateWorkflow);
  const deleteWorkflow = useWorkflowStore((state) => state.deleteWorkflow);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkflows({ search, status: statusFilter !== 'all' ? statusFilter : undefined });
  }, [fetchWorkflows, search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;

    setCreating(true);
    const result = await createWorkflow({
      name: newWorkflowName.trim(),
      status: 'draft',
    });
    setCreating(false);

    if (result.success && result.workflow?._id) {
      setIsModalOpen(false);
      setNewWorkflowName('');
      router.push(`/workflows/${result.workflow._id}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'paused':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Paused
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Workflows — Agentflow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Top Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Workflow Automations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage, design, and inspect autonomous invoice processing graphs
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompt Studio</span>
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workflow</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows by name or tag..."
                className="glass-input block w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0A0F1D] placeholder-slate-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
              {['all', 'active', 'draft', 'paused'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Cards Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Loading operations graphs...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[#0F1424]/60 border border-slate-800/80 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No workflows found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first autonomous invoice automation canvas or generate one via AI prompts.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workflow</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {wf.name}
                      </h3>
                      {getStatusBadge(wf.status)}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {wf.description || 'Autonomous multi-agent invoice processing graph.'}
                    </p>

                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{wf.nodes?.length || 0} Nodes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>v{wf.version || 1}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Toolbar */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => duplicateWorkflow(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Duplicate workflow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteWorkflow(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link
                      href={`/workflows/${wf._id}`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all shadow-sm"
                    >
                      <span>Open Canvas</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Workflow Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-[#0F1424] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">New Visual Workflow</h3>
                  <p className="text-xs text-slate-400">Start with a pre-wired invoice DAG</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Workflow Title
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="e.g. Gmail AP Invoices to Google Sheets"
                    className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow disabled:opacity-50"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create & Launch Canvas</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
