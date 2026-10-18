/* ============================================================
   CINEMATIC INDIAN WEDDING CARD — script.js

   This file is the "engine" of the card. It works in two places:
   1. The Builder page (this site), where editor.js calls
      window.renderCard(data) after every edit.
   2. The exported ZIP, where the card data lives inside an inline
      <script id="card-data" type="application/json"> tag.

   IMPORTANT: this file must never depend on editor.js.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. CONSTANTS
     ========================================================== */

  var THEMES = ['maroon', 'emerald', 'blush', 'midnight'];

  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var WEEKDAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Used to change the browser toolbar colour when the theme changes.
  var THEME_COLORS = {
    maroon: '#3b0d12',
    emerald: '#0a3b31',
    blush: '#fbeceb',
    midnight: '#070d22'
  };

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ==========================================================
     2. SMALL HELPERS
     ========================================================== */

  // True only for plain objects like { a: 1 } (not arrays, not null).
  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  // Deep copy. structuredClone is fast and handles data URLs well.
  function clone(value) {
    if (value === null || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (err) { /* fall through */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  // Always returns a string, so we never print "undefined" on the card.
  function str(value, fallback) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  function pad2(number) {
    return (number < 10 ? '0' : '') + number;
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Safe file name: "Wedding Ceremony" becomes "wedding-ceremony".
  function slug(value) {
    var out = String(value || 'card')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return out || 'card';
  }

  // Create an element with a class and text (text is always safe).
  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) {
      node.textContent = String(textContent);
    }
    return node;
  }

  // Create an SVG element with attributes.
  function svgEl(tag, attributes) {
    var node = document.createElementNS(SVG_NS, tag);
    if (attributes) {
      Object.keys(attributes).forEach(function (key) {
        node.setAttribute(key, attributes[key]);
      });
    }
    return node;
  }

  // Only allow real https links, so a bad mapLink can never inject
  // a javascript: URL into the card.
  function safeHttps(url) {
    var value = String(url || '').trim();
    return /^https:\/\//i.test(value) ? value : '';
  }

  function googleSearchUrl(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(query || '');
  }

  function googleDirectionsUrl(query) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(query || '');
  }

  /* ==========================================================
     3. DATE AND TIME HELPERS (all in IST, Asia/Kolkata)

     We read the date as plain numbers instead of using
     new Date("2026-12-06"), because that would depend on the
     visitor's timezone and could show the wrong day.
     ========================================================== */

  function parseDateParts(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { y: year, m: month, d: day };
  }

  // "Sunday, 6 December 2026"
  function formatDateLong(value) {
    var parts = parseDateParts(value);
    if (!parts) return '';
    var utc = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
    return WEEKDAYS[utc.getUTCDay()] + ', ' + parts.d + ' ' +
      MONTHS[parts.m - 1] + ' ' + parts.y;
  }

  // "6 Dec 2026"
  function formatDateShort(value) {
    var parts = parseDateParts(value);
    if (!parts) return '';
    return parts.d + ' ' + MONTHS[parts.m - 1].slice(0, 3) + ' ' + parts.y;
  }

  // "20:00" becomes "8:00 PM"
  function formatTime(value) {
    var match = /^(\d{1,2}):(\d{2})/.exec(String(value || '').trim());
    if (!match) return '';
    var hours = Number(match[1]);
    var minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return '';
    var suffix = hours >= 12 ? 'PM' : 'AM';
    var shown = hours % 12;
    if (shown === 0) shown = 12;
    return shown + ':' + pad2(minutes) + ' ' + suffix;
  }

  // Turns "2026-12-06" + "20:00" into a real timestamp,
  // read as India Standard Time (UTC + 5:30).
  function eventInstantIST(dateValue, timeValue) {
    var date = parseDateParts(dateValue);
    var time = /^(\d{1,2}):(\d{2})/.exec(String(timeValue || '').trim());
    if (!date || !time) return null;
    var iso = date.y + '-' + pad2(date.m) + '-' + pad2(date.d) + 'T' +
      pad2(Number(time[1])) + ':' + pad2(Number(time[2])) + ':00+05:30';
    var ms = Date.parse(iso);
    return isFinite(ms) ? ms : null;
  }

  /* ==========================================================
     4. DEFAULT CARD
     This is the sample card shown on first load and the object
     editor.js uses for "Reset to sample".
     ========================================================== */

  var DEFAULT_CARD = {
    theme: 'maroon',

    gate: {
      line: '|| Shubh Vivah ||',
      tapText: 'Tap to open'
    },

    blessing: 'With the blessings of our elders and the warmth of both our families',
    host: 'The Sharma & Iyer families',
    inviteText: 'cordially invite you with family and friends to celebrate the wedding of',

    person1: {
      name: 'Aarav',
      sub: 'Son of Mr. & Mrs. Sharma'
    },
    person2: {
      name: 'Meera',
      sub: 'Daughter of Mr. & Mrs. Iyer'
    },

    events: [
      {
        name: 'Mehndi',
        date: '2026-12-03',
        time: '11:00',
        venue: 'Sharma Residence',
        address: '12, Rose Garden Lane, Jaipur, Rajasthan 302001',
        mapLink: '',
        dress: 'Bright greens and yellows',
        note: 'Henna, music and sweets all afternoon.',
        isMain: false
      },
      {
        name: 'Haldi',
        date: '2026-12-04',
        time: '09:00',
        venue: 'Sharma Residence',
        address: '12, Rose Garden Lane, Jaipur, Rajasthan 302001',
        mapLink: '',
        dress: 'Yellow and white',
        note: 'Come ready for a little turmeric!',
        isMain: false
      },
      {
        name: 'Sangeet',
        date: '2026-12-05',
        time: '19:00',
        venue: 'The Grand Pavilion',
        address: 'Amber Road, Jaipur, Rajasthan 302002',
        mapLink: '',
        dress: 'Indian formal — sparkle welcome',
        note: 'The dance floor opens at 8 PM.',
        isMain: false
      },
      {
        name: 'Wedding Ceremony',
        date: '2026-12-06',
        time: '20:00',
        venue: 'The Grand Pavilion',
        address: 'Amber Road, Jaipur, Rajasthan 302002',
        mapLink: '',
        dress: 'Traditional Indian',
        note: 'Baraat at 7 PM. Pheras at 8 PM.',
        isMain: true
      },
      {
        name: 'Reception',
        date: '2026-12-07',
        time: '19:30',
        venue: 'Hotel Rajmahal',
        address: 'MI Road, Jaipur, Rajasthan 302001',
        mapLink: '',
        dress: 'Cocktail / formal',
        note: 'Dinner, toasts and dancing.',
        isMain: false
      }
    ],

    story: {
      show: true,
      title: 'Our Story',
      text: 'We met on a rainy afternoon over chai that went cold because neither of us wanted to stop talking.\n\nSix years, four cities and countless train journeys later, we are finally bringing our families together for one very happy day.\n\nWe would love for you to be there as we begin the rest of our lives.'
    },

    gallery: [],
    music: { src: '', title: '' },
    video: { src: '' },

    rsvp: {
      show: true,
      whatsapp: '919876543210',
      note: 'Please confirm by 25 November 2026'
    },

    contacts: [
      { label: 'Aarav', phone: '+919876543210' },
      { label: 'Meera', phone: '+919812345678' }
    ],

    footer: {
      thanks: 'Your presence and prayers will make our day truly special',
      family: 'With love, the Sharma & Iyer families'
    }
  };

  /* ==========================================================
     5. DATA NORMALISATION
     Whatever the editor or the exported JSON gives us, we turn it
     into a complete, predictable object. This is why renderCard
     never crashes on a half-filled card.
     ========================================================== */

  function mergeData(base, extra) {
    if (!isPlainObject(extra)) return clone(base);
    var out = clone(base);
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (isPlainObject(value) && isPlainObject(out[key])) {
        out[key] = mergeData(out[key], value);
      } else if (Array.isArray(value)) {
        out[key] = clone(value);
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  function normalizeEvent(raw) {
    var event = isPlainObject(raw) ? raw : {};
    return {
      name: str(event.name, 'Event'),
      date: str(event.date, ''),
      time: str(event.time, ''),
      venue: str(event.venue, ''),
      address: str(event.address, ''),
      mapLink: str(event.mapLink, ''),
      dress: str(event.dress, ''),
      note: str(event.note, ''),
      isMain: event.isMain === true
    };
  }

  function normalizeData(raw) {
    var data = mergeData(DEFAULT_CARD, raw);

    if (THEMES.indexOf(data.theme) === -1) data.theme = 'maroon';

    data.gate = isPlainObject(data.gate) ? data.gate : {};
    data.gate.line = str(data.gate.line, DEFAULT_CARD.gate.line);
    data.gate.tapText = str(data.gate.tapText, DEFAULT_CARD.gate.tapText);

    data.blessing = str(data.blessing, '');
    data.host = str(data.host, '');
    data.inviteText = str(data.inviteText, '');

    data.person1 = isPlainObject(data.person1) ? data.person1 : {};
    data.person2 = isPlainObject(data.person2) ? data.person2 : {};
    data.person1.name = str(data.person1.name, '');
    data.person1.sub = str(data.person1.sub, '');
    data.person2.name = str(data.person2.name, '');
    data.person2.sub = str(data.person2.sub, '');

    data.events = Array.isArray(data.events)
      ? data.events.filter(isPlainObject).map(normalizeEvent)
      : [];

    // Exactly one main event, please.
    var seenMain = false;
    data.events.forEach(function (event) {
      if (!event.isMain) return;
      if (seenMain) event.isMain = false;
      else seenMain = true;
    });
    if (!seenMain && data.events.length) data.events[0].isMain = true;

    data.story = isPlainObject(data.story) ? data.story : {};
    data.story.show = data.story.show !== false;
    data.story.title = str(data.story.title, 'Our Story');
    data.story.text = str(data.story.text, '');

    data.gallery = Array.isArray(data.gallery)
      ? data.gallery.filter(function (src) {
          return typeof src === 'string' && src.length > 0;
        }).slice(0, 8)
      : [];

    data.music = isPlainObject(data.music) ? data.music : {};
    data.music.src = str(data.music.src, '');
    data.music.title = str(data.music.title, '');

    data.video = isPlainObject(data.video) ? data.video : {};
    data.video.src = str(data.video.src, '');

    data.rsvp = isPlainObject(data.rsvp) ? data.rsvp : {};
    data.rsvp.show = data.rsvp.show !== false;
    data.rsvp.whatsapp = str(data.rsvp.whatsapp, '');
    data.rsvp.note = str(data.rsvp.note, '');

    data.contacts = Array.isArray(data.contacts)
      ? data.contacts.filter(isPlainObject).slice(0, 3).map(function (contact) {
          return {
            label: str(contact.label, ''),
            phone: str(contact.phone, '')
          };
        })
      : [];

    data.footer = isPlainObject(data.footer) ? data.footer : {};
    data.footer.thanks = str(data.footer.thanks, '');
    data.footer.family = str(data.footer.family, '');

    return data;
  }

  // Reads the exported inline JSON if it exists, otherwise the sample.
  function getCardData() {
    var tag = document.getElementById('card-data');
    if (tag) {
      try {
        return normalizeData(JSON.parse(tag.textContent || '{}'));
      } catch (error) {
        if (window.console) {
          window.console.warn('The inline card data was not valid JSON. Showing the sample card.');
        }
      }
    }
    return normalizeData(DEFAULT_CARD);
  }

  // "?guest=Priya" becomes "Priya". Text only, never HTML.
  function getGuestName() {
    try {
      var raw = new URLSearchParams(window.location.search).get('guest');
      if (!raw) return '';
      return raw.trim().slice(0, 60);
    } catch (error) {
      return '';
    }
  }

  /* ==========================================================
     6. SHARED SVG ART (developer-written, never user text)
     ========================================================== */

  function heartSvg() {
    var svg = svgEl('svg', {
      viewBox: '0 0 24 24',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    svg.appendChild(svgEl('path', {
      d: 'M12 21s-7.6-4.7-9.7-9.1A5.3 5.3 0 0 1 12 5.8a5.3 5.3 0 0 1 9.7 6.1C19.6 16.3 12 21 12 21z',
      fill: 'currentColor'
    }));
    return svg;
  }

  function shareSvg() {
    var svg = svgEl('svg', {
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    svg.appendChild(svgEl('path', {
      d: 'M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14V4z',
      fill: 'currentColor'
    }));
    svg.appendChild(svgEl('path', {
      d: 'M5 6h6v2H6v10h10v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
      fill: 'currentColor'
    }));
    return svg;
  }

  // A mandala drawn with maths instead of a giant markup string.
  function buildMandala() {
    var svg = svgEl('svg', {
      viewBox: '0 0 400 400',
      'aria-hidden': 'true',
      focusable: 'false'
    });

    var group = svgEl('g', {
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1'
    });

    [196, 150, 96, 40].forEach(function (radius, index) {
      group.appendChild(svgEl('circle', {
        cx: '200',
        cy: '200',
        r: String(radius),
        opacity: String(0.35 + index * 0.14)
      }));
    });

    var petalCount = 24;
    for (var i = 0; i < petalCount; i += 1) {
      var angle = (i / petalCount) * Math.PI * 2;
      var startX = 200 + Math.cos(angle) * 46;
      var startY = 200 + Math.sin(angle) * 46;
      var endX = 200 + Math.cos(angle) * 150;
      var endY = 200 + Math.sin(angle) * 150;
      var rightX = 200 + Math.cos(angle + 0.10) * 96;
      var rightY = 200 + Math.sin(angle + 0.10) * 96;
      var leftX = 200 + Math.cos(angle - 0.10) * 96;
      var leftY = 200 + Math.sin(angle - 0.10) * 96;

      group.appendChild(svgEl('path', {
        d: 'M' + startX.toFixed(1) + ' ' + startY.toFixed(1) +
           ' Q' + rightX.toFixed(1) + ' ' + rightY.toFixed(1) +
           ' ' + endX.toFixed(1) + ' ' + endY.toFixed(1) +
           ' Q' + leftX.toFixed(1) + ' ' + leftY.toFixed(1) +
           ' ' + startX.toFixed(1) + ' ' + startY.toFixed(1),
        opacity: '0.5'
      }));
    }

    svg.appendChild(group);
    return svg;
  }

  /* ==========================================================
     7. SMALL UI PIECES
     ========================================================== */

  var toastNode = null;

  function showToast(message) {
    if (!toastNode) {
      toastNode = el('div', 'toast');
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    toastNode.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toastNode.classList.remove('is-visible');
    }, 2600);
  }

  function anchorButton(label, href) {
    var link = document.createElement('a');
    link.className = 'btn btn--small';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    return link;
  }

  function ornament() {
    var node = el('div', 'ornament');
    node.setAttribute('aria-hidden', 'true');
    node.appendChild(document.createElement('span'));
    return node;
  }

  // Wraps every letter in a span so they can fade in one by one.
  // Names that are not plain Latin are kept whole, because splitting
  // Hindi or Arabic letters would break the way they join.
  function lettersSpan(value) {
    var fragment = document.createDocumentFragment();
    var source = String(value || '');

    var letterAnimation =
      'letterIn 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s forwards, ' +
      'shimmer 9s linear infinite';

    if (/[^\x00-\x7F]/.test(source)) {
      var whole = el('span', 'ltr gold-text', source);
      whole.style.setProperty('--i', '0');
      whole.style.animation = letterAnimation;
      fragment.appendChild(whole);
      return fragment;
    }

    var characters = source.split('');
    characters.forEach(function (character, index) {
      var span = document.createElement('span');
      span.className = 'ltr gold-text';
      span.style.setProperty('--i', String(index));
      span.style.animation =
        'letterIn 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) ' +
        (index * 65 + 200) + 'ms forwards, shimmer 9s linear infinite';
      span.textContent = character === ' ' ? '\u00A0' : character;
      fragment.appendChild(span);
    });

    return fragment;
  }

  /* ==========================================================
     8. SECTION BUILDERS
     Every builder returns a <section class="scene"> that the
     IntersectionObserver will reveal later.
     ========================================================== */

  function buildHero(data, guest) {
    var section = el('section', 'scene hero scene--circle');
    section.setAttribute('data-scene-hero', '');
    section.setAttribute('aria-label', 'Wedding invitation');

    var inner = el('div', 'hero__inner');

    // Optional soft background video behind the names.
    if (data.video.src) {
      var video = document.createElement('video');
      video.className = 'hero__video';
      video.src = data.video.src;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('tabindex', '-1');
      video.addEventListener('error', function () {
        if (video.parentNode) video.parentNode.removeChild(video);
      });
      inner.appendChild(video);
    }

    var mandala = el('div', 'hero__mandala');
    mandala.setAttribute('aria-hidden', 'true');
    mandala.appendChild(buildMandala());
    inner.appendChild(mandala);

    var lanterns = el('div', 'hero__lanterns');
    lanterns.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 6; i += 1) lanterns.appendChild(document.createElement('span'));
    inner.appendChild(lanterns);

    var arch = el('div', 'hero__arch');
    arch.setAttribute('aria-hidden', 'true');
    inner.appendChild(arch);

    var content = el('div', 'hero__content');

    if (guest) {
      content.appendChild(el('p', 'hero__guest', 'Dear ' + guest + ','));
    }

    content.appendChild(el(
      'p',
      'hero__kicker',
      data.blessing || 'Together with our families'
    ));

    // The names live inside one <h1> so screen readers hear one line.
    var heading = document.createElement('h1');
    heading.className = 'hero__names';

    var first = el('span', 'hero__name hand gold-text');
    first.setAttribute('dir', 'auto');
    first.appendChild(lettersSpan(data.person1.name));
    heading.appendChild(first);

    var heart = el('span', 'hero__heart');
    heart.setAttribute('aria-hidden', 'true');
    heart.appendChild(heartSvg());
    heading.appendChild(heart);

    var weds = el('span', 'hero__amp', 'weds');
    weds.setAttribute('aria-hidden', 'true');
    heading.appendChild(weds);

    var second = el('span', 'hero__name hand gold-text');
    second.setAttribute('dir', 'auto');
    second.appendChild(lettersSpan(data.person2.name));
    heading.appendChild(second);

    content.appendChild(heading);

    // Main date line under the names.
    var mainEvent = null;
    for (var e = 0; e < data.events.length; e += 1) {
      if (data.events[e].isMain) { mainEvent = data.events[e]; break; }
    }
    if (!mainEvent && data.events.length) mainEvent = data.events[0];

    if (mainEvent) {
      var bits = [];
      var longDate = formatDateLong(mainEvent.date);
      if (longDate) bits.push(longDate);
      var time = formatTime(mainEvent.time);
      if (time) bits.push(time + ' IST');
      if (bits.length) content.appendChild(el('p', 'hero__date', bits.join(' · ')));
    }

    content.appendChild(el('p', 'hero__scroll-hint', 'Scroll to begin'));

    inner.appendChild(content);
    section.appendChild(inner);
    return section;
  }

  function buildBlessing(data, guest) {
    var section = el('section', 'scene scene--arch scene--tint blessing');
    section.setAttribute('aria-label', 'Invitation');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'The Invitation'));

    if (data.blessing) {
      inner.appendChild(el('p', 'blessing__lines', data.blessing));
    }
    if (data.host) {
      inner.appendChild(el('p', 'blessing__host', data.host));
    }
    if (data.inviteText) {
      inner.appendChild(el('p', 'blessing__invite', data.inviteText));
    }

    if (guest) {
      inner.appendChild(el(
        'p',
        'blessing__invite',
        'Dear ' + guest + ', it would be our joy to have you with us.'
      ));
    }

    inner.appendChild(ornament());

    var couple = el('p', 'blessing__couple');
    couple.setAttribute('dir', 'auto');
    couple.appendChild(el('span', '', data.person1.name));
    couple.appendChild(el('i', '', '&'));
    couple.appendChild(el('span', '', data.person2.name));
    inner.appendChild(couple);

    if (data.person1.sub || data.person2.sub) {
      var subs = el('div', 'scene__lead');
      if (data.person1.sub) subs.appendChild(el('p', '', data.person1.sub));
      if (data.person2.sub) subs.appendChild(el('p', '', data.person2.sub));
      inner.appendChild(subs);
    }

    section.appendChild(inner);
    return section;
  }

  function buildEventItem(event) {
    var item = el('div', 'tl-item' + (event.isMain ? ' is-main' : ''));

    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'event-card';
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute(
      'aria-label',
      event.name + '. Tap to see the venue, dress code and notes.'
    );

    var inner = el('div', 'event-card__inner');

    // ---- Front face ----
    var front = el('div', 'event-card__face event-card__front');
    front.appendChild(el(
      'span',
      'event-card__tag' + (event.isMain ? ' event-card__tag--main' : ''),
      event.isMain ? 'Main Event' : 'Event'
    ));
    front.appendChild(el('h3', 'event-card__name', event.name));

    var when = el('div', 'event-card__when');
    var shortDate = formatDateShort(event.date);
    if (shortDate) when.appendChild(el('span', '', shortDate));
    var shortTime = formatTime(event.time);
    if (shortTime) when.appendChild(el('span', 'event-card__time', shortTime));
    front.appendChild(when);

    if (event.venue) front.appendChild(el('p', 'event-card__venue', event.venue));
    front.appendChild(el('span', 'event-card__flip-hint', 'Tap for details'));

    // ---- Back face ----
    var back = el('div', 'event-card__face event-card__back');
    back.appendChild(el('span', 'event-card__tag', 'Details'));
    back.appendChild(el('h3', 'event-card__name', event.name));

    var rows = el('dl', 'event-card__rows');
    [
      ['Venue', event.venue],
      ['Address', event.address],
      ['Dress code', event.dress],
      ['Note', event.note]
    ].forEach(function (pair) {
      if (!pair[1]) return;
      var row = el('div', 'event-card__row');
      row.appendChild(el('dt', '', pair[0]));
      row.appendChild(el('dd', pair[0] === 'Note' ? 'event-card__note' : '', pair[1]));
      rows.appendChild(row);
    });
    back.appendChild(rows);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Tap / Enter / Space flips the card.
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-expanded', flipped ? 'true' : 'false');
    });

    // Gentle 3D tilt, mouse only, and never with reduced motion.
    card.addEventListener('pointermove', function (pointerEvent) {
      if (pointerEvent.pointerType !== 'mouse' || prefersReducedMotion()) return;
      var rect = card.getBoundingClientRect();
      var x = (pointerEvent.clientX - rect.left) / rect.width - 0.5;
      var y = (pointerEvent.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });

    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });

    item.appendChild(card);
    return item;
  }

  function buildEvents(data) {
    var section = el('section', 'scene scene--curtain events');
    section.setAttribute('aria-label', 'Wedding events');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'Celebrations'));
    inner.appendChild(el('h2', 'scene__title gold-text', 'Wedding Events'));
    inner.appendChild(el('p', 'scene__lead', 'Tap any card to see the venue and dress code.'));

    var timeline = el('div', 'timeline');
    timeline.appendChild(el('span', 'tl-line'));

    data.events.forEach(function (event) {
      timeline.appendChild(buildEventItem(event));
    });

    inner.appendChild(timeline);
    section.appendChild(inner);
    return section;
  }

  function buildCountdownSection() {
    var section = el('section', 'scene scene--circle scene--tint countdown');
    section.setAttribute('aria-label', 'Countdown to the wedding');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'Save the date'));
    inner.appendChild(el('h2', 'scene__title gold-text', 'The Celebration Begins In'));

    var clock = el('div', 'clock');
    clock.id = 'clockEl';
    clock.setAttribute('role', 'timer');
    clock.setAttribute('aria-live', 'off');

    ['Days', 'Hours', 'Minutes', 'Seconds'].forEach(function (label) {
      var unit = el('div', 'clock__unit');
      var digits = el('div', 'clock__digits');
      digits.setAttribute('data-unit', label.toLowerCase());
      unit.appendChild(digits);
      unit.appendChild(el('span', 'clock__label', label));
      clock.appendChild(unit);
    });
    inner.appendChild(clock);

    var done = el('p', 'countdown__done', 'The celebrations have begun');
    done.id = 'countdownDone';
    done.hidden = true;
    inner.appendChild(done);

    var target = el('p', 'countdown__target', '');
    target.id = 'countdownTarget';
    inner.appendChild(target);

    section.appendChild(inner);
    return section;
  }

  function buildVenue(data) {
    var withAddress = data.events.filter(function (event) {
      return event.address || event.venue;
    });
    if (!withAddress.length) return null;

    var section = el('section', 'scene scene--arch venue');
    section.setAttribute('aria-label', 'Venues');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'Find us'));
    inner.appendChild(el('h2', 'scene__title gold-text', 'Venues'));

    var tabs = el('div', 'venue__tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Wedding venues');

    var panels = el('div', 'venue__panels');

    withAddress.forEach(function (event, index) {
      var tabId = 'venue-tab-' + index;
      var panelId = 'venue-panel-' + index;

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'venue__tab';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      tab.textContent = event.name;
      tabs.appendChild(tab);

      var panel = el('div', 'venue__panel');
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      if (index !== 0) panel.hidden = true;

      panel.appendChild(el('p', 'venue__event', event.name));

      var fullAddress = [event.venue, event.address].filter(Boolean).join('\n');
      panel.appendChild(el('p', 'venue__address', fullAddress));

      var mapUrl = safeHttps(event.mapLink) || googleSearchUrl(fullAddress || event.name);
      var directionsUrl = googleDirectionsUrl(fullAddress || event.name);

      var actions = el('div', 'venue__actions');
      actions.appendChild(anchorButton('Open in Maps', mapUrl));
      actions.appendChild(anchorButton('Get Directions', directionsUrl));
      panel.appendChild(actions);

      panels.appendChild(panel);
    });

    var tabNodes = Array.prototype.slice.call(tabs.children);
    var panelNodes = Array.prototype.slice.call(panels.children);

    function activate(index, moveFocus) {
      tabNodes.forEach(function (node, position) {
        node.setAttribute('aria-selected', position === index ? 'true' : 'false');
        node.tabIndex = position === index ? 0 : -1;
      });
      panelNodes.forEach(function (node, position) {
        node.hidden = position !== index;
      });
      if (moveFocus && tabNodes[index]) tabNodes[index].focus();
    }

    tabNodes.forEach(function (node, index) {
      node.tabIndex = index === 0 ? 0 : -1;

      node.addEventListener('click', function () {
        activate(index, false);
      });

      node.addEventListener('keydown', function (keyEvent) {
        var key = keyEvent.key;
        if (key === 'ArrowRight' || key === 'ArrowDown') {
          keyEvent.preventDefault();
          activate((index + 1) % tabNodes.length, true);
        } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
          keyEvent.preventDefault();
          activate((index - 1 + tabNodes.length) % tabNodes.length, true);
        } else if (key === 'Home') {
          keyEvent.preventDefault();
          activate(0, true);
        } else if (key === 'End') {
          keyEvent.preventDefault();
          activate(tabNodes.length - 1, true);
        }
      });
    });

    inner.appendChild(tabs);
    inner.appendChild(panels);
    section.appendChild(inner);
    return section;
  }

  function buildStory(data) {
    var section = el('section', 'scene scene--curtain story');
    section.setAttribute('aria-label', data.story.title || 'Our story');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'A little story'));
    inner.appendChild(el('h2', 'scene__title gold-text', data.story.title || 'Our Story'));
    inner.appendChild(el('div', 'story__text', data.story.text));
    inner.appendChild(ornament());

    section.appendChild(inner);
    return section;
  }

  function buildGallery(data) {
    var section = el('section', 'scene scene--circle scene--tint');
    section.setAttribute('aria-label', 'Photo gallery');

    var inner = el('div', 'scene__inner scene__inner--wide stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'Moments'));
    inner.appendChild(el('h2', 'scene__title gold-text', 'Our Gallery'));

    var gallery = el('div', 'gallery');
    gallery.setAttribute('role', 'list');

    data.gallery.forEach(function (src, index) {
      var figure = el('figure', 'polaroid');
      figure.setAttribute('role', 'listitem');

      var image = document.createElement('img');
      image.src = src;
      image.alt = 'Wedding photo ' + (index + 1);
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', function () {
        if (figure.parentNode) figure.parentNode.removeChild(figure);
      });

      figure.appendChild(image);
      figure.appendChild(el('figcaption', 'polaroid__caption', '♥'));
      gallery.appendChild(figure);
    });

    inner.appendChild(gallery);
    section.appendChild(inner);
    return section;
  }

  function buildRsvp(data) {
    var section = el('section', 'scene scene--arch scene--tint rsvp');
    section.setAttribute('aria-label', 'RSVP');

    var inner = el('div', 'scene__inner stagger');
    inner.appendChild(el('span', 'scene__eyebrow', 'RSVP'));
    inner.appendChild(el('h2', 'scene__title gold-text', 'Will You Join Us?'));

    var digits = String(data.rsvp.whatsapp || '').replace(/\D/g, '');
    var coupleName = (data.person1.name || 'the couple') +
      (data.person2.name ? ' & ' + data.person2.name : '');

    var message = 'Namaste! We would love to attend ' + coupleName +
      "'s wedding. Our warmest wishes to the family.";

    if (data.rsvp.note) {
      inner.appendChild(el('p', 'rsvp__note', data.rsvp.note));
    }

    if (digits) {
      var actions = el('div', 'rsvp__actions');
      var whatsapp = document.createElement('a');
      whatsapp.className = 'btn btn--gold btn--wide';
      whatsapp.href = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
      whatsapp.target = '_blank';
      whatsapp.rel = 'noopener noreferrer';
      whatsapp.textContent = 'Confirm on WhatsApp';
      actions.appendChild(whatsapp);
      inner.appendChild(actions);
    }

    if (data.events.length) {
      var calendar = el('div', 'rsvp__ics');
      calendar.appendChild(el('p', 'rsvp__ics-title', 'Add to your calendar'));

      var list = el('div', 'rsvp__ics-list');
      data.events.forEach(function (event) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn--small';
        button.textContent = event.name;
        button.appendChild(el('span', '', formatDateShort(event.date)));
        button.addEventListener('click', function () {
          downloadIcs(data, event);
        });
        list.appendChild(button);
      });

      calendar.appendChild(list);
      inner.appendChild(calendar);
    }

    section.appendChild(inner);
    return section;
  }

  function buildFooter(data) {
    var section = el('section', 'scene scene--curtain footer');
    section.setAttribute('aria-label', 'With love');

    var inner = el('div', 'scene__inner stagger');

    inner.appendChild(el('p', 'footer__thanks', data.footer.thanks));

    if (data.footer.family) {
      inner.appendChild(el('p', 'footer__family', data.footer.family));
    }

    var contacts = data.contacts.filter(function (contact) {
      return contact.label || contact.phone;
    });

    if (contacts.length) {
      var contactRow = el('div', 'footer__actions');
      contacts.forEach(function (contact) {
        var digits = String(contact.phone || '').replace(/[^\d+]/g, '');
        var link = document.createElement('a');
        link.className = 'btn btn--small';
        link.textContent = contact.label || 'Call';
        if (digits) link.href = 'tel:' + digits;
        contactRow.appendChild(link);
      });
      inner.appendChild(contactRow);
    }

    var shareRow = el('div', 'footer__actions');
    var shareButton = document.createElement('button');
    shareButton.type = 'button';
    shareButton.className = 'btn';
    shareButton.appendChild(shareSvg());
    shareButton.appendChild(document.createTextNode(' Share Invitation'));
    shareButton.addEventListener('click', function () {
      shareCard(data);
    });
    shareRow.appendChild(shareButton);
    inner.appendChild(shareRow);

    inner.appendChild(ornament());

    section.appendChild(inner);
    return section;
  }

  /* ==========================================================
     9. ADD TO CALENDAR (.ics download)
     ========================================================== */

  function icsDate(ms) {
    var date = new Date(ms);
    return date.getUTCFullYear() +
      pad2(date.getUTCMonth() + 1) +
      pad2(date.getUTCDate()) + 'T' +
      pad2(date.getUTCHours()) +
      pad2(date.getUTCMinutes()) +
      pad2(date.getUTCSeconds()) + 'Z';
  }

  function icsEscape(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function downloadIcs(data, event) {
    var start = eventInstantIST(event.date, event.time);
    if (start === null) {
      showToast('This event has no date yet');
      return;
    }

    var end = start + 2 * 60 * 60 * 1000;
    var couple = (data.person1.name || 'Wedding') +
      (data.person2.name ? ' & ' + data.person2.name : '');
    var location = [event.venue, event.address].filter(Boolean).join(', ');
    var description = [
      event.dress ? 'Dress code: ' + event.dress : '',
      event.note || ''
    ].filter(Boolean).join('\n\n');

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Card//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@weddingcard',
      'DTSTAMP:' + icsDate(Date.now()),
      'DTSTART:' + icsDate(start),
      'DTEND:' + icsDate(end),
      'SUMMARY:' + icsEscape(event.name + ' — ' + couple),
      'LOCATION:' + icsEscape(location),
      'DESCRIPTION:' + icsEscape(description),
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    var blob = new Blob([lines.join('\r\n')], {
      type: 'text/calendar;charset=utf-8'
    });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = url;
    link.download = slug(event.name) + '.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);

    showToast('Calendar file downloaded');
  }

  /* ==========================================================
     10. SHARE BUTTON
     ========================================================== */

  function legacyCopy(value) {
    try {
      var area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      showToast('Link copied');
    } catch (error) {
      showToast('Copy this link: ' + value);
    }
  }

  function copyToClipboard(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        showToast('Link copied');
      }, function () {
        legacyCopy(value);
      });
      return;
    }
    legacyCopy(value);
  }

  function shareCard(data) {
    var name1 = data.person1.name || 'Our';
    var name2 = data.person2.name || 'wedding';
    var title = name1 + ' & ' + name2 + ' — Wedding Invitation';
    var url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'You are warmly invited to our wedding.',
        url: url
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        copyToClipboard(url);
      });
      return;
    }

    copyToClipboard(url);
  }

  /* ==========================================================
     11. RENDER CARD
     Safe to call again and again after every edit.
     ========================================================== */

  var countdownTimer = null;
  var sceneObserver = null;
  var scrollHandler = null;
  var scrollScheduled = false;
  var pointerHandler = null;
  var heroRevealHandler = null;
  var heroRevealTimer = 0;

  function cleanupCountdown() {
    if (countdownTimer !== null) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function cleanupPointer() {
    if (pointerHandler) {
      window.removeEventListener('pointermove', pointerHandler);
      pointerHandler = null;
    }
  }

  function cleanupScenes() {
    if (sceneObserver) {
      sceneObserver.disconnect();
      sceneObserver = null;
    }
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
      scrollHandler = null;
    }
    if (heroRevealHandler) {
      window.removeEventListener('card:gateopen', heroRevealHandler);
      heroRevealHandler = null;
    }
    if (heroRevealTimer) {
      window.clearTimeout(heroRevealTimer);
      heroRevealTimer = 0;
    }
    scrollScheduled = false;
  }

  function updateThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.maroon);
  }

  function renderCard(rawData) {
    var data;
    try {
      data = normalizeData(rawData);
    } catch (error) {
      data = normalizeData(DEFAULT_CARD);
    }

    // ---- Theme and gate ----
    document.documentElement.setAttribute('data-theme', data.theme);
    updateThemeColor(data.theme);

    var gateLine = document.getElementById('gateLine');
    if (gateLine) gateLine.textContent = data.gate.line;

    var gateTapText = document.getElementById('gateTapText');
    if (gateTapText) gateTapText.textContent = data.gate.tapText;

    var gateTap = document.getElementById('gateTap');
    if (gateTap) gateTap.setAttribute('aria-label', data.gate.tapText || 'Open the invitation');

    // ---- Music ----
    var audio = document.getElementById('bgm');
    if (audio) {
      var currentSrc = audio.getAttribute('src') || '';
      if (data.music.src && data.music.src !== currentSrc) {
        audio.setAttribute('src', data.music.src);
        try { audio.load(); } catch (error) { /* ignore */ }
      } else if (!data.music.src && currentSrc) {
        audio.pause();
        audio.removeAttribute('src');
      }
    }
    syncMuteButton();

    // ---- Stop anything from the previous render ----
    cleanupScenes();
    cleanupCountdown();
    cleanupPointer();

    var card = document.getElementById('card');
    if (!card) return;
    card.textContent = '';

    var guest = getGuestName();

    card.appendChild(buildHero(data, guest));
    card.appendChild(buildBlessing(data, guest));
    if (data.events.length) card.appendChild(buildEvents(data));
    card.appendChild(buildCountdownSection());

    var venueSection = buildVenue(data);
    if (venueSection) card.appendChild(venueSection);

    if (data.story.show && data.story.text.trim()) {
      card.appendChild(buildStory(data));
    }

    if (data.gallery.length) {
      card.appendChild(buildGallery(data));
    }

    if (data.rsvp.show) {
      card.appendChild(buildRsvp(data));
    }

    card.appendChild(buildFooter(data));

    document.title = (data.person1.name || 'Wedding') + ' & ' +
      (data.person2.name || 'Invitation') + ' — Wedding Invitation';

    // ---- Start everything again on the fresh DOM ----
    initScrollScenes();
    initCountdown(data);
    initPointerParallax();
  }

  /* ==========================================================
     12. SCROLL SCENES
     Each section opens with its own clip-path, plus the golden
     timeline line and the hero parallax.
     ========================================================== */

  function updateTimelineDraw() {
    var timeline = document.querySelector('.timeline');
    if (!timeline) return;

    var rect = timeline.getBoundingClientRect();
    var viewportHeight = window.innerHeight || 0;
    if (!rect.height) return;

    var progress = (viewportHeight * 0.85 - rect.top) / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    timeline.style.setProperty('--draw', progress.toFixed(3));
  }

  function updateHeroScrollParallax() {
    var content = document.querySelector('.hero__content');
    if (!content) return;
    if (prefersReducedMotion()) {
      content.style.transform = '';
      return;
    }
    var scrolled = window.pageYOffset || 0;
    var shift = Math.min(scrolled * 0.06, 34);
    content.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
  }

  function initScrollScenes() {
    cleanupScenes();

    var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
    var heroScene = document.querySelector('[data-scene-hero]');

    // Old browsers without IntersectionObserver: just show everything.
    if (!('IntersectionObserver' in window)) {
      scenes.forEach(function (scene) { scene.classList.add('is-in'); });
      updateTimelineDraw();
      return;
    }

    sceneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        sceneObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    scenes.forEach(function (scene) {
      // The hero is revealed when the palace gate opens, not before.
      if (scene === heroScene) return;
      sceneObserver.observe(scene);
    });

    if (heroScene) {
      if (!document.body.classList.contains('gate-closed')) {
        heroScene.classList.add('is-in');
      } else {
        heroRevealHandler = function () {
          window.removeEventListener('card:gateopen', heroRevealHandler);
          heroRevealHandler = null;
          if (heroScene.isConnected) heroScene.classList.add('is-in');
        };
        window.addEventListener('card:gateopen', heroRevealHandler);

        // Safety net: never leave the hero hidden for long.
        heroRevealTimer = window.setTimeout(function () {
          heroRevealTimer = 0;
          if (heroRevealHandler) {
            window.removeEventListener('card:gateopen', heroRevealHandler);
            heroRevealHandler = null;
          }
          if (heroScene.isConnected) heroScene.classList.add('is-in');
        }, 6000);
      }
    }

    scrollHandler = function () {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(function () {
        scrollScheduled = false;
        updateTimelineDraw();
        updateHeroScrollParallax();
      });
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler, { passive: true });

    updateTimelineDraw();
    updateHeroScrollParallax();
  }

  /* ==========================================================
     13. HERO PARALLAX (mouse / tilt)
     The CSS reads --px and --py on .hero__lanterns.
     ========================================================== */

  function initPointerParallax() {
    cleanupPointer();
    if (prefersReducedMotion()) return;

    var lanterns = document.querySelector('.hero__lanterns');
    if (!lanterns) return;

    pointerHandler = function (pointerEvent) {
      var x = (pointerEvent.clientX / window.innerWidth - 0.5) * 2;
      var y = (pointerEvent.clientY / window.innerHeight - 0.5) * 2;
      lanterns.style.setProperty('--px', x.toFixed(3));
      lanterns.style.setProperty('--py', y.toFixed(3));
    };

    window.addEventListener('pointermove', pointerHandler, { passive: true });
  }

  /* ==========================================================
     14. COUNTDOWN
     ========================================================== */

  function makeDigits(container, count) {
    container.textContent = '';
    var tiles = [];
    for (var i = 0; i < count; i += 1) {
      var tile = el('span', 'digit');
      var face = el('span', 'digit__face', '0');
      tile.appendChild(face);
      container.appendChild(tile);
      tiles.push({ tile: tile, face: face });
    }
    return tiles;
  }

  function writeDigits(tiles, value) {
    for (var i = 0; i < tiles.length; i += 1) {
      var character = value[i] || '0';
      if (tiles[i].face.textContent === character) continue;
      tiles[i].face.textContent = character;
      tiles[i].tile.classList.remove('is-flip');
      // Reading offsetWidth restarts the CSS animation.
      void tiles[i].tile.offsetWidth;
      tiles[i].tile.classList.add('is-flip');
    }
  }

  function initCountdown(data) {
    cleanupCountdown();

    var clock = document.getElementById('clockEl');
    var done = document.getElementById('countdownDone');
    var targetLabel = document.getElementById('countdownTarget');
    if (!clock || !done || !targetLabel) return;

    var mainEvent = null;
    for (var i = 0; i < data.events.length; i += 1) {
      if (data.events[i].isMain) { mainEvent = data.events[i]; break; }
    }
    if (!mainEvent && data.events.length) mainEvent = data.events[0];

    if (!mainEvent) {
      clock.hidden = true;
      done.hidden = false;
      done.textContent = 'The celebrations are being planned';
      return;
    }

    var target = eventInstantIST(mainEvent.date, mainEvent.time);
    if (target === null) {
      clock.hidden = true;
      done.hidden = false;
      done.textContent = 'The celebrations are being planned';
      targetLabel.textContent = mainEvent.name;
      return;
    }

    var labelBits = [mainEvent.name];
    var longDate = formatDateLong(mainEvent.date);
    if (longDate) labelBits.push(longDate);
    var time = formatTime(mainEvent.time);
    if (time) labelBits.push(time + ' IST');
    targetLabel.textContent = labelBits.join(' · ');

    var dayContainer = clock.querySelector('[data-unit="days"]');
    var hourContainer = clock.querySelector('[data-unit="hours"]');
    var minuteContainer = clock.querySelector('[data-unit="minutes"]');
    var secondContainer = clock.querySelector('[data-unit="seconds"]');
    if (!dayContainer || !hourContainer || !minuteContainer || !secondContainer) return;

    var dayCount = Math.max(
      2,
      String(Math.max(0, Math.floor((target - Date.now()) / 86400000))).length
    );

    var tiles = {
      days: makeDigits(dayContainer, dayCount),
      hours: makeDigits(hourContainer, 2),
      minutes: makeDigits(minuteContainer, 2),
      seconds: makeDigits(secondContainer, 2)
    };

    function tick() {
      var remaining = target - Date.now();

      if (remaining <= 0) {
        clock.hidden = true;
        done.hidden = false;
        done.textContent = 'The celebrations have begun';
        cleanupCountdown();
        return;
      }

      var totalSeconds = Math.floor(remaining / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      writeDigits(tiles.days, String(days).padStart(tiles.days.length, '0'));
      writeDigits(tiles.hours, pad2(hours));
      writeDigits(tiles.minutes, pad2(minutes));
      writeDigits(tiles.seconds, pad2(seconds));

      clock.setAttribute(
        'aria-label',
        days + ' days, ' + hours + ' hours, ' + minutes +
        ' minutes and ' + seconds + ' seconds until ' + mainEvent.name
      );
    }

    tick();
    countdownTimer = window.setInterval(tick, 1000);
  }

  /* ==========================================================
     15. OPENING GATE
     ========================================================== */

  function updateMuteButton(audio, button) {
    if (!audio || !button) return;
    var muted = !!audio.muted;
    button.classList.toggle('is-muted', muted);
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
    button.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
  }

  function syncMuteButton() {
    var audio = document.getElementById('bgm');
    var button = document.getElementById('muteBtn');
    if (!audio || !button) return;

    var gateOpen = !document.body.classList.contains('gate-closed');
    var hasMusic = !!audio.getAttribute('src');
    button.hidden = !(gateOpen && hasMusic);
    updateMuteButton(audio, button);
  }

  function initGate() {
    var gate = document.getElementById('gate');
    var tap = document.getElementById('gateTap');
    var audio = document.getElementById('bgm');
    var muteButton = document.getElementById('muteBtn');
    if (!gate || !tap) return;

    var opened = false;

    function openGate() {
      if (opened) return;
      opened = true;

      gate.classList.add('is-open');

      // Browsers only allow sound after a real tap, so we start it here.
      if (audio && audio.getAttribute('src')) {
        var playing = audio.play();
        if (playing && typeof playing.catch === 'function') {
          playing.catch(function () { /* the visitor can unmute manually */ });
        }
      }

      window.setTimeout(function () {
        gate.classList.add('is-done');
        document.body.classList.remove('gate-closed');
        window.dispatchEvent(new Event('card:gateopen'));
        syncMuteButton();

        var card = document.getElementById('card');
        if (card) {
          card.setAttribute('tabindex', '-1');
          try { card.focus({ preventScroll: true }); } catch (error) { /* ignore */ }
        }

        window.setTimeout(function () {
          gate.hidden = true;
          gate.setAttribute('aria-hidden', 'true');
        }, 950);
      }, 1150);
    }

    tap.addEventListener('click', openGate);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        if (!audio) return;
        if (audio.paused && audio.getAttribute('src')) {
          var playing = audio.play();
          if (playing && typeof playing.catch === 'function') {
            playing.catch(function () { /* ignore */ });
          }
          audio.muted = false;
        } else {
          audio.muted = !audio.muted;
        }
        updateMuteButton(audio, muteButton);
      });
    }

    syncMuteButton();
  }

  /* ==========================================================
     16. PETALS AND GOLD DUST (canvas#fx)
     Maximum 40 particles, paused when the tab is hidden, and
     switched off completely for reduced motion.
     ========================================================== */

  function initFX() {
    var canvas = document.getElementById('fx');
    if (!canvas) return;

    var context = canvas.getContext('2d');
    if (!context) return;

    if (prefersReducedMotion()) {
      canvas.style.display = 'none';
      return;
    }

    var MAX_PARTICLES = 40;
    var COLORS = ['#e8a23a', '#f2b544', '#d94f5c', '#c43c50'];

    var particles = [];
    var frameId = 0;
    var running = true;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var lastTime = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(startAnywhere) {
      var isDust = Math.random() < 0.35;
      return {
        x: Math.random() * width,
        y: startAnywhere ? Math.random() * height : -20 - Math.random() * 60,
        radius: isDust ? 1 + Math.random() * 1.6 : 3 + Math.random() * 5,
        driftX: (Math.random() - 0.5) * 0.5,
        driftY: isDust ? 0.15 + Math.random() * 0.3 : 0.5 + Math.random() * 0.9,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        sway: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        alpha: isDust ? 0.5 + Math.random() * 0.4 : 0.55 + Math.random() * 0.4,
        isDust: isDust,
        color: isDust ? '#f7dd9c' : COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }

    function fillParticles() {
      particles = [];
      var count = Math.min(MAX_PARTICLES, 26);
      for (var i = 0; i < count; i += 1) particles.push(makeParticle(true));
    }

    function draw(timestamp) {
      if (!running) return;

      var delta = lastTime ? Math.min(timestamp - lastTime, 48) : 16;
      lastTime = timestamp;
      var seconds = timestamp / 1000;

      context.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i += 1) {
        var particle = particles[i];

        particle.x += particle.driftX + Math.sin(seconds * particle.sway + particle.phase) * 0.35;
        particle.y += particle.driftY * (delta / 16);
        particle.rotation += particle.spin;

        if (particle.y > height + 30 || particle.x < -40 || particle.x > width + 40) {
          particles[i] = makeParticle(false);
          continue;
        }

        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;

        if (particle.isDust) {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fill();
        } else {
          context.translate(particle.x, particle.y);
          context.rotate(particle.rotation);
          context.beginPath();
          context.ellipse(0, 0, particle.radius, particle.radius * 0.58, 0, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
      }

      frameId = window.requestAnimationFrame(draw);
    }

    function startLoop() {
      if (running) return;
      running = true;
      lastTime = 0;
      frameId = window.requestAnimationFrame(draw);
    }

    function stopLoop() {
      running = false;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }

    resize();
    fillParticles();
    frameId = window.requestAnimationFrame(draw);

    window.addEventListener('resize', function () {
      resize();
      if (particles.length > MAX_PARTICLES) particles.length = MAX_PARTICLES;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopLoop();
      else startLoop();
    });
  }

  /* ==========================================================
     17. BOOT
     ========================================================== */

  function boot() {
    var data;
    try {
      data = getCardData();
    } catch (error) {
      data = normalizeData(DEFAULT_CARD);
    }

    try {
      renderCard(data);
    } catch (error) {
      if (window.console) window.console.error('Could not render the card:', error);
    }

    try {
      initGate();
    } catch (error) {
      if (window.console) window.console.warn('The gate could not start.', error);
    }

    try {
      initFX();
    } catch (error) {
      if (window.console) window.console.warn('The petal effect could not start.', error);
    }

    // Last-resort safety: if something stops the gate from opening,
    // never leave the visitor locked out of the card.
    window.setTimeout(function () {
      if (!document.body.classList.contains('gate-closed')) return;
      document.body.classList.remove('gate-closed');
      var gate = document.getElementById('gate');
      if (gate) {
        gate.classList.add('is-done');
        gate.hidden = true;
        gate.setAttribute('aria-hidden', 'true');
      }
      window.dispatchEvent(new Event('card:gateopen'));
      syncMuteButton();
    }, 18000);
  }

  /* ==========================================================
     18. PUBLIC CONTRACT
     editor.js uses exactly these two things.
     ========================================================== */

  window.renderCard = renderCard;
  window.DEFAULT_CARD = DEFAULT_CARD;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
