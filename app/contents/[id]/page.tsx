import { getContentByIdSync } from '@/src/api/content';
import { ContentDetailActions } from '@/src/components/contents/ContentDetailActions';
import { ContentRenderer } from '@/src/components/contents/ContentRenderer';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContentDetailPage({ params }: Props) {
  const { id } = await params;

  let item: ReturnType<typeof getContentByIdSync> | null = null;
  try {
    item = getContentByIdSync(id);
  } catch {
    item = null;
  }

  return (
    <div className="min-h-full px-8 py-10 font-sans">
      {item ? (
        <div className="space-y-6">
            <ContentDetailActions contentId={item.id} isAudiobook={item.isAudiobook} />

          <div className="rounded-3xl border border-zinc-200 bg-white p-8">
            <ContentRenderer nodes={item.nodes} />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8">
          <div className="text-lg font-bold text-zinc-900">콘텐츠를 찾을 수 없습니다.</div>
          <div className="mt-2 text-sm text-zinc-600">잘못된 ID로 접근했거나 콘텐츠가 삭제되었습니다.</div>
        </div>
      )}
    </div>
  );
}
