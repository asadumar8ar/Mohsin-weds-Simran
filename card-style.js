/* card-style.js — all CSS for the exported wedding card. */
"use strict";
(function () {
  window.CARD_LOADED_STYLE = true;

  window.CARD_CSS = `
/* ============================================================
   NIKAH CARD — complete stylesheet
   Themes via [data-theme] on <html>
   ============================================================ */
:root{
  --ivory:#FAF3EA;
  --rose:#D9A0A6;
  --deep:#8E2E4A;
  --gold:#C9A24B;
  --gold-light:#F0D58A;
  --plum:#2A0F1E;
  --ink:#3A1426;
}
html[data-theme="gulabi"]{
  --ivory:#FAF3EA;--rose:#D9A0A6;--deep:#8E2E4A;
  --gold:#C9A24B;--gold-light:#F0D58A;--plum:#2A0F1E;--ink:#3A1426;
}
html[data-theme="emerald"]{
  --ivory:#F6F1E4;--rose:#C9B98F;--deep:#0F5132;
  --gold:#C9A24B;--gold-light:#EEDD9B;--plum:#0A3222;--ink:#123A2A;
}
html[data-theme="midnight"]{
  --ivory:#F3F1EA;--rose:#B9C2D6;--deep:#1B2A4A;
  --gold:#C9B98F;--gold-light:#E8E2CE;--plum:#0B1730;--ink:#152142;
}
html[data-theme="ivory-sage"]{
  --ivory:#F7F5EC;--rose:#C9CDB6;--deep:#5A6B4D;
  --gold:#B08D3F;--gold-light:#E4D29B;--plum:#3E4A34;--ink:#2E3A28;
}

*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
html{-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
body{
  font-family:"Cormorant Garamond",Georgia,"Times New Roman",serif;
  font-size:17px;line-height:1.65;
  color:var(--ink);
  background:var(--ivory);
  overflow-x:hidden;
  min-height:100vh;
}
body.locked{overflow:hidden;height:100vh}
img{max-width:100%;display:block}
button{font-family:inherit;font-size:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-weight:500;margin:0;line-height:1.2}

/* ---------- Typography ---------- */
.script{font-family:"Pinyon Script","Cormorant Garamond",cursive;font-weight:400}
.ar{font-family:"Amiri",serif;direction:rtl;text-align:center;line-height:1.9;font-size:1.15em}
.urdu{font-family:"Noto Nastaliq Urdu",serif;direction:rtl;text-align:center;line-height:2.3}
.kufi{font-family:"Reem Kufi",serif;letter-spacing:.02em}
.small{font-size:.82em;letter-spacing:.05em}
.label{font-size:.72em;letter-spacing:.22em;text-transform:lowercase;opacity:.7}

/* ---------- Layers / safe fallback ---------- */
#arrival,#stage,#scratchWrap{position:relative}
#stage{z-index:1}
#scratchWrap{z-index:2}

/* ============================================================
   ARRIVAL
   ============================================================ */
#arrival{
  position:fixed;inset:0;z-index:50;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:24px;
  background:
    radial-gradient(ellipse at 50% 100%,rgba(217,160,166,.35),transparent 55%),
    radial-gradient(ellipse at 50% 0%,rgba(201,162,75,.18),transparent 60%),
    linear-gradient(180deg,var(--plum) 0%,#3b1428 60%,#4a1830 100%);
  color:var(--ivory);
  overflow:hidden;
  transition:opacity .5s ease,transform .8s ease;
}
#arrival::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 50% 45%,transparent 40%,rgba(0,0,0,.45) 100%);
}
#arrival.leaving{opacity:0;pointer-events:none}
#arrivalLine{
  position:relative;z-index:2;
  font-family:"Pinyon Script",cursive;
  font-size:clamp(22px,5.5vw,32px);
  color:var(--gold-light);
  opacity:0;transform:translateY(8px);
  transition:opacity .9s ease,transform .9s ease;
  text-align:center;
  margin-bottom:8px;
}
#arrival.show-line #arrivalLine{opacity:1;transform:translateY(0)}
.ping{
  position:absolute;left:50%;top:50%;
  width:20px;height:20px;margin:-10px 0 0 -10px;
  border-radius:50%;
  border:2px solid var(--gold);
  opacity:0;
  pointer-events:none;
}
#arrival.pinged .ping{animation:pingRipple 1.8s ease-out 2}
@keyframes pingRipple{
  0%{opacity:0;transform:scale(1)}
  15%{opacity:.9}
  100%{opacity:0;transform:scale(14)}
}

/* envelope */
#envelope{
  position:relative;z-index:2;
  width:min(84vw,340px);
  aspect-ratio:1.55/1;
  margin:26px auto 20px;
  perspective:1200px;
  opacity:0;transform:translateY(60px) scale(.96);
  transition:opacity .8s ease,transform .8s cubic-bezier(.2,.9,.2,1.05);
  will-change:transform;
}
#arrival.env-shown #envelope{opacity:1;transform:translateY(0) scale(1)}
#arrival.env-float #envelope{animation:envFloat 4s ease-in-out infinite}
@keyframes envFloat{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-6px)}
}
.env-body{
  position:absolute;inset:0;
  border-radius:8px;
  background:
    linear-gradient(135deg,rgba(255,255,255,.06),transparent 40%),
    radial-gradient(ellipse at 30% 20%,#fbe9cf,#e9c99c 55%,#c99f6b 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,.5) inset,
    0 -8px 24px rgba(0,0,0,.35),
    0 20px 40px rgba(0,0,0,.35);
  overflow:hidden;
}
.env-img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9;
}
.env-face{
  position:absolute;inset:0;
  display:flex;flex-direction:column;justify-content:center;
  padding:8% 10%;
  color:#3a1426;
  font-family:"Cormorant Garamond",serif;
  transform:translateZ(1px);
}
.env-to{font-size:clamp(14px,3.6vw,17px);opacity:.85;margin-bottom:2px}
.env-name{font-family:"Pinyon Script",cursive;font-size:clamp(22px,6vw,30px);color:#5b1e33;line-height:1.1;margin-bottom:auto}
.env-from{font-size:clamp(12px,3vw,14px);opacity:.75;align-self:flex-end;margin-top:auto}
.env-from span{font-style:italic}
.flap{
  position:absolute;left:0;top:0;width:100%;height:60%;
  background:linear-gradient(180deg,#f7e0bf,#e0b98a);
  clip-path:polygon(0 0,100% 0,50% 100%);
  transform-origin:top center;
  transform:rotateX(0deg);
  transition:transform .9s cubic-bezier(.4,.1,.3,1);
  z-index:3;
  box-shadow:0 2px 6px rgba(0,0,0,.15);
  backface-visibility:hidden;
}
#envelope.open .flap{transform:rotateX(180deg)}

/* seal */
#seal{
  position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);
  width:78px;height:78px;border-radius:50%;
  background:
    radial-gradient(circle at 35% 30%,#e46b6b 0%,#b22540 45%,#7a1029 75%,#4a0616 100%);
  box-shadow:
    0 0 0 2px rgba(255,255,255,.15) inset,
    0 4px 0 rgba(0,0,0,.35),
    0 10px 22px rgba(0,0,0,.4),
    0 0 0 1px rgba(0,0,0,.2);
  display:flex;align-items:center;justify-content:center;
  color:#ffe7cf;font-family:"Pinyon Script",cursive;
  font-size:26px;line-height:1;letter-spacing:.02em;
  cursor:pointer;
  z-index:4;
  transition:transform .3s ease,opacity .5s ease;
  animation:sealPulse 2s ease-in-out infinite;
}
#seal::before{
  content:"";position:absolute;inset:6px;border-radius:50%;
  border:1px dashed rgba(255,220,200,.4);
}
@keyframes sealPulse{
  0%,100%{box-shadow:
    0 0 0 2px rgba(255,255,255,.15) inset,
    0 4px 0 rgba(0,0,0,.35),
    0 10px 22px rgba(0,0,0,.4),
    0 0 0 1px rgba(0,0,0,.2),
    0 0 0 0 rgba(201,162,75,.5)}
  50%{box-shadow:
    0 0 0 2px rgba(255,255,255,.15) inset,
    0 4px 0 rgba(0,0,0,.35),
    0 10px 22px rgba(0,0,0,.4),
    0 0 0 1px rgba(0,0,0,.2),
    0 0 0 14px rgba(201,162,75,0)}
}
#seal:focus-visible{outline:3px solid var(--gold-light);outline-offset:6px}
#seal.cracked{animation:none;opacity:0;transform:translate(-50%,-50%) scale(1.4);transition:opacity .35s ease,transform .35s ease}
.seal-frag{
  position:absolute;left:50%;top:58%;
  width:14px;height:14px;border-radius:50%;
  background:radial-gradient(circle at 30% 30%,#e46b6b,#7a1029);
  pointer-events:none;
  will-change:transform,opacity;
}
.sparkle{
  position:absolute;left:50%;top:58%;
  width:6px;height:6px;border-radius:50%;
  background:radial-gradient(circle,var(--gold-light),var(--gold) 60%,transparent 75%);
  pointer-events:none;
  will-change:transform,opacity;
}
#hintTap{
  position:relative;z-index:2;
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(13px,3.4vw,15px);
  color:rgba(250,243,234,.75);
  letter-spacing:.06em;
  opacity:0;transform:translateY(6px);
  transition:opacity .6s ease .4s,transform .6s ease .4s;
  text-align:center;
}
#arrival.env-shown #hintTap{opacity:1;transform:translateY(0)}

/* ============================================================
   CORRIDOR / STAGE
   ============================================================ */
#stage{
  position:relative;
  height:450vh;
  background:var(--plum);
}
#stageInner{
  position:sticky;top:0;height:100vh;
  overflow:hidden;
  perspective:900px;
  display:flex;align-items:center;justify-content:center;
  background:
    radial-gradient(ellipse at 50% 40%,rgba(201,162,75,.14),transparent 60%),
    radial-gradient(ellipse at 50% 100%,rgba(217,160,166,.12),transparent 55%),
    linear-gradient(180deg,#2a0f1e 0%,#3a1426 55%,#4a1830 100%);
}
#stageInner::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 50% 50%,transparent 45%,rgba(0,0,0,.55) 100%);
  z-index:0;
}
.gold-bloom{
  position:absolute;left:50%;top:50%;
  width:120vmin;height:120vmin;
  margin:-60vmin 0 0 -60vmin;
  background:radial-gradient(circle,rgba(240,213,138,.28),rgba(201,162,75,.05) 45%,transparent 65%);
  pointer-events:none;
  opacity:0;
  transition:opacity .5s ease;
  z-index:1;
}
.arch{
  position:absolute;left:50%;top:50%;
  width:min(86vw,440px);
  transform:translate(-50%,-50%) translate3d(0,0,0);
  transform-style:preserve-3d;
  will-change:transform,opacity,filter;
  opacity:0;
  pointer-events:none;
}
.arch .arch-frame{
  position:absolute;inset:0;
  pointer-events:none;
  color:var(--gold);
}
.arch .arch-frame svg{width:100%;height:100%;display:block}
.arch-content{
  position:relative;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;
  padding:14% 10% 16%;
  color:var(--ivory);
  min-height:min(88vw,540px);
  opacity:0;
  transition:opacity .3s linear;
  pointer-events:auto;
}
.arch-content > *{max-width:100%}
.arch-content .bismillah-ar{
  font-family:"Amiri",serif;
  font-size:clamp(20px,5vw,30px);
  color:var(--gold-light);
  direction:rtl;
  line-height:1.9;
  margin-bottom:10px;
}
.arch-content .bismillah-en{
  font-size:clamp(11px,2.8vw,13px);
  letter-spacing:.12em;
  text-transform:lowercase;
  color:rgba(250,243,234,.75);
  max-width:34ch;
  margin:0 auto 18px;
  font-style:italic;
}
.arch-content .salam{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(22px,5.4vw,30px);
  color:var(--gold-light);
  margin-top:8px;
}
.arch-content .kicker{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(11px,3vw,13px);
  letter-spacing:.3em;
  text-transform:lowercase;
  color:rgba(240,213,138,.8);
  margin-bottom:12px;
}
.name-wrap{display:flex;flex-direction:column;gap:6px;align-items:center}
.name{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(34px,9vw,58px);
  line-height:1.05;
  color:var(--gold-light);
  position:relative;
  padding:0 4px;
}
.name .ink{
  display:inline-block;
  background:linear-gradient(90deg,var(--gold) 0%,var(--gold-light) 40%,#fff8e0 50%,var(--gold-light) 60%,var(--gold) 100%);
  background-size:250% 100%;
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;
  clip-path:inset(0 100% 0 0);
  transition:clip-path 1.8s cubic-bezier(.5,.05,.25,1);
}
.name.inked .ink{clip-path:inset(0 0 0 0)}
.name.shimmer .ink{animation:nameShimmer 4s linear infinite}
@keyframes nameShimmer{
  0%{background-position:200% 0}
  100%{background-position:-100% 0}
}
.pen{
  position:absolute;top:50%;left:0;
  width:14px;height:14px;margin-top:-7px;
  border-radius:50%;
  background:radial-gradient(circle,#fff8e0,var(--gold-light) 40%,var(--gold) 70%,transparent 80%);
  filter:blur(1px);
  opacity:0;
  transition:opacity .3s ease;
  pointer-events:none;
}
.name.inking .pen{opacity:1}
.name-sub{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(12px,3vw,14px);
  letter-spacing:.06em;
  color:rgba(250,243,234,.72);
  margin-top:2px;
}
.amp{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(22px,5vw,30px);
  color:rgba(240,213,138,.9);
  line-height:1;
  margin:2px 0;
}
.couple-photo{
  width:clamp(90px,24vw,130px);
  aspect-ratio:1;border-radius:50%;
  object-fit:cover;
  margin:0 auto 14px;
  box-shadow:0 0 0 2px var(--gold),0 0 0 8px rgba(201,162,75,.15),0 10px 30px rgba(0,0,0,.4);
}
.big-date{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(26px,7vw,40px);
  font-weight:500;color:var(--gold-light);
  letter-spacing:.06em;
  line-height:1.1;
  margin-bottom:4px;
}
.big-day{
  font-family:"Cormorant Garamond",serif;
  font-style:italic;
  font-size:clamp(13px,3.2vw,15px);
  color:rgba(250,243,234,.78);
  letter-spacing:.1em;
}
.invite-en{
  font-size:clamp(14px,3.6vw,16px);
  line-height:1.7;
  max-width:34ch;
  color:rgba(250,243,234,.92);
  margin:0 auto 14px;
}
.invite-roman{
  font-family:"Cormorant Garamond",serif;
  font-style:italic;
  font-size:clamp(12px,3vw,14px);
  line-height:1.7;
  max-width:34ch;
  color:rgba(240,213,138,.8);
  margin:0 auto 14px;
}
.host-line{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(20px,5vw,26px);
  color:var(--gold-light);
}
.host-label{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(10px,2.6vw,12px);
  letter-spacing:.22em;text-transform:lowercase;
  color:rgba(250,243,234,.55);
  margin-top:8px;
}
.ayah-ar{
  font-family:"Amiri",serif;
  font-size:clamp(15px,4vw,19px);
  line-height:2;
  direction:rtl;
  color:var(--gold-light);
  margin-bottom:10px;
}
.ayah-en{
  font-size:clamp(12px,3vw,14px);
  font-style:italic;
  line-height:1.65;
  max-width:34ch;
  color:rgba(250,243,234,.85);
  margin:0 auto 8px;
}
.ayah-ref{
  font-size:clamp(10px,2.6vw,12px);
  letter-spacing:.14em;
  color:rgba(240,213,138,.7);
}

/* ============================================================
   GOLD SWEEP
   ============================================================ */
.sweep{
  position:relative;height:1px;
  pointer-events:none;overflow:visible;
}
.sweep::before{
  content:"";position:absolute;top:-50vh;left:-30%;
  width:60%;height:100vh;
  background:linear-gradient(115deg,transparent 30%,rgba(240,213,138,.55) 50%,rgba(255,248,224,.9) 52%,rgba(240,213,138,.55) 54%,transparent 70%);
  transform:translateX(-100%);
  opacity:0;
  pointer-events:none;
}
.sweep.fire::before{
  animation:sweepMove .9s ease-out forwards;
}
@keyframes sweepMove{
  0%{opacity:0;transform:translateX(-100%)}
  20%{opacity:1}
  80%{opacity:1}
  100%{opacity:0;transform:translateX(180%)}
}

/* ============================================================
   SCRATCH PANEL
   ============================================================ */
#scratchWrap{
  background:
    radial-gradient(ellipse at 50% 0%,rgba(201,162,75,.18),transparent 55%),
    linear-gradient(180deg,#2a0f1e 0%,#3a1426 100%);
  padding:56px 20px 64px;
  display:flex;flex-direction:column;align-items:center;
  color:var(--ivory);
}
.scratch-panel{
  position:relative;
  width:min(88vw,360px);
  aspect-ratio:.75/1;
  border-radius:50% 50% 8px 8px / 42% 42% 8px 8px;
  overflow:hidden;
  background:
    radial-gradient(ellipse at 50% 0%,rgba(201,162,75,.22),transparent 60%),
    linear-gradient(180deg,#3a1426,#2a0f1e);
  box-shadow:
    0 0 0 1px rgba(201,162,75,.4),
    0 0 0 8px rgba(201,162,75,.08),
    0 24px 60px rgba(0,0,0,.55);
  touch-action:pan-y;
}
.scratch-panel::before{
  content:"";position:absolute;inset:6px;border-radius:inherit;
  border:1px solid rgba(240,213,138,.4);
  pointer-events:none;z-index:3;
}
#scratchCanvas{
  position:absolute;inset:0;width:100%;height:100%;
  touch-action:none;
  cursor:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='6' fill='%23F0D58A' opacity='.85'/><circle cx='16' cy='16' r='12' fill='none' stroke='%23C9A24B' opacity='.5'/></svg>") 16 16, pointer;
  z-index:2;
  transition:opacity .6s ease;
}
#scratchCanvas.done{opacity:0;pointer-events:none}
#scratchContent{
  position:absolute;inset:0;z-index:1;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:20px;
  text-align:center;
  color:var(--ivory);
  pointer-events:none;
}
#scratchContent .sc-kicker{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(24px,6vw,32px);
  color:var(--gold-light);
  margin-bottom:14px;
}
#scratchContent .sc-line{
  width:60px;height:1px;background:var(--gold);
  margin:10px auto;
  opacity:.6;
}
#scratchContent .sc-date{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(15px,4vw,18px);
  letter-spacing:.08em;
  color:rgba(250,243,234,.92);
}
#scratchContent .sc-time{
  font-family:"Cormorant Garamond",serif;
  font-style:italic;
  font-size:clamp(12px,3vw,14px);
  color:rgba(240,213,138,.8);
  margin-top:4px;
}
#revealBtn{
  margin-top:22px;
  padding:12px 26px;
  border:1px solid var(--gold);
  border-radius:999px;
  color:var(--gold-light);
  background:rgba(201,162,75,.08);
  font-size:14px;
  letter-spacing:.06em;
  cursor:pointer;
  transition:background-color .2s ease,border-color .2s ease;
  min-height:44px;
}
#revealBtn:hover{background:rgba(201,162,75,.18)}
#revealBtn:focus-visible{outline:2px solid var(--gold-light);outline-offset:4px}

/* ============================================================
   LIGHT SECTIONS — programme / countdown / venue / story /
   gallery / dua / rsvp / finale
   ============================================================ */
.light-section{
  position:relative;
  background:var(--ivory);
  color:var(--ink);
  padding:64px 20px;
  overflow:hidden;
}
.light-section::before{
  content:"";position:absolute;left:50%;top:16px;
  width:44px;height:1px;background:var(--gold);
  transform:translateX(-50%);
  opacity:.7;
}
.light-section::after{
  content:"✦";position:absolute;left:50%;top:6px;
  transform:translateX(-50%);
  color:var(--gold);font-size:11px;
}
.section-title{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(30px,7vw,42px);
  color:var(--deep);
  text-align:center;
  margin:0 0 6px;
}
.section-sub{
  text-align:center;
  font-style:italic;
  font-size:clamp(12px,3vw,14px);
  color:var(--ink);opacity:.7;
  margin:0 auto 32px;
  max-width:36ch;
}
.wrap{max-width:640px;margin:0 auto;position:relative}

/* ---------- Reveal ---------- */
.reveal{
  opacity:0;
  transform:translateY(16px);
  transition:opacity .6s ease,transform .6s ease;
  will-change:opacity,transform;
}
.reveal.in{
  opacity:1;transform:translateY(0);
  will-change:auto;
}

/* ---------- Programme / timeline ---------- */
#programme{padding-bottom:80px}
.timeline{
  position:relative;
  margin-top:8px;
  padding-left:34px;
}
.timeline::before{
  content:"";position:absolute;left:14px;top:6px;bottom:6px;
  width:2px;
  background:linear-gradient(180deg,transparent,var(--gold) 4%,var(--gold) 96%,transparent);
  transform-origin:top;
  transform:scaleY(0);
  transition:transform 1s ease .2s;
}
.timeline.drawn::before{transform:scaleY(1)}
.ev-card{
  position:relative;
  margin:0 0 16px;
  border-radius:10px;
  perspective:900px;
  min-height:74px;
  transition:transform .35s ease;
}
.ev-card::before{
  content:"";position:absolute;left:-24px;top:22px;
  width:10px;height:10px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 0 3px var(--ivory),0 0 0 4px rgba(201,162,75,.5);
}
.ev-card .front,.ev-card .back{
  position:relative;
  background:#fffaf1;
  border:1px solid rgba(201,162,75,.35);
  border-radius:10px;
  padding:16px 18px;
  box-shadow:0 4px 16px rgba(58,20,38,.06);
  backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
  transition:transform .6s cubic-bezier(.4,.1,.3,1);
}
.ev-card .front{transform:rotateY(0deg)}
.ev-card .back{
  position:absolute;inset:0;
  transform:rotateY(180deg);
  display:flex;flex-direction:column;justify-content:center;
  font-size:14px;
  line-height:1.55;
}
.ev-card.flipped .front{transform:rotateY(-180deg)}
.ev-card.flipped .back{transform:rotateY(0deg)}
.ev-name{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(24px,5.4vw,30px);
  color:var(--deep);
  line-height:1.1;
  margin-bottom:2px;
}
.ev-when{
  font-size:14px;
  color:var(--ink);
  opacity:.85;
  letter-spacing:.02em;
}
.ev-main-tag{
  position:absolute;top:8px;right:8px;
  background:var(--deep);color:var(--ivory);
  font-size:10px;letter-spacing:.06em;
  padding:2px 8px;border-radius:4px;
  text-transform:uppercase;
}
.ev-flip-hint{
  position:absolute;right:10px;bottom:6px;
  font-size:10px;letter-spacing:.08em;
  color:var(--ink);opacity:.45;
  text-transform:lowercase;
}
.ev-back-row{margin-bottom:2px}
.ev-back-row strong{color:var(--deep);font-weight:600}
.ev-card .back .ev-flip-hint{position:absolute;right:10px;bottom:6px}

/* ---------- Countdown ---------- */
#countdown{padding-top:56px;padding-bottom:56px;text-align:center}
.cd-grid{
  display:flex;justify-content:center;gap:8px;
  margin:24px auto 8px;
  max-width:420px;
}
.cd-cell{
  flex:1;
  background:#fffaf1;
  border:1px solid rgba(201,162,75,.4);
  border-radius:10px;
  padding:12px 4px;
  min-width:0;
}
.cd-num{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(24px,7vw,36px);
  font-weight:500;
  color:var(--deep);
  line-height:1;
  display:block;
  transform-origin:center;
  transition:transform .35s ease;
}
.cd-num.flip{transform:rotateX(90deg)}
.cd-label{
  display:block;
  font-size:10px;
  letter-spacing:.14em;
  text-transform:lowercase;
  color:var(--ink);
  opacity:.7;
  margin-top:6px;
}
.cd-done{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(26px,6vw,34px);
  color:var(--deep);
  margin-top:16px;
}

/* ---------- Venue ---------- */
#venue{text-align:center}
.venue-tabs{
  display:flex;flex-wrap:wrap;justify-content:center;
  gap:8px;margin:0 auto 22px;
}
.tab{
  padding:9px 16px;
  border:1px solid rgba(201,162,75,.5);
  border-radius:999px;
  font-size:14px;
  color:var(--deep);
  background:transparent;
  cursor:pointer;
  transition:background-color .2s ease,color .2s ease;
  min-height:38px;
}
.tab:hover{background:rgba(201,162,75,.12)}
.tab:focus-visible{outline:2px solid var(--deep);outline-offset:2px}
.tab.active{
  background:var(--deep);color:var(--ivory);
  border-color:var(--deep);
}
.venue-panel{
  background:#fffaf1;
  border:1px solid rgba(201,162,75,.4);
  border-radius:14px;
  padding:22px 20px;
  max-width:480px;
  margin:0 auto;
}
.venue-panel .vp-name{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(26px,6vw,32px);
  color:var(--deep);
  margin-bottom:6px;
  line-height:1.1;
}
.venue-panel .vp-addr{
  font-size:15px;
  line-height:1.6;
  color:var(--ink);
  margin-bottom:14px;
  white-space:pre-line;
}
.venue-panel .vp-actions{
  display:flex;gap:8px;justify-content:center;flex-wrap:wrap;
}
.venue-panel .vp-actions a{
  padding:10px 18px;
  border-radius:999px;
  font-size:14px;
  border:1px solid var(--deep);
  color:var(--deep);
  background:transparent;
  text-decoration:none;
  transition:background-color .2s ease,color .2s ease;
  min-height:40px;
  display:inline-flex;align-items:center;
}
.venue-panel .vp-actions a.primary{
  background:var(--deep);color:var(--ivory);
}
.venue-panel .vp-actions a:hover{background:rgba(201,162,75,.15)}
.venue-panel .vp-actions a.primary:hover{background:#6f2038}
.vp-meta{
  font-size:13px;
  color:var(--ink);
  opacity:.75;
  margin-bottom:12px;
  font-style:italic;
  white-space:pre-line;
}

/* ---------- Story ---------- */
#story{text-align:center}
.story-text{
  font-size:clamp(15px,3.8vw,17px);
  line-height:1.75;
  max-width:34ch;
  margin:0 auto;
  color:var(--ink);
  white-space:pre-line;
}

/* ---------- Gallery ---------- */
#gallery{padding-bottom:80px}
.gallery-stack{
  position:relative;
  height:clamp(280px,68vw,380px);
  max-width:420px;
  margin:24px auto 12px;
  perspective:900px;
}
.polaroid{
  position:absolute;left:50%;top:50%;
  width:clamp(200px,62vw,290px);
  aspect-ratio:.82/1;
  padding:10px 10px 34px;
  background:#fff;
  border-radius:3px;
  box-shadow:
    0 12px 30px rgba(58,20,38,.2),
    0 2px 6px rgba(58,20,38,.1);
  transform:translate(-50%,-50%);
  transition:transform .5s cubic-bezier(.4,.1,.3,1),opacity .35s ease;
  will-change:transform,opacity;
  cursor:grab;
  touch-action:pan-y;
}
.polaroid:active{cursor:grabbing}
.polaroid img{
  width:100%;height:100%;object-fit:cover;border-radius:2px;
  pointer-events:none;
}
.polaroid .pol-caption{
  position:absolute;left:0;right:0;bottom:6px;
  text-align:center;
  font-family:"Pinyon Script",cursive;
  font-size:16px;color:var(--deep);
}
.gallery-hint{
  text-align:center;font-size:12px;letter-spacing:.08em;
  color:var(--ink);opacity:.55;
}

/* ---------- Dua ---------- */
#dua{text-align:center}
.dua-ar{
  font-family:"Amiri",serif;
  font-size:clamp(19px,5vw,24px);
  line-height:2;
  direction:rtl;
  color:var(--deep);
  max-width:30ch;
  margin:12px auto 14px;
}
.dua-en{
  font-size:clamp(14px,3.6vw,16px);
  font-style:italic;
  line-height:1.7;
  max-width:36ch;
  margin:0 auto;
  color:var(--ink);
}

/* ---------- RSVP ---------- */
#rsvp{text-align:center}
.rsvp-note{
  font-size:clamp(14px,3.6vw,16px);
  line-height:1.65;
  max-width:34ch;
  margin:0 auto 20px;
  color:var(--ink);
  white-space:pre-line;
}
.rsvp-actions{
  display:flex;gap:10px;justify-content:center;flex-wrap:wrap;
  margin-bottom:14px;
}
.btn-card{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 22px;
  border-radius:999px;
  font-size:15px;
  letter-spacing:.02em;
  cursor:pointer;
  transition:background-color .2s ease,color .2s ease,border-color .2s ease,transform .15s ease;
  min-height:46px;
  border:1px solid var(--deep);
  color:var(--deep);
  background:transparent;
  text-decoration:none;
  font-family:"Cormorant Garamond",serif;
  font-weight:600;
}
.btn-card:hover{background:rgba(201,162,75,.15)}
.btn-card:active{transform:translateY(1px)}
.btn-card:focus-visible{outline:2px solid var(--deep);outline-offset:3px}
.btn-card.solid{background:var(--deep);color:var(--ivory)}
.btn-card.solid:hover{background:#6f2038}
.cal-row{
  display:flex;flex-wrap:wrap;gap:8px;justify-content:center;
  margin-top:6px;
}
.cal-btn{
  padding:9px 14px;
  border-radius:999px;
  border:1px solid rgba(201,162,75,.7);
  background:transparent;
  color:var(--deep);
  font-size:13px;
  cursor:pointer;
  transition:background-color .2s ease;
  min-height:38px;
  display:inline-flex;align-items:center;gap:6px;
  font-family:"Cormorant Garamond",serif;
}
.cal-btn:hover{background:rgba(201,162,75,.15)}
.cal-btn:focus-visible{outline:2px solid var(--deep);outline-offset:2px}

/* ---------- Finale ---------- */
#finale{
  background:
    radial-gradient(ellipse at 50% 0%,rgba(201,162,75,.18),transparent 55%),
    linear-gradient(180deg,#3a1426 0%,#2a0f1e 100%);
  color:var(--ivory);
  text-align:center;
  padding:64px 20px 72px;
  position:relative;
  overflow:hidden;
}
#finale::before{
  content:"";position:absolute;left:50%;top:16px;
  width:44px;height:1px;background:var(--gold);
  transform:translateX(-50%);
}
#finale::after{
  content:"✦";position:absolute;left:50%;top:6px;
  transform:translateX(-50%);color:var(--gold);font-size:11px;
}
#finale .fin-crescent{
  width:44px;height:44px;margin:8px auto 18px;
  color:var(--gold-light);
}
#finale .fin-thanks{
  font-family:"Pinyon Script",cursive;
  font-size:clamp(24px,6vw,32px);
  color:var(--gold-light);
  line-height:1.3;
  max-width:30ch;
  margin:0 auto 14px;
}
#finale .fin-family{
  font-size:clamp(13px,3.4vw,15px);
  letter-spacing:.02em;
  color:rgba(250,243,234,.8);
  margin-bottom:22px;
  white-space:pre-line;
}
#finale .fin-closing{
  font-family:"Cormorant Garamond",serif;
  font-style:italic;
  font-size:clamp(13px,3.4vw,15px);
  color:var(--gold-light);
  letter-spacing:.04em;
  margin-bottom:24px;
}
#finale .fin-share{
  margin-top:6px;
  padding:12px 24px;
  border:1px solid var(--gold);
  border-radius:999px;
  background:rgba(201,162,75,.1);
  color:var(--gold-light);
  font-size:14px;
  letter-spacing:.04em;
  cursor:pointer;
  transition:background-color .2s ease;
  min-height:44px;
}
#finale .fin-share:hover{background:rgba(201,162,75,.22)}
#finale .fin-share:focus-visible{outline:2px solid var(--gold-light);outline-offset:4px}
#finale .fin-note{
  margin-top:14px;font-size:12px;letter-spacing:.06em;
  color:rgba(250,243,234,.55);
}

/* ---------- fx canvas & bg video ---------- */
canvas#fx{
  position:fixed;inset:0;width:100%;height:100%;
  pointer-events:none;z-index:6;
  opacity:0;transition:opacity .8s ease;
}
canvas#fx.on{opacity:1}
video.bgvideo{
  position:absolute;
  pointer-events:none;
  object-fit:cover;
  width:100%;height:100%;
  left:0;top:0;
  mix-blend-mode:screen;
  opacity:.55;
  z-index:0;
}
#arrival video.bgvideo,#finale video.bgvideo{
  position:absolute;inset:0;width:100%;height:100%;
}
#stageInner video.bgvideo{
  position:absolute;inset:0;width:100%;height:100%;
  opacity:.4;
}

/* ---------- mute button ---------- */
#muteBtn{
  position:fixed;right:14px;bottom:14px;
  width:44px;height:44px;border-radius:50%;
  background:rgba(42,15,30,.85);
  color:var(--gold-light);
  border:1px solid var(--gold);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  z-index:40;
  box-shadow:0 6px 20px rgba(0,0,0,.4);
  transition:background-color .2s ease,transform .2s ease;
}
#muteBtn:hover{background:rgba(58,20,38,.95)}
#muteBtn:focus-visible{outline:2px solid var(--gold-light);outline-offset:3px}
#muteBtn svg{width:22px;height:22px;display:block}

/* ---------- fallback / no-js ---------- */
.noscript-note{
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  background:var(--plum);color:var(--ivory);padding:24px;text-align:center;
  font-size:16px;z-index:100;
}

/* ============================================================
   REDUCED MOTION
   ============================================================ */
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important}
  #stage{height:auto}
  #stageInner{position:relative;height:auto;padding:32px 0}
  .arch{position:relative !important;left:auto !important;top:auto !important;transform:none !important;width:auto !important;margin:0 auto 24px;opacity:1 !important;filter:none !important;max-width:min(88vw,440px)}
  .arch-content{opacity:1 !important}
  .name .ink{clip-path:inset(0 0 0 0) !important}
  .reveal{opacity:1 !important;transform:none !important}
  .timeline::before{transform:scaleY(1) !important}
  #envelope,#hintTap,#arrivalLine{opacity:1 !important;transform:none !important}
  #envelope{animation:none !important}
  .ev-card .front,.ev-card .back{transition:none !important}
  canvas#fx{display:none !important}
}

/* ============================================================
   SMALL SCREEN TWEAKS
   ============================================================ */
@media (max-width:400px){
  body{font-size:16px}
  .light-section{padding:52px 16px}
  .cd-grid{gap:6px}
  .cd-cell{padding:10px 2px}
}
`;
})();
// END OF FILE card-style.js
