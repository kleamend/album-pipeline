from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.connection import engine, Base

# Import models so they register with Base.metadata before create_all
from .db import models  # noqa: F401

app = FastAPI(title="Album Pipeline API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api import albums, providers, workflow, workflow_phase2, workflow_phase3, workflow_phase4, workflow_phase5, workflow_phase6

# Create all tables after models are imported
Base.metadata.create_all(bind=engine)

app.include_router(albums.router, prefix="/api")
app.include_router(providers.router, prefix="/api")
app.include_router(workflow.router, prefix="/api")
app.include_router(workflow_phase2.router, prefix="/api")
app.include_router(workflow_phase3.router, prefix="/api")
app.include_router(workflow_phase4.router, prefix="/api")
app.include_router(workflow_phase5.router, prefix="/api")
app.include_router(workflow_phase6.router, prefix="/api")
