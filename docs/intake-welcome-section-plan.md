---
status: proposal — revised 2026-07-08 (2nd revision)
source: design analysis of tasteskill.dev (3 screenshots), compared against src/components/marketing/IntakeHero.tsx and src/app/(marketing)/page.tsx
question: does the homepage need a tutorial/welcome section before the AI intake chat?
decision: §3-4 (inline strip) is back as Phase 1 / primary fix — see §6 for why. §5 (dedicated page + dock icon + video modal) demoted to Phase 2 / optional, not the fix for the actual reported problem (bio-link mobile traffic).
---

# Intake Welcome Section — Plan

## 1. Taste Skill design analysis

**Typography**
- Two-font pairing: heavy grotesk sans for headlines/UI/buttons + an editorial **italic serif** used only on accent words ("V2.", "*every* agent"). One pairing, used consistently, creates a premium/editorial feel without adding color.
- Monospace reserved narrowly for dev-signifiers: terminal commands, section numbers (`§0`, `§2`), package names, sponsor labels. It's a *meaning* marker (technical/verifiable), not decoration.
- Body copy: mid-gray sans, generous line-height, short line length.

**Color**
- ~90% neutral (warm off-white bg, black text/buttons) + one accent color (orange) tied consistently to one meaning ("new/highlighted") + green tied to a second meaning ("works/success", checkmarks). Restrained, semantic, not decorative.

**Layout/composition**
- Pill shape used for every small interactive element: nav, badges, buttons, tabs. One consistent shape language.
- Hero: asymmetric floating/staggered preview cards showing real output (screenshots of sites the tool generated) — this *is* the trust mechanism, more than any copy.
- Sticky-left / scroll-right pattern for the long feature/changelog section — keeps headline+CTA in view while a list scrolls.
- Card density signals hierarchy: hero cards = soft shadow (showcase), changelog cards = plain border (structured list).

## 2. Does this apply to IZA's AI intake?

Taste Skill's audience is developers *evaluating a tool before adopting it into their workflow* — real switching cost, so the whole page (compatibility list, changelog, docs, sponsor wall) exists to build confidence before a single `npx` command. A big pre-use explainer is correct there.

IZA's AI intake chat is different: zero commitment, one primary homepage CTA, audience is non-technical UMKM owners, not developers. [[user_background]] Friction inserted before the first message costs conversions directly — this isn't a tool they install, it's a chat they start.

Current `IntakeHero.tsx` already carries part of Taste Skill's job:
- `RotatingHeadline` (3 variants) = the reassurance hero copy
- `subheading`: "Beberapa pertanyaan, lalu akan saya teruskan langsung ke Iza." = a one-line trust/expectation statement
- quick-action chips = pre-filled easy starting points

