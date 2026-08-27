import React, { useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Key,
  Database,
  Cpu,
  Bot,
  Zap,
  CheckCircle2,
  Lock,
  Radio,
  Server,
  Bell,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Platform Settings — LedgerFlow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Platform Settings & Security
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage operator account details, role permissions, encryption policies, and system diagnostics
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>Role: {user?.role ? user.role.toUpperCase() : 'OPERATOR'}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            {[
              { id: 'account', label: 'Operator Profile', icon: User },
              { id: 'roles', label: 'Roles & Permissions', icon: Lock },
              { id: 'security', label: 'Security & Encryption', icon: ShieldCheck },
              { id: 'system', label: 'System Diagnostics', icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Operator Profile */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-6 space-y-5 shadow-sm">
                <h3 className="font-semibold text-white text-base">Operator Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || 'Operator'}
                      className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D] text-slate-200 border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'operator@ledgerflow.ai'}
                      className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D] text-slate-200 border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Operator ID</label>
                    <input
                      type="text"
                      disabled
                      value={user?._id || user?.id || 'usr_prod_session_active'}
                      className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D] font-mono text-slate-400 border-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-6 space-y-4 shadow-sm h-fit">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Account Status</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Your session is verified with a signed JWT bearer token and isolated database tenancy.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Session Active & Healthy</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Roles & Permissions (Admin Explanation) */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Operator Role */}
                <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Operator Role</h4>
                        <p className="text-[11px] text-slate-400">Standard user level</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Current
                    </span>
                  </div>

                  <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Create and edit custom DAG workflows in Canvas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Use AI Prompt Studio for prompt-to-graph synthesis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Execute workflows & view real-time WebSocket logs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Connect personal Google Workspace, Slack & Discord</span>
                    </li>
                  </ul>
                </div>

                {/* Admin Role */}
                <div className="rounded-2xl bg-[#0F1424]/90 border border-indigo-500/30 p-6 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Admin Access</h4>
                        <p className="text-[11px] text-purple-300">Organization-level control</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Privileged
                    </span>
                  </div>

                  <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>System-wide multi-tenant oversight and audit logging</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Manage master API keys, LLM quotas & rate limits</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Trigger database maintenance & mock data cleanup scripts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Configure global recovery strategies & queue concurrency</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Encryption */}
          {activeTab === 'security' && (
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-6 space-y-5 shadow-sm">
              <h3 className="font-semibold text-white text-base">Cryptographic & Security Standards</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                    <Key className="w-4 h-4" />
                    <span>AES-256-CBC</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    All OAuth access tokens, refresh tokens, and bot webhooks are encrypted at rest with dynamic 16-byte random IVs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Bcrypt (Cost 12)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Operator passwords are salted and hashed with 12 computation rounds. Hashes are excluded from all API responses.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tenancy Isolation</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Strict owner query scoping ensures workflows, executions, and logs are accessible only by their creator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: System Diagnostics */}
          {activeTab === 'system' && (
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-6 space-y-5 shadow-sm">
              <h3 className="font-semibold text-white text-base">Live Infrastructure Diagnostics</h3>

              <div className="divide-y divide-slate-800/80 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-400">Backend Cloud Runtime</span>
                  <span className="text-white font-mono">Node.js (Render Web Service)</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-400">Frontend Edge Deployment</span>
                  <span className="text-white font-mono">Next.js 16 (Vercel)</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-emerald-400 font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>MongoDB Atlas (Replica Set Connected)</span>
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-400">Real-Time Event Stream</span>
                  <span className="text-indigo-400 font-mono flex items-center space-x-1">
                    <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
                    <span>Socket.IO Engine (Port 10000)</span>
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-400">AI Model Orchestrator</span>
                  <span className="text-purple-400 font-mono">Google Gemini 2.5 Flash + OpenRouter</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
