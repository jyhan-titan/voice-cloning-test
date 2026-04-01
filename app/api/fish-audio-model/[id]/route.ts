import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getApiKey() {
  return process.env.FISH_AUDIO_API_KEY;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing FISH_AUDIO_API_KEY' },
      { status: 500 },
    );
  }

  const { id } = await context.params;
  const response = await fetch(
    `https://api.fish.audio/model/${encodeURIComponent(id)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  const text = await response.text();
  if (!response.ok) {
    return new NextResponse(text, {
      status: response.status,
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
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing FISH_AUDIO_API_KEY' },
      { status: 500 },
    );
  }

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

  const response = await fetch(
    `https://api.fish.audio/model/${encodeURIComponent(id)}`,
    requestInit,
  );

  const text = await response.text();
  if (!response.ok) {
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
