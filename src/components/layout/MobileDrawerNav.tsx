'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SidebarNav } from '@/src/components/layout/SidebarNav';

export function MobileDrawerNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sm:hidden sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            aria-label="메뉴 열기"
          >
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
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          <Link href={'/'} className="min-w-0">
            <div className="truncate text-sm font-bold text-zinc-900">
              MENTOFOLIO
            </div>
          </Link>

          <div className="w-10" />
        </div>
      </header>

      <div
        className={`sm:hidden fixed inset-0 z-50 ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />

        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-zinc-200 bg-zinc-800 transition-transform ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="모바일 메뉴"
        >
          <div className="px-6 py-6 flex items-start justify-between gap-4">
            <Link href={'/'} className="min-w-0">
              <div className="text-lg font-bold text-zinc-200 truncate">
                MENTOFOLIO
              </div>
              <div className="text-xs text-zinc-400 mt-1">voice studio</div>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              aria-label="메뉴 닫기"
            >
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
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
