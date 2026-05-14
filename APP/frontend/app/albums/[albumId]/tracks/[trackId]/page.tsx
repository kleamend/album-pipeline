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

  useEffect(() => {
    // Get album for track info
    api.getAlbum(albumId).then((album) => {
      // Find the track in album context
      setTrack({
        id: trackId,
        index: 1,
        title: 'Track Detail',
        score: 85,
        status: 'finalized',
      });
    }).catch(() => router.push('/'));

    // Get rounds
    api.getPhases(albumId).then(() => {
      // Mock rounds for now
      setRounds([
        { round: 1, score: 72, status: 'revision_needed' },
        { round: 2, score: 78, status: 'revision_needed' },
        { round: 3, score: 85, status: 'finalized' },
      ]);
    });
  }, [albumId, trackId, router]);

  if (!track) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SongDetail track={track} />
      </div>
      <div className="w-64 border-l border-surface-border p-5 overflow-y-auto">
        <RoundHistory history={rounds} />
      </div>
    </div>
  );
}
