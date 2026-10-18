window.CARD_LOADED_DATA = true;

/* ==========================================================================
   SAFE HTML ESCAPE
   ========================================================================== */
window.escapeHtml = function (str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* ==========================================================================
   DEFAULT CARD DATA  (all editable by the builder)
   ========================================================================== */
window.DEFAULT_CARD = {
  theme: 'emerald',
  sealInitials: 'M & S',

  bismillah: {
    ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    sub: 'In the name of Allah, the Most Gracious, the Most Merciful'
  },

  salam: 'Assalamu Alaikum wa Rahmatullahi wa Barakatuhu',

  ayah: {
    show: true,
    ar: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation: 'And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them, and He placed between you love and mercy.',
    reference: 'Surah Ar-Rum 30:21'
  },

  inviteEn: 'With the grace of Allah and the blessings of our elders, we cordially invite you and your family to join us in celebrating the Nikah of our beloved children.',
  inviteRoman: 'Allah ki rehmat aur buzurgon ki duaon ke saath, hum aapko apne aziz bachon ke Nikah ki khushi mein tashreef laane ki dawat dete hain.',
  host: 'Family Name & family',

  person1: {
    name: 'Groom Name',
    sub: 'Son of Mr. & Mrs. ____'
  },
  person2: {
    name: 'Bride Name',
    sub: 'Daughter of Mr. & Mrs. ____'
  },

  events: [
    {
      name: 'Mehndi',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapLink: '',
      dress: '',
      note: '',
      isMain: false
    },
    {
      name: 'Haldi',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapLink: '',
      dress: '',
      note: '',
      isMain: false
    },
    {
      name: 'Nikah',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapLink: '',
      dress: '',
      note: '',
      isMain: true
    },
    {
      name: 'Walima',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapLink: '',
      dress: '',
      note: '',
      isMain: false
    }
  ],

  story: {
    show: true,
    title: 'Our Story',
    text: ''
  },

  gallery: [],

  dua: {
    show: true,
    ar: 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    translation: 'May Allah bless you both, shower His blessings upon you, and unite you in goodness.'
  },

  music: '',

  rsvp: {
    show: true,
    whatsapp: '91XXXXXXXXXX',
    note: 'Please confirm your tashreef by ____'
  },

  contacts: [
    { label: '', phone: '' }
  ],

  footer: {
    thanks: "Aapki tashreef aur dua hamari khushiyon ko mukammal karegi, Insha'Allah.",
    family: 'Aapke muntazir: ____ & family',
    closing: 'Jazakumullahu Khairan'
  }
};

/* ==========================================================================
   BUILD CARD HTML
   Returns a complete standalone HTML document string.
   Every user value is HTML-escaped. The runtime is injected via toString().
   ========================================================================== */
window.buildCardHTML = function (data) {
  var D = data || window.DEFAULT_CARD;
  var e = window.escapeHtml;

  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var formatDate = function (iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return String(iso);
    var y = parseInt(p[0], 10);
    var m = parseInt(p[1], 10) - 1;
    var d = parseInt(p[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 0 || m > 11) return String(iso);
    return d + ' ' + MONTHS[m] + ' ' + y;
  };

  var formatTime = function (hhmm) {
    if (!hhmm) return '';
    var p = String(hhmm).split(':');
    if (p.length < 2) return String(hhmm);
    var h = parseInt(p[0], 10);
    var m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m)) return String(hhmm);
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return hh + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  };

  var mapHref = function (link, addr) {
    var s = String(link || '').trim();
    if (/^https:\/\//i.test(s)) return s;
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(String(addr || ''));
  };

  var letterSpans = function (text, startIdx) {
    var s = String(text || '');
    var idx = startIdx || 0;
    var html = '';
    var i;
    for (i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var disp = ch === ' ' ? '&nbsp;' : e(ch);
      html += '<span class="hero-name-letter" style="--i:' + (idx++) + '">' + disp + '</span>';
    }
    return { html: html, next: idx };
  };

  var events = Array.isArray(D.events) ? D.events : [];
  var mainEvent = null;
  var mi;
  for (mi = 0; mi < events.length; mi++) {
    if (events[mi] && events[mi].isMain) { mainEvent = events[mi]; break; }
  }
  if (!mainEvent && events.length) mainEvent = events[0];

  /* ---------------- OPENING SCENE ---------------- */
  var sealInitials = String(D.sealInitials || '');

  var openingHtml =
    '<div class="opening" role="dialog" aria-label="Opening invitation">' +
      '<div class="opening-stars" aria-hidden="true"></div>' +
      '<div class="opening-moon" aria-hidden="true"></div>' +
      '<div class="fanoos" aria-hidden="true">' +
        '<div class="fanoos-chain"></div>' +
        '<div class="fanoos-body"><div class="fanoos-glow"></div></div>' +
      '</div>' +
      '<div class="envelope-wrap">' +
        '<div class="envelope">' +
          '<div class="envelope-back"></div>' +
          '<div class="envelope-front"></div>' +
          '<div class="envelope-flap"></div>' +
          '<button class="seal" type="button" aria-label="Open the invitation">' +
            '<span class="seal-initials">' + e(sealInitials) + '</span>' +
            '<span class="seal-crescent">&#9789;</span>' +
          '</button>' +
        '</div>' +
        '<p class="seal-tap">Tap the seal to open</p>' +
      '</div>' +
    '</div>';

  /* ---------------- HERO ---------------- */
  var p1 = D.person1 || {};
  var p2 = D.person2 || {};
  var ls1 = letterSpans(p1.name || '', 0);
  var ls2 = letterSpans(p2.name || '', ls1.next);

  var heroDate = '';
  if (mainEvent) {
    var hd = formatDate(mainEvent.date);
    var ht = formatTime(mainEvent.time);
    if (hd && ht) heroDate = hd + ' \u00B7 ' + ht;
    else if (hd) heroDate = hd;
    else if (ht) heroDate = ht;
  }

  var bismAr = e((D.bismillah && D.bismillah.ar) || '');
  var bismSub = e((D.bismillah && D.bismillah.sub) || '');

  var heroHtml =
    '<section class="scene hero" aria-label="Invitation hero">' +
      '<div class="fanoos-hero" aria-hidden="true">' +
        '<div class="fanoos-chain"></div>' +
        '<div class="fanoos-body"><div class="fanoos-glow"></div></div>' +
      '</div>' +
      '<div class="mosque-skyline" aria-hidden="true"></div>' +
      '<div class="hero-khatam" aria-hidden="true"></div>' +
      '<div class="hero-inner">' +
        '<p class="hero-bismillah-ar" dir="rtl">' + bismAr + '</p>' +
        '<p class="hero-bismillah-en">' + bismSub + '</p>' +
        '<h1 class="hero-names">' +
          '<span>' + ls1.html + '</span>' +
          '<span class="hero-amp">&amp;</span>' +
          '<span>' + ls2.html + '</span>' +
        '</h1>' +
        (heroDate ? '<p class="hero-date">' + e(heroDate) + '</p>' : '') +
      '</div>' +
    '</section>';

  /* ---------------- SALAM / AYAH / INVITATION ---------------- */
  var ayah = D.ayah || {};
  var ayahBlock = '';
  if (ayah.show) {
    ayahBlock =
      '<div class="ayah-box">' +
        (ayah.ar ? '<p class="ayah-arabic" dir="rtl">' + e(ayah.ar) + '</p>' : '') +
        (ayah.translation ? '<p class="ayah-translation">' + e(ayah.translation) + '</p>' : '') +
        (ayah.reference ? '<p class="ayah-ref">' + e(ayah.reference) + '</p>' : '') +
      '</div>';
  }

  var salamHtml =
    '<section class="scene salam-section reveal-arch" aria-label="Salam and invitation">' +
      '<div class="scene-inner stagger">' +
        (D.salam ? '<p class="salam-text">' + e(D.salam) + '</p>' : '') +
        ayahBlock +
        '<p class="guest-line" hidden></p>' +
        (D.inviteEn ? '<p class="invite-en">' + e(D.inviteEn) + '</p>' : '') +
        (D.inviteRoman ? '<p class="invite-roman">' + e(D.inviteRoman) + '</p>' : '') +
        (D.host ? '<p class="host-line">' + e(D.host) + '</p>' : '') +
        '<div class="divider"></div>' +
      '</div>' +
    '</section>';

  /* ---------------- EVENTS TIMELINE ---------------- */
  var eventsListHtml = '';
  events.forEach(function (ev, idx) {
    if (!ev) return;
    if (!ev.name && !ev.date && !ev.time && !ev.venue) return;

    eventsListHtml +=
      '<div class="event-row">' +
        '<div class="event-card" data-event-index="' + idx + '" role="button" tabindex="0" ' +
          'aria-label="' + e((ev.name || 'Event') + ' card. Tap to flip.') + '">' +
          '<div class="event-card-inner">' +
            '<div class="event-face event-face-front">' +
              '<div class="event-front-inner">' +
                '<h3 class="event-name">' + e(ev.name || '') + '</h3>' +
                (ev.date ? '<p class="event-date">' + e(formatDate(ev.date)) + '</p>' : '') +
                (ev.time ? '<p class="event-time">' + e(formatTime(ev.time)) + ' IST</p>' : '') +
                (ev.isMain ? '<span class="event-badge-main">Main Event</span>' : '') +
              '</div>' +
              '<span class="event-flip-hint">Tap</span>' +
            '</div>' +
            '<div class="event-face event-face-back">' +
              (ev.venue ? '<p class="event-back-line"><strong>Venue</strong>' + e(ev.venue) + '</p>' : '') +
              (ev.address ? '<p class="event-back-line"><strong>Address</strong>' + e(ev.address) + '</p>' : '') +
              (ev.dress ? '<p class="event-back-line"><strong>Dress Code</strong>' + e(ev.dress) + '</p>' : '') +
              (ev.note ? '<p class="event-back-line"><strong>Note</strong>' + e(ev.note) + '</p>' : '') +
              (!ev.venue && !ev.address && !ev.dress && !ev.note
                ? '<p class="event-back-line">Details coming soon.</p>'
                : '') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  });

  var eventsHtml = eventsListHtml
    ? '<section class="scene reveal-curtain" aria-label="Events timeline">' +
        '<div class="scene-inner">' +
          '<p class="section-title">Events</p>' +
          '<div class="events-timeline">' + eventsListHtml + '</div>' +
        '</div>' +
      '</section>'
    : '';

  /* ---------------- COUNTDOWN ---------------- */
  var countdownHtml = '';
  if (mainEvent && mainEvent.date) {
    var cdUnit = function (label) {
      return '<div class="countdown-unit">' +
        '<span class="countdown-flip">' +
          '<span class="countdown-digit">0</span>' +
          '<span class="countdown-digit">0</span>' +
        '</span>' +
        '<span class="countdown-caption">' + label + '</span>' +
      '</div>';
    };

    countdownHtml =
      '<section class="scene countdown-section reveal-moon" aria-label="Countdown to the main event">' +
        '<div class="scene-inner">' +
          '<p class="countdown-label">Counting down to</p>' +
          '<h2 class="countdown-event-name">' + e(mainEvent.name || 'The Celebration') + '</h2>' +
          '<div class="countdown-grid">' +
            cdUnit('Days') +
            cdUnit('Hours') +
            cdUnit('Minutes') +
            cdUnit('Seconds') +
          '</div>' +
          '<p class="countdown-done" hidden>The celebrations have begun</p>' +
          '<p class="countdown-target-date"></p>' +
        '</div>' +
      '</section>';
  }

  /* ---------------- VENUE ---------------- */
  var venueEvents = events.filter(function (ev) {
    return ev && ev.address && String(ev.address).trim();
  });

  var venueHtml = '';
  if (venueEvents.length) {
    var tabsHtml = '';
    var panelsHtml = '';
    venueEvents.forEach(function (ev, i) {
      tabsHtml +=
        '<button class="venue-tab' + (i === 0 ? ' active' : '') + '" type="button" role="tab" ' +
          'aria-selected="' + (i === 0 ? 'true' : 'false') + '" data-venue-index="' + i + '">' +
          e(ev.name || 'Event') +
        '</button>';

      var href = mapHref(ev.mapLink, ev.address);

      panelsHtml +=
        '<div class="venue-panel" data-venue-panel="' + i + '"' + (i === 0 ? '' : ' hidden') + '>' +
          (ev.name ? '<h3 class="venue-name">' + e(ev.name) + '</h3>' : '') +
          '<p class="venue-address">' + e(ev.address) + '</p>' +
          '<div class="venue-links">' +
            '<a class="btn-card" href="' + e(href) + '" target="_blank" rel="noopener noreferrer">Open in Maps</a>' +
            '<a class="btn-card" href="' + e(href) + '" target="_blank" rel="noopener noreferrer">Get Directions</a>' +
          '</div>' +
        '</div>';
    });

    venueHtml =
      '<section class="scene reveal-star" aria-label="Venue locations">' +
        '<div class="scene-inner">' +
          '<p class="section-title">Venue</p>' +
          '<div class="venue-tabs" role="tablist" aria-label="Choose a venue">' + tabsHtml + '</div>' +
          '<div class="venue-panels">' + panelsHtml + '</div>' +
        '</div>' +
      '</section>';
  }

  /* ---------------- STORY + GALLERY ---------------- */
  var story = D.story || {};
  var photos = Array.isArray(D.gallery) ? D.gallery : [];
  var storyHtml = '';

  if (story.show || photos.length) {
    var galleryHtml = '';
    if (photos.length) {
      var stackHtml = '';
      photos.slice(0, 8).forEach(function (src) {
        if (!src) return;
        stackHtml +=
          '<div class="gallery-card" role="button" tabindex="0" aria-label="Wedding photo">' +
            '<img src="' + e(src) + '" alt="Nikah celebration photo" loading="lazy">' +
          '</div>';
      });
      galleryHtml =
        '<div class="gallery-stack">' + stackHtml + '</div>' +
        '<p class="gallery-hint">Tap a photo to bring it forward</p>';
    }

    storyHtml =
      '<section class="scene reveal-arch" aria-label="Our story and photos">' +
        '<div class="scene-inner stagger">' +
          (story.show && story.title ? '<p class="section-title">' + e(story.title) + '</p>' : '') +
          (story.show && story.text ? '<p class="story-text">' + e(story.text) + '</p>' : '') +
          galleryHtml +
        '</div>' +
      '</section>';
  }

  /* ---------------- DUA ---------------- */
  var dua = D.dua || {};
  var duaHtml = '';
  if (dua.show) {
    duaHtml =
      '<section class="scene reveal-moon" aria-label="Dua for the couple">' +
        '<div class="scene-inner stagger">' +
          '<p class="section-title">Dua</p>' +
          (dua.ar ? '<p class="dua-arabic" dir="rtl">' + e(dua.ar) + '</p>' : '') +
          (dua.translation ? '<p class="dua-translation">' + e(dua.translation) + '</p>' : '') +
        '</div>' +
      '</section>';
  }

  /* ---------------- RSVP + CONTACTS ---------------- */
  var rsvp = D.rsvp || {};
  var contacts = Array.isArray(D.contacts) ? D.contacts : [];
  var contactItems = contacts.filter(function (c) {
    return c && (c.label || c.phone);
  }).slice(0, 3);

  var contactsHtml = '';
  if (contactItems.length) {
    var itemsHtml = '';
    contactItems.forEach(function (c) {
      var digits = String(c.phone || '').replace(/\D/g, '');
      var label = e(c.label || '');
      var phone = e(c.phone || '');
      var phoneHtml = digits
        ? '<a href="tel:' + e(digits) + '">' + phone + '</a>'
        : phone;
      itemsHtml += '<li>' + (label ? label + ': ' : '') + phoneHtml + '</li>';
    });
    contactsHtml = '<ul class="contact-list">' + itemsHtml + '</ul>';
  }

  var calendarBtns = '';
  events.forEach(function (ev, idx) {
    if (!ev || !ev.date) return;
    calendarBtns +=
      '<button class="btn-card rsvp-calendar" type="button" data-event-index="' + idx + '" ' +
        'aria-label="Add ' + e(ev.name || 'event') + ' to calendar">' +
        e('+ ' + (ev.name || 'Event')) +
      '</button>';
  });

  var rsvpHtml = '';
  if (rsvp.show) {
    var waNum = String(rsvp.whatsapp || '').replace(/\D/g, '');
    rsvpHtml =
      '<section class="scene reveal-curtain" aria-label="RSVP">' +
        '<div class="scene-inner stagger">' +
          '<p class="section-title">RSVP</p>' +
          (rsvp.note ? '<p class="rsvp-note">' + e(rsvp.note) + '</p>' : '') +
          '<div class="rsvp-actions">' +
            (waNum ? '<button class="btn-card btn-card-wa rsvp-whatsapp" type="button">Confirm on WhatsApp</button>' : '') +
          '</div>' +
          (calendarBtns ? '<div class="rsvp-calendar-list">' + calendarBtns + '</div>' : '') +
          contactsHtml +
        '</div>' +
      '</section>';
  }

  /* ---------------- FOOTER ---------------- */
  var footer = D.footer || {};
  var footerHtml =
    '<section class="scene footer-section reveal-star" aria-label="Footer">' +
      '<div class="scene-inner stagger">' +
        (footer.thanks ? '<p class="footer-thanks">' + e(footer.thanks) + '</p>' : '') +
        (footer.family ? '<p class="footer-family">' + e(footer.family) + '</p>' : '') +
        (footer.closing ? '<p class="footer-closing">' + e(footer.closing) + '</p>' : '') +
        '<button class="btn-card footer-share" type="button">Share</button>' +
      '</div>' +
    '</section>';

  /* ---------------- ASSEMBLE ---------------- */
  var theme = e(D.theme || 'emerald');
  var title = e((p1.name || 'Nikah') + ' & ' + (p2.name || '') + ' \u2014 Nikah Invitation');

  var safeJSON = JSON.stringify(D).replace(/</g, '\\u003c');
  var runtimeScript = '(' + window.cardRuntime.toString() + ')(' + safeJSON + ');';

  var html =
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + title + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Great+Vibes&family=Noto+Nastaliq+Urdu:wght@400;600&family=Reem+Kufi:wght@400;500;600;700&display=swap" rel="stylesheet">' +
      '<style>' + window.CARD_CSS + '</style>' +
    '</head>' +
    '<body class="nikah-body" data-theme="' + theme + '">' +
      openingHtml +
      '<main class="card-main">' +
        heroHtml +
        salamHtml +
        eventsHtml +
        countdownHtml +
        venueHtml +
        storyHtml +
        duaHtml +
        rsvpHtml +
        footerHtml +
      '</main>' +
      '<script>' + runtimeScript + '</script>' +
    '</body>' +
    '</html>';

  return html;
};
// END OF FILE card.js