What's missing that Taste Skill *does* have and IZA doesn't:
1. No visible **"what happens after I type"** — no step preview before commit (Taste Skill's hero cards preview the *output*; IZA has nothing previewing the *outcome* of the chat — an itemized quote sent to Iza).
2. No **human-review / cost / time trust signal** visible before the first message (Taste Skill uses badges like "v2 just shipped", GitHub star count, sponsor logos as social proof; IZA has no equivalent micro-trust markers on the intro card).

> **Reinstated by §6.** Sections 3-4 were briefly superseded by §5 (dedicated page), then reinstated as Phase 1 after checking the actual homepage source — see §6 for the concrete finding that forced this back.

## 3. Recommendation

**No mandatory tutorial/onboarding gate.** A forced explainer step before the textarea adds friction exactly where conversion matters most, and the target user (UMKM owner, not a developer comparing tools) wants to just type, not read docs first.

**Do add a lightweight, non-blocking "how it works" strip** inside the existing intro `WindowCard`, between `subheading` and the textarea. Reuses component patterns that already exist in the codebase (no new visual language, no new font/dependency):
- 3 short steps, each a numbered-circle + label — reuse the exact numbered-badge style already in `QuestionCard`'s option rows (`flex h-6 w-6 ... rounded-full border ... text-xs text-secondary`).
- Copy: "Ceritakan proyek" → "Jawab pertanyaan singkat" → "Dapat estimasi harga, dikirim ke Iza"
- Small trust micro-copy under it, pill-shaped (reuse `rounded-full border border-border-subtle` already used for quick-action chips): "Gratis · ~2 menit · Dikonfirmasi manusia"

This mirrors Taste Skill's badge/pill trust-signal technique using components IZA already has, and previews the *outcome* (itemized quote → Iza) the same way Taste Skill's floating cards preview *output*.

**Optional Phase 2 (not blocking):** the bold-sans + italic-serif pairing is a genuinely new technique — IZA currently has one font family only (`Geist`, see `src/app/globals.css` / `layout.tsx`, `font-display` resolves to Geist too). Introducing a serif accent font is a real dependency/perf decision (new font load) and should be scoped separately, not bundled into this welcome-section change. If pursued later: apply the italic-serif treatment only to one accent word in `RotatingHeadline` variants, never to body/UI text.

## 4. Implementation plan (Phase 1 — do this first)

**Files touched:**
- `src/components/marketing/IntakeHero.tsx` — insert a small `HowItWorks` block (3 steps) between the `<p>` subheading and the textarea container, inside the `!started` branch only (never shown once chat starts — session step panel already covers progress at that point).
- `src/dictionaries/en.json` / `src/dictionaries/id.json` — add `aiIntake.howItWorks.step1/2/3` and `aiIntake.howItWorks.trustLine` keys.

**Component shape:**
```tsx
function HowItWorks({ steps, trustLine }: { steps: string[]; trustLine: string }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-secondary">
        {steps.map((step, i) => (
          <span key={step} className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-subtle text-[10px]">
              {i + 1}
            </span>
            {step}
          </span>
        ))}
      </div>
      <span className="rounded-full border border-border-subtle px-3 py-1 text-[11px] text-secondary">
        {trustLine}
      </span>
    </div>
  );
}
```
Placed right after `<p className="mt-3 text-secondary">{t("aiIntake.subheading")}</p>` in the intro `WindowCard`.

**Scope guard:** no new fonts, no new colors, no new shape language — every visual primitive (pill badge, numbered circle, `border-border-subtle`) already exists elsewhere in `IntakeHero.tsx`. This is a content/trust addition, not a redesign.

**Out of scope for this change:** italic-serif typography pairing, floating preview cards of a sample brief/summary card, sponsor/social-proof wall — none of these fit IZA's single-operator, zero-signup context and would need separate justification.

## 5. Phase 2 (optional, do after Phase 1 ships) — dedicated "How It Works" page

Originally proposed as *the* fix; demoted after §6's finding. Still worth building eventually as a deeper, linkable resource (e.g. for someone who wants more detail, or a link to share outside the bio-link flow) — but it does not solve the reported problem on its own, because nobody arrives here *first*. Build Phase 1 (§3-4) before this.

Separate page, reachable via a **new DockNav icon**, styled like Taste Skill but adapted to IZA's tokens/brand — plus a **tutorial-video modal** ("klik disini untuk tutorial") triggered from that page. The homepage `IntakeHero.tsx` intro card gets the Phase 1 inline strip (§3-4) regardless of whether this page ships.

### 5.1 Route

New page group entry, following the existing `(marketing)` pattern (`src/app/(marketing)/about/page.tsx`, `start/page.tsx`, `showcase/page.tsx`):

- `src/app/(marketing)/how-it-works/page.tsx` — route `/how-it-works`
- **Open question:** confirm final URL/label — `nav.howItWorks` dictionary key assumed below, adjust if a different route slug is preferred.

Page skeleton follows `about/page.tsx`'s existing convention exactly (client component, `useLanguage()` for `t()`, `useReducedMotion()` + `fadeUp`/`group`/`stagger` from `@/lib/motion` for entrance animation) — no new animation primitives.

### 5.2 DockNav wiring

`src/components/layout/DockNav.tsx` — add one entry to the `items` array (alongside the existing `/` and `/docs` entries, lines 20-41):

```ts
{
  href: "/how-it-works",
  labelKey: "nav.howItWorks",
  match: (p: string) => p.startsWith("/how-it-works"),
  icon: (
    <div className="relative h-full w-full overflow-hidden rounded-sm">
      <Image src={logoHowItWorks} alt="" fill sizes="48px" priority className="object-cover" />
    </div>
  ),
},
```

- **Open question:** user is adding the new icon asset themselves — needs a filename/path under `src/assets/logo/` (matching the existing `logoiza.png` / `logocomponent.png` pattern) before this wiring can be finished. Placeholder name above: `logoHowItWorks`.
- `nav.howItWorks` label key needed in both dictionaries.

### 5.3 Page design — Taste Skill style, adapted to IZA tokens

Reuse Taste Skill's *structure and shape language* from §1, not its literal palette (Taste Skill's orange/green don't apply — use IZA's existing `--primary`/`--secondary`/`--border-subtle` tokens throughout, same as every other page):

