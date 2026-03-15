"""
RAG Service — Legal RAG Pipeline thay thế OpenAI.

Import trực tiếp từ ChatBot/cross-encoder/generation/ pipeline:
  1. RetrievalReranker (retrieve + rerank top-K passages)
  2. GenerationPipeline (gating + LLM generation)

Singleton pattern: load models 1 lần, tái sử dụng cho mọi request.
"""

import sys
import time
from pathlib import Path
from typing import Optional
from loguru import logger

# ── Add ChatBot generation to sys.path ────────────────────────────────────────
# Cấu trúc: Folder cha / ChatBot / cross-encoder / generation /
#            Folder cha / AI-Powered-... / backend / app / rag_service.py (this file)

_THIS_DIR = Path(__file__).resolve().parent                          # app/
_BACKEND_DIR = _THIS_DIR.parent                                      # backend/
_PROJECT_DIR = _BACKEND_DIR.parent                                   # AI-Powered-.../
_FOLDER_CHA = _PROJECT_DIR.parent                                    # Folder cha/
_CHATBOT_ROOT = _FOLDER_CHA / "ChatBot"                              # ChatBot/
_CE_ROOT = _CHATBOT_ROOT / "cross-encoder"                           # cross-encoder/
_GEN_DIR = _CE_ROOT / "generation"                                   # generation/

# Add cross-encoder/ to path so `from generation.xxx import ...` works
if str(_CE_ROOT) not in sys.path:
    sys.path.insert(0, str(_CE_ROOT))

# ── Lazy imports (heavy deps: torch, transformers, faiss) ─────────────────────

_pipeline = None          # GenerationPipeline singleton
_reranker = None          # RetrievalReranker singleton
_initialized = False


def init_rag_pipeline(
    backend: str = "huggingface",
    model: str = "auto",
    api_key: str = "",
    max_tokens: int = 1024,
    temperature: float = 0.1,
) -> None:
    """
    Khởi tạo RAG pipeline (gọi 1 lần lúc startup).

    Load:
      - RetrievalReranker (bi-encoder + cross-encoder + FAISS)
      - GenerationPipeline (LLM client + gating + context builder)
    """
    global _pipeline, _reranker, _initialized

    if _initialized:
        logger.info("RAG pipeline already initialized, skipping")
        return

    logger.info("🔧 Initializing RAG pipeline...")
    t0 = time.time()

    # ── Import generation modules ──
    from generation.retrieval_rerank import RetrievalReranker
    from generation.run_generation import GenerationPipeline, LegalRetriever, PipelineLogger
    from generation.llm_client import (
        LLMClient, LLMConfig, LLMBackend, LLMMode, select_local_model_for_vram
    )
    from generation.run_generation import GEN_EVAL_DIR

    # ── 1. Build RetrievalReranker ──
    # Duy trì reranker trên CPU để tiết kiệm VRAM cho LLM (RTX 3050 Ti 4GB)
    logger.info("📦 Loading RetrievalReranker (bi-encoder + cross-encoder + FAISS) on CPU...")
    _reranker = RetrievalReranker(device="cpu")

    # ── 2. Build LLM Client ──
    backend_map = {
        "huggingface": LLMBackend.HUGGINGFACE,
        "qwen": LLMBackend.QWEN,
        "gemini": LLMBackend.GEMINI,
        "openai": LLMBackend.OPENAI,
        "openrouter": LLMBackend.OPENROUTER,
        "llama_cpp": LLMBackend.LLAMA_CPP,
        "placeholder": LLMBackend.PLACEHOLDER,
    }

    llm_backend = backend_map.get(backend, LLMBackend.HUGGINGFACE)

    # Auto-select model name
    model_name = model
    model_path = None

    if backend == "huggingface":
        if model_name == "auto" or not model_name:
            model_name = select_local_model_for_vram(reserved_vram_gb=1.0)
        model_path = model_name
    elif backend == "qwen":
        if not model_name or model_name == "auto":
            model_name = "qwen/qwen3-30b-a3b:free"
    elif backend == "gemini":
        if not model_name or model_name == "auto":
            model_name = "gemini-2.0-flash"
    elif backend == "openai":
        if not model_name or model_name == "auto":
            model_name = "gpt-4o-mini"

    # API key from env if not provided
    if not api_key:
        import os
        env_map = {
            "qwen": "OPENROUTER_API_KEY",
            "gemini": "GEMINI_API_KEY",
            "openai": "OPENAI_API_KEY",
            "openrouter": "OPENROUTER_API_KEY",
        }
        api_key = os.environ.get(env_map.get(backend, ""), "")

    llm_config = LLMConfig(
        backend=llm_backend,
        mode=LLMMode.DEV,
        model_name=model_name,
        model_path=model_path,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=0.9,
        context_length=4096,
        api_key=api_key or None,
    )

    client = LLMClient(llm_config)

    # ── 3. Build Pipeline ──
    GEN_EVAL_DIR.mkdir(parents=True, exist_ok=True)
    pipeline_logger = PipelineLogger(log_dir=str(GEN_EVAL_DIR / "logs"), append=True)

    # Retriever dùng LegalRetriever (đã load FAISS + metadata)
    retriever = LegalRetriever()

    _pipeline = GenerationPipeline(
        retriever=retriever,
        local_client=client,
        api_client=client,
        logger=pipeline_logger,
        mode=LLMMode.DEV,
        local_first=True,
    )

    _initialized = True
    elapsed = time.time() - t0
    logger.info(f"✅ RAG pipeline initialized in {elapsed:.1f}s")
    logger.info(f"   Backend: {backend} | Model: {model_name}")


