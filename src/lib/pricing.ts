/**
 * Rate card for the AI intake chat's per-feature pricing.
 * The intake model reads this (via formatRateCardForPrompt, injected into
 * INTAKE_SYSTEM_PROMPT) so it prices from real numbers instead of guessing —
 * see src/lib/intake-prompt.ts.
 */

export type RateCardItem = { label: string; price: number };

export const BASE_PACKAGES: RateCardItem[] = [
  { label: "Landing page (1 halaman)", price: 500_000 },
  { label: "Company profile (multi-halaman)", price: 800_000 },
  { label: "Toko online / e-commerce (multi-halaman + katalog produk)", price: 1_200_000 },
  { label: "Web app / SIM custom (dashboard + database)", price: 2_500_000 },
];

export const GENERAL_FEATURES: RateCardItem[] = [
  { label: "Form kontak + auto-email", price: 100_000 },
  { label: "Galeri/portfolio section", price: 150_000 },
  { label: "Blog/CMS sederhana", price: 400_000 },
  { label: "Animasi/interaksi custom", price: 300_000 },
  { label: "Klik-chat WhatsApp terintegrasi", price: 75_000 },
  { label: "SEO dasar (meta tag, sitemap)", price: 150_000 },
  { label: "Dukungan dwi-bahasa (ID/EN)", price: 200_000 },
  { label: "FAQ accordion", price: 100_000 },
  { label: "Testimoni/video showcase", price: 150_000 },
  { label: "Konten statis tambahan (simulasi, tabel, dsb — bukan kalkulator interaktif)", price: 100_000 },
];

export const ECOMMERCE_FEATURES: RateCardItem[] = [
  { label: "Katalog produk + kategori", price: 300_000 },
  { label: "Keranjang belanja (cart)", price: 400_000 },
  { label: "Payment gateway (Midtrans/Xendit dll)", price: 600_000 },
  { label: "Admin panel kelola produk & stok", price: 700_000 },
  { label: "Manajemen pesanan/order tracking", price: 500_000 },
];

export const WEBAPP_FEATURES: RateCardItem[] = [
  { label: "Login + role user (admin/staff/owner)", price: 500_000 },
  { label: "Dashboard laporan/analytics", price: 700_000 },
  { label: "Export data (Excel/PDF)", price: 300_000 },
  { label: "Multi-cabang/multi-outlet", price: 600_000 },
];

function formatRupiah(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

function formatItems(items: RateCardItem[]): string {
  return items.map((i) => `- ${i.label}: ${formatRupiah(i.price)}`).join("\n");
}

export function formatRateCardForPrompt(): string {
  return `PAKET DASAR (pilih satu, sesuai tipe project):
${formatItems(BASE_PACKAGES)}

FITUR TAMBAHAN — umum, sebagian besar untuk situs/tampilan publik (landing page, company profile, toko online) — pertimbangkan relevansinya dulu sebelum ditawarkan ke tool internal (dashboard admin, SIM, sistem staf-only):
${formatItems(GENERAL_FEATURES)}

FITUR TAMBAHAN — khusus e-commerce/retail:
${formatItems(ECOMMERCE_FEATURES)}

FITUR TAMBAHAN — khusus web app/SIM (sistem informasi manajemen):
${formatItems(WEBAPP_FEATURES)}`;
}

export type DurationGuideItem = { label: string; duration: string };

export const BASE_DURATIONS: DurationGuideItem[] = [
  { label: "Landing page (1 halaman)", duration: "3-5 hari kerja" },
  { label: "Company profile (multi-halaman)", duration: "1-2 minggu" },
  { label: "Toko online / e-commerce", duration: "2-3 minggu" },
  { label: "Web app / SIM custom", duration: "3-6 minggu" },
];

function formatDurations(items: DurationGuideItem[]): string {
  return items.map((i) => `- ${i.label}: ${i.duration}`).join("\n");
}

export function formatDurationGuideForPrompt(): string {
  return `${formatDurations(BASE_DURATIONS)}

Setiap fitur tambahan yang dipilih biasanya menambah beberapa hari lagi — fitur sederhana (FAQ, klik-chat WhatsApp, form kontak) menambah sedikit, fitur kompleks (payment gateway, admin panel, login + role, dashboard/laporan) menambah lebih banyak. Ini panduan kasar, bukan tabel presisi — sesuaikan pakai judgment berdasarkan jumlah dan kompleksitas fitur yang sudah dipilih.`;
}
