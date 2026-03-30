export default function Home() {
  return (
    <div
      className="relative w-full min-h-screen px-10 py-14 font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/fish_audio_background.png')" }}
    >
      <div className="absolute inset-0 bg-white/25" />
      <div className="relative max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/50 border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Welcome
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
          Fish Audio Voice Studio
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          오디오북 제작까지 하나의 사이클을 완성할 수 있어요.
        </p>
        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white/50 p-6">
          <div className="text-sm font-semibold text-zinc-900">빠른 시작</div>
          <div className="mt-2 text-sm text-zinc-600">
            왼쪽 메뉴에서 <span className="font-semibold">보이스</span>로 이동해 음성을 복제해보세요.
          </div>
        </div>
      </div>
    </div>
  );
}
