import Link from 'next/link';

import { listContentsSync } from '@/src/api/content';
import IconEdit from '@/src/svg/EditIcon';
import AudiobookOnIcon from '@/src/svg/AudiobookOnIcon';
import AudiobookOffIcon from '@/src/svg/AudiobookOffIcon';
import SearchIcon from '@/src/svg/SearchIcon';

export default function ContentsPage() {
  const { items } = listContentsSync();

  return (
    <div className="min-h-full px-4 py-6 font-sans sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">콘텐츠 관리</h1>
        <p className="text-sm text-zinc-500 mt-2">
          콘텐츠를 열람, 수정할 수 있고 오디오북을 생성할 수 있습니다.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                title
              </th>
              {/* <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">노드 수</th> */}
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-600">
                action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="px-5 py-4 font-semibold text-zinc-900">
                  {item.title}
                </td>
                {/* <td className="px-5 py-4 text-zinc-600">{item.nodes.length}</td> */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/contents/${encodeURIComponent(item.id)}`}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      aria-label="상세 보기"
                    >
                      <SearchIcon className="h-4 w-4" />
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
                      title={
                        item.isAudiobook
                          ? '생성된 오디오북 있음'
                          : '생성된 오디오북 없음'
                      }
                      aria-label={
                        item.isAudiobook
                          ? '생성된 오디오북 있음'
                          : '생성된 오디오북 없음'
                      }
                    >
                      {item.isAudiobook ? (
                        <AudiobookOnIcon className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AudiobookOffIcon className="h-4 w-4 text-zinc-400" />
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-10 text-center text-zinc-600"
                >
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
