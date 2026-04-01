import { apiFetch } from './fetcher';

export type Audiobook = {
  id: string;
  title: string;
  contentId: string;
  audioUrl: string;
  createdAt: string;
};

export type ListAudiobooksResponse = {
  items: Audiobook[];
};

export type UploadRequest = {
  filename: string;
  contentType: string;
  size: number;
};

export type UploadResponse = {
  url: string;
};

export type CreateAudiobookRequest = {
  title: string;
  contentId: string;
  filename: string;
  size: number;
};

export type CreateAudiobookResponse = {
  id: string;
  title: string;
  contentId: string;
  createdAt: string;
};

export async function listAudiobooks(): Promise<ListAudiobooksResponse> {
  return apiFetch<ListAudiobooksResponse>('/api/audiobooks');
}

export async function uploadAudiobook(
  _file: Blob,
  meta: UploadRequest,
): Promise<UploadResponse> {
  return apiFetch<UploadResponse>('/api/upload', {
    method: 'POST',
    body: JSON.stringify(meta),
  });
}

export async function createAudiobook(
  req: CreateAudiobookRequest,
): Promise<CreateAudiobookResponse> {
  return apiFetch<CreateAudiobookResponse>('/api/audiobooks', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
