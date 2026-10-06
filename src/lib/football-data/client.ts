import "server-only";

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

type QueryParameters = Record<string, string | number | boolean>;

export async function footballDataFetch(
  endpoint: string,
  queryParameters?: QueryParameters,
): Promise<unknown> {
  const apiToken = process.env.FOOTBALL_DATA_KEY;

  if (!apiToken?.trim()) {
    throw new Error("FOOTBALL_DATA_KEY is missing. Set it in the server environment.");
  }

  // Resolve leading slashes within /v4 rather than at the host root.
  const url = new URL(endpoint.replace(/^\/+/, ""), `${FOOTBALL_DATA_BASE_URL}/`);

  if (
    url.origin !== "https://api.football-data.org" ||
    !url.pathname.startsWith("/v4/") ||
    url.username ||
    url.password
  ) {
    throw new Error("football-data.org endpoint must use the configured API base URL.");
  }

  for (const [name, value] of Object.entries(queryParameters ?? {})) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: {
      "X-Auth-Token": apiToken,
    },
    cache: "no-store",
    redirect: "error",
  });

  if (!response.ok) {
    throw new Error(
      `football-data.org request failed: HTTP ${response.status} ${response.statusText}`.trim(),
    );
  }

  return response.json();
}
