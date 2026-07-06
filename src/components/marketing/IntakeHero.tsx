"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { scaleIn, easing, durations } from "@/lib/motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { ReferencePickerModal } from "@/components/gallery/ReferencePickerModal";
import { WindowCard } from "@/components/ui/WindowCard";
import { OWNER_NAME } from "@/lib/intake-prompt";
import { glassCard } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";
import { AI_MODELS, modelLabel, type ModelChoice } from "@/lib/ai-models";
import { isAbusiveMessage } from "@/lib/abuse-filter";
import geminiIcon from "@/assets/logo/google-gemini.svg";

const quickActions = [
  { labelKey: "aiIntake.optionScreenshot", prompt: "I'd like to share a reference screenshot of a design I like." },
  { labelKey: "aiIntake.optionLink", prompt: "I'd like to share a link to a site I like." },
  { labelKey: "aiIntake.optionNotSure", prompt: "I'm not sure yet what I need — can you help me explore?" },
];

const MODEL_CHOICES: ModelChoice[] = ["auto", ...AI_MODELS.map((m) => m.id)];

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
          className="font-display text-2xl font-bold sm:text-3xl"
        >
          {variants[index % variants.length]}
        </motion.h2>
      </AnimatePresence>
    </motion.div>
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
        <Image src={geminiIcon} alt="" width={14} height={14} />
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
            className={`absolute bottom-full left-0 z-10 mb-2 w-44 overflow-hidden rounded-lg p-1 ${glassCard}`}
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
                <Image src={geminiIcon} alt="" width={14} height={14} />
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
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none"
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

function ContactCard({
  prompt,
  onAnswer,
  nameLabel,
  emailLabel,
}: {
  prompt: string;
  onAnswer: (text: string) => void;
  nameLabel: string;
  emailLabel: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const ready = name.trim().length > 0 && email.trim().length > 0;

  function submit() {
    if (!ready) return;
    onAnswer(`${nameLabel}: ${name.trim()}\n${emailLabel}: ${email.trim()}`);
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
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={nameLabel}
          className="rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          type="email"
          placeholder={emailLabel}
          className="rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
        />
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

type Question = { prompt: string; options: string[]; kind?: "contact" | "references" };

function extractQuestion(text: string): { clean: string; question: Question | null } {
  const { clean, value } = extractBlock<{ prompt?: string; options?: string[]; kind?: string }>(text, "question");
  if (!value?.prompt) return { clean, question: null };
  return {
    clean,
    question: {
      prompt: value.prompt,
      options: Array.isArray(value.options) ? value.options : [],
      kind: value.kind === "contact" ? "contact" : value.kind === "references" ? "references" : undefined,
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

const FIELD_KEYS = ["name", "email", "projectType", "budgetRange", "timeline", "description", "references"];

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
        <div key={k} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-secondary">{fieldLabel(k, t)}</dt>
          <dd className="text-right text-on-surface">{fields[k] || "—"}</dd>
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
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ban, setBan] = useState<BanState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const sentRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [composerEl, setComposerEl] = useState<HTMLDivElement | null>(null);
  const [composerHeight, setComposerHeight] = useState(0);
  const { close, closed, sessionCloseTick, setAutoVisible } = useIntakeVisibility();
  const { t, tList, setLocale } = useLanguage();
  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/intake", body: { model } }),
  });

  const busy = status === "submitted" || status === "streaming";
  const started = messages.length > 0;
  const isBanned = !!ban && ban.until > now;
  const banRemainingMs = ban ? ban.until - now : 0;

  const assistantTexts = messages.filter((m) => m.role === "assistant").map((m) => messageText(m.parts as MessagePart[]));
  const latestBrief = assistantTexts.map((text) => extractBrief(text).brief).find((b) => b !== null);
  const latestSummary = assistantTexts.map((text) => extractSummary(text).summary).find((s) => s !== null);

  const lastMessage = messages[messages.length - 1];
  const lastQuestion =
    lastMessage?.role === "assistant" && !busy
      ? extractQuestion(
          extractSummary(extractBrief(messageText(lastMessage.parts as MessagePart[])).clean).clean,
        ).question
      : null;
  // No dedicated card for options-less, kindless (open-ended) questions — just the normal composer.
  const activeQuestion =
    lastQuestion && (lastQuestion.options.length > 0 || lastQuestion.kind === "contact" || lastQuestion.kind === "references")
      ? lastQuestion
      : null;

  const stepIndex = latestBrief
    ? emailStatus === "sent"
      ? 4
      : 3
    : latestSummary
      ? 2
      : messages.length > 2
        ? 1
        : 0;

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

  // Auto-close the card on scroll down, auto-reopen on scroll up. Ignores
  // banned state (that early-returns before this ever mounts) and uses a
  // small threshold so tiny scroll jitter (mobile rubber-banding) doesn't
  // toggle it; only closes past a minimum scrollY so it doesn't hide itself
  // over a 1px nudge right at the top of the page.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (delta > 8 && y > 80) setAutoVisible(false);
        else if (delta < -8) setAutoVisible(true);
        if (Math.abs(delta) > 8) lastY = y;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setAutoVisible]);

  useEffect(() => {
    if (sessionCloseTick === 0) return;
    setMessages([]);
    setEmailStatus("idle");
    setInput("");
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
    if (messages.length === 0 && detectIndonesian(trimmed)) setLocale("id");
    sendMessage({ text: trimmed });
    setInput("");
  }

  function selectReference(entry: DesignEntry) {
    setPickerOpen(false);
    submit(`Referensi: ${entry.title} — ${entry.description} (${window.location.origin}/${entry.slug})`);
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
    return (
      <div key={m.id} className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5">
          <p className="text-sm font-medium text-primary-contrast">{text}</p>
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
      <AnimatePresence mode="wait">
        {closed ? null : !started ? (
        <motion.div
          key="intro"
          variants={scaleIn}
          initial="hidden"
          animate="show"
          exit={{
            opacity: 0,
            scale: 0.05,
            y: 420,
            transition: { duration: 0.55, ease: [0.68, 0, 0.85, 0] },
          }}
          className="mx-auto w-full max-w-3xl"
        >
        <WindowCard onClose={close} closeLabel={t("aiIntake.closeAria")}>
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
                placeholder={t("aiIntake.placeholder")}
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none"
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

            <div className="mt-4 flex flex-nowrap justify-center gap-2 overflow-x-auto">
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
          className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-4 text-left"
        >
          {messages.map((m) => renderBubble(m))}
          {busy && <p className="text-xs text-secondary">{t("aiIntake.thinking")}</p>}
          {error && <p className="text-xs text-error">{t("aiIntake.rateLimited")}</p>}
          {/* scrollIntoView respects scroll-margin, so this is what actually
              keeps the last message clear of the fixed composer/QuestionCard
              below it — a parent padding-bottom does NOT help here, since
              scrollIntoView aligns *this element's* edge to the viewport,
              ignoring box content that comes after it in the DOM. */}
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
                  emailLabel={t("aiIntake.fields.email")}
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
                    className="w-full resize-none bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none"
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
