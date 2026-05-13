import Sidebar from '../../components/Sidebar';
import NewAlbumWizard from '../../components/NewAlbumWizard';

export default function NewAlbumPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <NewAlbumWizard />
      </main>
    </div>
  );
}
