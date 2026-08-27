import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Cpu, Bot } from 'lucide-react';

const AINode = ({ data, selected }) => {
  const model = data?.model || 'gemini-1.5-pro';
  const fields = data?.extractionFields || ['vendorName', 'invoiceDate', 'totalAmount'];

  return (
    <div
      className={`relative w-64 rounded-2xl bg-[#140F27] border transition-all duration-200 shadow-lg ${
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-glow'
          : 'border-purple-500/30 hover:border-purple-500/60'
      }`}
    >
      {/* Input Port Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[#090D16]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-purple-950/40 border-b border-purple-900/30 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider font-mono">
            AI AGENT NODE
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
          {model.includes('gemini') ? 'Gemini AI' : 'LLM'}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        <div>
          <h4 className="font-semibold text-white text-xs tracking-tight">
            {data?.label || 'Invoice LLM Parser'}
          </h4>
          <p className="text-[11px] text-slate-400 leading-snug">
            {data?.description || 'Multi-modal document vision & structured extraction'}
          </p>
        </div>

        {/* Extraction fields preview */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            Target Schemas
          </span>
          <div className="flex flex-wrap gap-1">
            {fields.slice(0, 4).map((f) => (
              <span
                key={f}
                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 text-purple-300 border border-purple-900/40 font-mono"
              >
                {f}
              </span>
            ))}
            {fields.length > 4 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                +{fields.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Output Port Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[#090D16]"
      />
    </div>
  );
};

export default memo(AINode);
