import Sidebar from '../../components/Sidebar';
import AlbumDashboard from '../../components/AlbumDashboard';

export default function AlbumPage({ params }: { params: { albumId: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <AlbumDashboard albumId={params.albumId} />
      </main>
    </div>
  );
}
