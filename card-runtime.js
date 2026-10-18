window.CARD_LOADED_RUNTIME = true;
window.cardRuntime = function (DATA) {
  'use strict';

  /* ==========================================================================
     TINY HELPERS
     ========================================================================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var on = function (el, evt, fn) { if (el) el.addEventListener(evt, fn); };
  var pad2 = function (n) { return String(n).length < 2 ? '0' + n : String(n); };
  var slug = function (s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  };
  var escapeICS = function (s) {
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };
  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { prefersReduced = false; }

  /* ==========================================================================
     GUEST NAME (?guest=Name)
     ========================================================================== */
  try {
    var query = new URLSearchParams(window.location.search);
    var guestName = query.get('guest');
    if (guestName) {
      var guestLine = $('.guest-line');
      if (guestLine) {
        guestLine.textContent = 'Dear ' + guestName + ',';
        guestLine.hidden = false;
      }
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     MUSIC PLAYER + MUTE BUTTON
     ========================================================================== */
  var audio = null;
  var muteBtn = null;
  var musicUrl = '';
  if (typeof DATA.music === 'string' && DATA.music) musicUrl = DATA.music;
  else if (DATA.music && typeof DATA.music.dataUrl === 'string') musicUrl = DATA.music.dataUrl;

  if (musicUrl) {
    try {
      audio = new Audio();
      audio.src = musicUrl;
      audio.loop = true;
      audio.preload = 'auto';

      muteBtn = document.createElement('button');
      muteBtn.type = 'button';
      muteBtn.className = 'mute-btn';
      muteBtn.setAttribute('aria-label', 'Toggle music');
      muteBtn.textContent = '\u266A';
      document.body.appendChild(muteBtn);

      var refreshMute = function () {
        if (!audio || !muteBtn) return;
        if (audio.paused) {
          muteBtn.textContent = '\u266A';
          muteBtn.style.opacity = '0.55';
          muteBtn.setAttribute('aria-label', 'Play music');
        } else {
          muteBtn.textContent = '\u266B';
          muteBtn.style.opacity = '1';
          muteBtn.setAttribute('aria-label', 'Mute music');
        }
      };

      on(audio, 'play', refreshMute);
      on(audio, 'pause', refreshMute);

      on(muteBtn, 'click', function () {
        if (!audio) return;
        if (audio.paused) {
          var p = audio.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } else {
          audio.pause();
        }
      });

      refreshMute();
    } catch (e) {
      audio = null;
      muteBtn = null;
    }
  }

  /* ==========================================================================
     INK-WRITING NAMES
     card.js renders <span class="name" data-name="...">Text</span>.
     This splits each into per-letter spans once, triggering the CSS animation.
     ========================================================================== */
  var prepareName = function (el) {
    if (!el) return;
    if (el.getAttribute('data-written') === 'true') return;
    el.setAttribute('data-written', 'true');

    var text = el.getAttribute('data-name');
    if (text === null) text = el.textContent || '';
    el.textContent = '';

    var i;
    for (i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var span = document.createElement('span');
      span.className = 'ink-letter';
      span.style.setProperty('--i', String(i));
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
    }
  };

  var writeNamesIn = function (root) {
    var names = $$('.name[data-name]', root || document);
    names.forEach(prepareName);
  };

  /* ==========================================================================
     OPENING SCENE — wax seal, crack fragments, sparkle burst
     ========================================================================== */
  var opening = $('.opening');
  var cardMain = $('.card-main');
  var seal = $('.seal');
  var opened = false;

  // Ambient petals inside the opening scene
  try {
    var petalsHost = $('.opening-petals');
    if (petalsHost) {
      var p;
      for (p = 0; p < 12; p++) {
        var petal = document.createElement('span');
        petal.className = 'op-petal';
        petal.style.left = (5 + Math.random() * 90).toFixed(2) + '%';
        petal.style.top = '-30px';
        var dur = (7 + Math.random() * 6).toFixed(2);
        var del = (Math.random() * 6).toFixed(2);
        petal.style.animationDuration = dur + 's';
        petal.style.animationDelay = del + 's';
        petal.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
        petalsHost.appendChild(petal);
      }
    }
  } catch (e) { /* ignore */ }

  // Crack fragments flying out from the seal centre
  var spawnCrackFragments = function () {
    if (!seal) return;
    var rect;
    try { rect = seal.getBoundingClientRect(); } catch (e) { return; }
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var i;
    for (i = 0; i < 14; i++) {
      var angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      var dist = 60 + Math.random() * 90;
      var frag = document.createElement('div');
      frag.className = 'seal-crack';
      frag.style.position = 'fixed';
      frag.style.left = cx + 'px';
      frag.style.top = cy + 'px';
      frag.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      frag.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      frag.style.setProperty('--rot', String(Math.round(Math.random() * 720 - 360)) + 'deg');
      frag.style.width = (4 + Math.random() * 6).toFixed(1) + 'px';
      frag.style.height = (8 + Math.random() * 8).toFixed(1) + 'px';
      document.body.appendChild(frag);
      (function (node) {
        setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 1100);
      })(frag);
    }
  };

  // Gold sparkle burst
  var spawnSparkles = function () {
    if (!seal) return;
    var rect;
    try { rect = seal.getBoundingClientRect(); } catch (e) { return; }
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var i;
    for (i = 0; i < 20; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 80;
      var sp = document.createElement('span');
      sp.className = 'sparkle';
      sp.style.position = 'fixed';
      sp.style.left = cx + 'px';
      sp.style.top = cy + 'px';
      sp.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      sp.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      document.body.appendChild(sp);
      (function (node) {
        setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 1000);
      })(sp);
    }
  };

  var openCard = function () {
    if (opened) return;
    opened = true;

    // start music on the user gesture
    if (audio) {
      try {
        var playP = audio.play();
        if (playP && typeof playP.catch === 'function') playP.catch(function () {});
      } catch (e) { /* ignore */ }
    }

    if (opening) {
      spawnCrackFragments();
      spawnSparkles();
      opening.classList.add('is-opening');

      setTimeout(function () {
        opening.classList.add('is-open');
        if (cardMain) cardMain.classList.add('is-ready');
        // reveal hero names once the card becomes visible
        setTimeout(function () {
          writeNamesIn($('.hero'));
        }, 350);
        setTimeout(function () {
          if (opening.parentNode) opening.parentNode.removeChild(opening);
        }, 1100);
      }, 950);
    } else if (cardMain) {
      cardMain.classList.add('is-ready');
      writeNamesIn($('.hero'));
    }
  };

  on(seal, 'click', openCard);
  // If there is no seal at all (broken markup) just reveal the card.
  if (!seal) {
    setTimeout(function () {
      if (cardMain) cardMain.classList.add('is-ready');
      writeNamesIn($('.hero'));
    }, 300);
  }

  /* ==========================================================================
     SCROLL-REVEAL FOR NORMAL SECTIONS
     ========================================================================== */
  try {
    var reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { revealIO.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }
  } catch (e) {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ==========================================================================
     HERO PETALS CANVAS (rose petals + gold dust, max 40)
     ========================================================================== */
  try {
    var hero = $('.hero');
    if (hero && !prefersReduced) {
      var pc = document.createElement('canvas');
      pc.className = 'petals-canvas';
      pc.setAttribute('aria-hidden', 'true');
      hero.appendChild(pc);
      var pctx = pc.getContext('2d');
      var pw = 0;
      var ph = 0;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      var resizePc = function () {
        var r = hero.getBoundingClientRect();
        pw = r.width;
        ph = r.height;
        if (!pw || !ph) return;
        pc.width = Math.floor(pw * dpr);
        pc.height = Math.floor(ph * dpr);
        pc.style.width = pw + 'px';
        pc.style.height = ph + 'px';
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizePc();
      on(window, 'resize', resizePc);

      var MAX_P = 40;
      var petalColors = [
        { c: 'rgba(217, 159, 166, 0.9)', s: 5 },   // dusty rose
        { c: 'rgba(232, 184, 191, 0.85)', s: 4 },  // blush
        { c: 'rgba(201, 169, 97, 0.85)', s: 1.5 }, // gold
        { c: 'rgba(240, 217, 140, 0.9)', s: 1.2 }, // gold dust
        { c: 'rgba(255, 250, 240, 0.9)', s: 4 }    // jasmine petal
      ];

      var newParticle = function (initial) {
        var col = petalColors[Math.floor(Math.random() * petalColors.length)];
        var isDust = col.s <= 2;
        return {
          x: Math.random() * pw,
          y: initial ? Math.random() * ph : -12 - Math.random() * 40,
          vx: (Math.random() - 0.5) * (isDust ? 0.6 : 0.35),
          vy: (isDust ? 0.25 : 0.45) + Math.random() * 0.55,
          size: col.s + Math.random() * (isDust ? 0.6 : 1.6),
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.035,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.014,
          color: col.c,
          isDust: isDust
        };
      };

      var particles = [];
      var pp;
      for (pp = 0; pp < MAX_P; pp++) particles.push(newParticle(true));

      var rafId = null;
      var pcRunning = false;

      var drawParticle = function (p) {
        pctx.save();
        pctx.translate(p.x, p.y);
        pctx.rotate(p.rot);
        pctx.fillStyle = p.color;
        if (p.isDust) {
          pctx.beginPath();
          pctx.arc(0, 0, p.size, 0, Math.PI * 2);
          pctx.fill();
        } else {
          pctx.beginPath();
          pctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
          pctx.fill();
        }
        pctx.restore();
      };

      var petalLoop = function () {
        if (!pcRunning) return;
        pctx.clearRect(0, 0, pw, ph);
        var j;
        for (j = 0; j < particles.length; j++) {
          var p = particles[j];
          p.sway += p.swaySpeed;
          p.x += p.vx + Math.sin(p.sway) * 0.24;
          p.y += p.vy;
          p.rot += p.vrot;
          if (p.y > ph + 22 || p.x < -22 || p.x > pw + 22) {
            particles[j] = newParticle(false);
          }
          drawParticle(particles[j]);
        }
        rafId = window.requestAnimationFrame(petalLoop);
      };

      var startPetals = function () {
        if (pcRunning) return;
        pcRunning = true;
        rafId = window.requestAnimationFrame(petalLoop);
      };
      var stopPetals = function () {
        pcRunning = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
      };

      startPetals();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopPetals();
        else startPetals();
      });
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     MEHRAAB CORRIDOR (signature pinned scroll)
     ========================================================================== */
  var corridor = $('.corridor');
  var corridorFallback = prefersReduced || window.innerHeight < 500;

  if (corridor) {
    var arches = $$('.arch-layer', corridor);
    var archCount = arches.length;

    if (corridorFallback) {
      // Static stacked layout
      corridor.classList.add('is-fallback');
      var fbStyle = document.createElement('style');
      fbStyle.textContent =
        '.corridor.is-fallback { height: auto !important; padding: 60px 20px 40px !important; }' +
        '.corridor.is-fallback .corridor-sticky { position: static !important; height: auto !important; perspective: none !important; }' +
        '.corridor.is-fallback .arch-layer { position: relative !important; top: auto !important; left: auto !important; margin: 0 auto 30px !important; transform: none !important; opacity: 1 !important; filter: none !important; }' +
        '.corridor.is-fallback .arch-content { opacity: 1 !important; transform: none !important; }';
      document.head.appendChild(fbStyle);
      // trigger ink-writing names once they enter the viewport
      arches.forEach(function (a) {
        try {
          var nameEls = $$('.arch-names .name[data-name]', a);
          nameEls.forEach(prepareName);
        } catch (e2) { /* ignore */ }
      });
    } else if (archCount > 1) {
      var SPACING = 380;
      var sticky = $('.corridor-sticky', corridor);
      var bloom = null;
      if (sticky) {
        bloom = document.createElement('div');
        bloom.className = 'arch-bloom is-lit';
        bloom.setAttribute('aria-hidden', 'true');
        sticky.insertBefore(bloom, sticky.firstChild);
      }

      var writeArches = function () {
        if (!corridor) return;
        var totalScroll = corridor.offsetHeight - window.innerHeight;
        if (totalScroll <= 0) return;
        var rect = corridor.getBoundingClientRect();
        var scrolled = clamp(-rect.top, 0, totalScroll);
        var progress = totalScroll > 0 ? scrolled / totalScroll : 0;

        for (var i = 0; i < archCount; i++) {
          var baseZ = (i * -1 + progress * (archCount - 1)) * SPACING;
          // baseZ: 0 for arch i at progress = i/(N-1); negative = ahead
          var opacity;
          if (baseZ > 0) {
            opacity = clamp(1 - baseZ / 500, 0, 1);
          } else {
            opacity = clamp(1 - Math.abs(baseZ) / (SPACING * (archCount - 1)), 0, 1);
          }
          var blur = Math.min(Math.abs(baseZ) / (SPACING * 0.8), 6);

          arches[i].style.transform = 'translate3d(0, 0, ' + baseZ.toFixed(1) + 'px)';
          arches[i].style.opacity = opacity.toFixed(3);
          arches[i].style.filter = blur > 0.15 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';

          var dist = Math.abs(baseZ);
          if (dist < SPACING * 0.35) {
            if (!arches[i].classList.contains('is-active')) {
              arches[i].classList.add('is-active');
              // Trigger ink-writing names when this arch becomes active
              writeNamesIn(arches[i]);
            }
          } else {
            if (arches[i].classList.contains('is-active')) {
              arches[i].classList.remove('is-active');
            }
          }
        }
      };

      var corridorRaf = null;
      var scheduleCorridor = function () {
        if (corridorRaf) return;
        corridorRaf = window.requestAnimationFrame(function () {
          corridorRaf = null;
          writeArches();
        });
      };

      on(window, 'scroll', scheduleCorridor, { passive: true });
      on(window, 'resize', scheduleCorridor);
      // kick once
      setTimeout(writeArches, 100);
    }
  }

  /* ==========================================================================
     SCRATCH TO REVEAL
     ========================================================================== */
  try {
    var stage = $('.scratch-stage');
    var canvas = $('.scratch-canvas');
    var revealBtn = $('.scratch-reveal-btn');

    if (stage) {
      if (prefersReduced) {
        stage.classList.add('is-revealed');
        if (canvas) canvas.style.display = 'none';
      } else if (canvas) {
        var sctx = canvas.getContext('2d', { willReadFrequently: true });
        var sw = 0;
        var sh = 0;
        var sdpr = Math.min(window.devicePixelRatio || 1, 2);
        var brushed = false;
        var revealed = false;
        var lastCheck = 0;

        var drawFoil = function () {
          var rect = stage.getBoundingClientRect();
          sw = rect.width;
          sh = rect.height;
          if (!sw || !sh) return;
          canvas.width = Math.floor(sw * sdpr);
          canvas.height = Math.floor(sh * sdpr);
          canvas.style.width = sw + 'px';
          canvas.style.height = sh + 'px';
          sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);

          var grad = sctx.createLinearGradient(0, 0, sw, sh);
          grad.addColorStop(0, '#e8d5a4');
          grad.addColorStop(0.4, '#f0dfa3');
          grad.addColorStop(0.7, '#d4b473');
          grad.addColorStop(1, '#b89248');
          sctx.globalCompositeOperation = 'source-over';
          sctx.fillStyle = grad;
          sctx.fillRect(0, 0, sw, sh);

          // fine glitter texture
          var k;
          for (k = 0; k < 800; k++) {
            sctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.55).toFixed(2) + ')';
            var gx = Math.random() * sw;
            var gy = Math.random() * sh;
            sctx.fillRect(gx, gy, 1, 1);
          }
          for (k = 0; k < 40; k++) {
            sctx.fillStyle = 'rgba(120, 80, 40, ' + (Math.random() * 0.18 + 0.06).toFixed(2) + ')';
            sctx.fillRect(Math.random() * sw, Math.random() * sh, 2, 2);
          }
        };
        drawFoil();
        on(window, 'resize', drawFoil);

        var spawnScratchSparkle = function (x, y) {
          var rect = stage.getBoundingClientRect();
          var sp = document.createElement('span');
          sp.style.position = 'fixed';
          sp.style.left = (rect.left + x) + 'px';
          sp.style.top = (rect.top + y) + 'px';
          sp.style.width = '4px';
          sp.style.height = '4px';
          sp.style.borderRadius = '50%';
          sp.style.background = '#f0dfa3';
          sp.style.boxShadow = '0 0 8px 2px rgba(240, 223, 163, 0.85)';
          sp.style.pointerEvents = 'none';
          sp.style.zIndex = '99';
          sp.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
          sp.style.transform = 'translate(-50%, -50%) scale(1)';
          sp.style.opacity = '1';
          document.body.appendChild(sp);
          window.requestAnimationFrame(function () {
            sp.style.transform = 'translate(-50%, -50%) scale(0.2) translateY(-30px)';
            sp.style.opacity = '0';
          });
          setTimeout(function () {
            if (sp.parentNode) sp.parentNode.removeChild(sp);
          }, 700);
        };

        var scratchAt = function (x, y) {
          sctx.globalCompositeOperation = 'destination-out';
          var radius = 28;
          var g = sctx.createRadialGradient(x, y, 0, x, y, radius);
          g.addColorStop(0, 'rgba(0,0,0,1)');
          g.addColorStop(0.6, 'rgba(0,0,0,0.9)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          sctx.fillStyle = g;
          sctx.beginPath();
          sctx.arc(x, y, radius, 0, Math.PI * 2);
          sctx.fill();
          spawnScratchSparkle(x, y);
        };

        var checkProgress = function () {
          var now = Date.now();
          if (now - lastCheck < 220) return;
          lastCheck = now;
          try {
            var data = sctx.getImageData(0, 0, canvas.width, canvas.height).data;
            var total = 0;
            var cleared = 0;
            var i;
            for (i = 3; i < data.length; i += 160) {
              total++;
              if (data[i] < 128) cleared++;
            }
            if (total && cleared / total >= 0.55) autoReveal();
          } catch (err) { /* ignore */ }
        };

        var autoReveal = function () {
          if (revealed) return;
          revealed = true;
          stage.classList.add('is-revealed');
          // small petal burst
          var rrect = stage.getBoundingClientRect();
          var cx = rrect.left + rrect.width / 2;
          var cy = rrect.top + rrect.height / 2;
          var k;
          for (k = 0; k < 14; k++) {
            (function (k) {
              setTimeout(function () {
                var sp = document.createElement('span');
                sp.style.position = 'fixed';
                sp.style.left = cx + 'px';
                sp.style.top = cy + 'px';
                sp.style.width = '8px';
                sp.style.height = '6px';
                sp.style.borderRadius = '60% 40% 55% 45%';
                sp.style.background = k % 3 === 0 ? '#f0dfa3' : (k % 3 === 1 ? '#e8b8bf' : '#fffaf0');
                sp.style.boxShadow = '0 2px 6px rgba(120, 70, 60, 0.15)';
                sp.style.pointerEvents = 'none';
                sp.style.zIndex = '99';
                var ang = Math.random() * Math.PI * 2;
                var dist = 60 + Math.random() * 120;
                sp.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.7, 0.3, 1), opacity 0.9s ease';
                sp.style.transform = 'translate(-50%, -50%) scale(1)';
                document.body.appendChild(sp);
                window.requestAnimationFrame(function () {
                  sp.style.transform =
                    'translate(calc(-50% + ' + (Math.cos(ang) * dist).toFixed(1) + 'px),' +
                    'calc(-50% + ' + (Math.sin(ang) * dist + 100).toFixed(1) + 'px)) ' +
                    'rotate(' + Math.round(Math.random() * 540 - 270) + 'deg) scale(0.4)';
                  sp.style.opacity = '0';
                });
                setTimeout(function () {
                  if (sp.parentNode) sp.parentNode.removeChild(sp);
                }, 1100);
              }, k * 30);
            })(k);
          }
        };

        var toLocal = function (clientX, clientY) {
          var rect = canvas.getBoundingClientRect();
          return { x: clientX - rect.left, y: clientY - rect.top };
        };

        var lastPos = null;
        var isScratching = false;

        var startScratch = function (e) {
          if (revealed) return;
          isScratching = true;
          if (canvas.setPointerCapture && e.pointerId !== undefined) {
            try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
          }
          var p = toLocal(e.clientX, e.clientY);
          lastPos = p;
          scratchAt(p.x, p.y);
          brushed = true;
        };

        var moveScratch = function (e) {
          if (!isScratching || revealed) return;
          var p = toLocal(e.clientX, e.clientY);
          if (lastPos) {
            var dx = p.x - lastPos.x;
            var dy = p.y - lastPos.y;
            var steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 10);
            if (steps < 1) steps = 1;
            var s;
            for (s = 1; s <= steps; s++) {
              scratchAt(lastPos.x + (dx * s) / steps, lastPos.y + (dy * s) / steps);
            }
          } else {
            scratchAt(p.x, p.y);
          }
          lastPos = p;
          checkProgress();
        };

        var endScratch = function () {
          isScratching = false;
          lastPos = null;
          if (brushed) {
            brushed = false;
            checkProgress();
          }
        };

        if (window.PointerEvent) {
          on(canvas, 'pointerdown', startScratch);
          on(canvas, 'pointermove', moveScratch);
          on(canvas, 'pointerup', endScratch);
          on(canvas, 'pointerleave', endScratch);
          on(canvas, 'pointercancel', endScratch);
        } else {
          on(canvas, 'mousedown', startScratch);
          on(canvas, 'mousemove', moveScratch);
          on(window, 'mouseup', endScratch);
          on(canvas, 'touchstart', function (e) {
            if (e.touches[0]) {
              var t = e.touches[0];
              startScratch({ clientX: t.clientX, clientY: t.clientY });
            }
          }, { passive: true });
          on(canvas, 'touchmove', function (e) {
            if (e.touches[0]) {
              var t = e.touches[0];
              moveScratch({ clientX: t.clientX, clientY: t.clientY });
            }
          }, { passive: true });
          on(canvas, 'touchend', endScratch);
        }

        // Accessibility: skip the game
        on(revealBtn, 'click', autoReveal);
      }
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     EVENT CARD FLIP + TILT
     ========================================================================== */
  try {
    var eventCards = $$('.event-card');
    eventCards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');

      var toggleFlip = function () {
        card.classList.toggle('is-flipped');
        var flipped = card.classList.contains('is-flipped');
        card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      };

      on(card, 'click', function (e) {
        if (e.target && e.target.closest && e.target.closest('a')) return;
        toggleFlip();
      });
      on(card, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      });

      if (!prefersReduced) {
        var inner = card.querySelector('.event-card-inner');
        on(card, 'pointermove', function (e) {
          if (card.classList.contains('is-flipped') || !inner) return;
          var r = card.getBoundingClientRect();
          if (!r.width || !r.height) return;
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          var rx = (-py * 8).toFixed(2);
          var ry = (px * 8).toFixed(2);
          inner.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        });
        on(card, 'pointerleave', function () {
          if (inner) inner.style.transform = '';
        });
      }
    });
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     PROGRAMME PARCHMENT — unroll on enter
     ========================================================================== */
  try {
    var parch = $('.parchment');
    if (parch) {
      if (prefersReduced) {
        parch.classList.add('is-open');
      } else if ('IntersectionObserver' in window) {
        var parchIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              parch.classList.add('is-open');
              parchIO.unobserve(parch);
            }
          });
        }, { threshold: 0.1 });
        parchIO.observe(parch);
      } else {
        parch.classList.add('is-open');
      }
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     COUNTDOWN (IST)
     ========================================================================== */
  try {
    var countdown = $('.countdown-section');
    if (countdown) {
      var events = Array.isArray(DATA.events) ? DATA.events : [];
      var mainEvent = null;
      var ei;
      for (ei = 0; ei < events.length; ei++) {
        if (events[ei] && events[ei].isMain) { mainEvent = events[ei]; break; }
      }
      if (!mainEvent && events.length) mainEvent = events[0];

      var targetMs = 0;
      if (mainEvent && mainEvent.date) {
        var dp = String(mainEvent.date).split('-');
        var yy = parseInt(dp[0], 10) || 0;
        var mm = (parseInt(dp[1], 10) || 1) - 1;
        var dd = parseInt(dp[2], 10) || 1;
        var tp = String(mainEvent.time || '12:00').split(':');
        var hh = parseInt(tp[0], 10) || 0;
        var mn = parseInt(tp[1], 10) || 0;
        targetMs = Date.UTC(yy, mm, dd, hh, mn, 0, 0) - 5.5 * 3600 * 1000;
      }

      var cdGrid = $('.countdown-grid', countdown);
      var cdDone = $('.countdown-done', countdown);
      var cdTarget = $('.countdown-target-date', countdown);

      if (cdTarget && mainEvent) {
        var parts = [];
        if (mainEvent.name) parts.push(mainEvent.name);
        if (mainEvent.date) parts.push(mainEvent.date);
        if (mainEvent.time) parts.push(mainEvent.time + ' IST');
        cdTarget.textContent = parts.join(' \u00B7 ');
      }

      var units = cdGrid ? $$('.countdown-unit', cdGrid) : [];
      var unitState = units.map(function (u) {
        return { digits: $$('.countdown-digit', u), last: null };
      });

      var tickCountdown = function () {
        if (!targetMs) return;
        var diff = targetMs - Date.now();
        if (diff <= 0) {
          if (cdGrid) cdGrid.hidden = true;
          if (cdDone) cdDone.hidden = false;
          return;
        }
        if (cdGrid) cdGrid.hidden = false;
        if (cdDone) cdDone.hidden = true;

        var total = Math.floor(diff / 1000);
        var vals = [
          Math.floor(total / 86400),
          Math.floor((total % 86400) / 3600),
          Math.floor((total % 3600) / 60),
          total % 60
        ];

        unitState.forEach(function (u, i) {
          var v = vals[i] || 0;
          if (u.last === v) return;
          u.last = v;
          var str = pad2(v);
          if (u.digits.length === 2) {
            u.digits[0].textContent = str.charAt(0);
            u.digits[1].textContent = str.charAt(1);
          } else if (u.digits.length === 1) {
            u.digits[0].textContent = str;
          }
          if (!prefersReduced) {
            u.digits.forEach(function (dg) {
              dg.classList.remove('flipping');
              void dg.offsetWidth;
              dg.classList.add('flipping');
            });
          }
        });
      };

      tickCountdown();
      setInterval(tickCountdown, 1000);
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     VENUE TABS
     ========================================================================== */
  try {
    var venueTabs = $$('.venue-tab');
    var venuePanels = $$('.venue-panel');
    var showVenue = function (idx) {
      venueTabs.forEach(function (t, k) {
        var active = k === idx;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      venuePanels.forEach(function (p, k) {
        p.hidden = k !== idx;
      });
    };
    venueTabs.forEach(function (t, idx) {
      on(t, 'click', function () { showVenue(idx); });
    });
    if (venueTabs.length) showVenue(0);
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     POLAROID STACK (tap to cycle)
     ========================================================================== */
  try {
    var stack = $('.polaroid-stack');
    if (stack) {
      var advanceStack = function () {
        var cards = $$('.polaroid', stack);
        if (cards.length < 2) return;
        var top = cards[0];
        stack.appendChild(top);
      };
      on(stack, 'click', advanceStack);
      on(stack, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceStack();
        }
      });
      stack.setAttribute('tabindex', '0');
      stack.setAttribute('role', 'button');
      stack.setAttribute('aria-label', 'Gallery. Tap to see the next photo.');
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     ICS DOWNLOAD
     ========================================================================== */
  var downloadICS = function (ev) {
    if (!ev || !ev.date) return;
    var dp = String(ev.date).split('-');
    var yy = parseInt(dp[0], 10) || 0;
    var mm = (parseInt(dp[1], 10) || 1) - 1;
    var dd = parseInt(dp[2], 10) || 1;
    var tp = String(ev.time || '12:00').split(':');
    var hh = parseInt(tp[0], 10) || 0;
    var mn = parseInt(tp[1], 10) || 0;
    var startMs = Date.UTC(yy, mm, dd, hh, mn, 0, 0) - 5.5 * 3600 * 1000;
    var endMs = startMs + 3 * 3600 * 1000;

    var fmt = function (ms) {
      var dt = new Date(ms);
      return dt.getUTCFullYear() + pad2(dt.getUTCMonth() + 1) + pad2(dt.getUTCDate()) +
        'T' + pad2(dt.getUTCHours()) + pad2(dt.getUTCMinutes()) + '00Z';
    };

    var summary = ev.name || 'Nikah Event';
    var location = [ev.venue || '', ev.address || ''].filter(Boolean).join(', ');
    var descr = [ev.note || '', ev.dress ? 'Dress: ' + ev.dress : ''].filter(Boolean).join(' \u2014 ');
    var uid = 'nikah-' + startMs + '-' + Math.random().toString(36).slice(2, 8) + '@nikah';

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nikah Card//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + fmt(Date.now()),
      'DTSTART:' + fmt(startMs),
      'DTEND:' + fmt(endMs),
      'SUMMARY:' + escapeICS(summary),
      'LOCATION:' + escapeICS(location),
      'DESCRIPTION:' + escapeICS(descr),
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (slug(summary) || 'event') + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
  };

  try {
    $$('.rsvp-calendar').forEach(function (btn) {
      on(btn, 'click', function () {
        var idx = parseInt(btn.getAttribute('data-event-index'), 10);
        if (isNaN(idx)) return;
        var ev = DATA.events && DATA.events[idx];
        if (ev) downloadICS(ev);
      });
    });
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     RSVP WHATSAPP
     ========================================================================== */
  try {
    var waBtn = $('.rsvp-whatsapp');
    if (waBtn) {
      on(waBtn, 'click', function () {
        var num = DATA.rsvp && DATA.rsvp.whatsapp ? DATA.rsvp.whatsapp : '';
        num = String(num).replace(/\D/g, '');
        if (!num) {
          window.alert('WhatsApp number is not set.');
          return;
        }
        var p1 = DATA.person1 && DATA.person1.name ? DATA.person1.name : '';
        var p2 = DATA.person2 && DATA.person2.name ? DATA.person2.name : '';
        var msg = 'Assalamu Alaikum, I would like to confirm my attendance for the Nikah of ' +
          p1 + ' & ' + p2 + '.';
        window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     SHARE
     ========================================================================== */
  try {
    var shareBtn = $('.footer-share');
    if (shareBtn) {
      on(shareBtn, 'click', function () {
        var url = window.location.href.split('#')[0];
        if (navigator.share) {
          navigator.share({
            title: 'Nikah Invitation',
            text: 'You are cordially invited.',
            url: url
          }).catch(function () {});
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            var old = shareBtn.textContent;
            shareBtn.textContent = 'Link copied!';
            setTimeout(function () { shareBtn.textContent = old; }, 1600);
          }).catch(function () {
            window.prompt('Copy this link:', url);
          });
        } else {
          window.prompt('Copy this link:', url);
        }
      });
    }
  } catch (e) { /* ignore */ }

  /* ==========================================================================
     INITIAL NUDGE — gently trigger the hero name reveal after the page
     has settled, in case the seal is somehow bypassed (deep link, refresh
     on a scrolled position, etc.).
     ========================================================================== */
  setTimeout(function () {
    if (cardMain && cardMain.classList.contains('is-ready')) {
      writeNamesIn($('.hero'));
    }
  }, 6000);

};
// END OF FILE card-runtime.js
