import { NextResponse } from 'next/server';

import { listContentsSync } from '@/src/api/content';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(listContentsSync());
}
