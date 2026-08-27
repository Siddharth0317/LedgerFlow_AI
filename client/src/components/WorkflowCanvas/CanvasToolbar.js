import React, { useState } from 'react';
import Link from 'next/link';
import {
  Save,
  Play,
  Copy,
  ArrowLeft,
  Loader2,
  Check,
  Zap,
  Sparkles,
  GitFork,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function CanvasToolbar({ onExecute }) {
  const currentWorkflow = useWorkflowStore((state) => state.currentWorkflow);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const isDirty = useWorkflowStore((state) => state.isDirty);
  const saveCanvas = useWorkflowStore((state) => state.saveCanvas);
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const duplicateWorkflow = useWorkflowStore((state) => state.duplicateWorkflow);

  const [name, setName] = useState(currentWorkflow?.name || 'Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameBlur = async () => {
    setIsEditingName(false);
    if (name.trim() && name !== currentWorkflow?.name) {
      await updateWorkflow(currentWorkflow._id, { name: name.trim() });
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (currentWorkflow?._id) {
      await updateWorkflow(currentWorkflow._id, { status: newStatus });
    }
  };

  return (
    <div className="h-14 px-4 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-10">
      {/* Left side: Back to list + Title + Status */}
      <div className="flex items-center space-x-3">
        <Link
          href="/workflows"
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Back to Workflows"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <input
              type="text"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="glass-input px-2 py-1 rounded-lg text-sm font-semibold text-white bg-[#0F1424] w-64"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-sm text-white hover:text-indigo-300 transition-colors truncate max-w-xs text-left"
              title="Click to rename"
            >
              {currentWorkflow?.name || name}
            </button>
          )}

          {/* Status Badge Select */}
          <select
            value={currentWorkflow?.status || 'draft'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono capitalize cursor-pointer hover:border-slate-600"
          >
            <option value="draft">Draft</option>
            <option value="active">Active (Monitoring)</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* Duplicate Button */}
        <button
          onClick={() => duplicateWorkflow(currentWorkflow?._id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Duplicate this workflow graph"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clone</span>
        </button>

        {/* Save Canvas Button */}
        <button
          onClick={saveCanvas}
          disabled={isSaving || !isDirty}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isDirty
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow'
              : 'bg-slate-800 text-slate-400 cursor-default'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isDirty ? (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved</span>
            </>
          )}
        </button>

        {/* Test Run Button */}
        <button
          onClick={onExecute}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-glow-emerald transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Test</span>
        </button>
      </div>
    </div>
  );
}
