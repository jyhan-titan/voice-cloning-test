'use client';

import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-zinc-500">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={`${it.label}-${idx}`} className="flex items-center gap-2">
              {idx > 0 && <span className="text-zinc-300">/</span>}
              {it.href && !isLast ? (
                <Link href={it.href} className="hover:underline">
                  {it.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-zinc-900 font-semibold' : ''}>
                  {it.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
