window.CARD_LOADED_STYLE = true;
window.CARD_CSS = `
/* ==========================================================================
   NIKAH CARD — card-style.js
   All CSS for the exported invitation. Themes are switched by the
   [data-theme] attribute on <body>. No backticks or template placeholders
   are used inside this stylesheet.
   ========================================================================== */

/* ---------- FONT STACKS ---------- */
:root {
  --font-arabic: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif;
  --font-urdu: 'Noto Nastaliq Urdu', 'Amiri', serif;
  --font-kufi: 'Reem Kufi', 'Cormorant Garamond', sans-serif;
  --font-script: 'Great Vibes', 'Cormorant Garamond', cursive;
  --font-body: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
}

/* ---------- THEME: EMERALD (default) ---------- */
:root,
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
  --line: rgba(212, 175, 55, 0.28);
  --line-soft: rgba(212, 175, 55, 0.14);
  --card: rgba(8, 36, 27, 0.82);
  --card-solid: #08241b;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  --glow: rgba(242, 217, 138, 0.35);
  --sky-1: #03110c;
  --sky-2: #06231a;
  --sky-3: #0a3326;
  --mosque: #031a12;
  --envelope-1: #0b3a2b;
  --envelope-2: #062a1f;
  --envelope-flap: #0e4634;
  --seal-1: #ffe9ab;
  --seal-2: #c8a53c;
  --btn-bg: linear-gradient(180deg, #f6dd94 0%, #d4af37 100%);
  --btn-ink: #08251b;
  --wa: #25d366;
  --wa-ink: #04150f;
  --danger: #ff6b6b;
}

/* ---------- THEME: MIDNIGHT ---------- */
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
  --line: rgba(214, 178, 92, 0.28);
  --line-soft: rgba(214, 178, 92, 0.14);
  --card: rgba(9, 22, 44, 0.82);
  --card-solid: #09162c;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  --glow: rgba(243, 220, 156, 0.32);
  --sky-1: #020512;
  --sky-2: #071226;
  --sky-3: #0a1a36;
  --mosque: #050d1f;
  --envelope-1: #10264a;
  --envelope-2: #0a1a36;
  --envelope-flap: #16325e;
  --seal-1: #ffeec2;
  --seal-2: #c7a244;
  --btn-bg: linear-gradient(180deg, #f3dc9c 0%, #c7a244 100%);
  --btn-ink: #061020;
  --wa: #25d366;
  --wa-ink: #04150f;
  --danger: #ff6b6b;
}

/* ---------- THEME: IVORY-SAGE (light) ---------- */
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
  --line: rgba(122, 90, 18, 0.28);
  --line-soft: rgba(122, 90, 18, 0.14);
  --card: rgba(255, 255, 255, 0.76);
  --card-solid: #fbf9f1;
  --shadow: 0 24px 60px rgba(60, 52, 28, 0.18);
  --glow: rgba(169, 133, 42, 0.28);
  --sky-1: #f6f3e9;
  --sky-2: #eef0e4;
  --sky-3: #e1e6d5;
  --mosque: #b9c4b4;
  --envelope-1: #e9e6d8;
  --envelope-2: #dfe3d4;
  --envelope-flap: #d3dcc8;
  --seal-1: #f6e3a6;
  --seal-2: #b8942f;
  --btn-bg: linear-gradient(180deg, #b8942f 0%, #8a6a1c 100%);
  --btn-ink: #fffaf0;
  --wa: #1e9e56;
  --wa-ink: #ffffff;
  --danger: #b3261e;
}

/* ---------- THEME: ROSE-GOLD ---------- */
[data-theme="rose-gold"] {
  --bg-0: #1a0a10;
  --bg-1: #2a0f18;
  --bg-2: #3a1622;
  --bg-3: #4b1d2d;
  --ink: #fbeef1;
  --ink-soft: #ecd2d9;
  --ink-mute: #c49aa6;
  --gold: #e0a9a0;
  --gold-soft: #f5c9c1;
  --gold-strong: #ffd9d2;
  --gold-text: #f5c9c1;
  --gold-deep: #a56862;
  --line: rgba(224, 169, 160, 0.28);
  --line-soft: rgba(224, 169, 160, 0.14);
  --card: rgba(45, 16, 25, 0.82);
  --card-solid: #2d1019;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  --glow: rgba(245, 201, 193, 0.32);
  --sky-1: #14070b;
  --sky-2: #2a0f18;
  --sky-3: #3a1622;
  --mosque: #1c0a11;
  --envelope-1: #4b1d2d;
  --envelope-2: #3a1622;
  --envelope-flap: #5a2436;
  --seal-1: #ffd9d2;
  --seal-2: #c98a8a;
  --btn-bg: linear-gradient(180deg, #f5c9c1 0%, #c98a8a 100%);
  --btn-ink: #2a0f18;
  --wa: #25d366;
  --wa-ink: #04150f;
  --danger: #ff8a80;
}

/* ==========================================================================
   BASE RESET (scoped to the card body so it never touches the builder)
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
}

.nikah-body img {
  display: block;
  max-width: 100%;
}

.nikah-body button {
  font: inherit;
}

.nikah-body a {
  color: var(--gold-text);
}

.nikah-body ::selection {
  background: var(--gold);
  color: var(--btn-ink);
}

/* ==========================================================================
   OPENING SCENE (Dawat-Nama)
   ========================================================================== */
.opening {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 38%, var(--sky-3) 0%, var(--sky-2) 42%, var(--sky-1) 100%);
  transition: opacity 0.9s ease, visibility 0s linear 0.9s;
}

.opening.is-open {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.opening-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.star {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.6);
  opacity: 0;
  animation: twinkle 3s ease-in-out infinite;
}

.star.star-lg {
  width: 3px;
  height: 3px;
  box-shadow: 0 0 9px 2px rgba(255, 255, 255, 0.7);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.15); }
}

.opening-moon {
  position: absolute;
  right: 10%;
  top: 11%;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 34%, #fff8dd 0%, var(--gold-soft) 48%, var(--gold) 100%);
  box-shadow: 0 0 46px 8px var(--glow);
}

.opening-moon::after {
  content: "";
  position: absolute;
  top: -6px;
  right: -14px;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: var(--sky-1);
  box-shadow: -8px 0 18px rgba(0, 0, 0, 0.18);
}

/* fanoos lantern (shared by opening + hero) */
.fanoos,
.fanoos-hero {
  position: absolute;
  top: 0;
  transform-origin: top center;
  animation: fanoosSwing 7s ease-in-out infinite;
  z-index: 3;
  pointer-events: none;
}

.fanoos { left: 12%; }
.fanoos-hero { right: 8%; }

.fanoos-chain {
  width: 2px;
  height: 70px;
  margin: 0 auto;
  background: linear-gradient(var(--gold), transparent);
}

.fanoos-body {
  position: relative;
  width: 54px;
  height: 76px;
  margin: 0 auto;
}

.fanoos-body::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 38px;
  height: 10px;
  margin-left: -19px;
  background: linear-gradient(var(--gold-soft), var(--gold));
  clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
  border-radius: 2px;
}

.fanoos-body::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 16px;
  height: 8px;
  margin-left: -8px;
  background: var(--gold);
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.fanoos-glow {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 40px;
  height: 52px;
  margin-left: -20px;
  background: radial-gradient(ellipse at 50% 40%, #fff6d0 0%, var(--gold-soft) 35%, rgba(212, 175, 55, 0.25) 70%, transparent 100%);
  clip-path: polygon(15% 0, 85% 0, 100% 30%, 100% 70%, 85% 100%, 15% 100%, 0 70%, 0 30%);
  box-shadow: 0 0 26px 8px rgba(242, 217, 138, 0.28);
}

@keyframes fanoosSwing {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}

/* envelope */
.envelope-wrap {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.envelope {
  position: relative;
  width: 86vw;
  max-width: 340px;
  height: 220px;
  perspective: 1000px;
  transition: transform 0.8s ease;
}

.opening.is-opening .envelope {
  transform: translateY(-8px) scale(1.03);
}

.envelope-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(160deg, var(--envelope-2), var(--envelope-1));
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.55);
}

.envelope-front {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: linear-gradient(160deg, var(--envelope-1), var(--envelope-2));
  overflow: hidden;
}

.envelope-front::before {
  content: "";
  position: absolute;
  top: 8px;
  right: 8px;
  bottom: 8px;
  left: 8px;
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  background-image:
    repeating-linear-gradient(45deg, transparent 0 8px, rgba(212, 175, 55, 0.08) 8px 9px),
    repeating-linear-gradient(-45deg, transparent 0 8px, rgba(212, 175, 55, 0.08) 8px 9px);
}

.envelope-front::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.28));
}

.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 58%;
  z-index: 4;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background: linear-gradient(180deg, var(--envelope-flap), var(--envelope-1));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
  transition: transform 0.9s ease;
}

.opening.is-opening .envelope-flap {
  transform: rotateX(180deg);
}

/* gold seal with initials */
.seal {
  position: absolute;
  top: 46%;
  left: 50%;
  z-index: 6;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 2px solid var(--gold-soft);
  background: radial-gradient(circle at 35% 30%, var(--seal-1), var(--seal-2));
  color: var(--btn-ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 0 6px rgba(212, 175, 55, 0.12),
    0 0 26px 4px var(--glow);
  transition: transform 0.5s ease, opacity 0.5s ease;
  padding: 0;
}

.seal:hover { transform: translate(-50%, -50%) scale(1.05); }
.seal:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 4px; }

.seal-initials {
  font-family: var(--font-script);
  font-size: 26px;
  line-height: 1;
  letter-spacing: 0.02em;
}

.seal-crescent {
  font-size: 12px;
  line-height: 1;
  opacity: 0.82;
}

.opening.is-opening .seal {
  transform: translate(-50%, -50%) scale(0.6);
  opacity: 0;
}

.seal-tap {
  margin: 0;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold-text);
  animation: sealPulse 2s ease-in-out infinite;
}

@keyframes sealPulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

/* gold sparkle burst on seal click */
.sparkle {
  position: absolute;
  top: 46%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold-strong);
  box-shadow: 0 0 8px 2px var(--gold-soft);
  pointer-events: none;
  z-index: 7;
  animation: sparkleFly 0.9s ease-out forwards;
}

@keyframes sparkleFly {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px))) scale(0.2);
    opacity: 0;
  }
}

/* ==========================================================================
   MAIN CARD CONTAINER
   ========================================================================== */
.card-main {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.card-main.is-ready {
  opacity: 1;
}

/* generic scene wrapper (each section) */
.scene {
  position: relative;
  padding: 60px 20px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.9s ease, transform 0.9s ease, clip-path 0.9s ease;
  overflow: hidden;
}

.scene.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.scene-inner {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
}

/* stagger helper: children fade in one by one */
.stagger > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scene.is-visible .stagger > * {
  opacity: 1;
  transform: translateY(0);
}

.scene.is-visible .stagger > *:nth-child(1) { transition-delay: 0.05s; }
.scene.is-visible .stagger > *:nth-child(2) { transition-delay: 0.12s; }
.scene.is-visible .stagger > *:nth-child(3) { transition-delay: 0.19s; }
.scene.is-visible .stagger > *:nth-child(4) { transition-delay: 0.26s; }
.scene.is-visible .stagger > *:nth-child(5) { transition-delay: 0.33s; }
.scene.is-visible .stagger > *:nth-child(6) { transition-delay: 0.40s; }
.scene.is-visible .stagger > *:nth-child(7) { transition-delay: 0.47s; }
.scene.is-visible .stagger > *:nth-child(8) { transition-delay: 0.54s; }
.scene.is-visible .stagger > *:nth-child(9) { transition-delay: 0.61s; }
.scene.is-visible .stagger > *:nth-child(10) { transition-delay: 0.68s; }
.scene.is-visible .stagger > *:nth-child(11) { transition-delay: 0.75s; }
.scene.is-visible .stagger > *:nth-child(12) { transition-delay: 0.82s; }

/* ==========================================================================
   SECTION TYPOGRAPHY (shared)
   ========================================================================== */
.section-title {
  margin: 0 0 14px;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-text);
  text-align: center;
}

.section-title::before,
.section-title::after {
  content: "";
  display: inline-block;
  width: 26px;
  height: 1px;
  vertical-align: middle;
  margin: 0 10px;
  background: var(--line);
}

.arabic {
  font-family: var(--font-arabic);
  font-size: 26px;
  line-height: 1.9;
  text-align: center;
  color: var(--gold-text);
  direction: rtl;
}

.urdu {
  font-family: var(--font-urdu);
  font-size: 20px;
  line-height: 2.2;
  text-align: center;
  color: var(--ink);
  direction: rtl;
}

.body-text {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.75;
  color: var(--ink-soft);
  text-align: center;
  margin: 10px 0;
}

.small-text {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ink-mute);
  text-align: center;
  margin: 6px 0;
}

/* thin gold divider */
.divider {
  width: 60px;
  height: 1px;
  margin: 18px auto;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* ==========================================================================
   HERO
   ========================================================================== */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 160px;
  overflow: hidden;
  opacity: 1;
  transform: none;
}

.hero-inner {
  position: relative;
  z-index: 3;
  text-align: center;
  max-width: 640px;
  width: 100%;
}

/* rotating khatam (8-point star) behind the names */
.hero-khatam {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 360px;
  height: 360px;
  margin-top: -180px;
  margin-left: -180px;
  background: radial-gradient(circle, transparent 55%, rgba(212, 175, 55, 0.09) 56%, transparent 58%);
  clip-path: polygon(
    50% 0%, 57.65% 31.52%, 85.36% 14.64%, 68.48% 42.35%,
    100% 50%, 68.48% 57.65%, 85.36% 85.36%, 57.65% 68.48%,
    50% 100%, 42.35% 68.48%, 14.64% 85.36%, 31.52% 57.65%,
    0% 50%, 31.52% 42.35%, 14.64% 14.64%, 42.35% 31.52%
  );
  animation: khatamRotate 70s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes khatamRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hero-bismillah-ar {
  font-family: var(--font-arabic);
  font-size: 26px;
  line-height: 1.8;
  color: var(--gold-text);
  margin: 0 0 6px;
  direction: rtl;
}

.hero-bismillah-en {
  font-family: var(--font-body);
  font-size: 13px;
  font-style: italic;
  color: var(--ink-mute);
  margin: 0 0 34px;
  letter-spacing: 0.02em;
}

.hero-names {
  margin: 0 0 22px;
  font-family: var(--font-script);
  font-size: 52px;
  line-height: 1.05;
  color: var(--gold-text);
  text-shadow: 0 0 22px rgba(212, 175, 55, 0.28);
}

.hero-amp {
  display: block;
  font-size: 32px;
  opacity: 0.72;
  margin: 4px 0;
}

.hero-name-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

.scene.is-visible .hero-name-letter {
  animation: letterIn 0.55s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.05s);
}

@keyframes letterIn {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.hero-date {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0;
}

/* mosque skyline silhouette at the bottom of the hero */
.mosque-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 190px;
  background: var(--mosque);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100' preserveAspectRatio='none'%3E%3Cpath d='M0,100 L0,80 L30,80 L30,70 L35,70 L35,50 L38,50 L38,35 L40,35 L40,25 L42,25 L42,35 L44,35 L44,50 L47,50 L47,70 L52,70 L52,80 L80,80 L80,60 Q80,40 100,40 Q120,40 120,60 L120,80 L150,80 L150,60 Q150,30 180,25 Q210,30 210,60 L210,80 L240,80 L240,60 Q240,40 260,40 Q280,40 280,60 L280,80 L308,80 L308,70 L313,70 L313,50 L316,50 L316,35 L318,35 L318,25 L320,25 L320,35 L322,35 L322,50 L325,50 L325,70 L330,70 L330,80 L400,80 L400,100 Z' fill='black'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100' preserveAspectRatio='none'%3E%3Cpath d='M0,100 L0,80 L30,80 L30,70 L35,70 L35,50 L38,50 L38,35 L40,35 L40,25 L42,25 L42,35 L44,35 L44,50 L47,50 L47,70 L52,70 L52,80 L80,80 L80,60 Q80,40 100,40 Q120,40 120,60 L120,80 L150,80 L150,60 Q150,30 180,25 Q210,30 210,60 L210,80 L240,80 L240,60 Q240,40 260,40 Q280,40 280,60 L280,80 L308,80 L308,70 L313,70 L313,50 L316,50 L316,35 L318,35 L318,25 L320,25 L320,35 L322,35 L322,50 L325,50 L325,70 L330,70 L330,80 L400,80 L400,100 Z' fill='black'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  pointer-events: none;
  z-index: 1;
  transform: translateY(0);
  transition: transform 0.9s ease;
}

/* petals canvas is generated by card-runtime.js */
.petals-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

/* ==========================================================================
   SALAM / AYAH / INVITATION
   ========================================================================== */
.salam-section .salam-text {
  font-family: var(--font-kufi);
  font-size: 15px;
  letter-spacing: 0.06em;
  text-align: center;
  color: var(--gold-text);
  margin: 0 0 22px;
}

.ayah-box {
  margin: 20px 0;
  padding: 18px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--card);
}

.ayah-box .ayah-arabic {
  font-family: var(--font-arabic);
  font-size: 22px;
  line-height: 2;
  text-align: center;
  color: var(--gold-text);
  margin: 0 0 12px;
  direction: rtl;
}

.ayah-box .ayah-translation {
  font-family: var(--font-body);
  font-size: 15px;
  font-style: italic;
  line-height: 1.7;
  text-align: center;
  color: var(--ink-soft);
  margin: 0 0 8px;
}

.ayah-box .ayah-ref {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-align: center;
  color: var(--ink-mute);
  margin: 0;
}

.guest-line {
  font-family: var(--font-script);
  font-size: 26px;
  text-align: center;
  color: var(--gold-text);
  margin: 18px 0;
}

.invite-en {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  text-align: center;
  color: var(--ink-soft);
  margin: 12px 0;
}

.invite-roman {
  font-family: var(--font-body);
  font-size: 15px;
  font-style: italic;
  line-height: 1.7;
  text-align: center;
  color: var(--ink-mute);
  margin: 8px 0 16px;
}

.host-line {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-align: center;
  color: var(--gold-text);
  margin: 8px 0 0;
}

/* ==========================================================================
   EVENTS TIMELINE
   ========================================================================== */
.events-timeline {
  position: relative;
  padding: 14px 0 0 26px;
}

.events-timeline::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--gold), transparent);
}

.event-row {
  position: relative;
  margin-bottom: 18px;
}

.event-row::before {
  content: "";
  position: absolute;
  left: -22px;
  top: 26px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  background: var(--bg-1);
  z-index: 2;
}

.event-card {
  position: relative;
  perspective: 900px;
  -webkit-tap-highlight-color: transparent;
}

.event-card-inner {
  position: relative;
  width: 100%;
  min-height: 168px;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.event-card.is-flipped .event-card-inner {
  transform: rotateY(180deg);
}

.event-face {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--card);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  font-size: 17px;
  letter-spacing: 0.06em;
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
  letter-spacing: 0.16em;
  color: var(--ink-mute);
  text-transform: uppercase;
  margin: 0;
}

.event-badge-main {
  display: inline-block;
  align-self: center;
  margin-top: 6px;
  padding: 3px 9px;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.14em;
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
  right: 10px;
  bottom: 8px;
  font-family: var(--font-kufi);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
  opacity: 0.65;
}

/* ==========================================================================
   COUNTDOWN
   ========================================================================== */
.countdown-section {
  text-align: center;
}

.countdown-label {
  font-family: var(--font-kufi);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-text);
  margin: 0 0 6px;
}

.countdown-event-name {
  font-family: var(--font-script);
  font-size: 28px;
  color: var(--gold-text);
  margin: 0 0 18px;
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
  gap: 5px;
}

.countdown-flip {
  display: inline-flex;
  gap: 3px;
}

.countdown-digit {
  display: inline-block;
  min-width: 34px;
  height: 48px;
  line-height: 46px;
  text-align: center;
  background: var(--card-solid);
  border: 1px solid var(--line);
  border-radius: 6px;
  font-family: var(--font-kufi);
  font-size: 22px;
  font-weight: 600;
  color: var(--gold-text);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.32);
}

.countdown-digit.flipping {
  animation: digitFlip 0.5s ease;
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
  letter-spacing: 0.18em;
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
  letter-spacing: 0.12em;
  color: var(--ink-mute);
  margin: 14px 0 0;
}

/* ==========================================================================
   VENUE
   ========================================================================== */
.venue-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 0 14px;
}

.venue-tab {
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.06em;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
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
  border-radius: 12px;
  padding: 16px;
  background: var(--card);
  box-shadow: var(--shadow);
}

.venue-panel[hidden] { display: none; }

.venue-name {
  font-family: var(--font-kufi);
  font-size: 15px;
  letter-spacing: 0.06em;
  color: var(--gold-text);
  margin: 0 0 8px;
  text-align: center;
}

.venue-address {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-soft);
  text-align: center;
  margin: 0 0 14px;
  white-space: pre-line;
}

.venue-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ==========================================================================
   BUTTONS (shared by venue, rsvp, share, calendar)
   ========================================================================== */
.btn-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-kufi);
  font-size: 12px;
  letter-spacing: 0.08em;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: transparent;
  color: var(--gold-text);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.18s ease, color 0.18s ease, transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn-card:hover { background: rgba(212, 175, 55, 0.12); }
.btn-card:active { transform: translateY(1px); }
.btn-card:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 2px; }

.btn-card-gold {
  background: var(--btn-bg);
  color: var(--btn-ink);
  border-color: var(--gold);
  font-weight: 600;
}

.btn-card-gold:hover { background: var(--btn-bg); opacity: 0.9; }

.btn-card-wa {
  background: var(--wa);
  border-color: var(--wa);
  color: var(--wa-ink);
  font-weight: 600;
}

.btn-card-wa:hover { background: var(--wa); opacity: 0.9; }

/* ==========================================================================
   STORY & GALLERY
   ========================================================================== */
.story-text {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.8;
  color: var(--ink-soft);
  text-align: center;
  white-space: pre-line;
  margin: 0;
}

.gallery-stack {
  position: relative;
  width: 260px;
  height: 320px;
  margin: 18px auto 0;
}

.gallery-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--card-solid);
  box-shadow: var(--shadow);
  transition: transform 0.45s ease, opacity 0.45s ease;
  cursor: pointer;
}

.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-card:nth-child(1) { transform: translateY(0) rotate(-2deg); z-index: 6; opacity: 1; }
.gallery-card:nth-child(2) { transform: translateY(10px) rotate(2deg) scale(0.96); z-index: 5; opacity: 0.92; }
.gallery-card:nth-child(3) { transform: translateY(20px) rotate(-1deg) scale(0.92); z-index: 4; opacity: 0.82; }
.gallery-card:nth-child(4) { transform: translateY(30px) rotate(1deg) scale(0.88); z-index: 3; opacity: 0.7; }
.gallery-card:nth-child(5) { transform: translateY(40px) scale(0.84); z-index: 2; opacity: 0.55; }
.gallery-card:nth-child(n+6) { transform: translateY(46px) scale(0.8); z-index: 1; opacity: 0.4; }

.gallery-hint {
  margin: 12px 0 0;
  font-family: var(--font-kufi);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-align: center;
  color: var(--ink-mute);
}

/* ==========================================================================
   DUA
   ========================================================================== */
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
  line-height: 1.7;
  text-align: center;
  color: var(--ink-soft);
  margin: 0;
}

/* ==========================================================================
   RSVP
   ========================================================================== */
.rsvp-note {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
  color: var(--ink-soft);
  margin: 0 0 16px;
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
  margin: 14px 0 0;
}

.contact-list {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  text-align: center;
}

.contact-list li {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  margin: 4px 0;
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
  text-align: center;
  padding-bottom: 90px;
}

.footer-thanks {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink-soft);
  margin: 0 0 10px;
  white-space: pre-line;
}

.footer-family {
  font-family: var(--font-kufi);
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--gold-text);
  margin: 0 0 6px;
}

.footer-closing {
  font-family: var(--font-script);
  font-size: 26px;
  color: var(--gold-text);
  margin: 14px 0 20px;
}

.footer-share {
  margin-top: 10px;
}

/* ==========================================================================
   MUSIC BUTTON (bottom-left floating)
   ========================================================================== */
.mute-btn {
  position: fixed;
  left: 14px;
  bottom: 14px;
  z-index: 40;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--card-solid);
  color: var(--gold-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.mute-btn:hover { transform: scale(1.06); }
.mute-btn:focus-visible { outline: 2px solid var(--gold-strong); outline-offset: 3px; }

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   Each scene gets one of these classes. When .is-visible is added, the
   clip-path (or pseudo-element curtains) animate open.
   ========================================================================== */

/* mehraab arch reveal */
.reveal-arch {
  clip-path: polygon(45% 55%, 45% 48.5%, 46.5% 46.5%, 48.5% 45.3%, 50% 45%, 51.5% 45.3%, 53.5% 46.5%, 55% 48.5%, 55% 55%);
}

.reveal-arch.is-visible {
  clip-path: polygon(0% 100%, 0% 35%, 15% 15%, 35% 3%, 50% 0%, 65% 3%, 85% 15%, 100% 35%, 100% 100%);
}

/* crescent-moon circle wipe */
.reveal-moon {
  clip-path: circle(0% at 50% 50%);
}

.reveal-moon.is-visible {
  clip-path: circle(80% at 50% 50%);
}

/* curtain split — two halves slide apart */
.reveal-curtain::before,
.reveal-curtain::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background: var(--bg-2);
  z-index: 3;
  pointer-events: none;
  transition: clip-path 0.9s ease;
}

.reveal-curtain::before {
  left: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.reveal-curtain::after {
  right: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.reveal-curtain.is-visible::before {
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
}

.reveal-curtain.is-visible::after {
  clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
}

/* 8-point-star iris */
.reveal-star {
  clip-path: polygon(50% 45%, 50.77% 48.15%, 53.54% 46.46%, 51.85% 49.23%, 55% 50%, 51.85% 50.77%, 53.54% 53.54%, 50.77% 51.85%, 50% 55%, 49.23% 51.85%, 46.46% 53.54%, 48.15% 50.77%, 45% 50%, 48.15% 49.23%, 46.46% 46.46%, 49.23% 48.15%);
}

.reveal-star.is-visible {
  clip-path: polygon(50% -50%, 65.31% 13.04%, 120.71% -20.71%, 86.96% 34.69%, 150% 50%, 86.96% 65.31%, 120.71% 120.71%, 65.31% 86.96%, 50% 150%, 34.69% 86.96%, -20.71% 120.71%, 13.04% 65.31%, -50% 50%, 13.04% 34.69%, -20.71% -20.71%, 34.69% 13.04%);
}

/* ==========================================================================
   TABLET / DESKTOP
   ========================================================================== */
@media (min-width: 640px) {
  .hero-names { font-size: 66px; }
  .hero-amp { font-size: 38px; }
  .hero-bismillah-ar { font-size: 30px; }
  .hero-khatam { width: 440px; height: 440px; margin-top: -220px; margin-left: -220px; }
  .arabic { font-size: 30px; }
  .scene { padding: 80px 30px; }
  .countdown-digit { min-width: 42px; height: 58px; line-height: 56px; font-size: 26px; }
  .gallery-stack { width: 320px; height: 400px; }
  .rsvp-actions { flex-direction: row; justify-content: center; }
}

@media (min-width: 900px) {
  .hero-names { font-size: 82px; }
  .hero-amp { font-size: 46px; }
  .hero-bismillah-ar { font-size: 34px; }
  .scene { padding: 96px 40px; }
  .event-card-inner { min-height: 180px; }
}

/* ==========================================================================
   REDUCED MOTION
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .star,
  .fanoos,
  .fanoos-hero,
  .opening-moon,
  .hero-khatam,
  .seal-tap {
    animation: none !important;
  }

  .scene,
  .scene.is-visible,
  .stagger > *,
  .event-card-inner,
  .hero-name-letter,
  .scene.is-visible .hero-name-letter {
    transition: none !important;
    animation: none !important;
  }

  .scene,
  .hero-name-letter {
    opacity: 1 !important;
    transform: none !important;
  }

  .reveal-arch,
  .reveal-moon,
  .reveal-star {
    clip-path: none !important;
  }

  .reveal-curtain::before,
  .reveal-curtain::after {
    display: none;
  }

  .opening,
  .opening.is-open {
    transition: none;
  }

  .petals-canvas { display: none; }
}
`;
// END OF FILE card-style.js
