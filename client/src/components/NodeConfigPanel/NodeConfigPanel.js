import React from 'react';
import {
  X,
  Trash2,
  Settings2,
  Sliders,
  Sparkles,
  Scale,
  Mail,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const handleFieldChange = (field, value) => {
    updateNodeData(id, { [field]: value });
  };

  const handleCheckboxToggle = (field, item) => {
    const list = data[field] || [];
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    updateNodeData(id, { [field]: updated });
  };

  return (
    <div className="w-80 bg-[#0F1424] border-l border-slate-800/80 flex flex-col h-full overflow-hidden shadow-2xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Node Inspector</h3>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Form settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Node Label
          </label>
          <input
            type="text"
            value={data?.label || ''}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D]"
          />
        </div>

        {/* Node Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={data?.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D] resize-none"
          />
        </div>

        {/* Dynamic Type-specific configuration */}
        {type === 'triggerNode' && (
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold">
              <Mail className="w-3.5 h-3.5" />
              <span>Trigger Options</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Trigger Type</label>
              <select
                value={data?.triggerType || 'gmail'}
                onChange={(e) => handleFieldChange('triggerType', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D]"
              >
                <option value="gmail">Gmail Inbound Invoices</option>
                <option value="webhook">Webhook API Listener</option>
                <option value="schedule">Scheduled Cron</option>
                <option value="manual">Manual Execution</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Search Filter Query</label>
              <input
                type="text"
                value={data?.query || ''}
                onChange={(e) => handleFieldChange('query', e.target.value)}
                placeholder="has:attachment filename:pdf invoice"
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D] font-mono"
              />
            </div>
          </div>
        )}

        {type === 'aiNode' && (
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Extraction Engine</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">LLM Model</label>
              <select
                value={data?.model || 'gemini-1.5-pro'}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D]"
              >
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Recommended)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast)</option>
                <option value="openrouter/anthropic-claude">OpenRouter / Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Extraction Fields</label>
              <div className="space-y-1.5">
                {[
                  'vendorName',
                  'invoiceDate',
                  'subtotal',
                  'tax',
                  'totalAmount',
                  'lineItems',
                ].map((field) => {
                  const isChecked = (data?.extractionFields || []).includes(field);
                  return (
                    <label
                      key={field}
                      onClick={() => handleCheckboxToggle('extractionFields', field)}
                      className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-slate-300 font-mono text-[11px]">{field}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {type === 'logicNode' && (
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>Assertion Rule</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Financial Formula</label>
              <input
                type="text"
                value={data?.rule || 'subtotal + tax == totalAmount'}
                onChange={(e) => handleFieldChange('rule', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D] font-mono text-emerald-300"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Tolerance Threshold</span>
                <span className="font-mono text-emerald-400">±{data?.tolerance || 0.01}</span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.10"
                step="0.01"
                value={data?.tolerance || 0.01}
                onChange={(e) => handleFieldChange('tolerance', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800"
              />
            </div>
          </div>
        )}

        {type === 'actionNode' && (
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Destination Config</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Action Type</label>
              <select
                value={data?.actionType || 'google-sheets'}
                onChange={(e) => handleFieldChange('actionType', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D]"
              >
                <option value="google-sheets">Google Sheets (Ledger Append)</option>
                <option value="slack">Slack Channel Notification</option>
                <option value="discord">Discord Channel Webhook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Sheet ID / Name</label>
              <input
                type="text"
                value={data?.sheetId || 'Company_Invoices_2026'}
                onChange={(e) => handleFieldChange('sheetId', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Slack Channel</label>
              <input
                type="text"
                value={data?.channel || '#finance-ops'}
                onChange={(e) => handleFieldChange('channel', e.target.value)}
                className="glass-input block w-full px-3 py-2 rounded-xl text-xs bg-[#0A0F1D] font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={() => deleteNode(id)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node from Canvas</span>
        </button>
      </div>
    </div>
  );
}
