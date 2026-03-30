import { BASIC_TEXT } from '@/src/constants/text_contents/basic_text';
import { BLOG_TEXT } from '@/src/constants/text_contents/blog_text';
import { NEWS_TEXT } from '@/src/constants/text_contents/news_text';
import { TiptapNode } from '@/src/utils/voice';
import { apiFetch } from './fetcher';

export type ContentItem = {
  id: string;
  title: string;
  nodes: TiptapNode[];  
  isAudiobook: boolean;
};

export type ListContentsResponse = {
  items: ContentItem[];
};

function normalizeId(id: string) {
  return id.trim();
}

let CONTENTS: ContentItem[] = [
  {
    id: '123',
    title: '시간의 틈새를 걷는 법: 우리가 놓쳐버린 평범한 순간들',
    nodes: BASIC_TEXT,
    isAudiobook: true,
  },
  {
    id: '456',
    title: '경제 리포트: 인공지능이 바꾸는 우리의 일상과 내일',
    nodes: NEWS_TEXT,
    isAudiobook: false,
  },
  {
    id: '789',
    title: '지친 나를 위한 작은 선물: 주말 숲 산책 가이드',
    nodes: BLOG_TEXT,
    isAudiobook: false,

  },
];

export function listContentsSync(): ListContentsResponse {
  return { items: CONTENTS };
}

export function getContentByIdSync(id: string): ContentItem {
  const normalized = normalizeId(id);
  const found = CONTENTS.find((c) => normalizeId(c.id) === normalized);
  if (!found) {
    throw new Error('Content not found');
  }
  return found;
}

export function updateContentByIdSync(id: string, patch: Partial<Pick<ContentItem, 'title' | 'nodes'>>): ContentItem {
  const normalized = normalizeId(id);
  const idx = CONTENTS.findIndex((c) => normalizeId(c.id) === normalized);
  if (idx === -1) {
    throw new Error('Content not found');
  }

  const current = CONTENTS[idx];
  const next: ContentItem = {
    ...current,
    ...patch,
    id: current.id,
  };

  CONTENTS = [...CONTENTS.slice(0, idx), next, ...CONTENTS.slice(idx + 1)];
  return next;
}

export async function listContents(): Promise<ListContentsResponse> {
  return { items: CONTENTS };
}

export async function getContentById(id: string): Promise<ContentItem> {
  const normalized = normalizeId(id);
  const found = CONTENTS.find((c) => normalizeId(c.id) === normalized);
  if (!found) {
    throw new Error('Content not found');
  }
  return found;
}

export async function fetchContents(): Promise<ListContentsResponse> {
  return apiFetch<ListContentsResponse>('/api/contents');
}

export async function fetchContentById(id: string): Promise<ContentItem> {
  return apiFetch<ContentItem>(`/api/contents/${encodeURIComponent(id)}`);
}

export async function patchContentById(
  id: string,
  patch: Partial<Pick<ContentItem, 'title' | 'nodes'>>
): Promise<ContentItem> {
  return apiFetch<ContentItem>(`/api/contents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
