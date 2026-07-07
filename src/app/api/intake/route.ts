import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { INTAKE_SYSTEM_PROMPT } from "@/lib/intake-prompt";
import { AUTO_FALLBACK_ORDER, isModelId, type ModelChoice, type ModelId } from "@/lib/ai-models";

export const maxDuration = 30;
// Google's Generative Language API (the AI Studio key this route uses, not
// Vertex AI) only allows requests from a limited set of countries — notably
// excluding Hong Kong/China, but Singapore is on the supported list and sits
// far closer to Indonesian visitors than US East. Pin here (and set the
// matching Function Region in Vercel's dashboard — that's what actually
// governs a Node.js serverless function's region, not this export alone).
export const preferredRegion = ["sin1"];

// GEMINI_API_KEY holds one or more comma-separated keys — one per Google
// account. Each account has its own free-tier quota, so racing across
// accounts (not just models) multiplies how much traffic "auto" can absorb
// before a client ever sees a rate-limited message.
function getApiKeys(): string[] {
  return (process.env.GEMINI_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

type PeekedStream = {
  buffered: UIMessageChunk[];
  reader: ReadableStreamDefaultReader<UIMessageChunk>;
};

// Runs one (account, model) combo and peeks its stream's leading chunks
// before declaring it a winner: "start"/"start-step" are always emitted
// first regardless of outcome, then either a real content chunk (success)
// or an "error" chunk (failure). Buffered chunks get replayed into the
// client-facing stream on a win, so no output is lost.
async function attempt(
  google: ReturnType<typeof createGoogleGenerativeAI>,
  candidate: ModelId,
  system: string,
  messages: Awaited<ReturnType<typeof convertToModelMessages>>,
  signal: AbortSignal,
): Promise<PeekedStream> {
  let streamErr: unknown;
  const uiStream = streamText({
    model: google(candidate),
    system,
    messages,
    maxRetries: 0,
    abortSignal: signal,
  }).toUIMessageStream({
    onError: (err) => {
      streamErr = err;
      return err instanceof Error ? err.message : "An error occurred.";
    },
    // Rides along on the "start" chunk (buffered/replayed below regardless of
    // win/loss) so the client learns which candidate actually answered —
    // lets it pin that model first on the next turn instead of re-racing
    // AUTO_FALLBACK_ORDER from the top every single message.
    messageMetadata: () => ({ model: candidate }),
  });

  const reader = uiStream.getReader();
  const buffered: UIMessageChunk[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered.push(value);
    if (value.type === "error") throw streamErr;
    if (value.type !== "start" && value.type !== "start-step") break;
  }
  return { buffered, reader };
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
  const {
    messages,
    model: requestedModel,
    preferredModel,
  }: { messages: UIMessage[]; model?: ModelChoice; preferredModel?: ModelId } = await req.json();

  const modelMessages = await convertToModelMessages(messages);
  const system = INTAKE_SYSTEM_PROMPT;

  // Explicit model choice: locked to that model, but still races accounts —
  // the client picked the model deliberately, not the account behind it.
  // "Auto" + a `preferredModel` (the model that won last turn, per the
  // `messageMetadata` on the "start" chunk below): try that one first, but
  // keep the rest of the chain as fallback rather than locking to it — if
  // the previous winner is out of quota now, fall through same as ever.
  const candidateModels: ModelId[] =
    requestedModel && requestedModel !== "auto" && isModelId(requestedModel)
      ? [requestedModel]
      : preferredModel && isModelId(preferredModel)
        ? [preferredModel, ...AUTO_FALLBACK_ORDER.filter((m) => m !== preferredModel)]
        : [...AUTO_FALLBACK_ORDER];

  // Race accounts (independent quotas) in parallel, but walk models one
  // tier at a time — firing every (account, model) combo at once would put
  // up to `candidateModels.length` concurrent requests on the SAME key,
  // which trips Google's per-key concurrent-request limit and makes the
  // whole tier look quota-exhausted even when it isn't. Only fall through to
  // the next model once the entire current tier has failed on every account.
  let lastError: unknown;
  for (const candidate of candidateModels) {
    const controllers = clients.map(() => new AbortController());
    const race = clients.map((google, i) =>
      attempt(google, candidate, system, modelMessages, controllers[i].signal).then((result) => ({ i, result })),
    );

    let winner: { i: number; result: PeekedStream } | undefined;
    try {
      winner = await Promise.any(race);
    } catch (err) {
      const aggregate = err as AggregateError;
      lastError = aggregate.errors?.[aggregate.errors.length - 1] ?? err;
      continue;
    }

    for (const [i, controller] of controllers.entries()) {
      if (i !== winner.i) controller.abort();
    }

    const { buffered, reader } = winner.result;
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
