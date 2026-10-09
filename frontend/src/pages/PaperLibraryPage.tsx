import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  Eye,
  MessageSquare,
  Tag,
  Plus,
  BookOpen,
  ArrowUpDown,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper } from '../types';
import { Badge } from '../components/common/Badge';

export const PaperLibraryPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Tag modal / input state
  const [activeTagPaperId, setActiveTagPaperId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await api.getPapers({
        search: search || undefined,
        status: statusFilter || undefined,
        is_favorite: showFavoritesOnly ? true : undefined,
        is_archived: showArchived,
      });
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, statusFilter, showFavoritesOnly, showArchived]);

  const handleToggleFavorite = async (paper: ResearchPaper) => {
    try {
      await api.updatePaper(paper.id, { is_favorite: !paper.is_favorite });
      setPapers(prev =>
        prev.map(p => (p.id === paper.id ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchive = async (paper: ResearchPaper) => {
    try {
      await api.updatePaper(paper.id, { is_archived: !paper.is_archived });
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    if (!window.confirm('Are you sure you want to delete this research paper and all associated analysis records?')) return;
    try {
      await api.deletePaper(paperId);
      setPapers(prev => prev.filter(p => p.id !== paperId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRerunAnalysis = async (paperId: string) => {
    try {
      await api.analyzePaper(paperId);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = async (paperId: string) => {
    if (!newTagInput.trim()) return;
    try {
      await api.addTag(paperId, newTagInput.trim());
      setNewTagInput('');
      setActiveTagPaperId(null);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTag = async (paperId: string, tag: string) => {
    try {
      await api.removeTag(paperId, tag);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  // Sort papers
  const sortedPapers = [...papers].sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return sortOrder === 'asc'
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Research Paper Library
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, tag, filter, and organize your academic corpus.
          </p>
        </div>

        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Paper</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="analyzing">Analyzing</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              showFavoritesOnly
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>

          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              showArchived
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Archived View' : 'Active'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (sortBy === 'date') setSortBy('title');
              else setSortBy('date');
              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort: {sortBy === 'date' ? 'Date' : 'Title'}</span>
          </button>
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading research library...</p>
        </div>
      ) : sortedPapers.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No research papers match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting search terms, toggling off filters, or upload a new research PDF.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-lg transition-all shadow-xs"
            >
              <div>
                {/* Card Top: Favorite & Status */}
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={
                      paper.processing_status === 'completed'
                        ? 'success'
                        : paper.processing_status === 'failed'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {paper.processing_status}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(paper)}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                      title={paper.is_favorite ? 'Remove favorite' : 'Mark favorite'}
                    >
                      <Star className={`w-4 h-4 ${paper.is_favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(paper)}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                      title={paper.is_archived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaper(paper.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1.5 leading-snug">
                  {paper.title}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                  {paper.authors.length > 0 ? paper.authors.join(', ') : 'Authors not reported'}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {paper.publication_year || 'Recent'}
                  </span>
                  <span>•</span>
                  <span>{paper.page_count} Pages</span>
                  <span>•</span>
                  <span>{paper.research_domain || 'AI'}</span>
                </div>

                {/* Personal Label if present */}
                {paper.personal_label && (
                  <div className="mb-3 px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium inline-block">
                    {paper.personal_label}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {paper.tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleRemoveTag(paper.id, t)}
                      className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md hover:line-through cursor-pointer"
                      title="Click to remove tag"
                    >
                      #{t}
                    </span>
                  ))}

                  {activeTagPaperId === paper.id ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTag(paper.id);
                          if (e.key === 'Escape') setActiveTagPaperId(null);
                        }}
                        placeholder="Tag name..."
                        className="text-[10px] px-1.5 py-0.5 border border-slate-300 rounded-md w-20 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddTag(paper.id)}
                        className="text-[10px] text-blue-600 font-bold"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTagPaperId(paper.id);
                        setNewTagInput('');
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-slate-700"
                    >
                      <Plus className="w-2.5 h-2.5" /> Tag
                    </button>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/papers/${paper.id}/analysis`}
                  className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Analysis</span>
                </Link>

                <Link
                  to={`/papers/${paper.id}/chat`}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-colors"
                  title="Chat with paper"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleRerunAnalysis(paper.id)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-colors"
                  title="Re-run analysis"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
