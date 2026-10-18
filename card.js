// card.js — default data, HTML escaping, and the standalone card HTML builder.
// Exposes: window.CARD_LOADED_DATA, window.DEFAULT_CARD, window.escapeHtml, window.buildCardHTML.
window.CARD_LOADED_DATA = true;

// ---------- HTML escape ----------
window.escapeHtml = function (s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// ---------- Default card data ----------
window.DEFAULT_CARD = {
  theme: "gulabi",
  seal: "M & S",

  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  bismillahSub: "In the name of Allah, the Most Gracious, the Most Merciful",
  salam: "Assalamu Alaikum wa Rahmatullahi wa Barakatuhu",

  ayah: {
    show: true,
    text: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    translation: "And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them, and He placed between you love and mercy.",
    reference: "Surah Ar-Rum 30:21"
  },

  inviteEn: "With the grace of Allah and the blessings of our elders, we cordially invite you and your family to join us in celebrating the Nikah of our beloved children.",
  inviteRoman: "Allah ki rehmat aur buzurgon ki duaon ke saath, hum aapko apne aziz bachon ke Nikah ki khushi mein tashreef laane ki dawat dete hain.",
  host: "Family Name & family",

  person1: {
    name: "Groom Name",
    sub: "Son of Mr. & Mrs. ____"
  },
  person2: {
    name: "Bride Name",
    sub: "Daughter of Mr. & Mrs. ____"
  },

  events: [
    {
      name: "Mehndi",
      date: "2026-11-20",
      time: "19:00",
      venue: "Family Residence",
      address: "123 Rose Lane, Hyderabad, Telangana",
      mapLink: "",
      dress: "Vibrant yellows and greens",
      note: "An evening of henna, music and laughter.",
      isMain: false
    },
    {
      name: "Haldi",
      date: "2026-11-21",
      time: "11:00",
      venue: "Family Residence",
      address: "123 Rose Lane, Hyderabad, Telangana",
      mapLink: "",
      dress: "Bright yellows and florals",
      note: "A morning of turmeric blessings.",
      isMain: false
    },
    {
      name: "Nikah",
      date: "2026-11-22",
      time: "17:30",
      venue: "Jama Masjid",
      address: "456 Old City Road, Hyderabad, Telangana",
      mapLink: "",
      dress: "Traditional formal",
      note: "The sacred ceremony, followed by Walima dinner.",
      isMain: true
    },
    {
      name: "Walima",
      date: "2026-11-23",
      time: "19:30",
      venue: "Gulistan Banquet Hall",
      address: "789 Garden Street, Hyderabad, Telangana",
      mapLink: "",
      dress: "Formal sherwani and gowns",
      note: "A reception to celebrate with loved ones.",
      isMain: false
    }
  ],

  story: {
    show: true,
    title: "Our Story",
    text: "Two hearts brought together by the mercy of Allah, and the love of our families. Our journey began with a simple introduction, grew through conversations and shared dreams, and continues today with gratitude and hope for a blessed life together, Insha'Allah."
  },

  gallery: [],

  dua: {
    show: true,
    text: "بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    translation: "May Allah bless you both, shower His blessings upon you, and unite you in goodness."
  },

  music: "",

  rsvp: {
    show: true,
    whatsapp: "91XXXXXXXXXX",
    note: "Please confirm your tashreef by ____"
  },

  contacts: [],

  footer: {
    thanks: "Aapki tashreef aur dua hamari khushiyon ko mukammal karegi, Insha'Allah.",
    family: "Aapke muntazir: ____ & family",
    closing: "Jazakumullahu Khairan"
  },

  heroImage: "",
  couplePhoto: "",
  floralFrame: "",
  envelopeImage: "",

  videoOpening: "",
  videoMain: "",
  videoFinale: ""
};

// ---------- Helpers used by buildCardHTML ----------
function text(v) { return window.escapeHtml(v); }
function urlOrHash(u) {
  if (!u) return "";
  var s = String(u).trim();
  if (s.indexOf("data:image/") === 0) return text(s);
  if (/^https?:\/\//i.test(s)) return text(s);
  return "";
}
function safeMapLink(ev) {
  if (ev && ev.mapLink && /^https:\/\//i.test(String(ev.mapLink).trim())) {
    return String(ev.mapLink).trim();
  }
  var q = ((ev && ev.venue) ? ev.venue : "") + " " + ((ev && ev.address) ? ev.address : "");
  q = q.trim();
  if (!q) return "";
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}
function formatDateHuman(dstr) {
  if (!dstr) return "";
  var parts = String(dstr).split("-");
  if (parts.length !== 3) return dstr;
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  var d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dstr;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var dt = new Date(Date.UTC(y, m - 1, d));
  var dayName = days[dt.getUTCDay()];
  var monName = months[dt.getUTCMonth()];
  return dayName + ", " + d + " " + monName + " " + y;
}
function formatTimeHuman(t) {
  if (!t) return "";
  var parts = String(t).split(":");
  if (parts.length < 2) return t;
  var hh = parseInt(parts[0], 10);
  var mm = parseInt(parts[1], 10);
  if (isNaN(hh) || isNaN(mm)) return t;
  var ampm = hh >= 12 ? "PM" : "AM";
  var h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  var mmStr = mm < 10 ? "0" + mm : "" + mm;
  return h12 + ":" + mmStr + " " + ampm;
}
function findMain(events) {
  if (!events || !events.length) return null;
  for (var i = 0; i < events.length; i++) {
    if (events[i].isMain) return events[i];
  }
  return events[0];
}

// ---------- Build the standalone card HTML ----------
window.buildCardHTML = function (data) {
  var D = data || window.DEFAULT_CARD;
  var events = (D.events && D.events.length) ? D.events : [];
  var mainEv = findMain(events);
  var theme = D.theme || "gulabi";

  var safeJSON = JSON.stringify(D).replace(/</g, "\\u003c");

  // ---------- CSS ----------
  var css = (window.CARD_CSS || "").toString();

  // ---------- Arrival markup ----------
  var arrivalHTML =
    '<div id="arrival" data-theme-inner="1">' +
      '<div class="arrival-top">' +
        '<p>An invitation has arrived</p>' +
        '<div class="ping" aria-hidden="true"></div>' +
      '</div>' +
      '<div id="envelope">' +
        '<div class="env-body">' +
          '<div class="env-face">' +
            '<div class="env-to"><small>To</small><span dir="auto">Dear guests and family</span></div>' +
            '<div class="env-from" dir="auto">From: ' + text(D.host || "") + '</div>' +
          '</div>' +
          '<div class="flap" aria-hidden="true"></div>' +
          '<div id="seal" role="button" tabindex="0" aria-label="Open the invitation">' +
            '<span class="seal-initials">' + text(D.seal || "M & S") + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="hintTap">Tap the seal to open</div>' +
    '</div>';

  // ---------- Corridor markup ----------
  var arch0 =
    '<div class="arch" data-i="0">' +
      '<div class="floral tl" aria-hidden="true"></div>' +
      '<div class="floral tr" aria-hidden="true"></div>' +
      '<div class="floral bl" aria-hidden="true"></div>' +
      '<div class="floral br" aria-hidden="true"></div>' +
      '<div class="arch-content">' +
        '<div class="bismillah" dir="rtl">' + text(D.bismillah || "") + '</div>' +
        '<div class="bismillah-sub" dir="auto">' + text(D.bismillahSub || "") + '</div>' +
        '<div class="salam" dir="auto">' + text(D.salam || "") + '</div>' +
      '</div>' +
    '</div>';

  var arch1 =
    '<div class="arch" data-i="1">' +
      '<div class="floral tl" aria-hidden="true"></div>' +
      '<div class="floral tr" aria-hidden="true"></div>' +
      '<div class="floral bl" aria-hidden="true"></div>' +
      '<div class="floral br" aria-hidden="true"></div>' +
      '<div class="arch-content">' +
        '<div class="names">' +
          '<span class="ink-reveal"><span dir="auto">' + text(D.person1 && D.person1.name) + '</span></span>' +
          '<span class="amp">and</span>' +
          '<span class="ink-reveal"><span dir="auto">' + text(D.person2 && D.person2.name) + '</span></span>' +
        '</div>' +
        '<div class="sub-names" dir="auto">' + text(D.person1 && D.person1.sub) + '</div>' +
        '<div class="sub-names" dir="auto">' + text(D.person2 && D.person2.sub) + '</div>' +
      '</div>' +
    '</div>';

  var coupleImg = urlOrHash(D.couplePhoto);
  var arch2 =
    '<div class="arch" data-i="2">' +
      '<div class="floral tl" aria-hidden="true"></div>' +
      '<div class="floral tr" aria-hidden="true"></div>' +
      '<div class="floral bl" aria-hidden="true"></div>' +
      '<div class="floral br" aria-hidden="true"></div>' +
      '<div class="arch-content">' +
        (coupleImg ? '<div class="couple-frame"><img src="' + coupleImg + '" alt="Couple photo"></div>' : '') +
        '<div class="date-block">' +
          '<strong>' + text(mainEv ? formatDateHuman(mainEv.date) : "") + '</strong>' +
          text(mainEv ? formatTimeHuman(mainEv.time) : "") +
        '</div>' +
      '</div>' +
    '</div>';

  var arch3 =
    '<div class="arch" data-i="3">' +
      '<div class="floral tl" aria-hidden="true"></div>' +
      '<div class="floral tr" aria-hidden="true"></div>' +
      '<div class="floral bl" aria-hidden="true"></div>' +
      '<div class="floral br" aria-hidden="true"></div>' +
      '<div class="arch-content">' +
        '<div class="inv-text" dir="auto">' + text(D.inviteEn || "") + '</div>' +
        '<div class="inv-text roman" dir="auto">' + text(D.inviteRoman || "") + '</div>' +
        '<div class="host-line" dir="auto">' + text(D.host || "") + '</div>' +
      '</div>' +
    '</div>';

  var arch4 = "";
  if (D.ayah && D.ayah.show) {
    arch4 =
      '<div class="arch" data-i="4">' +
        '<div class="floral tl" aria-hidden="true"></div>' +
        '<div class="floral tr" aria-hidden="true"></div>' +
        '<div class="floral bl" aria-hidden="true"></div>' +
        '<div class="floral br" aria-hidden="true"></div>' +
        '<div class="arch-content">' +
          '<div class="ayah-ar" dir="rtl">' + text(D.ayah.text || "") + '</div>' +
          '<div class="ayah-tr" dir="auto">' + text(D.ayah.translation || "") + '</div>' +
          '<div class="ayah-ref">' + text(D.ayah.reference || "") + '</div>' +
        '</div>' +
      '</div>';
  }

  // Floral frame override.
  var floralImg = urlOrHash(D.floralFrame);
  if (floralImg) {
    var imgCSS = '<div class="floral img tl" style="background-image:url(&quot;' + floralImg + '&quot;)" aria-hidden="true"></div>' +
                 '<div class="floral img tr" style="background-image:url(&quot;' + floralImg + '&quot;)" aria-hidden="true"></div>' +
                 '<div class="floral img bl" style="background-image:url(&quot;' + floralImg + '&quot;)" aria-hidden="true"></div>' +
                 '<div class="floral img br" style="background-image:url(&quot;' + floralImg + '&quot;)" aria-hidden="true"></div>';
    arch0 = arch0.replace(/<div class="floral [^"]*"[^>]*><\/div>/g, "");
    arch0 = arch0.replace('<div class="arch-content">', imgCSS + '<div class="arch-content">');
  }

  var corridorHTML =
    '<section id="stage" aria-label="Invitation corridor">' +
      '<div id="stageInner">' +
        arch0 + arch1 + arch2 + arch3 + arch4 +
      '</div>' +
    '</section>';

  // ---------- Scratch markup ----------
  var mainDateTxt = mainEv ? formatDateHuman(mainEv.date) : "";
  var mainTimeTxt = mainEv ? formatTimeHuman(mainEv.time) : "";
  var scratchHTML =
    '<section id="scratchWrap" aria-label="Scratch to reveal">' +
      '<div class="scratch-heading">A little surprise</div>' +
      '<div class="scratch-sub">Scratch to reveal</div>' +
      '<div style="position:relative;width:min(340px,88vw);height:min(420px,110vw);margin:0 auto">' +
        '<div id="scratchContent">' +
          '<div class="you">You are invited</div>' +
          '<div class="invited">to the Nikah</div>' +
          '<div class="dt">' +
            '<strong dir="auto">' + text(mainDateTxt) + '</strong>' +
            '<span dir="auto">' + text(mainTimeTxt) + '</span>' +
          '</div>' +
        '</div>' +
        '<canvas id="scratchCanvas" aria-label="Scratch to reveal the invitation" role="button"></canvas>' +
      '</div>' +
      '<button type="button" id="revealBtn">Reveal</button>' +
    '</section>';

  // ---------- Programme markup ----------
  var progCards = "";
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var mapsUrl = safeMapLink(ev);
    progCards +=
      '<div class="ev-card' + (ev.isMain ? " main" : "") + '">' +
        '<div class="ev-inner">' +
          '<div class="front" role="button" tabindex="0" aria-label="Flip ' + text(ev.name) + ' card">' +
            '<div class="ev-name" dir="auto">' + text(ev.name) + '</div>' +
            '<div class="ev-meta">' +
              '<strong>' + text(formatDateHuman(ev.date)) + '</strong>' +
              (ev.time ? ' &middot; ' + text(formatTimeHuman(ev.time)) : '') +
            '</div>' +
            '<span class="ev-tap">Tap for details</span>' +
          '</div>' +
          '<div class="back">' +
            '<div class="ev-venue" dir="auto">' + text(ev.venue) + '</div>' +
            (ev.address ? '<div class="ev-detail"><strong>Address</strong>' + text(ev.address) + '</div>' : '') +
            (ev.dress ? '<div class="ev-detail"><strong>Dress code</strong>' + text(ev.dress) + '</div>' : '') +
            (ev.note ? '<div class="ev-detail"><strong>Note</strong>' + text(ev.note) + '</div>' : '') +
            (mapsUrl ? '<div class="ev-detail" style="margin-top:8px"><a class="venue-btn gold" href="' + text(mapsUrl) + '" target="_blank" rel="noopener">Open in Maps</a></div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var programmeHTML =
    '<section id="programme" aria-label="Programme">' +
      '<h2 class="prog-title">The Programme</h2>' +
      '<p class="prog-sub">A sequence of celebrations</p>' +
      '<div class="timeline">' + progCards + '</div>' +
    '</section>';

  // ---------- Countdown ----------
  var mainName = mainEv ? mainEv.name : "";
  var countdownHTML =
    '<section id="countdown" aria-label="Countdown">' +
      '<h2 class="cd-title">Counting the days</h2>' +
      '<p class="cd-sub">' + text(mainName ? mainName + " · " + formatDateHuman(mainEv.date) : "") + '</p>' +
      '<div class="cd-grid" aria-live="polite">' +
        '<div class="cd-cell"><span class="cd-num" data-unit="days">00</span><span class="cd-label">Days</span></div>' +
        '<div class="cd-cell"><span class="cd-num" data-unit="hours">00</span><span class="cd-label">Hours</span></div>' +
        '<div class="cd-cell"><span class="cd-num" data-unit="minutes">00</span><span class="cd-label">Minutes</span></div>' +
        '<div class="cd-cell"><span class="cd-num" data-unit="seconds">00</span><span class="cd-label">Seconds</span></div>' +
      '</div>' +
      '<div class="cd-begun" style="display:none">The celebrations have begun<small>Alhamdulillah</small></div>' +
    '</section>';

  // ---------- Venue ----------
  var venueEvents = [];
  for (var v = 0; v < events.length; v++) {
    if (events[v].address || events[v].venue) venueEvents.push(events[v]);
  }
  var venueTabs = "";
  var venueCards = "";
  for (var vi = 0; vi < venueEvents.length; vi++) {
    var vev = venueEvents[vi];
    var vMaps = safeMapLink(vev);
    venueTabs += '<button type="button" class="venue-tab' + (vi === 0 ? " active" : "") + '">' + text(vev.name) + '</button>';
    venueCards +=
      '<div class="venue-card" style="display:' + (vi === 0 ? "" : "none") + '">' +
        '<div class="v-name" dir="auto">' + text(vev.name) + '</div>' +
        '<div class="v-addr" dir="auto">' + text(vev.address || vev.venue) + '</div>' +
        (vev.dress ? '<div class="v-dress">' + text(vev.dress) + '</div>' : '') +
        '<div class="venue-actions">' +
          (vMaps ? '<a class="venue-btn" href="' + text(vMaps) + '" target="_blank" rel="noopener">Open in Maps</a>' : '') +
          (vMaps ? '<a class="venue-btn gold" href="' + text(vMaps) + '" target="_blank" rel="noopener">Get Directions</a>' : '') +
        '</div>' +
      '</div>';
  }
  var venueHTML = "";
  if (venueEvents.length) {
    venueHTML =
      '<section id="venue" aria-label="Venue">' +
        '<h2 class="venue-title">The Venue</h2>' +
        '<p class="venue-sub">Where we celebrate</p>' +
        '<div class="venue-tabs">' + venueTabs + '</div>' +
        venueCards +
      '</section>';
  }

  // ---------- Story ----------
  var storyHTML = "";
  if (D.story && D.story.show) {
    storyHTML =
      '<section id="story" aria-label="Our story">' +
        '<h2 class="story-title" dir="auto">' + text(D.story.title || "Our Story") + '</h2>' +
        '<p class="story-sub">A beginning</p>' +
        '<p class="story-text" dir="auto">' + text(D.story.text || "") + '</p>' +
      '</section>';
  }

  // ---------- Gallery ----------
  var galleryHTML = "";
  if (D.gallery && D.gallery.length) {
    var pols = "";
    var dots = "";
    for (var gi = 0; gi < D.gallery.length; gi++) {
      var src = urlOrHash(D.gallery[gi]);
      if (!src) continue;
      var cls = gi < 5 ? "p" + gi : "";
      pols += '<div class="polaroid ' + cls + '"><img src="' + src + '" alt="Gallery photo ' + (gi + 1) + '"><div class="pol-caption">' + text(D.person1 && D.person1.name) + ' &amp; ' + text(D.person2 && D.person2.name) + '</div></div>';
      dots += '<span class="gallery-dot' + (gi === 0 ? " on" : "") + '"></span>';
    }
    if (pols) {
      galleryHTML =
        '<section id="gallery" aria-label="Gallery">' +
          '<h2 class="gallery-title">Moments</h2>' +
          '<p class="gallery-sub">Swipe through memories</p>' +
          '<div class="gallery-stack">' + pols + '</div>' +
          '<div class="gallery-dots">' + dots + '</div>' +
          '<p class="gallery-hint">Tap or swipe</p>' +
        '</section>';
    }
  }

  // ---------- Dua ----------
  var duaHTML = "";
  if (D.dua && D.dua.show) {
    duaHTML =
      '<section id="dua" aria-label="Dua">' +
        '<div class="dua-ornament" aria-hidden="true"></div>' +
        '<div class="dua-ar" dir="rtl">' + text(D.dua.text || "") + '</div>' +
        '<div class="dua-tr" dir="auto">' + text(D.dua.translation || "") + '</div>' +
      '</section>';
  }

  // ---------- RSVP ----------
  var rsvpHTML = "";
  if (D.rsvp && D.rsvp.show) {
    var calBtns = "";
    for (var ci = 0; ci < events.length; ci++) {
      calBtns +=
        '<button type="button" class="cal-btn" data-ev="' + text(events[ci].name) + '">' +
          '<span class="cal-name">' + text(events[ci].name) + ' &middot; ' + text(formatDateHuman(events[ci].date)) + '</span>' +
          '<span class="cal-plus" aria-hidden="true">+</span>' +
        '</button>';
    }
    rsvpHTML =
      '<section id="rsvp" aria-label="RSVP">' +
        '<h2 class="rsvp-title">RSVP</h2>' +
        '<p class="rsvp-sub">Your presence is a blessing</p>' +
        (D.rsvp.note ? '<p class="rsvp-note" dir="auto">' + text(D.rsvp.note) + '</p>' : '') +
        '<div class="rsvp-actions">' +
          '<a class="rsvp-wa" id="rsvpBtn" href="#" target="_blank" rel="noopener" aria-label="RSVP on WhatsApp">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 2.9 17.4L2 22l4.7-1.2A11 11 0 0 0 20.5 3.5zm-8.5 17a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.8.7.8-2.7-.2-.3A9 9 0 1 1 12 20.5z"/></svg>' +
            ' RSVP on WhatsApp' +
          '</a>' +
        '</div>' +
        '<div class="cal-list">' + calBtns + '</div>' +
      '</section>';
  }

  // ---------- Finale ----------
  var finaleHTML =
    '<section id="finale" aria-label="Thank you">' +
      '<h2 class="fin-title">JazakAllah</h2>' +
      '<p class="fin-thanks" dir="auto">' + text(D.footer && D.footer.thanks) + '</p>' +
      '<div class="fin-ornament" aria-hidden="true"></div>' +
      '<p class="fin-family" dir="auto">' + text(D.footer && D.footer.family) + '</p>' +
      '<p class="fin-closing">' + text(D.footer && D.footer.closing) + '</p>' +
      '<button type="button" id="shareBtn">Share</button>' +
    '</section>';

  // ---------- Assemble ----------
  return '<!DOCTYPE html>\n' +
    '<html lang="en" data-theme="' + text(theme) + '">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">\n' +
    '<meta name="theme-color" content="#3A1426">\n' +
    '<title>' + text((D.person1 && D.person1.name) || "") + ' &amp; ' + text((D.person2 && D.person2.name) || "") + ' — Nikah Invitation</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&family=Reem+Kufi:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
    '<style>\n' + css + '\n</style>\n' +
    '</head>\n' +
    '<body>\n' +
    arrivalHTML +
    '<main>\n' +
    corridorHTML +
    scratchHTML +
    programmeHTML +
    countdownHTML +
    venueHTML +
    storyHTML +
    galleryHTML +
    duaHTML +
    rsvpHTML +
    finaleHTML +
    '</main>\n' +
    '<canvas id="fx" aria-hidden="true"></canvas>\n' +
    '<script>\n' +
    'window.CARD_CSS = ' + JSON.stringify(css) + ';\n' +
    '(' + window.cardRuntimeCore.toString() + ')(' + safeJSON + ');\n' +
    '(' + window.cardRuntimeScenes.toString() + ')(' + safeJSON + ');\n' +
    '<\/script>\n' +
    '</body>\n' +
    '</html>';
};

// END OF FILE card.js
