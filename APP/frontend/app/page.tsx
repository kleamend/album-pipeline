import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ProviderStatus from './components/ProviderStatus';
import RecentProjects from './components/RecentProjects';

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Hero />
        <ProviderStatus />
        <RecentProjects />
      </main>
    </div>
  );
}
