"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { scaleIn, easing, durations } from "@/lib/motion";
import type { DesignEntry } from "@/lib/design-gallery";

// Lazy — only visitors who click "browse gallery" pay for this modal's JS
// (gallery grid, live-preview iframe wiring, etc.), not every intake-widget load.
const ReferencePickerModal = dynamic(
  () => import("@/components/gallery/ReferencePickerModal").then((mod) => mod.ReferencePickerModal),
  { ssr: false },
);
import { WindowCard } from "@/components/ui/WindowCard";
import { OWNER_NAME } from "@/lib/intake-prompt";
import { glassCardStrong } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";
import { AI_MODELS, isModelId, modelLabel, type ModelChoice, type ModelId } from "@/lib/ai-models";
import { isAbusiveMessage } from "@/lib/abuse-filter";
import geminiIcon from "@/assets/logo/google-gemini.svg";
import emailIcon from "@/assets/logo/email.png";
import whatsappIcon from "@/assets/logo/whatsapp.png";
import instagramIcon from "@/assets/logo/instagram.png";
import wavingHandEmoji from "@/assets/emoji/waving-hand_1f44b.png";
import beamingFaceEmoji from "@/assets/emoji/beaming-face-with-smiling-eyes_1f601.png";
import callMeHandEmoji from "@/assets/emoji/call-me-hand_1f919.png";

const quickActions = [
  { labelKey: "aiIntake.optionScreenshot", prompt: "I'd like to share a reference screenshot of a design I like." },
  { labelKey: "aiIntake.optionLink", prompt: "I'd like to share a link to a site I like." },
  { labelKey: "aiIntake.optionNotSure", prompt: "I'm not sure yet what I need — can you help me explore?" },
];

const MODEL_CHOICES: ModelChoice[] = ["auto", ...AI_MODELS.map((m) => m.id)];

const headlineEmojis = [wavingHandEmoji, beamingFaceEmoji, callMeHandEmoji];

function RotatingHeadline({ variants }: { variants: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (variants.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % variants.length), 3200);
    return () => clearInterval(id);
  }, [variants.length]);

  return (
    <motion.div layout className="mt-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h2
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: durations.base, ease: easing.standard }}
          className="flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap font-display text-lg font-bold sm:gap-2 sm:text-2xl md:text-3xl"
        >
          {variants[index % variants.length]}
          <Image
            src={headlineEmojis[index % headlineEmojis.length]}
            alt=""
            width={28}
            height={28}
            className="h-5 w-5 shrink-0 sm:h-7 sm:w-7"
          />
        </motion.h2>
      </AnimatePresence>
    </motion.div>
  );
}

// Auto-playing loop (no interaction needed) so a bio-link visitor sees the
// whole "how this works" story play out in the first few seconds: the
// connecting line travels toward the next numbered dot first, and only once
// it actually arrives does that dot light up and its chat bubble pop in —
// the dot/bubble are a *consequence* of the line reaching them, not
// simultaneous with the line still animating.
const TRAVEL_MS = 900;
const HOLD_MS = 1600;

