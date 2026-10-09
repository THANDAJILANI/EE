import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  BookOpen,
  GitCompare,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import { ResearchPaper, SystemStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersData, reviewsData, statusData] = await Promise.all([
          api.getPapers(),
          api.getLiteratureReviews(),
          api.getSystemStatus(),
        ]);
        setPapers(papersData);
        setReviews(reviewsData);
        setStatus(statusData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPapers = papers.length;
  const completedPapers = papers.filter((p) => p.processing_status === 'completed').length;
  const favoritePapers = papers.filter((p) => p.is_favorite).length;

  // Mock research activity timeline
  const activityData = [
    { month: 'May', uploads: 2, reviews: 1 },
    { month: 'Jun', uploads: 4, reviews: 2 },
    { month: 'Jul', uploads: 3, reviews: 1 },
    { month: 'Aug', uploads: 7, reviews: 3 },
    { month: 'Sep', uploads: 9, reviews: 5 },
    { month: 'Oct', uploads: totalPapers || 12, reviews: reviews.length || 4 },
  ];

  const filteredRecentPapers = papers
    .filter((p) =>
      searchFilter
        ? p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.authors.some((a) => a.toLowerCase().includes(searchFilter.toLowerCase()))
        : true
    )
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ResearchMate AI Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Researcher'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            "Read Less. Understand More. Research Smarter." You have {completedPapers} analyzed papers ready for multi-paper synthesis, comparisons, and citation-grounded inquiries.
          </p>
        </div>

        {/* Quick Actions Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/upload"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Paper</span>
          </Link>
          <Link
            to="/literature-review"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>New Literature Review</span>
          </Link>
          <Link
            to="/compare"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Papers</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Papers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalPapers}</div>
          <p className="text-xs text-slate-500 mt-1">{completedPapers} analyzed and ready</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Papers This Month</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalPapers}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Active research sprint</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Literature Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{reviews.length}</div>
          <p className="text-xs text-slate-500 mt-1">Multi-paper matrices saved</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Favorites & Starred</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{favoritePapers}</div>
          <p className="text-xs text-slate-500 mt-1">High-priority publications</p>
        </div>
      </div>

      {/* Analytics Chart & Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Research Activity & Synthesis</h2>
              <p className="text-xs text-slate-500">Document uploads and literature review syntheses over time</p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUploads)" name="Papers Uploaded" />
                <Area type="monotone" dataKey="reviews" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReviews)" name="Reviews Created" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System & AI Provider Status Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">AI Pipeline Status</h2>
            <p className="text-xs text-slate-500 mb-4">Grounded processing architecture</p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Active Engine</p>
                  <p className="text-[11px] text-slate-500">
                    {status?.active_ai_provider === 'demo' ? 'Grounded Demo Engine' : `${status?.active_ai_provider.toUpperCase()} LLM`}
                  </p>
                </div>
                <Badge variant={status?.active_ai_provider === 'demo' ? 'demo' : 'success'}>
                  {status?.active_ai_provider === 'demo' ? 'Demo Mode' : 'Connected'}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Extraction Engine</p>
                  <p className="text-[11px] text-slate-500">PyMuPDF + Section Parser</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Max Upload Size</p>
                  <p className="text-[11px] text-slate-500">Configured in backend</p>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{status?.max_file_size_mb || 50} MB</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/settings"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1.5"
            >
              <span>View full AI provider settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recently Analyzed Papers Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recently Analyzed Papers</h2>
            <p className="text-xs text-slate-500">Instant access to your latest academic extractions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter recent papers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
            <Link
              to="/library"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap"
            >
              View All ({papers.length})
            </Link>
          </div>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No research papers uploaded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Upload your first research paper in PDF format to generate automated executive summaries and extraction matrices.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Paper</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Paper Title</th>
                  <th className="py-3 px-4 font-semibold">Authors & Year</th>
                  <th className="py-3 px-4 font-semibold">Domain</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecentPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        {paper.is_favorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <span className="truncate">{paper.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {paper.authors.slice(0, 2).join(', ')} {paper.publication_year ? `(${paper.publication_year})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {paper.research_domain || 'Computer Science'}
                    </td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/papers/${paper.id}/analysis`}
                          className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Analysis</span>
                        </Link>
                        <Link
                          to={`/papers/${paper.id}/chat`}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
