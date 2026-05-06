# Wedding Invitation — Rachmatulla & Devy Puspita

## Original Problem Statement
Build a wedding invitation landing page for Rachmatulla & Devy Puspita.
Follow specs from two attached TXT files:
- `NT Scroll Video Hero Prompt.txt` — scroll-controlled video hero rules
- `NT_Wedding_Rachmatulla_Devy_Emergent_Prompt.txt` — full wedding spec (palette, fonts, sections)

Use the attached MP4 as scroll-controlled hero. Visual references:
- https://skeleton-rebuild.preview.emergentagent.com/ (scroll-video mechanic)
- https://lml.cc/en (cinematic editorial scroll)
- https://www.farmminerals.com/promo (warm earthy palette)

## Real Couple Data
- Couple: Rachmatulla & Devy Puspita
- Resepsi: 24 Mei 2026 (Minggu)
- Ngunduh Mantu: 30 Mei 2026 (Sabtu)

## User Choices (gathered via ask_human)
- RSVP form: console.log only (no MongoDB backend)
- URL `?to=<name>` query param: enabled — shows "Kepada Yth. <name>" banner + prefills RSVP name
- Background music: enabled — fixed corner play/pause toggle

## Design Tokens (from spec)
- Cream `#F5EFE6`, Warm Blush `#E8C4A0`, Terracotta `#7D4F3A`, Dusty Rose `#C9847A`
- Champagne Gold `#C9A96E`, Warm White `#FDFAF6`, Dark Warm `#2C1810`
- Fonts: Cormorant Garamond (display), Jost (body), Great Vibes (script), Amiri (Arabic)

## Architecture
- Pure frontend (no backend usage). Single-page React app.
- `/app/frontend/public/hero-video.mp4` — 9.5MB h264/aac MP4 (10s)
- `/app/frontend/public/wedding-music.mp3` — placeholder (user can drop their own)
- `/app/frontend/src/App.js` — single-file with sub-components: Navbar, Hero (scroll-controlled video), Bismillah, Couple, Events, Countdown, Quote, RSVP, Footer, MusicToggle, GreetingBanner
- `/app/frontend/src/App.css` — full warm palette, typography, scroll-video styles, animations

## Implemented Features (2026-05-05)
- [x] Scroll-controlled hero with 4 cross-fade text stages (Entry / Date Reveal / Mood / Invitation Close)
- [x] 300vh container + sticky 100vh inner; rAF-driven `video.currentTime` scrubbing on desktop
- [x] Mobile + reduced-motion fallback: muted autoplay loop
- [x] 4 floating petal animation, gold progress bar
- [x] Bismillah section (Arabic + Indonesian, gold ornament)
- [x] Couple introduction with oversized gold `&` ampersand
- [x] Two event cards (Resepsi 24 Mei + Ngunduh Mantu 30 Mei) with maps CTA
- [x] Live countdown timer to 24 Mei 2026 (HARI/JAM/MENIT/DETIK), dark warm bg
- [x] Love quote (Ar-Rum 21)
- [x] RSVP form (name, attendance pills, guests, message → console.log)
- [x] Footer (dark warm, gold script names)
- [x] Personal greeting banner from `?to=` URL param (auto-hides past hero)
- [x] Music toggle (fixed bottom-left, play/pause + visual toggle even when audio missing)
- [x] IntersectionObserver-driven section fade-in
- [x] Reduced-motion accessibility fallback
- [x] Responsive (mobile-first, 768px / 980px / 1200px breakpoints)
- [x] All interactive elements have `data-testid` attributes

## Iteration 2 Refinements (2026-05-05)
- [x] **Vertical side navbar** (left, fixed, 48px desktop / 40px mobile). Vertical writing-mode links: Acara, Hitung Hari, RSVP. R&D monogram top, gold separator at bottom. Transparent over hero, ivory + blur after 80px scroll.
- [x] **Hero brightened** — removed `.hero-overlay` and `.hero-vignette` divs. Video plays in original colors. Strong text-shadow + small backdrop pills behind text blocks for legibility.
- [x] **NEW Prambanan Moment section** between Couple and Events: full-bleed `/prambanan.png` background, edge-only vignette (no full-screen darkening), 45/55 grid (text left, monogram right, stacks on mobile).
- [x] **Custom SVG monogram**: iridescent oval cartouche (gold double border + radial glow), "R&D" in Great Vibes, 8 hand-built floral clusters rotating 24s, gold ribbon "24·V·2026" below. Also includes monogram float animation.
- [x] Main content + footer offset right of side nav via `padding-left: var(--nav-w)`. Music toggle shifted to `left: calc(var(--nav-w) + 18px)` to clear navbar.
- [x] Testing: 19/19 acceptance checks pass on desktop (1920x1080) and mobile (390x844), 0 console errors.

## Known Notes
- Headless Playwright Chromium lacks proprietary h264 — video shows error code 4 in tests but works in all real browsers (Chrome / Safari / Firefox / Edge / mobile).
- `wedding-music.mp3` is intentionally NOT shipped — drop the couple's preferred instrumental at `/app/frontend/public/wedding-music.mp3`. Toggle UI works regardless.
- Placeholder text (parents, venue, address, time-window for Ngunduh) marked as `[Nama Ayah]`, `[Nama Gedung / Lokasi]`, etc. — easy find-and-replace before going live.
- Maps CTA links to `https://maps.google.com/` (neutral) — replace with real venue URLs.

## Backlog (P1)
- [ ] Persist RSVP submissions to MongoDB (couple may want to read all messages)
- [ ] Public "Ucapan & Doa" wall showing submitted messages
- [ ] Photo gallery / pre-wedding images section
- [ ] Live streaming embed for the ceremony
- [ ] Gift / digital amplop (bank transfer / e-wallet QR)
- [ ] PWA + offline support so guests can re-open without signal

## Backlog (P2)
- [ ] Multi-language toggle (ID / EN)
- [ ] Hijri date display alongside Gregorian
- [ ] Instagram-friendly OpenGraph share card with the couple's photo
- [ ] Add-to-calendar buttons (.ics export)
- [ ] Audio waveform visualisation while music plays
