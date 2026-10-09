import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  MessageSquare,
  Sparkles,
  BookOpen,
  Target,
  Sliders,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Star,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, PaperAnalysis } from '../types';
import { Badge } from '../components/common/Badge';

export const PaperAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'objectives' | 'methodology' | 'results' | 'limitations' | 'future' | 'critical'>('overview');

  // Summary length selector: 'concise' | 'detailed' | 'beginner'
  const [summaryMode, setSummaryMode] = useState<'concise' | 'detailed' | 'beginner'>('detailed');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      try {
        const [paperData, analysisData] = await Promise.all([
          api.getPaper(id),
          api.getPaperAnalysis(id),
        ]);
        setPaper(paperData);
        setAnalysis(analysisData);
      } catch (err: any) {
        setError(err.message || 'Failed to load paper analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleExportPdf = () => {
    if (!id || !paper) return;
    const url = `/api/papers/${id}/export?format=pdf&type=full_analysis`;
    api.downloadFile(url, `${paper.title.replace(/\s+/g, '_')}_Analysis.pdf`);
  };

  const handleExportJson = () => {
    if (!id || !paper) return;
    const url = `/api/papers/${id}/export?format=json`;
    api.downloadFile(url, `${paper.title.replace(/\s+/g, '_')}_Analysis.json`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading structured paper analysis...</p>
      </div>
    );
  }

  if (error || !paper || !analysis) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'This paper does not have analysis generated yet.'}</p>
        <Link to="/library" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to Paper Library
        </Link>
      </div>
    );
  }

  const meta = paper.metadata;
  const objs = analysis.research_objectives || {};
  const meth = analysis.methodology || {};
  const res = analysis.results_findings || {};
  const lims = analysis.limitations || {};
  const fut = analysis.future_scope || {};
  const crit = analysis.critical_analysis || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Export Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                {meta?.research_domain || 'Computer Science / AI'}
              </span>
              {analysis.is_demo_mode && (
                <Badge variant="demo">
                  <Sparkles className="w-3 h-3" /> Demo Mode Heuristic
                </Badge>
              )}
              {paper.is_scanned && (
                <Badge variant="warning">Scanned Document</Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {paper.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {meta?.authors && meta.authors.length > 0 ? meta.authors.join(', ') : 'Authors not reported'} •{' '}
              {meta?.publication_year ? `${meta.publication_year}` : 'Year not reported'} •{' '}
              {meta?.journal_or_conference || 'Academic Publication'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/papers/${paper.id}/chat`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Paper</span>
            </Link>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Download publication-grade PDF report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Download raw analysis as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 overflow-x-auto mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {[
            { id: 'overview', label: 'Paper Overview', icon: BookOpen },
            { id: 'summary', label: 'Executive Summary', icon: Sparkles },
            { id: 'objectives', label: 'Objectives & Questions', icon: Target },
            { id: 'methodology', label: 'Methodology & Datasets', icon: Sliders },
            { id: 'results', label: 'Results & Findings', icon: BarChart3 },
            { id: 'limitations', label: 'Limitations (Author vs AI)', icon: AlertTriangle },
            { id: 'future', label: 'Future Scope', icon: Lightbulb },
            { id: 'critical', label: 'Critical AI Evaluation', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Abstract Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {meta?.abstract || analysis.concise_summary || 'No abstract reported in document.'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Core Contributions & Research Significance
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">Primary Contribution</h4>
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    {analysis.main_contribution || 'Not reported in the paper'}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">Why This Research Matters</h4>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                    {analysis.why_it_matters || 'Not reported in the paper'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Publication Metadata
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Digital Object Identifier (DOI)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {meta?.doi || 'Not reported in the paper'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Venue / Journal / Conference</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {meta?.journal_or_conference || 'Not reported in the paper'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Publication Year</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {meta?.publication_year || 'Not reported in the paper'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Page Count</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paper.page_count} Pages</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Keywords</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {meta?.keywords && meta.keywords.length > 0 ? (
                      meta.keywords.map((kw, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Executive Summary with Length Selector */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Executive Summaries</h3>
              <p className="text-xs text-slate-500">Toggle between synthesis depths based on your reading requirements</p>
            </div>

            {/* Length Toggle Buttons */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSummaryMode('concise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  summaryMode === 'concise' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Concise (100-word)
              </button>
              <button
                type="button"
                onClick={() => setSummaryMode('detailed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  summaryMode === 'detailed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Detailed (300-word)
              </button>
              <button
                type="button"
                onClick={() => setSummaryMode('beginner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  summaryMode === 'beginner' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Beginner Friendly
              </button>
            </div>
          </div>

          {/* Active Summary Content */}
          <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 leading-relaxed text-sm text-slate-800 dark:text-slate-200 font-normal whitespace-pre-line">
            {summaryMode === 'concise' && (analysis.concise_summary || 'Concise summary unavailable.')}
            {summaryMode === 'detailed' && (analysis.detailed_summary || 'Detailed summary unavailable.')}
            {summaryMode === 'beginner' && (analysis.beginner_explanation || 'Beginner explanation unavailable.')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
                Main Research Contribution
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {analysis.main_contribution || 'Not reported in the paper'}
              </p>
            </div>

            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/50">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-1">
                Why It Matters
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {analysis.why_it_matters || 'Not reported in the paper'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Objectives & Questions */}
      {activeTab === 'objectives' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Research Objectives & Problem Formulation</h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Primary Objective</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {objs.primary_objective || 'Not reported in the paper'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Problem Addressed</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {objs.problem_addressed || 'Not reported in the paper'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Identified Research Gap</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {objs.research_gap || 'Not reported in the paper'}
                </p>
              </div>
            </div>

            {objs.secondary_objectives && objs.secondary_objectives.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Secondary Objectives</span>
                <ul className="space-y-1.5">
                  {objs.secondary_objectives.map((so: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{so}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {objs.research_questions && objs.research_questions.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Research Questions & Hypotheses</span>
                <ul className="space-y-1.5">
                  {objs.research_questions.map((rq: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{rq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Methodology & Datasets */}
      {activeTab === 'methodology' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Methodology & Experimental Design</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Research Design</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {meth.research_design || 'Not reported in the paper'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Dataset Name & Source</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {meth.dataset?.name || 'Not reported in the paper'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Source: {meth.dataset?.source || 'Not reported in the paper'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Dataset Size</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{meth.dataset?.size || 'Not reported in the paper'}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Preprocessing</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{meth.dataset?.preprocessing || 'Not reported in the paper'}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Experimental Setup</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{meth.experimental_setup || 'Not reported in the paper'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Algorithms & Proposed Models</span>
            <div className="flex flex-wrap gap-2">
              {meth.algorithms_models && meth.algorithms_models.length > 0 ? (
                meth.algorithms_models.map((algo: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-medium">
                    {algo}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Not reported in the paper</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Evaluation Metrics</span>
              <div className="flex flex-wrap gap-1.5">
                {meth.evaluation_metrics && meth.evaluation_metrics.length > 0 ? (
                  meth.evaluation_metrics.map((em: string, idx: number) => (
                    <Badge key={idx} variant="primary">{em}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Not reported in the paper</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Baseline Comparison Methods</span>
              <div className="flex flex-wrap gap-1.5">
                {meth.baseline_methods && meth.baseline_methods.length > 0 ? (
                  meth.baseline_methods.map((bm: string, idx: number) => (
                    <Badge key={idx} variant="neutral">{bm}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Not reported in the paper</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Results & Findings */}
      {activeTab === 'results' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Empirical Results & Reported Metrics</h3>

          {/* Quantitative Metrics Table */}
          {res.quantitative_results && res.quantitative_results.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Metric Name</th>
                    <th className="py-3 px-4 font-bold">Reported Value</th>
                    <th className="py-3 px-4 font-bold">Baseline Value</th>
                    <th className="py-3 px-4 font-bold">Comparative Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {res.quantitative_results.map((qm: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{qm.metric_name}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{qm.value}</td>
                      <td className="py-3 px-4 text-slate-500">{qm.baseline_value || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{qm.comparison_note || 'Empirical benchmark'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Main Findings</span>
            <ul className="space-y-2">
              {res.main_findings && res.main_findings.length > 0 ? (
                res.main_findings.map((mf: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{mf}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Not reported in the paper</li>
              )}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Authors' Concluding Deductions</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {res.authors_conclusions || 'Not reported in the paper'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Limitations (Strict Separation) */}
      {activeTab === 'limitations' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strictly Separated Limitations</h3>
            <p className="text-xs text-slate-500">
              Clear distinction between author-acknowledged constraints and AI-inferred potential boundaries with supporting evidence.
            </p>
          </div>

          {/* Section 1: Explicitly Stated by Authors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">Author-Stated</Badge>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Limitations Explicitly Mentioned by the Authors
              </h4>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <ul className="space-y-2">
                {lims.author_stated && lims.author_stated.length > 0 ? (
                  lims.author_stated.map((as: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{as}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">None explicitly stated in the paper text.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Section 2: AI Inferred with Evidence */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant="warning">AI-Inferred</Badge>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Potential Limitations Inferred by AI (With Supporting Evidence)
              </h4>
            </div>

            <div className="space-y-3">
              {lims.ai_inferred && lims.ai_inferred.length > 0 ? (
                lims.ai_inferred.map((inf: any, idx: number) => (
                  <div key={idx} className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/40">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      • {inf.limitation}
                    </p>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1.5 pl-3 border-l-2 border-amber-400">
                      <strong>Supporting Evidence:</strong> {inf.evidence_rationale}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No significant inferred limitations identified.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Future Scope */}
      {activeTab === 'future' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Future Research Trajectories</h3>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">
                Author-Proposed Future Work
              </span>
              <ul className="space-y-2">
                {fut.author_proposed && fut.author_proposed.length > 0 ? (
                  fut.author_proposed.map((ap: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{ap}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">Not reported in the paper</li>
                )}
              </ul>
            </div>

            <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/80 dark:border-purple-900/50">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
                AI-Suggested Research Extensions
              </span>
              <ul className="space-y-2">
                {fut.ai_suggested && fut.ai_suggested.length > 0 ? (
                  fut.ai_suggested.map((as: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                      <span>{as}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">No additional extensions suggested</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Critical AI Evaluation */}
      {activeTab === 'critical' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Critical Academic Analysis</h3>
              <p className="text-xs text-slate-500">Explicitly labeled AI-generated qualitative peer assessments</p>
            </div>
            <Badge variant="demo">AI Analytical Judgment</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-2">
                Methodological Strengths
              </span>
              <ul className="space-y-1.5">
                {crit.strengths && crit.strengths.length > 0 ? (
                  crit.strengths.map((str: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300">• {str}</li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">Standard design</li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-900/50">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block mb-2">
                Methodological Weaknesses
              </span>
              <ul className="space-y-1.5">
                {crit.weaknesses && crit.weaknesses.length > 0 ? (
                  crit.weaknesses.map((wk: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300">• {wk}</li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">None identified</li>
                )}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Novelty & Contribution</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{crit.novelty_and_contribution || 'Not reported in the paper'}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Reproducibility Concerns</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{crit.reproducibility_concerns || 'Not reported in the paper'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Practical Engineering Relevance</span>
            <p className="text-xs text-slate-700 dark:text-slate-300">{crit.practical_relevance || 'Not reported in the paper'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
