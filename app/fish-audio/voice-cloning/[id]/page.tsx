'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Visibility = 'public' | 'unlist' | 'private';

type ModelResponse = {
  _id?: string;
  title?: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
  cover_image?: string;
};

function uniqTags(tags: string[]) {
  return Array.from(new Set(tags.map(t => t.trim()).filter(Boolean)));
}

function TagButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function VoiceModelDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [agree, setAgree] = useState(false);

  const presetTags = useMemo(
    () => ({
      gender: ['남성', '여성'],
      age: ['젊은', '중년', '이전'],
      use: ['내레이션', '교육용', '광고', '대화형', '소셜 미디어', '엔터테인먼트'],
      quality: ['중저음', '부드러움', '차분함', '충격적', '전문가', '자신감 있는', '지우기'],
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/fish-audio-model/${encodeURIComponent(id)}`);
        const data = (await res.json()) as ModelResponse | { error?: string; message?: string };
        if (!res.ok) {
          const msg = (data as { error?: string; message?: string }).error || (data as { message?: string }).message || '로드 실패';
          throw new Error(msg);
        }
        if (cancelled) return;

        const model = data as ModelResponse;
        setTitle(model.title ?? '');
        setDescription(model.description ?? '');
        setVisibility((model.visibility as Visibility) ?? 'private');
        setTags(Array.isArray(model.tags) ? uniqTags(model.tags) : []);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : '로드 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const previewTags = useMemo(() => tags.slice(0, 6), [tags]);
  const extraTagCount = Math.max(0, tags.length - previewTags.length);

  const addTag = (t: string) => {
    const next = uniqTags([...tags, t]);
    setTags(next);
  };

  const toggleTag = (t: string) => {
    if (tags.includes(t)) {
      setTags(tags.filter(x => x !== t));
      return;
    }
    addTag(t);
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const save = async () => {
    setSaveError(null);
    if (!agree) {
      setSaveError('필수 항목에 동의해야 합니다.');
      return;
    }
    if (!title.trim()) {
      setSaveError('이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/fish-audio-model/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          visibility,
          tags: uniqTags(tags),
        }),
      });

      const data = (await res.json()) as { status?: number; message?: string; error?: string };
      if (!res.ok) {
        const msg = data.error || data.message || '저장 실패';
        throw new Error(msg);
      }

      router.push('/fish-audio');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎙️</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">즉시 음성 복제</h1>
            <p className="text-sm text-gray-500">오디오 10초만 필요합니다!</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          오디오로 돌아가기
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <div className="space-y-6 text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">1</div>
              <span>소스 오디오</span>
            </div>
            <div className="flex items-center gap-3 text-gray-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">2</div>
              <span>음성 세부 정보</span>
            </div>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            {isLoading ? (
              <div className="text-sm text-gray-500">불러오는 중...</div>
            ) : loadError ? (
              <div className="text-sm text-red-600">{loadError}</div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">이름</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="예: 표준 한국어 남성"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">설명 (선택 사항)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full min-h-[110px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="이 보이스에 대한 설명을 입력하세요."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">태그 (선택 사항)</label>
                    <span className="text-xs text-gray-400">{tags.length}개</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tagInput.trim()) {
                            addTag(tagInput);
                            setTagInput('');
                          }
                        }
                      }}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="태그를 입력하고 Enter"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          addTag(tagInput);
                          setTagInput('');
                        }
                      }}
                      className="px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                    >
                      추가
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => removeTag(t)}
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                        >
                          {t} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700">성별</div>
                  <div className="flex flex-wrap gap-2">
                    {presetTags.gender.map(t => (
                      <TagButton key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700">나이</div>
                  <div className="flex flex-wrap gap-2">
                    {presetTags.age.map(t => (
                      <TagButton key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700">사용 사례</div>
                  <div className="flex flex-wrap gap-2">
                    {presetTags.use.map(t => (
                      <TagButton key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700">음성 품질</div>
                  <div className="flex flex-wrap gap-2">
                    {presetTags.quality.map(t => (
                      <TagButton key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-700">타입</div>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                      />
                      공개
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'unlist'}
                        onChange={() => setVisibility('unlist')}
                      />
                      비공개
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'private'}
                        onChange={() => setVisibility('private')}
                      />
                      비공개
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    공개 모델은 발견 페이지에서 볼 수 있으며, unlist는 링크가 있는 사람만 볼 수 있습니다.
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <div className="text-xs text-gray-400 font-semibold mb-3">미리보기</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900">{title.trim() || '이름 없음'}</div>
                        <span className="text-xs text-gray-500">@ {visibility}</span>
                      </div>
                      {description.trim() && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{description.trim()}</div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {previewTags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] text-gray-700">
                            {t}
                          </span>
                        ))}
                        {extraTagCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] text-gray-500">
                            +{extraTagCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                    className="mt-1"
                  />
                  <span>이 음성을 사용할 필요 권리가 있다는 것을 확인합니다. (필수)</span>
                </label>

                {saveError && <div className="text-sm text-red-600">{saveError}</div>}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSaving || isLoading}
                    onClick={save}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition ${
                      isSaving || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSaving ? '저장 중...' : '새로 만들기'}
                  </button>
                </div>

                {loadError && <div className="text-sm text-red-600">{loadError}</div>}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
