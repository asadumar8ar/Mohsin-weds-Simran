// card-runtime.js — the Arrival scene, music, videos, ambient petals, countdown, guest name.
// This function is injected into the exported standalone HTML via toString().
// It must be fully self-contained (no references to outer variables).
window.CARD_LOADED_RUNTIME = true;

window.cardRuntimeCore = function (DATA) {
  "use strict";

  // ---- Global card state ----
  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { reduced = false; }

  var openCallbacks = [];
  var card = {
    opened: false,
    reduced: reduced,
    onOpen: function (cb) {
      if (typeof cb !== "function") return;
      if (card.opened) { try { cb(); } catch (e) {} return; }
      openCallbacks.push(cb);
    }
  };
  window.__card = card;

  // ---- Helpers ----
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }
  function safeText(s) { return s == null ? "" : String(s); }
  function prefersReduced() { return card.reduced; }

  // Safely run a function and swallow errors (no console noise).
  function attempt(fn) { try { fn(); } catch (e) {} }

  // ---- Guest name from ?guest= ----
  function readGuestName() {
    var name = "";
    attempt(function () {
      var q = window.location.search || "";
      if (!q) return;
      var params = new URLSearchParams(q);
      var g = params.get("guest");
      if (g) name = g.trim().slice(0, 80);
    });
    if (!name) name = "Dear guests and family";
    return name;
  }

  // ---- Video URL validation ----
  function sanitizeVideoUrl(raw) {
    if (!raw) return "";
    var v = String(raw).trim();
    if (!v) return "";
    if (v.length > 500) return "";
    if (/[\s"'<>]/.test(v)) return "";
    var lower = v.toLowerCase();
    if (lower.indexOf("javascript:") === 0) return "";
    if (lower.indexOf("data:") === 0) return "";
    if (lower.indexOf("vbscript:") === 0) return "";
    if (lower.indexOf("file:") === 0) return "";
    if (/^https?:\/\//i.test(v)) {
      if (!/\.(mp4|webm)(\?|#|$)/i.test(v)) return "";
      return v;
    }
    // simple file name like main.mp4
    if (/^[A-Za-z0-9._\-]+\.(mp4|webm)$/i.test(v)) return v;
    return "";
  }

  // ==========================================================
  // VIDEO MANAGER — creates lazily, respects visibility & tab.
  // ==========================================================
  var videos = {
    opening: null,
    main: null,
    finale: null
  };
  var videoConfig = {
    opening: sanitizeVideoUrl(DATA && DATA.videoOpening),
    main: sanitizeVideoUrl(DATA && DATA.videoMain),
    finale: sanitizeVideoUrl(DATA && DATA.videoFinale)
  };

  function makeVideo(slot, src) {
    if (!src) return null;
    var v = document.createElement("video");
    v.className = "bgvideo";
    v.setAttribute("data-slot", slot);
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.preload = "none";
    v.setAttribute("aria-hidden", "true");
    v.disablePictureInPicture = true;
    v.src = src;
    v.style.opacity = "0";
    v.style.transition = "opacity 1200ms ease";
    v.addEventListener("error", function () {
      // Silent fail: remove the video, CSS fallback stays.
      if (v.parentNode) v.parentNode.removeChild(v);
      if (videos[slot] === v) videos[slot] = null;
    });
    v.addEventListener("canplay", function () {
      if (!v.paused) v.style.opacity = "0.55";
    });
    return v;
  }

  function tryPlay(v) {
    if (!v) return;
    attempt(function () {
      var p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {});
      }
    });
  }

  function pauseVid(v) {
    if (!v) return;
    attempt(function () { v.pause(); });
  }

  function setVideosVisibilityFromTab() {
    if (document.hidden) {
      pauseVid(videos.opening); pauseVid(videos.main); pauseVid(videos.finale);
      return;
    }
    // Restart the one that should be visible based on scroll position.
    updateVideosFromViewport();
  }

  // Determine which video should play based on scroll position.
  function updateVideosFromViewport() {
    if (document.hidden) return;
    var vh = window.innerHeight || 0;

    // Opening: play behind arrival while it is visible.
    var arrival = document.getElementById("arrival");
    if (arrival && !arrival.classList.contains("gone") && videos.opening) {
      tryPlay(videos.opening);
    } else {
      pauseVid(videos.opening);
    }

    // Main: play behind the corridor/scratch stages.
    var stage = document.getElementById("stage");
    var scratch = document.getElementById("scratchWrap");
    var showMain = false;
    if (stage) {
      var sr = stage.getBoundingClientRect();
      if (sr.bottom > 0 && sr.top < vh) showMain = true;
    }
    if (scratch) {
      var scr = scratch.getBoundingClientRect();
      if (scr.bottom > 0 && scr.top < vh) showMain = true;
    }
    if (videos.main && showMain) tryPlay(videos.main);
    else pauseVid(videos.main);

    // Finale
    var fin = document.getElementById("finale");
    if (fin && videos.finale) {
      var fr = fin.getBoundingClientRect();
      if (fr.bottom > 0 && fr.top < vh) tryPlay(videos.finale);
      else pauseVid(videos.finale);
    }
  }

  function mountVideos() {
    // Opening — behind #arrival scene, but before its visual layers.
    var arrival = document.getElementById("arrival");
    if (arrival && videoConfig.opening) {
      videos.opening = makeVideo("opening", videoConfig.opening);
      if (videos.opening) {
        arrival.insertBefore(videos.opening, arrival.firstChild);
      }
    }
    // Main — behind corridor stage and behind scratch.
    if (videoConfig.main) {
      var stage = document.getElementById("stage");
      if (stage) {
        videos.main = makeVideo("main", videoConfig.main);
        if (videos.main) stage.insertBefore(videos.main, stage.firstChild);
      }
      var scratch = document.getElementById("scratchWrap");
      if (scratch && !videos.main) {
        videos.main = makeVideo("main", videoConfig.main);
        if (videos.main) scratch.insertBefore(videos.main, scratch.firstChild);
      } else if (scratch && videos.main) {
        // If scratch is a separate section, add another copy just for it.
        var scratchVid = makeVideo("main", videoConfig.main);
        if (scratchVid) scratch.insertBefore(scratchVid, scratch.firstChild);
      }
    }
    // Finale
    var fin = document.getElementById("finale");
    if (fin && videoConfig.finale) {
      videos.finale = makeVideo("finale", videoConfig.finale);
      if (videos.finale) fin.insertBefore(videos.finale, fin.firstChild);
    }
  }

  // ==========================================================
  // MUSIC — never autoplay. Created only inside the tap handler.
  // ==========================================================
  var audioEl = null;
  var muteBtn = null;
  var musicMuted = false;

  function musicSrc() {
    var src = DATA && DATA.music;
    if (!src || typeof src !== "string") return "";
    if (src.indexOf("data:audio/") !== 0) return "";
    return src;
  }

  function createMusicIfAny() {
    var src = musicSrc();
    if (!src) return;
    if (audioEl) return;
    audioEl = new Audio();
    audioEl.src = src;
    audioEl.loop = true;
    audioEl.preload = "auto";
    audioEl.volume = 0.45;
    audioEl.setAttribute("aria-hidden", "true");
  }

  function playMusic() {
    var src = musicSrc();
    if (!src) return;
    if (!audioEl) createMusicIfAny();
    if (!audioEl) return;
    attempt(function () {
      var p = audioEl.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    });
    createMuteButton();
  }

  function createMuteButton() {
    if (muteBtn) { muteBtn.style.display = "flex"; return; }
    if (!musicSrc()) return;
    muteBtn = document.createElement("button");
    muteBtn.type = "button";
    muteBtn.id = "muteBtn";
    muteBtn.setAttribute("aria-label", "Mute music");
    muteBtn.setAttribute("aria-pressed", "false");
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>';
    document.body.appendChild(muteBtn);
    on(muteBtn, "click", function () {
      musicMuted = !musicMuted;
      if (audioEl) audioEl.muted = musicMuted;
      muteBtn.setAttribute("aria-pressed", musicMuted ? "true" : "false");
      muteBtn.setAttribute("aria-label", musicMuted ? "Unmute music" : "Mute music");
    });
  }

  // ==========================================================
  // ARRIVAL SCENE
  // ==========================================================
  function setupArrival() {
    var arrival = document.getElementById("arrival");
    var seal = document.getElementById("seal");
    var hint = document.getElementById("hintTap");
    if (!arrival || !seal) {
      // No arrival scene, open immediately.
      card.opened = true;
      runOpenCallbacks();
      return;
    }

    // Lock scroll until opened.
    document.body.classList.add("locked");

    // Guest name.
    var toEl = arrival.querySelector(".env-to");
    if (toEl) {
      var guest = readGuestName();
      toEl.innerHTML = "";
      var small = document.createElement("small");
      small.textContent = "To";
      var nameSpan = document.createElement("span");
      nameSpan.textContent = guest;
      nameSpan.setAttribute("dir", "auto");
      toEl.appendChild(small);
      toEl.appendChild(nameSpan);
    }
    // From line.
    var fromEl = arrival.querySelector(".env-from");
    if (fromEl && DATA && DATA.host) {
      fromEl.textContent = "From: " + safeText(DATA.host);
    }

    // Seal initials.
    var initialsEl = arrival.querySelector(".seal-initials");
    if (initialsEl && DATA && DATA.seal) {
      initialsEl.textContent = safeText(DATA.seal);
    }

    // Envelope image override.
    if (DATA && DATA.envelopeImage) {
      var body = arrival.querySelector(".env-body");
      if (body) {
        var img = document.createElement("img");
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.src = DATA.envelopeImage;
        img.style.position = "absolute";
        img.style.inset = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        body.appendChild(img);
        // Face content stays above.
        var face = arrival.querySelector(".env-face");
        if (face) {
          face.style.position = "absolute";
          face.style.zIndex = "3";
        }
      }
    }

    // Hint tap text.
    if (hint) {
      hint.textContent = reduced ? "Tap to open" : "Tap the seal to open";
    }

    // Seal click.
    var opened = false;
    function openCard() {
      if (opened) return;
      opened = true;

      // Play music only inside this user-gesture handler.
      attempt(playMusic);

      // Explode seal into fragments.
      if (!reduced) {
        spawnSealFragments(arrival, seal);
      }

      // Open flap.
      arrival.classList.add("opening");

      // Slide card up, fade out arrival.
      setTimeout(function () {
        arrival.classList.add("gone");
        document.body.classList.remove("locked");
        card.opened = true;
        runOpenCallbacks();
        // Ambient petals after opening.
        startAmbient();
        // Enable video visibility tracking.
        attempt(updateVideosFromViewport);
        // Scroll to corridor start.
        var stage = document.getElementById("stage");
        if (stage) {
          attempt(function () {
            window.scrollTo(0, stage.offsetTop);
          });
        }
      }, reduced ? 100 : 900);
    }

    on(seal, "click", openCard);
    on(seal, "keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openCard();
      }
    });
    seal.setAttribute("tabindex", "0");
    seal.setAttribute("role", "button");
    seal.setAttribute("aria-label", "Open the invitation");
  }

  function spawnSealFragments(arrival, seal) {
    var rect = seal.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var frag = 10;
    for (var i = 0; i < frag; i++) {
      (function (i) {
        var f = document.createElement("div");
        f.className = "seal-frag";
        var angle = (Math.PI * 2 * i) / frag + Math.random() * 0.5;
        var dist = 60 + Math.random() * 80;
        var fx = Math.cos(angle) * dist;
        var fy = Math.sin(angle) * dist;
        var fr = (Math.random() * 720 - 360) + "deg";
        f.style.left = cx + "px";
        f.style.top = cy + "px";
        f.style.setProperty("--fx", fx + "px");
        f.style.setProperty("--fy", fy + "px");
        f.style.setProperty("--fr", fr);
        f.style.animation = "fragFly 900ms cubic-bezier(0.2,0.8,0.4,1) forwards";
        f.style.animationDelay = (i * 12) + "ms";
        arrival.appendChild(f);
        setTimeout(function () {
          if (f.parentNode) f.parentNode.removeChild(f);
        }, 1100);
      })(i);
    }
    // Sparkle burst.
    for (var s = 0; s < 18; s++) {
      (function (s) {
        var sp = document.createElement("div");
        sp.className = "sparkle";
        var a = Math.random() * Math.PI * 2;
        var d = 40 + Math.random() * 120;
        sp.style.left = cx + "px";
        sp.style.top = cy + "px";
        sp.style.transform = "translate(-50%,-50%)";
        var tx = Math.cos(a) * d;
        var ty = Math.sin(a) * d;
        sp.style.transition = "transform 800ms cubic-bezier(0.2,0.8,0.4,1), opacity 800ms ease";
        sp.style.opacity = "1";
        arrival.appendChild(sp);
        requestAnimationFrame(function () {
          sp.style.transform = "translate(calc(-50% + " + tx + "px), calc(-50% + " + ty + "px)) scale(0.2)";
          sp.style.opacity = "0";
        });
        setTimeout(function () {
          if (sp.parentNode) sp.parentNode.removeChild(sp);
        }, 1000);
      })(s);
    }
    // Seal itself fades out.
    seal.style.transition = "opacity 300ms ease, transform 300ms ease";
    seal.style.opacity = "0";
    seal.style.transform = "translate(-50%,-50%) scale(0.4)";
  }

  function runOpenCallbacks() {
    var cbs = openCallbacks.slice();
    openCallbacks = [];
    for (var i = 0; i < cbs.length; i++) {
      attempt(cbs[i]);
    }
  }

  // ==========================================================
  // AMBIENT — falling rose petals + gold dust on canvas#fx
  // ==========================================================
  var fxCanvas = null;
  var fxCtx = null;
  var particles = [];
  var fxRAF = null;
  var fxStarted = false;

  function startAmbient() {
    if (fxStarted) return;
    if (prefersReduced()) return;
    fxStarted = true;
    fxCanvas = document.getElementById("fx");
    if (!fxCanvas) return;
    fxCtx = fxCanvas.getContext("2d");
    if (!fxCtx) return;
    resizeFx();
    // Build initial particles.
    var count = 34;
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(makeParticle(true));
    }
    fxCanvas.classList.add("on");
    on(window, "resize", resizeFx);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopFx();
      else if (card.opened) startFx();
    });
    startFx();
  }

  function resizeFx() {
    if (!fxCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = Math.floor(window.innerWidth * dpr);
    fxCanvas.height = Math.floor(window.innerHeight * dpr);
    fxCanvas.style.width = window.innerWidth + "px";
    fxCanvas.style.height = window.innerHeight + "px";
    if (fxCtx) fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(initial) {
    var isPetal = Math.random() < 0.55;
    var w = window.innerWidth || 360;
    var h = window.innerHeight || 640;
    return {
      isPetal: isPetal,
      x: Math.random() * w,
      y: initial ? Math.random() * h : -20,
      size: isPetal ? 6 + Math.random() * 7 : 1 + Math.random() * 2,
      speedY: isPetal ? 0.4 + Math.random() * 0.8 : 0.2 + Math.random() * 0.5,
      speedX: -0.3 + Math.random() * 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.02,
      swayAmp: isPetal ? 0.6 + Math.random() * 0.9 : 0.2 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: -0.02 + Math.random() * 0.04,
      alpha: isPetal ? 0.55 + Math.random() * 0.35 : 0.4 + Math.random() * 0.5
    };
  }

  function startFx() {
    if (fxRAF) return;
    if (!fxCtx) return;
    var last = 0;
    function frame(t) {
      if (document.hidden) { fxRAF = null; return; }
      if (t - last < 24) { fxRAF = requestAnimationFrame(frame); return; }
      last = t;
      drawFx();
      fxRAF = requestAnimationFrame(frame);
    }
    fxRAF = requestAnimationFrame(frame);
  }

  function stopFx() {
    if (fxRAF) { cancelAnimationFrame(fxRAF); fxRAF = null; }
  }

  function drawFx() {
    if (!fxCtx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    fxCtx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * p.swayAmp * 0.4;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      if (p.y > h + 20 || p.x < -30 || p.x > w + 30) {
        particles[i] = makeParticle(false);
        continue;
      }
      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rot);
      fxCtx.globalAlpha = p.alpha;
      if (p.isPetal) {
        var grad = fxCtx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        grad.addColorStop(0, "#F2C4CB");
        grad.addColorStop(1, "#B85A6E");
        fxCtx.fillStyle = grad;
        fxCtx.beginPath();
        // Petal shape: rounded teardrop.
        fxCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        fxCtx.fill();
      } else {
        fxCtx.fillStyle = "#F0D58A";
        fxCtx.shadowColor = "#F0D58A";
        fxCtx.shadowBlur = 6;
        fxCtx.beginPath();
        fxCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }
      fxCtx.restore();
    }
  }

  // ==========================================================
  // COUNTDOWN — reads .cd-num[data-unit] elements.
  // ==========================================================
  function findMainEvent() {
    if (!DATA || !DATA.events || !DATA.events.length) return null;
    for (var i = 0; i < DATA.events.length; i++) {
      if (DATA.events[i] && DATA.events[i].isMain) return DATA.events[i];
    }
    return DATA.events[0];
  }

  // Build a Date object for an event in IST.
  function eventDateIST(ev) {
    if (!ev || !ev.date) return null;
    var dateParts = String(ev.date).split("-");
    if (dateParts.length !== 3) return null;
    var y = parseInt(dateParts[0], 10);
    var m = parseInt(dateParts[1], 10);
    var d = parseInt(dateParts[2], 10);
    var timeParts = (ev.time || "00:00").split(":");
    var hh = parseInt(timeParts[0], 10) || 0;
    var mm = parseInt(timeParts[1], 10) || 0;
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    // IST = UTC+5:30, fixed offset (no DST in India).
    var utcMs = Date.UTC(y, m - 1, d, hh, mm) - 5.5 * 60 * 60 * 1000;
    var dt = new Date(utcMs);
    return isNaN(dt.getTime()) ? null : dt;
  }

  function setupCountdown() {
    var wrap = document.getElementById("countdown");
    if (!wrap) return;
    var ev = findMainEvent();
    var target = eventDateIST(ev);
    var grid = wrap.querySelector(".cd-grid");
    var begun = wrap.querySelector(".cd-begun");
    if (!target) {
      if (grid) grid.style.display = "none";
      if (begun) begun.style.display = "block";
      return;
    }
    var nums = {
      days: wrap.querySelector('.cd-num[data-unit="days"]'),
      hours: wrap.querySelector('.cd-num[data-unit="hours"]'),
      minutes: wrap.querySelector('.cd-num[data-unit="minutes"]'),
      seconds: wrap.querySelector('.cd-num[data-unit="seconds"]')
    };
    function pad2(n) { return (n < 10 ? "0" : "") + n; }
    function setNum(el, val) {
      if (!el) return;
      var s = val;
      if (el.textContent !== s) {
        el.textContent = s;
        if (!prefersReduced()) {
          el.classList.remove("flip");
          // Force reflow then add.
          void el.offsetWidth;
          el.classList.add("flip");
        }
      }
    }
    function tick() {
      var now = Date.now();
      var diff = target.getTime() - now;
      if (diff <= 0) {
        if (grid) grid.style.display = "none";
        if (begun) begun.style.display = "block";
        clearInterval(timer);
        return;
      }
      var totalSec = Math.floor(diff / 1000);
      var days = Math.floor(totalSec / 86400);
      var hours = Math.floor((totalSec % 86400) / 3600);
      var mins = Math.floor((totalSec % 3600) / 60);
      var secs = totalSec % 60;
      setNum(nums.days, String(days));
      setNum(nums.hours, pad2(hours));
      setNum(nums.minutes, pad2(mins));
      setNum(nums.seconds, pad2(secs));
    }
    tick();
    var timer = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tick();
    });
  }

  // ==========================================================
  // VIDEO VISIBILITY — on scroll/resize, throttle via rAF.
  // ==========================================================
  var visRAFPending = false;
  function scheduleVideoUpdate() {
    if (visRAFPending) return;
    visRAFPending = true;
    requestAnimationFrame(function () {
      visRAFPending = false;
      attempt(updateVideosFromViewport);
    });
  }

  // ==========================================================
  // BOOT
  // ==========================================================
  function boot() {
    // Set theme on root.
    if (DATA && DATA.theme) {
      document.documentElement.setAttribute("data-theme", DATA.theme);
    } else {
      document.documentElement.setAttribute("data-theme", "gulabi");
    }

    // Mount videos (lazy, no autoplay until visible).
    attempt(mountVideos);

    // Arrival scene.
    attempt(setupArrival);

    // Countdown.
    attempt(setupCountdown);

    // Video scroll tracking.
    on(window, "scroll", scheduleVideoUpdate, { passive: true });
    on(window, "resize", scheduleVideoUpdate);
    document.addEventListener("visibilitychange", setVideosVisibilityFromTab);

    // One-time "opened" hook for the scenes file to use.
    card.onOpen(function () {
      // The Arrival scene has finished; scenes file will run its own logic.
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
};

// END OF FILE card-runtime.js
