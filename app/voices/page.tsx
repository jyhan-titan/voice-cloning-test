'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ModelItem = {
  _id?: string;
  title?: string;
  description?: string;
  visibility?: 'public' | 'unlist' | 'private';
  tags?: string[];
};

type ApiResponse = {
  custom: { total: number; items: ModelItem[] };
  defaults: { total: number; items: ModelItem[] };
};

export default function VoicesPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<ModelItem[]>([]);
  const [defaultItems, setDefaultItems] = useState<ModelItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/fish-audio-models', { method: 'GET' });
        const data = (await res.json()) as ApiResponse | { error?: string; message?: string };
        if (!res.ok) {
          const msg = (data as { error?: string }).error || (data as { message?: string }).message || '불러오기 실패';
          throw new Error(msg);
        }

        if (cancelled) return;
        const ok = data as ApiResponse;
        setCustomItems(Array.isArray(ok.custom?.items) ? ok.custom.items : []);
        setDefaultItems(Array.isArray(ok.defaults?.items) ? ok.defaults.items : []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : '불러오기 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const customTitle = useMemo(() => (tab === 'custom' ? '내가 만든 보이스 (선택됨)' : '내가 만든 보이스'), [tab]);

  return (
    <div className="min-h-full px-8 py-10 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">보이스 리스트</h1>
          <p className="text-sm text-zinc-500 mt-1">현재 사용할 수 있는 보이스, 커스텀 보이스 모델을 확인할 수 있습니다.</p>
        </div>
        <Link
          href="/voices/create"
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800"
        >
          보이스 생성
        </Link>
      </div>

      {isLoading && <div className="text-sm text-zinc-500">불러오는 중...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-bold text-zinc-900">{customTitle}</h2>
            <p className="text-xs text-zinc-500 mt-1">{customItems.length}개</p>
            <div className="mt-5 space-y-3">
              {customItems.length === 0 ? (
                <div className="text-sm text-zinc-500">아직 생성한 보이스가 없습니다.</div>
              ) : (
                customItems.map((m) => (
                  <div key={m._id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                    <div className="text-sm font-bold text-zinc-900">{m.title || '제목 없음'}</div>
                    {m.description && <div className="text-xs text-zinc-600 mt-1 line-clamp-2">{m.description}</div>}
                    <div className="text-xs text-zinc-500 mt-2">{m.visibility || 'private'}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-bold text-zinc-900">기본 제공 보이스</h2>
            <p className="text-xs text-zinc-500 mt-1">{defaultItems.length}개</p>
            <div className="mt-5 space-y-3">
              {defaultItems.length === 0 ? (
                <div className="text-sm text-zinc-500">표시할 기본 보이스가 없습니다.</div>
              ) : (
                defaultItems.slice(0, 30).map((m) => (
                  <div key={m._id} className="rounded-xl border border-zinc-100 bg-white p-4">
                    <div className="text-sm font-bold text-zinc-900">{m.title || '제목 없음'}</div>
                    {m.description && <div className="text-xs text-zinc-600 mt-1 line-clamp-2">{m.description}</div>}
                    <div className="text-xs text-zinc-500 mt-2">{m.visibility || 'public'}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
