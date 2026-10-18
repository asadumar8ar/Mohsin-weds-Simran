window.CARD_LOADED_STYLE = true;
window.CARD_CSS = `
/* ==========================================================================
   NIKAH CARD — card-style.js (premium build)
   All CSS for the exported invitation. Themes are switched by the
   [data-theme] attribute on <body>. No backticks or template placeholders
   are used anywhere inside this stylesheet.
   ========================================================================== */

/* ---------- FONT STACKS ---------- */
:root {
  --font-arabic: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif;
  --font-urdu: 'Noto Nastaliq Urdu', 'Amiri', serif;
  --font-kufi: 'Reem Kufi', 'Cormorant Garamond', sans-serif;
  --font-script: 'Great Vibes', 'Cormorant Garamond', cursive;
  --font-body: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
}

/* ==========================================================================
   THEME: GULABI (default — ivory, dusty rose, blush, antique gold)
   ========================================================================== */
:root, [data-theme="gulabi"] {
  --bg-0: #faf7f1;
  --bg-1: #f5eee4;
  --bg-2: #efe3d5;
  --bg-3: #e8d5c4;
  --ink: #3d2b24;
  --ink-soft: #5a4238;
  --ink-mute: #8a6f63;
  --gold: #c9a961;
  --gold-soft: #e5cb8f;
  --gold-strong: #f0dfa3;
  --gold-text: #8a6a2c;
  --gold-deep: #6f541f;
  --gold-foil-1: #e8d5a4;
  --gold-foil-2: #b89248;
  --rose: #b76e79;
  --rose-soft: #d99fa6;
  --rose-deep: #8e5560;
  --blush: #f0dcd8;
  --blush-deep: #e6c5c0;
  --line: rgba(200, 169, 97, 0.32);
  --line-soft: rgba(200, 169, 97, 0.15);
  --card: rgba(255, 252, 246, 0.86);
  --card-solid: #fdfaf4;
  --shadow: 0 22px 55px rgba(120, 80, 60, 0.14);
  --shadow-strong: 0 30px 70px rgba(100, 60, 45, 0.22);
  --glow: rgba(201, 169, 97, 0.4);
  --sky-1: #f3e4dc;
  --sky-2: #ecd5cd;
  --sky-3: #e0bcb8;
  --mosque: #c9b7ab;
  --envelope-1: #8e5560;
  --envelope-2: #6f3d48;
  --envelope-flap: #a06470;
  --envelope-line: rgba(232, 213, 164, 0.55);
  --seal-1: #f0d98c;
  --seal-2: #b89248;
  --seal-ink: #5a3d17;
  --btn-bg: linear-gradient(180deg, #d4b473 0%, #a8853a 100%);
  --btn-ink: #fffaf0;
  --btn-outline: #a8853a;
  --wa: #1e9e56;
  --wa-ink: #ffffff;
  --danger: #b3261e;
  --arch-bg: radial-gradient(ellipse at 50% 40%, #f5ece0 0%, #e8d5c4 70%, #dcc4b2 100%);
  --petal-jasmine: #fffaf0;
  --petal-rose: #e8b8bf;
  --petal-gold: #f0d98c;
}

/* ==========================================================================
   THEME: EMERALD
   ========================================================================== */
[data-theme="emerald"] {
  --bg-0: #020b08;
  --bg-1: #04150f;
  --bg-2: #06231a;
  --bg-3: #0a3326;
  --ink: #f6f1e4;
  --ink-soft: #cfe0d7;
  --ink-mute: #8fb3a3;
  --gold: #d4af37;
  --gold-soft: #f2d98a;
  --gold-strong: #ffe9ab;
  --gold-text: #f2d98a;
  --gold-deep: #9a7b1f;
  --gold-foil-1: #f2d98a;
  --gold-foil-2: #9a7b1f;
  --rose: #b76e79;
  --rose-soft: #d99fa6;
  --rose-deep: #8e5560;
  --blush: #2a4a3c;
  --blush-deep: #1a3528;
  --line: rgba(212, 175, 55, 0.28);
  --line-soft: rgba(212, 175, 55, 0.14);
  --card: rgba(8, 36, 27, 0.82);
  --card-solid: #08241b;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  --shadow-strong: 0 32px 70px rgba(0, 0, 0, 0.68);
  --glow: rgba(242, 217, 138, 0.35);
  --sky-1: #03110c;
  --sky-2: #06231a;
  --sky-3: #0a3326;
  --mosque: #031a12;
  --envelope-1: #0b3a2b;
  --envelope-2: #062a1f;
  --envelope-flap: #0e4634;
  --envelope-line: rgba(212, 175, 55, 0.55);
  --seal-1: #ffe9ab;
  --seal-2: #c8a53c;
  --seal-ink: #3a2a08;
  --btn-bg: linear-gradient(180deg, #f6dd94 0%, #d4af37 100%);
  --btn-ink: #08251b;
  --btn-outline: #d4af37;
  --wa: #25d366;
  --wa-ink: #04150f;
  --danger: #ff6b6b;
  --arch-bg: radial-gradient(ellipse at 50% 40%, #0a3326 0%, #06231a 60%, #04150f 100%);
  --petal-jasmine: #fff8e0;
  --petal-rose: #e8b8bf;
  --petal-gold: #f2d98a;
}

/* ==========================================================================
   THEME: MIDNIGHT
   ========================================================================== */
[data-theme="midnight"] {
  --bg-0: #030714;
  --bg-1: #071226;
  --bg-2: #0a1a36;
  --bg-3: #10264a;
  --ink: #eef2f8;
  --ink-soft: #c9d4e3;
  --ink-mute: #8fa1bd;
  --gold: #d6b25c;
  --gold-soft: #f3dc9c;
  --gold-strong: #ffeec2;
  --gold-text: #f3dc9c;
  --gold-deep: #8f7326;
  --gold-foil-1: #f3dc9c;
  --gold-foil-2: #8f7326;
  --rose: #c9a0a8;
  --rose-soft: #e0bcc2;
  --rose-deep: #8f6470;
  --blush: #1a2a48;
  --blush-deep: #0e1c33;
  --line: rgba(214, 178, 92, 0.28);
  --line-soft: rgba(214, 178, 92, 0.14);
  --card: rgba(9, 22, 44, 0.82);
  --card-solid: #09162c;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  --shadow-strong: 0 32px 74px rgba(0, 0, 0, 0.72);
  --glow: rgba(243, 220, 156, 0.32);
  --sky-1: #020512;
  --sky-2: #071226;
  --sky-3: #0a1a36;
  --mosque: #050d1f;
  --envelope-1: #10264a;
  --envelope-2: #0a1a36;
  --envelope-flap: #16325e;
  --envelope-line: rgba(214, 178, 92, 0.55);
  --seal-1: #ffeec2;
  --seal-2: #c7a244;
  --seal-ink: #3a2a08;
  --btn-bg: linear-gradient(180deg, #f3dc9c 0%, #c7a244 100%);
  --btn-ink: #061020;
  --btn-outline: #c7a244;
  --wa: #25d366;
  --wa-ink: #04150f;
  --danger: #ff6b6b;
  --arch-bg: radial-gradient(ellipse at 50% 40%, #0a1a36 0%, #071226 60%, #030714 100%);
  --petal-jasmine: #fff8e0;
  --petal-rose: #c9a0a8;
  --petal-gold: #f3dc9c;
}

/* ==========================================================================
   THEME: IVORY-SAGE
   ========================================================================== */
[data-theme="ivory-sage"] {
  --bg-0: #f6f3e9;
  --bg-1: #f3f0e6;
  --bg-2: #e9e6d8;
  --bg-3: #dfe3d4;
  --ink: #24322a;
  --ink-soft: #3d4f45;
  --ink-mute: #6b7f73;
  --gold: #8a6a1c;
  --gold-soft: #a9852a;
  --gold-strong: #b8942f;
  --gold-text: #6f5514;
  --gold-deep: #5a4410;
  --gold-foil-1: #d4bb7a;
  --gold-foil-2: #8a6a1c;
  --rose: #a88880;
  --rose-soft: #c4a59d;
  --rose-deep: #7d6159;
  --blush: #e5e8dc;
  --blush-deep: #d5dbc9;
  --line: rgba(122, 90, 18, 0.3);
  --line-soft: rgba(122, 90, 18, 0.14);
  --card: rgba(255, 255, 255, 0.78);
  --card-solid: #fbf9f1;
  --shadow: 0 22px 55px rgba(60, 52, 28, 0.16);
  --shadow-strong: 0 30px 70px rgba(60, 52, 28, 0.24);
  --glow: rgba(169, 133, 42, 0.3);
  --sky-1: #f6f3e9;
  --sky-2: #eef0e4;
  --sky-3: #e1e6d5;
  --mosque: #b9c4b4;
  --envelope-1: #dfe3d4;
  --envelope-2: #cfd7c2;
  --envelope-flap: #c5cdb7;
  --envelope-line: rgba(138, 106, 28, 0.5);
  --seal-1: #f6e3a6;
  --seal-2: #b8942f;
  --seal-ink: #5a4410;
  --btn-bg: linear-gradient(180deg, #b8942f 0%, #8a6a1c 100%);
  --btn-ink: #fffaf0;
  --btn-outline: #8a6a1c;
  --wa: #1e9e56;
  --wa-ink: #ffffff;
  --danger: #b3261e;
  --arch-bg: radial-gradient(ellipse at 50% 40%, #f8f6ec 0%, #eef0e4 60%, #e1e6d5 100%);
  --petal-jasmine: #ffffff;
  --petal-rose: #e5c5c0;
  --petal-gold: #d4bb7a;
}

/* ==========================================================================
   BASE RESET (scoped to .nikah-body so the builder is never touched)
   ========================================================================== */
.nikah-body,
.nikah-body *,
.nikah-body *::before,
.nikah-body *::after {
  box-sizing: border-box;
}

.nikah-body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink);
  background: radial-gradient(1200px 700px at 50% -10%, var(--bg-2) 0%, var(--bg-1) 45%, var(--bg-0) 100%);
  background-attachment: fixed;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
}

.nikah-body img { display: block; max-width: 100%; }
.nikah-body button { font: inherit; }
.nikah-body a { color: var(--gold-text); }
.nikah-body ::selection { background: var(--gold); color: var(--btn-ink); }

/* ==========================================================================
   OPENING SCENE — Dawat-Nama envelope with wax seal
   ========================================================================== */
.opening {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, var(--sky-3) 0%, var(--sky-2) 45%, var(--sky-1) 100%);
  transition: opacity 0.9s ease, visibility 0s linear 0.9s;
}

.opening.is-open {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* Soft gold ambient bloom behind the envelope */
.opening::before {
  content: "";
  position: absolute;
  top: 50%; left: 50%;
  width: 120vmin; height: 120vmin;
  transform: translate(-50%, -55%);
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22) 0%, transparent 62%);
  pointer-events: none;
  animation: openingBloom 6s ease-in-out infinite;
}

@keyframes openingBloom {
  0%, 100% { opacity: 0.65; transform: translate(-50%, -55%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -55%) scale(1.05); }
}

/* Floating rose petals in the background */
.opening-petals {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.op-petal {
  position: absolute;
  width: 14px; height: 10px;
  border-radius: 60% 40% 55% 45%;
  background: linear-gradient(135deg, var(--petal-rose), var(--petal-jasmine));
  opacity: 0.55;
  animation: opPetalFall linear infinite;
  box-shadow: 0 2px 4px rgba(120, 70, 60, 0.12);
}

@keyframes opPetalFall {
  0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.65; }
  100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
}

/* Envelope wrap */
.envelope-wrap {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.envelope {
  position: relative;
  width: 86vw;
  max-width: 360px;
  height: 234px;
  perspective: 1200px;
  transition: transform 0.85s cubic-bezier(0.34, 1.2, 0.4, 1);
}

.opening.is-opening .envelope {
  transform: translateY(-14px) scale(1.02);
}

.envelope-back {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 12px;
  background: linear-gradient(160deg, var(--envelope-2), var(--envelope-1));
  box-shadow:
    0 32px 70px rgba(60, 30, 30, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* optional envelope photo */
.envelope-back.has-image {
  background-size: cover;
  background-position: center;
}

.envelope-front {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 12px;
  border: 1px solid var(--envelope-line);
  background: linear-gradient(160deg, var(--envelope-1), var(--envelope-2));
  overflow: hidden;
}

/* Gold arabesque border on the envelope */
.envelope-front::before {
  content: "";
  position: absolute;
  top: 9px; right: 9px; bottom: 9px; left: 9px;
  border: 1px solid var(--envelope-line);
  border-radius: 7px;
  background-image:
    repeating-linear-gradient(45deg, transparent 0 10px, rgba(232, 213, 164, 0.18) 10px 11px),
    repeating-linear-gradient(-45deg, transparent 0 10px, rgba(232, 213, 164, 0.18) 10px 11px);
  pointer-events: none;
}

.envelope-front::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 50%;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.22));
  pointer-events: none;
}

/* Flap */
.envelope-flap {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 58%;
  z-index: 4;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background: linear-gradient(180deg, var(--envelope-flap), var(--envelope-1));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
  transition: transform 0.95s cubic-bezier(0.34, 1.05, 0.4, 1);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.18);
}

.envelope-flap::before {
  content: "";
  position: absolute;
  top: 10px; left: 12px; right: 12px; bottom: 10px;
  background-image:
    repeating-linear-gradient(45deg, transparent 0 9px, rgba(232, 213, 164, 0.16) 9px 10px);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.opening.is-opening .envelope-flap {
  transform: rotateX(180deg);
}

/* ============ WAX SEAL ============ */
.seal {
  position: absolute;
  top: 46%;
  left: 50%;
  z-index: 6;
  width: 104px;
  height: 104px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background:
    radial-gradient(circle at 32% 28%, var(--seal-1) 0%, var(--gold-foil-1) 30%, var(--seal-2) 75%, var(--gold-foil-2) 100%);
  color: var(--seal-ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 0 5px rgba(201, 169, 97, 0.18),
    0 0 0 10px rgba(201, 169, 97, 0.06),
    0 10px 24px rgba(80, 40, 20, 0.35),
    inset 0 -3px 6px rgba(80, 40, 20, 0.22),
    inset 0 3px 6px rgba(255, 255, 255, 0.4);
  transition: transform 0.55s cubic-bezier(0.34, 1.2, 0.4, 1), opacity 0.55s ease;
  -webkit-tap-highlight-color: transparent;
}

.seal::before {
  content: "";
  position: absolute;
  top: 6px; right: 6px; bottom: 6px; left: 6px;
  border-radius: 50%;
  border: 1px dashed rgba(90, 61, 23, 0.32);
  pointer-events: none;
}

.seal:hover { transform: translate(-50%, -50%) scale(1.06); }
.seal:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 5px; }

.seal-initials {
  font-family: var(--font-script);
  font-size: 30px;
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--seal-ink);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.seal-crescent {
  font-size: 13px;
  line-height: 1;
  opacity: 0.78;
}

.opening.is-opening .seal {
  transform: translate(-50%, -50%) scale(0.4) rotate(22deg);
  opacity: 0;
}

/* Crack fragments that fly out */
.seal-crack {
  position: absolute;
  top: 46%;
  left: 50%;
  width: 6px;
  height: 12px;
  background: linear-gradient(180deg, var(--seal-1), var(--seal-2));
  border-radius: 2px;
  z-index: 7;
  pointer-events: none;
  animation: crackFly 0.95s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
  box-shadow: 0 2px 6px rgba(80, 40, 20, 0.4);
}

@keyframes crackFly {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px))) rotate(var(--rot, 180deg)) scale(0.3);
    opacity: 0;
  }
}

/* Gold sparkle burst */
.sparkle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold-strong);
  box-shadow: 0 0 8px 2px var(--gold-soft);
  pointer-events: none;
  z-index: 8;
  animation: sparkleFly 0.9s ease-out forwards;
}

@keyframes sparkleFly {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px))) scale(0.2);
    opacity: 0;
  }
}

/* Tap hint */
.seal-tap {
  margin: 0;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold-text);
  animation: sealPulse 2.2s ease-in-out infinite;
}

@keyframes sealPulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

/* Card slides up + scales to fill the screen */
.card-main {
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(40px) scale(0.94);
  transition: opacity 1s ease 0.35s, transform 1.1s cubic-bezier(0.34, 1, 0.4, 1) 0.2s;
}

.card-main.is-ready {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ==========================================================================
   GENERIC SECTION SCAFFOLDING
   ========================================================================== */
.section {
  position: relative;
  padding: 64px 20px;
  overflow: hidden;
}

.section-inner {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
}

.section-title {
  margin: 0 0 18px;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold-text);
  text-align: center;
}

.section-title::before,
.section-title::after {
  content: "";
  display: inline-block;
  width: 32px;
  height: 1px;
  vertical-align: middle;
  margin: 0 12px;
  background: var(--line);
}

.divider {
  width: 80px;
  height: 1px;
  margin: 22px auto;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.arabic {
  font-family: var(--font-arabic);
  font-size: 26px;
  line-height: 1.95;
  text-align: center;
  color: var(--gold-text);
  direction: rtl;
  margin: 0;
}

.body-text {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.8;
  color: var(--ink-soft);
  text-align: center;
  margin: 10px 0;
}

.small-text {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--ink-mute);
  text-align: center;
  margin: 8px 0;
}

/* Scroll-reveal helper */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.stagger > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.reveal.is-visible .stagger > * {
  opacity: 1;
  transform: translateY(0);
}

.reveal.is-visible .stagger > *:nth-child(1) { transition-delay: 0.05s; }
.reveal.is-visible .stagger > *:nth-child(2) { transition-delay: 0.12s; }
.reveal.is-visible .stagger > *:nth-child(3) { transition-delay: 0.19s; }
.reveal.is-visible .stagger > *:nth-child(4) { transition-delay: 0.26s; }
.reveal.is-visible .stagger > *:nth-child(5) { transition-delay: 0.33s; }
.reveal.is-visible .stagger > *:nth-child(6) { transition-delay: 0.40s; }
.reveal.is-visible .stagger > *:nth-child(7) { transition-delay: 0.47s; }
.reveal.is-visible .stagger > *:nth-child(8) { transition-delay: 0.54s; }
.reveal.is-visible .stagger > *:nth-child(9) { transition-delay: 0.61s; }
.reveal.is-visible .stagger > *:nth-child(10) { transition-delay: 0.68s; }

/* ==========================================================================
   SIGNATURE CUTS (per-section reveal masks)
   ========================================================================== */
.cut-arch {
  clip-path: polygon(50% 0%, 55% 4%, 62% 14%, 68% 26%, 72% 40%, 75% 56%, 76% 100%, 24% 100%, 25% 56%, 28% 40%, 32% 26%, 38% 14%, 45% 4%);
  transition: clip-path 1.05s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.cut-arch.is-visible {
  clip-path: polygon(0% 100%, 0% 55%, 4% 30%, 12% 12%, 24% 2%, 38% 0%, 50% 0%, 62% 0%, 76% 2%, 88% 12%, 96% 30%, 100% 55%, 100% 100%);
}

.cut-circle {
  clip-path: circle(0% at 50% 45%);
  transition: clip-path 1s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.cut-circle.is-visible {
  clip-path: circle(85% at 50% 45%);
}

.cut-curtain::before,
.cut-curtain::after {
  content: "";
  position: absolute;
  top: 0; bottom: 0;
  width: 50%;
  background: var(--bg-2);
  z-index: 3;
  pointer-events: none;
  transition: clip-path 1s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.cut-curtain::before { left: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
.cut-curtain::after { right: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
.cut-curtain.is-visible::before { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
.cut-curtain.is-visible::after { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }

/* ==========================================================================
   HERO (blurred background + optional soft video + filigree corners)
   ========================================================================== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 90px 22px 140px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse at 50% 30%, var(--blush) 0%, var(--bg-2) 45%, var(--bg-1) 100%);
}

.hero-bg.has-image {
  background-size: cover;
  background-position: center;
}

.hero-bg-image {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  filter: blur(18px) saturate(0.9);
  opacity: 0.55;
  transform: scale(1.12);
  z-index: 0;
}

.hero-bg-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    linear-gradient(180deg, rgba(255, 250, 240, 0.4) 0%, rgba(245, 238, 228, 0.35) 60%, var(--bg-1) 100%),
    radial-gradient(ellipse at 50% 30%, transparent 30%, var(--bg-1) 90%);
  z-index: 1;
}

[data-theme="emerald"] .hero-bg-overlay,
[data-theme="midnight"] .hero-bg-overlay {
  background:
    linear-gradient(180deg, rgba(4, 21, 15, 0.45) 0%, rgba(4, 21, 15, 0.35) 60%, var(--bg-1) 100%),
    radial-gradient(ellipse at 50% 30%, transparent 30%, var(--bg-1) 90%);
}

/* optional video */
.hero-video {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.32;
  filter: blur(2px) saturate(0.9);
  z-index: 0;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 4;
  text-align: center;
  max-width: 660px;
  width: 100%;
}

/* Corner florals via the floral frame PNG, layered for parallax */
.floral-corner {
  position: absolute;
  width: 120px;
  height: 120px;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.85;
  z-index: 3;
  pointer-events: none;
}

.floral-corner.tl { top: 0; left: 0; }
.floral-corner.tr { top: 0; right: 0; transform: scaleX(-1); }
.floral-corner.bl { bottom: 0; left: 0; transform: scaleY(-1); }
.floral-corner.br { bottom: 0; right: 0; transform: scale(-1, -1); }

/* CSS fallback florals when no PNG */
.floral-corner.fallback {
  background:
    radial-gradient(circle at 30% 30%, var(--rose-soft) 0 8px, transparent 9px),
    radial-gradient(circle at 55% 22%, var(--petal-jasmine) 0 6px, transparent 7px),
    radial-gradient(circle at 25% 55%, var(--rose-soft) 0 10px, transparent 11px),
    radial-gradient(circle at 45% 60%, var(--petal-gold) 0 5px, transparent 6px),
    radial-gradient(circle at 60% 45%, var(--rose) 0 7px, transparent 8px);
  filter: drop-shadow(0 3px 6px rgba(120, 70, 60, 0.15));
}

/* small crescent ornament (allowed, but very small) */
.hero-crescent {
  display: inline-block;
  font-size: 18px;
  color: var(--gold-text);
  margin: 0 0 8px;
  opacity: 0.75;
}

.hero-bismillah-ar {
  font-family: var(--font-arabic);
  font-size: 26px;
  line-height: 1.85;
  color: var(--gold-text);
  margin: 0 0 8px;
  direction: rtl;
}

.hero-bismillah-en {
  font-family: var(--font-body);
  font-size: 13px;
  font-style: italic;
  color: var(--ink-mute);
  margin: 0 0 30px;
  letter-spacing: 0.02em;
}

/* Couple photo inside an arch frame */
.couple-photo {
  display: none;
  position: relative;
  width: 190px;
  height: 240px;
  margin: 0 auto 22px;
  border-radius: 95px 95px 8px 8px;
  overflow: hidden;
  border: 3px solid var(--gold);
  box-shadow: 0 12px 30px rgba(120, 70, 60, 0.24), inset 0 0 0 2px var(--card-solid);
}

.couple-photo.has-image { display: block; }
.couple-photo img { width: 100%; height: 100%; object-fit: cover; }

/* Names */
.hero-names {
  margin: 0 0 22px;
  font-family: var(--font-script);
  font-size: 52px;
  line-height: 1.05;
  color: var(--gold-text);
  text-shadow: 0 0 24px rgba(201, 169, 97, 0.3);
}

.hero-names .name {
  display: inline-block;
  position: relative;
}

/* Ink-writing effect applied per character */
.ink-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(8px);
  animation: inkIn 0.42s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.06s);
}

@keyframes inkIn {
  to { opacity: 1; transform: translateY(0); }
}

/* A soft pen-tip dot at the end of each name */
.hero-names .name::after {
  content: "";
  position: absolute;
  right: -8px;
  top: 46%;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gold-strong);
  box-shadow: 0 0 10px 3px var(--glow);
  opacity: 0;
  animation: penDot 2.8s ease-in-out 1.8s infinite;
}

@keyframes penDot {
  0%, 40% { opacity: 0; }
  50%, 90% { opacity: 0.9; }
  100% { opacity: 0; }
}

.hero-amp {
  display: block;
  font-size: 34px;
  opacity: 0.75;
  margin: 6px 0;
  color: var(--gold-text);
}

.hero-date {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0;
}

/* Old-school scroll cue */
.hero-scroll-cue {
  position: absolute;
  bottom: 34px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 12px;
  z-index: 4;
}

.hero-scroll-cue::after {
  content: "";
  position: absolute;
  top: 7px; left: 50%;
  width: 3px; height: 8px;
  margin-left: -1px;
  border-radius: 2px;
  background: var(--gold);
  animation: scrollCue 2s ease-in-out infinite;
}

@keyframes scrollCue {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(12px); opacity: 1; }
}

/* Petals canvas overlay */
.petals-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 2;
}

/* ==========================================================================
   MEHRAAB CORRIDOR (signature pinned scroll stage)
   ========================================================================== */
.corridor {
  position: relative;
  height: 450vh;
  background: var(--arch-bg);
  overflow: hidden;
}

.corridor.is-fallback {
  height: auto;
  padding: 60px 20px 40px;
  background: var(--arch-bg);
}

.corridor-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  perspective: 900px;
  perspective-origin: 50% 50%;
  overflow: hidden;
}

.arch-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(88vw, 460px);
  height: min(88vw, 460px);
  margin-left: calc(min(88vw, 460px) / -2);
  margin-top: calc(min(88vw, 460px) / -2);
  transform-style: preserve-3d;
  will-change: transform, opacity, filter;
  transition: none;
}

/* Mehraab clip-path on each arch */
.arch-frame {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50% 50% 6px 6px / 58% 58% 6px 6px;
  clip-path: polygon(
    50% 0%,
    58% 3%, 66% 9%, 73% 18%, 79% 30%, 83% 44%, 85% 60%, 86% 100%,
    14% 100%,
    15% 60%, 17% 44%, 21% 30%, 27% 18%, 34% 9%, 42% 3%
  );
  background: var(--card);
  border: 2px solid var(--gold);
  box-shadow:
    0 0 0 6px rgba(201, 169, 97, 0.12),
    0 24px 60px rgba(80, 40, 30, 0.22),
    inset 0 0 60px rgba(232, 213, 164, 0.15);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 30px;
}

.arch-frame::before {
  content: "";
  position: absolute;
  top: 6px; right: 6px; bottom: 6px; left: 6px;
  border: 1px solid var(--line);
  border-radius: 50% 50% 4px 4px / 58% 58% 4px 4px;
  pointer-events: none;
}

.arch-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 100%;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.arch-layer.is-active .arch-content {
  opacity: 1;
  transform: translateY(0);
}

/* soft gold bloom between arches */
.arch-bloom {
  position: absolute;
  top: 50%; left: 50%;
  width: 60vmin; height: 60vmin;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(232, 213, 164, 0.55) 0%, transparent 65%);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.9s ease;
}

.arch-bloom.is-lit { opacity: 1; }

/* Fallback stacked sections */
.corridor-fallback .arch-frame {
  position: relative;
  top: 0; left: 0;
  margin: 0 auto 30px;
  width: min(90vw, 460px);
  height: auto;
  min-height: 320px;
}

/* content inside each arch block */
.arch-title-ar {
  font-family: var(--font-arabic);
  font-size: 24px;
  line-height: 1.85;
  color: var(--gold-text);
  margin: 0 0 8px;
  direction: rtl;
}

.arch-sub {
  font-family: var(--font-body);
  font-size: 13px;
  font-style: italic;
  color: var(--ink-mute);
  margin: 0 0 14px;
}

.arch-names {
  font-family: var(--font-script);
  font-size: 46px;
  line-height: 1.05;
  color: var(--gold-text);
  margin: 0 0 10px;
}

.arch-names .ink-letter { display: inline-block; }

.arch-date-big {
  font-family: var(--font-script);
  font-size: 40px;
  line-height: 1.1;
  color: var(--gold-text);
  margin: 0 0 4px;
}

.arch-date-small {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0 0 8px;
}

.arch-body-text {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-soft);
  margin: 8px 0;
}

.arch-ayah {
  font-family: var(--font-arabic);
  font-size: 20px;
  line-height: 1.9;
  color: var(--gold-text);
  margin: 8px 0;
  direction: rtl;
}

.arch-ayah-en {
  font-family: var(--font-body);
  font-size: 13px;
  font-style: italic;
  color: var(--ink-mute);
  margin: 4px 0 0;
}

.arch-ref {
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-mute);
  margin: 10px 0 0;
  text-transform: uppercase;
}

/* ==========================================================================
   SCRATCH TO REVEAL
   ========================================================================== */
.scratch-section {
  padding: 60px 20px 80px;
  background: var(--bg-1);
}

.scratch-stage {
  position: relative;
  width: min(90vw, 400px);
  height: min(72vh, 500px);
  margin: 0 auto;
  border-radius: 50% 50% 10px 10px / 30% 30% 10px 10px;
  overflow: hidden;
  box-shadow:
    0 0 0 3px var(--gold),
    0 0 0 8px rgba(201, 169, 97, 0.18),
    0 26px 60px rgba(80, 40, 30, 0.22);
  background: var(--card-solid);
}

.scratch-under {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 26px;
  background:
    radial-gradient(circle at 50% 35%, var(--blush) 0%, var(--bg-2) 65%, var(--bg-3) 100%);
  z-index: 1;
}

.scratch-under .label {
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold-text);
  margin: 0 0 12px;
}

.scratch-under .scratch-names {
  font-family: var(--font-script);
  font-size: 40px;
  line-height: 1.05;
  color: var(--gold-text);
  margin: 0 0 12px;
}

.scratch-under .scratch-date {
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--ink-soft);
  margin: 0;
}

.scratch-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 3;
  cursor: crosshair;
  touch-action: none;
  border-radius: 50% 50% 10px 10px / 30% 30% 10px 10px;
}

.scratch-stage.is-revealed .scratch-canvas {
  pointer-events: none;
  transition: opacity 1s ease;
  opacity: 0;
}

.scratch-hint {
  position: absolute;
  top: 20px; left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  padding: 7px 14px;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--btn-ink);
  background: var(--gold);
  border-radius: 999px;
  pointer-events: none;
  opacity: 0.9;
  animation: hintFloat 2.4s ease-in-out infinite;
}

.scratch-stage.is-revealed .scratch-hint { display: none; }

@keyframes hintFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.85; }
  50% { transform: translateX(-50%) translateY(-4px); opacity: 1; }
}

.scratch-reveal-btn {
  display: block;
  margin: 20px auto 0;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: transparent;
  color: var(--gold-text);
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.12em;
  cursor: pointer;
}

.scratch-reveal-btn:hover { background: rgba(201, 169, 97, 0.14); }
.scratch-reveal-btn:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 3px; }

/* ==========================================================================
   GOLD LIGHT SWEEP (diagonal divider before a section)
   ========================================================================== */
.gold-sweep {
  position: relative;
  height: 1px;
  margin: 20px auto;
  width: 80%;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  overflow: hidden;
}

.gold-sweep::before {
  content: "";
  position: absolute;
  top: -2px; left: -40%;
  width: 40%;
  height: 5px;
  background: linear-gradient(90deg, transparent, var(--gold-strong), transparent);
  filter: blur(1px);
  animation: sweepLine 3.2s ease-in-out infinite;
}

@keyframes sweepLine {
  0% { left: -40%; }
  100% { left: 100%; }
}

/* ==========================================================================
   PROGRAMME (parchment unroll + timeline + flip cards)
   ========================================================================== */
.programme-section {
  padding: 40px 20px 80px;
  background: var(--bg-1);
}

.parchment {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  padding: 28px 22px 34px;
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent 0 28px, rgba(200, 169, 97, 0.045) 28px 29px),
    linear-gradient(180deg, var(--card-solid), var(--bg-2));
  box-shadow:
    0 0 0 1px var(--line),
    inset 0 0 60px rgba(201, 169, 97, 0.08),
    0 20px 50px rgba(80, 40, 30, 0.16);
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 1.4s ease, opacity 0.9s ease, padding 1.2s ease;
}

.parchment.is-open {
  max-height: 2400px;
  opacity: 1;
}

.parchment::before,
.parchment::after {
  content: "";
  position: absolute;
  left: 0; right: 0;
  height: 14px;
  background:
    radial-gradient(circle at 10px 7px, var(--bg-2) 3px, transparent 4px) 0 0 / 20px 14px repeat-x;
  pointer-events: none;
}

.parchment::before { top: -6px; transform: rotate(180deg); }
.parchment::after { bottom: -6px; }

.events-timeline {
  position: relative;
  margin-top: 12px;
  padding: 14px 0 0 28px;
}

/* The gold line draws down as the section reveals */
.events-timeline::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--gold), var(--gold-soft), transparent);
  transform-origin: top center;
  transform: scaleY(0);
  transition: transform 1.4s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.parchment.is-open .events-timeline::before {
  transform: scaleY(1);
}

.event-row {
  position: relative;
  margin-bottom: 20px;
}

.event-row::before {
  content: "";
  position: absolute;
  left: -24px;
  top: 30px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  background: var(--bg-1);
  z-index: 2;
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.15);
}

.event-card {
  position: relative;
  perspective: 900px;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.event-card-inner {
  position: relative;
  width: 100%;
  min-height: 176px;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.1, 0.4, 1);
}

.event-card.is-flipped .event-card-inner {
  transform: rotateY(180deg);
}

.event-face {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--card);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.event-face-back {
  transform: rotateY(180deg);
  justify-content: flex-start;
  overflow-y: auto;
}

.event-front-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.event-name {
  font-family: var(--font-kufi);
  font-size: 18px;
  letter-spacing: 0.08em;
  color: var(--gold-text);
  margin: 0;
}

.event-date {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink-soft);
  margin: 0;
}

.event-time {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-mute);
  text-transform: uppercase;
  margin: 0;
}

.event-badge-main {
  display: inline-block;
  align-self: center;
  margin-top: 6px;
  padding: 3px 10px;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--btn-ink);
  background: var(--btn-bg);
  border-radius: 999px;
}

.event-back-line {
  margin: 0 0 8px;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  color: var(--ink-soft);
  text-align: left;
}

.event-back-line strong {
  display: block;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold-text);
  margin-bottom: 2px;
  font-weight: 500;
}

.event-flip-hint {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-family: var(--font-kufi);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mute);
  opacity: 0.65;
}

/* ==========================================================================
   COUNTDOWN (flip clock)
   ========================================================================== */
.countdown-section {
  padding: 70px 20px;
  text-align: center;
  background: var(--bg-1);
}

.countdown-label {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-text);
  margin: 0 0 6px;
}

.countdown-event-name {
  font-family: var(--font-script);
  font-size: 30px;
  color: var(--gold-text);
  margin: 0 0 22px;
}

.countdown-grid {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.countdown-flip {
  display: inline-flex;
  gap: 3px;
}

.countdown-digit {
  display: inline-block;
  min-width: 36px;
  height: 52px;
  line-height: 50px;
  text-align: center;
  background: var(--card-solid);
  border: 1px solid var(--line);
  border-radius: 6px;
  font-family: var(--font-kufi);
  font-size: 24px;
  font-weight: 600;
  color: var(--gold-text);
  box-shadow:
    inset 0 -3px 0 rgba(0, 0, 0, 0.08),
    0 6px 14px rgba(80, 40, 30, 0.1);
  transform-style: preserve-3d;
}

.countdown-digit.flipping {
  animation: digitFlip 0.55s ease;
}

@keyframes digitFlip {
  0% { transform: rotateX(0); }
  45% { transform: rotateX(-90deg); }
  55% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}

.countdown-caption {
  font-family: var(--font-kufi);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

.countdown-done {
  font-family: var(--font-script);
  font-size: 30px;
  color: var(--gold-text);
  margin: 10px 0;
}

.countdown-target-date {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-mute);
  margin: 16px 0 0;
}

/* ==========================================================================
   VENUE
   ========================================================================== */
.venue-section {
  padding: 70px 20px;
  background: var(--bg-2);
}

.venue-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 0 18px;
}

.venue-tab {
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.08em;
  padding: 8px 15px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.venue-tab:hover { border-color: var(--gold); color: var(--gold-text); }
.venue-tab:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 2px; }

.venue-tab.active {
  background: var(--btn-bg);
  border-color: var(--gold);
  color: var(--btn-ink);
  font-weight: 600;
}

.venue-panel {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 20px;
  background: var(--card);
  box-shadow: var(--shadow);
}

.venue-panel[hidden] { display: none; }

.venue-name {
  font-family: var(--font-kufi);
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--gold-text);
  margin: 0 0 10px;
  text-align: center;
}

.venue-address {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-soft);
  text-align: center;
  margin: 0 0 16px;
  white-space: pre-line;
}

.venue-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ==========================================================================
   BUTTONS (shared)
   ========================================================================== */
.btn-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.1em;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--btn-outline);
  background: transparent;
  color: var(--gold-text);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
}

.btn-card:hover { background: rgba(201, 169, 97, 0.14); }
.btn-card:active { transform: translateY(1px); }
.btn-card:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 2px; }

.btn-card-gold {
  background: var(--btn-bg);
  color: var(--btn-ink);
  border-color: var(--gold);
  font-weight: 600;
}

.btn-card-gold:hover { background: var(--btn-bg); opacity: 0.92; }

.btn-card-wa {
  background: var(--wa);
  border-color: var(--wa);
  color: var(--wa-ink);
  font-weight: 600;
}

.btn-card-wa:hover { background: var(--wa); opacity: 0.9; }

/* ==========================================================================
   STORY + GALLERY (swipeable polaroid stack)
   ========================================================================== */
.story-section {
  padding: 80px 20px;
  background: var(--bg-1);
}

.story-text {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.85;
  color: var(--ink-soft);
  text-align: center;
  white-space: pre-line;
  margin: 0;
}

/* Polaroid stack */
.polaroid-stack {
  position: relative;
  width: min(78vw, 260px);
  height: min(78vw, 320px);
  margin: 26px auto 0;
  perspective: 900px;
}

.polaroid {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  padding: 10px 10px 34px;
  background: var(--card-solid);
  border-radius: 4px;
  box-shadow:
    0 12px 30px rgba(80, 40, 30, 0.22),
    0 0 0 1px rgba(200, 169, 97, 0.28);
  cursor: grab;
  transition: transform 0.5s cubic-bezier(0.34, 1.1, 0.4, 1), opacity 0.4s ease;
  will-change: transform;
}

.polaroid:active { cursor: grabbing; }

.polaroid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
  pointer-events: none;
  user-select: none;
}

.polaroid::after {
  content: "";
  position: absolute;
  bottom: 10px; left: 50%;
  width: 44px; height: 10px;
  margin-left: -22px;
  background: radial-gradient(ellipse at center, var(--gold) 0%, transparent 70%);
  opacity: 0.65;
}

.polaroid:nth-child(1) { transform: translateY(0) rotate(-3deg); z-index: 6; }
.polaroid:nth-child(2) { transform: translateY(10px) rotate(3deg) scale(0.96); z-index: 5; opacity: 0.95; }
.polaroid:nth-child(3) { transform: translateY(20px) rotate(-2deg) scale(0.92); z-index: 4; opacity: 0.85; }
.polaroid:nth-child(4) { transform: translateY(30px) rotate(2deg) scale(0.88); z-index: 3; opacity: 0.75; }
.polaroid:nth-child(5) { transform: translateY(40px) scale(0.84); z-index: 2; opacity: 0.6; }
.polaroid:nth-child(n+6) { transform: translateY(46px) scale(0.8); z-index: 1; opacity: 0.45; }

.gallery-hint {
  margin: 14px 0 0;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
  color: var(--ink-mute);
}

/* ==========================================================================
   DUA
   ========================================================================== */
.dua-section {
  padding: 70px 20px;
  text-align: center;
  background: var(--bg-1);
}

.dua-arabic {
  font-family: var(--font-arabic);
  font-size: 22px;
  line-height: 2;
  text-align: center;
  color: var(--gold-text);
  margin: 0 0 14px;
  direction: rtl;
}

.dua-translation {
  font-family: var(--font-body);
  font-size: 15px;
  font-style: italic;
  line-height: 1.75;
  text-align: center;
  color: var(--ink-soft);
  margin: 0;
}

/* ==========================================================================
   RSVP
   ========================================================================== */
.rsvp-section {
  padding: 70px 20px;
  background: var(--bg-2);
}

.rsvp-note {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.65;
  text-align: center;
  color: var(--ink-soft);
  margin: 0 0 18px;
}

.rsvp-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.rsvp-calendar-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 16px 0 0;
}

.contact-list {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  text-align: center;
}

.contact-list li {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  margin: 5px 0;
}

.contact-list a {
  color: var(--gold-text);
  text-decoration: none;
  border-bottom: 1px dotted var(--line);
}

/* ==========================================================================
   FOOTER
   ========================================================================== */
.footer-section {
  padding: 80px 20px 100px;
  text-align: center;
  background: var(--bg-1);
}

.footer-thanks {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-soft);
  margin: 0 0 12px;
  white-space: pre-line;
}

.footer-family {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--gold-text);
  margin: 0 0 8px;
}

.footer-closing {
  font-family: var(--font-script);
  font-size: 28px;
  color: var(--gold-text);
  margin: 18px 0 22px;
}

.footer-share {
  margin-top: 10px;
}

/* ==========================================================================
   MUTE BUTTON
   ========================================================================== */
.mute-btn {
  position: fixed;
  left: 14px;
  bottom: 14px;
  z-index: 40;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--card-solid);
  color: var(--gold-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow);
  transition: transform 0.18s ease;
}

.mute-btn:hover { transform: scale(1.06); }
.mute-btn:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 3px; }

/* ==========================================================================
   TABLET / DESKTOP
   ========================================================================== */
@media (min-width: 640px) {
  .hero-names { font-size: 66px; }
  .hero-amp { font-size: 38px; }
  .hero-bismillah-ar { font-size: 30px; }
  .arabic { font-size: 30px; }
  .section { padding: 90px 30px; }
  .countdown-digit { min-width: 44px; height: 60px; line-height: 58px; font-size: 26px; }
  .polaroid-stack { width: 320px; height: 400px; }
  .rsvp-actions { flex-direction: row; justify-content: center; }
  .arch-names { font-size: 56px; }
  .arch-date-big { font-size: 46px; }
}

@media (min-width: 900px) {
  .hero-names { font-size: 82px; }
  .hero-amp { font-size: 46px; }
  .hero-bismillah-ar { font-size: 34px; }
  .section { padding: 100px 40px; }
  .arch-layer { width: 520px; height: 520px; margin-left: -260px; margin-top: -260px; }
  .arch-frame { padding: 50px 34px 34px; }
}

/* ==========================================================================
   REDUCED MOTION — collapse every non-ambient animation
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .opening::before,
  .op-petal,
  .seal-tap,
  .hero-scroll-cue::after,
  .hero-names .name::after,
  .gold-sweep::before,
  .scratch-hint,
  .mute-btn:hover,
  .seal:hover {
    animation: none !important;
  }

  .card-main,
  .card-main.is-ready {
    transition: none !important;
  }

  .card-main { opacity: 1 !important; transform: none !important; }

  .reveal,
  .reveal.is-visible,
  .stagger > *,
  .event-card-inner,
  .polaroid,
  .countdown-digit,
  .arch-content {
    transition: none !important;
    transform: none !important;
    animation: none !important;
    opacity: 1 !important;
  }

  .cut-arch,
  .cut-circle,
  .cut-curtain::before,
  .cut-curtain::after {
    clip-path: none !important;
    transition: none !important;
  }

  .corridor { height: auto !important; padding: 60px 20px 40px !important; }
  .corridor-sticky { position: static !important; height: auto !important; perspective: none !important; }
  .arch-layer { position: relative !important; margin: 0 auto 30px !important; top: auto !important; left: auto !important; transform: none !important; }
  .arch-content { opacity: 1 !important; }

  .parchment { max-height: none !important; opacity: 1 !important; }
  .events-timeline::before { transform: scaleY(1) !important; transition: none !important; }

  .petals-canvas { display: none !important; }
  .hero-bg-image,
  .hero-video { display: none !important; }

  .scratch-canvas { display: none !important; }
  .scratch-stage.is-revealed .scratch-canvas { display: none !important; }
}
`;
// END OF FILE card-style.js
