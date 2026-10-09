# ResearchMate AI

> **"Read Less. Understand More. Research Smarter."**  
> Automated Research Paper Summarization, Grounded Synthesis, and Literature Review Assistant.

---

## 1. Overview

**ResearchMate AI** is a full-stack, production-grade AI-powered web application designed for students, researchers, professors, and academic professionals. It bridges the gap between dense multi-page academic papers and actionable insights by providing grounded section extraction, multi-tier summaries, multi-paper literature reviews, cross-paper comparison matrices, section-aware RAG Q&A with citations, and multi-format exports (PDF, DOCX, CSV, JSON).

### Key Architectural Highlights:
* **Grounded Section-Boundary Extraction**: Leverages PyMuPDF (`fitz`) and pdfplumber to parse titles, abstracts, introductions, methodologies, datasets, algorithms, results, and conclusions while preserving page numbers.
* **Token-Aware Sliding Window Chunking**: Hierarchical map-reduce summarization ensures papers exceeding model context windows are never silently truncated.
* **Strict Limitations & Future Work Separation**: Separates author-stated limitations from AI-inferred constraints (with evidentiary rationale) and author-proposed future work from AI-suggested extensions.
* **Zero-Hallucination Guardrails**: Unreported fields default strictly to `"Not reported in the paper"`.
* **Zero-Config Demo Mode**: Works out of the box without requiring external API keys via intelligent academic heuristic analysis.
* **Flexible AI Providers**: Ready for Groq (`llama-3.3-70b-versatile`) and OpenAI (`gpt-4o-mini` / `gpt-4o`) via secure server-side environment variables.
* **Full Multi-Format Export Engine**: Generates publication-grade PDFs via ReportLab, formatted Word documents (.docx) via `python-docx`, matrix spreadsheets (.csv), and JSON payloads.

---

## 2. Implemented Features Checklist

- [x] **Authentication & Profile**: JWT bearer tokens, bcrypt password hashing, user preferences (citation style, summary depth, explanation level), multi-tenant isolation.
- [x] **PDF Upload & Validation**: Drag-and-drop file upload, file size validation (50MB), filename sanitization, scanned PDF detection.
- [x] **AI Summarization Engine**: 100-word concise, 300-word detailed, and beginner-friendly summaries with instant length toggling.
- [x] **Deep Academic Extraction**: Primary/secondary objectives, research questions, datasets, algorithms, experimental setups, quantitative baseline metrics, practical applications.
- [x] **Distinct Limitations**: Strict separation between author-stated limitations and AI-inferred constraints with rationale.
- [x] **Distinct Future Scope**: Author-proposed next steps separated from AI-suggested extensions.
- [x] **Critical AI Analysis**: Explicitly labeled peer assessments (strengths, weaknesses, novelty, reproducibility, dataset risks).
- [x] **Structured Literature Review Generator**: Multi-paper synthesis generating:
  - Individual paper breakdown notes
  - Literature review matrix table
  - Thematic synthesis
  - Chronological evolution
  - Methodological comparative analysis
  - Common research gaps & conflicting findings
  - Formatted academic draft review with section citations
- [x] **Research Paper Comparison**: Compares 2–10 papers across objectives, algorithms, benchmarks, metrics, and limitations with metric benchmark guardrails.
- [x] **Grounded Chat with Paper (RAG)**: Section-aware retrieval with verified page number and section citations; out-of-scope refusals when information is not reported.
- [x] **Corpus Library**: Search by title/author/keyword, filtering by status/year, favorites, archiving, personal tags, personal labels, re-run analysis.
- [x] **Personal Research Notes**: Full CRUD markdown notes linked to individual papers or general thoughts.
- [x] **Multi-Format Exports**: PDF summary export, DOCX review export, CSV matrix export, and raw JSON analysis export.
- [x] **Settings & Diagnostics**: Explanation level, citation style (IEEE, APA, Harvard), export defaults, AI provider health check.
- [x] **Complete 14 Frontend Pages**: Fully responsive with professional navy blue, white, and slate theme, and dark/light mode toggle.
- [x] **Automated Test Suite**: 100% passing pytest suite covering auth, extraction, synthesis, comparison, RAG, and isolation.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS (Navy blue `#1e3a8a`, slate `#f8fafc`, crisp white), Dark/Light mode
- **Visuals & Charts:** Recharts, Lucide React icons
- **Navigation:** React Router v6

