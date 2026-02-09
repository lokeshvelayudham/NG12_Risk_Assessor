# NG12 Cancer Risk Assessor

An AI-powered clinical decision support tool based on the **NICE NG12 Guidelines** for suspected cancer referral.

## Architecture

*   **Backend**: FastAPI (Python)
    *   **RAG Engine**: Vertex AI Embeddings + ChromaDB (Vector Search)
    *   **LLM**: Google Gemini 2.0 Flash (Vertex AI)
    *   **Database**: SQLite (`chat_history.db`) for persistent chat history.
*   **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn UI.

## Features

1.  **Risk Assessment**: Enter Patient ID (dummy data) to get a risk analysis based on simulated EHR data.
2.  **Chat Assistant**:
    *   Ask questions about NG12 guidelines (e.g., "Symptoms of lung cancer?").
    *   **Context Aware**: Handles follow-up questions ("What if they are under 40?").
    *   **Grounded**: Citations provided for every claim (e.g., `[NG12.pdf p.8]`).
    *   **Multi-Session**: Create multiple chat sessions; history is saved automatically.

## Prerequisites

*   Python 3.9+
*   Node.js 18+
*   Google Cloud Project with Vertex AI API enabled.
*   `.env` file with `GOOGLE_PROJECT_ID` and `GOOGLE_LOCATION`.

## Setup & Running

### 1. Backend

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload
```
*Backend runs on `http://127.0.0.1:8000`*

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 3. Docker (Recommended for Deployment)

Build and run the entire stack with a single command:

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d
```

*   **Frontend**: `http://localhost:3000`
*   **Backend**: `http://localhost:8000`
*   **Database**: Persisted in local volume.

## Usage

1.  Open `http://localhost:3000`.
2.  **Chat**: Click "New Chat" in the sidebar. Ask questions like:
    *   "What are the referral criteria for laryngeal cancer?"
    *   "Does weight loss matter for lung cancer?"
3.  **Assessment**: Go to "New Assessment", enter a Patient ID (e.g., `P001`, `P002`), and see the AI analysis.

## Troubleshooting

*   **500 Internal Server Error**: Check backend logs. Ensure `GOOGLE_PROJECT_ID` is set correctly.
*   **Chat History not loading**: Ensure `chat_history.db` exists (created automatically on startup).
