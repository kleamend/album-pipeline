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
    <aside className="flex flex-col items-center border-r border-surface-border py-6 transition-all duration-300 w-14">
      <div className="mb-8">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-orange to-accent-pink" />
      </div>
      <nav className="flex flex-col gap-5 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 text-sm ${
              pathname === item.href
                ? 'bg-accent-orange/10 border border-accent-orange/20 text-accent-orange'
                : 'bg-transparent text-muted-dim hover:bg-white/5 hover:text-muted'
            }`}
            title={item.tooltip}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="w-5 h-5 rounded bg-surface-border" />
    </aside>
  );
}
