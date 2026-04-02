export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.append(key, String(value));
  }
  return searchParams.toString();
}
