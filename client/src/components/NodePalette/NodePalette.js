import React from 'react';
import {
  Mail,
  Webhook,
  Clock,
  Sparkles,
  Scale,
  FileSpreadsheet,
  MessageSquare,
  Plus,
  Layers,
  GripVertical,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeItems = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'triggerNode',
        label: 'Gmail Ingestion',
        desc: 'Triggers on incoming invoice emails',
        icon: Mail,
        color: 'text-blue-400',
        border: 'border-blue-500/30 hover:border-blue-500/60',
      },
      {
        type: 'triggerNode',
        label: 'Webhook Trigger',
        desc: 'Receives external JSON payloads',
        icon: Webhook,
        color: 'text-cyan-400',
        border: 'border-cyan-500/30 hover:border-cyan-500/60',
      },
    ],
  },
  {
    category: 'AI Extraction',
    items: [
      {
        type: 'aiNode',
        label: 'Gemini Document Parser',
        desc: 'Extracts line items, tax & totals',
        icon: Sparkles,
        color: 'text-purple-400',
        border: 'border-purple-500/30 hover:border-purple-500/60',
      },
    ],
  },
  {
    category: 'Validation & Logic',
    items: [
      {
        type: 'logicNode',
        label: 'Math Assertion',
        desc: 'Enforces subtotal + tax == total',
        icon: Scale,
        color: 'text-emerald-400',
        border: 'border-emerald-500/30 hover:border-emerald-500/60',
      },
    ],
  },
  {
    category: 'Actions & Storage',
    items: [
      {
        type: 'actionNode',
        label: 'Google Sheet Appender',
        desc: 'Appends extracted row to spreadsheet',
        icon: FileSpreadsheet,
        color: 'text-emerald-400',
        border: 'border-emerald-500/30 hover:border-emerald-500/60',
      },
      {
        type: 'actionNode',
        label: 'Slack / Discord Alert',
        desc: 'Dispatches operation status messages',
        icon: MessageSquare,
        color: 'text-amber-400',
        border: 'border-amber-500/30 hover:border-amber-500/60',
      },
    ],
  },
];

export default function NodePalette() {
  const addNode = useWorkflowStore((state) => state.addNode);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 bg-[#0B101D] border-r border-slate-800/80 flex flex-col h-full overflow-hidden select-none">
      {/* Palette Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-white">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm">Node Palette</h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Drag nodes onto canvas or click + to add
        </p>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {nodeItems.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono px-1">
              {cat.category}
            </span>
            <div className="space-y-1.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    onClick={() => addNode(item.type)}
                    className={`group p-2.5 rounded-xl bg-slate-900/80 border ${item.border} hover:bg-slate-800/60 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between shadow-sm`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 shrink-0">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{item.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0"
                      title="Add to canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
