import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-md">
        <GraduationCap className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-200">
        Research Document Not Found
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        The research paper, literature review, or page route you are trying to access does not exist or has been relocated.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold transition-all"
        >
          Landing Page
        </Link>
      </div>
    </div>
  );
};
