import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Trash2,
  Send,
  Plus,
  X,
  Mail,
  FileSpreadsheet,
  MessageSquare,
  Bot,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState({});
  const [testResult, setTestResult] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'slack' | 'discord' | 'google'
  const [webhookUrl, setWebhookUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/integrations');
      if (res.data?.success) {
        setIntegrations(res.data.integrations || []);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Handle incoming OAuth callback redirect (?code=... or ?provider=google)
  useEffect(() => {
    if (router.query.code || router.query.provider === 'google') {
      const exchangeCode = async () => {
        try {
          await api.post('/integrations/google/callback', {
            code: router.query.code || 'oauth_redirect_success',
            email: 'finance-ops@acmecorp.com',
          });
          // Clean up URL query parameters
          router.replace('/integrations', undefined, { shallow: true });
          await fetchIntegrations();
        } catch (err) {
          console.error('OAuth callback exchange failed:', err);
        }
      };
      exchangeCode();
    }
  }, [router.query]);

  const handleTest = async (integrationId) => {
    setTestLoading((prev) => ({ ...prev, [integrationId]: true }));
    setTestResult(null);
    try {
      const res = await api.post(`/integrations/test/${integrationId}`);
      setTestResult({
        id: integrationId,
        success: true,
        message: res.data?.message || 'Test successful!',
      });
    } catch (err) {
      setTestResult({
        id: integrationId,
        success: false,
        message: err.response?.data?.message || 'Test dispatch failed.',
      });
    } finally {
      setTestLoading((prev) => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDelete = async (integrationId) => {
    try {
      await api.delete(`/integrations/${integrationId}`);
      await fetchIntegrations();
    } catch (err) {
      console.error('Failed to remove integration:', err);
    }
  };

  const handleConnectSlack = async (e) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/integrations/slack', {
        webhookUrl: webhookUrl.trim(),
        channelName: channelName.trim() || '#finance-alerts',
        workspaceName: 'Acme Slack Workspace',
      });
      setActiveModal(null);
      setWebhookUrl('');
      setChannelName('');
      await fetchIntegrations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to connect Slack.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectDiscord = async (e) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/integrations/discord', {
        webhookUrl: webhookUrl.trim(),
        channelName: channelName.trim() || '#invoice-feed',
        workspaceName: 'Finance Discord Server',
      });
      setActiveModal(null);
      setWebhookUrl('');
      setChannelName('');
      await fetchIntegrations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to connect Discord.');
    } finally {
      setSaving(false);
    }
  };

  // Google Modal inputs
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleSheetId, setGoogleSheetId] = useState('Company_Invoices_2026');

  const handleConnectGoogleDirect = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/integrations/google/callback', {
        code: 'manual_auth_token_2026',
        email: googleEmail.trim(),
      });
      setActiveModal(null);
      setGoogleEmail('');
      await fetchIntegrations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to connect Google Workspace.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleOAuthRedirect = async () => {
    setSaving(true);
    try {
      const res = await api.get('/integrations/google/auth');
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      setErrorMsg('Google OAuth initialization error.');
    } finally {
      setSaving(false);
    }
  };

  const getIntegrationByProvider = (provider) => {
    return integrations.find((item) => item.provider === provider);
  };

  const googleIntegration = getIntegrationByProvider('google');
  const slackIntegration = getIntegrationByProvider('slack');
  const discordIntegration = getIntegrationByProvider('discord');

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Integrations & OAuth — LedgerFlow_AI</title>
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Third-Party Integrations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage OAuth connections, Google Sheets credentials, and Slack/Discord webhook bots
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>AES-256 Encrypted At Rest</span>
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Google Workspace Card */}
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      googleIntegration
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {googleIntegration ? 'Active' : 'Not Connected'}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-base">Google Workspace</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Gmail API trigger intake & Google Sheets automatic financial ledger row appends.
                  </p>
                </div>

                {googleIntegration && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                    <p className="text-slate-300 truncate">
                      Account: <span className="text-white">{googleIntegration.metadata?.email}</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Ledger: {googleIntegration.metadata?.sheetId}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {googleIntegration ? (
                  <>
                    <button
                      onClick={() => handleTest(googleIntegration._id)}
                      disabled={testLoading[googleIntegration._id]}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
                    >
                      {testLoading[googleIntegration._id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      <span>Test Scopes</span>
                    </button>
                    <button
                      onClick={() => handleDelete(googleIntegration._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveModal('google')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Connect Google Workspace</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Slack Card */}
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      slackIntegration
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {slackIntegration ? 'Active' : 'Not Connected'}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-base">Slack Bot</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Dispatches automated invoice approvals, math verification proofs, and recovery alerts to channels.
                  </p>
                </div>

                {slackIntegration && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                    <p className="text-slate-300">
                      Channel: <span className="text-purple-400">{slackIntegration.metadata?.channelName}</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Bot: {slackIntegration.metadata?.botName || 'LedgerFlow Bot'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {slackIntegration ? (
                  <>
                    <button
                      onClick={() => handleTest(slackIntegration._id)}
                      disabled={testLoading[slackIntegration._id]}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
                    >
                      {testLoading[slackIntegration._id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Test Alert</span>
                    </button>
                    <button
                      onClick={() => handleDelete(slackIntegration._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveModal('slack')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-glow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect Slack Webhook</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Discord Card */}
            <div className="rounded-2xl bg-[#0F1424]/90 border border-slate-800/90 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      discordIntegration
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {discordIntegration ? 'Active' : 'Not Connected'}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-base">Discord Bot</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Broadcasts high-priority operator intervention alerts and AP reconciliation metrics.
                  </p>
                </div>

                {discordIntegration && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                    <p className="text-slate-300">
                      Channel: <span className="text-indigo-400">{discordIntegration.metadata?.channelName}</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Server: {discordIntegration.metadata?.workspaceName || 'Discord Server'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {discordIntegration ? (
                  <>
                    <button
                      onClick={() => handleTest(discordIntegration._id)}
                      disabled={testLoading[discordIntegration._id]}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
                    >
                      {testLoading[discordIntegration._id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Test Alert</span>
                    </button>
                    <button
                      onClick={() => handleDelete(discordIntegration._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveModal('discord')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect Discord Webhook</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Test Dispatch Status Alert Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{testResult.message}</span>
              </div>
              <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Google Workspace Modal */}
        {activeModal === 'google' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-[#0F1424] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Connect Google Workspace</h3>
                    <p className="text-xs text-slate-400">Gmail API & Google Sheets API scopes</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleConnectGoogleDirect} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Google Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g. finance-ops@yourdomain.com"
                    className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Google Sheets Ledger Name / ID
                  </label>
                  <input
                    type="text"
                    value={googleSheetId}
                    onChange={(e) => setGoogleSheetId(e.target.value)}
                    placeholder="Company_Invoices_2026"
                    className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 font-medium">Included Scopes:</span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">gmail.readonly</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">spreadsheets</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">userinfo.email</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Connect Google Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleOAuthRedirect}
                    className="w-full py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Authorize via Google Sign-In (OAuth Web Flow)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slack / Discord Webhook Modal */}
        {(activeModal === 'slack' || activeModal === 'discord') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-[#0F1424] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeModal === 'slack'
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {activeModal === 'slack' ? <MessageSquare className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base capitalize">
                      Connect {activeModal} Webhook
                    </h3>
                    <p className="text-xs text-slate-400">Tokens are encrypted with AES-256</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={activeModal === 'slack' ? handleConnectSlack : handleConnectDiscord} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Incoming Webhook URL
                  </label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={
                      activeModal === 'slack'
                        ? 'https://hooks.slack.example/services/your-token'
                        : 'https://discord.com/api/webhooks/your-webhook-url'
                    }
                    className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Channel / Room Name
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder={activeModal === 'slack' ? '#finance-alerts' : '#invoice-feed'}
                    className="glass-input block w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1D]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save & Encrypt</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
