from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.endpoints import router
from app.core.config import settings
from app.core.database import init_db

app = FastAPI(title=settings.PROJECT_NAME)

# Initialize Database
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "NG12 Cancer Risk Assessor API is running"}
