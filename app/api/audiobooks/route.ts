import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    items: [
      // {
      //   id: 'ab_1',
      //   title: '샘플 오디오북 1',
      //   contentId: 'basic',
      //   audioUrl: 'https://example.com/audiobooks/ab_1.mp3',
      //   createdAt: new Date().toISOString(),
      // },
      // {
      //   id: 'ab_2',
      //   title: '샘플 오디오북 2',
      //   contentId: 'news',
      //   audioUrl: 'https://example.com/audiobooks/ab_2.mp3',
      //   createdAt: new Date().toISOString(),
      // },
    ],
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const contentId =
    typeof body?.contentId === 'string' ? body.contentId : 'unknown';
  const title = typeof body?.title === 'string' ? body.title : '오디오북';

  const id = `ab_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return NextResponse.json({
    id,
    title,
    contentId,
    createdAt: new Date().toISOString(),
  });
}
