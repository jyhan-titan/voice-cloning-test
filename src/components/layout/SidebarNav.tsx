'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '홈' },
  { href: '/voices', label: '보이스 관리' },
  { href: '/contents', label: '콘텐츠 관리' },
  { href: '/audiobooks', label: '오디오북' },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="px-3 pb-6">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-900 bg-zinc-50'
                : 'block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-700'
            }
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
