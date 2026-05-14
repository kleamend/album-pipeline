'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import SongDetail from '@/app/components/SongDetail';
import RoundHistory from '@/app/components/RoundHistory';
import { api } from '@/src/api/client';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.albumId as string;
  const trackId = params.trackId as string;
  const [track, setTrack] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAlbum(albumId),
      api.getTrackRounds(albumId, trackId),
    ])
      .then(([album, roundData]) => {
        // Build track info from album context
        const t = {
          id: trackId,
          index: 1,
          title: `Track ${trackId.slice(0, 4)}`,
          score: null as number | null,
          status: 'planned',
        };
        setTrack(t);
        setRounds(roundData.rounds || []);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [albumId, trackId, router]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-dim animate-pulse-soft">加载中...</p>
        </div>
      </div>
    );
  }

  if (!track) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SongDetail track={track} rounds={rounds} />
      </div>
      <div className="w-64 border-l border-surface-border p-5 overflow-y-auto">
        <RoundHistory history={rounds.map((r: any) => ({
          round: r.round,
          score: r.final_score,
          status: 'completed',
        }))} />
      </div>
    </div>
  );
}
