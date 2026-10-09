import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Plus,
  CheckCircle2,
  Trash2,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  AlertCircle,
  Table,
  Eye,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, LiteratureReview } from '../types';
import { Badge } from '../components/common/Badge';

export const LiteratureReviewPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<LiteratureReview | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for creating new review
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [citationStyle, setCitationStyle] = useState('IEEE');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'view'>('create');

  // Sub-tabs when viewing generated literature review
  const [reviewTab, setReviewTab] = useState<'matrix' | 'draft' | 'thematic' | 'chronological' | 'methodology' | 'gaps' | 'notes'>('draft');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersData, reviewsData] = await Promise.all([
        api.getPapers({ status: 'completed' }),
        api.getLiteratureReviews(),
      ]);
      setPapers(papersData);
      setReviews(reviewsData);

      if (reviewsData.length > 0 && !selectedReview) {
        // Automatically load latest review if exists
        const latest = await api.getLiteratureReview(reviewsData[0].id);
        setSelectedReview(latest);
        setViewMode('view');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePaperSelection = (paperId: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(paperId) ? prev.filter(id => id !== paperId) : [...prev, paperId]
    );
  };

  const handleGenerateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || selectedPaperIds.length === 0) return;

    setGenerating(true);
    try {
      const generated = await api.createLiteratureReview({
        title: title.trim() || `Literature Review on ${topic.trim()}`,
        topic: topic.trim(),
        paper_ids: selectedPaperIds,
        citation_style: citationStyle,
      });
      setSelectedReview(generated);
      setViewMode('view');
      setTopic('');
      setTitle('');
      setSelectedPaperIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to generate literature review. Please ensure selected papers have completed analysis.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectExistingReview = async (reviewId: string) => {
    try {
      setLoading(true);
      const rev = await api.getLiteratureReview(reviewId);
      setSelectedReview(rev);
      setViewMode('view');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this literature review?')) return;
    try {
      await api.deleteLiteratureReview(reviewId);
      if (selectedReview?.id === reviewId) setSelectedReview(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportDocx = () => {
    if (!selectedReview) return;
    const url = `/api/literature-reviews/${selectedReview.id}/export/docx`;
    api.downloadFile(url, `${selectedReview.title.replace(/\s+/g, '_')}.docx`);
  };

  const handleExportCsv = () => {
    if (!selectedReview) return;
    const url = `/api/literature-reviews/${selectedReview.id}/export/csv`;
    api.downloadFile(url, `${selectedReview.title.replace(/\s+/g, '_')}_matrix.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Literature Review Generator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Synthesize multiple papers into structured matrices, thematic discussions, research gaps, and formatted draft reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('create')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Literature Review</span>
          </button>
        </div>
      </div>

      {/* Review Selector / History Strip */}
      {reviews.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pl-2">
            Saved Reviews:
          </span>
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectExistingReview(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-colors border ${
                selectedReview?.id === r.id && viewMode === 'view'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>{r.title}</span>
              <span className="text-[10px] text-slate-400">({r.paper_count} papers)</span>
            </button>
          ))}
        </div>
      )}

      {/* Mode A: Create New Review */}
      {viewMode === 'create' && (
        <form onSubmit={handleGenerateReview} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Step 1: Define Research Topic & Citation Framework</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Research Topic or Working Question *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Scalable Attention Mechanisms for Efficient Long-Context LLMs"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Literature Review Document Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A Systematic Survey on Attention Scaling"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Citation Style Standard
              </label>
              <div className="flex items-center gap-3">
                {['IEEE', 'APA', 'Harvard'].map((style) => (
                  <label key={style} className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="citationStyle"
                      value={style}
                      checked={citationStyle === style}
                      onChange={(e) => setCitationStyle(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{style} Style</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Select Papers */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Step 2: Select Papers from Your Library ({selectedPaperIds.length} selected)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose analyzed research papers to synthesize into individual notes and the literature matrix.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPaperIds(papers.map(p => p.id))}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Select All ({papers.length})
              </button>
            </div>

            {papers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">No analyzed research papers available. Please upload papers first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {papers.map((paper) => {
                  const isSelected = selectedPaperIds.includes(paper.id);
                  return (
                    <div
                      key={paper.id}
                      onClick={() => handleTogglePaperSelection(paper.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 rounded-sm text-blue-600 focus:ring-blue-500"
                      />
                      <div className="truncate flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{paper.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {paper.authors.slice(0, 2).join(', ')} • {paper.publication_year || 'Recent'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={generating || selectedPaperIds.length === 0 || !topic.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Synthesizing Literature Review...' : 'Generate Literature Review'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Mode B: View Generated Literature Review */}
      {viewMode === 'view' && selectedReview && (
        <div className="space-y-6">
          {/* Review Header Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{selectedReview.citation_style} Citations</Badge>
                <span className="text-xs text-slate-400">
                  Synthesized {selectedReview.paper_ids?.length || 0} Primary Studies
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedReview.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                <strong>Topic:</strong> {selectedReview.topic}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportDocx}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                title="Export complete review as Microsoft Word Document (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Word (.docx)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Export Matrix as CSV spreadsheet"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Matrix CSV</span>
              </button>

              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'draft', label: '1. Academic Draft Review' },
              { id: 'matrix', label: '2. Review Matrix Table' },
              { id: 'thematic', label: '3. Thematic Synthesis' },
              { id: 'chronological', label: '4. Chronological Evolution' },
              { id: 'methodology', label: '5. Methodology Comparison' },
              { id: 'gaps', label: '6. Common Gaps & Conflicts' },
              { id: 'notes', label: '7. Individual Paper Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReviewTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  reviewTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-Tab Content: 1. Academic Draft */}
          {reviewTab === 'draft' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {selectedReview.draft_review_markdown}
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 2. Matrix Table */}
          {reviewTab === 'matrix' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Literature Review Matrix Table
                </h3>
                <button
                  onClick={handleExportCsv}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download Spreadsheet
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold min-w-[200px]">Title & Year</th>
                      <th className="py-3 px-4 font-bold min-w-[140px]">Dataset</th>
                      <th className="py-3 px-4 font-bold min-w-[140px]">Methodology</th>
                      <th className="py-3 px-4 font-bold min-w-[140px]">Algorithms</th>
                      <th className="py-3 px-4 font-bold min-w-[220px]">Key Findings</th>
                      <th className="py-3 px-4 font-bold min-w-[180px]">Identified Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedReview.matrix_data?.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {row.title} ({row.year})
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.dataset}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.methodology}</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">{row.algorithms}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{row.key_findings}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 3. Thematic Review */}
          {reviewTab === 'thematic' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Thematic Synthesis</h3>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedReview.thematic_review}
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 4. Chronological Evolution */}
          {reviewTab === 'chronological' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chronological Literature Progression</h3>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedReview.chronological_review}
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 5. Methodology Comparison */}
          {reviewTab === 'methodology' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Methodological Comparative Analysis</h3>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedReview.methodology_comparison}
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 6. Common Gaps & Conflicts */}
          {reviewTab === 'gaps' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Common Research Gaps Across Studies
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <ul className="space-y-2">
                    {selectedReview.common_gaps?.map((gap: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Conflicting Findings Between Studies
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <ul className="space-y-2">
                    {selectedReview.conflicting_findings?.map((conf: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{conf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Future Research Directions
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <ul className="space-y-2">
                    {selectedReview.future_directions?.map((fd: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{fd}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab Content: 7. Individual Paper Notes */}
          {reviewTab === 'notes' && (
            <div className="space-y-4">
              {selectedReview.individual_paper_notes?.map((note: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {note.paper_title}
                    </h4>
                    <span className="text-xs text-slate-400">{note.authors_year}</span>
                  </div>

                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {note.relevance_to_topic}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="font-bold text-slate-500 block mb-0.5">Objective:</span>
                      <span className="text-slate-700 dark:text-slate-300">{note.objectives}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="font-bold text-slate-500 block mb-0.5">Methodology & Dataset:</span>
                      <span className="text-slate-700 dark:text-slate-300">{note.methodology} on {note.dataset}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
