import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
  GitBranch,
  Layers,
  FileSpreadsheet,
  Mail,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  const agents = [
    {
      name: 'Planner Agent',
      role: 'DAG Topology & Confidence Analysis',
      desc: 'Parses natural language requirements, validates acyclic node graphs, and calculates plan confidence.',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      name: 'Execution Agent',
      role: 'Gmail Ingestion & LLM Extraction',
      desc: 'Extracts invoices via Gmail OAuth and calls Gemini to parse vendor, date, line items, and totals.',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      name: 'Validation Agent',
      role: 'Mathematical Formula Integrity',
      desc: 'Enforces rigorous financial arithmetic (|subtotal + tax - total| < 0.01) before ledger commitment.',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      name: 'Recovery Agent',
      role: 'Adaptive Error Classification',
      desc: 'Handles token expirations and API rate limits via exponential backoff or operator escalation.',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      name: 'Monitoring Agent',
      role: 'Real-Time WebSockets & Audit Logs',
      desc: 'Emits live Socket.IO events and persists step-by-step audit logs to MongoDB collections.',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Head>
        <title>Agentflow_AI — Autonomous Invoice & Expense Operations Hub</title>
      </Head>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#090D16]/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Agentflow</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
              >
                <span>Console ({user?.name || 'Operator'})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow transition-all"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        {/* Glow background pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 mb-8 animate-pulse-slow">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>5-Agent Multi-Agent Orchestration Chain</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          Autonomous Invoice & Expense Operations with{' '}
          <span className="gradient-text">Agent Intelligence</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Describe workflows in natural language, visualize them as interactive graphs on a React Flow canvas, and let autonomous multi-agent pipelines ingest, validate, and post financial records.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-glow transition-all text-sm"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-sm"
          >
            <span>Operator Sign In</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Metrics Showcase */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800/80">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Speed</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">&lt; 3.2s</p>
            <p className="text-xs text-slate-400">Avg. extraction latency</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800/80">
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">99.8%</p>
            <p className="text-xs text-slate-400">Math verification rate</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800/80">
            <div className="flex items-center space-x-2 text-purple-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Agents</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">5 Chain</p>
            <p className="text-xs text-slate-400">Autonomous roles</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800/80">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Security</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">AES-256</p>
            <p className="text-xs text-slate-400">Encrypted credentials</p>
          </div>
        </div>
      </section>

      {/* 5-Agent Architecture Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Autonomous Financial Reliability
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Every incoming invoice is processed through our 5-agent sequential pipeline with built-in recovery and validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {agents.map((agent, idx) => (
            <div
              key={agent.name}
              className={`p-5 rounded-2xl bg-gradient-to-b ${agent.color} backdrop-blur-sm border flex flex-col justify-between`}
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 tracking-widest block mb-2">
                  AGENT 0{idx + 1}
                </span>
                <h3 className="font-bold text-white text-sm mb-1">{agent.name}</h3>
                <p className="text-[11px] font-medium text-indigo-300/80 mb-3">{agent.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">Agentflow_AI</span>
            <span>— Autonomous Invoice & Expense Operations Hub</span>
          </div>
          <p className="text-[11px] font-mono text-slate-600">
            Node.js • Next.js • React Flow • Gemini API • BullMQ
          </p>
        </div>
      </footer>
    </div>
  );
}
