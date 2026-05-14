import Sidebar from '@/app/components/Sidebar';
import TakePlayer from '@/app/components/TakePlayer';

export default function ListenPage({ params }: { params: { albumId: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TakePlayer albumId={params.albumId} />
      </main>
    </div>
  );
}
