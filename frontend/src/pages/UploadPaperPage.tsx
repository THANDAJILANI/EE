import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';

export const UploadPaperPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'extracting' | 'analyzing' | 'completed' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resultPaperId, setResultPaperId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScannedWarning, setIsScannedWarning] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);
    setIsScannedWarning(false);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Please upload an academic research paper in PDF format (.pdf).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 50MB maximum limit.');
      return;
    }
    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(25);
    setErrorMessage(null);

    try {
      // Step 1: Upload & Extract
      setTimeout(() => {
        setUploadStatus('extracting');
        setUploadProgress(60);
      }, 700);

      const res = await api.uploadPaper(selectedFile);

      setUploadStatus('analyzing');
      setUploadProgress(85);

      setTimeout(() => {
        setUploadStatus('completed');
        setUploadProgress(100);
        setResultPaperId(res.paper_id);
        if (res.is_scanned) {
          setIsScannedWarning(true);
        }
      }, 1000);
    } catch (err: any) {
      setUploadStatus('failed');
      setErrorMessage(err.message || 'PDF processing failed. Please check file formatting or retry.');
    }
  };

  // Helper to load sample research paper
  const handleLoadSamplePaper = async () => {
    try {
      const samplePdfContent = "%PDF-1.4 sample research paper generated for demonstration";
      const blob = new Blob([samplePdfContent], { type: "application/pdf" });
      const sampleFile = new File([blob], "sample_transformer_study.pdf", { type: "application/pdf" });
      handleFileSelection(sampleFile);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Research Paper
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload PDF documents for full-text section segmentation, token-aware chunking, and grounded academic extraction.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {dragActive ? 'Drop your PDF here' : 'Drag & drop research paper PDF here'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline">browse from your computer</span>
          </p>

          <p className="mt-4 text-[11px] text-slate-400">
            Supports multi-page PDFs up to 50MB. Scanned PDF detection enabled.
          </p>
        </div>

        {/* Selected File Details & Actions */}
        {selectedFile && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                </p>
              </div>
            </div>

            {uploadStatus === 'idle' && (
              <button
                type="button"
                onClick={startUpload}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Analysis</span>
              </button>
            )}
          </div>
        )}

        {/* Processing Progress Indicators */}
        {uploadStatus !== 'idle' && (
          <div className="mt-6 space-y-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {uploadStatus === 'uploading' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                {uploadStatus === 'extracting' && <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />}
                {uploadStatus === 'analyzing' && <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />}
                {uploadStatus === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {uploadStatus === 'failed' && <AlertCircle className="w-4 h-4 text-rose-500" />}

                {uploadStatus === 'uploading' && 'Stage 1/3: Validating & Uploading PDF...'}
                {uploadStatus === 'extracting' && 'Stage 2/3: PyMuPDF Section & Boundary Extraction...'}
                {uploadStatus === 'analyzing' && 'Stage 3/3: Running Grounded AI Summarization Pipeline...'}
                {uploadStatus === 'completed' && 'Paper Successfully Analyzed!'}
                {uploadStatus === 'failed' && 'Analysis Encountered an Error'}
              </span>
              <span className="text-slate-500">{uploadProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  uploadStatus === 'failed'
                    ? 'bg-rose-500'
                    : uploadStatus === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {/* Scanned Warning Notification */}
            {isScannedWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  <strong>Scanned Document Warning:</strong> Machine-readable text was limited in this PDF. An OCR layer may be required for full text resolution.
                </span>
              </div>
            )}

            {/* Completion Link */}
            {uploadStatus === 'completed' && resultPaperId && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/papers/${resultPaperId}/analysis`)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <span>Open Structured Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Failed Retry Option */}
            {uploadStatus === 'failed' && (
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMessage}</span>
                <button
                  type="button"
                  onClick={startUpload}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && uploadStatus === 'idle' && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Informational Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <FileCheck className="w-5 h-5 text-blue-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-1">Section Boundary Aware</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Preserves page numbers and isolates abstract, methodology, results, and discussion for factual provenance.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Layers className="w-5 h-5 text-indigo-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-1">Hierarchical Chunking</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-page research papers exceeding typical context windows are processed via map-reduce sliding windows without truncation.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-1">No API Key Required</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Intelligent academic heuristic extraction mode allows instant testing of real papers even without an external LLM key.
          </p>
        </div>
      </div>
    </div>
  );
};
