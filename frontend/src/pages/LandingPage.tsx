import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  GitCompare,
  MessageSquare,
  ShieldCheck,
  FileText,
  ArrowRight,
  CheckCircle2,
  Layers,
  Upload,
  Cpu,
  Download,
  Search
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">ResearchMate AI</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                Academic Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Research Paper Summarization & Literature Review Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Turn Research Papers into <br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Actionable Knowledge
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Upload PDFs to instantly extract objectives, methodologies, datasets, algorithms, and results.
            Synthesize multi-paper literature reviews, compare publications side-by-side, and chat with grounded academic citations.
          </p>

          <p className="mt-2 text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase">
            "Read Less. Understand More. Research Smarter."
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Start Analyzing Papers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs"
            >
              <span>Explore Instant Demo</span>
            </Link>
          </div>

          {/* Interactive Demonstration Preview Box */}
          <div className="mt-14 p-2 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl shadow-2xl border border-slate-300/80 dark:border-slate-700/80">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-left border border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    PDF
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Attention Is All You Need (Vaswani et al., 2017)
                    </h3>
                    <p className="text-xs text-slate-500">NeurIPS • 15 Pages • Natural Language Processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hierarchically Analyzed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Executive Summary</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Introduces the Transformer architecture relying solely on attention mechanisms, replacing recurrent networks and significantly speeding up training.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Methodology & Dataset</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Stacked self-attention + feed-forward networks evaluated on WMT 2014 English-German (4.5M pairs) and English-French (36M pairs).
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Key Results & Metrics</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Achieves 28.4 BLEU on English-to-German and 41.8 BLEU on English-to-French, surpassing ensembles with 3.5 days of training.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Core Capabilities</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Designed specifically for Academic Excellence
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Unlike generic chatbots, ResearchMate AI parses formal academic sections, separates author limitations from AI inferences, and produces grounded literature syntheses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Hierarchical Summaries</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose between concise 100-word abstracts, 300-word comprehensive executive summaries, or beginner-friendly conceptual explanations.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Literature Review Matrix</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Select multiple papers to generate thematic syntheses, chronological evolutions, common research gaps, and formatted DOCX review drafts.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Cross-Paper Comparison</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Compare 2 to 10 publications side-by-side across objectives, algorithms, datasets, metrics, and limitations with exportable CSV tables.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Grounded RAG Chat</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask targeted questions about methods or results. Answers provide verifiable citations pointing directly to page numbers and section excerpts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Workflow</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              How ResearchMate AI Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-4">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Upload Research Paper</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Drag and drop your academic PDF. Validated up to 50MB with instant scanned document detection.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-4">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Extract & Chunk</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                PyMuPDF extracts page text and segments abstract, introduction, methodology, and results without truncation.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-4">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Grounded AI Analysis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Extracts objectives, datasets, and baseline metrics. Distinguishes author-stated limitations from AI assessments.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-4">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">Synthesize & Export</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Export executive summaries to publication-grade PDF, review drafts to Word (DOCX), or matrix data to CSV and JSON.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Integrity */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Integrity & Privacy First</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All uploaded documents are sandboxed per user account with strict authorization. Your research papers are never used to train public models.
            The system treats extracted text as untrusted content with prompt-injection defense mechanisms.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-slate-200">ResearchMate AI</span>
            <span>— Automated Research Paper Summarization Assistant</span>
          </div>
          <p>© 2026 ResearchMate AI. Designed for Academic Researchers & Students.</p>
        </div>
      </footer>
    </div>
  );
};
