import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Cpu,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sliders,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SystemStatus } from '../types';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preference fields
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [citationStyle, setCitationStyle] = useState<'IEEE' | 'APA' | 'Harvard'>('IEEE');
  const [defaultSummaryLength, setDefaultSummaryLength] = useState<'concise' | 'detailed' | 'beginner'>('detailed');
  const [defaultExportFormat, setDefaultExportFormat] = useState<'pdf' | 'docx' | 'json'>('pdf');

  useEffect(() => {
    const fetchStatusAndPrefs = async () => {
      try {
        setLoading(true);
        const sysStatus = await api.getSystemStatus();
        setStatus(sysStatus);
        if (user) {
          setExplanationLevel(user.preferred_explanation_level || 'intermediate');
          setCitationStyle(user.citation_style || 'IEEE');
          setDefaultSummaryLength(user.default_summary_length || 'detailed');
          setDefaultExportFormat(user.default_export_format || 'pdf');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatusAndPrefs();
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateProfile({
        preferred_explanation_level: explanationLevel,
        citation_style: citationStyle,
        default_summary_length: defaultSummaryLength,
        default_export_format: defaultExportFormat,
      });
      await refreshUser();
      setSuccessMsg('Preferences updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application & System Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure citation defaults, summarization depths, export formats, and inspect AI service health.
        </p>
      </div>

      {/* AI Provider Health & Demo Mode Diagnostics */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>AI Provider & Execution Engine Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely configured on the server via environment variables. Private API keys are never exposed to browser responses.
            </p>
          </div>
          <Badge variant={status?.active_ai_provider === 'demo' ? 'demo' : 'success'}>
            {status?.active_ai_provider === 'demo' ? 'Demo Mode Active' : 'Provider Connected'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Active AI Engine</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {status?.active_ai_provider === 'demo' ? 'Grounded Academic Heuristic (Demo)' : status?.active_ai_provider}
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Groq LLM Service</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {status?.groq_configured ? 'Key Configured (llama-3.3-70b)' : 'Not Configured (Demo Fallback)'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">OpenAI LLM Service</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {status?.openai_configured ? 'Key Configured (gpt-4o-mini)' : 'Not Configured (Demo Fallback)'}
            </span>
          </div>
        </div>

        {status?.demo_mode && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <strong>Demo Mode Guarantee:</strong> When no external AI key is set, the system uses high-fidelity heuristic parsing of real PDF text.
              It produces structured objectives, methodologies, metrics, and limitations, clearly labeled as Demo Mode, guaranteeing full offline functionality.
            </div>
          </div>
        )}
      </div>

      {/* User Preferences Form */}
      <form onSubmit={handleSavePreferences} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Research Workflow Preferences</span>
        </h2>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Summary Depth
            </label>
            <select
              value={defaultSummaryLength}
              onChange={(e) => setDefaultSummaryLength(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
            >
              <option value="concise">Concise (100-word rapid abstract)</option>
              <option value="detailed">Detailed (300-word comprehensive executive summary)</option>
              <option value="beginner">Beginner Friendly (Intuitive non-expert explanation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Explanation Level
            </label>
            <select
              value={explanationLevel}
              onChange={(e) => setExplanationLevel(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
            >
              <option value="beginner">Beginner (Undergraduate / Non-specialist)</option>
              <option value="intermediate">Intermediate (Graduate / Domain Researcher)</option>
              <option value="advanced">Advanced (Postdoctoral / Senior Academic Specialist)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Standard Citation Format
            </label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
            >
              <option value="IEEE">IEEE (e.g. [1], [2])</option>
              <option value="APA">APA 7th Edition (e.g. Vaswani et al., 2017)</option>
              <option value="Harvard">Harvard Reference Style</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Report Export Format
            </label>
            <select
              value={defaultExportFormat}
              onChange={(e) => setDefaultExportFormat(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
            >
              <option value="pdf">PDF Document (ReportLab Publication-Grade)</option>
              <option value="docx">Microsoft Word Document (.docx)</option>
              <option value="json">Structured Raw JSON (.json)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