function HowItWorksLoop({ steps }: { steps: string[] }) {
  const [index, setIndex] = useState(0);
  const [arrived, setArrived] = useState(true);
  const [lap, setLap] = useState(0);
  // Left-aligned for the first step, right-aligned for the last, so the
  // bubble never clips past the track's own edges on narrow screens —
  // only the middle step can safely center on its segment. The tail
  // (below) is anchored independently, near whichever edge sits closest
  // to that step's actual point on the bar, so it still reads as
  // "pointing at" the right numbered dot even though the bubble itself
  // is edge-aligned rather than centered on it.
  const bubbleAlign = ["left-0", "left-1/2 -translate-x-1/2", "right-0"];
  const tailAlign = ["left-4", "left-1/2 -translate-x-1/2", "right-4"];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function step(currentIndex: number, currentArrived: boolean) {
      timeoutId = setTimeout(
        () => {
          if (!currentArrived) {
            // Line just finished traveling — the dot/bubble light up now.
            setArrived(true);
            step(currentIndex, true);
            return;
          }
          const next = (currentIndex + 1) % steps.length;
          if (next === 0) {
            // Loop restart: snap straight back to point 1, nothing to travel across.
            setLap((l) => l + 1);
            setIndex(0);
            setArrived(true);
            step(0, true);
          } else {
            setIndex(next);
            setArrived(false);
            step(next, false);
          }
        },
        currentArrived ? HOLD_MS : TRAVEL_MS,
      );
    }

    step(0, true);
    return () => clearTimeout(timeoutId);
  }, [steps.length]);

  return (
    <div className="mx-auto mt-4 w-full max-w-112">
      <div className="relative h-10">
        <AnimatePresence mode="wait">
          {arrived && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              transition={{ duration: 0.25, ease: easing.standard }}
              className={`absolute bottom-2 max-w-45 rounded-2xl border border-border-subtle bg-(--glass-input-bg) px-3 py-1.5 text-left text-[11px] leading-snug text-on-surface shadow-sm ${bubbleAlign[index]}`}
            >
              {steps[index]}
              {/* Tail: a rotated square clipped to its bottom-right border,
                  sitting half outside the bubble so it reads as a chat-bubble
                  pointer aimed down at the dot below. */}
              <span
                className={`absolute -bottom-1.25 h-2.5 w-2.5 rotate-45 border-r border-b border-border-subtle bg-(--glass-input-bg) ${tailAlign[index]}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Classic stepper: numbered dot — connecting line — numbered dot —
          connecting line — numbered dot, all one row (`1 ---- 2 ---- 3`).
          The number itself sits on the line, not a separate row above/below. */}
      <div className="flex items-center">
        {steps.map((_, i) => {
          const reached = i < index || (i === index && arrived);
          return (
            <div key={i} className="flex items-center" style={{ flex: i === steps.length - 1 ? "0 0 auto" : "1 1 0%" }}>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors ${
                  reached
                    ? "border-primary bg-primary text-primary-contrast"
                    : "border-border-subtle bg-(--glass-input-bg) text-secondary"
                }`}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <div className="mx-1.5 h-1 flex-1 overflow-hidden rounded-full bg-border-subtle">
                  {index > i + 1 || (index === i + 1 && arrived) ? (
                    <div className="h-full w-full rounded-full bg-primary" />
                  ) : index === i + 1 && !arrived ? (
                    <motion.div
                      key={`${lap}-${i}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: TRAVEL_MS / 1000, ease: "linear" }}
                      className="relative h-full rounded-full bg-primary shadow-[0_0_10px_2px_var(--color-primary)]"
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary blur-[3px]"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModelPicker({ value, onChange }: { value: ModelChoice; onChange: (v: ModelChoice) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-1 text-xs text-secondary transition-colors hover:border-primary hover:text-on-surface"
      >
        {value !== "auto" && <Image src={geminiIcon} alt="" width={14} height={14} />}
        {modelLabel(value)}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px]">
          &#9662;
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: easing.standard }}
            className={`absolute bottom-full left-0 z-10 mb-2 w-44 overflow-hidden rounded-lg p-1 ${glassCardStrong}`}
          >
            {MODEL_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  onChange(choice);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                  choice === value
                    ? "bg-primary text-primary-contrast"
                    : "text-secondary hover:bg-(--glass-bg) hover:text-on-surface"
                }`}
              >
                {choice !== "auto" && <Image src={geminiIcon} alt="" width={14} height={14} />}
                {modelLabel(choice)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({
  prompt,
  options,
  onAnswer,
  typeOwnLabel,
  extraAction,
}: {
  prompt: string;
  options: string[];
  onAnswer: (text: string) => void;
  typeOwnLabel: string;
  extraAction?: { label: string; onClick: () => void };
}) {
  const [customText, setCustomText] = useState("");

  function submitCustom() {
    const trimmed = customText.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setCustomText("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: easing.standard }}
      className="overflow-hidden rounded-xl border border-border-subtle bg-(--glass-input-bg)"
    >
      <p className="px-4 pb-3 pt-4 text-sm font-semibold text-on-surface">{prompt}</p>
      <div className="divide-y divide-border-subtle border-t border-border-subtle">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => onAnswer(opt)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-on-surface transition-colors hover:bg-(--glass-bg)"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle text-xs text-secondary">
              {i + 1}
            </span>
            {opt}
          </button>
        ))}
        {extraAction && (
          <button
            type="button"
            onClick={extraAction.onClick}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-secondary transition-colors hover:bg-(--glass-bg) hover:text-on-surface"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle text-xs">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            {extraAction.label}
          </button>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle text-xs text-secondary">
            &#9998;
          </span>
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCustom();
            }}
            placeholder={typeOwnLabel}
            className="flex-1 bg-transparent text-base text-on-surface placeholder:text-secondary focus:outline-none md:text-sm"
          />
          <button
            type="button"
            onClick={submitCustom}
            disabled={!customText.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-on-surface text-surface disabled:opacity-40"
          >
            &uarr;
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ChecklistCard({
  prompt,
  options,
  onAnswer,
  addLabel,
  t,
}: {
  prompt: string;
  options: string[];
  onAnswer: (text: string) => void;
  addLabel: string;
  t: (path: string) => string;
}) {
  // Indices, not the label strings themselves — two rate-card items (or a
  // model-generated checklist) could share identical text, and keying off
  // the string would toggle both/collapse them into one Set entry.
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [extras, setExtras] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function addExtra() {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setExtras((prev) => [...prev, trimmed]);
    setCustomText("");
  }

  function removeExtra(i: number) {
    setExtras((prev) => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    const selected = options.filter((_, i) => checked.has(i));
    const parts: string[] = [];
    if (selected.length > 0) parts.push(`${t("aiIntake.checklistSelectedPrefix")} ${selected.join(", ")}`);
    if (extras.length > 0) parts.push(`${t("aiIntake.checklistExtraPrefix")} ${extras.join(", ")}`);
    onAnswer(parts.length > 0 ? parts.join(". ") : t("aiIntake.checklistNoneAnswer"));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: easing.standard }}
      className="overflow-hidden rounded-xl border border-border-subtle bg-(--glass-input-bg)"
    >
      <p className="px-4 pb-3 pt-4 text-sm font-semibold text-on-surface">{prompt}</p>
      <div className="divide-y divide-border-subtle border-t border-border-subtle">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-on-surface transition-colors hover:bg-(--glass-bg)"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                checked.has(i)
                  ? "border-primary bg-primary text-primary-contrast"
                  : "border-border-subtle text-transparent"
              }`}
            >
              &#10003;
            </span>
            {opt}
          </button>
        ))}
      </div>
      {extras.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle px-4 py-3">
          {extras.map((extra, i) => (
            <button
              key={`${extra}-${i}`}
              type="button"
              onClick={() => removeExtra(i)}
              className="flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1 text-xs text-on-surface hover:border-primary"
            >
              {extra}
              <span className="text-secondary">&times;</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle text-xs text-secondary">
          &#9998;
        </span>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addExtra();
          }}
          placeholder={addLabel}
          className="flex-1 bg-transparent text-base text-on-surface placeholder:text-secondary focus:outline-none md:text-sm"
        />
        <button
          type="button"
          onClick={addExtra}
          disabled={!customText.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle text-sm text-on-surface disabled:opacity-40"
        >
          +
        </button>
      </div>
      <div className="flex justify-end border-t border-border-subtle px-4 py-3">
        <button
          type="button"
          onClick={submit}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-surface"
        >
          &uarr;
        </button>
      </div>
    </motion.div>
  );
}

const CONTACT_METHODS = [
  { key: "email", icon: emailIcon },
  { key: "whatsapp", icon: whatsappIcon },
  { key: "instagram", icon: instagramIcon },
] as const;
type ContactMethod = (typeof CONTACT_METHODS)[number]["key"];

function isValidContact(method: ContactMethod, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (method === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (method === "whatsapp") return /^\+?[0-9][0-9\s-]{7,14}$/.test(trimmed);
  if (method === "instagram") return trimmed.startsWith("@") && trimmed.length > 1;
  return true;
}

function ContactCard({
  prompt,
  onAnswer,
  nameLabel,
  t,
}: {
  prompt: string;
  onAnswer: (text: string) => void;
  nameLabel: string;
  t: (path: string) => string;
}) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<ContactMethod | null>(null);
  const [contact, setContact] = useState("");
  const contactValid = method !== null && isValidContact(method, contact);
  const showInvalidHint = method !== null && contact.trim().length > 0 && !contactValid;
  const ready = name.trim().length > 0 && contactValid;

  function submit() {
    if (!ready || !method) return;
    onAnswer(`${nameLabel}: ${name.trim()}\n${t(`aiIntake.contactMethods.${method}`)}: ${contact.trim()}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: easing.standard }}
      className="rounded-xl border border-border-subtle bg-(--glass-input-bg) p-4"
    >
      <p className="text-sm font-semibold text-on-surface">{prompt}</p>
      <div className="mt-3 flex flex-col gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={nameLabel}
          className="rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-base text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary md:text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMethod(m.key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                method === m.key
                  ? "border-primary bg-primary/10 text-on-surface"
                  : "border-border-subtle text-secondary hover:border-primary hover:text-on-surface"
              }`}
            >
              <Image src={m.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
              {t(`aiIntake.contactMethods.${m.key}`)}
            </button>
          ))}
        </div>

        {method && (
          <div>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder={t(`aiIntake.contactPlaceholders.${method}`)}
              className={`w-full rounded-lg border bg-transparent px-3 py-2 text-base text-on-surface placeholder:text-secondary focus:outline-none md:text-sm ${
                showInvalidHint ? "border-error" : "border-border-subtle focus:border-primary"
              }`}
            />
            {showInvalidHint && <p className="mt-1 text-xs text-error">{t(`aiIntake.contactInvalid.${method}`)}</p>}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-surface disabled:opacity-40"
        >
          &uarr;
        </button>
      </div>
    </motion.div>
  );
}

const BAN_STORAGE_KEY = "hyliox-intake-ban";
type BanState = { strikes: number; until: number };

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function BannedCard({
  remainingMs,
  strikes,
  title,
  body,
  repeatNote,
}: {
  remainingMs: number;
  strikes: number;
  title: string;
  body: string;
  repeatNote: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-3xl"
    >
      <WindowCard>
        <div className="p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold text-error sm:text-3xl">{title}</h2>
          <p className="mt-3 text-secondary">{body}</p>
          <p className="mt-6 font-display text-4xl font-bold tabular-nums text-on-surface">
            {formatDuration(remainingMs)}
          </p>
          {strikes > 1 && <p className="mt-4 text-xs text-secondary">{repeatNote}</p>}
        </div>
      </WindowCard>
    </motion.div>
  );
}

type Brief = Record<string, string>;
type MessagePart = { type: string; text?: string };

function extractBlock<T>(text: string, tag: string): { clean: string; value: T | null } {
  const match = text.match(new RegExp("```" + tag + "\\s*([\\s\\S]*?)```"));
  if (!match) return { clean: text, value: null };
  try {
    const value = JSON.parse(match[1].trim()) as T;
    return { clean: text.replace(match[0], "").trim(), value };
  } catch {
    return { clean: text, value: null };
  }
}

function extractBrief(text: string): { clean: string; brief: Brief | null } {
  const { clean, value } = extractBlock<Brief>(text, "brief");
  return { clean, brief: value };
}

function extractSummary(text: string): { clean: string; summary: Brief | null } {
  const { clean, value } = extractBlock<Brief>(text, "summary");
  return { clean, summary: value };
}

type Question = { prompt: string; options: string[]; kind?: "contact" | "references" | "checklist" };

function extractQuestion(text: string): { clean: string; question: Question | null } {
  const { clean, value } = extractBlock<{ prompt?: string; options?: string[]; kind?: string }>(text, "question");
  if (!value?.prompt) return { clean, question: null };
  return {
    clean,
    question: {
      prompt: value.prompt,
      options: Array.isArray(value.options) ? value.options : [],
      kind:
        value.kind === "contact"
          ? "contact"
          : value.kind === "references"
            ? "references"
            : value.kind === "checklist"
              ? "checklist"
              : undefined,
    },
  };
}

function messageText(parts: MessagePart[]) {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

// Light heuristic so the UI chrome (dl labels, close buttons, etc.) matches
// the language the client actually types, not just the EN/ID toggle's last
// state — only switches TO Indonesian (never forces English) to stay low-risk.
const INDONESIAN_WORDS = /\b(saya|kami|kita|anda|kamu|yang|dengan|untuk|adalah|tidak|ini|itu|akan|bisa|ingin|butuh|perlu|dari|pada|atau|juga|sudah|belum|mau|dan|nya|bagaimana|berapa|gimana|bikin|buat|mohon|tolong)\b/i;

function detectIndonesian(text: string): boolean {
  return INDONESIAN_WORDS.test(text);
}

const FIELD_KEYS = [
  "name",
  "email",
  "projectType",
  "budgetRange",
  "timeline",
  "description",
  "references",
  "features",
  "priceEstimate",
];

function fieldLabel(key: string, t: (path: string) => string) {
  const path = `aiIntake.fields.${key}`;
  const translated = t(path);
  return translated === path ? key : translated;
}

function FieldList({ fields, t }: { fields: Brief; t: (path: string) => string }) {
  const keys = FIELD_KEYS.filter((k) => k in fields).concat(Object.keys(fields).filter((k) => !FIELD_KEYS.includes(k)));
  return (
    <dl className="mt-2 divide-y divide-border-subtle text-sm">
      {keys.map((k) => (
        <div key={k} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-secondary">{fieldLabel(k, t)}</dt>
          <dd className="text-on-surface sm:text-right">{fields[k] || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function IntakeHero({
  onStartedChange,
  onStepChange,
}: {
  onStartedChange?: (started: boolean) => void;
  onStepChange?: (step: number) => void;
}) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelChoice>("auto");
  // The model that actually answered last turn (from the "start" chunk's
  // messageMetadata — see /api/intake). Only consulted server-side when
  // `model` is still "auto": tried first, but the rest of the fallback chain
  // still applies if it's out of quota this time — see route.ts.
  const [preferredModel, setPreferredModel] = useState<ModelId | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ban, setBan] = useState<BanState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const sentRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Guards the scroll-driven auto-close effect below against the mobile
  // on-screen keyboard: focusing the textarea shrinks the visual viewport,
  // which makes the browser auto-scroll the page to keep the input visible
  // — that scroll isn't the user scrolling, so it must not toggle the card.
  const composerFocusedRef = useRef(false);
  const scrollLastYRef = useRef(0);
  const [composerEl, setComposerEl] = useState<HTMLDivElement | null>(null);
  const [composerHeight, setComposerHeight] = useState(0);
  const { close, closed, sessionCloseTick, setAutoVisible } = useIntakeVisibility();
  const { t, tList, setLocale } = useLanguage();
  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/intake", body: { model, preferredModel } }),
  });

  const busy = status === "submitted" || status === "streaming";
  const started = messages.length > 0;
  const isBanned = !!ban && ban.until > now;
  const banRemainingMs = ban ? ban.until - now : 0;

  const assistantTexts = messages.filter((m) => m.role === "assistant").map((m) => messageText(m.parts as MessagePart[]));
  const latestBrief = assistantTexts.map((text) => extractBrief(text).brief).find((b) => b !== null);
  const latestSummary = assistantTexts.map((text) => extractSummary(text).summary).find((s) => s !== null);
  // Any past turn asking a checklist question means the client has entered
  // feature-mapping — scanned across the whole transcript (not just the
  // latest message) so the step stays lit once that phase starts, the same
  // way latestSummary/latestBrief look at the full history above.
  const hasFeatureChecklist = assistantTexts.some(
    (text) => extractQuestion(extractSummary(extractBrief(text).clean).clean).question?.kind === "checklist",
  );

  const lastMessage = messages[messages.length - 1];
  const lastQuestion =
    lastMessage?.role === "assistant" && !busy
      ? extractQuestion(
          extractSummary(extractBrief(messageText(lastMessage.parts as MessagePart[])).clean).clean,
        ).question
      : null;
  // No dedicated card for options-less, kindless (open-ended) questions — just the normal composer.
  const activeQuestion =
    lastQuestion &&
    (lastQuestion.options.length > 0 ||
      lastQuestion.kind === "contact" ||
      lastQuestion.kind === "references" ||
      lastQuestion.kind === "checklist")
      ? lastQuestion
      : null;

  const stepIndex = latestBrief
    ? emailStatus === "sent"
      ? 5
      : 4
    : latestSummary || activeQuestion?.kind === "contact"
      ? 3
      : hasFeatureChecklist
        ? 2
        : messages.length > 2
          ? 1
          : 0;

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const winnerModel = (lastAssistant?.metadata as { model?: string } | undefined)?.model;
    if (winnerModel && isModelId(winnerModel) && winnerModel !== preferredModel) setPreferredModel(winnerModel);
  }, [messages, preferredModel]);

  useEffect(() => {
    onStartedChange?.(started);
  }, [started, onStartedChange]);

  useEffect(() => {
    onStepChange?.(stepIndex);
  }, [stepIndex, onStepChange]);

  // Ban persists across refresh/reopen (localStorage) — a hard reload
  // shouldn't be a free bypass for someone who just got timed out.
  useEffect(() => {
    const raw = localStorage.getItem(BAN_STORAGE_KEY);
    if (!raw) return;
    try {
      setBan(JSON.parse(raw));
    } catch {
      localStorage.removeItem(BAN_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!ban || ban.until <= now) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ban, now]);

  // The composer/QuestionCard/ContactCard bar is fixed at the bottom of the
  // viewport and its height varies a lot (a plain textarea vs. a QuestionCard
  // with several options is a very different height) — a static bottom
  // padding on the message list would either waste space or, worse, let a
  // tall card cover the newest message even after "scrolling to the bottom".
  // Measuring the real element and padding to match keeps the last message
  // always fully visible above it.
  useEffect(() => {
    if (!composerEl) {
      setComposerHeight(0);
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setComposerHeight(entry.contentRect.height);
    });
    observer.observe(composerEl);
    return () => observer.disconnect();
  }, [composerEl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages, busy, composerHeight]);

  // Auto-close the card on scroll down, auto-reopen on scroll up — only
  // before a conversation has started. Once `started` is true this is
  // disabled, since scrolling through the chat transcript itself would
  // otherwise keep firing scroll-down and close the card mid-conversation.
  useEffect(() => {
    if (started) return;
    scrollLastYRef.current = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Ignore scroll caused by the mobile keyboard opening/closing while
        // the textarea is focused — see composerFocusedRef above.
        if (!composerFocusedRef.current) {
          const y = window.scrollY;
          const delta = y - scrollLastYRef.current;
          if (delta > 8 && y > 80) setAutoVisible(false);
          // Only auto-reopen once actually back near the top — a small
          // upward wiggle deep in e.g. the gallery section shouldn't yank
          // the intro card back over content the user is still browsing.
          else if (delta < -8 && y <= 80) setAutoVisible(true);
          if (Math.abs(delta) > 8) scrollLastYRef.current = y;
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setAutoVisible, started]);

  useEffect(() => {
    if (sessionCloseTick === 0) return;
    setMessages([]);
    setEmailStatus("idle");
    setInput("");
    setPreferredModel(null);
    sentRef.current = false;
  }, [sessionCloseTick, setMessages]);

  useEffect(() => {
    if (!latestBrief || sentRef.current) return;
    sentRef.current = true;
    setEmailStatus("sending");
    const transcript = messages.map((m) => {
      const raw = messageText(m.parts as MessagePart[]);
      const clean =
        m.role === "assistant" ? extractQuestion(extractSummary(extractBrief(raw).clean).clean).clean : raw;
      return { role: m.role, text: clean };
    });

    fetch("/api/send-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brief: latestBrief, transcript }),
    })
      .then((res) => setEmailStatus(res.ok ? "sent" : "error"))
      .catch(() => setEmailStatus("error"));
  }, [latestBrief, messages]);

  function triggerBan() {
    setBan((prev) => {
      const strikes = (prev?.strikes ?? 0) + 1;
      const durationMs = 60_000 * 2 ** (strikes - 1); // 1min, 2min, 4min, 8min...
      const next: BanState = { strikes, until: Date.now() + durationMs };
      localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setNow(Date.now());
  }

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy || isBanned) return;
    if (isAbusiveMessage(trimmed)) {
      triggerBan();
      setInput("");
      return;
    }
    // Checked on every message (not just the first) — one-way switch only
    // (never forces back to English), so it still catches a client who
    // opened with an English quick-action button but writes in Indonesian
    // from their first typed message onward.
    if (detectIndonesian(trimmed)) setLocale("id");
    sendMessage({ text: trimmed });
    setInput("");
  }

  function selectReference(entry: DesignEntry) {
    setPickerOpen(false);
    const url = `${window.location.origin}/${entry.slug}`;
    // Full description/url ride along in a hidden ```refcontext``` block (the
    // model reads it, see INTAKE_SYSTEM_PROMPT) — the visible bubble only
    // shows the short title line, not the whole gallery blurb + link.
    const payload = JSON.stringify({ title: entry.title, description: entry.description, url });
    submit(`${t("aiIntake.fields.references")}: ${entry.title}\n\`\`\`refcontext\n${payload}\n\`\`\``);
  }

  function renderBubble(m: (typeof messages)[number]) {
    const text = messageText(m.parts as MessagePart[]);
    if (m.role === "assistant") {
      const { clean: afterBrief, brief } = extractBrief(text);
      const { clean: afterSummary, summary } = extractSummary(afterBrief);
      const { clean } = extractQuestion(afterSummary);
      return (
        <div key={m.id} className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border-subtle bg-(--glass-input-bg) px-4 py-2.5">
            {clean && <p className="text-sm text-on-surface">{clean}</p>}
            {summary && (
              <div className="mt-3 mb-2 rounded-md border border-border-subtle bg-(--glass-bg) p-4">
                <p className="text-base font-bold text-on-surface">{t("aiIntake.summaryTitle")}</p>
                <FieldList fields={summary} t={t} />
              </div>
            )}
            {brief && (
              <div className="mt-3 mb-2 rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t("aiIntake.briefSentTo", { name: OWNER_NAME })}
                </p>
                <FieldList fields={brief} t={t} />
                <p className="mt-3 text-xs text-secondary">
                  {emailStatus === "error" ? t("aiIntake.confirmError") : t("aiIntake.confirmSuccess")}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    const { clean } = extractBlock<unknown>(text, "refcontext");
    return (
      <div key={m.id} className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5">
          <p className="text-sm font-medium text-primary-contrast">{clean}</p>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <BannedCard
        remainingMs={banRemainingMs}
        strikes={ban?.strikes ?? 1}
        title={t("aiIntake.bannedTitle")}
        body={t("aiIntake.bannedBody", { time: formatDuration(banRemainingMs) })}
        repeatNote={t("aiIntake.bannedRepeat", { strikes: String(ban?.strikes ?? 1) })}
      />
    );
  }

  return (
    <>
      <AnimatePresence>
        {!closed && !started && (
          <motion.div
            key="how-it-works"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            transition={{ duration: durations.base, ease: easing.standard }}
            className="mx-auto w-full max-w-3xl pb-4"
          >
            <HowItWorksLoop steps={tList("aiIntake.howItWorks.steps")} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {closed ? null : !started ? (
        <motion.div
          key="intro"
          // Not `scaleIn` (opacity 0 -> 1): this card is glassmorphic
          // (backdrop-blur-xl over the animated WebGL canvas) — fading its
          // opacity up from 0 means the first frames are more transparent
          // than the resting glass look, so the sharp canvas underneath
          // shows through almost unblurred before "popping" into frosted
          // glass once opacity settles near 1. Keeping opacity at a
          // constant 1 and only animating scale/y avoids that see-through
          // flash entirely — the entrance still reads as growing in.
          initial={{ opacity: 1, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: durations.base, ease: easing.standard }}
          exit={{
            opacity: 0,
            scale: 0.05,
            y: 420,
            transition: { duration: 0.55, ease: [0.68, 0, 0.85, 0] },
          }}
          className="mx-auto w-full max-w-3xl"
        >
        <WindowCard onClose={close} closeLabel={t("aiIntake.closeAria")} blur={false}>
          <div className="p-8 text-center sm:p-10">
            <RotatingHeadline variants={tList("aiIntake.headlineVariants")} />
            <p className="mt-3 text-secondary">{t("aiIntake.subheading")}</p>

            <div className="mt-6 rounded-xl border border-border-subtle bg-(--glass-input-bg) p-4 text-left transition-colors focus-within:border-primary">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                onFocus={() => {
                  composerFocusedRef.current = true;
                }}
                onBlur={() => {
                  composerFocusedRef.current = false;
                  scrollLastYRef.current = window.scrollY;
                }}
                placeholder={t("aiIntake.placeholder")}
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-on-surface placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-secondary focus:outline-none sm:text-base md:text-sm"
              />
              <div className="mt-3 flex items-center justify-between">
                <ModelPicker value={model} onChange={setModel} />
                <motion.button
                  type="button"
                  onClick={() => submit(input)}
                  disabled={busy || !input.trim()}
                  aria-label={t("common.submit")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-surface disabled:opacity-40"
                >
                  &uarr;
                </motion.button>
              </div>
            </div>

            <div className="mt-4 flex flex-nowrap justify-start gap-2 overflow-x-auto sm:justify-center">
              {quickActions.map((qa) => (
                <button
                  key={qa.labelKey}
                  type="button"
                  onClick={() => submit(qa.prompt)}
                  className="whitespace-nowrap rounded-full border border-border-subtle px-4 py-2 text-xs text-secondary transition-colors hover:border-primary hover:text-on-surface"
                >
                  {t(qa.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </WindowCard>
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 text-left"
          style={{ paddingBottom: composerHeight + 112 + 8 }}
        >
          {messages.map((m) => renderBubble(m))}
          {busy && <p className="text-xs text-secondary">{t("aiIntake.thinking")}</p>}
          {error && <p className="text-xs text-error">{t("aiIntake.rateLimited")}</p>}
          {/* scrollIntoView respects scroll-margin, so this keeps the auto
              scroll-to-bottom (on new message) landing clear of the fixed
              composer/QuestionCard below it. The parent's paddingBottom
              above (a tighter version of the same value) is what keeps a
              bubble clear of the composer at rest — e.g. after a manual
              scroll to the true document bottom, which scrollMargin alone
              doesn't cover since it only matters while scrollIntoView is
              animating; that one keeps some extra breathing room since it's
              a one-off landing spot, not permanent empty page space. */}
          <div ref={bottomRef} style={{ scrollMarginBottom: composerHeight + 112 + 32 }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {started && (
          <motion.div
            key="composer"
            ref={setComposerEl}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-28 z-30 mx-auto flex w-full max-w-3xl flex-col gap-3 px-4"
          >
            <AnimatePresence mode="wait">
              {activeQuestion?.kind === "contact" ? (
                <ContactCard
                  key={activeQuestion.prompt}
                  prompt={activeQuestion.prompt}
                  onAnswer={submit}
                  nameLabel={t("aiIntake.fields.name")}
                  t={t}
                />
              ) : activeQuestion?.kind === "checklist" ? (
                <ChecklistCard
                  key={activeQuestion.prompt}
                  prompt={activeQuestion.prompt}
                  options={activeQuestion.options}
                  onAnswer={submit}
                  addLabel={t("aiIntake.checklistAddPlaceholder")}
                  t={t}
                />
              ) : activeQuestion ? (
                <QuestionCard
                  key={activeQuestion.prompt}
                  prompt={activeQuestion.prompt}
                  options={activeQuestion.options}
                  onAnswer={submit}
                  typeOwnLabel={t("aiIntake.typeOwnAnswer")}
                  extraAction={
                    activeQuestion.kind === "references"
                      ? { label: t("gallery.browseGalleryAction"), onClick: () => setPickerOpen(true) }
                      : undefined
                  }
                />
              ) : (
                <motion.div
                  key="composer-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: easing.standard }}
                  className="rounded-xl border border-border-subtle bg-(--glass-input-bg) p-4 transition-colors focus-within:border-primary"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submit(input);
                      }
                    }}
                    placeholder={t("aiIntake.placeholder")}
                    rows={1}
                    className="w-full resize-none bg-transparent text-sm text-on-surface placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-secondary focus:outline-none sm:text-base md:text-sm"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <ModelPicker value={model} onChange={setModel} />
                    <motion.button
                      type="button"
                      onClick={() => submit(input)}
                      disabled={busy || !input.trim()}
                      aria-label={t("common.submit")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-surface disabled:opacity-40"
                    >
                      &uarr;
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pickerOpen && <ReferencePickerModal onSelect={selectReference} onClose={() => setPickerOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
