import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import {
  PlaySquare,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  ExternalLink,
  Loader2,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = async (page = 1, status = statusFilter) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status !== 'all') params.status = status;

      const res = await api.get('/executions', { params });
      if (res.data?.success) {
        setExecutions(res.data.executions || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions(1, statusFilter);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            <span>Completed</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Running</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 mr-0.5" />
            <span>Failed</span>
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PauseCircle className="w-3 h-3 mr-0.5" />
            <span>Paused</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution History — LedgerFlow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Execution History
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Audit logs, execution latencies, and agent validation proofs
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 overflow-x-auto shadow-sm">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1 mr-2" />
            {['all', 'COMPLETED', 'RUNNING', 'FAILED', 'PAUSED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {s === 'all' ? 'All Runs' : s.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Executions Table */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Loading execution logs...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[#0F1424]/60 border border-slate-800/80 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <PlaySquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No execution runs found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Execute a workflow from the canvas editor or trigger an automated invoice run.
                </p>
              </div>
              <Link
                href="/workflows"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow"
              >
                <span>View Workflows</span>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-mono">
                    <tr>
                      <th className="px-5 py-3.5">Workflow</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Duration</th>
                      <th className="px-5 py-3.5">Extracted Total</th>
                      <th className="px-5 py-3.5">Executed At</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions.map((exec) => {
                      const totalAmount = exec.outputs?.totalAmount || exec.inputs?.totalAmount;
                      return (
                        <tr
                          key={exec._id}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {exec.workflowId?.name || exec.snapshot?.name || 'Untitled Workflow'}
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                ID: {exec._id}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">{getStatusBadge(exec.status)}</td>
                          <td className="px-5 py-4 font-mono text-slate-300">
                            {exec.duration ? `${exec.duration}ms` : '—'}
                          </td>
                          <td className="px-5 py-4 font-mono font-medium text-emerald-400">
                            {totalAmount !== undefined ? `$${parseFloat(totalAmount).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                            {new Date(exec.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/executions/${exec._id}`}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-xs transition-all shadow-sm"
                            >
                              <span>Inspector</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
