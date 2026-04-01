'use client';

import { useRouter } from 'next/navigation';

type Props = {
  contentId: string;
  isAudiobook: boolean;
};

export function ContentDetailActions({ contentId, isAudiobook }: Props) {
  const router = useRouter();

  const comingSoon = () => {
    alert('준비중인 기능입니다.');
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {!isAudiobook ? (
        <button
          type="button"
          onClick={() => {
            router.push(
              `/audiobooks/create?contentId=${encodeURIComponent(contentId)}`,
            );
          }}
          className="px-4 py-2.5 rounded-2xl bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-800 cursor-pointer"
        >
          오디오북 생성
        </button>
      ) : (
        <button
          type="button"
          onClick={comingSoon}
          className="px-4 py-2.5 rounded-2xl bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-800 cursor-pointer"
        >
          오디오북 이동
        </button>
      )}

      <button
        type="button"
        // onClick={comingSoon}
        onClick={() => {
          router.push(`/contents/${contentId}/edit`);
        }}
        className="px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
      >
        수정
      </button>
    </div>
  );
}
