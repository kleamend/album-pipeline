import Sidebar from '../../../components/Sidebar';
import ConceptReview from '../../../components/ConceptReview';

export default function ConceptPage({ params }: { params: { albumId: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <ConceptReview albumId={params.albumId} />
      </main>
    </div>
  );
}
