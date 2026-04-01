import { getContentByIdSync } from '@/src/api/content';
import { ContentEditForm } from '@/src/components/contents/ContentEditForm';
import Breadcrumbs from '@/src/components/navigation/Breadcrumbs';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContentEditPage({ params }: Props) {
  const { id } = await params;

  let item: ReturnType<typeof getContentByIdSync> | null = null;
  try {
    item = getContentByIdSync(id);
  } catch {
    item = null;
  }

  return (
    <div className="min-h-full px-8 py-10 font-sans">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: '콘텐츠', href: '/contents' },
              {
                label: item?.title || id,
                href: `/contents/${encodeURIComponent(id)}`,
              },
              { label: '수정' },
            ]}
          />
          <h1 className="text-2xl font-bold text-zinc-900">콘텐츠 수정</h1>
          <p className="text-sm text-zinc-500 mt-2">
            JSON(nodes) 기반으로 샘플 콘텐츠를 수정합니다.
          </p>
        </div>
      </div>

      {item ? (
        <ContentEditForm initialItem={item} />
      ) : (
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-8">
          <div className="text-lg font-bold text-zinc-900">
            콘텐츠를 찾을 수 없습니다.
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            잘못된 ID로 접근했거나 콘텐츠가 삭제되었습니다.
          </div>
        </div>
      )}
    </div>
  );
}
