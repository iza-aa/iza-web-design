/**
 * Deliberately narrow — only unambiguous profanity/slurs, never mere
 * rudeness or frustration ("ini ribet banget", "kok gini doang" etc. must
 * never trip this). A frustrated prospective client is still a prospective
 * client; this is for the "woi anjeng" case, not for terse or blunt phrasing.
 * Subtler abuse (off-topic derailing, jailbreak/prompt-injection attempts)
 * stays the system prompt's job (graceful redirect) — this filter only
 * handles the clear-cut, instant, no-API-call-needed case.
 */
const ABUSE_PATTERNS = [
  /\b(anj(ing|eng|g)|bangsat|kontol|memek|ngentot|tolol|goblo?k|monyet|babi|keparat)\b/i,
  /\b(fuck|f+u+c+k+|shit|asshole|bitch|bastard|motherfucker)\b/i,
];

export function isAbusiveMessage(text: string): boolean {
  return ABUSE_PATTERNS.some((pattern) => pattern.test(text));
}
