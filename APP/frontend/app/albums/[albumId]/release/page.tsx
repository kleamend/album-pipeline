import Sidebar from '@/app/components/Sidebar';
import ReleasePanel from '@/app/components/ReleasePanel';

export default function ReleasePage({ params }: { params: { albumId: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ReleasePanel albumId={params.albumId} />
      </main>
    </div>
  );
}
