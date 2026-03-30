export type ApiError = {
  status: number;
  message: string;
};

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw {
      status: res.status,
      message: text || res.statusText,
    } satisfies ApiError;
  }

  return (await res.json()) as T;
}
