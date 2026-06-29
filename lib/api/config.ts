let cachedApiUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;

  const res = await fetch("/api/config");
  const data = await res.json();
  cachedApiUrl = data.apiUrl;
  return cachedApiUrl!;
}