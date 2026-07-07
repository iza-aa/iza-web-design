"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { glassCard } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";

// Past this many lines, a source file (WindowCard is short, AmbientCanvas is
// 300+ lines) reads better collapsed behind a fade + "View Code" button than
// dumped in full immediately — matches the reference the owner pointed at.
const COLLAPSE_LINE_THRESHOLD = 12;
const COLLAPSED_HEIGHT = 220;

export function CodeBlock({
  code,
  label,
  language = "tsx",
}: {
  code: string;
  label?: string;
  language?: string;
}) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const collapsible = code.split("\n").length > COLLAPSE_LINE_THRESHOLD;
  const [expanded, setExpanded] = useState(!collapsible);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: language,
      themes: { dark: "github-dark", light: "github-light" },
      defaultColor: theme === "light" ? "light" : "dark",
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, theme]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`overflow-hidden rounded-lg ${glassCard}`}>
      <div className="flex items-center justify-between border-b border-(--glass-border) px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-secondary">{label ?? t("docs.componentDetail.code")}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:text-on-surface"
        >
          {copied ? t("docs.codeBlock.copied") : t("docs.codeBlock.copy")}
        </button>
      </div>

      <div className="relative bg-(--glass-input-bg)">
        <div
          className="overflow-hidden text-xs leading-relaxed transition-[max-height] duration-300 [&_pre]:bg-transparent! [&_pre]:overflow-x-auto [&_pre]:p-4"
          style={{ maxHeight: expanded ? 10000 : COLLAPSED_HEIGHT }}
        >
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <pre className="overflow-x-auto p-4 text-on-surface">
              <code>{code}</code>
            </pre>
          )}
        </div>

        {collapsible && !expanded && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-(--glass-input-bg) to-transparent" />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-full bg-on-surface px-4 py-2 text-xs font-semibold text-surface shadow-lg transition-transform hover:scale-105"
              >
                {t("docs.codeBlock.viewCode")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
