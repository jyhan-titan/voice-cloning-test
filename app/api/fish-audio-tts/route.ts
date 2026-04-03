import { NextRequest, NextResponse } from 'next/server';

import {
  fishAudioRequest,
  getFishAudioApiKeyOrResponse,
} from '@/src/server/fishAudio';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiKeyResult = getFishAudioApiKeyOrResponse();
    if (!apiKeyResult.ok) return apiKeyResult.response;
    const { apiKey } = apiKeyResult;

    const payload = (await req.json()) as Record<string, unknown>;

    // Backward compatibility: allow clients to send `voiceId`.
    // Fish Audio expects `reference_id` (string | string[]).
    const { voiceId, reference_id, ...rest } = payload;
    const finalReferenceId = (reference_id ?? voiceId) as unknown;

    const upstreamRes = await fishAudioRequest(apiKey, {
      method: 'POST',
      url: '/v1/tts',
      headers: {
        model: 's2-pro',
        'Content-Type': 'application/json',
      },
      data: {
        ...rest,
        ...(finalReferenceId != null
          ? { reference_id: finalReferenceId }
          : null),
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'normal',
      },
      responseType: 'arraybuffer',
    });

    if (upstreamRes.status < 200 || upstreamRes.status >= 300) {
      const errorText =
        upstreamRes.data instanceof ArrayBuffer
          ? new TextDecoder().decode(new Uint8Array(upstreamRes.data))
          : Buffer.isBuffer(upstreamRes.data)
            ? upstreamRes.data.toString('utf8')
            : upstreamRes.data instanceof Uint8Array
              ? new TextDecoder().decode(upstreamRes.data)
              : String(upstreamRes.data ?? '');
      return NextResponse.json(
        { error: errorText },
        { status: upstreamRes.status },
      );
    }

    const mp3Bytes =
      upstreamRes.data instanceof ArrayBuffer
        ? new Uint8Array(upstreamRes.data)
        : Buffer.isBuffer(upstreamRes.data)
          ? new Uint8Array(upstreamRes.data)
          : upstreamRes.data instanceof Uint8Array
            ? upstreamRes.data
            : typeof upstreamRes.data === 'string'
              ? new TextEncoder().encode(upstreamRes.data)
              : new Uint8Array();

    if (mp3Bytes.byteLength <= 0) {
      return NextResponse.json(
        { error: 'TTS 응답이 비어있습니다.' },
        { status: 502 },
      );
    }

    const body = Buffer.from(mp3Bytes);

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('TTS 서버 에러:', error);
    return NextResponse.json({ error: '서버 에러 발생' }, { status: 500 });
  }
}
