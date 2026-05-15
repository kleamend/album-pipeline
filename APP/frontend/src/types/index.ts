export type ProviderStatus = 'not_configured' | 'api_key_missing' | 'cli_missing' | 'ready' | 'error';

export type PipelinePhase = 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'phase6';

export type PhaseStatus = 'pending' | 'running' | 'waiting_user' | 'failed' | 'completed' | 'skipped';

export type TrackStatus = 'planned' | 'round_running' | 'needs_revision' | 'finalized' | 'needs_review' | 'take_selected' | 'transcoded';

export type LanguageMode = 'chinese' | 'english' | 'bilingual' | 'instrumental';

export interface AlbumProject {
  id: string;
  title: string | null;
  titleEn: string | null;
  slug: string;
  status: ProjectStatus;
  languageMode: LanguageMode;
  trackCount: number;
  currentPhase: PipelinePhase | null;
  workspacePath: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'draft'
  | 'concept_running'
  | 'concept_review'
  | 'songwriting_running'
  | 'lyrics_ready'
  | 'music_generating'
  | 'listening_review'
  | 'transcoding'
  | 'packaging'
  | 'completed'
  | 'failed'
  | 'archived';

export interface PhaseRun {
  id: string;
  albumId: string;
  phase: PipelinePhase;
  status: PhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface Track {
  id: string;
  albumId: string;
  index: number;
  title: string;
  titleEn: string | null;
  language: 'chinese' | 'english' | 'bilingual' | 'instrumental';
  narrativeAxis: string;
  coreHook: string;
  emotionalArc: string;
  arrangementStyle: string;
  score: number | null;
  status: TrackStatus;
}

export interface Artifact {
  id: string;
  albumId: string;
  trackId: string | null;
  phase: PipelinePhase;
  kind: string;
  version: number;
  path: string;
  title: string;
  createdAt: string;
}

export interface NewAlbumInput {
  theme: string;
  notes?: string;
  trackCount: number;
  language: LanguageMode;
  hasInstrumental: boolean;
  referenceStyle?: string;
  targetAudience?: string;
  publishTarget: 'netease' | 'qq' | 'none';
  generateCover: boolean;
  generateVideo: boolean;
  generateCopy: boolean;
}
