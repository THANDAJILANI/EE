export interface User {
  id: string;
  email: string;
  full_name: string;
  institution?: string;
  field_of_study?: string;
  preferred_explanation_level: 'beginner' | 'intermediate' | 'advanced';
  citation_style: 'IEEE' | 'APA' | 'Harvard';
  default_summary_length: 'concise' | 'detailed' | 'beginner';
  default_export_format: 'pdf' | 'docx' | 'json';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaperMetadata {
  id: string;
  paper_id: string;
  authors: string[];
  publication_year?: number;
  journal_or_conference?: string;
  doi?: string;
  research_domain?: string;
  keywords: string[];
  abstract?: string;
}

export interface QuantitativeMetric {
  metric_name: string;
  value: string;
  baseline_value?: string;
  comparison_note?: string;
}

export interface InferredLimitation {
  limitation: string;
  evidence_rationale: string;
}

export interface PaperAnalysis {
  id: string;
  paper_id: string;
  concise_summary?: string;
  detailed_summary?: string;
  beginner_explanation?: string;
  main_contribution?: string;
  why_it_matters?: string;
  research_objectives: {
    primary_objective: string;
    secondary_objectives: string[];
    research_questions: string[];
    hypotheses: string[];
    problem_addressed: string;
    research_gap: string;
  };
  methodology: {
    research_design: string;
    dataset: {
      name: string;
      source: string;
      size: string;
      preprocessing: string;
    };
    algorithms_models: string[];
    tools_frameworks: string[];
    experimental_setup: string;
    evaluation_metrics: string[];
    baseline_methods: string[];
    implementation_details: string;
    statistical_techniques: string[];
  };
  results_findings: {
    main_findings: string[];
    quantitative_results: QuantitativeMetric[];
    comparisons_with_baselines: string[];
    tables_described: string[];
    authors_conclusions: string;
    practical_applications: string[];
  };
  limitations: {
    author_stated: string[];
    ai_inferred: InferredLimitation[];
  };
  future_scope: {
    author_proposed: string[];
    ai_suggested: string[];
  };
  critical_analysis: {
    strengths: string[];
    weaknesses: string[];
    novelty_and_contribution: string;
    reproducibility_concerns: string;
    dataset_limitations: string;
    evaluation_concerns: string;
    practical_relevance: string;
  };
  is_demo_mode: boolean;
  created_at: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  filename: string;
  file_size: number;
  page_count: number;
  is_scanned: boolean;
  processing_status: 'uploaded' | 'extracting' | 'analyzing' | 'completed' | 'failed';
  error_message?: string;
  is_favorite: boolean;
  is_archived: boolean;
  personal_label?: string;
  created_at: string;
  authors: string[];
  publication_year?: number;
  research_domain?: string;
  tags: string[];
  metadata?: PaperMetadata;
}

export interface IndividualPaperNote {
  paper_id: string;
  paper_title: string;
  authors_year: string;
  citation_label: string;
  research_problem: string;
  objectives: string;
  methodology: string;
  dataset: string;
  algorithms: string;
  key_results: string;
  limitations: string;
  research_gap: string;
  relevance_to_topic: string;
}

export interface LiteratureReview {
  id: string;
  title: string;
  topic: string;
  citation_style: string;
  paper_ids: string[];
  individual_paper_notes: IndividualPaperNote[];
  matrix_data: any[];
  thematic_review?: string;
  chronological_review?: string;
  methodology_comparison?: string;
  common_gaps: string[];
  conflicting_findings: string[];
  future_directions: string[];
  draft_review_markdown?: string;
  created_at: string;
}

export interface PaperComparison {
  id: string;
  title: string;
  paper_ids: string[];
  comparison_matrix: Array<{
    paper_id: string;
    title: string;
    year: any;
    domain: string;
    objective: string;
    dataset: string;
    methodology: string;
    algorithms: string;
    metrics: string;
    main_results: string;
    limitations: string;
    research_gaps: string;
  }>;
  similarities: string[];
  differences: string[];
  best_performing_analysis: {
    summary: string;
    domain_observations: string[];
    metric_notes: string;
  };
  common_weaknesses: string[];
  unexplored_opportunities: string[];
  created_at: string;
}

export interface Citation {
  page?: number;
  section?: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  paper_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface UserNote {
  id: string;
  paper_id?: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SystemStatus {
  app_name: string;
  environment: string;
  demo_mode: boolean;
  active_ai_provider: string;
  groq_configured: boolean;
  openai_configured: boolean;
  max_file_size_mb: number;
  user_stats: {
    total_papers: number;
    total_reviews: number;
    total_notes: number;
  };
}
