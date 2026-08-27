import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Webhook, Clock, Play, Radio } from 'lucide-react';

const TriggerNode = ({ data, selected }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'gmail':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'webhook':
        return <Webhook className="w-4 h-4 text-cyan-400" />;
      case 'schedule':
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <Play className="w-4 h-4 text-indigo-400" />;
    }
  };

  const triggerType = data?.triggerType || 'gmail';

  return (
    <div
      className={`relative w-64 rounded-2xl bg-[#0F1527] border transition-all duration-200 shadow-lg ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-glow'
          : 'border-blue-500/30 hover:border-blue-500/60'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-950/40 border-b border-blue-900/30 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-blue-500/20 border border-blue-500/30">
            {getIcon(triggerType)}
          </div>
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider font-mono">
            TRIGGER NODE
          </span>
        </div>
        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Active</span>
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-semibold text-white text-xs tracking-tight">
          {data?.label || 'Event Trigger'}
        </h4>
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
          {data?.description || data?.query || 'Listens for incoming payloads and initiates agent pipeline.'}
        </p>

        {triggerType === 'gmail' && data?.query && (
          <div className="px-2 py-1 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-blue-300 font-mono truncate">
            {data.query}
          </div>
        )}
      </div>

      {/* Output Port Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#090D16]"
      />
    </div>
  );
};

export default memo(TriggerNode);
