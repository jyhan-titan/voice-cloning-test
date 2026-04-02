'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';

type ModelItem = {
  _id?: string;
  title?: string;
  description?: string;
  visibility?: 'public' | 'unlist' | 'private';
  tags?: string[];
  cover_image?: string;
  samples?: unknown;
};

type ApiResponse = { total?: number; items?: ModelItem[] };

export function VoicesPageClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'default' ? 'default' : 'custom';

  const pageSize = 10;

  const [playingModelId, setPlayingModelId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioModelIdRef = useRef<string | null>(null);

  const customSentinelRef = useRef<HTMLDivElement | null>(null);
  const defaultSentinelRef = useRef<HTMLDivElement | null>(null);

  const stopCurrentSample = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      currentAudioModelIdRef.current = null;
    }
    setPlayingModelId(null);
  }, []);

  useEffect(() => {
    return () => {
      stopCurrentSample();
    };
  }, [stopCurrentSample]);

  const getFirstSampleUrl = useCallback((m: ModelItem) => {
    const s = m.samples as unknown;

    if (typeof s === 'string') return s;
    if (Array.isArray(s)) {
      const first = s[0] as unknown;
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') {
        const obj = first as Record<string, unknown>;
        const candidates = [obj.url, obj.audio, obj.src, obj.path];
        const found = candidates.find(v => typeof v === 'string');
        if (typeof found === 'string') return found;
      }
    }

    if (s && typeof s === 'object') {
      const obj = s as Record<string, unknown>;
      const candidates = [obj.url, obj.audio, obj.src, obj.path];
      const found = candidates.find(v => typeof v === 'string');
      if (typeof found === 'string') return found;
    }

    return null;
  }, []);

  const toggleSamplePlayback = useCallback(
    (m: ModelItem) => {
      const modelId = m._id;
      if (!modelId) return;

      const sampleUrl = getFirstSampleUrl(m);
      if (!sampleUrl) return;

      if (
        currentAudioModelIdRef.current === modelId &&
        currentAudioRef.current
      ) {
        stopCurrentSample();
        return;
      }

      if (
        currentAudioModelIdRef.current &&
        currentAudioModelIdRef.current !== modelId
      ) {
        stopCurrentSample();
      }

      const audio = new Audio(sampleUrl);
      currentAudioRef.current = audio;
      currentAudioModelIdRef.current = modelId;
      setPlayingModelId(modelId);

      audio.onended = () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
          currentAudioModelIdRef.current = null;
          setPlayingModelId(null);
        }
      };

      void audio.play().catch(() => {
        stopCurrentSample();
      });
    },
    [getFirstSampleUrl, stopCurrentSample],
  );

  const fetchModelsPage = useCallback(
    async (opts: { self: boolean; page: number }) => {
      const params = new URLSearchParams();
      params.set('page_size', String(pageSize));
      params.set('page_number', String(opts.page));
      params.set('self', opts.self ? 'true' : 'false');

      const res = await fetch(`/api/fish-audio-models?${params.toString()}`, {
        method: 'GET',
      });
      const data = (await res.json()) as
        | ApiResponse
        | { error?: string; message?: string };
      if (!res.ok) {
        const msg =
          (data as { error?: string }).error ||
          (data as { message?: string }).message ||
          '불러오기 실패';
        throw new Error(msg);
      }

      const ok = data as ApiResponse;
      return {
        total: typeof ok.total === 'number' ? ok.total : null,
        items: Array.isArray(ok.items) ? ok.items : [],
      };
    },
    [],
  );

  const activeTab = tab;
  const isCustomTab = activeTab === 'custom';
  const isDefaultTab = activeTab === 'default';
  const listQueryStaleTime = 5 * 60_000;

  const customQuery = useInfiniteQuery({
    queryKey: ['fish-audio-models', 'custom', pageSize],
    initialPageParam: 1,
    enabled: isCustomTab,
    queryFn: ({ pageParam }) =>
      fetchModelsPage({ self: true, page: Number(pageParam) || 1 }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      if (lastPage.total != null && loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
    staleTime: listQueryStaleTime,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const customIds = useMemo(() => {
    const set = new Set<string>();
    const pages = customQuery.data?.pages ?? [];
    for (const p of pages) {
      for (const it of p.items) {
        if (it._id) set.add(it._id);
      }
    }
    return set;
  }, [customQuery.data?.pages]);

  const defaultQuery = useInfiniteQuery({
    queryKey: ['fish-audio-models', 'default', pageSize],
    initialPageParam: 1,
    enabled: isDefaultTab,
    queryFn: ({ pageParam }) =>
      fetchModelsPage({ self: false, page: Number(pageParam) || 1 }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      if (lastPage.total != null && loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
    staleTime: listQueryStaleTime,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const customItems = useMemo(() => {
    return (customQuery.data?.pages ?? []).flatMap(p => p.items);
  }, [customQuery.data?.pages]);

  const customTotal = useMemo(() => {
    const first = customQuery.data?.pages?.[0];
    return first?.total ?? null;
  }, [customQuery.data?.pages]);

  const defaultItems = useMemo(() => {
    const items = (defaultQuery.data?.pages ?? []).flatMap(p => p.items);
    return items.filter(it => (it._id ? !customIds.has(it._id) : true));
  }, [customIds, defaultQuery.data?.pages]);

  const defaultTotal = useMemo(() => {
    const first = defaultQuery.data?.pages?.[0];
    return first?.total ?? null;
  }, [defaultQuery.data?.pages]);

  const error = (
    isCustomTab ? customQuery.error : defaultQuery.error
  ) as unknown;
  const errorMessage =
    error instanceof Error ? error.message : error ? '불러오기 실패' : null;

  const isLoading = isCustomTab
    ? customQuery.isLoading
    : defaultQuery.isLoading;

  const customTitle = '커스텀 보이스';
  const defaultTitle = '기본 보이스';

  useEffect(() => {
    const el =
      tab === 'custom' ? customSentinelRef.current : defaultSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (tab === 'custom') {
          if (customQuery.hasNextPage && !customQuery.isFetchingNextPage)
            void customQuery.fetchNextPage();
          return;
        }

        if (defaultQuery.hasNextPage && !defaultQuery.isFetchingNextPage)
          void defaultQuery.fetchNextPage();
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [customQuery, defaultQuery, tab]);

  return (
    <div className="min-h-full px-4 py-6 font-sans sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">보이스 관리</h1>
          <p className="text-sm text-zinc-500 mt-2">
            생성한 목소리를 확인하고 테스트할 수 있습니다.
          </p>
        </div>
        <Link
          href="/voices/create"
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-800"
        >
          보이스 생성
        </Link>
      </div>

      <div className="mb-8">
        <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1">
          <Link
            href="/voices?tab=custom"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === 'custom'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {customTitle}
          </Link>
          <Link
            href="/voices?tab=default"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === 'default'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {defaultTitle}
          </Link>
        </div>
      </div>

      {isLoading && <div className="text-sm text-zinc-500">불러오는 중...</div>}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {!isLoading && !error && tab === 'custom' && (
        <section className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{customTitle}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {customItems.length}개
                {typeof customTotal === 'number' ? ` / ${customTotal}개` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void customQuery.refetch()}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              새로고침
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {customItems.length === 0 ? (
              <div className="text-sm text-zinc-500">
                아직 생성한 보이스가 없습니다.
              </div>
            ) : (
              customItems.map(m => (
                <div
                  key={m._id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-zinc-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.cover_image || '/default_audio_thumbnail.png'}
                        alt={m.title || 'voice cover'}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const img = e.currentTarget;
                          if (img.src.includes('/default_audio_thumbnail.png'))
                            return;
                          img.src = '/default_audio_thumbnail.png';
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-bold text-zinc-900">
                        {m.title || '제목 없음'}
                      </div>
                      {m.description && (
                        <div className="text-xs text-zinc-600 mt-1 line-clamp-2">
                          {m.description}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500 mt-2">
                        @ {m.visibility || 'private'}
                      </div>
                    </div>

                    {m._id && getFirstSampleUrl(m) && (
                      <button
                        type="button"
                        onClick={() => toggleSamplePlayback(m)}
                        aria-label={
                          playingModelId === m._id ? '샘플 정지' : '샘플 재생'
                        }
                        className="shrink-0 w-10 h-10 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center justify-center"
                      >
                        {playingModelId === m._id ? '❚❚' : '▶'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={customSentinelRef} className="h-10" />
          {customQuery.isFetchingNextPage && (
            <div className="text-sm text-zinc-500">더 불러오는 중...</div>
          )}
        </section>
      )}

      {!isLoading && !error && tab === 'default' && (
        <section className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                {defaultTitle}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {defaultItems.length}개
                {typeof defaultTotal === 'number' ? ` / ${defaultTotal}개` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void defaultQuery.refetch()}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              새로고침
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {defaultItems.length === 0 ? (
              <div className="text-sm text-zinc-500">
                표시할 기본 보이스가 없습니다.
              </div>
            ) : (
              defaultItems.map(m => (
                <div
                  key={m._id}
                  className="rounded-xl border border-zinc-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900">
                        {m.title || '제목 없음'}
                      </div>
                      {m.description && (
                        <div className="text-xs text-zinc-600 mt-1 line-clamp-2">
                          {m.description}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500 mt-2">
                        {m.visibility || 'public'}
                      </div>
                    </div>

                    {m._id && getFirstSampleUrl(m) && (
                      <button
                        type="button"
                        onClick={() => toggleSamplePlayback(m)}
                        aria-label={
                          playingModelId === m._id ? '샘플 정지' : '샘플 재생'
                        }
                        className="shrink-0 w-10 h-10 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center justify-center"
                      >
                        {playingModelId === m._id ? '❚❚' : '▶'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={defaultSentinelRef} className="h-10" />
          {defaultQuery.isFetchingNextPage && (
            <div className="text-sm text-zinc-500">더 불러오는 중...</div>
          )}
        </section>
      )}
    </div>
  );
}
