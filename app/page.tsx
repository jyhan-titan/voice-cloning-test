'use client';

import Player from 'react-lottie-player';
import loadingAnimation from '@/src/components/lottie/bg_ai_voice.json';

export default function Home() {
  return (
    <div className="relative w-full max-w-3xl min-h-screen px-4 py-8 font-sans bg-cover bg-center bg-no-repeat sm:px-6 sm:py-10 lg:px-10 lg:py-14">
      <Player
        play
        loop
        animationData={loadingAnimation}
        style={{ width: '80%', height: '80%' }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      <div className="absolute inset-0 bg-white/25" />
      <div className="relative max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/50 border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500/60 animate-ping" />
            <span className="relative inline-flex h-full w-full rounded-full bg-red-500 animate-pulse" />
          </span>
          Welcome
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
          Mentofolio Voice Studio
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          오디오북 제작까지 하나의 사이클을 완성할 수 있어요.
        </p>
        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white/70 p-6">
          <div className="text-sm font-semibold text-zinc-900">Guide</div>
          <div className="mt-2 text-sm text-zinc-600">
            <span className="font-semibold">보이스 관리</span>에서 나만의
            보이스를 만들어보세요.
          </div>
          <br />
          <div className="mt-2 text-sm text-zinc-600">
            * 실제 오디오 저장 API 구축이 필요합니다.
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            * 생성된 오디오북은 수정이 불가능합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
