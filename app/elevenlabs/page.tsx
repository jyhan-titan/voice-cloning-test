'use client';

import { BASIC_TEXT } from '@/src/constants/text_contents/basic_text';
import { transformTiptapToElevenLabs } from '@/src/utils/voice';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const DEFAULT_VOICE_ID = 'sVAFJ5iNMFoy9FmF18tR';

export default function AudioBookGeneratorPage() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [phase, setPhase] = useState<
    'idle' | 'fetching' | 'merging' | 'done' | 'error'
  >('idle');
  const [completedCount, setCompletedCount] = useState(0);

  // 메모리 누수 방지를 위한 URL 해제
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 1. Tiptap 데이터를 ElevenLabs 형식으로 변환 (유틸 함수 사용)

  const tasks = transformTiptapToElevenLabs(BASIC_TEXT);
  const totalCount = tasks.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const generateFullAudioMutation = useMutation({
    mutationFn: async () => {
      const chunks: Uint8Array[] = [];
      setStatus(`${tasks.length}개의 문단을 합치는 중... 잠시만 기다려주세요.`);

      let localCompleted = 0;
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        setStatus(`문단 생성 중... (${i + 1}/${tasks.length})`);
        const response = await fetch('/api/eleven-labs-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...task, voiceId: DEFAULT_VOICE_ID }),
        });

        if (!response.ok) throw new Error('API 호출 실패');

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
      return finalBlob;
    },
    onMutate: () => {
      setStatus('문단 데이터를 분석 중...');
      setPhase('fetching');
      setCompletedCount(0);
    },
    onSuccess: finalBlob => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(finalBlob));
      setPhase('done');
      setStatus('생성 완료! 재생 버튼을 눌러보세요.');
    },
    onError: error => {
      console.error('오디오북 생성 에러:', error);
      setPhase('error');
      setStatus('에러 발생');
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans sm:p-6 lg:p-10">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-zinc-800">
          📚 AI 오디오북 엔진
        </h1>
        <p className="text-zinc-500 mt-2">
          여러 문단을 분석하여 자연스러운 하나의 음성 파일로 만듭니다.
        </p>
      </header>

      <main className="space-y-6">
        {/* 데이터 프리뷰 섹션 */}
        <section className="bg-zinc-50 p-4 rounded-lg border">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2 uppercase">
            Input Preview
          </h2>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <p key={i} className="text-zinc-700 text-sm">
                <span className="font-bold text-blue-500">[{task.text}]</span>
              </p>
            ))}
          </div>
        </section>

        {/* 컨트롤 섹션 */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => void generateFullAudioMutation.mutateAsync()}
            disabled={generateFullAudioMutation.isPending}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              generateFullAudioMutation.isPending
                ? 'bg-zinc-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {generateFullAudioMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> 생성 중...
              </span>
            ) : (
              '전체 문단 합치기 및 재생'
            )}
          </button>

          {generateFullAudioMutation.isPending && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>
                  {phase === 'merging'
                    ? '합치는 중'
                    : phase === 'fetching'
                      ? '생성 중'
                      : phase === 'error'
                        ? '에러'
                        : ''}
                </span>
                <span>
                  {Math.min(completedCount, totalCount)}/{totalCount} (
                  {Math.min(progressPercent, 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          <p className="text-sm text-center text-zinc-600 italic">{status}</p>
        </div>

        {/* 결과 섹션 */}
        {audioUrl && (
          <section className="mt-10 p-6 border-2 border-blue-100 rounded-2xl bg-blue-50 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-blue-800 mb-4">
              🎧 완성된 오디오북
            </h3>
            <audio src={audioUrl} controls className="w-full mb-4" />
            <div className="flex justify-end">
              <a
                href={audioUrl}
                download="complete_audiobook.mp3"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                📥 MP3 파일로 내려받기
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
