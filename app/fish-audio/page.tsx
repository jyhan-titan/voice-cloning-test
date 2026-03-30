'use client';

import { BASIC_TEXT } from '@/src/constants/text_contents/basic_text';
import { transformTiptapToFishAudio } from '@/src/utils/voice';
import { useState } from 'react';

export default function FishAudioPage() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
  const [phase, setPhase] = useState<'idle' | 'fetching' | 'merging' | 'done' | 'error'>('idle');
  const [completedCount, setCompletedCount] = useState(0);

  const tasks = transformTiptapToFishAudio(BASIC_TEXT);
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  
  const generateFullAudio = async () => {
    setIsLoading(true);
    setStatus("문단 데이터를 분석 중...");
    setPhase('fetching');
    setCompletedCount(0);

    try {
      const chunks: Uint8Array[] = [];
      setStatus(`${tasks.length}개의 문단을 합치는 중... 잠시만 기다려주세요.`);

      // 문단별로 우리 API 호출
      let localCompleted = 0;
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        setStatus(`문단 생성 중... (${i + 1}/${tasks.length})`);
        const response = await fetch('/api/fish-audio-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: task.text,
            voiceId: "5eaa94d0873846368b8bebf6f6918cef", // 실제 Voice ID
            prosody: task.prosody
          }),
        });

        if (!response.ok) throw new Error('API 호출 실패');

        // 스트림 읽기
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

      // 최종 Blob 생성 및 재생
      setPhase('merging');
      setStatus('오디오 파일을 하나로 합치는 중...');
      const finalBlob = new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' });
      // TODO: 백엔드 전송을 위한 코드 필요함
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(finalBlob));
      setPhase('done');
      setStatus("생성 완료! 재생 버튼을 눌러보세요.");

    } catch (err) {
      console.error(err);
      alert("생성 실패!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="max-w-2xl mx-auto p-10 font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">📚 AI 오디오북 엔진</h1>
        <p className="text-gray-500 mt-2">여러 문단을 분석하여 자연스러운 하나의 음성 파일로 만듭니다.</p>
      </header>

      <main className="space-y-6">
        {/* 데이터 프리뷰 섹션 */}
        <section className="bg-gray-50 p-4 rounded-lg border">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Input Preview</h2>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <p key={i} className="text-gray-700 text-sm">
                <span className="font-bold text-blue-500">[{task.text}]</span>
              </p>
            ))}
          </div>
        </section>

        {/* 컨트롤 섹션 */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={generateFullAudio}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> 생성 중...
              </span>
            ) : "전체 문단 합치기 및 재생"}
          </button>

          {isLoading && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
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
                  {Math.min(completedCount, totalCount)}/{totalCount} ({Math.min(progressPercent, 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-center text-gray-600 italic">
            {status}
          </p>
        </div>

        {/* 결과 섹션 */}
        {audioUrl && (
          <section className="mt-10 p-6 border-2 border-blue-100 rounded-2xl bg-blue-50 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-blue-800 mb-4">🎧 완성된 오디오북</h3>
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