### Backend
- **Framework:** Python FastAPI (Python 3.10 – 3.14 compatible)
- **PDF Extraction:** PyMuPDF (`pymupdf`), `pdfplumber`
- **ORM & Database:** SQLAlchemy (SQLite default for local development, PostgreSQL ready)
- **Security:** PyJWT, bcrypt, CORS, Path-traversal defenses, Prompt-injection sanitization
- **Document Generation:** ReportLab (PDF), python-docx (DOCX)
- **AI Integrations:** Groq API, OpenAI API, Grounded Academic Heuristic Demo Mode

---

## 4. Quick Start (Windows & VS Code)

### Prerequisites
1. **Python 3.10+** (Python 3.14 installed on Windows)
2. **Node.js 18+** (Node v24 and npm installed)

---

### Step 1: Open in VS Code
Open the root directory in VS Code or PowerShell:
```powershell
cd c:\Users\hp\OneDrive\EE
```

---

### Step 2: Backend Setup & Startup

1. **Navigate to the backend folder**:
   ```powershell
   cd backend
   ```

2. **(Optional) Create and activate a virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install backend dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Review environment variables**:
   The default `.env` is already configured for zero-friction local development using SQLite and Demo Mode.
   ```env
   APP_NAME="ResearchMate AI"
   PORT=8000
   DATABASE_URL=sqlite:///./researchmate.db
   AI_PROVIDER=demo
   DEMO_MODE=True
   ```
   *(To use Groq or OpenAI, simply add `GROQ_API_KEY=your_key` or `OPENAI_API_KEY=your_key` and set `DEMO_MODE=False`)*.

5. **Run the backend server**:
   ```powershell
   python run_backend.py
   ```
   The backend will start at: `http://localhost:8000`  
   Interactive Swagger documentation: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup & Startup

1. **Open a new terminal and navigate to frontend**:
   ```powershell
   cd c:\Users\hp\OneDrive\EE\frontend
   ```

2. **Install frontend dependencies**:
   ```powershell
   npm install
   ```

3. **Start the Vite development server**:
   ```powershell
   npm run dev
   ```
   The frontend will open at: `http://localhost:5173`

---

## 5. Instant Demo Credentials

The backend automatically seeds a demo researcher account with pre-analyzed seminal papers (*Attention Is All You Need* & *Deep Residual Learning (ResNet)*) so you can test all features immediately without finding a PDF:

- **Email:** `demo@researchmate.ai`
- **Password:** `DemoPassword123!`
- *(Or click the **"Fill Pre-Configured Demo Credentials"** button on the Login page for 1-click access)*.

---

## 6. Running Automated Tests

Run the comprehensive automated pytest suite in the `backend` folder:
```powershell
cd c:\Users\hp\OneDrive\EE\backend
python -m pytest tests/ -v
```

All 4 test suites verify:
- User registration, duplicate prevention, and JWT validation (`test_auth.py`)
- PDF extraction, structured analysis, RAG chat, and exports (`test_pdf_and_analysis.py`)
- Literature review synthesis, DOCX/CSV exports, and comparisons (`test_literature_and_comparison.py`)
- Cross-user document isolation and file validation (`test_security_isolation.py`)

---

## 7. PostgreSQL Configuration (Optional)

To connect to a production PostgreSQL database instead of SQLite:
1. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/researchmate_db
   ```
2. Or launch the full stack with Docker Compose:
   ```powershell
   docker-compose up --build
   ```

---

## 8. License & Acknowledgments

Built for students and researchers.
ResearchMate AI — *"Read Less. Understand More. Research Smarter."*
