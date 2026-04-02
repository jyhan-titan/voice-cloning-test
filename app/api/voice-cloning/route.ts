import { NextRequest, NextResponse } from 'next/server';

import {
  fishAudioRequest,
  getFishAudioApiKeyOrResponse,
} from '@/src/server/fishAudio';

export async function POST(req: NextRequest) {
  try {
    const apiKeyResult = getFishAudioApiKeyOrResponse();
    if (!apiKeyResult.ok) return apiKeyResult.response;
    const { apiKey } = apiKeyResult;

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const modelTitle = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';
    const visibility = (formData.get('visibility') as string) || 'private';
    const enhanceAudioQuality =
      (formData.get('enhance_audio_quality') as string) || 'true';
    const tags = formData.getAll('tags').map(String).filter(Boolean);
    const coverImage = formData.get('cover_image');

    if (files.length === 0) {
      return NextResponse.json(
        { error: '음성 파일이 필요합니다.' },
        { status: 400 },
      );
    }

    if (!modelTitle.trim()) {
      return NextResponse.json(
        { error: '모델 이름(title)이 필요합니다.' },
        { status: 400 },
      );
    }

    // --- OpenAPI 명세에 맞춘 새로운 FormData 구성 ---
    const fishFormData = new FormData();

    // 1. 필수 필드 (Required)
    fishFormData.append('title', modelTitle); // 모델 이름
    fishFormData.append('type', 'tts'); // 고정값: tts
    fishFormData.append('train_mode', 'fast'); // 고정값: fast (즉시 사용 가능)

    // 2. 음성 파일들 (Voices) - 문서상 array of binary 지원
    files.forEach(file => {
      fishFormData.append('voices', file);
    });

    // 3. 선택 필드 (Optional)
    fishFormData.append('visibility', visibility);
    if (description) fishFormData.append('description', description);
    tags.forEach(t => fishFormData.append('tags', t));
    fishFormData.append('enhance_audio_quality', enhanceAudioQuality);
    if (coverImage instanceof File) {
      fishFormData.append('cover_image', coverImage);
    }

    const upstreamRes = await fishAudioRequest(apiKey, {
      method: 'POST',
      url: '/model',
      data: fishFormData,
      headers: {},
    });

    if (upstreamRes.status < 200 || upstreamRes.status >= 300) {
      return NextResponse.json(upstreamRes.data, {
        status: upstreamRes.status,
      });
    }

    const result = upstreamRes.data;

    return NextResponse.json({ id: result._id, ...result }, { status: 201 });
  } catch (error) {
    console.error('Cloning Error:', error);
    return NextResponse.json({ error: '서버 내부 에러' }, { status: 500 });
  }
}
