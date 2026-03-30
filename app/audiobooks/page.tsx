'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { listAudiobooks, type Audiobook } from '@/src/api/audiobook';
import { AudiobookListItem } from '@/src/components/audiobooks/AudiobookListItem';
import { CreateAudiobookModal } from '@/src/components/audiobooks/CreateAudiobookModal';

type Phase = 'idle' | 'loading' | 'error';

export default function AudiobooksPage() {
  const searchParams = useSearchParams();
  const initialContentId = searchParams.get('contentId') ?? '';

  const [phase, setPhase] = useState<Phase>('idle');
  const [items, setItems] = useState<Audiobook[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const isLoading = useMemo(() => phase === 'loading', [phase]);

  const refresh = async () => {
    try {
      setPhase('loading');
      setErrorMessage(null);
      const res = await listAudiobooks();
      setItems(res.items);
      setPhase('idle');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
      setPhase('error');
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void refresh();
    });
  }, []);

  useEffect(() => {
    if (!initialContentId) return;
    Promise.resolve().then(() => {
      setCreateOpen(true);
    });
  }, [initialContentId]);

  return (
    <div className="min-h-full px-8 py-10 font-sans">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">오디오북</h1>
          <p className="text-sm text-zinc-500 mt-2">생성된 오디오북을 관리합니다.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800"
        >
          오디오북 만들기
        </button>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-600">
            불러오는 중...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <AudiobookListItem key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-600 text-center">
                아직 오디오북이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>

      <CreateAudiobookModal
        key={initialContentId || 'default'}
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refresh();
        }}
        initialContentId={initialContentId || undefined}
      />
    </div>
  );
}
