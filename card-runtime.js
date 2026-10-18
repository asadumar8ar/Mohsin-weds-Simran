/* card-runtime.js — runtime core injected into the exported card. */
"use strict";
(function () {
  window.CARD_LOADED_RUNTIME = true;

  window.cardRuntimeCore = function (DATA) {
    "use strict";

    /* ---- Shared state ---- */
    var card = window.__card = {
      opened: false,
      safe: (location.search.indexOf("safe=1") > -1),
      reduced: (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || false,
      _cbs: [],
      onOpen: function (cb) {
        if (this.opened) { try { cb(); } catch (e) {} }
        else { this._cbs.push(cb); }
      },
      fireOpen: function () {
        if (this.opened) return;
        this.opened = true;
        var cbs = this._cbs.slice();
        this._cbs = [];
        for (var i = 0; i < cbs.length; i++) {
          try { cbs[i](); } catch (e) {}
        }
      }
    };

    /* Set theme immediately. */
    try {
      var theme = (DATA && DATA.theme) ? String(DATA.theme) : "gulabi";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (e) {}

    /* ---- Helpers ---- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) {
      var list = (root || document).querySelectorAll(sel);
      var out = []; for (var i = 0; i < list.length; i++) out.push(list[i]);
      return out;
    }
    function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
    function esc(s) {
      if (s == null) return "";
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function safeText(el, txt) { if (el) el.textContent = txt == null ? "" : String(txt); }
    function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

    /* ============================================================
       GUEST NAME
       ============================================================ */
    try {
      var qs = location.search || "";
      var m = qs.match(/[?&]guest=([^&]*)/);
      if (m) {
        var raw = m[1].replace(/\+/g, " ");
        var decoded = "";
        try { decoded = decodeURIComponent(raw); } catch (e) { decoded = raw; }
        decoded = decoded.slice(0, 40).replace(/<[^>]*>/g, "").trim();
        if (decoded) {
          var gEl = document.getElementById("guestName");
          if (gEl) gEl.textContent = decoded;
          card.guestName = decoded;
        }
      } else {
        var gEl2 = document.getElementById("guestName");
        if (gEl2 && !gEl2.textContent) gEl2.textContent = "Dear guests and family";
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       ARRIVAL — envelope + seal
       ============================================================ */
    try {
      var arrival = document.getElementById("arrival");
      var envelope = document.getElementById("envelope");
      var seal = document.getElementById("seal");
      var hintTap = document.getElementById("hintTap");
      var stageEl = document.getElementById("stage");
      var body = document.body;

      if (arrival) {
        body.classList.add("locked");
        arrival.classList.add("show-line");

        setTimeout(function () {
          try { arrival.classList.add("pinged"); } catch (e) {}
        }, 300);

        setTimeout(function () {
          try { arrival.classList.add("env-shown"); } catch (e) {}
        }, 800);

        setTimeout(function () {
          try { arrival.classList.add("env-float"); } catch (e) {}
        }, 1700);

        if (card.reduced || card.safe) {
          arrival.classList.add("show-line", "env-shown");
          body.classList.remove("locked");
        }
      }

      var opened = false;

      function crackSeal() {
        if (!seal) return;
        try {
          seal.classList.add("cracked");
          var rect = seal.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var fragCount = 9;
          for (var i = 0; i < fragCount; i++) {
            var f = document.createElement("span");
            f.className = "seal-frag";
            f.style.left = cx + "px";
            f.style.top = cy + "px";
            f.style.transform = "translate(-50%,-50%)";
            f.style.width = (8 + Math.random() * 8) + "px";
            f.style.height = (8 + Math.random() * 8) + "px";
            document.body.appendChild(f);
            (function (frag) {
              var ang = Math.random() * Math.PI * 2;
              var dist = 40 + Math.random() * 90;
              var tx = Math.cos(ang) * dist;
              var ty = Math.sin(ang) * dist - 30;
              var rot = (Math.random() - 0.5) * 720;
              requestAnimationFrame(function () {
                frag.style.transition = "transform .7s cubic-bezier(.2,.8,.3,1), opacity .7s ease";
                frag.style.transform = "translate(-50%,-50%) translate(" + tx + "px," + ty + "px) rotate(" + rot + "deg)";
                frag.style.opacity = "0";
              });
              setTimeout(function () { if (frag.parentNode) frag.parentNode.removeChild(frag); }, 900);
            })(f);
          }
          /* Gold sparkles */
          for (var s = 0; s < 16; s++) {
            var sp = document.createElement("span");
            sp.className = "sparkle";
            sp.style.left = cx + "px";
            sp.style.top = cy + "px";
            document.body.appendChild(sp);
            (function (spark) {
              var ang = Math.random() * Math.PI * 2;
              var dist = 20 + Math.random() * 120;
              var tx = Math.cos(ang) * dist;
              var ty = Math.sin(ang) * dist;
              spark.style.transition = "transform .8s ease-out, opacity .8s ease-out";
              requestAnimationFrame(function () {
                spark.style.transform = "translate(" + tx + "px," + ty + "px) scale(.4)";
                spark.style.opacity = "0";
              });
              setTimeout(function () { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 1000);
            })(sp);
          }
        } catch (e) { /* ignore */ }
      }

      function openCard() {
        if (opened) return;
        opened = true;
        try {
          if (seal) seal.style.pointerEvents = "none";
          crackSeal();
          setTimeout(function () {
            try { if (envelope) envelope.classList.add("open"); } catch (e) {}
          }, 300);
          setTimeout(function () {
            try { arrival.classList.add("leaving"); } catch (e) {}
          }, 1500);
          setTimeout(function () {
            try {
              arrival.style.display = "none";
              body.classList.remove("locked");
              if (stageEl) stageEl.scrollIntoView({ block: "start" });
              if (card) card.fireOpen();
              document.documentElement.classList.add("card-opened");
              var ev = new CustomEvent("card:opened");
              window.dispatchEvent(ev);
            } catch (e) {}
          }, 2200);
        } catch (e) {}
      }

      if (seal) {
        on(seal, "click", openCard);
        on(seal, "keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            openCard();
          }
        });
        if (!seal.getAttribute("tabindex")) seal.setAttribute("tabindex", "0");
        if (!seal.getAttribute("role")) seal.setAttribute("role", "button");
        if (!seal.getAttribute("aria-label")) seal.setAttribute("aria-label", "Open the invitation");
      }

      if (card.reduced || card.safe) {
        /* In reduced motion: still require a tap, but skip animations. */
        if (seal) {
          seal.classList.remove("cracked");
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       MUSIC — never autoplay
       ============================================================ */
    try {
      var musicSrc = DATA && DATA.music && DATA.music.src ? String(DATA.music.src) : "";
      var audio = null;
      var muteBtn = null;

      function isValidAudioSrc(v) {
        if (!v) return false;
        var s = String(v).trim();
        if (/^\s*javascript:/i.test(s) || /^\s*data:/i.test(s)) return false;
        if (/\s/.test(s.replace(/^https?:\/\/[^\s]+/i, ""))) return false;
        if (/["']/.test(s)) return false;
        return /^https?:\/\//i.test(s) || /\.(mp3|ogg|m4a|wav)$/i.test(s);
      }

      function createMuteBtn() {
        if (muteBtn) return;
        if (!musicSrc || !isValidAudioSrc(musicSrc)) return;
        muteBtn = document.createElement("button");
        muteBtn.type = "button";
        muteBtn.id = "muteBtn";
        muteBtn.setAttribute("aria-label", "Mute music");
        muteBtn.setAttribute("aria-pressed", "false");
        muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>';
        on(muteBtn, "click", function () {
          try {
            if (!audio) return;
            audio.muted = !audio.muted;
            muteBtn.setAttribute("aria-pressed", audio.muted ? "true" : "false");
          } catch (e) {}
        });
        document.body.appendChild(muteBtn);
      }

      /* First tap anywhere triggers music (only once, only if valid). */
      if (musicSrc && isValidAudioSrc(musicSrc)) {
        var musicStarted = false;
        function tryStartMusic() {
          if (musicStarted) return;
          musicStarted = true;
          try {
            audio = new Audio(musicSrc);
            audio.loop = true;
            audio.volume = 0.35;
            var p = audio.play();
            if (p && p.catch) p.catch(function () { /* silent */ });
            card.onOpen(function () { createMuteBtn(); });
          } catch (e) {}
        }
        on(document, "pointerdown", tryStartMusic, { once: false, passive: true });
        on(document, "keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") tryStartMusic();
        }, { once: false });
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       VIDEOS
       ============================================================ */
    try {
      var vidsCfg = DATA && DATA.videos ? DATA.videos : {};
      var validVidSrc = function (v) {
        if (!v) return "";
        var s = String(v).trim();
        if (!s) return "";
        if (/^javascript:/i.test(s) || /^data:/i.test(s)) return "";
        if (/\s/.test(s)) return "";
        if (/["']/.test(s)) return "";
        if (/^https?:\/\//i.test(s)) {
          if (!/\.(mp4|webm)(\?|#|$)/i.test(s)) return "";
          return s;
        }
        if (/^[A-Za-z0-9_\-.]+\.(mp4|webm)$/i.test(s)) return s;
        return "";
      };

      var slots = [
        { key: "opening", v: validVidSrc(vidsCfg.opening) },
        { key: "main", v: validVidSrc(vidsCfg.main) },
        { key: "finale", v: validVidSrc(vidsCfg.finale) }
      ];

      var videoEls = [];

      if (!card.safe) {
        for (var vi = 0; vi < slots.length; vi++) {
          (function (slot) {
            if (!slot.v) return;
            var hosts = $$('video.bgvideo[data-slot="' + slot.key + '"]');
            for (var h = 0; h < hosts.length; h++) {
              (function (v) {
                try {
                  v.setAttribute("src", slot.v);
                  v.muted = true;
                  v.loop = true;
                  v.playsInline = true;
                  v.setAttribute("playsinline", "");
                  v.setAttribute("muted", "");
                  v.preload = "none";
                  v.style.opacity = "0.55";
                  v.addEventListener("error", function () {
                    try { if (v.parentNode) v.parentNode.removeChild(v); } catch (e) {}
                  });
                  v.addEventListener("loadeddata", function () {
                    try { v.style.opacity = "0.55"; } catch (e) {}
                  });
                  videoEls.push(v);
                } catch (e) {}
              })(hosts[h]);
            }
          })(slots[vi]);
        }

        /* Pause off-screen videos. */
        if ("IntersectionObserver" in window) {
          var vio = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
              var en = entries[i];
              var v = en.target;
              try {
                if (en.isIntersecting) {
                  if (card.opened) {
                    v.preload = "auto";
                    var p = v.play();
                    if (p && p.catch) p.catch(function () {});
                  }
                } else {
                  v.pause();
                }
              } catch (e) {}
            }
          }, { threshold: 0.15 });
          for (var vk = 0; vk < videoEls.length; vk++) {
            try { vio.observe(videoEls[vk]); } catch (e) {}
          }
        }

        /* Pause on hidden tab. */
        document.addEventListener("visibilitychange", function () {
          try {
            for (var i = 0; i < videoEls.length; i++) {
              if (document.hidden) videoEls[i].pause();
              else if (card.opened) {
                var p = videoEls[i].play();
                if (p && p.catch) p.catch(function () {});
              }
            }
          } catch (e) {}
        });

        /* Start playing after open. */
        card.onOpen(function () {
          for (var i = 0; i < videoEls.length; i++) {
            try {
              videoEls[i].preload = "auto";
              var p = videoEls[i].play();
              if (p && p.catch) p.catch(function () {});
            } catch (e) {}
          }
        });
      } else {
        /* Safe mode: remove all bg videos */
        var all = $$("video.bgvideo");
        for (var ai = 0; ai < all.length; ai++) {
          try { if (all[ai].parentNode) all[ai].parentNode.removeChild(all[ai]); } catch (e) {}
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       PETALS + GOLD DUST
       ============================================================ */
    try {
      if (!card.safe && !card.reduced) {
        var canvas = document.getElementById("fx");
        if (canvas) {
          var ctx = canvas.getContext("2d");
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var W = 0, H = 0;
          var parts = [];
          var running = false;
          var rafId = null;
          var MAX = 40;

          function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = Math.floor(W * dpr);
            canvas.height = Math.floor(H * dpr);
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
            if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          resize();
          window.addEventListener("resize", resize);

          function makePetal(burst) {
            var r = Math.random();
            return {
              x: Math.random() * W,
              y: burst ? H * 0.3 + Math.random() * 80 : -30 - Math.random() * 80,
              vx: (Math.random() - 0.5) * (burst ? 3.5 : 0.8),
              vy: burst ? -(1.5 + Math.random() * 2.5) : (0.4 + Math.random() * 0.8),
              size: 4 + Math.random() * 7,
              rot: Math.random() * Math.PI * 2,
              vr: (Math.random() - 0.5) * 0.06,
              sway: Math.random() * Math.PI * 2,
              swaySpeed: 0.006 + Math.random() * 0.01,
              color: r < 0.7 ? "#d9a0a6" : "#f0d58a",
              gold: r >= 0.7,
              life: burst ? 1 : 0,
              fade: burst ? 0.006 + Math.random() * 0.004 : 0
            };
          }

          function tick() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (var i = parts.length - 1; i >= 0; i--) {
              var p = parts[i];
              p.sway += p.swaySpeed;
              p.x += p.vx + Math.sin(p.sway) * 0.4;
              p.y += p.vy;
              p.rot += p.vr;
              if (p.life > 0) {
                p.life -= p.fade;
                if (p.life <= 0) { parts.splice(i, 1); continue; }
              }
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.globalAlpha = p.life > 0 ? Math.max(0, p.life) : 1;
              if (p.gold) {
                var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                g.addColorStop(0, "rgba(255,248,224,0.95)");
                g.addColorStop(0.5, "rgba(240,213,138,0.75)");
                g.addColorStop(1, "rgba(201,162,75,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
              } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
              if (p.life === 0 && (p.y > H + 30 || p.x < -30 || p.x > W + 30)) {
                parts.splice(i, 1);
              }
            }
            /* Top-up ambient petals */
            while (parts.length < MAX && Math.random() < 0.4) {
              parts.push(makePetal(false));
            }
            rafId = requestAnimationFrame(tick);
          }

          function start() {
            if (running) return;
            running = true;
            canvas.classList.add("on");
            for (var i = 0; i < 16; i++) parts.push(makePetal(false));
            rafId = requestAnimationFrame(tick);
          }

          function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
          }

          card.onOpen(function () {
            setTimeout(start, 400);
          });

          window.__cardBurst = function () {
            try {
              for (var i = 0; i < 30; i++) {
                var p = makePetal(true);
                p.y = H * 0.55 + Math.random() * 40;
                parts.push(p);
              }
            } catch (e) {}
          };

          document.addEventListener("visibilitychange", function () {
            if (document.hidden) stop();
            else if (card.opened) start();
          });
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       COUNTDOWN
       ============================================================ */
    try {
      var eventsList = (DATA && DATA.events) ? DATA.events : [];
      var mainEv = null;
      for (var ei = 0; ei < eventsList.length; ei++) {
        if (eventsList[ei] && eventsList[ei].isMain) { mainEv = eventsList[ei]; break; }
      }
      if (!mainEv && eventsList.length) mainEv = eventsList[0];

      var cdNums = $$(".cd-num");
      var cdWrap = document.getElementById("countdown");
      if (mainEv && cdNums.length) {
        var dateStr = (mainEv.date || "").trim();
        var timeStr = (mainEv.time || "12:00").trim();
        var target = null;
        if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          var iso = dateStr + "T" + (timeStr.length === 5 ? timeStr : "12:00") + ":00+05:30";
          var d = new Date(iso);
          if (!isNaN(d.getTime())) target = d;
        }

        var last = { days: -1, hours: -1, minutes: -1, seconds: -1 };
        var doneEl = null;

        function pad(n) { return n < 10 ? "0" + n : String(n); }

        function updateCd() {
          if (!target) return;
          var diff = target.getTime() - Date.now();
          if (diff <= 0) {
            for (var i = 0; i < cdNums.length; i++) {
              cdNums[i].textContent = "00";
            }
            if (!doneEl && cdWrap) {
              doneEl = document.createElement("div");
              doneEl.className = "cd-done";
              doneEl.textContent = "The celebrations have begun";
              cdWrap.appendChild(doneEl);
              var grid = cdWrap.querySelector(".cd-grid");
              if (grid) grid.style.opacity = "0.55";
            }
            return;
          }
          var totalSec = Math.floor(diff / 1000);
          var days = Math.floor(totalSec / 86400);
          var hours = Math.floor((totalSec % 86400) / 3600);
          var minutes = Math.floor((totalSec % 3600) / 60);
          var seconds = totalSec % 60;
          var vals = { days: days, hours: hours, minutes: minutes, seconds: seconds };
          for (var j = 0; j < cdNums.length; j++) {
            var el = cdNums[j];
            var unit = el.getAttribute("data-unit");
            if (!unit || !(unit in vals)) continue;
            var v = vals[unit];
            if (last[unit] !== v) {
              el.classList.add("flip");
              (function (elx, val) {
                setTimeout(function () {
                  elx.textContent = pad(val);
                  elx.classList.remove("flip");
                }, 180);
              })(el, v);
              last[unit] = v;
            }
          }
        }
        updateCd();
        setInterval(updateCd, 1000);
      }
    } catch (e) { /* ignore */ }
  };
})();
// END OF FILE card-runtime.js
