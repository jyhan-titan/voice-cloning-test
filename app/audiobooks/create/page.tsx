'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { createAudiobook } from '@/src/api/audiobook';
import { getContentByIdSync, listContentsSync } from '@/src/api/content';
import { transformTiptapToFishAudio } from '@/src/utils/voice';
import AudioLoading from '@/src/components/loading/AudioLoading';
import SearchIcon from '@/src/svg/SearchIcon';
import Breadcrumbs from '@/src/components/navigation/Breadcrumbs';

type VoiceItem = {
  _id: string;
  title?: string;
  description?: string;
  samples?: unknown;
};

type SearchModalItem = {
  id: string;
  title: string;
  disabled?: boolean;
  subtitle?: string;
  description?: string;
  samples?: unknown;
};

type Phase =
  | 'idle'
  | 'fetching_voices'
  | 'generating'
  | 'merging'
  | 'saving'
  | 'done'
  | 'error';

export default function CreateAudiobookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialContentId = searchParams.get('contentId') ?? '';

  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const contents = useMemo(
    () =>
      listContentsSync().items.map(c => ({
        id: c.id,
        title: c.title,
        isAudiobook: c.isAudiobook,
      })),
    [],
  );

  const [selectedContentId, setSelectedContentId] = useState<string>(
    () => initialContentId || '',
  );

  useEffect(() => {
    if (!initialContentId) return;
    setSelectedContentId(initialContentId);
  }, [initialContentId]);

  const selectedContent = useMemo(
    () => contents.find(c => c.id === selectedContentId) ?? null,
    [contents, selectedContentId],
  );

  const isBlocked = useMemo(
    () => Boolean(selectedContent?.isAudiobook),
    [selectedContent],
  );

  const totalCount = useMemo(() => {
    if (!selectedContentId) return 0;
    try {
      const content = getContentByIdSync(selectedContentId);
      return transformTiptapToFishAudio(content.nodes).length;
    } catch {
      return 0;
    }
  }, [selectedContentId]);

  const isCreating = useMemo(() => {
    return phase === 'generating' || phase === 'merging' || phase === 'saving';
  }, [phase]);

  const progressPercent = useMemo(() => {
    if (totalCount <= 0) return 0;
    return Math.min(
      100,
      Math.round((Math.min(completedCount, totalCount) / totalCount) * 100),
    );
  }, [completedCount, totalCount]);

  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [voiceId, setVoiceId] = useState<string>('');

  const [voicePage, setVoicePage] = useState(1);
  const [voiceTotal, setVoiceTotal] = useState<number | null>(null);
  const [voiceLoadingMore, setVoiceLoadingMore] = useState(false);
  const voiceSentinelRef = useRef<HTMLDivElement | null>(null);

  const didInitialVoicesFetchRef = useRef(false);
  const didUserScrollVoicesRef = useRef(false);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [tempVoiceId, setTempVoiceId] = useState<string>('');

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioVoiceIdRef = useRef<string | null>(null);

  const contentModalItems = useMemo<SearchModalItem[]>(() => {
    return contents.map(c => ({
      id: c.id,
      title: c.title,
      disabled: c.isAudiobook,
      subtitle: c.isAudiobook ? '이미 오디오북이 있는 콘텐츠' : undefined,
    }));
  }, [contents]);

  const voiceModalItems = useMemo<SearchModalItem[]>(() => {
    return voices.map(v => ({
      id: v._id,
      title: v.title || v._id,
      description: v.description || v._id,
      samples: v.samples,
    }));
  }, [voices]);

  const selectedVoiceLabel = useMemo(() => {
    const found = voices.find(v => v._id === voiceId);
    return found ? found.title || found._id : '';
  }, [voiceId, voices]);

  const stopCurrentSample = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      currentAudioVoiceIdRef.current = null;
    }
    setPlayingVoiceId(null);
  }, []);

  useEffect(() => {
    if (!isVoiceModalOpen) {
      stopCurrentSample();
      return;
    }

    return () => {
      stopCurrentSample();
    };
  }, [isVoiceModalOpen, stopCurrentSample]);

  const getFirstSampleUrl = useCallback((s: unknown) => {
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
    (id: string, samples: unknown) => {
      const sampleUrl = getFirstSampleUrl(samples);
      if (!sampleUrl) return;

      if (currentAudioVoiceIdRef.current === id && currentAudioRef.current) {
        stopCurrentSample();
        return;
      }

      if (
        currentAudioVoiceIdRef.current &&
        currentAudioVoiceIdRef.current !== id
      ) {
        stopCurrentSample();
      }

      const audio = new Audio(sampleUrl);
      currentAudioRef.current = audio;
      currentAudioVoiceIdRef.current = id;
      setPlayingVoiceId(id);

      audio.onended = () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
          currentAudioVoiceIdRef.current = null;
          setPlayingVoiceId(null);
        }
      };

      void audio.play().catch(() => {
        stopCurrentSample();
      });
    },
    [getFirstSampleUrl, stopCurrentSample],
  );

  useEffect(() => {
    if (!isCreating) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCreating]);

  const fetchVoicesPage = useCallback(async (page: number) => {
    const params = new URLSearchParams();
    params.set('page_size', '20');
    params.set('page_number', String(page));
    params.set('self', 'true');

    const res = await fetch(`/api/fish-audio-models?${params.toString()}`);
    if (!res.ok) throw new Error('보이스 목록을 불러오지 못했습니다.');

    const json = (await res.json()) as { items?: VoiceItem[]; total?: number };
    return {
      items: Array.isArray(json.items) ? json.items : [],
      total: typeof json.total === 'number' ? json.total : null,
    };
  }, []);

  useEffect(() => {
    if (!isVoiceModalOpen) return;
    if (didInitialVoicesFetchRef.current) return;
    didInitialVoicesFetchRef.current = true;

    let cancelled = false;

    const run = async () => {
      setPhase('fetching_voices');
      try {
        const first = await fetchVoicesPage(1);
        if (cancelled) return;
        setVoices(first.items);
        setVoiceTotal(first.total);
        setVoicePage(1);
        setPhase('idle');
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(
          e instanceof Error ? e.message : '보이스 목록을 불러오지 못했습니다.',
        );
        setPhase('idle');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [fetchVoicesPage, isVoiceModalOpen]);

  const voiceHasMore = useMemo(() => {
    if (voiceTotal == null) return true;
    return voices.length < voiceTotal;
  }, [voiceTotal, voices.length]);

  const loadMoreVoices = useCallback(async () => {
    if (voiceLoadingMore) return;
    if (phase === 'fetching_voices') return;
    if (!voiceHasMore) return;

    setVoiceLoadingMore(true);
    try {
      const nextPage = voicePage + 1;
      const next = await fetchVoicesPage(nextPage);
      setVoices(prev => [...prev, ...next.items]);
      if (typeof next.total === 'number') setVoiceTotal(next.total);
      setVoicePage(nextPage);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '보이스 추가 로드 실패');
    } finally {
      setVoiceLoadingMore(false);
    }
  }, [fetchVoicesPage, phase, voiceHasMore, voiceLoadingMore, voicePage]);

  useEffect(() => {
    if (!isVoiceModalOpen) return;
    const el = voiceSentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(entries => {
      const first = entries[0];
      if (!didUserScrollVoicesRef.current) return;
      if (first?.isIntersecting) {
        void loadMoreVoices();
      }
    });

    io.observe(el);
    return () => {
      io.disconnect();
    };
  }, [isVoiceModalOpen, loadMoreVoices]);

  useEffect(() => {
    if (!isVoiceModalOpen) return;
    setTempVoiceId(voiceId);
  }, [isVoiceModalOpen, voiceId]);

  useEffect(() => {
    if (!isVoiceModalOpen) return;
    didUserScrollVoicesRef.current = false;
  }, [isVoiceModalOpen]);

  const startCreate = async () => {
    try {
      setErrorMessage(null);
      setCompletedCount(0);
      setStatus('문단 데이터를 분석 중...');

      if (!selectedContentId) {
        setErrorMessage('콘텐츠를 선택해주세요.');
        return;
      }

      if (isBlocked) {
        setErrorMessage(
          '이미 오디오북이 생성된 콘텐츠입니다. 다른 콘텐츠를 선택해주세요.',
        );
        return;
      }

      if (!voiceId.trim()) {
        setErrorMessage('보이스를 선택해주세요.');
        return;
      }

      const content = getContentByIdSync(selectedContentId);
      const tasks = transformTiptapToFishAudio(content.nodes);
      if (tasks.length === 0) {
        setErrorMessage('생성할 문단이 없습니다.');
        return;
      }

      setPhase('generating');
      const chunks: Uint8Array[] = [];
      let localCompleted = 0;
      setStatus(`문단을 생성 중...`);

      for (let i = 0; i < tasks.length; i += 1) {
        const task = tasks[i];
        setStatus(`문단 생성 중... (${i + 1}/${tasks.length})`);
        const response = await fetch('/api/fish-audio-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: task.text,
            voiceId: voiceId.trim(),
            prosody: task.prosody,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(errText || 'TTS API 호출 실패');
        }

        const reader = response.body?.getReader();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }
        }

        localCompleted += 1;
        setCompletedCount(localCompleted);
      }

      setPhase('merging');
      setStatus('오디오 파일을 하나로 합치는 중...');
      const finalBlob = new Blob(chunks as unknown as BlobPart[], {
        type: 'audio/mpeg',
      });

      setPhase('saving');
      setStatus('저장 요청 중...');
      const created = await createAudiobook({
        title: content.title,
        contentId: selectedContentId,
        filename: `audiobook_${selectedContentId}.mp3`,
        size: finalBlob.size,
      });

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error('오디오 변환 실패'));
        fr.onload = () => resolve(String(fr.result ?? ''));
        fr.readAsDataURL(finalBlob);
      });

      sessionStorage.setItem(`audiobook_audio_${created.id}`, dataUrl);

      setPhase('done');
      router.push(`/audiobooks/${encodeURIComponent(created.id)}`);
    } catch (e) {
      setPhase('error');
      setErrorMessage(e instanceof Error ? e.message : '생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-full px-4 py-6 font-sans sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {isCreating && (
        <AudioLoading>
          <div className="mt-2 text-xl font-semibold text-zinc-900">
            {progressPercent}%
          </div>

          <div className="mt-4 w-full">
            <div className="h-2 w-full rounded-lg bg-zinc-200 overflow-hidden">
              <div
                className="h-2 bg-zinc-900 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 text-sm text-zinc-700 text-center break-keep">
              {status}
            </div>
          </div>
        </AudioLoading>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: '오디오북', href: '/audiobooks' },
              { label: '오디오북 생성' },
            ]}
          />
          <h1 className="text-2xl font-bold text-zinc-900">오디오북 생성</h1>
          <p className="text-sm text-zinc-500 mt-2">
            콘텐츠와 보이스를 선택하고 오디오북 생성을 시작합니다.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-bold text-zinc-900">콘텐츠</div>
          <button
            type="button"
            onClick={() => setIsContentModalOpen(true)}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 flex items-center justify-between gap-3"
            disabled={isCreating}
          >
            <span className="min-w-0 truncate text-left">
              {selectedContent?.title || '콘텐츠를 선택해주세요'}
            </span>
            <SearchIcon className="h-4 w-4 text-zinc-400 shrink-0" />
          </button>

          {isBlocked && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              선택한 콘텐츠는 이미 오디오북이 있습니다.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-bold text-zinc-900">보이스</div>

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 flex items-center justify-between gap-3 disabled:text-zinc-500"
            disabled={isCreating || phase === 'fetching_voices'}
          >
            <span className="min-w-0 truncate text-left">
              {selectedVoiceLabel ||
                (phase === 'fetching_voices'
                  ? '보이스를 불러오는 중...'
                  : '보이스를 선택해주세요')}
            </span>
            <SearchIcon className="h-4 w-4 text-zinc-400 shrink-0" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={startCreate}
            disabled={
              !selectedContentId ||
              isBlocked ||
              !voiceId.trim() ||
              isCreating ||
              totalCount === 0
            }
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 disabled:bg-zinc-300"
          >
            {isCreating ? '생성 중...' : '생성 시작'}
          </button>
        </div>
      </div>

      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsContentModalOpen(false)}
            aria-label="닫기"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
            <div className="p-5 border-b border-zinc-100">
              <div className="text-sm font-bold text-zinc-900">콘텐츠 선택</div>
            </div>

            <div className="max-h-[60vh] overflow-auto p-3">
              {contentModalItems.length === 0 ? (
                <div className="p-4 text-sm text-zinc-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                contentModalItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      setSelectedContentId(item.id);
                      setIsContentModalOpen(false);
                    }}
                    className="w-full text-left rounded-xl px-4 py-3 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    <div className="text-sm font-semibold text-zinc-900">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-zinc-500 mt-1">
                        {item.subtitle}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsVoiceModalOpen(false)}
            aria-label="닫기"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
            <div className="p-5 border-b border-zinc-100">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-zinc-900">
                  보이스 선택
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className="max-h-[60vh] overflow-auto p-3"
              onScroll={() => {
                didUserScrollVoicesRef.current = true;
              }}
            >
              {voiceModalItems.length === 0 ? (
                <div className="p-4 text-sm text-zinc-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                voiceModalItems.map(item => {
                  const isSelected = tempVoiceId === item.id;
                  const sampleUrl = getFirstSampleUrl(item.samples);

                  return (
                    <div
                      key={item.id}
                      className="w-full rounded-xl px-4 py-3 hover:bg-zinc-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="voice_pick"
                            checked={isSelected}
                            onChange={() => setTempVoiceId(item.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-zinc-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 break-all">
                              {item.description}
                            </div>
                          </div>
                        </label>

                        {sampleUrl && (
                          <button
                            type="button"
                            aria-label={
                              playingVoiceId === item.id
                                ? '샘플 정지'
                                : '샘플 재생'
                            }
                            onClick={() =>
                              toggleSamplePlayback(item.id, item.samples)
                            }
                            className="shrink-0 w-10 h-10 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center justify-center"
                          >
                            {playingVoiceId === item.id ? '❚❚' : '▶'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={voiceSentinelRef} className="h-8" />
              {voiceLoadingMore && (
                <div className="p-3 text-xs text-zinc-500">
                  더 불러오는 중...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!tempVoiceId) return;
                  setVoiceId(tempVoiceId);
                  setIsVoiceModalOpen(false);
                }}
                disabled={!tempVoiceId}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
