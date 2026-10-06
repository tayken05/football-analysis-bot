import "server-only";

const ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4";

type QueryParameters = Record<string, string | number | boolean>;

export async function oddsApiFetch(
  endpoint: string,
  queryParameters?: QueryParameters,
): Promise<unknown> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey?.trim()) {
    throw new Error("ODDS_API_KEY is missing. Set it in the server environment.");
  }

  const url = new URL(endpoint.replace(/^\/+/, ""), `${ODDS_API_BASE_URL}/`);

  if (
    url.origin !== "https://api.the-odds-api.com" ||
    !url.pathname.startsWith("/v4/") ||
    url.username ||
    url.password
  ) {
    throw new Error("The Odds API endpoint must use the configured API base URL.");
  }

  for (const [name, value] of Object.entries(queryParameters ?? {})) {
    url.searchParams.set(name, String(value));
  }

  // Always use the server key, overriding any caller-supplied apiKey.
  url.searchParams.set("apiKey", apiKey);

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    // Native fetch errors may contain the authenticated request URL.
    throw new Error("The Odds API request failed due to a network or redirect error.");
  }

  if (!response.ok) {
    throw new Error(`The Odds API request failed: HTTP ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("The Odds API returned an invalid JSON response.");
  }
}
