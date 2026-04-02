import { NextRequest, NextResponse } from 'next/server';

import {
  fishAudioRequest,
  getFishAudioApiKeyOrResponse,
} from '@/src/server/fishAudio';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const apiKeyResult = getFishAudioApiKeyOrResponse();
  if (!apiKeyResult.ok) return apiKeyResult.response;
  const { apiKey } = apiKeyResult;

  const { id } = await context.params;
  const upstreamRes = await fishAudioRequest(apiKey, {
    method: 'GET',
    url: `/model/${encodeURIComponent(id)}`,
    responseType: 'text',
  });

  const text =
    typeof upstreamRes.data === 'string'
      ? upstreamRes.data
      : JSON.stringify(upstreamRes.data);

  if (upstreamRes.status < 200 || upstreamRes.status >= 300) {
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const apiKeyResult = getFishAudioApiKeyOrResponse();
  if (!apiKeyResult.ok) return apiKeyResult.response;
  const { apiKey } = apiKeyResult;

  const { id } = await context.params;
  const contentType = req.headers.get('content-type') || '';

  const isMultipart = contentType.toLowerCase().includes('multipart/form-data');
  const requestInit: RequestInit = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };

  if (isMultipart) {
    const formData = await req.formData();
    requestInit.body = formData;
  } else {
    const body = await req.json();
    (requestInit.headers as Record<string, string>)['Content-Type'] =
      'application/json';
    requestInit.body = JSON.stringify(body);
  }

  const upstreamRes = await fishAudioRequest(apiKey, {
    method: 'PATCH',
    url: `/model/${encodeURIComponent(id)}`,
    headers: requestInit.headers as Record<string, string>,
    data: requestInit.body,
    responseType: 'text',
  });

  const text =
    typeof upstreamRes.data === 'string'
      ? upstreamRes.data
      : JSON.stringify(upstreamRes.data);

  if (upstreamRes.status < 200 || upstreamRes.status >= 300) {
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
