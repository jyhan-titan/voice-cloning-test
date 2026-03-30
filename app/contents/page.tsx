import Link from 'next/link';

import { listContentsSync } from '@/src/api/content';

function IconSearch(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function IconAudiobookOn(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function IconAudiobookOff(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M9 7h6" />
      <path d="M8 16l8-8" />
    </svg>
  );
}

function IconEdit(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default function ContentsPage() {
  const { items } = listContentsSync();

  return (
    <div className="min-h-full px-8 py-10 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">콘텐츠 관리</h1>
        <p className="text-sm text-zinc-500 mt-2">콘텐츠를 열람, 수정할 수 있고 오디오북을 생성할 수 있습니다.</p>
      </div>

      <div className="mt-8 rounded-3xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">title</th>
              {/* <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">노드 수</th> */}
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-600">action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="px-5 py-4 font-semibold text-zinc-900">{item.title}</td>
                {/* <td className="px-5 py-4 text-zinc-600">{item.nodes.length}</td> */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/contents/${encodeURIComponent(item.id)}`}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      aria-label="상세 보기"
                    >
                      <IconSearch className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/contents/${encodeURIComponent(item.id)}/edit`}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      aria-label="수정"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    <span
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white"
                      title={item.isAudiobook ? '생성된 오디오북 있음' : '생성된 오디오북 없음'}
                      aria-label={item.isAudiobook ? '생성된 오디오북 있음' : '생성된 오디오북 없음'}
                    >
                      {item.isAudiobook ? (
                        <IconAudiobookOn className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <IconAudiobookOff className="h-4 w-4 text-zinc-400" />
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-zinc-600">
                  콘텐츠가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
