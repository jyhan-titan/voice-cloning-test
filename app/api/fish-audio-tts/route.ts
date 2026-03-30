import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.FISH_AUDIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing FISH_AUDIO_API_KEY' },
        { status: 500 }
      );
    }

    const body = await req.json();

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        model: 's2-pro',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'normal',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('TTS 서버 에러:', error);
    return NextResponse.json({ error: '서버 에러 발생' }, { status: 500 });
  }
}
