import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Table,
  Layers,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, PaperComparison } from '../types';
import { Badge } from '../components/common/Badge';

export const PaperComparisonPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [comparisons, setComparisons] = useState<PaperComparison[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<PaperComparison | null>(null);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [compTitle, setCompTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'view'>('create');

  // Filter criteria on the comparison table
  const [filterDomain, setFilterDomain] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersData, compsData] = await Promise.all([
        api.getPapers({ status: 'completed' }),
        api.getComparisons(),
      ]);
      setPapers(papersData);
      setComparisons(compsData);

      if (compsData.length > 0 && !selectedComparison) {
        setSelectedComparison(compsData[0]);
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

  const handleToggleSelect = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      setSelectedPaperIds(prev => prev.filter(id => id !== paperId));
    } else {
      if (selectedPaperIds.length >= 10) {
        alert('You can select up to 10 papers for comparative analysis.');
        return;
      }
      setSelectedPaperIds(prev => [...prev, paperId]);
    }
  };

  const handleRunComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaperIds.length < 2) {
      alert('Please select at least 2 papers to compare.');
      return;
    }

    setComparing(true);
    try {
      const result = await api.createComparison({
        title: compTitle.trim() || `Comparative Analysis (${selectedPaperIds.length} Papers)`,
        paper_ids: selectedPaperIds,
      });
      setSelectedComparison(result);
      setViewMode('view');
      setCompTitle('');
      setSelectedPaperIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to compare papers');
    } finally {
      setComparing(false);
    }
  };

  const handleExportCsv = () => {
    if (!selectedComparison) return;
    const url = `/api/comparisons/${selectedComparison.id}/export/csv`;
    api.downloadFile(url, `${selectedComparison.title.replace(/\s+/g, '_')}.csv`);
  };

  // Filter matrix rows
  const filteredMatrix = selectedComparison?.comparison_matrix?.filter(row => {
    if (filterDomain && !row.domain?.toLowerCase().includes(filterDomain.toLowerCase())) return false;
    if (filterMethod && !row.methodology?.toLowerCase().includes(filterMethod.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Research Paper Comparison
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare 2 to 10 publications side-by-side across objectives, algorithms, benchmarks, metrics, and limitations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'create' ? 'view' : 'create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <GitCompare className="w-4 h-4" />
          <span>{viewMode === 'create' ? 'View Saved Comparisons' : 'New Comparison'}</span>
        </button>
      </div>

      {/* Comparisons History Chips */}
      {comparisons.length > 0 && viewMode === 'view' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pl-2">
            History:
          </span>
          {comparisons.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedComparison(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-colors border ${
                selectedComparison?.id === c.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-500" />
              <span>{c.title}</span>
              <span className="text-[10px] text-slate-400">({c.paper_ids?.length || 0})</span>
            </button>
          ))}
        </div>
      )}

      {/* Mode A: Create New Comparison Form */}
      {viewMode === 'create' && (
        <form onSubmit={handleRunComparison} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Step 1: Title Your Comparison</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Comparison Study Title (Optional)
              </label>
              <input
                type="text"
                value={compTitle}
                onChange={(e) => setCompTitle(e.target.value)}
                placeholder="e.g. Architectural Comparison: Transformers vs Residual Networks"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Step 2: Select 2 to 10 Papers ({selectedPaperIds.length} Selected)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose publications from your corpus to compare across objectives, methods, metrics, and limitations.
                </p>
              </div>

              {selectedPaperIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPaperIds([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {papers.map((paper) => {
                const isSelected = selectedPaperIds.includes(paper.id);
                return (
                  <div
                    key={paper.id}
                    onClick={() => handleToggleSelect(paper.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/40 dark:bg-slate-800/30'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{paper.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {paper.authors.slice(0, 2).join(', ')} • {paper.publication_year || 'Recent'} • {paper.page_count} Pages
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={comparing || selectedPaperIds.length < 2}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <GitCompare className="w-4 h-4" />
                <span>{comparing ? 'Building Comparison Matrix...' : `Compare ${selectedPaperIds.length} Papers`}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Mode B: View Comparison Result */}
      {viewMode === 'view' && selectedComparison && (
        <div className="space-y-6">
          {/* Comparison Header */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{selectedComparison.paper_ids?.length || 0} Papers Compared</Badge>
                <span className="text-xs text-slate-400">Side-by-Side Analysis</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedComparison.title}
              </h2>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start md:self-auto"
              title="Download comparison matrix as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filtering bar for matrix */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Matrix:
            </span>
            <input
              type="text"
              placeholder="Filter domain..."
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            <input
              type="text"
              placeholder="Filter methodology..."
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Main Comparison Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Title & Year</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Objective</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Dataset</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Methodology</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Algorithms</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Metrics</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Main Results</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Limitations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMatrix.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {row.title} ({row.year})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{row.objective}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.dataset}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.methodology}</td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">{row.algorithms}</td>
                    <td className="py-3.5 px-4 text-purple-600 dark:text-purple-400">{row.metrics}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{row.main_results}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.limitations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Qualitative Synthesis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Methodological Similarities</span>
              </h3>
              <ul className="space-y-2">
                {selectedComparison.similarities?.map((sim: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{sim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Key Differences</span>
              </h3>
              <ul className="space-y-2">
                {selectedComparison.differences?.map((diff: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best-Performing & Weaknesses Guarded Breakdown */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Empirical Performance Benchmark & Fair Ranking Analysis
            </h3>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Cautionary Academic Guideline:</strong> {selectedComparison.best_performing_analysis?.summary}
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                {selectedComparison.best_performing_analysis?.metric_notes}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                  Common Methodological Weaknesses
                </span>
                <ul className="space-y-1.5">
                  {selectedComparison.common_weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300">• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
                  Unexplored Research Opportunities
                </span>
                <ul className="space-y-1.5">
                  {selectedComparison.unexplored_opportunities?.map((o: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300">• {o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
