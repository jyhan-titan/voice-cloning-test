import Link from 'next/link';

import type { Audiobook } from '@/src/api/audiobook';

type Props = {
  item: Audiobook;
};

export function AudiobookListItem({ item }: Props) {
  return (
    <Link
      href={`/audiobooks/${encodeURIComponent(item.id)}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-bold text-zinc-900 truncate">
            {item.title}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            content: {item.contentId} ·{' '}
            {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="shrink-0 text-xs font-semibold text-zinc-600">열기</div>
      </div>
    </Link>
  );
}
