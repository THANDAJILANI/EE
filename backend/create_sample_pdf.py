import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

os.makedirs("sample_papers", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

def create_sample_paper(filename, title, authors, abstract, intro, method, results, conclusion):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"<b>{title}</b>", styles["Title"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<i>{authors}</i>", styles["Normal"]))
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Abstract</b>", styles["Heading2"]))
    story.append(Paragraph(abstract, styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>1. Introduction</b>", styles["Heading2"]))
    story.append(Paragraph(intro, styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>2. Methodology</b>", styles["Heading2"]))
    story.append(Paragraph(method, styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>3. Results and Evaluation</b>", styles["Heading2"]))
    story.append(Paragraph(results, styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>4. Conclusion and Future Scope</b>", styles["Heading2"]))
    story.append(Paragraph(conclusion, styles["Normal"]))

    doc.build(story)
    print(f"Created: {filename}")

if __name__ == "__main__":
    create_sample_paper(
        "sample_papers/sample_transformer_study.pdf",
        "Empirical Scaling of Transformer Architectures for Low-Resource Languages",
        "Elena Rostova, David K. Miller, Marcus Vance",
        "Recent progress in generative large language models has accelerated translation accuracy, but low-resource languages face data scarcity. This paper investigates parameter-efficient adaptation of transformer models across 12 low-resource language pairs.",
        "Natural language processing models have demonstrated exceptional capabilities across high-resource languages. However, language disparities persist due to limited parallel corpus availability. We address this bottleneck through sparse cross-attention adaptation.",
        "We employ a 12-layer transformer encoder-decoder with low-rank adaptation (LoRA) modules. Our evaluation dataset consists of the FLORES-200 benchmark with 10,000 sentence pairs per target language. We measure BLEU and chrF++ scores.",
        "The proposed sparse adapter framework achieves 31.4 BLEU, outperforming full fine-tuning baselines by 3.2 BLEU while reducing trainable parameters by 88%. Evaluation shows consistent improvements across all target dialects.",
        "We demonstrate that modular parameter adaptation bridges low-resource language translation gaps. Future work includes expanding to zero-shot speech-to-text translation and addressing compute limits."
    )
