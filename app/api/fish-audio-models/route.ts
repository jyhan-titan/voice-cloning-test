import { NextRequest, NextResponse } from 'next/server';

import {
  fishAudioRequest,
  getFishAudioApiKeyOrResponse,
} from '@/src/server/fishAudio';
import { buildQueryString } from '@/src/utils/queryString';

export const runtime = 'nodejs';

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
  const apiKeyResult = getFishAudioApiKeyOrResponse();
  if (!apiKeyResult.ok) return apiKeyResult.response;
  const { apiKey } = apiKeyResult;

  const url = new URL(req.url);
  const pageSize = url.searchParams.get('page_size') ?? '5';
  const pageNumber = url.searchParams.get('page_number') ?? '1';
  const self = url.searchParams.get('self');

  // Pass-through mode: /api/fish-audio-models?self=true|false
  if (self === 'true' || self === 'false') {
    const upstreamQueryString = buildQueryString({
      page_size: pageSize,
      page_number: pageNumber,
      self: self === 'true' ? true : undefined,
      sort_by: self === 'true' ? 'created_at' : undefined,
    });

    const upstreamRes = await fishAudioRequest(apiKey, {
      method: 'GET',
      url: `/model?${upstreamQueryString}`,
      responseType: 'text',
    });

    const upstreamText =
      typeof upstreamRes.data === 'string'
        ? upstreamRes.data
        : JSON.stringify(upstreamRes.data);

    if (upstreamRes.status < 200 || upstreamRes.status >= 300) {
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

  const selfQueryString = buildQueryString({
    self: true,
    sort_by: 'created_at',
    page_size: pageSize,
    page_number: pageNumber,
  });

  const selfRes = await fishAudioRequest(apiKey, {
    method: 'GET',
    url: `/model?${selfQueryString}`,
    responseType: 'text',
  });

  const selfText =
    typeof selfRes.data === 'string'
      ? selfRes.data
      : JSON.stringify(selfRes.data);

  if (selfRes.status < 200 || selfRes.status >= 300) {
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
