---
status: planning — approach confirmed (hybrid), not yet implemented
name: AI Intake Chat — Image Upload
description: Let a client attach a reference photo/screenshot directly in the intake chat so the model (Gemini vision) actually looks at it, instead of the current "Share a reference screenshot" quick action just sending canned text with no real attachment.
relatesTo: ai-intake-chat.md
---

# AI Intake Chat — Image Upload (Plan)

## Current State
`quickActions` in `IntakeHero.tsx` has an `aiIntake.optionScreenshot` button that only sends the text "I'd like to share a reference screenshot of a design I like." — there is no file picker, no attachment, no image ever reaches the model. This plan replaces that with a real upload path.

## Goal
Client picks/drops an image in the chat, it renders as an attachment on their bubble, and the model actually sees it (Gemini 3.5/3.1/2.5 — every model in `src/lib/ai-models.ts` — supports image input natively, no model change needed). The model should describe/react to what it sees and fold it into the `references` field like any other answer.

**Non-goal for v1:** the model does not generate or edit images — same guardrail as today, just now with real visual input instead of none.

## Decision: Hybrid (Confirmed)
Two options were weighed:
- **A — full vision**: model reasons about the image on every turn it's in history. Best UX, worst quota cost (image resent + re-tokenized every turn — see below).
- **B — email-only, AI blind**: image never reaches the model, just rides along to Iza's inbox. Cheapest, but the chat stops feeling like a real conversation right at the moment a client shows a reference — contradicts this feature's whole "guided conversation, not a form" premise (see `ai-intake-chat.md`'s "Why a Real Chat, Not a Form").

**Chosen: hybrid.** Model sees and reacts to the image exactly once — the turn it's sent — writes that reaction into `references`, then the raw image is pruned from what's replayed to the model on later turns (text description stays, pixels don't). The original image itself still reaches Iza's inbox via the brief email (Phase 2 below), so nothing is lost — the client gets a smart in-the-moment reaction, the quota only pays for one vision call per image, and Iza still sees the real photo, not just a paraphrase.

## Why This Is Not Just "add a file input"
`/api/intake` sends the **full message history** to the model on every turn (`convertToModelMessages(messages)`, `route.ts:100`) — nothing is summarized or pruned yet. A raw image is far heavier than text: if it rides along unchanged in every subsequent turn's payload, one photo shared early in a 10-turn conversation gets re-uploaded and re-tokenized 10 times, burning shared free-tier quota fast (this project explicitly runs on Gemini's free tier across all visitors — see "Gemini Free-Tier Considerations" in `ai-intake-chat.md`). Client-side compression and server-side pruning (below) both exist specifically to bound this.

## Client-Side Changes (`IntakeHero.tsx`)

1. **Attachment affordance.** Add a paperclip/image icon button next to the composer's send button (both the intro textarea and the post-start composer). Clicking opens a native `<input type="file" accept="image/*">`. Repurpose `optionScreenshot`'s quick action to trigger this picker directly instead of sending a canned sentence.
2. **Client-side compression before attaching** — canvas resize to a max dimension (~1280px longest side) + re-encode as JPEG (~0.75 quality). Reject non-image MIME types and anything absurdly large pre-compression (e.g. >15MB) with an inline error, not a silent failure. This keeps the outgoing payload small regardless of what the client's phone camera actually produced.
3. **Preview + remove before send.** Selected image shows as a small thumbnail chip above the composer (with an ×) before the message is sent — matches the existing "extras" chip pattern already used in `ChecklistCard`.
4. **Sending.** AI SDK v5's `useChat().sendMessage` already accepts `{ text, files: FileUIPart[] }` (confirmed in `node_modules/ai` — `files?: FileList | FileUIPart[]`, `ai:5599-5610`). Build one `FileUIPart` (`{ type: "file", mediaType, url: dataUrl, filename }`) from the compressed image and pass it alongside any typed caption text. No custom encoding/base64 plumbing needed beyond what canvas `toDataURL()` already gives.
5. **Cap:** one image per message, and document a soft cap (e.g. 3 images per conversation) — enforced client-side by disabling the attach button past the cap, with a short inline note why.
6. **Render attachments in bubbles.** `renderBubble()` currently only reads text parts (`messageText()`). Extend it to also pull `FileUIPart`s off `m.parts` (`part.type === "file"`) and render a thumbnail `<img>` inside the user's bubble.

## Server-Side Changes (`/api/intake/route.ts`)

1. **No model/provider change** — Gemini already accepts image parts once `convertToModelMessages` runs; today's route already calls that unmodified.
2. **Prune stale images before the model call** — this is the load-bearing fix for the quota problem above. Before `convertToModelMessages(messages)`, walk every message *except the latest one* and replace any `file` part with a short text stand-in (e.g. `[client shared an image earlier — see the model's own prior description in this conversation]`) rather than resending the binary. The latest message's image (if any) is left intact so the model actually sees whatever was just attached. This mirrors the "summarize earlier turns" idea already flagged as deferred future work in `ai-intake-chat.md`, scoped down to just images since those are the expensive part.
3. No storage/bucket needed for v1 — the data URL lives only in the request payload and the client's in-memory `messages` state (same as today, nothing persists to `localStorage` beyond the abuse-lockout state).

## System Prompt Changes (`intake-prompt.ts`)

Add explicit instructions for the image case:
- When an image is attached, acknowledge and briefly describe what's visible (style, layout, colors — whatever's relevant to scoping) in the same turn, then fold that description into the `references` field the same way a pasted link or gallery pick already works.
- Never claim it can't see the image (all configured models support vision — this must not become a silent capability gap the model apologizes around).
- Keep the existing off-topic/scope guardrails: if the image is unrelated to a website reference (e.g. a random photo), redirect warmly back to intake, same tone as the existing off-topic guardrail.

## Brief / Email Handling (`/api/send-brief/route.ts`)

**v1 scope:** the image itself is not forwarded to Iza's email — only the model's text description ends up in the `references` field, same shape as today's gallery-pick/link references. This avoids adding attachment/inline-image plumbing to `send-brief` before the core upload flow is proven out.

**Phase 2 (explicitly deferred):** attach the actual compressed image to the brief email via `nodemailer`'s `attachments` (base64 buffer, inline `cid:` reference in the HTML body) so Iza can see the original, not just a text description. Needs the image to survive from the chat turn through to `latestBrief` — either re-threaded through `transcript`/`brief` payloads or (cleaner) stored in a small state slice keyed by message id, separate from the pruning done for the model call above (pruning only affects what's *replayed to the model*, not what the client still holds for the email step).

## Open Questions (resolve before implementation)
- Exact soft cap on images per conversation (proposed: 3) and whether exceeding it should block or just stop attaching further images to the model context.
- Whether to support paste-from-clipboard (common for screenshots) in addition to the file picker — likely a cheap add (`onPaste` on the textarea checking `e.clipboardData.files`) but not required for v1.
- HEIC (iPhone default format) — canvas re-encoding requires the browser to decode it first, which not all browsers do reliably. Decide whether to detect and reject HEIC with a friendly "please share as JPEG/PNG" hint, or pull in a conversion library.

## Rollout
1. Client picker + compression + preview + send (image reaches the model, gets described, folds into `references`).
2. Server-side pruning of stale images from replayed history.
3. Bubble rendering of attachments in the transcript.
4. System prompt updates + guardrail testing (off-topic images, repeated images, abuse case).
5. Phase 2: email attachment forwarding.

Once implemented, fold the shipped behavior back into `ai-intake-chat.md` (guardrails, quick actions, extractedFields sections) per this repo's usual doc convention — this file stays a planning doc, not living documentation.
