import re
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, Track
from ..schemas import NewAlbumInput, AlbumResponse
from ..config import WORKSPACE_ROOT

router = APIRouter(tags=["albums"])


def _slugify(text: str) -> str:
    slug = re.sub(r"[^\w\-]", "-", text.lower(), flags=re.ASCII)[:40].strip("-")
    return slug or "new-album"


@router.get("/albums", response_model=list[AlbumResponse])
def list_albums(db: Session = Depends(get_db)):
    return db.query(AlbumProject).order_by(AlbumProject.updated_at.desc()).all()


@router.get("/albums/{album_id}", response_model=AlbumResponse)
def get_album(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    return album


@router.post("/albums", response_model=AlbumResponse, status_code=201)
def create_album(input: NewAlbumInput, db: Session = Depends(get_db)):
    slug = f"album-{_slugify(input.theme)}"
    workspace = WORKSPACE_ROOT / "projects" / slug

    # Create workspace directories
    dirs = [
        workspace / "docs",
        workspace / "songs",
        workspace / "generate" / "lyrics" / "cn",
        workspace / "generate" / "lyrics" / "en",
        workspace / "generate" / "cn",
        workspace / "generate" / "en",
        workspace / "generate" / "cn_320k",
        workspace / "generate" / "en_320k",
        workspace / "generate" / "prompts",
        workspace / "generate" / "covers" / "prompts",
        workspace / "generate" / "covers" / "tracks",
        workspace / "assets",
        workspace / "logs",
        workspace / "packages",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)

    album = AlbumProject(
        slug=slug,
        workspace_path=str(workspace),
        language_mode=input.language,
        track_count=input.track_count,
        theme=input.theme,
        notes=input.notes,
        reference_style=input.reference_style,
        target_audience=input.target_audience,
        publish_target=input.publish_target,
        status="draft",
    )
    db.add(album)
    db.flush()  # ensure album.id is generated before creating tracks

    for i in range(1, input.track_count + 1):
        db.add(Track(album_id=album.id, index=i, title=f"T{i}", language=input.language))

    db.commit()
    db.refresh(album)
    return album


@router.delete("/albums/{album_id}", status_code=204)
def delete_album(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    ws = Path(album.workspace_path)
    if ws.exists():
        shutil.rmtree(ws)
    db.delete(album)
    db.commit()
