// card-scenes.js — Mehraab Corridor, Scratch, gold-light sweep, quiet reveals,
// programme parchment, tilt and flip, gallery, calendar .ics, RSVP, share.
// This function is injected into the exported standalone HTML via toString().
// It must be fully self-contained (no references to outer variables).
window.CARD_LOADED_SCENES = true;

window.cardRuntimeScenes = function (DATA) {
  "use strict";

  var card = window.__card || { opened: false, reduced: false, onOpen: function (cb) { try { cb(); } catch (e) {} } };
  var reduced = !!card.reduced;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }
  function attempt(fn) { try { fn(); } catch (e) {} }
  function clampi(v, a, b) { return v < a ? a : (v > b ? b : v); }

  // ==========================================================
  // MEHRAAB CORRIDOR — scroll-driven fly-through.
  // ==========================================================
  function setupCorridor() {
    var stage = document.getElementById("stage");
    var stageInner = document.getElementById("stageInner");
    if (!stage || !stageInner) return;

    var arches = $all(".arch", stageInner);
    if (!arches.length) return;

    var total = arches.length;

    // Fallback: stacked layout for reduced motion or very short screens.
    if (reduced || window.innerHeight < 480) {
      enableCorridorFallback(stage, stageInner, arches);
      return;
    }

    // Each arch gets a Z depth; closer arches are further from camera.
    var depths = [];
    for (var i = 0; i < total; i++) {
      // 0 = furthest, total-1 = closest (deepest negative Z).
      depths.push(-(total - 1 - i) * 320);
    }

    // Active content index (0..total-1). Each arch holds one content block.
    var currentActive = -1;

    // Scrolling progress driven by stage's position in viewport.
    function computeProgress() {
      var rect = stage.getBoundingClientRect();
      var vh = window.innerHeight;
      var scrollable = stage.offsetHeight - vh;
      if (scrollable <= 0) return 0;
      // We want progress 0 when stage top hits viewport top, 1 when stage bottom hits viewport bottom.
      var traveled = -rect.top;
      return clampi(traveled / scrollable, 0, 1);
    }

    var raf = 0;
    var lastProgress = -1;

    function update() {
      raf = 0;
      var p = computeProgress();
      if (Math.abs(p - lastProgress) < 0.001) return;
      lastProgress = p;

      // Camera zooms from Z=0 toward Z=2000 as progress grows.
      var camZ = p * (total * 320 + 300);

      // The active arch is the one nearest the camera front.
      var activeIdx = -1;
      var bestDist = Infinity;

      for (var i = 0; i < total; i++) {
        var z = depths[i] + camZ; // negative means in front of camera
        var dist = -z;
        var arch = arches[i];
        // Visibility: fade in near the front, blur/scale away once passed.
        var opacity = 0;
        var scale = 1;
        var blur = 0;
        var translateY = 0;
        if (dist > -400 && dist < 2600) {
          // Map dist: -400 → near (passed), 0 → perfect, 2600 → far away.
          if (dist < 0) {
            // Passed the camera: fade quickly.
            var t = clampi((dist + 400) / 400, 0, 1); // 0 at -400, 1 at 0
            opacity = t * 0.9;
            scale = 0.6 + 0.4 * t;
            blur = (1 - t) * 8;
            translateY = (1 - t) * -30;
          } else {
            // Ahead of the camera: fade in from far away.
            var u = clampi(dist / 2600, 0, 1); // 0 near, 1 far
            opacity = (1 - u) * 0.95;
            if (u > 0.85) opacity = (1 - u) / 0.15 * 0.6;
            scale = 1.15 - 0.15 * (1 - u);
            blur = u * 6;
            translateY = (1 - u) * 20;
          }
          if (opacity < 0) opacity = 0;
          if (opacity > 1) opacity = 1;
        }
        arch.style.opacity = opacity.toFixed(3);
        arch.style.transform = "translateZ(" + z.toFixed(1) + "px) translateY(" + translateY.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
        arch.style.filter = blur > 0.1 ? "blur(" + blur.toFixed(2) + "px)" : "none";

        // Track which arch is closest to the "sweet spot".
        if (dist > 100 && dist < 1500 && Math.abs(dist - 400) < bestDist) {
          bestDist = Math.abs(dist - 400);
          activeIdx = i;
        }
      }

      // Bloom on arch change.
      if (activeIdx !== -1 && activeIdx !== currentActive) {
        currentActive = activeIdx;
        bloomAt(activeIdx);
        // Add "passed" class to fully revealed arches (for ink-writing).
        for (var j = 0; j < total; j++) {
          if (j <= activeIdx) arches[j].classList.add("passed");
        }
      }
    }

    function bloomAt(idx) {
      if (idx < 0 || idx >= arches.length) return;
      if (reduced) return;
      var arch = arches[idx];
      var bloom = arch.querySelector(".arch-bloom");
      if (!bloom) {
        bloom = document.createElement("div");
        bloom.className = "arch-bloom";
        arch.appendChild(bloom);
      }
      bloom.style.animation = "none";
      void bloom.offsetWidth;
      bloom.style.animation = "archBloom 1400ms ease-out";
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    on(window, "scroll", onScroll, { passive: true });
    on(window, "resize", function () {
      lastProgress = -1;
      onScroll();
    });

    // Run once.
    update();
  }

  function enableCorridorFallback(stage, stageInner, arches) {
    // Replace the sticky corridor with a simple stacked view.
    stage.style.height = "auto";
    stageInner.style.position = "relative";
    stageInner.style.height = "auto";
    stageInner.style.perspective = "none";
    stageInner.style.overflow = "visible";
    // Give the arches a simple stacked layout.
    for (var i = 0; i < arches.length; i++) {
      var a = arches[i];
      a.style.position = "relative";
      a.style.top = "auto";
      a.style.left = "auto";
      a.style.margin = "28px auto";
      a.style.width = "min(90vw,520px)";
      a.style.height = "auto";
      a.style.minHeight = "360px";
      a.style.opacity = "1";
      a.style.transform = "none";
      a.style.filter = "none";
      a.classList.add("passed");
    }
    // Hide the stage height so page flows naturally.
    stage.style.background = "var(--plum)";
    stage.style.padding = "40px 0";
  }

  // ==========================================================
  // SCRATCH TO REVEAL
  // ==========================================================
  function setupScratch() {
    var wrap = document.getElementById("scratchWrap");
    var canvas = document.getElementById("scratchCanvas");
    var revealBtn = document.getElementById("revealBtn");
    var content = document.getElementById("scratchContent");
    if (!canvas || !content) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cssW = 0, cssH = 0;
    var drawing = false;
    var lastPt = null;
    var cleared = 0;
    var totalPixels = 0;
    var autoRevealed = false;
    var lastSparkle = 0;

    function sizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintFoil();
      totalPixels = cssW * cssH;
    }

    function paintFoil() {
      // Gold foil gradient.
      var grad = ctx.createLinearGradient(0, 0, cssW, cssH);
      grad.addColorStop(0, "#E8C86A");
      grad.addColorStop(0.25, "#F5DF9E");
      grad.addColorStop(0.5, "#C9A24B");
      grad.addColorStop(0.75, "#F0D58A");
      grad.addColorStop(1, "#B08A3A");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);

      // Fine glitter.
      ctx.save();
      for (var i = 0; i < 240; i++) {
        var x = Math.random() * cssW;
        var y = Math.random() * cssH;
        var r = Math.random() * 1.4 + 0.3;
        ctx.globalAlpha = Math.random() * 0.6 + 0.25;
        ctx.fillStyle = Math.random() < 0.5 ? "#FFF6D5" : "#8A6E32";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Soft diagonal sheen.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var sheen = ctx.createLinearGradient(0, 0, cssW, 0);
      sheen.addColorStop(0, "rgba(255,255,255,0)");
      sheen.addColorStop(0.5, "rgba(255,255,255,0.35)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();

      // Reset counter.
      cleared = 0;
      autoRevealed = false;
    }

    function getPoint(evt) {
      var rect = canvas.getBoundingClientRect();
      var x, y;
      if (evt.touches && evt.touches.length) {
        x = evt.touches[0].clientX - rect.left;
        y = evt.touches[0].clientY - rect.top;
      } else if (evt.changedTouches && evt.changedTouches.length) {
        x = evt.changedTouches[0].clientX - rect.left;
        y = evt.changedTouches[0].clientY - rect.top;
      } else {
        x = evt.clientX - rect.left;
        y = evt.clientY - rect.top;
      }
      return { x: x, y: y };
    }

    function eraseAt(x, y) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      var brush = 34;
      var grad = ctx.createRadialGradient(x, y, 0, x, y, brush);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.6, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, brush, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function eraseLine(a, b) {
      if (!a) { eraseAt(b.x, b.y); return; }
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.max(1, Math.floor(dist / 6));
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        eraseAt(a.x + dx * t, a.y + dy * t);
      }
    }

    function measureCleared() {
      // Sample pixels to estimate cleared fraction (cheap).
      var step = 12;
      var clearedSamples = 0;
      var totalSamples = 0;
      try {
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var d = img.data;
        var w = canvas.width;
        for (var y = 0; y < canvas.height; y += step * dpr) {
          for (var x = 0; x < w; x += step * dpr) {
            var idx = (y * w + x) * 4;
            totalSamples++;
            if (d[idx + 3] < 80) clearedSamples++;
          }
        }
      } catch (e) {
        return 0;
      }
      if (totalSamples === 0) return 0;
      return clearedSamples / totalSamples;
    }

    function sparkleAt(x, y) {
      if (reduced) return;
      var now = Date.now();
      if (now - lastSparkle < 60) return;
      lastSparkle = now;
      var s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = (canvas.offsetLeft + x) + "px";
      s.style.top = (canvas.offsetTop + y) + "px";
      s.style.transform = "translate(-50%,-50%)";
      s.style.transition = "transform 600ms ease, opacity 600ms ease";
      s.style.opacity = "1";
      canvas.parentNode.appendChild(s);
      requestAnimationFrame(function () {
        var tx = (Math.random() - 0.5) * 30;
        var ty = (Math.random() - 0.5) * 30;
        s.style.transform = "translate(calc(-50% + " + tx + "px), calc(-50% + " + ty + "px)) scale(0.3)";
        s.style.opacity = "0";
      });
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
    }

    function autoReveal() {
      if (autoRevealed) return;
      autoRevealed = true;
      // Erase everything gently.
      var start = Date.now();
      var duration = 900;
      function step() {
        var t = clampi((Date.now() - start) / duration, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 0.15 + t * 0.85;
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.restore();
        if (t < 1) requestAnimationFrame(step);
        else petalBurst();
      }
      step();
    }

    function petalBurst() {
      if (reduced) return;
      var rect = canvas.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      for (var i = 0; i < 22; i++) {
        (function (i) {
          var p = document.createElement("div");
          p.className = "petal-burst";
          p.style.position = "fixed";
          p.style.left = cx + "px";
          p.style.top = cy + "px";
          p.style.transform = "translate(-50%,-50%)";
          p.style.opacity = "1";
          p.style.transition = "transform 1400ms cubic-bezier(0.2,0.8,0.4,1), opacity 1400ms ease";
          document.body.appendChild(p);
          var angle = Math.random() * Math.PI * 2;
          var dist = 80 + Math.random() * 200;
          var tx = Math.cos(angle) * dist;
          var ty = Math.sin(angle) * dist + 80;
          requestAnimationFrame(function () {
            p.style.transform = "translate(calc(-50% + " + tx + "px), calc(-50% + " + ty + "px)) rotate(" + (Math.random() * 720) + "deg) scale(0.4)";
            p.style.opacity = "0";
          });
          setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1600);
        })(i);
      }
    }

    function checkProgress() {
      if (autoRevealed) return;
      var pct = measureCleared();
      if (pct >= 0.55) autoReveal();
    }

    function onDown(e) {
      e.preventDefault();
      drawing = true;
      lastPt = getPoint(e);
      eraseAt(lastPt.x, lastPt.y);
      sparkleAt(lastPt.x, lastPt.y);
    }
    function onMove(e) {
      if (!drawing) return;
      e.preventDefault();
      var pt = getPoint(e);
      eraseLine(lastPt, pt);
      sparkleAt(pt.x, pt.y);
      lastPt = pt;
    }
    function onUp(e) {
      if (!drawing) return;
      drawing = false;
      lastPt = null;
      checkProgress();
    }

    on(canvas, "mousedown", onDown);
    on(canvas, "mousemove", onMove);
    on(window, "mouseup", onUp);
    on(canvas, "touchstart", onDown, { passive: false });
    on(canvas, "touchmove", onMove, { passive: false });
    on(canvas, "touchend", onUp);
    on(canvas, "touchcancel", onUp);
    // Keyboard reveal.
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("role", "button");
    canvas.setAttribute("aria-label", "Scratch to reveal the invitation. Press Enter to reveal instantly.");
    on(canvas, "keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        autoReveal();
      }
    });

    if (revealBtn) {
      on(revealBtn, "click", autoReveal);
    }

    // Size once; resize handler re-paints (fresh foil).
    sizeCanvas();
    var sizeTimer = 0;
    on(window, "resize", function () {
      if (sizeTimer) clearTimeout(sizeTimer);
      sizeTimer = setTimeout(function () {
        sizeTimer = 0;
        sizeCanvas();
      }, 200);
    });
  }

  // ==========================================================
  // GOLD-LIGHT SWEEP between deep plum → ivory sections.
  // ==========================================================
  function setupSweeps() {
    if (reduced) return;
    // Find pairs: any plum-ish section followed by an ivory section.
    var sections = $all("section");
    for (var i = 0; i < sections.length - 1; i++) {
      var a = sections[i];
      var b = sections[i + 1];
      var aIsDark = a.classList.contains("plum-section") ||
                    a.id === "scratchWrap" || a.id === "finale" ||
                    a.id === "stage" || a.id === "dua";
      var bIsLight = b.classList.contains("ivory-section") ||
                     b.id === "programme" || b.id === "countdown" ||
                     b.id === "venue" || b.id === "story" ||
                     b.id === "gallery" || b.id === "rsvp";
      if (aIsDark && bIsLight) {
        injectSweep(b);
      }
    }
  }

  function injectSweep(section) {
    if (section.querySelector(".sweep")) return;
    var sweep = document.createElement("div");
    sweep.className = "sweep";
    sweep.setAttribute("aria-hidden", "true");
    section.insertBefore(sweep, section.firstChild);
    var played = false;
    function play() {
      if (played) return;
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      if (rect.top < vh * 0.85 && rect.bottom > vh * 0.15) {
        played = true;
        var before = sweep.querySelector("::before");
        // Re-trigger animation by replacing the element content.
        sweep.innerHTML = "";
        void sweep.offsetWidth;
        sweep.style.opacity = "1";
        setTimeout(function () {
          if (sweep && sweep.parentNode) sweep.parentNode.removeChild(sweep);
        }, 3000);
        // The CSS animation runs automatically via .sweep::before.
        // We need to force it: temporarily disable and re-enable.
        var style = sweep.style;
        style.setProperty("--sweep-trigger", "1");
      }
    }
    on(window, "scroll", play, { passive: true });
    on(window, "resize", play);
    // Fallback: play when visible via IntersectionObserver.
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            play();
            io.disconnect();
            break;
          }
        }
      }, { threshold: 0.15 });
      io.observe(section);
    } else {
      play();
    }
  }

  // ==========================================================
  // QUIET REVEALS — one rise-in for all .reveal elements.
  // ==========================================================
  function setupReveals() {
    var els = $all(".reveal");
    if (!els.length) return;
    if (reduced) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("in");
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      for (var j = 0; j < els.length; j++) els[j].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var e = entries[k];
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    for (var m = 0; m < els.length; m++) io.observe(els[m]);
  }

  // ==========================================================
  // PROGRAMME — gold line draws down the timeline.
  // ==========================================================
  function setupProgramme() {
    var prog = document.getElementById("programme");
    if (!prog) return;
    var timeline = prog.querySelector(".timeline");
    if (!timeline) return;
    if (reduced) {
      timeline.classList.add("drawn");
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      timeline.classList.add("drawn");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          timeline.classList.add("drawn");
          io.disconnect();
          break;
        }
      }
    }, { threshold: 0.2 });
    io.observe(timeline);
  }

  // ==========================================================
  // EVENT CARDS — 3D tilt + tap-to-flip.
  // ==========================================================
  function setupEventCards() {
    var cards = $all(".ev-card");
    for (var i = 0; i < cards.length; i++) {
      (function (cardEl) {
        var inner = cardEl.querySelector(".ev-inner");
        if (!inner) return;

        // Flip on click / tap / keyboard.
        var front = cardEl.querySelector(".front");
        var back = cardEl.querySelector(".back");
        var focusTarget = front || inner;
        focusTarget.setAttribute("tabindex", "0");
        focusTarget.setAttribute("role", "button");
        focusTarget.setAttribute("aria-label", "Flip event card for details");
        function flip() {
          cardEl.classList.toggle("flipped");
          var isFlipped = cardEl.classList.contains("flipped");
          focusTarget.setAttribute("aria-pressed", isFlipped ? "true" : "false");
        }
        on(focusTarget, "click", flip);
        on(focusTarget, "keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            flip();
          }
        });

        // 3D tilt on pointer move (desktop only, no touch).
        if (reduced) return;
        var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
        if (isTouch) return;

        on(cardEl, "mousemove", function (e) {
          if (cardEl.classList.contains("flipped")) return;
          var rect = cardEl.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) / (rect.width / 2);
          var dy = (e.clientY - cy) / (rect.height / 2);
          var rx = clampi(-dy * 8, -8, 8);
          var ry = clampi(dx * 8, -8, 8);
          cardEl.classList.add("tilt");
          inner.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        });
        on(cardEl, "mouseleave", function () {
          cardEl.classList.remove("tilt");
          inner.style.transform = "";
        });
      })(cards[i]);
    }
  }

  // ==========================================================
  // GALLERY — swipeable stacked polaroids.
  // ==========================================================
  function setupGallery() {
    var gallery = document.getElementById("gallery");
    if (!gallery) return;
    var polaroids = $all(".polaroid", gallery);
    if (polaroids.length < 2) return;
    var dots = $all(".gallery-dot", gallery);
    var stack = gallery.querySelector(".gallery-stack");
    if (!stack) return;

    var index = 0;
    var startX = 0;
    var startY = 0;
    var dragging = false;
    var moved = false;

    function applyClasses() {
      var n = polaroids.length;
      for (var i = 0; i < n; i++) {
        var p = polaroids[i];
        p.className = "polaroid";
        var rel = (i - index + n) % n;
        if (rel > 4) rel = -1; // hidden
        if (rel >= 0 && rel <= 4) {
          p.classList.add("p" + rel);
          p.style.opacity = rel === 0 ? "1" : "0.9";
          p.style.pointerEvents = rel === 0 ? "auto" : "none";
        } else {
          p.style.opacity = "0";
          p.style.pointerEvents = "none";
        }
      }
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle("on", d === index);
      }
    }

    function next() {
      index = (index + 1) % polaroids.length;
      applyClasses();
    }
    function prev() {
      index = (index - 1 + polaroids.length) % polaroids.length;
      applyClasses();
    }

    function onDown(e) {
      if (e.touches && e.touches.length > 1) return;
      dragging = true;
      moved = false;
      var t = e.touches ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
    }
    function onMove(e) {
      if (!dragging) return;
      var t = e.touches ? e.touches[0] : e;
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) moved = true;
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      var t = (e.changedTouches && e.changedTouches[0]) || e;
      var dx = t.clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next(); else prev();
      } else if (!moved) {
        next();
      }
    }

    on(stack, "touchstart", onDown, { passive: true });
    on(stack, "touchmove", onMove, { passive: true });
    on(stack, "touchend", onUp);
    on(stack, "mousedown", onDown);
    on(window, "mousemove", onMove);
    on(window, "mouseup", onUp);

    // Keyboard.
    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "region");
    stack.setAttribute("aria-label", "Photo gallery. Use left and right arrow keys.");
    on(stack, "keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });

    applyClasses();
  }

  // ==========================================================
  // CALENDAR .ICS + RSVP
  // ==========================================================
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function formatICSDate(d) {
    return d.getUTCFullYear() +
      pad2(d.getUTCMonth() + 1) +
      pad2(d.getUTCDate()) + "T" +
      pad2(d.getUTCHours()) +
      pad2(d.getUTCMinutes()) +
      pad2(d.getUTCSeconds()) + "Z";
  }

  function eventUTC(ev) {
    if (!ev || !ev.date) return null;
    var parts = String(ev.date).split("-");
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    var t = (ev.time || "18:00").split(":");
    var hh = parseInt(t[0], 10) || 0;
    var mm = parseInt(t[1], 10) || 0;
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    // Event is in IST: subtract 5.5 hours to get UTC.
    return new Date(Date.UTC(y, m - 1, d, hh, mm) - 5.5 * 60 * 60 * 1000);
  }

  function buildICS(ev) {
    var start = eventUTC(ev);
    if (!start) return "";
    var end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    var uid = "nikah-" + (ev.name || "event").replace(/[^A-Za-z0-9]/g, "") + "-" + start.getTime() + "@nikah";
    var summary = (ev.name || "Nikah Event") + " — " + (DATA.person1 && DATA.person1.name ? DATA.person1.name : "") + " & " + (DATA.person2 && DATA.person2.name ? DATA.person2.name : "");
    summary = summary.replace(/&amp;/g, "&");
    var location = (ev.venue || "") + (ev.address ? " — " + ev.address : "");
    var desc = (ev.note || "") + (ev.dress ? " Dress code: " + ev.dress : "");
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nikah Card Builder//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + formatICSDate(new Date()),
      "DTSTART:" + formatICSDate(start),
      "DTEND:" + formatICSDate(end),
      "SUMMARY:" + escapeICS(summary),
      "LOCATION:" + escapeICS(location),
      "DESCRIPTION:" + escapeICS(desc),
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    return lines.join("\r\n");
  }

  function escapeICS(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function downloadICS(ev) {
    var ics = buildICS(ev);
    if (!ics) return;
    try {
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = ((ev.name || "event").replace(/[^A-Za-z0-9]/g, "-")) + ".ics";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 400);
    } catch (e) {}
  }

  function setupCalendarButtons() {
    var btns = $all(".cal-btn");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var name = btn.getAttribute("data-ev") || "";
        var ev = null;
        if (DATA && DATA.events) {
          for (var j = 0; j < DATA.events.length; j++) {
            if (DATA.events[j].name === name) { ev = DATA.events[j]; break; }
          }
        }
        if (!ev) return;
        on(btn, "click", function () { downloadICS(ev); });
      })(btns[i]);
    }
  }

  function setupRSVP() {
    var wa = document.getElementById("rsvpBtn");
    if (!wa) return;
    var number = DATA && DATA.rsvp && DATA.rsvp.whatsapp ? String(DATA.rsvp.whatsapp).replace(/[^0-9]/g, "") : "";
    if (!number) { wa.style.display = "none"; return; }
    var guest = "";
    attempt(function () {
      var params = new URLSearchParams(window.location.search);
      guest = params.get("guest") || "";
    });
    var msg = "Assalamu Alaikum! ";
    if (guest) msg += guest + " here. ";
    msg += "I would love to attend the Nikah of " +
      (DATA.person1 && DATA.person1.name ? DATA.person1.name : "") + " & " +
      (DATA.person2 && DATA.person2.name ? DATA.person2.name : "") +
      ". Insha'Allah I will be there.";
    var href = "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
    wa.setAttribute("href", href);
    wa.setAttribute("target", "_blank");
    wa.setAttribute("rel", "noopener");
  }

  // ==========================================================
  // SHARE
  // ==========================================================
  function setupShare() {
    var btn = document.getElementById("shareBtn");
    if (!btn) return;
    on(btn, "click", function () {
      var url = window.location.href;
      var title = "Nikah Invitation — " +
        (DATA.person1 && DATA.person1.name ? DATA.person1.name : "") + " & " +
        (DATA.person2 && DATA.person2.name ? DATA.person2.name : "");
      if (navigator.share) {
        attempt(function () {
          navigator.share({ title: title, text: "You are invited to our Nikah.", url: url }).catch(function () {});
        });
        return;
      }
      // Fallback: copy link.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          btn.textContent = "Link copied";
          setTimeout(function () { btn.textContent = "Share"; }, 1800);
        }).catch(function () { legacyCopy(url, btn); });
      } else {
        legacyCopy(url, btn);
      }
    });
  }

  function legacyCopy(text, btn) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      btn.textContent = "Link copied";
      setTimeout(function () { btn.textContent = "Share"; }, 1800);
    } catch (e) {}
  }

  // ==========================================================
  // VENUE TABS
  // ==========================================================
  function setupVenueTabs() {
    var tabs = $all(".venue-tab");
    if (tabs.length < 2) return;
    var cards = $all(".venue-card");
    for (var i = 0; i < tabs.length; i++) {
      (function (tab, i) {
        on(tab, "click", function () {
          for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
          tab.classList.add("active");
          for (var k = 0; k < cards.length; k++) {
            cards[k].style.display = (k === i) ? "" : "none";
          }
        });
      })(tabs[i], i);
    }
  }

  // ==========================================================
  // BOOT — run everything once the card is opened.
  // ==========================================================
  function run() {
    attempt(setupCorridor);
    attempt(setupScratch);
    attempt(setupSweeps);
    attempt(setupProgramme);
    attempt(setupEventCards);
    attempt(setupGallery);
    attempt(setupVenueTabs);
    attempt(setupCalendarButtons);
    attempt(setupRSVP);
    attempt(setupShare);
    attempt(setupReveals);
  }

  // Wait for opening; then run.
  card.onOpen(function () {
    // Small delay so the Arrival crossfade isn't fighting the reveal.
    setTimeout(run, 120);
  });

  // Safety: if the card opens very late (or not at all due to no arrival scene),
  // still run after 3s so content is never hidden.
  setTimeout(function () {
    if (!window.__scenesRan) {
      window.__scenesRan = true;
      run();
    }
  }, 3200);
};

// END OF FILE card-scenes.js
