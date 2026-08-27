import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileSpreadsheet, MessageSquare, Send, Bell } from 'lucide-react';

const ActionNode = ({ data, selected }) => {
  const actionType = data?.actionType || 'google-sheets';

  const getIcon = (type) => {
    switch (type) {
      case 'slack':
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'google-sheets':
      default:
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div
      className={`relative w-64 rounded-2xl bg-[#0F1C18] border transition-all duration-200 shadow-lg ${
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
            {getIcon(actionType)}
          </div>
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
            ACTION NODE
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize font-mono">
          {actionType.replace('-', ' ')}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-semibold text-white text-xs tracking-tight">
          {data?.label || 'Append Record & Notify'}
        </h4>

        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-[10px]">
          {data?.sheetId && (
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Sheet:</span>
              <span className="text-emerald-300 font-semibold truncate max-w-[120px]">
                {data.sheetId}
              </span>
            </div>
          )}
          {data?.channel && (
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span>Channel:</span>
              <span className="text-emerald-300 font-semibold">{data.channel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ActionNode);
