import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const filename = typeof body?.filename === 'string' ? body.filename : 'audiobook.mp3';

  return NextResponse.json({
    url: `https://example.com/uploads/${encodeURIComponent(filename)}`,
  });
}
