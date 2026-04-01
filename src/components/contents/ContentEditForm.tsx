'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { patchContentById, type ContentItem } from '@/src/api/content';

type Props = {
  initialItem: ContentItem;
};

export function ContentEditForm({ initialItem }: Props) {
  const router = useRouter();

  const initialNodesJson = useMemo(
    () => JSON.stringify(initialItem.nodes, null, 2),
    [initialItem.nodes],
  );

  const [phase, setPhase] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState(initialItem.title);
  const [nodesJson, setNodesJson] = useState(initialNodesJson);

  const save = async () => {
    try {
      setPhase('saving');
      setErrorMessage(null);

      const parsed = JSON.parse(nodesJson);
      if (!Array.isArray(parsed)) {
        throw new Error('nodes JSON은 배열이어야 합니다.');
      }

      await patchContentById(initialItem.id, {
        title,
        nodes: parsed,
      });

      router.push(`/contents/${encodeURIComponent(initialItem.id)}`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '저장에 실패했습니다.');
      setPhase('error');
    } finally {
      setPhase('idle');
    }
  };

  return (
    <div className="mt-8 grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold text-zinc-600">ID</div>
          <div className="mt-1 font-mono text-sm text-zinc-900">
            {initialItem.id}
          </div>

          <div className="mt-6 text-xs font-semibold text-zinc-600">TITLE</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
          />

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50"
              disabled={phase === 'saving'}
            >
              취소
            </button>
            <button
              type="button"
              onClick={save}
              className="flex-1 px-5 py-2.5 rounded-2xl bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-800 disabled:bg-zinc-300"
              disabled={phase === 'saving'}
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-bold text-zinc-900">nodes JSON</div>
          <textarea
            value={nodesJson}
            onChange={e => setNodesJson(e.target.value)}
            spellCheck={false}
            className="mt-4 h-[480px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>
    </div>
  );
}
