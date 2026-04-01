'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/src/components/navigation/Breadcrumbs';

export default function AudiobookDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [audioUrl] = useState<string | null>(() => {
    if (!id) return null;
    try {
      const key = `audiobook_audio_${id}`;
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  });

  const errorMessage = useMemo(() => {
    if (!id) return null;
    if (audioUrl) return null;
    return '오디오 데이터를 찾을 수 없습니다. (임시 저장 만료)';
  }, [audioUrl, id]);

  const title = useMemo(() => `오디오북: ${id ?? ''}`, [id]);

  return (
    <div className="min-h-full px-4 py-6 font-sans sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: '오디오북', href: '/audiobooks' },
              { label: id ? String(id) : '상세' },
            ]}
          />
          <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
          <p className="text-sm text-zinc-500 mt-2">
            현재는 목 데이터로 생성된 mp3를 임시로 재생합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/audiobooks')}
          className="px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50"
        >
          목록
        </button>
      </div>

      <div className="mt-8">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {!errorMessage && !audioUrl && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-600">
            불러오는 중...
          </div>
        )}

        {audioUrl && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-bold text-zinc-900">재생</div>
            <audio src={audioUrl} controls className="w-full mt-4" />
            <div className="mt-4 flex justify-end">
              <a
                href={audioUrl}
                download={`audiobook_${id}.mp3`}
                className="text-sm font-semibold text-zinc-700 hover:underline"
              >
                MP3 다운로드
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
