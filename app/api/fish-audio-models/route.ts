import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getApiKey() {
  return process.env.FISH_AUDIO_API_KEY;
}

type ModelItem = {
  _id?: string;
  title?: string;
  description?: string;
  visibility?: 'public' | 'unlist' | 'private';
  tags?: string[];
  cover_image?: string;
  author?: { _id?: string; nickname?: string };
};

type ListModelsResponse = {
  total?: number;
  items?: ModelItem[];
};

export async function GET(req: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing FISH_AUDIO_API_KEY' },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const pageSize = url.searchParams.get('page_size') ?? '5';
  const pageNumber = url.searchParams.get('page_number') ?? '1';
  const self = url.searchParams.get('self');

  const baseUrl = 'https://api.fish.audio/model';

  // Pass-through mode: /api/fish-audio-models?self=true|false
  if (self === 'true' || self === 'false') {
    const upstreamUrl = new URL(baseUrl);
    upstreamUrl.searchParams.set('page_size', pageSize);
    upstreamUrl.searchParams.set('page_number', pageNumber);
    if (self === 'true') upstreamUrl.searchParams.set('self', 'true');
    if (self === 'true') upstreamUrl.searchParams.set('sort_by', 'created_at');

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const upstreamText = await upstreamRes.text();
    if (!upstreamRes.ok) {
      return new NextResponse(upstreamText, {
        status: upstreamRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const upstreamData = JSON.parse(upstreamText) as ListModelsResponse;
    return NextResponse.json(
      {
        total: upstreamData.total ?? 0,
        items: Array.isArray(upstreamData.items) ? upstreamData.items : [],
      },
      { status: 200 },
    );
  }

  const selfRes = await fetch(
    `${baseUrl}?self=true&sort_by=created_at&page_size=${encodeURIComponent(pageSize)}&page_number=${encodeURIComponent(pageNumber)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  const selfText = await selfRes.text();

  if (!selfRes.ok) {
    return new NextResponse(selfText, {
      status: selfRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const selfData = JSON.parse(selfText) as ListModelsResponse;
  const customItems = Array.isArray(selfData.items) ? selfData.items : [];

  /*
  const allText = await allRes.text();

  const selfText = await selfRes.text();

  if (!allRes.ok) {
    return new NextResponse(allText, { status: allRes.status, headers: { 'Content-Type': 'application/json' } });
  }
  if (!selfRes.ok) {
    return new NextResponse(selfText, { status: selfRes.status, headers: { 'Content-Type': 'application/json' } });
  }

  const allData = JSON.parse(allText) as ListModelsResponse;
  const selfData = JSON.parse(selfText) as ListModelsResponse;

  const customItems = Array.isArray(selfData.items) ? selfData.items : [];
  const allItems = Array.isArray(allData.items) ? allData.items : [];
  const customIds = new Set(customItems.map((m) => m._id).filter(Boolean) as string[]);
  const defaultItems = allItems.filter((m) => (m._id ? !customIds.has(m._id) : true));
  */

  return NextResponse.json(
    {
      custom: {
        total: selfData.total ?? customItems.length,
        items: customItems,
      },
      defaults: { total: 0, items: [] },
    },
    { status: 200 },
  );
}
