from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid

from app.services.decision_support import decision_support_agent
from app.services.rag_engine import rag_engine
from langchain_google_vertexai import VertexAI
from langchain.prompts import PromptTemplate
from app.core.config import settings

from app.core.database import add_message, get_chat_history, clear_chat_history, get_all_sessions

router = APIRouter()

# --- Assessment ---

class AssessmentRequest(BaseModel):
    patient_id: str

@router.post("/assess")
async def assess_patient(request: AssessmentRequest):
    result = decision_support_agent.assess_patient(request.patient_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# --- Chat ---

class ChatRequest(BaseModel):
    session_id: str
    message: str
    top_k: Optional[int] = 5

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    citations: List[Dict]

llm = VertexAI(model_name="gemini-2.0-flash-001", temperature=0.2, project=settings.GOOGLE_PROJECT_ID)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Retrieve Full History from DB
    full_history = get_chat_history(request.session_id)
    
    # 1. Contextualize Query (Query Expansion)
    # If there is history, ask LLM to rewrite the query to be standalone
    if full_history:
        # Keep last 5 turns for context window
        history_context = "\n".join(full_history[-5:])
        
        contextualize_prompt = PromptTemplate.from_template(
            """
            Given a chat history and the latest user question which might reference context in the chat history, 
            formulate a standalone question which can be understood without the chat history. 
            Do NOT answer the question, just reformulate it if needed and otherwise return it as is.
            
            Chat History:
            {history}
            
            Latest Question: {question}
            
            Standalone Question:
            """
        )
        contextualized_query_llm_response = llm.invoke(contextualize_prompt.format(history=history_context, question=request.message))
        # Handle potential string/object return types from invoke
        search_query = str(contextualized_query_llm_response).strip()
        print(f"DEBUG: Contextualized Query: {search_query}")
    else:
        history_context = ""
        search_query = request.message
        print(f"DEBUG: Query: {search_query}")

    # 2. Retrieve Context using the refined query
    # Increase top_k to ensure we capture relevant but lower-ranked guidelines
    retrieved_docs = rag_engine.retrieve(search_query, top_k=10)
    context = "\n\n".join([f"[Source: {doc['metadata'].get('source', 'NG12')} Page {doc['metadata'].get('page', '?')}]\n{doc['content']}" for doc in retrieved_docs])
    
    # 3. Construct Prompt (same as before)
    prompt_template = PromptTemplate.from_template(
        """
        You are a helpful assistant knowledgeable about the NICE NG12 guidelines for suspected cancer.
        
        Instructions:
        1. **Strictly Grounded**: Answer the user's question using ONLY the provided context from the guidelines. If the context does not contain the answer, state: "I couldn't find support in the NG12 text for that."
        2. **No Hallucination**: Do NOT invent thresholds, criteria, or guidelines not supported by the retrieved chunks. If the retrieved chunks are irrelevant, say so.
        3. **Refusals**: If the user asks for medical advice outside the scope of the provided guidelines, or if the retrieval returns insufficient evidence, refuse to answer or qualify your answer heavily.
        4. **Context Handling**: Use the Chat History to understand context for follow-up questions (e.g., "What about if under 40?").
        5. **Negative Criteria**: If a guideline specifies a criteria (e.g. "aged 40 and over"), and the user asks about patients OUTSIDE that criteria (e.g. "under 40"), explain that the urgent pathway is explicitly for the specified group, implying the patient does not meet the *urgent* criteria based on this guideline alone.
        6. **Citations**: Always include citations (e.g. [1.1.2]) when making clinical pathway statements.
        
        Chat History:
        {history}
        
        Context (Retrieved Guidelines):
        {context}
        
        User Query: {query}
        
        Answer:
        """
    )
    
    prompt = prompt_template.format(history=history_context, context=context, query=request.message)
    
    # 4. Generate Answer
    answer = llm.invoke(prompt)
    answer_text = str(answer) # Ensure string
    
    # 5. Save Interaction to DB
    add_message(request.session_id, "user", request.message)
    add_message(request.session_id, "agent", answer_text)
    
    # 6. Format Output
    citations = []
    for i, doc in enumerate(retrieved_docs):
        # Generate a stable-ish chunk ID if not present
        page = doc['metadata'].get('page', '0')
        source = doc['metadata'].get('source', 'NG12 PDF').split('/')[-1] # Filename only
        chunk_id = doc['metadata'].get('chunk_id', f"ng12_{page}_{i}")
        
        citations.append({
            "source": source,
            "page": page,
            "chunk_id": chunk_id,
            "excerpt": doc['content'][:200].replace("\n", " ") + "..." # Clean up snippet
        })

    return ChatResponse(
        session_id=request.session_id,
        answer=answer_text,
        citations=citations
    )

@router.get("/chat/{session_id}/history")
async def get_history(session_id: str):
    history = get_chat_history(session_id)
    return {"history": history}

@router.delete("/chat/{session_id}")
async def clear_history(session_id: str):
    clear_chat_history(session_id)
    return {"status": "cleared"}

@router.get("/sessions")
async def list_sessions():
    return {"sessions": get_all_sessions()}
