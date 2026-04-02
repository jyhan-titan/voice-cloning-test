'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SidebarNav } from '@/src/components/layout/SidebarNav';

export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === '1';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <aside
      className={`hidden lg:flex shrink-0 border-r border-zinc-200 bg-zinc-800 flex-col transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div
        className={`px-4 py-5 ${collapsed ? 'flex flex-col items-center gap-3' : 'flex flex-row items-center justify-between gap-3'}`}
      >
        {!collapsed && (
          <Link href={'/'} className={collapsed ? 'w-10 h-10' : 'block mt-2'}>
            <div>
              <div className="text-lg font-bold text-zinc-200">MENTOFOLIO</div>
              <div className="text-xs text-zinc-400 mt-1">voice studio</div>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          className={`h-10 w-10 inline-flex items-center justify-center rounded-xl border ${
            collapsed ? 'border-zinc-700' : 'border-zinc-700'
          } bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {!collapsed && <SidebarNav />}
    </aside>
  );
}
