window.CARD_LOADED_RUNTIME = true;
window.cardRuntime = function (DATA) {
  'use strict';

  /* ==========================================================================
     SHORT HELPERS
     ========================================================================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var on = function (el, evt, fn) { if (el) el.addEventListener(evt, fn); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
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
  var prefersReduced = function () {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  };

  /* ==========================================================================
     GUEST NAME (from URL ?guest=Name)
     ========================================================================== */
  try {
    var params = new URLSearchParams(window.location.search);
    var guestName = params.get('guest');
    if (guestName) {
      var guestLine = $('.guest-line');
      if (guestLine) {
        guestLine.textContent = 'Dear ' + guestName + ',';
        guestLine.hidden = false;
      }
    }
  } catch (e) {}

  /* ==========================================================================
     MUSIC + MUTE BUTTON
     ========================================================================== */
  var audio = null;
  var muteBtn = null;
  var musicUrl = '';
  if (typeof DATA.music === 'string') musicUrl = DATA.music;
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
      muteBtn.setAttribute('aria-label', 'Play music');
      muteBtn.textContent = '\u266A';
      document.body.appendChild(muteBtn);

      var updateMuteIcon = function () {
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

      on(audio, 'play', updateMuteIcon);
      on(audio, 'pause', updateMuteIcon);
      on(audio, 'ended', updateMuteIcon);

      on(muteBtn, 'click', function () {
        if (!audio) return;
        if (audio.paused) {
          var pr = audio.play();
          if (pr && typeof pr.catch === 'function') pr.catch(function () {});
        } else {
          audio.pause();
        }
      });

      updateMuteIcon();
    } catch (e) {
      audio = null;
      muteBtn = null;
    }
  }

  /* ==========================================================================
     OPENING SCENE
     ========================================================================== */
  var opening = $('.opening');
  var cardMain = $('.card-main');
  var seal = $('.seal');
  var opened = false;

  // Build twinkling stars in the opening sky
  try {
    var starsWrap = $('.opening-stars');
    if (starsWrap) {
      var i;
      for (i = 0; i < 34; i++) {
        var st = document.createElement('span');
        st.className = 'star' + (i % 6 === 0 ? ' star-lg' : '');
        st.style.setProperty('--x', (Math.random() * 100).toFixed(2) + '%');
        st.style.setProperty('--y', (Math.random() * 62).toFixed(2) + '%');
        st.style.setProperty('--d', (2 + Math.random() * 3).toFixed(2) + 's');
        st.style.setProperty('--delay', (Math.random() * 3).toFixed(2) + 's');
        starsWrap.appendChild(st);
      }
    }
  } catch (e) {}

  var sparkleBurst = function () {
    if (!seal) return;
    var rect;
    try { rect = seal.getBoundingClientRect(); } catch (e) { return; }
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var k;
    for (k = 0; k < 12; k++) {
      var sp = document.createElement('span');
      sp.className = 'sparkle';
      var angle = (Math.PI * 2 * k) / 12;
      var dist = 50 + Math.random() * 40;
      sp.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      sp.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      sp.style.position = 'fixed';
      sp.style.left = cx + 'px';
      sp.style.top = cy + 'px';
      document.body.appendChild(sp);
      (function (node) {
        setTimeout(function () {
          if (node && node.parentNode) node.parentNode.removeChild(node);
        }, 1000);
      })(sp);
    }
  };

  var openCard = function () {
    if (opened) return;
    opened = true;

    // start music on the tap (user gesture)
    if (audio) {
      try {
        var pr = audio.play();
        if (pr && typeof pr.catch === 'function') pr.catch(function () {});
      } catch (e) {}
    }

    if (opening) {
      sparkleBurst();
      opening.classList.add('is-opening');
      setTimeout(function () {
        opening.classList.add('is-open');
        if (cardMain) cardMain.classList.add('is-ready');
        setTimeout(function () {
          if (opening && opening.parentNode) {
            opening.parentNode.removeChild(opening);
          }
        }, 1100);
      }, 950);
    } else if (cardMain) {
      cardMain.classList.add('is-ready');
    }
  };

  on(seal, 'click', openCard);

  // safety: if the opening markup is missing, reveal the card anyway
  if (!seal) {
    setTimeout(function () {
      if (cardMain) cardMain.classList.add('is-ready');
    }, 400);
  }

  /* ==========================================================================
     SCROLL REVEAL (IntersectionObserver)
     ========================================================================== */
  try {
    var scenes = $$('.scene');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      scenes.forEach(function (s) { io.observe(s); });
    } else {
      scenes.forEach(function (s) { s.classList.add('is-visible'); });
    }
  } catch (e) {
    $$('.scene').forEach(function (s) { s.classList.add('is-visible'); });
  }

  /* ==========================================================================
     PETALS CANVAS (hero only, max 40 particles)
     ========================================================================== */
  try {
    var hero = $('.hero');
    if (hero && !prefersReduced()) {
      var canvas = document.createElement('canvas');
      canvas.className = 'petals-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      hero.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var W = 0;
      var H = 0;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      var resizePetals = function () {
        var r = hero.getBoundingClientRect();
        W = r.width;
        H = r.height;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizePetals();
      on(window, 'resize', resizePetals);

      var MAX = 40;
      var types = ['jasmine', 'rose', 'gold'];
      var colors = {
        jasmine: ['#ffffff', '#fff8e0', '#f7f0d8'],
        rose: ['#f3c1c8', '#e8a5b1', '#f5d4d9'],
        gold: ['#ffe9ab', '#d4af37', '#f2d98a']
      };

      var spawn = function (initial) {
        var t = types[Math.floor(Math.random() * types.length)];
        var cs = colors[t];
        return {
          x: Math.random() * W,
          y: initial ? Math.random() * H : -12 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.35 + Math.random() * 0.7,
          size: t === 'gold' ? 1.2 + Math.random() * 1.8 : 3 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.03,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.012,
          color: cs[Math.floor(Math.random() * cs.length)],
          type: t
        };
      };

      var particles = [];
      var pi;
      for (pi = 0; pi < MAX; pi++) particles.push(spawn(true));

      var drawPetal = function (p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = p.color;
        if (p.type === 'gold') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      var raf = null;
      var running = false;

      var loop = function () {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        var j;
        for (j = 0; j < particles.length; j++) {
          var p = particles[j];
          p.sway += p.swaySpeed;
          p.x += p.vx + Math.sin(p.sway) * 0.28;
          p.y += p.vy;
          p.rot += p.vrot;
          if (p.y > H + 24 || p.x < -24 || p.x > W + 24) {
            particles[j] = spawn(false);
          }
          drawPetal(particles[j]);
        }
        raf = window.requestAnimationFrame(loop);
      };

      var startPetals = function () {
        if (running) return;
        running = true;
        raf = window.requestAnimationFrame(loop);
      };
      var stopPetals = function () {
        running = false;
        if (raf) window.cancelAnimationFrame(raf);
        raf = null;
      };

      startPetals();

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopPetals();
        else startPetals();
      });
    }
  } catch (e) {}

  /* ==========================================================================
     EVENT CARDS: flip on tap, tilt on pointer (desktop only)
     ========================================================================== */
  try {
    var eventCards = $$('.event-card');
    eventCards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Event card. Tap to flip.');
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

      if (!prefersReduced()) {
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
          if (!inner) return;
          inner.style.transform = '';
        });
      }
    });
  } catch (e) {}

  /* ==========================================================================
     VENUE TABS
     ========================================================================== */
  try {
    var venueTabs = $$('.venue-tab');
    var venuePanels = $$('.venue-panel');
    var activateVenue = function (idx) {
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
      on(t, 'click', function () { activateVenue(idx); });
    });
    if (venueTabs.length) activateVenue(0);
  } catch (e) {}

  /* ==========================================================================
     GALLERY: tap a card to bring it to the front of the stack
     ========================================================================== */
  try {
    var galCards = $$('.gallery-card');
    galCards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Gallery photo. Tap to bring forward.');
      var bringForward = function () {
        var wrap = card.parentNode;
        if (!wrap) return;
        var cards = Array.prototype.slice.call(wrap.querySelectorAll('.gallery-card'));
        var top = cards[cards.length - 1];
        if (!top) return;
        wrap.insertBefore(card, top.nextSibling);
      };
      on(card, 'click', bringForward);
      on(card, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          bringForward();
        }
      });
    });
  } catch (e) {}

  /* ==========================================================================
     COUNTDOWN (IST, main event)
     ========================================================================== */
  try {
    var cdSection = $('.countdown-section');
    if (cdSection) {
      var mainEvent = null;
      var events = DATA.events || [];
      var ei;
      for (ei = 0; ei < events.length; ei++) {
        if (events[ei] && events[ei].isMain) { mainEvent = events[ei]; break; }
      }
      if (!mainEvent && events.length) mainEvent = events[0];

      var targetTime = 0;
      if (mainEvent && mainEvent.date) {
        var dp = String(mainEvent.date).split('-');
        var yy = parseInt(dp[0], 10) || 0;
        var mm = (parseInt(dp[1], 10) || 1) - 1;
        var dd = parseInt(dp[2], 10) || 1;
        var tp = String(mainEvent.time || '12:00').split(':');
        var hh = parseInt(tp[0], 10) || 0;
        var min = parseInt(tp[1], 10) || 0;
        // interpret as IST (UTC+5:30) -> UTC milliseconds
        targetTime = Date.UTC(yy, mm, dd, hh, min, 0, 0) - 5.5 * 3600 * 1000;
      }

      var cdGrid = $('.countdown-grid', cdSection);
      var cdDone = $('.countdown-done', cdSection);
      var cdTarget = $('.countdown-target-date', cdSection);

      if (cdTarget && mainEvent) {
        var labelBits = [];
        if (mainEvent.name) labelBits.push(mainEvent.name);
        if (mainEvent.date) labelBits.push(mainEvent.date);
        if (mainEvent.time) labelBits.push(mainEvent.time + ' IST');
        cdTarget.textContent = labelBits.join(' \u00B7 ');
      }

      var units = cdGrid ? $$('.countdown-unit', cdGrid) : [];
      var unitData = units.map(function (u) {
        return {
          digits: $$('.countdown-digit', u),
          lastVal: null
        };
      });

      var updateCountdown = function () {
        if (!targetTime) return;
        var diff = targetTime - Date.now();
        if (diff <= 0) {
          if (cdGrid) cdGrid.hidden = true;
          if (cdDone) cdDone.hidden = false;
          return;
        }
        if (cdGrid) cdGrid.hidden = false;
        if (cdDone) cdDone.hidden = true;

        var totalSec = Math.floor(diff / 1000);
        var values = [
          Math.floor(totalSec / 86400),
          Math.floor((totalSec % 86400) / 3600),
          Math.floor((totalSec % 3600) / 60),
          totalSec % 60
        ];

        unitData.forEach(function (u, i) {
          var val = values[i] || 0;
          if (u.lastVal === val) return;
          u.lastVal = val;
          var str = pad2(val);
          if (u.digits.length === 2) {
            u.digits[0].textContent = str.charAt(0);
            u.digits[1].textContent = str.charAt(1);
          } else if (u.digits.length === 1) {
            u.digits[0].textContent = str;
          }
          if (!prefersReduced()) {
            u.digits.forEach(function (dg) {
              dg.classList.remove('flipping');
              void dg.offsetWidth;
              dg.classList.add('flipping');
            });
          }
        });
      };

      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
  } catch (e) {}

  /* ==========================================================================
     ICS DOWNLOAD (one file per event)
     ========================================================================== */
  var downloadICS = function (ev) {
    if (!ev || !ev.date) return;
    var dp = String(ev.date).split('-');
    var yy = parseInt(dp[0], 10) || 0;
    var mm = (parseInt(dp[1], 10) || 1) - 1;
    var dd = parseInt(dp[2], 10) || 1;
    var tp = String(ev.time || '12:00').split(':');
    var hh = parseInt(tp[0], 10) || 0;
    var min = parseInt(tp[1], 10) || 0;

    // start in UTC (IST is UTC+5:30)
    var startMs = Date.UTC(yy, mm, dd, hh, min, 0, 0) - 5.5 * 3600 * 1000;
    var endMs = startMs + 3 * 3600 * 1000;

    var fmtUTC = function (ms) {
      var dt = new Date(ms);
      return dt.getUTCFullYear() +
        pad2(dt.getUTCMonth() + 1) +
        pad2(dt.getUTCDate()) + 'T' +
        pad2(dt.getUTCHours()) +
        pad2(dt.getUTCMinutes()) + '00Z';
    };

    var summary = ev.name || 'Nikah Event';
    var location = [ev.venue || '', ev.address || ''].filter(Boolean).join(', ');
    var descr = [ev.note || '', ev.dress ? 'Dress: ' + ev.dress : '']
      .filter(Boolean).join(' \u2014 ');
    var uid = 'nikah-' + startMs + '-' + Math.random().toString(36).slice(2, 8) + '@nikah';

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nikah Card//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + fmtUTC(Date.now()),
      'DTSTART:' + fmtUTC(startMs),
      'DTEND:' + fmtUTC(endMs),
      'SUMMARY:' + escapeICS(summary),
      'LOCATION:' + escapeICS(location),
      'DESCRIPTION:' + escapeICS(descr),
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    var ics = lines.join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
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
  } catch (e) {}

  /* ==========================================================================
     RSVP WHATSAPP
     ========================================================================== */
  try {
    var waBtn = $('.rsvp-whatsapp');
    if (waBtn) {
      on(waBtn, 'click', function () {
        var num = (DATA.rsvp && DATA.rsvp.whatsapp) || '';
        num = String(num).replace(/\D/g, '');
        if (!num) {
          window.alert('WhatsApp number is not set.');
          return;
        }
        var p1 = (DATA.person1 && DATA.person1.name) || '';
        var p2 = (DATA.person2 && DATA.person2.name) || '';
        var msg = 'Assalamu Alaikum, I would like to confirm my attendance for the Nikah of ' +
          p1 + ' & ' + p2 + '.';
        var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank', 'noopener');
      });
    }
  } catch (e) {}

  /* ==========================================================================
     SHARE (native share / copy link / prompt fallback)
     ========================================================================== */
  try {
    var shareBtn = $('.footer-share');
    if (shareBtn) {
      on(shareBtn, 'click', function () {
        var url = window.location.href.split('#')[0];
        var title = 'Nikah Invitation';
        var text = 'You are cordially invited.';
        if (navigator.share) {
          navigator.share({ title: title, text: text, url: url }).catch(function () {});
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            shareBtn.textContent = 'Link copied!';
            setTimeout(function () { shareBtn.textContent = 'Share'; }, 1600);
          }).catch(function () {
            window.prompt('Copy this link:', url);
          });
        } else {
          window.prompt('Copy this link:', url);
        }
      });
    }
  } catch (e) {}

};
// END OF FILE card-runtime.js
