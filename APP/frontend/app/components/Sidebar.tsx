'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/src/stores/appStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE_ITEMS = [
  { href: '/', label: '🏠', tooltip: '主页' },
  { href: '/albums', label: '📁', tooltip: '过往专辑' },
  { href: '/settings', label: '⚙️', tooltip: '设置' },
];

export default function Sidebar() {
  const currentAlbumId = useAppStore((s) => s.currentAlbumId);
  const pathname = usePathname();

  const navItems = useMemo(() => {
    if (!currentAlbumId) return BASE_ITEMS;
    const items = [...BASE_ITEMS];
    items.splice(2, 0, { href: `/albums/${currentAlbumId}`, label: '📦', tooltip: '当前专辑' });
    return items;
  }, [currentAlbumId]);

  return (
    <aside
      className="flex flex-col items-center py-8 transition-all duration-300 w-16 relative"
      style={{
        borderRight: '1px solid',
        borderImage: 'linear-gradient(to bottom, transparent, rgba(251,146,60,0.08), rgba(244,114,182,0.06), transparent) 1',
      }}
    >
      {/* Logo — vinyl-inspired circle */}
      <div className="mb-2 flex flex-col items-center gap-2">
        <div className="relative w-9 h-9">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-orange via-accent-warm to-accent-pink shadow-glow-sm" />
          {/* Inner grooves */}
          <div className="absolute inset-[3px] rounded-full bg-surface-darker" />
          <div className="absolute inset-[5px] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[7px] rounded-full border border-white/[0.04]" />
          {/* Center hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-orange/40" />
        </div>
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-dark whitespace-nowrap leading-none">
          ALBUM PIPELINE
        </span>
      </div>

      <nav className="flex flex-col gap-4 flex-1 mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 text-sm group ${
                isActive
                  ? 'bg-accent-orange/10 text-accent-orange shadow-glow-sm'
                  : 'bg-transparent text-muted-dim hover:bg-white/[0.04] hover:text-muted-light'
              }`}
              title={item.tooltip}
            >
              {/* Active glow indicator ring */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl ring-1 ring-accent-orange/20" />
              )}
              <span className="relative z-10">{item.label}</span>
              {/* Elegant hover tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-white/[0.06] text-xs text-muted-light whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-elevated z-50">
                {item.tooltip}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom decorative element */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-orange/5 to-accent-pink/5 border border-white/[0.04]" />
    </aside>
  );
}