1. **Hero block** (same treatment as Taste Skill's hero, IZA colors):
   - Small pill status badge (reuse the `rounded-full border border-border-subtle` chip style) — e.g. "Cara kerja AI intake"
   - Large `font-display` headline (existing `Geist` — no serif pairing per §3's Phase-2 deferral, unless user wants to revisit that here specifically since this is a page, not the conversion-critical homepage card)
   - One-line subhead + a CTA pill button linking back to `/` (or `/#intake`) to actually start the chat
   - **A "watch tutorial" pill button** opening the video modal (§5.4) — this is the Taste Skill-style CTA-row treatment adapted to a video instead of an install command

2. **3-step explainer section** (the content originally planned for the inline strip in §3, now full-width cards instead of an inline chip row):
   - Card per step: numbered badge (same numbered-circle visual as `QuestionCard`) + short title + one-sentence description
   - Steps: "Ceritakan proyek" → "Jawab pertanyaan singkat (AI pakai daftar harga nyata)" → "Dapat estimasi harga, dikirim ke Iza"

3. **Trust/reassurance row** (adapts Taste Skill's "Works with every agent" compatibility band — same card-row layout, different content since IZA has no integrations to list):
   - 3-4 small cards: "Gratis", "~2-5 menit", "Dikonfirmasi manusia (Iza)", "Harga dari rate card asli, bukan tebakan"

4. No sponsor wall / changelog / sticky-scroll section — those map to Taste Skill's open-source-project needs (contributors, version history) that don't exist for a single-operator studio page. Keep the page to hero + steps + trust row only.

### 5.4 Tutorial video modal

New component, e.g. `src/components/marketing/TutorialModal.tsx`, following the existing modal pattern (`ContactModal.tsx` / `ReferencePickerModal.tsx`: centered glass card, backdrop, close button, `AnimatePresence` mount/unmount) rather than inventing a new modal shell.

- Triggered by the "watch tutorial" button in the hero (`useState` open/close in the page, same pattern `DockNav.tsx` uses for `contactOpen`/`ContactModal`).
- Content: video embed (`<video>` tag if self-hosted, or an iframe embed if hosted externally — **open question: where does the video live / does it exist yet?**) inside the modal body, 16:9 aspect box, close (×) button top-right matching `ContactModal`'s chrome.
- No autoplay-with-sound on open (accessibility/annoyance) — user-initiated play only.

### 5.5 Files to touch (summary)

| File | Change |
|---|---|
| `src/app/(marketing)/how-it-works/page.tsx` | new — page content per §5.3 |
| `src/components/marketing/TutorialModal.tsx` | new — video modal per §5.4 |
| `src/components/layout/DockNav.tsx` | add nav item + icon import |
| `src/dictionaries/en.json`, `id.json` | add `nav.howItWorks`, `howItWorks.*` copy keys (hero, 3 steps, trust row, modal) |
| `src/assets/logo/` | new icon asset — **user-provided** |

### 5.6 Still open before implementation

1. Final route slug / nav label wording.
2. Icon asset filename (user adding it).
3. Tutorial video source — file to self-host, or external embed URL — and whether it exists yet or is a placeholder for now.
4. Whether the homepage CTA in the hero block (§5.3.1) should deep-link to `/` or to a specific anchor/reopen of the intake card (`useIntakeVisibility`'s `reopen()` is already used by `DockNav`'s "reopen chat" icon — same mechanism could apply here if this page is meant to hand off back into the chat rather than just link home).

## 6. Finding that reordered the priority: real traffic is bio-link mobile

Concrete scenario raised 2026-07-08: visitor clicks the Instagram-bio link (`izadesign.site`) → lands on `/` → first thing seen is the `IntakeHero` chat card. Question: is that, plus "some blurb cards," enough of a tutorial?

Checked `src/app/(marketing)/page.tsx` directly rather than assuming:

- The 4 `featureBlurbs` (`homepage.feature1-4Title/Body` — "Studio AI Anda", "Percakapan Nyata", "Brief Terstruktur", "Langsung ke Inbox") are wrapped in a container classed `hidden ... xl:block` (line ~137). **They render on desktop only.** A bio-link click from Instagram is overwhelmingly a mobile session — that visitor sees **zero** of this explanatory content.
- Even where the blurbs *do* render (desktop), they explain **what the product is** (AI Studio, human-reviewed, structured brief, auto-emailed) — not **how the flow works mechanically** (type → answer a few questions → get a priced estimate). Different job than a "how it works" strip.
- `DockNav` itself has no responsive hiding — it's visible on mobile too — so a dedicated page (§5) *would* be reachable on mobile. But reachability isn't the problem: a bio-link visitor's first 2 seconds are spent deciding "what is this," on the one screen they're already looking at, not exploring a bottom nav bar first.

**Conclusion:** the actual first-impression gap is mobile, first-screen, zero-click. That's exactly what §3-4's inline `HowItWorks` strip inside `IntakeHero.tsx`'s intro `WindowCard` fixes — it renders in the same card at every breakpoint (no `xl:` gate), so it's the first thing a bio-link/mobile visitor sees, no navigation required. §5's dedicated page is additive value for anyone who wants more depth later, but doesn't address this specific problem, hence the demotion to Phase 2.
