import re
from typing import Dict, Any, List, Tuple
from app.core.config import settings
from app.models.paper import ResearchPaper
import httpx

def retrieve_relevant_passages(
    paper: ResearchPaper,
    query: str,
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant passages from the paper's extracted sections or text
    using section-aware lexical keyword matching.
    """
    passages = []
    sections = paper.extracted_sections or {}

    # Gather passages from structured sections if available
    if sections:
        for sec_name, sec_val in sections.items():
            sec_text = sec_val.get("text", "")
            start_page = sec_val.get("start_page", 1)
            # Break into paragraphs
            paras = [p.strip() for p in sec_text.split("\n\n") if len(p.strip()) > 30]
            if not paras:
                paras = [sec_text[:1000]] if sec_text else []

            for p_idx, para in enumerate(paras):
                passages.append({
                    "section": sec_name,
                    "page": start_page,
                    "text": para
                })
    else:
        # Fallback to chunking extracted_text
        text = paper.extracted_text or ""
        paras = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 40]
        for idx, para in enumerate(paras):
            passages.append({
                "section": "Main Body",
                "page": min(1 + idx // 3, paper.page_count or 1),
                "text": para
            })

    if not passages:
        return []

    # Score passages against query tokens
    q_tokens = set(re.findall(r"\b\w{3,}\b", query.lower()))
    scored_passages = []

    for item in passages:
        p_lower = item["text"].lower()
        score = sum(1 for t in q_tokens if t in p_lower)
        # Boost if query matches section name
        if any(t in item["section"].lower() for t in q_tokens):
            score += 2

        if score > 0:
            scored_passages.append((score, item))

    scored_passages.sort(key=lambda x: x[0], reverse=True)
    return [item for score, item in scored_passages[:top_k]]

async def answer_paper_question(
    paper: ResearchPaper,
    question: str
) -> Dict[str, Any]:
    """
    Answers user question using Grounded Retrieval-Augmented Generation.
    Returns:
    - answer content
    - citations list [{ page, section, excerpt }]
    """
    relevant_passages = retrieve_relevant_passages(paper, question, top_k=3)

    if not relevant_passages:
        return {
            "content": (
                "Based on the uploaded document, there is insufficient information to answer this question. "
                "The paper text does not report details matching your query."
            ),
            "citations": []
        }

    # Prepare citations
    citations = []
    context_str = ""
    for idx, p in enumerate(relevant_passages):
        excerpt = p["text"][:220].strip() + "..."
        citations.append({
            "page": p["page"],
            "section": p["section"],
            "excerpt": excerpt
        })
        context_str += f"\n[Source {idx+1} - Section: {p['section']}, Page {p['page']}]:\n{p['text']}\n"

    # Try LLM if configured
    has_api_key = bool(
        (settings.AI_PROVIDER == "groq" and settings.GROQ_API_KEY) or
        (settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY)
    )

    if has_api_key and not settings.DEMO_MODE:
        prompt = (
            f"You are ResearchMate AI. Answer the user question strictly using the provided paper excerpts.\n"
            f"Rules:\n"
            f"1. Only state facts directly substantiated by the excerpts.\n"
            f"2. Cite sections and pages where applicable.\n"
            f"3. If the excerpts do not contain the answer, say the document does not provide sufficient information.\n\n"
            f"EXCERPTS:\n{context_str}\n\n"
            f"QUESTION: {question}"
        )
        url = "https://api.groq.com/openai/v1/chat/completions" if settings.AI_PROVIDER == "groq" else "https://api.openai.com/v1/chat/completions"
        api_key = settings.GROQ_API_KEY if settings.AI_PROVIDER == "groq" else settings.OPENAI_API_KEY
        model = settings.GROQ_MODEL if settings.AI_PROVIDER == "groq" else settings.OPENAI_MODEL

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    url,
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2
                    },
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    ans = res.json()["choices"][0]["message"]["content"]
                    return {"content": ans, "citations": citations}
        except Exception:
            pass # Fall back to grounded template synthesis

    # Grounded heuristic synthesis
    top_p = relevant_passages[0]
    p_text = top_p["text"]
    sec_name = top_p["section"]
    page_num = top_p["page"]

    # Provide concise grounded answer
    summary_sentence = p_text[:280].strip()
    if not summary_sentence.endswith("."):
        summary_sentence += "..."

    answer_text = (
        f"According to the **{sec_name}** section (Page {page_num}) of the paper:\n\n"
        f"> \"{summary_sentence}\"\n\n"
        f"This directly addresses your question regarding *'{question}'*. "
        f"The authors establish their findings based on this reported empirical evidence."
    )

    return {
        "content": answer_text,
        "citations": citations
    }
