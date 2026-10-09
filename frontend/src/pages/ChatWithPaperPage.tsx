import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Quote,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, ChatMessage } from '../types';
import { Badge } from '../components/common/Badge';

export const ChatWithPaperPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What is the primary objective of this paper?',
    'Explain the methodology simply.',
    'Which datasets and evaluation metrics were used?',
    'What algorithm or architecture was proposed?',
    'What are the explicitly reported limitations?',
    'What future work is suggested by the authors?'
  ];

  useEffect(() => {
    const fetchChatData = async () => {
      if (!id) return;
      try {
        const [paperData, history] = await Promise.all([
          api.getPaper(id),
          api.getChatHistory(id),
        ]);
        setPaper(paperData);
        setMessages(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatData();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || !id || sending) return;

    setInputQuestion('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      paper_id: id,
      role: 'user',
      content: q,
      citations: [],
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const responseMsg = await api.chatWithPaper(id, q);
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, responseMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        paper_id: id,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to generate grounded answer from document.'}`,
        citations: [],
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 truncate">
          <Link
            to={id ? `/papers/${id}/analysis` : '/library'}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="truncate">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Chat with Paper: {paper?.title || 'Loading...'}
            </h1>
            <p className="text-[11px] text-slate-500 truncate">
              Grounded Retrieval-Augmented Q&A with section-level citations
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="primary">Grounded RAG</Badge>
          <Badge variant="neutral">{paper?.page_count || 1} Pages</Badge>
        </div>
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ask Questions Grounded in this Paper
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Every response draws directly from the verified text of this paper. Page numbers and section titles will be cited.
              </p>
            </div>

            {/* Quick suggested prompt chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl pt-2">
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                }`}
              >
                {msg.content}

                {/* Grounded Citation Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      Grounded Source References:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400"
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                          <BookOpen className="w-3 h-3 text-blue-500" />
                          <span>Section: {cite.section || 'Main Body'}</span>
                          <span>•</span>
                          <span>Page {cite.page || 1}</span>
                        </div>
                        <p className="italic text-slate-500">"{cite.excerpt}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-2">
                {msg.role === 'user' ? 'You' : 'ResearchMate AI'}
              </span>
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl max-w-xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Retrieving grounded sections & verifying...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question about objectives, methods, datasets, or results..."
          disabled={sending}
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!inputQuestion.trim() || sending}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
