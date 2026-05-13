from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

LanguageMode = Literal["chinese", "english", "bilingual", "instrumental"]
PublishTarget = Literal["netease", "qq", "none"]

class NewAlbumInput(BaseModel):
    theme: str = Field(..., min_length=1, max_length=2000)
    notes: Optional[str] = None
    track_count: int = Field(default=3, ge=1, le=20)
    language: LanguageMode = "chinese"
    has_instrumental: bool = False
    reference_style: Optional[str] = None
    target_audience: Optional[str] = None
    publish_target: PublishTarget = "none"
    generate_cover: bool = True
    generate_video: bool = False
    generate_copy: bool = True

class AlbumResponse(BaseModel):
    id: str
    title: Optional[str]
    title_en: Optional[str]
    slug: str
    status: str
    language_mode: str
    track_count: int
    current_phase: Optional[str]
    workspace_path: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class PhaseRunResponse(BaseModel):
    id: str
    album_id: str
    phase: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]

    model_config = {"from_attributes": True}

class ConceptConfirmInput(BaseModel):
    approved: bool

class ProviderStatusResponse(BaseModel):
    minimax: str
    netease: str
