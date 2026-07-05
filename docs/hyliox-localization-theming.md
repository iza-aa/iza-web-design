---
version: alpha
name: Hyliox Localization & Theming System
description: Specifications for adding global Light/Dark mode theming and bilingual (English/Indonesian) support across the Hyliox platform. This document establishes token definitions, UI switchers, translation dictionary structures, and implementation rules.
themes:
  dark:
    name: Hyliox Dark Glass
    primary: "#3B82F6"
    secondary: "#9CA3AF"
    tertiary: "#3F3F46"
    neutral: "#DCE0E8"
    surface: "#1C1C21"
    on-surface: "#F5F5F7"
    error: "#EF4444"
    primary-contrast: "#FFFFFF"
    border-subtle: "#33333A"
  light:
    name: Hyliox Light Glass
    primary: "#2563EB"
    secondary: "#4B5563"
    tertiary: "#E5E7EB"
    neutral: "#1F2937"
    surface: "#F9FAFB"
    on-surface: "#111827"
    error: "#DC2626"
    primary-contrast: "#FFFFFF"
    border-subtle: "#E5E7EB"
languages:
  - code: en
    name: English
  - code: id
    name: Bahasa Indonesia
---

# Hyliox Localization & Theming System

## Overview
This specification details the transition of the Hyliox platform from a dark-only application into a fully responsive, double-themed (Light & Dark), and bilingual (English & Indonesian) experience. Implementing these systems guarantees that the platform is accessible to local Indonesian businesses and global partners alike, while adapting to the user's OS preference or manual overrides.

---

## 1. Theme Specification (Light & Dark Mode)

### 1.1 Theming Architecture
We will use **Tailwind CSS class-based dark mode** (`darkMode: 'class'` or standard Tailwind v4 utility selector).
- The default theme is **Dark Mode** (`dark` class applied to `<html>`).
- Theme selection is saved to `localStorage` (key: `hyliox-theme`) and falls back to system preference (`prefers-color-scheme`).
- To prevent screen flashing on initial load, a lightweight blocking script is injected in the `<head>` of the root layout.

### 1.2 Color Token Mapping

| Token Name | Dark Theme (Hyliox Dark Glass) | Light Theme (Hyliox Light Glass) | Purpose |
| :--- | :--- | :--- | :--- |
| `primary` | `#3B82F6` (Vivid Blue) | `#2563EB` (Royal Blue) | CTA buttons, active states, brand accent |
| `secondary` | `#9CA3AF` (Muted Grey) | `#4B5563` (Dark Muted Grey) | Subheadings, secondary labels |
| `tertiary` | `#3F3F46` (Dark Charcoal) | `#E5E7EB` (Light Grey) | Disabled states, card backdrops |
| `neutral` | `#DCE0E8` (Cool Silver) | `#1F2937` (Charcoal Black) | Body copy text, default icons |
| `surface` | `#1C1C21` (Off-black) | `#F9FAFB` (Snow White) | Card surfaces, modals, background sheets |
| `on-surface` | `#F5F5F7` (Off-white) | `#111827` (Deep Dark) | High-contrast text on surfaces |
| `error` | `#EF4444` (Vibrant Red) | `#DC2626` (Crimson Red) | Validation errors, destructive states |
| `border-subtle` | `#33333A` (Subtle Dark) | `#E5E7EB` (Subtle Light) | Thin borders, glassmorphism dividers |

### 1.3 Glassmorphism Adjustments
- **Dark Glass:** `backdrop-blur-md bg-surface/80 border-border-subtle/40`
- **Light Glass:** `backdrop-blur-md bg-surface/75 border-border-subtle/60 shadow-sm`

---

## 2. Localization Specification (EN / ID)

