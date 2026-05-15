'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/src/stores/appStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const AlbumsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);

const ProjectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const BASE_ITEMS = [
  { href: '/', icon: <HomeIcon />, label: '主页' },
  { href: '/albums', icon: <AlbumsIcon />, label: '过往专辑' },
  { href: '/settings', icon: <SettingsIcon />, label: '设置' },
];

export default function Sidebar() {
  const currentAlbumId = useAppStore((s) => s.currentAlbumId);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = useMemo(() => {
    if (!currentAlbumId) return BASE_ITEMS;
    const items = [...BASE_ITEMS];
    items.splice(2, 0, { href: `/albums/${currentAlbumId}`, icon: <ProjectIcon />, label: '当前专辑' });
    return items;
  }, [currentAlbumId]);

  return (
    <aside
      className={`flex flex-col border-r border-white/[0.05] bg-surface-darker/50 transition-all duration-300 ${collapsed ? 'w-14' : 'w-52'}`}
    >
      {/* Toggle + Logo */}
      <div className="flex items-center gap-2 px-3 py-5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors text-muted-dim hover:text-muted shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        {!collapsed && (
          <span className="font-display text-sm font-bold text-white whitespace-nowrap">Pipeline</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-accent-orange/10 text-accent-orange'
                  : 'text-muted-dim hover:bg-white/[0.04] hover:text-muted'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Provider Status (compact) */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-[10px] text-muted-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> MiniMax Ready
          </div>
        </div>
      )}
    </aside>
  );
}
