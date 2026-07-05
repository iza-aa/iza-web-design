"use client";

import { useState } from "react";
import { glassCard } from "@/lib/tokens";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`overflow-hidden rounded-lg ${glassCard}`}>
      <div className="flex items-center justify-between border-b border-(--glass-border) px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-secondary">{label ?? "Code"}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:text-on-surface"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-on-surface">
        <code>{code}</code>
      </pre>
    </div>
  );
}