### 2.1 Translation Strategy (Next.js App Router)
Since this project uses Next.js App Router, we will implement a clean, type-safe **Client-Side/Server-Side Dictionary pattern** to prevent heavy bundle sizes.
- Translation dictionaries live in `src/dictionaries/{en,id}.json`.
- A global `LanguageProvider` Context manages the active locale (`id` or `en`), defaulting to `id` for domestic IP addresses/user-agent settings and `en` globally.
- Persisted to `localStorage` (key: `hyliox-lang`).

### 2.2 Translation Dictionaries Blueprint

#### `src/dictionaries/en.json`
```json
{
  "common": {
    "startProject": "Start a Project",
    "comingSoon": "Coming Soon",
    "submit": "Submit",
    "close": "Close"
  },
  "nav": {
    "work": "Work",
    "components": "Components"
  },
  "hero": {
    "headline": "We build aesthetic, high-performance web systems.",
    "subheading": "Design tokens, ambient canvases, and interactive interfaces crafted to elevate your digital presence.",
    "cta": "Start a Project"
  },
  "waitlistCard": {
    "title": "Join the Waitlist",
    "placeholder": "Enter your email address...",
    "disclaimer": "No spam. Only high-grade product updates.",
    "success": "Welcome aboard! We'll keep you posted."
  },
  "aiIntake": {
    "headline": "Tell me about your project",
    "subheading": "A few questions, then I'll pass this straight to Iza.",
    "placeholder": "Describe what you're trying to build...",
    "optionScreenshot": "Share a reference screenshot",
    "optionLink": "Share a link you like",
    "optionNotSure": "Not sure yet — help me explore",
    "badge": "Powered by Gemini"
  }
}
```

#### `src/dictionaries/id.json`
```json
{
  "common": {
    "startProject": "Mulai Proyek",
    "comingSoon": "Segera Hadir",
    "submit": "Kirim",
    "close": "Tutup"
  },
  "nav": {
    "work": "Karya",
    "components": "Komponen"
  },
  "hero": {
    "headline": "Kami membangun sistem web estetis berkinerja tinggi.",
    "subheading": "Token desain, kanvas ambient, dan antarmuka interaktif yang dirancang untuk meningkatkan kehadiran digital Anda.",
    "cta": "Mulai Proyek"
  },
  "waitlistCard": {
    "title": "Bergabung ke Waitlist",
    "placeholder": "Masukkan alamat email Anda...",
    "disclaimer": "Tanpa spam. Hanya info perkembangan produk berkualitas tinggi.",
    "success": "Selamat bergabung! Kami akan segera mengabari Anda."
  },
  "aiIntake": {
    "headline": "Ceritakan tentang proyek Anda",
    "subheading": "Beberapa pertanyaan, lalu akan saya teruskan langsung ke Iza.",
    "placeholder": "Jelaskan apa yang ingin Anda bangun...",
    "optionScreenshot": "Bagikan tangkapan layar referensi",
    "optionLink": "Bagikan tautan yang Anda suka",
    "optionNotSure": "Belum yakin — bantu saya jelajahi",
    "badge": "Didukung oleh Gemini"
  }
}
```

---

## 3. UI Switcher Components

### 3.1 Header Controls Placement
The language switcher and theme toggles will reside on the right-hand side of the main navigation header:
- **Theme Toggle:** An icon button (Sun for Light, Moon for Dark).
  - Transition: Smooth icon rotation using Framer Motion (`initial={{ rotate: -90 }} animate={{ rotate: 0 }}`).
- **Language Switcher:** A minimalist segmented control or simple button switcher: `EN | ID`.
  - Simple, clean, bolding the active locale.

---

## 4. Definition of Done
The Localization & Theming phase is considered complete when:
1. `<html>` element correctly toggles the `.dark` class, changing all Tailwind utility colors flawlessly.
2. Clicking the theme toggle switches modes with a smooth color transition (`transition-colors duration-300`).
3. Switching the language switcher updates all text content instantly without full-page reloads.
4. User's choices for theme and language are successfully preserved in `localStorage`.
5. No layout shifts or text overlaps occur in either language (since Indonesian words are typically longer than English equivalents).
