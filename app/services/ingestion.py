import os
import shutil
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_chroma import Chroma

from app.core.config import settings

def ingest_pdf():
    """
    Ingests the NG12 PDF, chunks it, creates embeddings, and stores them in ChromaDB.
    """
    print(f"Loading PDF from {settings.PDF_PATH}...")
    loader = PyPDFLoader(settings.PDF_PATH)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages.")

    print("Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    print("Initializing Vertex AI Embeddings...")
    # Ensure authentication is set up via GOOGLE_APPLICATION_CREDENTIALS
    embeddings = VertexAIEmbeddings(model_name="text-embedding-004", project=settings.GOOGLE_PROJECT_ID)

    print(f"Creating/Updating Vector Store at {settings.VECTOR_STORE_DIR}...")
    if os.path.exists(settings.VECTOR_STORE_DIR):
        # Optional: Clear existing for a fresh start, or just update. 
        # For this take-home, fresh start is safer to avoid duplicates on re-runs.
        shutil.rmtree(settings.VECTOR_STORE_DIR)
    
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=settings.VECTOR_STORE_DIR
    )
    print("Vector store created successfully.")

if __name__ == "__main__":
    ingest_pdf()
