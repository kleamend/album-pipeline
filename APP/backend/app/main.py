from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.connection import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Album Pipeline API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes will be added in later tasks
# app.include_router(albums.router, prefix="/api")
# app.include_router(providers.router, prefix="/api")
# app.include_router(workflow.router, prefix="/api")
