import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ProviderStatus from './components/ProviderStatus';
import RecentProjects from './components/RecentProjects';

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto py-8 px-10">
        {/* Vinyl accent decorative element behind hero */}
        <div className="relative">
          <div className="vinyl-accent">
            <div className="absolute -top-20 -right-10 w-[400px] h-[400px] rounded-full pointer-events-none select-none -z-10 opacity-[0.03]"
              style={{
                background: 'radial-gradient(circle, rgba(251,146,60,0.5) 0%, rgba(244,114,182,0.2) 30%, transparent 60%)',
              }}
            />
            <Hero />
          </div>
        </div>
        <ProviderStatus />
        <div className="divider my-6" />
        <RecentProjects />
      </main>
    </div>
  );
}
