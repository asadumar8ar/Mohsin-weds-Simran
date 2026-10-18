/* ============================================================
   NIKAH INVITATION CARD — card.js

   This file has two jobs, both used by builder.js:

   1. window.DEFAULT_CARD — the sample data for the editor.
   2. window.buildCardHTML(data, cssText) — returns a COMPLETE
      standalone HTML document string for the invitation.

   The returned document contains its own tiny runtime (cardRuntime).
   That runtime is fully self-contained: it never references anything
   from this file, so the exported HTML works on its own forever.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. DEFAULT DATA
     Every field the owner can edit. Arabic text is copied exactly
     as written — letters, marks and diacritics untouched.
     ========================================================== */

  var DEFAULT_CARD = {
    theme: 'emerald',
    sealInitials: 'M & S',

    bismillah: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      sub: 'In the name of Allah, the Most Gracious, the Most Merciful'
    },

    salam: 'Assalamu Alaikum wa Rahmatullahi wa Barakatuhu',

    ayah: {
      show: true,
      arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
      translation: 'And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them, and He placed between you love and mercy.',
      reference: 'Surah Ar-Rum 30:21'
    },

    inviteEn: 'With the grace of Allah and the blessings of our elders, we cordially invite you and your family to join us in celebrating the Nikah of our beloved children.',
    inviteRoman: 'Allah ki rehmat aur buzurgon ki duaon ke saath, hum aapko apne aziz bachon ke Nikah ki khushi mein tashreef laane ki dawat dete hain.',
    host: 'Family Name & family',

    person1: { name: 'Groom Name', sub: 'Son of Mr. & Mrs. ____' },
    person2: { name: 'Bride Name', sub: 'Daughter of Mr. & Mrs. ____' },

    events: [
      {
        name: 'Mehndi',
        date: '2026-12-03',
        time: '11:00',
        venue: 'Family Residence',
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
        venue: 'Family Residence',
        address: '12, Rose Garden Lane, Jaipur, Rajasthan 302001',
        mapLink: '',
        dress: 'Yellow and white',
        note: 'Come ready for a little turmeric!',
        isMain: false
      },
      {
        name: 'Nikah',
        date: '2026-12-05',
        time: '20:00',
        venue: 'The Grand Pavilion',
        address: 'Amber Road, Jaipur, Rajasthan 302002',
        mapLink: '',
        dress: 'Traditional Indian',
        note: 'Baraat at 7 PM. Nikah at 8 PM.',
        isMain: true
      },
      {
        name: 'Walima',
        date: '2026-12-06',
        time: '19:30',
        venue: 'Hotel Rajmahal',
        address: 'MI Road, Jaipur, Rajasthan 302001',
        mapLink: '',
        dress: 'Cocktail / formal',
        note: 'Dinner and celebration.',
        isMain: false
      }
    ],

    story: {
      show: true,
      title: 'Our Story',
      text: 'Two families, one dua, and a thousand small moments brought us to this day.\n\nWe are grateful for the love that surrounds us and we would be honoured by your presence as we begin our life together, Insha\u2019Allah.'
    },

    gallery: [],

    dua: {
      show: true,
      arabic: 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
      translation: 'May Allah bless you both, shower His blessings upon you, and unite you in goodness.'
    },

    music: { src: '', title: '' },

    rsvp: {
      show: true,
      whatsapp: '91XXXXXXXXXX',
      note: 'Please confirm your tashreef by ____'
    },

    contacts: [
      { label: 'Groom family', phone: '+91 98765 43210' },
      { label: 'Bride family', phone: '+91 98123 45678' }
    ],

    footer: {
      thanks: "Aapki tashreef aur dua hamari khushiyon ko mukammal karegi, Insha'Allah.",
      family: 'Aapke muntazir: ____ & family',
      closing: 'Jazakumullahu Khairan'
    }
  };

  /* ==========================================================
     2. BUILD HELPERS (run in the builder's page context)
     These are used ONLY to generate markup strings. The runtime
     inside the exported card has its own copies.
     ========================================================== */

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeHttps(url) {
    var value = String(url || '').trim();
    return /^https:\/\//i.test(value) ? value : '';
  }

  function pad2(number) {
    return (number < 10 ? '0' : '') + number;
  }

  var SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];

  function formatDateShort(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    if (!m) return '';
    return parseInt(m[3], 10) + ' ' +
      SHORT_MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  function formatDateLong(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    if (!m) return '';
    var utc = new Date(Date.UTC(parseInt(m[1], 10),
      parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
    return WEEKDAYS[utc.getUTCDay()] + ', ' + parseInt(m[3], 10) + ' ' +
      LONG_MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  function formatTime(hhmm) {
    var m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || '').trim());
    if (!m) return '';
    var h = parseInt(m[1], 10);
    if (h > 23) return '';
    var suffix = h >= 12 ? 'PM' : 'AM';
    var shown = h % 12;
    if (shown === 0) shown = 12;
    return shown + ':' + m[2] + ' ' + suffix;
  }

  function googleMapsSearch(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(query || '');
  }

  function googleMapsDirections(query) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(query || '');
  }

  // Wrap each Latin letter in its own <span> so the CSS can fade
  // them in one at a time. Non-Latin scripts stay as one block
  // because splitting them breaks Arabic / Urdu joining.
  function lettersHTML(text) {
    var source = String(text === null || text === undefined ? '' : text);
    if (!source) return '';
    if (/[^\x00-\x7F]/.test(source)) {
      return '<span class="ltr" style="--i:0">' + escapeHtml(source) + '</span>';
    }
    var out = '';
    for (var i = 0; i < source.length; i += 1) {
      var character = source.charAt(i);
      var shown = character === ' ' ? '&nbsp;' : escapeHtml(character);
      out += '<span class="ltr" style="--i:' + i + '">' + shown + '</span>';
    }
    return out;
  }

  /* ==========================================================
     3. STATIC SVG ART (developer-written, no user text)
     ========================================================== */

  function heartSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 21s-7.6-4.7-9.7-9.1A5.3 5.3 0 0 1 12 5.8a5.3 5.3 0 0 1 9.7 6.1C19.6 16.3 12 21 12 21z"/>' +
      '</svg>';
  }

  function shareSvg() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14V4z"/>' +
      '<path fill="currentColor" d="M5 6h6v2H6v10h10v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>' +
      '</svg>';
  }

  function muteSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path class="mute__body" d="M4 9.5v5h3.6L12.5 18V6L7.6 9.5H4z"/>' +
      '<path class="mute__wave" d="M15.8 9a4.4 4.4 0 0 1 0 6" fill="none" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path class="mute__wave" d="M18.4 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path class="mute__slash" d="M4.5 4.5l15 15" fill="none" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>';
  }

  function khatamSvg() {
    // 8-point star (Rub el Hizb) — two squares at 45°, tiled.
    return '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<pattern id="khatamPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.1">' +
      '<rect x="14" y="14" width="52" height="52"/>' +
      '<rect x="14" y="14" width="52" height="52" transform="rotate(45 40 40)"/>' +
      '<circle cx="40" cy="40" r="6"/>' +
      '</g>' +
      '</pattern>' +
      '</defs>' +
      '<rect width="400" height="400" fill="url(#khatamPattern)"/>' +
      '</svg>';
  }

  function skylineSvg() {
    // Mosque silhouette: minarets and domes, filled with currentColor.
    return '<svg viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<g fill="currentColor">' +
      '<rect x="60" y="98" width="8" height="102"/>' +
      '<path d="M64 98 L58 86 L70 86 Z"/>' +
      '<path d="M180 200 Q180 128 224 128 Q268 128 268 200 Z"/>' +
      '<rect x="360" y="86" width="10" height="114"/>' +
      '<path d="M365 86 L358 74 L372 74 Z"/>' +
      '<path d="M480 200 Q480 116 542 116 Q604 116 604 200 Z"/>' +
      '<rect x="700" y="98" width="8" height="102"/>' +
      '<path d="M704 98 L698 86 L710 86 Z"/>' +
      '<path d="M830 200 Q830 128 874 128 Q918 128 918 200 Z"/>' +
      '<rect x="1040" y="86" width="10" height="114"/>' +
      '<path d="M1045 86 L1038 74 L1052 74 Z"/>' +
      '</g>' +
      '</svg>';
  }

  /* ==========================================================
     4. BODY MARKUP BUILDERS
     ========================================================== */

  function buildEventCardHTML(event) {
    var isMain = !!event.isMain;

    var rows = '';
    if (event.venue) {
      rows += '<div class="event-card__row"><dt>Venue</dt><dd>' +
        escapeHtml(event.venue) + '</dd></div>';
    }
    if (event.address) {
      rows += '<div class="event-card__row"><dt>Address</dt><dd>' +
        escapeHtml(event.address) + '</dd></div>';
    }
    if (event.dress) {
      rows += '<div class="event-card__row"><dt>Dress code</dt><dd>' +
        escapeHtml(event.dress) + '</dd></div>';
    }
    if (event.note) {
      rows += '<div class="event-card__row"><dt>Note</dt><dd class="event-card__note">' +
        escapeHtml(event.note) + '</dd></div>';
    }
    if (!rows) {
      rows = '<div class="event-card__row"><dt>Details</dt><dd>See you there.</dd></div>';
    }

    return '<div class="tl-item' + (isMain ? ' is-main' : '') + '">' +
      '<button class="event-card" type="button" aria-expanded="false" ' +
      'aria-label="' + escapeHtml(event.name) + '. Tap for details.">' +
      '<div class="event-card__inner">' +
      '<div class="event-card__face">' +
      '<span class="event-card__tag' + (isMain ? ' event-card__tag--main' : '') + '">' +
      (isMain ? 'Main Event' : 'Event') + '</span>' +
      '<h3 class="event-card__name">' + escapeHtml(event.name) + '</h3>' +
      '<div class="event-card__when">' +
      '<span>' + escapeHtml(formatDateShort(event.date)) + '</span>' +
      '<span class="event-card__time">' + escapeHtml(formatTime(event.time)) + '</span>' +
      '</div>' +
      (event.venue ? '<p class="event-card__venue">' + escapeHtml(event.venue) + '</p>' : '') +
      '<span class="event-card__flip-hint">Tap for details</span>' +
      '</div>' +
      '<div class="event-card__face event-card__face--back">' +
      '<span class="event-card__tag">Details</span>' +
      '<h3 class="event-card__name">' + escapeHtml(event.name) + '</h3>' +
      '<dl class="event-card__rows">' + rows + '</dl>' +
      '</div>' +
      '</div>' +
      '</button>' +
      '</div>';
  }

  function buildGateHTML(data) {
    var initials = escapeHtml(data.sealInitials || 'M & S');

    // A dozen stars scattered across the sky with varied delays.
    var stars = '';
    var starPositions = [
      [8, 18, 0], [22, 12, 1.2], [35, 26, 2.4], [48, 8, 3.1],
      [62, 22, 0.7], [78, 14, 1.8], [88, 32, 2.9], [12, 42, 3.4],
      [28, 52, 0.4], [70, 46, 1.5], [82, 58, 2.2], [55, 62, 3.6]
    ];
    for (var i = 0; i < starPositions.length; i += 1) {
      var s = starPositions[i];
      stars += '<span class="gate__star" style="left:' + s[0] +
        '%;top:' + s[1] + '%;animation-delay:' + s[2] + 's"></span>';
    }

    // Sparkle burst particles around the seal.
    var sparkles = '';
    for (var k = 0; k < 14; k += 1) {
      var angle = (k / 14) * Math.PI * 2;
      var dist = 60 + (k % 3) * 20;
      var sx = Math.round(Math.cos(angle) * dist);
      var sy = Math.round(Math.sin(angle) * dist);
      sparkles += '<span style="--sx:' + sx + 'px;--sy:' + sy +
        'px;animation-delay:' + (k * 20) + 'ms"></span>';
    }

    return '<div class="gate" id="gate" role="dialog" aria-modal="true" ' +
      'aria-label="Open the wedding invitation">' +
      '<div class="gate__sky" aria-hidden="true">' + stars + '</div>' +
      '<div class="gate__crescent" aria-hidden="true"></div>' +
      '<div class="gate__fanoos" aria-hidden="true"></div>' +
      '<p class="gate__title" lang="ur" dir="rtl">دعوت نامہ</p>' +
      '<p class="gate__title-en">Dawat-Nama</p>' +
      '<div class="gate__envelope">' +
      '<div class="gate__env-body" aria-hidden="true"></div>' +
      '<div class="gate__mini" aria-hidden="true"></div>' +
      '<div class="gate__env-flap" aria-hidden="true">' +
      '<svg viewBox="0 0 100 60" preserveAspectRatio="none" focusable="false">' +
      '<polygon points="0,0 100,0 50,60" fill="#04211c" stroke="#e6c27e" stroke-width="0.6"/>' +
      '</svg>' +
      '</div>' +
      '<div class="gate__sparkles" aria-hidden="true">' + sparkles + '</div>' +
      '<button class="gate__seal" id="gateSeal" type="button" ' +
      'aria-label="Tap the seal to open the invitation">' +
      '<span class="gate__seal-initials">' + initials + '</span>' +
      '<span class="gate__seal-crescent" aria-hidden="true"></span>' +
      '</button>' +
      '<p class="gate__seal-tap" id="gateSealTap">Tap the seal to open</p>' +
      '</div>' +
      '</div>';
  }

  function buildHeroHTML(data) {
    var mainEvent = null;
    for (var i = 0; i < data.events.length; i += 1) {
      if (data.events[i].isMain) { mainEvent = data.events[i]; break; }
    }
    if (!mainEvent && data.events.length) mainEvent = data.events[0];

    var dateBits = [];
    if (mainEvent) {
      var longDate = formatDateLong(mainEvent.date);
      if (longDate) dateBits.push(longDate);
      var time = formatTime(mainEvent.time);
      if (time) dateBits.push(time + ' IST');
    }

    var bismillah = data.bismillah || {};
    var p1 = data.person1 || {};
    var p2 = data.person2 || {};

    return '<section class="scene scene--arch hero" data-scene-hero aria-label="Wedding invitation">' +
      '<div class="hero__inner">' +
      '<div class="hero__khatam" aria-hidden="true">' + khatamSvg() + '</div>' +
      '<div class="hero__fanoos" aria-hidden="true"></div>' +
      '<div class="hero__skyline" aria-hidden="true">' + skylineSvg() + '</div>' +
      '<div class="hero__content">' +
      '<p class="hero__guest" data-guest-slot hidden></p>' +
      (bismillah.arabic ?
        '<p class="hero__bismillah" lang="ar" dir="rtl">' +
        escapeHtml(bismillah.arabic) + '</p>' : '') +
      (bismillah.sub ?
        '<p class="hero__bismillah-sub" dir="auto">' +
        escapeHtml(bismillah.sub) + '</p>' : '') +
      '<h1 class="hero__names">' +
      '<span class="hero__name hand gold-text" dir="auto">' +
      lettersHTML(p1.name) + '</span>' +
      '<span class="hero__heart" aria-hidden="true">' + heartSvg() + '</span>' +
      '<span class="hero__amp" aria-hidden="true">weds</span>' +
      '<span class="hero__name hand gold-text" dir="auto">' +
      lettersHTML(p2.name) + '</span>' +
      '</h1>' +
      (dateBits.length ?
        '<p class="hero__date">' + escapeHtml(dateBits.join(' · ')) + '</p>' : '') +
      '<p class="hero__scroll">Scroll to begin</p>' +
      '</div>' +
      '</div>' +
      '</section>';
  }

  function buildSalamHTML(data) {
    var ayah = data.ayah || {};
    var p1 = data.person1 || {};
    var p2 = data.person2 || {};

    var ayahBlock = '';
    if (ayah.show && ayah.arabic) {
      ayahBlock =
        '<p class="salam__ayah" lang="ar" dir="rtl">' +
        escapeHtml(ayah.arabic) + '</p>' +
        (ayah.translation ?
          '<p class="salam__ayah-translation" dir="auto">' +
          escapeHtml(ayah.translation) + '</p>' : '') +
        (ayah.reference ?
          '<p class="salam__ayah-ref">' + escapeHtml(ayah.reference) + '</p>' : '');
    }

    var subs = '';
    if (p1.sub) subs += '<p>' + escapeHtml(p1.sub) + '</p>';
    if (p2.sub) subs += '<p>' + escapeHtml(p2.sub) + '</p>';

    return '<section class="scene scene--crescent scene--tint salam" aria-label="Salam and invitation">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">Salam</span>' +
      (data.salam ?
        '<p class="salam__greeting" lang="ar" dir="rtl">' +
        escapeHtml(data.salam) + '</p>' : '') +
      ayahBlock +
      (data.inviteEn ?
        '<p class="salam__invite" dir="auto">' +
        escapeHtml(data.inviteEn) + '</p>' : '') +
      (data.inviteRoman ?
        '<p class="salam__invite-roman" dir="auto">' +
        escapeHtml(data.inviteRoman) + '</p>' : '') +
      '<p class="salam__guest" data-guest-slot hidden></p>' +
      (data.host ?
        '<p class="salam__host" dir="auto">' + escapeHtml(data.host) + '</p>' : '') +
      '<div class="salam__couple" dir="auto">' +
      '<span>' + escapeHtml(p1.name || '') + '</span>' +
      '<i>&amp;</i>' +
      '<span>' + escapeHtml(p2.name || '') + '</span>' +
      '</div>' +
      (subs ? '<div class="salam__subs">' + subs + '</div>' : '') +
      '<div class="ornament" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '</section>';
  }

  function buildEventsHTML(data) {
    if (!data.events || !data.events.length) return '';
    var items = '';
    for (var i = 0; i < data.events.length; i += 1) {
      items += buildEventCardHTML(data.events[i]);
    }

    return '<section class="scene scene--curtain events" aria-label="Wedding events">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">Programme</span>' +
      '<h2 class="scene__title gold-text">Events</h2>' +
      '<p class="scene__lead">Tap any card to see the venue and dress code.</p>' +
      '<div class="timeline" id="timelineEl">' +
      '<span class="tl-line" aria-hidden="true"></span>' +
      items +
      '</div>' +
      '</div>' +
      '</section>';
  }

  function buildCountdownHTML(data) {
    var mainEvent = null;
    for (var i = 0; i < data.events.length; i += 1) {
      if (data.events[i].isMain) { mainEvent = data.events[i]; break; }
    }
    if (!mainEvent && data.events.length) mainEvent = data.events[0];

    var labels = ['Days', 'Hours', 'Minutes', 'Seconds'];
    var keys = ['days', 'hours', 'minutes', 'seconds'];
    var units = '';
    for (var u = 0; u < labels.length; u += 1) {
      units += '<div class="clock__unit">' +
        '<div class="clock__digits" data-unit="' + keys[u] + '"></div>' +
        '<span class="clock__label">' + labels[u] + '</span>' +
        '</div>';
    }

    return '<section class="scene scene--star scene--tint countdown" aria-label="Countdown">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">Save the date</span>' +
      '<h2 class="scene__title gold-text">Countdown</h2>' +
      '<div class="clock" id="clockEl" role="timer" aria-live="off">' +
      units + '</div>' +
      '<p class="countdown__done" id="countdownDone" hidden>The celebrations have begun</p>' +
      '<p class="countdown__target" id="countdownTarget"></p>' +
      '</div>' +
      '</section>';
  }

  function buildVenueHTML(data) {
    var venues = [];
    for (var i = 0; i < data.events.length; i += 1) {
      var ev = data.events[i];
      if (ev.address || ev.venue) venues.push(ev);
    }
    if (!venues.length) return '';

    var tabs = '';
    var panels = '';
    for (var j = 0; j < venues.length; j += 1) {
      var event = venues[j];
      var tabId = 'venue-tab-' + j;
      var panelId = 'venue-panel-' + j;

      tabs += '<button class="venue__tab" type="button" role="tab" ' +
        'id="' + tabId + '" aria-controls="' + panelId + '" ' +
        'aria-selected="' + (j === 0 ? 'true' : 'false') + '" ' +
        'data-tab-index="' + j + '" ' +
        'tabindex="' + (j === 0 ? '0' : '-1') + '">' +
        escapeHtml(event.name) + '</button>';

      var fullAddress = [event.venue, event.address].filter(Boolean).join('\n');
      var mapUrl = safeHttps(event.mapLink) ||
        googleMapsSearch(fullAddress || event.name);
      var dirUrl = googleMapsDirections(fullAddress || event.name);

      panels += '<div class="venue__panel" id="' + panelId + '" ' +
        'role="tabpanel" aria-labelledby="' + tabId + '"' +
        (j !== 0 ? ' hidden' : '') + '>' +
        '<p class="venue__event" dir="auto">' + escapeHtml(event.name) + '</p>' +
        '<p class="venue__address" dir="auto">' + escapeHtml(fullAddress) + '</p>' +
        '<div class="venue__actions">' +
        '<a class="btn btn--small" href="' + escapeHtml(mapUrl) + '" ' +
        'target="_blank" rel="noopener noreferrer">Open in Maps</a>' +
        '<a class="btn btn--small" href="' + escapeHtml(dirUrl) + '" ' +
        'target="_blank" rel="noopener noreferrer">Get Directions</a>' +
        '</div>' +
        '</div>';
    }

    return '<section class="scene scene--arch venue" aria-label="Venues">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">Find us</span>' +
      '<h2 class="scene__title gold-text">Venues</h2>' +
      '<div class="venue__tabs" role="tablist" aria-label="Wedding venues">' +
      tabs + '</div>' +
      '<div class="venue__panels">' + panels + '</div>' +
      '</div>' +
      '</section>';
  }

  function buildStoryHTML(data) {
    var story = data.story || {};
    if (!story.show || !story.text || !story.text.trim()) return '';
    return '<section class="scene scene--curtain story" aria-label="Our story">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">A little story</span>' +
      '<h2 class="scene__title gold-text">' +
      escapeHtml(story.title || 'Our Story') + '</h2>' +
      '<div class="story__text" dir="auto">' +
      escapeHtml(story.text) + '</div>' +
      '<div class="ornament" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '</section>';
  }

  function buildGalleryHTML(data) {
    if (!data.gallery || !data.gallery.length) return '';
    var photos = '';
    for (var i = 0; i < data.gallery.length; i += 1) {
      var src = String(data.gallery[i] || '');
      if (!src) continue;
      photos += '<figure class="polaroid">' +
        '<img src="' + escapeHtml(src) + '" alt="Wedding photo ' +
        (i + 1) + '" loading="lazy" decoding="async" />' +
        '<figcaption class="polaroid__caption">♥</figcaption>' +
        '</figure>';
    }
    if (!photos) return '';

    return '<section class="scene scene--crescent scene--tint" aria-label="Photo gallery">' +
      '<div class="scene__inner scene__inner--wide stagger">' +
      '<span class="scene__eyebrow">Moments</span>' +
      '<h2 class="scene__title gold-text">Our Gallery</h2>' +
      '<div class="gallery" role="list">' + photos + '</div>' +
      '</div>' +
      '</section>';
  }

  function buildDuaHTML(data) {
    var dua = data.dua || {};
    if (!dua.show || !dua.arabic) return '';
    return '<section class="scene scene--star dua" aria-label="Dua for the couple">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">Dua</span>' +
      '<h2 class="scene__title gold-text">A Prayer for Us</h2>' +
      '<p class="dua__arabic" lang="ar" dir="rtl">' +
      escapeHtml(dua.arabic) + '</p>' +
      (dua.translation ?
        '<p class="dua__translation" dir="auto">' +
        escapeHtml(dua.translation) + '</p>' : '') +
      '<div class="ornament" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '</section>';
  }

  function buildRsvpHTML(data) {
    var rsvp = data.rsvp || {};
    if (!rsvp.show) return '';

    var digits = String(rsvp.whatsapp || '').replace(/\D/g, '');
    var couple = (data.person1 && data.person1.name ? data.person1.name : 'the couple') +
      (data.person2 && data.person2.name ? ' & ' + data.person2.name : '');
    var message = 'Assalamu Alaikum! Insha\u2019Allah we will attend ' +
      couple + '\u2019s Nikah. Our duas and warm wishes to the family.';
    var waUrl = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);

    var actions = '';
    if (digits) {
      actions = '<div class="rsvp__actions">' +
        '<a class="btn btn--gold btn--wide" href="' + escapeHtml(waUrl) + '" ' +
        'target="_blank" rel="noopener noreferrer">Confirm on WhatsApp</a>' +
        '</div>';
    }

    var ics = '';
    if (data.events && data.events.length) {
      var buttons = '';
      for (var i = 0; i < data.events.length; i += 1) {
        buttons += '<button class="btn btn--small" type="button" ' +
          'data-ics-index="' + i + '">' +
          escapeHtml(data.events[i].name) +
          '<span>' + escapeHtml(formatDateShort(data.events[i].date)) + '</span>' +
          '</button>';
      }
      ics = '<div class="rsvp__ics">' +
        '<p class="rsvp__ics-title">Add to your calendar</p>' +
        '<div class="rsvp__ics-list">' + buttons + '</div>' +
        '</div>';
    }

    return '<section class="scene scene--arch scene--tint rsvp" aria-label="RSVP">' +
      '<div class="scene__inner stagger">' +
      '<span class="scene__eyebrow">RSVP</span>' +
      '<h2 class="scene__title gold-text">Your Tashreef</h2>' +
      (rsvp.note ?
        '<p class="rsvp__note" dir="auto">' + escapeHtml(rsvp.note) + '</p>' : '') +
      actions +
      ics +
      '</div>' +
      '</section>';
  }

  function buildFooterHTML(data) {
    var footer = data.footer || {};

    var contacts = '';
    var list = data.contacts || [];
    for (var i = 0; i < list.length && i < 3; i += 1) {
      var contact = list[i] || {};
      if (!contact.label && !contact.phone) continue;
      var telDigits = String(contact.phone || '').replace(/[^\d+]/g, '');
      contacts += '<a class="btn btn--small" href="' +
        (telDigits ? 'tel:' + escapeHtml(telDigits) : '#') + '">' +
        escapeHtml(contact.label || 'Call') + '</a>';
    }

    return '<section class="scene scene--curtain footer" aria-label="With love">' +
      '<div class="scene__inner stagger">' +
      (footer.thanks ?
        '<p class="footer__thanks" dir="auto">' +
        escapeHtml(footer.thanks) + '</p>' : '') +
      (footer.family ?
        '<p class="footer__family" dir="auto">' +
        escapeHtml(footer.family) + '</p>' : '') +
      (contacts ?
        '<div class="footer__actions">' + contacts + '</div>' : '') +
      '<div class="footer__actions">' +
      '<button class="btn" type="button" id="shareBtn">' +
      shareSvg() + ' Share Invitation' +
      '</button>' +
      '</div>' +
      (footer.closing ?
        '<p class="footer__closing">' + escapeHtml(footer.closing) + '</p>' : '') +
      '<div class="ornament" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '</section>';
  }

  function buildBodyHTML(data) {
    var musicSrc = (data.music && data.music.src) || '';

    return buildGateHTML(data) +
      '<canvas id="fx" aria-hidden="true"></canvas>' +
      '<main id="card">' +
      buildHeroHTML(data) +
      buildSalamHTML(data) +
      buildEventsHTML(data) +
      buildCountdownHTML(data) +
      buildVenueHTML(data) +
      buildStoryHTML(data) +
      buildGalleryHTML(data) +
      buildDuaHTML(data) +
      buildRsvpHTML(data) +
      buildFooterHTML(data) +
      '</main>' +
      '<audio id="bgm" loop preload="none"' +
      (musicSrc ? ' src="' + escapeHtml(musicSrc) + '"' : '') +
      '></audio>' +
      '<button id="muteBtn" class="mute" type="button" hidden ' +
      'aria-label="Mute music" aria-pressed="false">' + muteSvg() + '</button>' +
      '<div id="toast" class="toast" role="status" aria-live="polite"></div>';
  }

  /* ==========================================================
     5. CARD RUNTIME (runs INSIDE the exported card)

     IMPORTANT: this function is turned into text with toString()
     and executed inside the exported HTML. It MUST NOT reference
     anything outside its own body.
     ========================================================== */

  function cardRuntime(DATA) {
    var d = document;
    var $ = function (sel, ctx) { return (ctx || d).querySelector(sel); };
    var $$ = function (sel, ctx) {
      return Array.prototype.slice.call((ctx || d).querySelectorAll(sel));
    };
    var reduced = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---- Small helpers ---- */
    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function fmtTime(hhmm) {
      var m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || '').trim());
      if (!m) return '';
      var h = parseInt(m[1], 10);
      if (h > 23) return '';
      var suf = h >= 12 ? 'PM' : 'AM';
      var shown = h % 12; if (shown === 0) shown = 12;
      return shown + ':' + m[2] + ' ' + suf;
    }

    function fmtDateShort(iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
      if (!m) return '';
      var months = ['Jan','Feb','Mar','Apr','May','Jun',
        'Jul','Aug','Sep','Oct','Nov','Dec'];
      return parseInt(m[3], 10) + ' ' + months[parseInt(m[2], 10) - 1] +
        ' ' + m[1];
    }

    function fmtDateLong(iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
      if (!m) return '';
      var months = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      var days = ['Sunday','Monday','Tuesday','Wednesday',
        'Thursday','Friday','Saturday'];
      var dt = new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1,
        parseInt(m[3], 10)));
      return days[dt.getUTCDay()] + ', ' + parseInt(m[3], 10) + ' ' +
        months[parseInt(m[2], 10) - 1] + ' ' + m[1];
    }

    function instantIST(dateIso, timeHm) {
      var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateIso || '').trim());
      var tm = /^(\d{1,2}):(\d{2})/.exec(String(timeHm || '').trim());
      if (!dm || !tm) return null;
      var iso = dm[1] + '-' + dm[2] + '-' + dm[3] + 'T' +
        pad2(parseInt(tm[1], 10)) + ':' + pad2(parseInt(tm[2], 10)) +
        ':00+05:30';
      var t = Date.parse(iso);
      return isFinite(t) ? t : null;
    }

    /* ---- Toast + clipboard + share ---- */
    var toastNode = null;
    function showToast(message) {
      if (!toastNode) toastNode = $('#toast');
      if (!toastNode) return;
      toastNode.textContent = message;
      toastNode.classList.add('is-visible');
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(function () {
        toastNode.classList.remove('is-visible');
      }, 2600);
    }

    function legacyCopy(value) {
      try {
        var ta = d.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        d.body.appendChild(ta);
        ta.select();
        d.execCommand('copy');
        d.body.removeChild(ta);
        showToast('Link copied');
      } catch (e) {
        showToast('Copy this link: ' + value);
      }
    }

    function copyLink(value) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          showToast('Link copied');
        }, function () { legacyCopy(value); });
        return;
      }
      legacyCopy(value);
    }

    /* ---- .ics ---- */
    function icsDate(ms) {
      var dt = new Date(ms);
      return dt.getUTCFullYear() + pad2(dt.getUTCMonth() + 1) +
        pad2(dt.getUTCDate()) + 'T' +
        pad2(dt.getUTCHours()) + pad2(dt.getUTCMinutes()) +
        pad2(dt.getUTCSeconds()) + 'Z';
    }

    function icsEscape(value) {
      return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
    }

    function downloadIcs(event) {
      if (!event) return;
      var start = instantIST(event.date, event.time);
      if (start === null) {
        showToast('This event has no date yet');
        return;
      }
      var end = start + 2 * 60 * 60 * 1000;
      var couple = (DATA.person1 && DATA.person1.name ? DATA.person1.name : 'Nikah') +
        (DATA.person2 && DATA.person2.name ? ' & ' + DATA.person2.name : '');
      var location = [event.venue, event.address].filter(Boolean).join(', ');
      var description = [
        event.dress ? 'Dress code: ' + event.dress : '',
        event.note || ''
      ].filter(Boolean).join('\n\n');

      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Nikah Card//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@nikahcard',
        'DTSTAMP:' + icsDate(Date.now()),
        'DTSTART:' + icsDate(start),
        'DTEND:' + icsDate(end),
        'SUMMARY:' + icsEscape(event.name + ' — ' + couple),
        'LOCATION:' + icsEscape(location),
        'DESCRIPTION:' + icsEscape(description),
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      var blob = new Blob([lines.join('\r\n')],
        { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = d.createElement('a');
      link.href = url;
      link.download = (event.name || 'event').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') + '.ics';
      d.body.appendChild(link);
      link.click();
      d.body.removeChild(link);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      showToast('Calendar file downloaded');
    }

    /* ---- Guest greeting (?guest=Name) ---- */
    var guest = '';
    try {
      guest = (new URLSearchParams(window.location.search).get('guest') || '')
        .trim().slice(0, 60);
    } catch (e) { guest = ''; }
    if (guest) {
      $$('[data-guest-slot]').forEach(function (node) {
        node.textContent = 'Dear ' + guest + ',';
        node.hidden = false;
      });
    }

    /* ---- Gate ---- */
    var gate = $('#gate');
    var seal = $('#gateSeal');
    var audio = $('#bgm');
    var muteBtn = $('#muteBtn');
    var opened = false;

    function syncMute() {
      if (!audio || !muteBtn) return;
      var hasMusic = !!audio.getAttribute('src');
      muteBtn.hidden = !(opened && hasMusic);
      var muted = !!audio.muted;
      muteBtn.classList.toggle('is-muted', muted);
      muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      muteBtn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    }

    function openGate() {
      if (opened) return;
      opened = true;
      if (gate) gate.classList.add('is-opening');

      if (audio && audio.getAttribute('src')) {
        var p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }

      window.setTimeout(function () {
        if (gate) gate.classList.add('is-done');
        d.body.classList.remove('gate-closed');
        syncMute();

        window.setTimeout(function () {
          if (gate) {
            gate.hidden = true;
            gate.setAttribute('aria-hidden', 'true');
          }
          var hero = $('[data-scene-hero]');
          if (hero) hero.classList.add('is-in');
          window.dispatchEvent(new Event('nikah:gateopen'));
        }, 950);
      }, 1150);
    }

    if (seal) seal.addEventListener('click', openGate);
    if (muteBtn) muteBtn.addEventListener('click', function () {
      if (!audio) return;
      if (audio.paused && audio.getAttribute('src')) {
        var p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        audio.muted = false;
      } else {
        audio.muted = !audio.muted;
      }
      syncMute();
    });
    syncMute();

    /* ---- Petals canvas ---- */
    function initFX() {
      var canvas = $('#fx');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (reduced) { canvas.style.display = 'none'; return; }

      var MAX = 40;
      var colors = ['#f7dd9c', '#e8c07a', '#f3e6c6', '#d9a355'];
      var petals = [];
      var frame = 0;
      var running = true;
      var w = 0, h = 0, dpr = 1, last = 0;

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function makeParticle(spawnAnywhere) {
        var isDust = Math.random() < 0.4;
        return {
          x: Math.random() * w,
          y: spawnAnywhere ? Math.random() * h : -20 - Math.random() * 60,
          r: isDust ? 1 + Math.random() * 1.6 : 3 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: isDust ? 0.15 + Math.random() * 0.3 : 0.5 + Math.random() * 0.9,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.05,
          sway: 0.4 + Math.random() * 1.2,
          phase: Math.random() * Math.PI * 2,
          alpha: isDust ? 0.5 + Math.random() * 0.4 : 0.55 + Math.random() * 0.4,
          dust: isDust,
          color: isDust ? '#f7dd9c' : colors[Math.floor(Math.random() * colors.length)]
        };
      }

      function seed() {
        petals = [];
        var n = Math.min(MAX, 26);
        for (var i = 0; i < n; i += 1) petals.push(makeParticle(true));
      }

      function draw(ts) {
        if (!running) return;
        var delta = last ? Math.min(ts - last, 48) : 16;
        last = ts;
        var secs = ts / 1000;
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < petals.length; i += 1) {
          var p = petals[i];
          p.x += p.vx + Math.sin(secs * p.sway + p.phase) * 0.35;
          p.y += p.vy * (delta / 16);
          p.rot += p.spin;
          if (p.y > h + 30 || p.x < -40 || p.x > w + 40) {
            petals[i] = makeParticle(false);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          if (p.dust) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.58, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        frame = window.requestAnimationFrame(draw);
      }

      function start() {
        if (running) return;
        running = true;
        last = 0;
        frame = window.requestAnimationFrame(draw);
      }

      function stop() {
        running = false;
        if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
      }

      resize();
      seed();
      frame = window.requestAnimationFrame(draw);

      window.addEventListener('resize', resize);
      d.addEventListener('visibilitychange', function () {
        if (d.hidden) stop(); else start();
      });
    }

    /* ---- Scroll scenes ---- */
    function initScenes() {
      var scenes = $$('.scene');
      var heroScene = $('[data-scene-hero]');

      if (!('IntersectionObserver' in window)) {
        scenes.forEach(function (s) { s.classList.add('is-in'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      scenes.forEach(function (scene) {
        if (scene === heroScene) return;
        observer.observe(scene);
      });

      if (heroScene) {
        if (!d.body.classList.contains('gate-closed')) {
          heroScene.classList.add('is-in');
        } else {
          window.addEventListener('nikah:gateopen', function () {
            heroScene.classList.add('is-in');
          }, { once: true });
        }
      }
    }

    /* ---- Timeline line draw + hero parallax ---- */
    var tlScheduled = false;
    function updateTimeline() {
      var tl = $('#timelineEl');
      if (tl) {
        var r = tl.getBoundingClientRect();
        var vh = window.innerHeight || 0;
        if (r.height) {
          var progress = (vh * 0.85 - r.top) / r.height;
          progress = Math.max(0, Math.min(1, progress));
          tl.style.setProperty('--draw', progress.toFixed(3));
        }
      }
      var skyline = $('.hero__skyline');
      if (skyline && !reduced) {
        var shift = Math.min(window.pageYOffset * 0.05, 40);
        skyline.style.setProperty('--skyline-shift', shift.toFixed(1));
      }
      tlScheduled = false;
    }

    window.addEventListener('scroll', function () {
      if (tlScheduled) return;
      tlScheduled = true;
      window.requestAnimationFrame(updateTimeline);
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (tlScheduled) return;
      tlScheduled = true;
      window.requestAnimationFrame(updateTimeline);
    }, { passive: true });

    /* ---- Countdown ---- */
    var countdownTimer = null;

    function makeDigits(container, count) {
      container.textContent = '';
      var tiles = [];
      for (var i = 0; i < count; i += 1) {
        var tile = d.createElement('span');
        tile.className = 'digit';
        var face = d.createElement('span');
        face.className = 'digit__face';
        face.textContent = '0';
        tile.appendChild(face);
        container.appendChild(tile);
        tiles.push({ tile: tile, face: face });
      }
      return tiles;
    }

    function writeDigits(tiles, value) {
      for (var i = 0; i < tiles.length; i += 1) {
        var ch = value.charAt(i) || '0';
        if (tiles[i].face.textContent === ch) continue;
        tiles[i].face.textContent = ch;
        tiles[i].tile.classList.remove('is-flip');
        void tiles[i].tile.offsetWidth;
        tiles[i].tile.classList.add('is-flip');
      }
    }

    function initCountdown() {
      var clock = $('#clockEl');
      var done = $('#countdownDone');
      var target = $('#countdownTarget');
      if (!clock || !done || !target) return;

      var mainEvent = null;
      var list = DATA.events || [];
      for (var i = 0; i < list.length; i += 1) {
        if (list[i].isMain) { mainEvent = list[i]; break; }
      }
      if (!mainEvent && list.length) mainEvent = list[0];

      if (!mainEvent) {
        clock.hidden = true;
        done.hidden = false;
        done.textContent = 'The celebrations are being planned';
        return;
      }

      var targetMs = instantIST(mainEvent.date, mainEvent.time);
      if (targetMs === null) {
        clock.hidden = true;
        done.hidden = false;
        done.textContent = 'The celebrations are being planned';
        target.textContent = mainEvent.name || '';
        return;
      }

      var labelBits = [mainEvent.name || 'Event'];
      var longDate = fmtDateLong(mainEvent.date);
      if (longDate) labelBits.push(longDate);
      var timeLabel = fmtTime(mainEvent.time);
      if (timeLabel) labelBits.push(timeLabel + ' IST');
      target.textContent = labelBits.join(' · ');

      var daysContainer = clock.querySelector('[data-unit="days"]');
      var hrsContainer = clock.querySelector('[data-unit="hours"]');
      var minsContainer = clock.querySelector('[data-unit="minutes"]');
      var secsContainer = clock.querySelector('[data-unit="seconds"]');
      if (!daysContainer || !hrsContainer || !minsContainer || !secsContainer) return;

      var dayLen = Math.max(2, String(Math.max(0,
        Math.floor((targetMs - Date.now()) / 86400000))).length);
      var tiles = {
        d: makeDigits(daysContainer, dayLen),
        h: makeDigits(hrsContainer, 2),
        m: makeDigits(minsContainer, 2),
        s: makeDigits(secsContainer, 2)
      };

      function tick() {
        var remaining = targetMs - Date.now();
        if (remaining <= 0) {
          clock.hidden = true;
          done.hidden = false;
          done.textContent = 'The celebrations have begun';
          if (countdownTimer) { window.clearInterval(countdownTimer); countdownTimer = null; }
          return;
        }
        var totalSecs = Math.floor(remaining / 1000);
        var days = Math.floor(totalSecs / 86400);
        var hours = Math.floor((totalSecs % 86400) / 3600);
        var mins = Math.floor((totalSecs % 3600) / 60);
        var secs = totalSecs % 60;
        writeDigits(tiles.d, String(days).padStart(tiles.d.length, '0'));
        writeDigits(tiles.h, pad2(hours));
        writeDigits(tiles.m, pad2(mins));
        writeDigits(tiles.s, pad2(secs));
        clock.setAttribute('aria-label', days + ' days, ' + hours +
          ' hours, ' + mins + ' minutes and ' + secs + ' seconds to ' +
          (mainEvent.name || 'the event'));
      }

      tick();
      countdownTimer = window.setInterval(tick, 1000);
    }

    /* ---- Event card flip + tilt ---- */
    function initEventCards() {
      var cards = $$('.event-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var flipped = card.classList.toggle('is-flipped');
          card.setAttribute('aria-expanded', flipped ? 'true' : 'false');
        });
        card.addEventListener('pointermove', function (e) {
          if (reduced || e.pointerType !== 'mouse') return;
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5;
          var y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
        });
        card.addEventListener('pointerleave', function () {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }

    /* ---- Venue tabs ---- */
    function initVenueTabs() {
      var tabs = $$('.venue__tab');
      if (!tabs.length) return;
      var panels = $$('.venue__panel');

      function activate(index, focus) {
        tabs.forEach(function (tab, i) {
          tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
          tab.tabIndex = i === index ? 0 : -1;
        });
        panels.forEach(function (panel, i) {
          panel.hidden = i !== index;
        });
        if (focus && tabs[index]) tabs[index].focus();
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { activate(index, false); });
        tab.addEventListener('keydown', function (e) {
          var key = e.key;
          if (key === 'ArrowRight' || key === 'ArrowDown') {
            e.preventDefault();
            activate((index + 1) % tabs.length, true);
          } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
            e.preventDefault();
            activate((index - 1 + tabs.length) % tabs.length, true);
          } else if (key === 'Home') {
            e.preventDefault(); activate(0, true);
          } else if (key === 'End') {
            e.preventDefault(); activate(tabs.length - 1, true);
          }
        });
      });
    }

    /* ---- .ics buttons ---- */
    function initIcsButtons() {
      $$('[data-ics-index]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var index = parseInt(btn.getAttribute('data-ics-index'), 10);
          var list = DATA.events || [];
          if (list[index]) downloadIcs(list[index]);
        });
      });
    }

    /* ---- Share button ---- */
    function initShare() {
      var btn = $('#shareBtn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var url = window.location.href;
        var title = 'Nikah Invitation' +
          (DATA.person1 && DATA.person1.name ? ' — ' + DATA.person1.name : '') +
          (DATA.person2 && DATA.person2.name ? ' & ' + DATA.person2.name : '');
        if (navigator.share) {
          navigator.share({
            title: title,
            text: 'You are warmly invited to our Nikah.',
            url: url
          }).catch(function (err) {
            if (err && err.name === 'AbortError') return;
            copyLink(url);
          });
          return;
        }
        copyLink(url);
      });
    }

    /* ---- Kick off ---- */
    try { initFX(); } catch (e) { /* ignore */ }
    try { initScenes(); } catch (e) { /* ignore */ }
    try { initCountdown(); } catch (e) { /* ignore */ }
    try { initEventCards(); } catch (e) { /* ignore */ }
    try { initVenueTabs(); } catch (e) { /* ignore */ }
    try { initIcsButtons(); } catch (e) { /* ignore */ }
    try { initShare(); } catch (e) { /* ignore */ }
    updateTimeline();

    // Safety net: if the gate somehow stalls, never lock the guest out.
    window.setTimeout(function () {
      if (!d.body.classList.contains('gate-closed')) return;
      d.body.classList.remove('gate-closed');
      if (gate) {
        gate.classList.add('is-done');
        gate.hidden = true;
        gate.setAttribute('aria-hidden', 'true');
      }
      var hero = $('[data-scene-hero]');
      if (hero) hero.classList.add('is-in');
      syncMute();
    }, 15000);
  }

  /* ==========================================================
     6. buildCardHTML — public API used by builder.js
     ========================================================== */

  function buildCardHTML(data, cssText) {
    var safeJson = JSON.stringify(data || {}).replace(/</g, '\\u003c');
    var theme = (data && data.theme) || 'emerald';
    var body = buildBodyHTML(data || {});

    var name1 = (data && data.person1 && data.person1.name) || 'Wedding';
    var name2 = (data && data.person2 && data.person2.name) || 'Nikah';

    var runtimeSource = '(' + cardRuntime.toString() + ')(' + safeJson + ');';

    var fonts =
      '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' +
      'family=Reem+Kufi:wght@400;500;600&' +
      'family=Amiri:ital,wght@0,400;0,700;1,400&' +
      'family=Noto+Nastaliq+Urdu:wght@400;500&' +
      'family=Great+Vibes&' +
      'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" />';

    return '<!DOCTYPE html>\n' +
      '<html lang="en" data-theme="' + escapeHtml(theme) + '">\n' +
      '<head>\n' +
      '<meta charset="utf-8" />\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n' +
      '<meta name="theme-color" content="#04211c" />\n' +
      '<meta name="description" content="Nikah invitation of ' +
        escapeHtml(name1) + ' & ' + escapeHtml(name2) + '" />\n' +
      '<title>' + escapeHtml(name1) + ' & ' + escapeHtml(name2) +
        ' \u2014 Nikah Invitation</title>\n' +
      fonts + '\n' +
      '<style>\n' + String(cssText || '') + '\n</style>\n' +
      '</head>\n' +
      '<body class="gate-closed">\n' +
      body + '\n' +
      '<script>\n' + runtimeSource + '\n<\/script>\n' +
      '</body>\n' +
      '</html>';
  }

  /* ==========================================================
     7. EXPOSE THE PUBLIC API
     builder.js uses exactly these two things.
     ========================================================== */

  window.DEFAULT_CARD = DEFAULT_CARD;
  window.buildCardHTML = buildCardHTML;
})();
