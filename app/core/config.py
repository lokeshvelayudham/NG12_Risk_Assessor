import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NG12 Cancer Risk Assessor"
    API_V1_STR: str = "/api/v1"
    
    # Google Vertex AI
    GOOGLE_PROJECT_ID: str = os.getenv("GOOGLE_PROJECT_ID", "your-project-id")
    GOOGLE_LOCATION: str = os.getenv("GOOGLE_LOCATION", "us-central1")
    
    # Vector Store
    VECTOR_STORE_DIR: str = os.path.join(os.path.dirname(__file__), "../../data/vector_store")
    PDF_PATH: str = os.path.join(os.path.dirname(__file__), "../../data/NG12.pdf")
    PATIENTS_DATA_PATH: str = os.path.join(os.path.dirname(__file__), "../../data/patients.json")
    
    class Config:
        env_file = ".env"

settings = Settings()
