import sys
from pathlib import Path
import json

# Setup paths
_THIS_DIR = Path.cwd()
_PROJECT_DIR = _THIS_DIR.parent
_FOLDER_CHA = _PROJECT_DIR.parent
_CHATBOT_ROOT = _FOLDER_CHA / "ChatBot"
_CE_ROOT = _CHATBOT_ROOT / "cross-encoder"

if str(_CE_ROOT) not in sys.path:
    sys.path.insert(0, str(_CE_ROOT))

from generation.run_generation import LegalRetriever
from generation.retrieval_rerank import RetrievalReranker

def test_retrieval():
    query = "Bộ Tư pháp là cơ quan của Chính phủ thực hiện chức năng quản lý nhà nước về những lĩnh vực nào?"
    
    print("--- LegalRetriever (Logic in GenerationPipeline) ---")
    ret_legal = LegalRetriever(device="cpu")
    chunks_legal = ret_legal.retrieve_and_rerank(query, top_k_rerank=3)
    for i, c in enumerate(chunks_legal):
        print(f"[Legal {i+1}] Score: {c.score_rerank:.4f} | Source: {c.van_ban}")
    
    print("\n--- RetrievalReranker (Active in rag_service.py) ---")
    ret_rr = RetrievalReranker(device="cpu")
    chunks_rr = ret_rr.run(query, top_k=3)
    for i, c in enumerate(chunks_rr):
        print(f"[RR {i+1}] Score: {c['ce_score']:.4f} | Source: {c['van_ban']}")

if __name__ == "__main__":
    test_retrieval()
