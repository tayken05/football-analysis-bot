import "server-only";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

type QueryParameters = Record<string, string | number | boolean>;

export async function apiFootballFetch(
  endpoint: string,
  queryParameters?: QueryParameters,
): Promise<unknown> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey?.trim()) {
    throw new Error("API_FOOTBALL_KEY is missing. Set it in the server environment.");
  }

  const url = new URL(endpoint, API_FOOTBALL_BASE_URL);

  // Keep the authentication header on the intended API host.
  if (url.origin !== API_FOOTBALL_BASE_URL || url.username || url.password) {
    throw new Error("API-Football endpoint must use the configured API host.");
  }

  for (const [name, value] of Object.entries(queryParameters ?? {})) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
    redirect: "error",
  });

  if (!response.ok) {
    throw new Error(
      `API-Football request failed: HTTP ${response.status} ${response.statusText}`.trim(),
    );
  }

  return response.json();
}
