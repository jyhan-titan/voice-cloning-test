import { NextRequest, NextResponse } from 'next/server';

import { getContentByIdSync, updateContentByIdSync } from '@/src/api/content';
import type { TiptapNode } from '@/src/utils/voice';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const item = getContentByIdSync(ctx.params.id);
    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const body = await req.json();

    const patch: { title?: string; nodes?: unknown } = body ?? {};
    const nodes = Array.isArray(patch.nodes) ? (patch.nodes as TiptapNode[]) : undefined;
    const next = updateContentByIdSync(ctx.params.id, {
      ...(typeof patch.title === 'string' ? { title: patch.title } : {}),
      ...(nodes ? { nodes } : {}),
    });

    return NextResponse.json(next);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed' },
      { status: 400 }
    );
  }
}