def generate_response(user_message: str, conversation_history=None) -> str:
    """
    Xử lý câu hỏi qua RAG pipeline, trả về answer text.

    Luồng:
      1. RetrievalReranker.run(query) → top-5 passages
      2. Convert → ChunkInfo list
      3. GenerationPipeline.generate_from_reranked(query, chunks)
      4. Format answer + citations → return string

    Args:
        user_message: câu hỏi từ user
        conversation_history: (unused — RAG pipeline stateless per query)

    Returns:
        str: câu trả lời có kèm trích dẫn
    """
    global _pipeline, _reranker, _initialized

    if not _initialized or _pipeline is None or _reranker is None:
        raise RuntimeError("RAG pipeline chưa sẵn sàng. Vui lòng thử lại sau.")

    from generation.rag_contract import ChunkInfo

    t_start = time.time()

    # ── Step 1: Retrieval + Rerank ──
    logger.info(f"🔍 Retrieving for: {user_message[:80]}...")
    top_k = _reranker.run(
        user_message,
        top_n=100,   # FAISS candidates
        top_k=5,     # Final reranked results
    )

    # ── Step 2: Convert to ChunkInfo ──
    chunks = []
    for r in top_k:
        chunks.append(ChunkInfo(
            chunk_id=r.get("faiss_id", r.get("chunk_index", -1)),
            text=r["passage"],
            score_retrieval=0.0,
            score_rerank=float(r["ce_score"]),
            van_ban=r.get("van_ban", ""),
            chuong=r.get("chuong"),
            dieu=str(r["dieu"]) if r.get("dieu") else None,
            khoan=str(r["khoan"]) if r.get("khoan") else None,
            diem=str(r["diem"]) if r.get("diem") else None,
        ))

    # ── Step 3: Generation ──
    logger.info(f"🤖 Generating answer ({len(chunks)} chunks)...")
    
    # Log chunk details for debugging
    for i, chunk in enumerate(chunks):
        logger.debug(f"   [Chunk {i+1}] Score: {chunk.score_rerank:.4f} | Source: {chunk.van_ban} | Text: {chunk.text[:100]}...")
    output, metadata = _pipeline.generate_from_reranked(
        query=user_message,
        chunks=chunks,
        query_id="webapi",
        verbose=False,
    )

    elapsed_ms = (time.time() - t_start) * 1000

    # ── Step 4: Format response ──
    if output.abstain:
        answer_text = output.reason_detail or "Không đủ căn cứ pháp lý để trả lời câu hỏi này."
        if output.clarification_question:
            answer_text += f"\n\n❓ {output.clarification_question}"
    else:
        answer_text = output.answer or "Không có câu trả lời."

        # Append citations
        if output.citations:
            citations_lines = []
            for cit in output.citations:
                citations_lines.append(f"- {cit.to_str()}")
            answer_text += "\n\n📎 **Trích dẫn:**\n" + "\n".join(citations_lines)

    tier = metadata.get("tier", "?").upper()
    answer_text += f"\n\n_⏱ {elapsed_ms:.0f}ms | Tier: {tier}_"

    logger.info(f"✅ Response generated in {elapsed_ms:.0f}ms (Tier: {tier})")

    return answer_text
