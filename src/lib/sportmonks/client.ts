import "server-only";

const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";

type QueryParameters = Record<string, string | number | boolean>;

export async function sportmonksFetch(
  endpoint: string,
  queryParameters?: QueryParameters,
): Promise<unknown> {
  const apiToken = process.env.SPORTMONKS_API_KEY;

  if (!apiToken?.trim()) {
    throw new Error("SPORTMONKS_API_KEY is missing. Set it in the server environment.");
  }

  // Resolve leading slashes within the Football API base path.
  const url = new URL(endpoint.replace(/^\/+/, ""), `${SPORTMONKS_BASE_URL}/`);

  if (
    url.origin !== "https://api.sportmonks.com" ||
    !url.pathname.startsWith("/v3/football/") ||
    url.username ||
    url.password
  ) {
    throw new Error("Sportmonks endpoint must use the configured Football API base URL.");
  }

  for (const [name, value] of Object.entries(queryParameters ?? {})) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: apiToken,
    },
    cache: "no-store",
    redirect: "error",
  });

  if (!response.ok) {
    throw new Error(`Sportmonks request failed: HTTP ${response.status}.`);
  }

  return response.json();
}
