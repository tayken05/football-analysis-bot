import "server-only";

import { z } from "zod";

const telegramResponseSchema = z.object({
  ok: z.boolean(),
  error_code: z.number().int().optional(),
});

export async function telegramApiFetch(
  method: string,
  parameters?: Record<string, unknown>,
): Promise<unknown> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken?.trim()) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing. Set it in the server environment.");
  }

  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(method)) {
    throw new Error("Telegram API method must be a valid method name.");
  }

  const baseUrl = `https://api.telegram.org/bot${encodeURIComponent(botToken)}/`;
  const url = new URL(method, baseUrl);
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parameters ?? {}),
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    // Do not propagate native errors that could contain the token-bearing URL.
    throw new Error("Telegram API request failed due to a network or redirect error.");
  }

  if (!response.ok) {
    throw new Error(`Telegram API request failed: HTTP ${response.status}.`);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("Telegram API returned an invalid JSON response.");
  }

  const result = telegramResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Telegram API returned an invalid response envelope.");
  }

  if (!result.data.ok) {
    const code = result.data.error_code;
    throw new Error(
      `Telegram API rejected the request${code !== undefined ? ` (error code ${code})` : ""}.`,
    );
  }

  return data;
}

export async function sendTelegramMessage(text: string): Promise<unknown> {
  const chatId = process.env.TELEGRAM_DEFAULT_CHAT_ID;

  if (!chatId?.trim()) {
    throw new Error("TELEGRAM_DEFAULT_CHAT_ID is missing. Set it in the server environment.");
  }

  return telegramApiFetch("sendMessage", {
    chat_id: chatId,
    text,
  });
}
