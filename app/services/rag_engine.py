from typing import List, Dict
from langchain_chroma import Chroma
from langchain_google_vertexai import VertexAIEmbeddings
from app.core.config import settings

class RAGEngine:
    def __init__(self):
        self.vector_store_dir = settings.VECTOR_STORE_DIR
        self.embeddings = VertexAIEmbeddings(model_name="text-embedding-004", project=settings.GOOGLE_PROJECT_ID)
        self.vector_store = Chroma(
            persist_directory=self.vector_store_dir,
            embedding_function=self.embeddings
        )

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Retrieve relevant documents from the vector store.
        """
        results = self.vector_store.similarity_search_with_score(query, k=top_k)
        
        retrieved_docs = []
        for doc, score in results:
            retrieved_docs.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            })
        
        return retrieved_docs

rag_engine = RAGEngine()
