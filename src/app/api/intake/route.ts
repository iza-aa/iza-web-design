import {
  streamText,
  generateText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  APICallError,
  RetryError,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { INTAKE_SYSTEM_PROMPT } from "@/lib/intake-prompt";
import { AUTO_FALLBACK_ORDER, isModelId, type ModelChoice, type ModelId } from "@/lib/ai-models";

export const maxDuration = 30;

function isQuotaError(err: unknown): boolean {
  if (RetryError.isInstance(err)) {
    return err.errors.some(isQuotaError) || isQuotaError(err.lastError);
  }
  if (!APICallError.isInstance(err)) return false;
  if (err.statusCode === 429 || err.statusCode === 503) return true;
  return /quota|rate.?limit|resource.*exhaust/i.test(err.responseBody ?? err.message);
}

// GEMINI_API_KEY holds one or more comma-separated keys — one per Google
// account. Each account has its own free-tier quota, so cycling through
// accounts (not just models) multiplies how much traffic "auto" can absorb
// before a client ever sees a rate-limited message.
function getApiKeys(): string[] {
  return (process.env.GEMINI_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const apiKeys = getApiKeys();

  if (apiKeys.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "GEMINI_API_KEY isn't configured yet. Add it to .env.local (see .env.local.example) and restart the dev server.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const clients = apiKeys.map((apiKey) => createGoogleGenerativeAI({ apiKey }));
  const { messages, model: requestedModel }: { messages: UIMessage[]; model?: ModelChoice } = await req.json();

  const modelMessages = await convertToModelMessages(messages);
  const system = INTAKE_SYSTEM_PROMPT;

  // Explicit model choice: locked to that model, but still cycles accounts —
  // the client picked the model deliberately, not the account behind it.
  const candidateModels: ModelId[] =
    requestedModel && requestedModel !== "auto" && isModelId(requestedModel) ? [requestedModel] : [...AUTO_FALLBACK_ORDER];

  const combos = clients.flatMap((google) => candidateModels.map((candidate) => ({ google, candidate })));

  // maxRetries: 0 — our own (account × model) loop is the retry strategy, so a
  // single failed attempt per candidate should move on immediately instead of
  // the SDK's default 3x backoff burning more of that account's quota first.
  let lastError: unknown;
  for (const [i, { google, candidate }] of combos.entries()) {
    const isLastCombo = i === combos.length - 1;

    // Skip the ping when there's nowhere left to fall back to anyway (the
    // common single-key, single-model case pays zero extra latency for this).
    if (!isLastCombo) {
      try {
        await generateText({ model: google(candidate), prompt: "ping", maxOutputTokens: 1, maxRetries: 0 });
      } catch (err) {
        lastError = err;
        if (isQuotaError(err)) continue;
      }
    }

    // The ping above only proves the account/model can accept a request — a
    // free-tier quota can still be blown by the real (much larger) prompt
    // even when a 1-token ping just succeeded. So peek the real stream's
    // leading chunks before committing this Response to the client: "start"/
    // "start-step" are always emitted first regardless of outcome, then
    // either a real content chunk (success) or an "error" chunk (failure).
    // Buffered chunks get replayed into the client-facing stream either way,
    // so no output is lost — only the choice of which combo serves it changes.
    let streamErr: unknown;
    const uiStream = streamText({ model: google(candidate), system, messages: modelMessages, maxRetries: 0 }).toUIMessageStream({
      onError: (err) => {
        streamErr = err;
        return err instanceof Error ? err.message : "An error occurred.";
      },
    });
    const reader = uiStream.getReader();
    const buffered: UIMessageChunk[] = [];
    let failed = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered.push(value);
      if (value.type === "error") {
        failed = true;
        break;
      }
      if (value.type !== "start" && value.type !== "start-step") break;
    }

    if (failed) {
      lastError = streamErr;
      if (!isLastCombo && isQuotaError(streamErr)) continue;
      throw streamErr;
    }

    const rebuilt = new ReadableStream<UIMessageChunk>({
      start(controller) {
        for (const chunk of buffered) controller.enqueue(chunk);
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      },
    });
    return createUIMessageStreamResponse({ stream: rebuilt });
  }

  throw lastError;
}
