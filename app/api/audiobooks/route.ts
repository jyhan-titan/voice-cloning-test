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
