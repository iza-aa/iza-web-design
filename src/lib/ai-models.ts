/**
 * Free-tier Gemini models offered in the intake chat's model picker.
 * Order doubles as the "auto" fallback chain — /api/intake walks it
 * top to bottom until one candidate isn't quota-exhausted.
 */

export const AI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
] as const;

export type ModelId = (typeof AI_MODELS)[number]["id"];
export type ModelChoice = "auto" | ModelId;

export const AUTO_FALLBACK_ORDER: readonly ModelId[] = AI_MODELS.map((m) => m.id);

export function modelLabel(choice: ModelChoice): string {
  if (choice === "auto") return "Auto";
  return AI_MODELS.find((m) => m.id === choice)?.label ?? "Auto";
}

export function isModelId(value: string): value is ModelId {
  return AI_MODELS.some((m) => m.id === value);
}
