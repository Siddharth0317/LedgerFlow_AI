import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import TriggerNode from '../../components/WorkflowCanvas/CustomNodes/TriggerNode';
import AINode from '../../components/WorkflowCanvas/CustomNodes/AINode';
import LogicNode from '../../components/WorkflowCanvas/CustomNodes/LogicNode';
import ActionNode from '../../components/WorkflowCanvas/CustomNodes/ActionNode';
import AnimatedEdge from '../../components/WorkflowCanvas/CustomEdges/AnimatedEdge';
import api from '../../services/api';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Bot,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowLeft,
  Wand2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const promptTemplates = [
  {
    title: 'Gmail to Sheets & Slack',
    prompt: 'Ingest PDF invoices from Gmail, use Gemini AI to extract vendor, date, line items, and totals, verify that subtotal plus tax equals total, and append the record to Google Sheets while notifying #finance-ops on Slack.',
  },
  {
    title: 'Webhook Expense API with Tax Check',
    prompt: 'Listen for invoice JSON payloads on webhook endpoint, parse line items and discount rules using AI, enforce exact math assertion with 0.01 tolerance, and dispatch alerts to Slack.',
  },
  {
    title: 'Daily AP Reconciliation & Discord',
    prompt: 'Run a daily scheduled cron trigger at 08:00 AM, extract pending vendor expenses, validate math formula, and post ledger row with Discord webhook notification.',
  },
  {
    title: 'High-Volume Fast OCR Pipeline',
    prompt: 'Monitor Gmail with Gemini 1.5 Flash for high-speed invoice parsing, enforce subtotal + tax == totalAmount formula, and commit valid invoices to company ledger sheet.',
  },
];

function LiveGraphPreview({ nodes, edges }) {
  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      aiNode: AINode,
      logicNode: LogicNode,
      actionNode: ActionNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      animated: AnimatedEdge,
    }),
    []
  );

  return (
    <div className="w-full h-full min-h-[420px] relative bg-[#080C15] rounded-2xl overflow-hidden border border-slate-800/90 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        defaultEdgeOptions={{
          animated: true,
          type: 'animated',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#3B82F6';
            if (n.type === 'aiNode') return '#A855F7';
            if (n.type === 'logicNode') return '#10B981';
            return '#10B981';
          }}
          maskColor="rgba(11, 16, 29, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const createWorkflow = useWorkflowStore((state) => state.createWorkflow);

  const [prompt, setPrompt] = useState(promptTemplates[0].prompt);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [generatedGraph, setGeneratedGraph] = useState(null);

  // Auto-generate preview on first load with the default template
  useEffect(() => {
    handleGenerate(promptTemplates[0].prompt);
  }, []);

  const handleGenerate = async (promptToUse = prompt) => {
    if (!promptToUse.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await api.post('/workflows/generate', { prompt: promptToUse.trim() });
      if (res.data?.success && res.data?.graph) {
        setGeneratedGraph(res.data.graph);
      } else {
        throw new Error('Failed to generate workflow graph');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error generating workflow DAG. Please try again.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndLaunch = async () => {
    if (!generatedGraph) return;

    setSaving(true);
    setError(null);

    const result = await createWorkflow({
      name: generatedGraph.name,
      description: generatedGraph.description,
      triggerConfig: generatedGraph.triggerConfig,
      nodes: generatedGraph.nodes,
      edges: generatedGraph.edges,
      tags: generatedGraph.tags || ['AI-Generated', 'Invoice'],
      status: 'draft',
    });

    setSaving(false);

    if (result.success && result.workflow?._id) {
      router.push(`/workflows/${result.workflow._id}`);
    } else {
      setError(result.error || 'Failed to save workflow to database');
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>AI Prompt Studio — Agentflow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/workflows"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to Workflows"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    AI Prompt-to-Workflow Studio
                  </h2>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Natural Language Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Describe financial operations in plain English; our agent compiles interactive DAG visual graphs.
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Studio Grid: Left (Controls) | Right (Live Canvas Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Prompt Input & Generator Config (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Quick Template Chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Curated Invoice Templates
                </span>
                <div className="flex flex-wrap gap-2">
                  {promptTemplates.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => {
                        setPrompt(t.prompt);
                        handleGenerate(t.prompt);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-all text-left"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural Language Prompt Area */}
              <div className="p-5 rounded-3xl bg-[#0F1424]/90 border border-slate-800/90 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                    <span>Describe Your Automation</span>
                    <span className="text-[10px] text-indigo-400 font-mono flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Gemini / AI Rule Engine</span>
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Ingest invoices from Gmail, call Gemini for extraction, verify subtotal + tax == total, and append to Google Sheets..."
                    className="glass-input block w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-[#0A0F1D] resize-none leading-relaxed placeholder-slate-500"
                  />
                </div>

                <button
                  onClick={() => handleGenerate(prompt)}
                  disabled={generating || !prompt.trim()}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow disabled:opacity-50 transition-all cursor-pointer"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compiling DAG Topology...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Visual Workflow</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Rationale & Metadata Card */}
              {generatedGraph && (
                <div className="p-5 rounded-3xl bg-[#0F1424]/90 border border-slate-800/90 space-y-4 animate-fade-in shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{generatedGraph.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{generatedGraph.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shrink-0">
                      {Math.round((generatedGraph.confidenceScore || 0.95) * 100)}% Match
                    </span>
                  </div>

                  {/* AI Explanation */}
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-indigo-400 flex items-center space-x-1">
                      <Cpu className="w-3 h-3" />
                      <span>AI Architectural Rationale</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{generatedGraph.explanation}</p>
                    <p className="text-[10px] text-slate-500 font-mono pt-1">
                      Engine Source: {generatedGraph.source}
                    </p>
                  </div>

                  {/* Primary Save Action */}
                  <button
                    onClick={handleSaveAndLaunch}
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Save to Workflows & Open Canvas</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Live Interactive Canvas Preview (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-white text-sm">Live DAG Preview</h3>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span>{generatedGraph?.nodes?.length || 0} Nodes</span>
                  <span>•</span>
                  <span>{generatedGraph?.edges?.length || 0} Edges</span>
                </div>
              </div>

              <div className="flex-1 h-[540px]">
                <ReactFlowProvider>
                  <LiveGraphPreview
                    nodes={generatedGraph?.nodes || []}
                    edges={generatedGraph?.edges || []}
                  />
                </ReactFlowProvider>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
