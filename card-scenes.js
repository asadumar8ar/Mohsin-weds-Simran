/* card-scenes.js — scene animations injected into the exported card. */
"use strict";
(function () {
  window.CARD_LOADED_SCENES = true;

  window.cardRuntimeScenes = function (DATA) {
    "use strict";

    var card = window.__card || {
      opened: false, safe: false, reduced: false,
      onOpen: function (cb) { setTimeout(cb, 0); }
    };
    var SAFE = !!card.safe;
    var REDUCED = !!card.reduced;
    var NO_MOTION = SAFE || REDUCED;

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) {
      var l = (r || document).querySelectorAll(s);
      var o = []; for (var i = 0; i < l.length; i++) o.push(l[i]); return o;
    }
    function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function rafThrottle(fn) {
      var queued = false;
      return function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          fn();
        });
      };
    }

    /* ============================================================
       CORRIDOR
       ============================================================ */
    try {
      var stage = document.getElementById("stage");
      var stageInner = document.getElementById("stageInner");
      var arches = $$(".arch");
      var contents = $$(".arch-content", stageInner || document);
      var bloom = $(".gold-bloom", stageInner || document);

      if (stage && stageInner && arches.length) {
        var N = arches.length;
        var TOL = 0.55;

        /* Initial paint */
        function paint() {
          var sTop = stage.offsetTop;
          var sH = stage.offsetHeight;
          var vh = window.innerHeight;
          var p = clamp((window.scrollY - sTop) / Math.max(1, sH - vh), 0, 1);

          for (var i = 0; i < N; i++) {
            var d = i - p * (N - 1);
            var z = -d * 520;
            var op;
            if (d >= 0) op = Math.max(0, 1 - d * 0.75);
            else op = Math.max(0, 1 + d * 1.7);
            var blur = d < 0 ? Math.min(8, -d * 10) : 0;

            var a = arches[i];
            a.style.transform = "translate(-50%,-50%) translate3d(0,0," + z + "px)";
            a.style.opacity = op;
            if (blur > 0.4) a.style.filter = "blur(" + blur.toFixed(2) + "px)";
            else a.style.filter = "none";
            a.style.pointerEvents = (Math.abs(d) < 0.55) ? "auto" : "none";

            if (contents[i]) {
              var c = Math.abs(d) < TOL ? (1 - Math.abs(d) / TOL) : 0;
              contents[i].style.opacity = c;
            }
          }

          if (bloom) {
            var near = false;
            for (var k = 0; k < N; k++) {
              var dk = k - p * (N - 1);
              if (Math.abs(dk) < 0.15) { near = true; break; }
            }
            bloom.style.opacity = near ? "1" : "0";
          }
        }

        if (REDUCED || SAFE) {
          /* Stack all arches; no pinning. */
          for (var ri = 0; ri < arches.length; ri++) {
            arches[ri].style.position = "relative";
            arches[ri].style.left = "auto";
            arches[ri].style.top = "auto";
            arches[ri].style.transform = "none";
            arches[ri].style.opacity = "1";
            arches[ri].style.filter = "none";
            if (contents[ri]) contents[ri].style.opacity = "1";
          }
          stage.style.height = "auto";
          stageInner.style.position = "relative";
          stageInner.style.height = "auto";
        } else {
          var onScroll = rafThrottle(paint);
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          paint();
          /* Re-paint after fonts/images settle. */
          setTimeout(paint, 400);
          setTimeout(paint, 1200);
        }

        /* Ink names when their arch is near. */
        var names = $$(".name");
        var inkedFlags = [];

        function maybeInkNames() {
          if (REDUCED || SAFE) {
            for (var i = 0; i < names.length; i++) {
              names[i].classList.add("inked", "shimmer");
            }
            return;
          }
          var sTop = stage.offsetTop;
          var sH = stage.offsetHeight;
          var vh = window.innerHeight;
          var p = clamp((window.scrollY - sTop) / Math.max(1, sH - vh), 0, 1);
          for (var n = 0; n < names.length; n++) {
            var arch = names[n].closest ? names[n].closest(".arch") : null;
            if (!arch) continue;
            var idx = parseInt(arch.getAttribute("data-i"), 10) || 0;
            var d = idx - p * (N - 1);
            if (!inkedFlags[n] && Math.abs(d) < 0.4) {
              inkedFlags[n] = true;
              (function (nm) {
                nm.classList.add("inked", "inking");
                var pen = nm.querySelector(".pen");
                setTimeout(function () {
                  nm.classList.remove("inking");
                  nm.classList.add("shimmer");
                  if (pen) pen.style.opacity = "0";
                }, 1900);
              })(names[n]);
            }
          }
        }

        if (!(REDUCED || SAFE)) {
          var onScrollInk = rafThrottle(maybeInkNames);
          window.addEventListener("scroll", onScrollInk, { passive: true });
          maybeInkNames();
        } else {
          maybeInkNames();
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       SCRATCH PANEL
       ============================================================ */
    try {
      var scratchPanel = $(".scratch-panel");
      var scratchCanvas = document.getElementById("scratchCanvas");
      var revealBtn = document.getElementById("revealBtn");

      if (scratchPanel && scratchCanvas) {
        var ctx = scratchCanvas.getContext("2d");
        var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        var done = false;
        var moveCount = 0;
        var sparkles = [];

        function sizeCanvas() {
          var rect = scratchPanel.getBoundingClientRect();
          W = Math.max(60, Math.floor(rect.width));
          H = Math.max(60, Math.floor(rect.height));
          scratchCanvas.width = Math.floor(W * dpr);
          scratchCanvas.height = Math.floor(H * dpr);
          scratchCanvas.style.width = W + "px";
          scratchCanvas.style.height = H + "px";
          if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawFoil();
        }

        function drawFoil() {
          if (!ctx) return;
          var g = ctx.createLinearGradient(0, 0, W, H);
          g.addColorStop(0, "#F0D58A");
          g.addColorStop(0.35, "#C9A24B");
          g.addColorStop(0.55, "#E6C87C");
          g.addColorStop(0.75, "#C9A24B");
          g.addColorStop(1, "#F0D58A");
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          /* Glitter dots */
          ctx.fillStyle = "rgba(255,255,255,.7)";
          for (var i = 0; i < 250; i++) {
            var x = Math.random() * W;
            var y = Math.random() * H;
            ctx.globalAlpha = 0.3 + Math.random() * 0.6;
            ctx.fillRect(x, y, 1, 1);
          }
          ctx.globalAlpha = 1;
          /* Faint label */
          ctx.fillStyle = "rgba(58,20,38,.55)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          var fs = Math.max(14, Math.min(W, H) * 0.06);
          ctx.font = "italic " + fs + "px 'Cormorant Garamond', Georgia, serif";
          ctx.fillText("Scratch here", W / 2, H / 2);
        }

        sizeCanvas();
        window.addEventListener("resize", function () {
          if (!done) sizeCanvas();
        });

        function eraseAt(x, y) {
          if (!ctx) return;
          ctx.globalCompositeOperation = "destination-out";
          var r = 28;
          var grd = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
          grd.addColorStop(0, "rgba(0,0,0,1)");
          grd.addColorStop(0.7, "rgba(0,0,0,0.85)");
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }

        function estimateCleared() {
          if (!ctx) return 0;
          var gw = 24, gh = 24;
          var sw = Math.max(1, Math.floor(scratchCanvas.width / gw));
          var sh = Math.max(1, Math.floor(scratchCanvas.height / gh));
          var cleared = 0, total = 0;
          try {
            var img = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
            var data = img.data;
            for (var gy = 0; gy < gh; gy++) {
              for (var gx = 0; gx < gw; gx++) {
                var px = Math.floor((gx + 0.5) * (scratchCanvas.width / gw));
                var py = Math.floor((gy + 0.5) * (scratchCanvas.height / gh));
                if (px < 0) px = 0; if (py < 0) py = 0;
                if (px >= scratchCanvas.width) px = scratchCanvas.width - 1;
                if (py >= scratchCanvas.height) py = scratchCanvas.height - 1;
                var idx = (py * scratchCanvas.width + px) * 4;
                total++;
                if (data[idx + 3] < 40) cleared++;
              }
            }
          } catch (e) {
            return 0;
          }
          return total ? cleared / total : 0;
        }

        function finish() {
          if (done) return;
          done = true;
          try {
            scratchCanvas.classList.add("done");
            if (window.__cardBurst) window.__cardBurst();
          } catch (e) {}
        }

        var drawing = false;
        var lastX = 0, lastY = 0;
        var lastSparkTime = 0;

        function pointerPos(e) {
          var r = scratchCanvas.getBoundingClientRect();
          var cx, cy;
          if (e.touches && e.touches.length) {
            cx = e.touches[0].clientX; cy = e.touches[0].clientY;
          } else if (e.changedTouches && e.changedTouches.length) {
            cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY;
          } else {
            cx = e.clientX; cy = e.clientY;
          }
          return { x: cx - r.left, y: cy - r.top };
        }

        function spawnSpark(x, y) {
          try {
            if (!window.__cardBurst) return;
            /* Only use our own burst; the runtime handles visuals. */
          } catch (e) {}
        }

        function startDraw(e) {
          if (done) return;
          drawing = true;
          var p = pointerPos(e);
          lastX = p.x; lastY = p.y;
          eraseAt(p.x, p.y);
          e.preventDefault && e.preventDefault();
        }
        function moveDraw(e) {
          if (!drawing || done) return;
          var p = pointerPos(e);
          var dx = p.x - lastX, dy = p.y - lastY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var steps = Math.max(1, Math.ceil(dist / 12));
          for (var s = 0; s < steps; s++) {
            var t = s / steps;
            eraseAt(lastX + dx * t, lastY + dy * t);
          }
          lastX = p.x; lastY = p.y;
          moveCount++;
          if (moveCount % 10 === 0) {
            if (estimateCleared() >= 0.55) finish();
          }
          e.preventDefault && e.preventDefault();
        }
        function endDraw() {
          if (!drawing) return;
          drawing = false;
          if (estimateCleared() >= 0.55) finish();
        }

        /* Pointer events with touch fallback */
        if ("PointerEvent" in window) {
          on(scratchCanvas, "pointerdown", startDraw);
          on(scratchCanvas, "pointermove", moveDraw);
          on(scratchCanvas, "pointerup", endDraw);
          on(scratchCanvas, "pointercancel", endDraw);
          on(scratchCanvas, "pointerleave", endDraw);
        } else {
          on(scratchCanvas, "mousedown", startDraw);
          on(scratchCanvas, "mousemove", function (e) { if (drawing) moveDraw(e); });
          on(window, "mouseup", endDraw);
          on(scratchCanvas, "touchstart", startDraw, { passive: false });
          on(scratchCanvas, "touchmove", moveDraw, { passive: false });
          on(scratchCanvas, "touchend", endDraw);
          on(scratchCanvas, "touchcancel", endDraw);
        }

        /* Keyboard / accessibility: reveal button */
        if (revealBtn) {
          on(revealBtn, "click", finish);
        }

        /* Auto-finish when panel is nearly out of view after 40 sec? No — let user decide. */
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       INK NAMES (safety net if corridor failed)
       ============================================================ */
    try {
      var allNames = $$(".name");
      if (allNames.length) {
        if (NO_MOTION) {
          for (var ini = 0; ini < allNames.length; ini++) {
            allNames[ini].classList.add("inked", "shimmer");
          }
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       GOLD SWEEP between deep & light sections
       ============================================================ */
    try {
      if (!NO_MOTION) {
        var sweeps = $$(".sweep");
        if (sweeps.length && "IntersectionObserver" in window) {
          var swIo = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
              var en = entries[i];
              if (en.isIntersecting && !en.target.__fired) {
                en.target.__fired = true;
                en.target.classList.add("fire");
              }
            }
          }, { threshold: 0.1 });
          for (var s = 0; s < sweeps.length; s++) swIo.observe(sweeps[s]);
        }
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       REVEAL — IntersectionObserver
       ============================================================ */
    try {
      var reveals = $$(".reveal");
      if (NO_MOTION) {
        for (var rvi = 0; rvi < reveals.length; rvi++) reveals[rvi].classList.add("in");
      } else if ("IntersectionObserver" in window) {
        var rio = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var en = entries[i];
            if (en.isIntersecting) {
              en.target.classList.add("in");
              rio.unobserve(en.target);
            }
          }
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
        for (var rv = 0; rv < reveals.length; rv++) rio.observe(reveals[rv]);
      } else {
        for (var rvf = 0; rvf < reveals.length; rvf++) reveals[rvf].classList.add("in");
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       PROGRAMME — parchment, tilt, flip
       ============================================================ */
    try {
      var timeline = $(".timeline");
      if (timeline) {
        if (NO_MOTION) {
          timeline.classList.add("drawn");
        } else if ("IntersectionObserver" in window) {
          var tio = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) {
                entries[i].target.classList.add("drawn");
                tio.unobserve(entries[i].target);
              }
            }
          }, { threshold: 0.15 });
          tio.observe(timeline);
        } else {
          timeline.classList.add("drawn");
        }
      }

      var evCards = $$(".ev-card");
      for (var ci = 0; ci < evCards.length; ci++) {
        (function (cardEl) {
          /* Tap to flip */
          on(cardEl, "click", function (e) {
            if (e && e.target && (e.target.tagName === "A" || e.target.tagName === "BUTTON")) return;
            cardEl.classList.toggle("flipped");
          });
          on(cardEl, "keydown", function (e) {
            if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
              e.preventDefault();
              cardEl.classList.toggle("flipped");
            }
          });
          if (!cardEl.getAttribute("tabindex")) cardEl.setAttribute("tabindex", "0");
          if (!cardEl.getAttribute("role")) cardEl.setAttribute("role", "button");
          if (!cardEl.getAttribute("aria-label")) {
            var nm = cardEl.querySelector(".ev-name");
            cardEl.setAttribute("aria-label", "Event: " + (nm ? nm.textContent : "programme item") + ". Tap to flip.");
          }
          /* Tilt on pointermove */
          if (!NO_MOTION && "PointerEvent" in window) {
            var maxDeg = 8;
            on(cardEl, "pointermove", function (e) {
              if (cardEl.classList.contains("flipped")) return;
              var r = cardEl.getBoundingClientRect();
              var px = (e.clientX - r.left) / r.width - 0.5;
              var py = (e.clientY - r.top) / r.height - 0.5;
              var rx = (-py * maxDeg).toFixed(2);
              var ry = (px * maxDeg).toFixed(2);
              cardEl.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
            });
            on(cardEl, "pointerleave", function () {
              cardEl.style.transform = "";
            });
          }
        })(evCards[ci]);
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       GALLERY — swipeable polaroids
       ============================================================ */
    try {
      var stack = $(".gallery-stack");
      if (stack) {
        var pols = $$(".polaroid", stack);
        var current = 0;
        var total = pols.length;
        function layoutPols() {
          for (var i = 0; i < total; i++) {
            var off = i - current;
            var absOff = Math.abs(off);
            var rot = off === 0 ? -2 : (off % 2 === 0 ? -8 : 8) * Math.min(1, absOff);
            var tx = off * 18;
            var ty = absOff * 10;
            var sc = off === 0 ? 1 : Math.max(0.7, 1 - absOff * 0.06);
            pols[i].style.transform = "translate(-50%,-50%) translate(" + tx + "px," + ty + "px) rotate(" + rot + "deg) scale(" + sc + ")";
            pols[i].style.opacity = (absOff > 2) ? "0" : "1";
            pols[i].style.zIndex = String(total - absOff);
            pols[i].style.pointerEvents = off === 0 ? "auto" : "none";
          }
        }
        layoutPols();

        var startX = null, startT = 0, drag = false;
        function gStart(e) {
          if (e.touches && e.touches.length) {
            startX = e.touches[0].clientX; startT = Date.now(); drag = true;
          } else if (e.clientX != null) {
            startX = e.clientX; startT = Date.now(); drag = true;
          }
        }
        function gEnd(e) {
          if (!drag || startX == null) { drag = false; return; }
          var ex;
          if (e.changedTouches && e.changedTouches.length) ex = e.changedTouches[0].clientX;
          else if (e.clientX != null) ex = e.clientX;
          else { drag = false; return; }
          var dx = ex - startX;
          var dt = Date.now() - startT;
          drag = false; startX = null;
          if (Math.abs(dx) > 40 && dt < 900) {
            if (dx < 0) current = Math.min(total - 1, current + 1);
            else current = Math.max(0, current - 1);
            layoutPols();
          }
        }
        on(stack, "touchstart", gStart, { passive: true });
        on(stack, "touchend", gEnd);
        on(stack, "pointerdown", function (e) { if (!e.pointerType || e.pointerType !== "touch") gStart(e); });
        on(stack, "pointerup", function (e) { if (!e.pointerType || e.pointerType !== "touch") gEnd(e); });
        /* Keyboard */
        on(stack, "keydown", function (e) {
          if (e.key === "ArrowRight") { current = Math.min(total - 1, current + 1); layoutPols(); }
          else if (e.key === "ArrowLeft") { current = Math.max(0, current - 1); layoutPols(); }
        });
        if (!stack.getAttribute("tabindex")) stack.setAttribute("tabindex", "0");
        if (!stack.getAttribute("aria-label")) stack.setAttribute("aria-label", "Photo gallery. Use arrow keys to browse.");
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       VENUE — tabs
       ============================================================ */
    try {
      var venueRoot = document.getElementById("venue");
      if (venueRoot) {
        var tabs = $$(".tab", venueRoot);
        var panels = $$(".venue-panel", venueRoot);
        function showPanel(idx) {
          for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle("active", i === idx);
            tabs[i].setAttribute("aria-selected", i === idx ? "true" : "false");
          }
          for (var j = 0; j < panels.length; j++) {
            panels[j].style.display = (j === idx) ? "" : "none";
          }
        }
        for (var ti = 0; ti < tabs.length; ti++) {
          (function (i) {
            on(tabs[i], "click", function () { showPanel(i); });
          })(ti);
        }
        if (tabs.length) showPanel(0);
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       CALENDAR (.ics)
       ============================================================ */
    try {
      var calBtns = $$(".cal-btn");
      function pad2(n) { return n < 10 ? "0" + n : String(n); }
      function toUTCString(ms) {
        var d = new Date(ms);
        return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + "T" + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + "Z";
      }
      function safeIcs(s) {
        return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      }
      function buildIcs(ev) {
        var dateStr = (ev.date || "").trim();
        var timeStr = (ev.time || "12:00").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
        var t = timeStr.length === 5 ? timeStr : "12:00";
        var iso = dateStr + "T" + t + ":00+05:30";
        var start = new Date(iso);
        if (isNaN(start.getTime())) return null;
        var end = new Date(start.getTime() + 3 * 3600 * 1000);
        var uid = "nikah-" + dateStr.replace(/-/g, "") + "-" + t.replace(/:/g, "") + "-" + Math.random().toString(36).slice(2, 8) + "@nikah-card";
        var lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Nikah Card Builder//EN",
          "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT",
          "UID:" + uid,
          "DTSTAMP:" + toUTCString(Date.now()),
          "DTSTART:" + toUTCString(start.getTime()),
          "DTEND:" + toUTCString(end.getTime()),
          "SUMMARY:" + safeIcs(ev.name || "Nikah Event"),
          "LOCATION:" + safeIcs((ev.venue || "") + (ev.address ? ", " + ev.address : "")),
          "DESCRIPTION:" + safeIcs(ev.note || ""),
          "END:VEVENT",
          "END:VCALENDAR"
        ];
        return lines.join("\r\n");
      }
      for (var cbi = 0; cbi < calBtns.length; cbi++) {
        (function (btn, idx) {
          on(btn, "click", function () {
            try {
              var ev = (DATA.events && DATA.events[idx]) ? DATA.events[idx] : null;
              if (!ev) return;
              var ics = buildIcs(ev);
              if (!ics) return;
              var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = (ev.name || "event").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() + ".ics";
              document.body.appendChild(a);
              a.click();
              setTimeout(function () {
                try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {}
              }, 400);
            } catch (e) {}
          });
        })(calBtns[cbi], cbi);
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       RSVP — WhatsApp
       ============================================================ */
    try {
      var rsvpBtn = document.getElementById("rsvpBtn");
      if (rsvpBtn) {
        on(rsvpBtn, "click", function (e) {
          try {
            var num = (DATA.rsvp && DATA.rsvp.whatsapp) ? String(DATA.rsvp.whatsapp) : "";
            var digits = num.replace(/\D/g, "");
            var mainName = "the wedding";
            if (DATA.events) {
              for (var i = 0; i < DATA.events.length; i++) {
                if (DATA.events[i] && DATA.events[i].isMain) { mainName = DATA.events[i].name || mainName; break; }
              }
            }
            var guest = (card.guestName || "").trim();
            var msg = "Assalamu Alaikum, I will attend " + mainName + ".";
            if (guest) msg += " - " + guest;
            var href = "https://wa.me/" + digits + "?text=" + encodeURIComponent(msg);
            window.open(href, "_blank", "noopener");
          } catch (err) {}
          if (e && e.preventDefault) e.preventDefault();
        });
      }
    } catch (e) { /* ignore */ }

    /* ============================================================
       SHARE
       ============================================================ */
    try {
      var shareBtn = document.getElementById("shareBtn");
      if (shareBtn) {
        on(shareBtn, "click", function () {
          try {
            var title = document.title || "Wedding Invitation";
            var url = location.href;
            if (navigator.share) {
              navigator.share({ title: title, url: url }).catch(function () {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(function () {
                showShareMsg("Link copied");
              }).catch(function () { legacyCopy(url); });
            } else {
              legacyCopy(url);
            }
          } catch (e) {}
        });
        function legacyCopy(text) {
          try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            document.body.removeChild(ta);
            showShareMsg(ok ? "Link copied" : "Copy the link from the address bar");
          } catch (e) {
            showShareMsg("Copy the link from the address bar");
          }
        }
        function showShareMsg(msg) {
          try {
            var n = document.createElement("div");
            n.textContent = msg;
            n.style.cssText = "position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:rgba(42,15,30,.95);color:#F0D58A;padding:10px 18px;border-radius:999px;font-size:14px;z-index:50;border:1px solid #C9A24B;";
            document.body.appendChild(n);
            setTimeout(function () {
              try { n.style.transition = "opacity .4s ease"; n.style.opacity = "0"; } catch (e) {}
              setTimeout(function () { try { if (n.parentNode) n.parentNode.removeChild(n); } catch (e) {} }, 500);
            }, 1600);
          } catch (e) {}
        }
      }
    } catch (e) { /* ignore */ }
  };
})();
// END OF FILE card-scenes.js
