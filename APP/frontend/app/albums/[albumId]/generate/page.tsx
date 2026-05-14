import Sidebar from '@/app/components/Sidebar';
import MusicGenPanel from '@/app/components/MusicGenPanel';

export default function GeneratePage({ params }: { params: { albumId: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <MusicGenPanel albumId={params.albumId} />
      </main>
    </div>
  );
}
