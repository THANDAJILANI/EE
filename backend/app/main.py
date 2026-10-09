import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api import auth, papers, literature, comparisons, chat, notes, exports, settings as sys_settings
from app.core.security import hash_password
from app.models.user import User
from app.models.paper import ResearchPaper, PaperMetadata, PaperAnalysis
from app.services.demo_service import generate_demo_analysis

# Database initialization
Base.metadata.create_all(bind=engine)

def seed_demo_data():
    """Seeds a demo researcher account with sample analyzed research papers for immediate testing."""
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "demo@researchmate.ai").first()
        if not demo_user:
            demo_user = User(
                id="demo-user-uuid-101",
                email="demo@researchmate.ai",
                hashed_password=hash_password("DemoPassword123!"),
                full_name="Dr. Alex Rivera",
                institution="Stanford University",
                field_of_study="Computer Science & Artificial Intelligence",
                preferred_explanation_level="intermediate",
                citation_style="IEEE",
                default_summary_length="detailed",
                default_export_format="pdf"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Seed Paper 1: Attention Is All You Need
            p1_text = """
Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.

1 Introduction
Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures. Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states ht, as a function of the previous hidden state ht-1 and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

Methodology
The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. We evaluated on the WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs, and WMT 2014 English-French dataset with 36 million sentence pairs.

Results
On the WMT 2014 English-to-German translation task, the big transformer model achieves 28.4 BLEU score, outperforming previous models including ensembles. On English-to-French, it reaches 41.8 BLEU.

Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.
"""
            p1_sections = {
                "Abstract": {"title": "Abstract", "start_page": 1, "text": "We propose the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."},
                "Introduction": {"title": "Introduction", "start_page": 1, "text": "Recurrent models factor computation along symbol positions. This inherently sequential nature precludes parallelization."},
                "Methodology": {"title": "Methodology", "start_page": 2, "text": "The Transformer uses stacked self-attention and point-wise fully connected layers for encoder and decoder."},
                "Results": {"title": "Results", "start_page": 4, "text": "Achieves 28.4 BLEU on WMT 2014 English-German and 41.8 BLEU on WMT 2014 English-French."},
                "Conclusion": {"title": "Conclusion", "start_page": 6, "text": "The Transformer is the first sequence transduction model based entirely on attention."}
            }
            p1 = ResearchPaper(
                id="paper-seed-001",
                user_id=demo_user.id,
                title="Attention Is All You Need",
                filename="attention_is_all_you_need.pdf",
                file_path=os.path.join(settings.UPLOAD_DIR, "attention_is_all_you_need.pdf"),
                file_size=221580,
                page_count=15,
                is_scanned=False,
                extracted_text=p1_text,
                extracted_sections=p1_sections,
                processing_status="completed",
                is_favorite=True,
                personal_label="Foundational LLM Paper"
            )
            db.add(p1)

            p1_meta = PaperMetadata(
                paper_id=p1.id,
                authors=["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Aidan N. Gomez"],
                publication_year=2017,
                journal_or_conference="Advances in Neural Information Processing Systems (NeurIPS)",
                doi="10.48550/arXiv.1706.03762",
                research_domain="Natural Language Processing",
                keywords=["Transformer", "Self-Attention", "Sequence-to-Sequence", "Machine Translation"],
                abstract=p1_sections["Abstract"]["text"]
            )
            db.add(p1_meta)

            p1_analysis_data = generate_demo_analysis(
                paper_title=p1.title,
                extracted_text=p1_text,
                sections=p1_sections,
                page_count=15
            )
            # Custom tailored grounded details for seed
            p1_analysis_data["research_objectives"]["primary_objective"] = "To design a sequence transduction model relying entirely on self-attention mechanisms without recurrence or convolutions."
            p1_analysis_data["methodology"]["algorithms_models"] = ["Multi-Head Self-Attention", "Scaled Dot-Product Attention", "Positional Encoding"]
            p1_analysis_data["methodology"]["dataset"]["name"] = "WMT 2014 English-German & English-French"
            p1_analysis_data["methodology"]["dataset"]["size"] = "4.5M sentence pairs (En-De), 36M sentence pairs (En-Fr)"
            p1_analysis_data["methodology"]["evaluation_metrics"] = ["BLEU Score", "Training FLOPs / GPU Days"]

            p1_analysis = PaperAnalysis(
                paper_id=p1.id,
                concise_summary="[DEMO MODE ANALYSIS] The paper introduces the Transformer, an architecture replacing recurrent and convolutional neural networks with multi-headed self-attention mechanisms for sequence-to-sequence translation. It significantly accelerates parallel training while outperforming previous state-of-the-art baselines on WMT translation benchmarks.",
                detailed_summary="[DEMO MODE ANALYSIS] Vaswani et al. present the Transformer architecture to overcome the fundamental sequential computation bottleneck of Recurrent Neural Networks (RNNs and LSTMs). By eliminating recurrence and relying exclusively on stacked multi-head self-attention and feed-forward sub-layers, the model enables extensive parallelization during training.\n\nEvaluated on the WMT 2014 English-to-German and English-to-French translation benchmarks, the model established new state-of-the-art BLEU scores (28.4 and 41.8 BLEU respectively) while training in a fraction of the time required by existing architectures.",
                beginner_explanation="Before this paper, computers translated languages step-by-step like reading one word at a time, which was slow. The authors invented a way called 'Self-Attention' where the computer looks at all words simultaneously and learns how each word relates to every other word at once, making training much faster and translations far more accurate.",
                main_contribution="The Transformer architecture based entirely on self-attention mechanisms, eliminating recurrence and convolutions.",
                why_it_matters="Served as the foundational cornerstone for modern large language models including BERT, GPT, and modern generative AI systems.",
                research_objectives=p1_analysis_data["research_objectives"],
                methodology=p1_analysis_data["methodology"],
                results_findings=p1_analysis_data["results_findings"],
                limitations=p1_analysis_data["limitations"],
                future_scope=p1_analysis_data["future_scope"],
                critical_analysis=p1_analysis_data["critical_analysis"],
                is_demo_mode=True
            )
            db.add(p1_analysis)

            # Seed Paper 2: Deep Residual Learning for Image Recognition (ResNet)
            p2_text = """
Deep Residual Learning for Image Recognition
Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
Abstract
Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8× deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task.
"""
            p2_sections = {
                "Abstract": {"title": "Abstract", "start_page": 1, "text": "We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously."},
                "Introduction": {"title": "Introduction", "start_page": 1, "text": "When deeper networks start converging, a degradation problem has been exposed: with network depth increasing, accuracy gets saturated."},
                "Methodology": {"title": "Methodology", "start_page": 2, "text": "We formulate F(x) + x shortcut connections with identity mapping."},
                "Results": {"title": "Results", "start_page": 4, "text": "152-layer ResNet achieves 3.57% top-5 error on ImageNet test set, winning ILSVRC 2015."},
                "Conclusion": {"title": "Conclusion", "start_page": 8, "text": "Residual networks effectively solve the vanishing gradient and degradation problem in deep networks."}
            }
            p2 = ResearchPaper(
                id="paper-seed-002",
                user_id=demo_user.id,
                title="Deep Residual Learning for Image Recognition",
                filename="resnet_deep_residual_learning.pdf",
                file_path=os.path.join(settings.UPLOAD_DIR, "resnet_deep_residual_learning.pdf"),
                file_size=314000,
                page_count=12,
                is_scanned=False,
                extracted_text=p2_text,
                extracted_sections=p2_sections,
                processing_status="completed",
                is_favorite=True,
                personal_label="Seminal Computer Vision Paper"
            )
            db.add(p2)

            p2_meta = PaperMetadata(
                paper_id=p2.id,
                authors=["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
                publication_year=2016,
                journal_or_conference="IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
                doi="10.1109/CVPR.2016.90",
                research_domain="Computer Vision & Deep Learning",
                keywords=["Residual Learning", "ResNet", "Skip Connections", "ImageNet", "Deep Networks"],
                abstract=p2_sections["Abstract"]["text"]
            )
            db.add(p2_meta)

            p2_analysis_data = generate_demo_analysis(
                paper_title=p2.title,
                extracted_text=p2_text,
                sections=p2_sections,
                page_count=12
            )
            p2_analysis = PaperAnalysis(
                paper_id=p2.id,
                concise_summary="[DEMO MODE ANALYSIS] He et al. address the degradation problem in extremely deep neural networks by introducing identity skip connections that formulate layers as learning residual functions F(x) + x. This allowed training 152-layer networks with lower error rates than shallower counterparts.",
                detailed_summary="[DEMO MODE ANALYSIS] As neural networks grew deeper, researchers encountered a severe degradation problem where accuracy saturated and then rapidly degraded. He et al. resolved this by reformulating stacked layers to learn residual mappings relative to identity shortcut inputs rather than unreferenced functions.\n\nTested extensively on the ImageNet and COCO object detection benchmarks, ResNet-152 achieved a top-5 error rate of 3.57%, securing 1st place in ILSVRC 2015 while exhibiting superior optimization dynamics and computational efficiency.",
                beginner_explanation="When computer vision networks were made very deep (like 50+ layers), they got harder to train and made more mistakes. The authors added 'shortcut paths' that let information skip directly over layers, allowing networks to grow up to 152 layers deep without getting confused or losing information.",
                main_contribution="Residual learning framework using identity skip connections F(x) + x to train very deep neural networks.",
                why_it_matters="Solved the degradation obstacle in deep learning, becoming the default architectural backbone across computer vision and modern neural models.",
                research_objectives=p2_analysis_data["research_objectives"],
                methodology=p2_analysis_data["methodology"],
                results_findings=p2_analysis_data["results_findings"],
                limitations=p2_analysis_data["limitations"],
                future_scope=p2_analysis_data["future_scope"],
                critical_analysis=p2_analysis_data["critical_analysis"],
                is_demo_mode=True
            )
            db.add(p2_analysis)

            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

# Seed on startup
seed_demo_data()

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-stack AI-powered research paper summarization, extraction, comparison, and literature review assistant.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(literature.router, prefix="/api")
app.include_router(comparisons.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(sys_settings.router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "tagline": "Read Less. Understand More. Research Smarter.",
        "status": "operational",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs"
    }
