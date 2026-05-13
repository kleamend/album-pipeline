import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .connection import Base

def _uid(): return str(uuid.uuid4())
def _now(): return datetime.now(timezone.utc)

class AlbumProject(Base):
    __tablename__ = "album_projects"

    id = Column(String, primary_key=True, default=_uid)
    title = Column(String, nullable=True)
    title_en = Column(String, nullable=True)
    slug = Column(String, nullable=False, unique=True)
    status = Column(String, nullable=False, default="draft")
    language_mode = Column(String, nullable=False, default="chinese")
    track_count = Column(Integer, nullable=False, default=3)
    current_phase = Column(String, nullable=True)
    workspace_path = Column(String, nullable=False)
    theme = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    reference_style = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    publish_target = Column(String, nullable=True, default="none")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    tracks = relationship("Track", back_populates="album", cascade="all, delete-orphan")
    phase_runs = relationship("PhaseRun", back_populates="album", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="album", cascade="all, delete-orphan")


class Track(Base):
    __tablename__ = "tracks"

    id = Column(String, primary_key=True, default=_uid)
    album_id = Column(String, ForeignKey("album_projects.id"), nullable=False)
    index = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    title_en = Column(String, nullable=True)
    language = Column(String, nullable=False, default="chinese")
    narrative_axis = Column(String, nullable=True)
    core_hook = Column(String, nullable=True)
    emotional_arc = Column(String, nullable=True)
    arrangement_style = Column(String, nullable=True)
    score = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default="planned")

    album = relationship("AlbumProject", back_populates="tracks")


class PhaseRun(Base):
    __tablename__ = "phase_runs"

    id = Column(String, primary_key=True, default=_uid)
    album_id = Column(String, ForeignKey("album_projects.id"), nullable=False)
    phase = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    album = relationship("AlbumProject", back_populates="phase_runs")
    expert_runs = relationship("ExpertRun", back_populates="phase_run", cascade="all, delete-orphan")


class ExpertRun(Base):
    __tablename__ = "expert_runs"

    id = Column(String, primary_key=True, default=_uid)
    phase_run_id = Column(String, ForeignKey("phase_runs.id"), nullable=False)
    album_id = Column(String, ForeignKey("album_projects.id"), nullable=False)
    track_id = Column(String, ForeignKey("tracks.id"), nullable=True)
    agent_key = Column(String, nullable=False)
    round = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default="pending")
    input_json = Column(Text, nullable=True)
    output_json = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    phase_run = relationship("PhaseRun", back_populates="expert_runs")


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String, primary_key=True, default=_uid)
    album_id = Column(String, ForeignKey("album_projects.id"), nullable=False)
    track_id = Column(String, ForeignKey("tracks.id"), nullable=True)
    phase = Column(String, nullable=False)
    kind = Column(String, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    path = Column(String, nullable=False)
    title = Column(String, nullable=False)
    mime_type = Column(String, nullable=True, default="text/markdown")
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now)

    album = relationship("AlbumProject", back_populates="artifacts")
