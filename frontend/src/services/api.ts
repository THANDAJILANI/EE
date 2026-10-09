import {
  User,
  AuthResponse,
  ResearchPaper,
  PaperAnalysis,
  LiteratureReview,
  PaperComparison,
  ChatMessage,
  UserNote,
  SystemStatus
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('researchmate_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('researchmate_token');
    localStorage.removeItem('researchmate_user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Authentication
  async register(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  async updateProfile(data: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Papers
  async uploadPaper(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/papers/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async getPapers(params?: { search?: string; status?: string; is_favorite?: boolean; is_archived?: boolean }): Promise<ResearchPaper[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.is_favorite !== undefined) searchParams.append('is_favorite', String(params.is_favorite));
    if (params?.is_archived !== undefined) searchParams.append('is_archived', String(params.is_archived));

    const res = await fetch(`${API_BASE}/papers?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ResearchPaper[]>(res);
  },

  async getPaper(id: string): Promise<ResearchPaper> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ResearchPaper>(res);
  },

  async updatePaper(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deletePaper(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/papers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async analyzePaper(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/papers/${id}/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getPaperAnalysis(id: string): Promise<PaperAnalysis> {
    const res = await fetch(`${API_BASE}/papers/${id}/analysis`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaperAnalysis>(res);
  },

  // Literature Review
  async createLiteratureReview(data: { title: string; topic: string; paper_ids: string[]; citation_style?: string }): Promise<LiteratureReview> {
    const res = await fetch(`${API_BASE}/literature-reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LiteratureReview>(res);
  },

  async getLiteratureReviews(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/literature-reviews`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  async getLiteratureReview(id: string): Promise<LiteratureReview> {
    const res = await fetch(`${API_BASE}/literature-reviews/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<LiteratureReview>(res);
  },

  async deleteLiteratureReview(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/literature-reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Comparisons
  async createComparison(data: { title?: string; paper_ids: string[] }): Promise<PaperComparison> {
    const res = await fetch(`${API_BASE}/comparisons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PaperComparison>(res);
  },

  async getComparisons(): Promise<PaperComparison[]> {
    const res = await fetch(`${API_BASE}/comparisons`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaperComparison[]>(res);
  },

  async getComparison(id: string): Promise<PaperComparison> {
    const res = await fetch(`${API_BASE}/comparisons/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaperComparison>(res);
  },

  // Chat
  async chatWithPaper(paperId: string, question: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question }),
    });
    return handleResponse<ChatMessage>(res);
  },

  async getChatHistory(paperId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/chat`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ChatMessage[]>(res);
  },

  // Notes
  async getNotes(paperId?: string): Promise<UserNote[]> {
    const url = paperId ? `${API_BASE}/notes?paper_id=${paperId}` : `${API_BASE}/notes`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<UserNote[]>(res);
  },

  async createNote(data: { title: string; content: string; tags?: string[]; paper_id?: string }): Promise<UserNote> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UserNote>(res);
  },

  async updateNote(id: string, data: any): Promise<UserNote> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UserNote>(res);
  },

  async deleteNote(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Tags
  async addTag(paperId: string, tagName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tag_name: tagName }),
    });
    return handleResponse<any>(res);
  },

  async removeTag(paperId: string, tagName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/papers/${paperId}/tags/${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Settings & Status
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/settings/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SystemStatus>(res);
  },

  // Download Helpers (Trigger authentic direct browser file downloads)
  async downloadFile(url: string, defaultFilename: string) {
    const token = localStorage.getItem('researchmate_token');
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  }
};
