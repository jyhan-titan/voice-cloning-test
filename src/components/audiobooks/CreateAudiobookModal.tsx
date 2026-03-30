'use client';

import { useMemo, useState } from 'react';

import { uploadAudiobook } from '@/src/api/audiobook';
import { listContentsSync } from '@/src/api/content';

type Props = {
  open: boolean;
  onClose: () => void;
  initialContentId?: string;
};


export function CreateAudiobookModal({ open, onClose, initialContentId }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contents = useMemo(
    () => listContentsSync().items.map((c) => ({ id: c.id, title: c.title, isAudiobook: c.isAudiobook })),
    [],
  );
  const [selectedContentId, setSelectedContentId] = useState<string>(initialContentId ?? contents[0]?.id ?? '');

  const selectedContent = useMemo(
    () => contents.find((c) => c.id === selectedContentId) ?? null,
    [contents, selectedContentId],
  );
  const isBlocked = useMemo(() => Boolean(selectedContent?.isAudiobook), [selectedContent]);


  const startCreate = async () => {
    // NOTE: 다음 단계에서 여기에 fish-audio-tts 호출(진행률/병합)을 붙입니다.
    try {
      setErrorMessage(null);

      if (isBlocked) {
        setErrorMessage('이미 오디오북이 생성된 콘텐츠입니다. 다른 콘텐츠를 선택해주세요.');
        return;
      }

      // 현재는 Mock: 빈 mp3 blob을 업로드로 넘기는 형태로 인터페이스만 맞춤
      const fakeMp3 = new Blob([], { type: 'audio/mpeg' });

      await uploadAudiobook(fakeMp3, {
        filename: `audiobook_${selectedContentId || 'unknown'}.mp3`,
        contentType: 'audio/mpeg',
        size: fakeMp3.size,
      });

    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '생성에 실패했습니다.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-zinc-900">오디오북 만들기</div>
            <div className="mt-1 text-sm text-zinc-600">변환할 콘텐츠를 선택하고 생성을 시작하세요.</div>
          </div>
          <button
            type="button"
            onClick={() => {
               onClose();
            }}
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer p-2 w-8 h-8 flex items-center justify-center"
            aria-label="닫기"
          >
            X
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-xs font-semibold text-zinc-700">콘텐츠 선택</div>
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              {contents.map((c) => (
                <option key={c.id} value={c.id} disabled={c.isAudiobook}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {isBlocked && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              선택한 콘텐츠는 이미 오디오북이 있습니다.
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}


          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 disabled:bg-zinc-300"
              disabled={!selectedContentId || isBlocked}
            >
              생성 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
