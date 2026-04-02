import { NextResponse } from 'next/server';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

type ApiKeyResult =
  | { ok: true; apiKey: string }
  | { ok: false; response: NextResponse };

export const FISH_AUDIO_API_BASE_URL = 'https://api.fish.audio';

export function fishAudioUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${FISH_AUDIO_API_BASE_URL}${normalizedPath}`;
}

export function createFishAudioAxiosClient(apiKey: string): AxiosInstance {
  return axios.create({
    baseURL: FISH_AUDIO_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    // Make response handling explicit in route handlers (like fetch)
    validateStatus: () => true,
  });
}

export async function fishAudioRequest(
  apiKey: string,
  config: AxiosRequestConfig,
) {
  const client = createFishAudioAxiosClient(apiKey);
  return client.request(config);
}

export function getFishAudioApiKeyOrResponse(): ApiKeyResult {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing FISH_AUDIO_API_KEY' },
        { status: 500 },
      ),
    };
  }

  return { ok: true, apiKey };
}
