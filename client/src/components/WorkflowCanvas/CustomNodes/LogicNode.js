import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

const LogicNode = ({ data, selected }) => {
  const rule = data?.rule || 'subtotal + tax == totalAmount';
  const tolerance = data?.tolerance || 0.01;

  return (
    <div
      className={`relative w-64 rounded-2xl bg-[#0B181E] border transition-all duration-200 shadow-lg ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-glow-emerald'
          : 'border-emerald-500/30 hover:border-emerald-500/60'
      }`}
    >
      {/* Input Port Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#090D16]"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-950/40 border-b border-emerald-900/30 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
            VALIDATION NODE
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
          ±{tolerance}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-semibold text-white text-xs tracking-tight">
          {data?.label || 'Math Formula Integrity'}
        </h4>

        {/* Assertion formula pill */}
        <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-900/40 text-[10px] text-emerald-300 font-mono">
          <code>{rule}</code>
        </div>

        <p className="text-[10px] text-slate-400">
          Enforces exact balance before committing to external systems.
        </p>
      </div>

      {/* Output Port Handle (Valid Path) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#090D16]"
      />
    </div>
  );
};

export default memo(LogicNode);
