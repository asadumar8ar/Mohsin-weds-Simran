/* card.js — default data, schema, escapeHtml, and buildCardHTML(). */
"use strict";
(function () {
  window.CARD_LOADED_DATA = true;

  /* ============================================================
     DEFAULT DATA
     ============================================================ */
  window.DEFAULT_CARD = {
    theme: "gulabi",
    seal: "M & S",
    bismillah: {
      ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      en: "In the name of Allah, the Most Gracious, the Most Merciful"
    },
    salam: "Assalamu Alaikum wa Rahmatullahi wa Barakatuhu",
    ayah: {
      show: true,
      ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
      en: "And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them, and He placed between you love and mercy.",
      ref: "Surah Ar-Rum 30:21"
    },
    inviteEn: "With the grace of Allah and the blessings of our elders, we cordially invite you and your family to join us in celebrating the Nikah of our beloved children.",
    inviteRoman: "Allah ki rehmat aur buzurgon ki duaon ke saath, hum aapko apne aziz bachon ke Nikah ki khushi mein tashreef laane ki dawat dete hain.",
    host: "Family Name & family",
    person1: { name: "Groom Name", sub: "Son of Mr. & Mrs. ____" },
    person2: { name: "Bride Name", sub: "Daughter of Mr. & Mrs. ____" },
    events: [
      { name: "Mehndi", date: "2026-02-10", time: "18:00", venue: "", address: "", mapLink: "", dress: "", note: "", isMain: false },
      { name: "Haldi", date: "2026-02-11", time: "11:00", venue: "", address: "", mapLink: "", dress: "", note: "", isMain: false },
      { name: "Nikah", date: "2026-02-12", time: "17:00", venue: "", address: "", mapLink: "", dress: "", note: "", isMain: true },
      { name: "Walima", date: "2026-02-13", time: "19:00", venue: "", address: "", mapLink: "", dress: "", note: "", isMain: false }
    ],
    story: {
      show: true,
      title: "Our Story",
      text: "Write your story here."
    },
    gallery: [],
    dua: {
      show: true,
      ar: "بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
      en: "May Allah bless you both, shower His blessings upon you, and unite you in goodness."
    },
    music: { src: "" },
    images: { hero: "", couple: "", floral: "", envelope: "" },
    videos: { opening: "", main: "", finale: "" },
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
    }
  };

  /* ============================================================
     SCHEMA (drives builder.js)
     ============================================================ */
  window.CARD_SCHEMA = [
    /* ---------- Basic ---------- */
    { tab: "Basic", path: "seal", label: "Seal initials", type: "text", hint: "Shown on the wax seal, e.g. M & S" },
    { tab: "Basic", path: "bismillah.ar", label: "Bismillah (Arabic)", type: "text", hint: "Do not change the Arabic letters" },
    { tab: "Basic", path: "bismillah.en", label: "Bismillah (English)", type: "text" },
    { tab: "Basic", path: "salam", label: "Salam greeting", type: "text" },
    { tab: "Basic", path: "person1.name", label: "First person's name", type: "text" },
    { tab: "Basic", path: "person1.sub", label: "First person's description", type: "text" },
    { tab: "Basic", path: "person2.name", label: "Second person's name", type: "text" },
    { tab: "Basic", path: "person2.sub", label: "Second person's description", type: "text" },
    { tab: "Basic", path: "host", label: "Host line", type: "text", hint: "Family name & family" },
    { tab: "Basic", path: "inviteEn", label: "Invitation (English)", type: "textarea" },
    { tab: "Basic", path: "inviteRoman", label: "Invitation (Roman Urdu)", type: "textarea" },
    { tab: "Basic", path: "ayah.show", label: "Show the ayah", type: "checkbox" },
    { tab: "Basic", path: "ayah.ar", label: "Ayah (Arabic)", type: "text" },
    { tab: "Basic", path: "ayah.en", label: "Ayah (English)", type: "textarea" },
    { tab: "Basic", path: "ayah.ref", label: "Ayah reference", type: "text" },

    /* ---------- Events ---------- */
    { tab: "Events", path: "events", label: "Events", type: "list",
      itemLabel: "name",
      fields: [
        { key: "name", label: "Event name", type: "text" },
        { key: "date", label: "Date", type: "date" },
        { key: "time", label: "Time", type: "time" },
        { key: "venue", label: "Venue", type: "text" },
        { key: "address", label: "Address", type: "textarea" },
        { key: "mapLink", label: "Map link", type: "text", hint: "https://… (optional)" },
        { key: "dress", label: "Dress code", type: "text" },
        { key: "note", label: "Note", type: "textarea" }
      ]
    },

    /* ---------- Story & photos ---------- */
    { tab: "Story and Photos", path: "story.show", label: "Show our story", type: "checkbox" },
    { tab: "Story and Photos", path: "story.title", label: "Story title", type: "text" },
    { tab: "Story and Photos", path: "story.text", label: "Story text", type: "textarea" },
    { tab: "Story and Photos", path: "gallery", label: "Gallery photos", type: "imageList", hint: "Up to 8 photos. Each is resized to 1200px JPEG." },

    /* ---------- Music ---------- */
    { tab: "Music", path: "music.src", label: "Background music (mp3)", type: "audio", hint: "Plays only after the guest taps the seal." },

    /* ---------- Images and Video ---------- */
    { tab: "Images and Video", path: "images.hero", label: "Hero image", type: "image" },
    { tab: "Images and Video", path: "images.couple", label: "Couple photo", type: "image" },
    { tab: "Images and Video", path: "images.floral", label: "Floral corner", type: "image" },
    { tab: "Images and Video", path: "images.envelope", label: "Envelope image", type: "image" },
    { tab: "Images and Video", path: "videos.opening", label: "Opening background video", type: "text", hint: "mp4 or webm. Put the file next to index.html, or paste an https link." },
    { tab: "Images and Video", path: "videos.main", label: "Corridor background video", type: "text", hint: "mp4 or webm." },
    { tab: "Images and Video", path: "videos.finale", label: "Finale background video", type: "text", hint: "mp4 or webm." },

    /* ---------- Contacts and RSVP ---------- */
    { tab: "Contacts and RSVP", path: "rsvp.show", label: "Show RSVP section", type: "checkbox" },
    { tab: "Contacts and RSVP", path: "rsvp.whatsapp", label: "WhatsApp number", type: "text", hint: "Country code + number, no spaces. e.g. 919876543210" },
    { tab: "Contacts and RSVP", path: "rsvp.note", label: "RSVP note", type: "textarea" },
    { tab: "Contacts and RSVP", path: "contacts", label: "Contacts", type: "list",
      itemLabel: "label",
      fields: [
        { key: "label", label: "Label", type: "text", hint: "e.g. Groom's father" },
        { key: "phone", label: "Phone", type: "text" }
      ],
      hint: "Up to 3 contacts."
    },
    { tab: "Contacts and RSVP", path: "dua.show", label: "Show dua section", type: "checkbox" },
    { tab: "Contacts and RSVP", path: "dua.ar", label: "Dua (Arabic)", type: "text" },
    { tab: "Contacts and RSVP", path: "dua.en", label: "Dua (English)", type: "textarea" },
    { tab: "Contacts and RSVP", path: "footer.thanks", label: "Finale thanks", type: "textarea" },
    { tab: "Contacts and RSVP", path: "footer.family", label: "Finale family line", type: "text" },
    { tab: "Contacts and RSVP", path: "footer.closing", label: "Finale closing", type: "text" },

    /* ---------- Theme ---------- */
    { tab: "Theme", path: "theme", label: "Colour theme", type: "select",
      options: [
        { value: "gulabi", label: "Gulabi — ivory, rose and plum" },
        { value: "emerald", label: "Emerald — ivory and deep emerald" },
        { value: "midnight", label: "Midnight — ivory and navy" },
        { value: "ivory-sage", label: "Ivory Sage — soft sage and ivory" }
      ]
    }
  ];

  /* ============================================================
     escapeHtml
     ============================================================ */
  window.escapeHtml = function (value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  /* ============================================================
     Helpers
     ============================================================ */
  function esc(v) { return window.escapeHtml(v); }
  function str(v) { return v == null ? "" : String(v); }

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function dayName(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return "";
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return names[d.getDay()];
  }
  function prettyDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }
  function prettyTime(t) {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return "";
    var h = parseInt(t.slice(0, 2), 10);
    var m = t.slice(3, 5);
    var ampm = h >= 12 ? "pm" : "am";
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ":" + m + " " + ampm;
  }
  function validVideoUrl(v) {
    var s = str(v).trim();
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
  }
  function safeImg(v) {
    var s = str(v).trim();
    if (!s) return "";
    if (/^\s*javascript:/i.test(s)) return "";
    return s;
  }
  function mainEvent(data) {
    var evs = data.events || [];
    for (var i = 0; i < evs.length; i++) if (evs[i] && evs[i].isMain) return evs[i];
    return evs.length ? evs[0] : null;
  }
  function contentSvgFloral() {
    /* Simple ornamental SVG petals, no external file needed. */
    return '<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">' +
      '<path d="M30 6 C36 14, 44 18, 30 26 C16 18, 24 14, 30 6 Z"/>' +
      '<path d="M54 30 C46 36, 42 44, 34 30 C42 16, 46 24, 54 30 Z"/>' +
      '<path d="M30 54 C24 46, 16 42, 30 34 C44 42, 36 46, 30 54 Z"/>' +
      '<path d="M6 30 C14 24, 18 16, 26 30 C18 44, 14 36, 6 30 Z"/>' +
      '<circle cx="30" cy="30" r="2" fill="currentColor" stroke="none"/>' +
      '</g></svg>';
  }
  function archFrameSvg() {
    return '<svg viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<linearGradient id="archg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="currentColor" stop-opacity="0.95"/>' +
      '<stop offset="1" stop-color="currentColor" stop-opacity="0.55"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<path d="M20 580 L20 200 Q20 20 200 20 Q380 20 380 200 L380 580" fill="none" stroke="url(#archg)" stroke-width="2"/>' +
      '<path d="M30 580 L30 205 Q30 30 200 30 Q370 30 370 205 L370 580" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.5"/>' +
      '<path d="M40 200 Q40 40 200 40 Q360 40 360 200" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>' +
      '</svg>';
  }

  /* ============================================================
     buildCardHTML
     ============================================================ */
  window.buildCardHTML = function (data) {
    data = data || window.DEFAULT_CARD;

    var theme = str(data.theme) || "gulabi";
    var seal = str(data.seal) || "M & S";
    var bismillah = data.bismillah || {};
    var ayah = data.ayah || {};
    var person1 = data.person1 || {};
    var person2 = data.person2 || {};
    var story = data.story || {};
    var dua = data.dua || {};
    var music = data.music || {};
    var images = data.images || {};
    var videos = data.videos || {};
    var rsvp = data.rsvp || {};
    var contacts = data.contacts || [];
    var footer = data.footer || {};
    var events = data.events || [];
    var gallery = data.gallery || [];

    var mainEv = mainEvent(data);
    var guestName = "Dear guests and family";

    var name1 = str(person1.name) || "Name";
    var name2 = str(person2.name) || "Name";
    var title = name1 + " & " + name2 + " - Wedding Invitation";

    /* Deep sections need the plum gradient; light sections follow. */
    var heroImg = safeImg(images.hero);
    var coupleImg = safeImg(images.couple);
    var floralImg = safeImg(images.floral);
    var envImg = safeImg(images.envelope);
    var heroBg = heroImg ? ' style="background-image:url(\'' + esc(heroImg).replace(/'/g, "%27") + '\');background-size:cover;background-position:center;"' : "";

    /* ---------- Arch 0: Bismillah + Salam ---------- */
    var arch0 = '' +
      '<div class="kicker">In the name of Allah</div>' +
      '<div class="bismillah-ar">' + esc(bismillah.ar || "") + '</div>' +
      '<div class="bismillah-en">' + esc(bismillah.en || "") + '</div>' +
      '<div class="salam">' + esc(data.salam || "") + '</div>';

    /* ---------- Arch 1: Names ---------- */
    var arch1 = '' +
      '<div class="name-wrap">' +
        '<div class="name" data-text="' + esc(name1) + '">' +
          '<span class="ink">' + esc(name1) + '</span>' +
          '<span class="pen" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="name-sub">' + esc(person1.sub || "") + '</div>' +
        '<div class="amp">and</div>' +
        '<div class="name" data-text="' + esc(name2) + '">' +
          '<span class="ink">' + esc(name2) + '</span>' +
          '<span class="pen" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="name-sub">' + esc(person2.sub || "") + '</div>' +
      '</div>';

    /* ---------- Arch 2: Date / couple ---------- */
    var dateIso = mainEv && mainEv.date ? str(mainEv.date) : "";
    var datePretty = dateIso ? prettyDate(dateIso) : "";
    var dateDay = dateIso ? dayName(dateIso) : "";
    var timePretty = mainEv && mainEv.time ? prettyTime(mainEv.time) : "";
    var arch2 = '';
    if (coupleImg) {
      arch2 += '<img class="couple-photo" src="' + esc(coupleImg) + '" alt="Couple photo" loading="lazy" decoding="async">';
    }
    if (datePretty) {
      arch2 += '<div class="big-date">' + esc(datePretty) + '</div>';
      if (dateDay) arch2 += '<div class="big-day">' + esc(dateDay) + (timePretty ? ' · ' + esc(timePretty) : '') + '</div>';
    } else {
      arch2 += '<div class="big-date">The Date</div><div class="big-day">Add an event in the builder</div>';
    }

    /* ---------- Arch 3: Invite ---------- */
    var arch3 = '' +
      '<div class="invite-en">' + esc(data.inviteEn || "") + '</div>' +
      '<div class="invite-roman">' + esc(data.inviteRoman || "") + '</div>' +
      '<div class="host-line">' + esc(data.host || "") + '</div>' +
      '<div class="host-label">hosted by</div>';

    /* ---------- Arch 4: Ayah ---------- */
    var arch4 = '';
    if (ayah.show) {
      arch4 = '' +
        '<div class="ayah-ar">' + esc(ayah.ar || "") + '</div>' +
        '<div class="ayah-en">' + esc(ayah.en || "") + '</div>' +
        '<div class="ayah-ref">' + esc(ayah.ref || "") + '</div>';
    }

    /* ---------- Envelope ---------- */
    var envBg = envImg ? '<img class="env-img" src="' + esc(envImg) + '" alt="" aria-hidden="true">' : '';

    /* ---------- Videos ---------- */
    function videoTag(slot, cfg) {
      var url = validVideoUrl(cfg);
      if (!url) return "";
      return '<video class="bgvideo" data-slot="' + esc(slot) + '" src="' + esc(url) + '" muted loop playsinline preload="none" aria-hidden="true"></video>';
    }
    var vOpen = videoTag("opening", videos.opening);
    var vMain = videoTag("main", videos.main);
    var vFinale = videoTag("finale", videos.finale);

    /* ---------- Programme ---------- */
    var programmeHTML = '';
    if (events.length) {
      var evHTML = '';
      for (var ei = 0; ei < events.length; ei++) {
        var ev = events[ei] || {};
        var eIso = str(ev.date);
        var eDate = eIso ? prettyDate(eIso) : "";
        var eDay = eIso ? dayName(eIso) : "";
        var eTime = prettyTime(str(ev.time));
        var mainTag = ev.isMain ? '<div class="ev-main-tag">main</div>' : '';
        var front = '' +
          mainTag +
          '<div class="ev-name">' + esc(ev.name || "Event") + '</div>' +
          '<div class="ev-when">' + esc(eDate) + (eDay ? ' · ' + esc(eDay) : '') + (eTime ? ' · ' + esc(eTime) : '') + '</div>' +
          '<div class="ev-flip-hint">tap for details</div>';
        var backRows = '';
        if (ev.venue) backRows += '<div class="ev-back-row"><strong>Venue:</strong> ' + esc(ev.venue) + '</div>';
        if (ev.address) backRows += '<div class="ev-back-row"><strong>Address:</strong> ' + esc(ev.address) + '</div>';
        if (ev.dress) backRows += '<div class="ev-back-row"><strong>Dress:</strong> ' + esc(ev.dress) + '</div>';
        if (ev.note) backRows += '<div class="ev-back-row"><strong>Note:</strong> ' + esc(ev.note) + '</div>';
        if (!backRows) backRows = '<div class="ev-back-row" style="opacity:.6">No extra details yet.</div>';
        var back = backRows + '<div class="ev-flip-hint">tap to return</div>';
        evHTML += '<div class="ev-card" tabindex="0" role="button" aria-label="' + esc((ev.name || 'Event') + '. Tap to flip.') + '">' +
          '<div class="front">' + front + '</div>' +
          '<div class="back">' + back + '</div>' +
        '</div>';
      }
      programmeHTML = '' +
        '<section class="light-section" id="programme" aria-labelledby="programmeTitle">' +
          '<div class="wrap">' +
            '<h2 class="section-title" id="programmeTitle">The Programme</h2>' +
            '<p class="section-sub">Tap any card for venue and dress details.</p>' +
            '<div class="timeline reveal">' + evHTML + '</div>' +
          '</div>' +
        '</section>';
    }

    /* ---------- Countdown ---------- */
    var countdownHTML = '';
    if (mainEv) {
      countdownHTML = '' +
        '<section class="light-section" id="countdown" aria-label="Countdown to the main event">' +
          '<div class="wrap">' +
            '<h2 class="section-title">Counting down</h2>' +
            '<p class="section-sub">Until the Nikah, Insha\u2019Allah.</p>' +
            '<div class="cd-grid reveal">' +
              '<div class="cd-cell"><span class="cd-num" data-unit="days">00</span><span class="cd-label">days</span></div>' +
              '<div class="cd-cell"><span class="cd-num" data-unit="hours">00</span><span class="cd-label">hours</span></div>' +
              '<div class="cd-cell"><span class="cd-num" data-unit="minutes">00</span><span class="cd-label">minutes</span></div>' +
              '<div class="cd-cell"><span class="cd-num" data-unit="seconds">00</span><span class="cd-label">seconds</span></div>' +
            '</div>' +
          '</div>' +
        '</section>';
    }

    /* ---------- Venue ---------- */
    var venueHTML = '';
    var evWithAddr = [];
    for (var va = 0; va < events.length; va++) {
      if (events[va] && (events[va].address || events[va].venue)) evWithAddr.push({ ev: events[va], idx: va });
    }
    if (evWithAddr.length) {
      var tabs = '';
      var panels = '';
      for (var vp = 0; vp < evWithAddr.length; vp++) {
        var ve = evWithAddr[vp].ev;
        var vIdx = evWithAddr[vp].idx;
        tabs += '<button type="button" class="tab' + (vp === 0 ? ' active' : '') + '" role="tab" aria-selected="' + (vp === 0 ? 'true' : 'false') + '" data-tab="' + vp + '">' + esc(ve.name || "Event") + '</button>';
        var mapUrl = '';
        if (ve.mapLink && /^https:\/\//i.test(ve.mapLink)) mapUrl = ve.mapLink;
        else if (ve.address) mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ve.address);
        else if (ve.venue) mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ve.venue);
        var vpMeta = '';
        if (ve.dress) vpMeta += 'Dress: ' + esc(ve.dress);
        if (ve.note) vpMeta += (vpMeta ? '<br>' : '') + esc(ve.note);
        panels += '' +
          '<div class="venue-panel" role="tabpanel" data-panel="' + vp + '"' + (vp === 0 ? '' : ' style="display:none"') + '>' +
            '<div class="vp-name">' + esc(ve.venue || ve.name || "Venue") + '</div>' +
            (ve.address ? '<div class="vp-addr">' + esc(ve.address) + '</div>' : '') +
            (vpMeta ? '<div class="vp-meta">' + vpMeta + '</div>' : '') +
            '<div class="vp-actions">' +
              (mapUrl ? '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener" class="primary">Open in Maps</a>' : '') +
              (mapUrl ? '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener">Get Directions</a>' : '') +
            '</div>' +
          '</div>';
      }
      venueHTML = '' +
        '<section class="light-section" id="venue" aria-labelledby="venueTitle">' +
          '<div class="wrap">' +
            '<h2 class="section-title" id="venueTitle">The Venue</h2>' +
            '<p class="section-sub">Where we will celebrate, Insha\u2019Allah.</p>' +
            '<div class="venue-tabs reveal" role="tablist">' + tabs + '</div>' +
            '<div class="venue-panels reveal">' + panels + '</div>' +
          '</div>' +
        '</section>';
    }

    /* ---------- Story ---------- */
    var storyHTML = '';
    if (story.show && str(story.text).trim()) {
      storyHTML = '' +
        '<section class="light-section" id="story" aria-labelledby="storyTitle">' +
          '<div class="wrap">' +
            '<h2 class="section-title" id="storyTitle">' + esc(story.title || "Our Story") + '</h2>' +
            '<p class="story-text reveal">' + esc(story.text) + '</p>' +
          '</div>' +
        '</section>';
    }

    /* ---------- Gallery ---------- */
    var galleryHTML = '';
    if (gallery.length) {
      var pols = '';
      for (var gi = 0; gi < gallery.length && gi < 8; gi++) {
        var gsrc = safeImg(gallery[gi]);
        if (!gsrc) continue;
        pols += '<div class="polaroid"><img src="' + esc(gsrc) + '" alt="Wedding photo ' + (gi + 1) + '" loading="lazy" decoding="async" draggable="false"><div class="pol-caption">Our moments</div></div>';
      }
      if (pols) {
        galleryHTML = '' +
          '<section class="light-section" id="gallery" aria-labelledby="galleryTitle">' +
            '<div class="wrap">' +
              '<h2 class="section-title" id="galleryTitle">Moments</h2>' +
              '<p class="section-sub">Swipe to browse.</p>' +
              '<div class="gallery-stack reveal" tabindex="0" aria-label="Photo gallery. Use arrow keys or swipe.">' + pols + '</div>' +
              '<p class="gallery-hint">Swipe or use arrow keys</p>' +
            '</div>' +
          '</section>';
      }
    }

    /* ---------- Dua ---------- */
    var duaHTML = '';
    if (dua.show && str(dua.ar).trim() && str(dua.en).trim()) {
      duaHTML = '' +
        '<section class="light-section" id="dua" aria-labelledby="duaTitle">' +
          '<div class="wrap">' +
            '<h2 class="section-title" id="duaTitle">A Dua for the Couple</h2>' +
            '<div class="dua-ar reveal" dir="rtl">' + esc(dua.ar) + '</div>' +
            '<p class="dua-en reveal">' + esc(dua.en) + '</p>' +
          '</div>' +
        '</section>';
    }

    /* ---------- RSVP ---------- */
    var rsvpHTML = '';
    if (rsvp.show) {
      var rsvpDigits = str(rsvp.whatsapp).replace(/\D/g, "");
      var calRow = '';
      if (events.length) {
        for (var ce = 0; ce < events.length; ce++) {
          var cev = events[ce];
          if (!cev || !cev.date) continue;
          calRow += '<button type="button" class="cal-btn" data-ev="' + ce + '" aria-label="Add ' + esc(cev.name || 'event') + ' to calendar">+ Add to calendar</button>';
        }
      }
      rsvpHTML = '' +
        '<section class="light-section" id="rsvp" aria-labelledby="rsvpTitle">' +
          '<div class="wrap">' +
            '<h2 class="section-title" id="rsvpTitle">RSVP</h2>' +
            (rsvp.note ? '<p class="rsvp-note reveal">' + esc(rsvp.note) + '</p>' : '') +
            '<div class="rsvp-actions reveal">' +
              (rsvpDigits ? '<a class="btn-card solid" id="rsvpBtn" href="https://wa.me/' + esc(rsvpDigits) + '" target="_blank" rel="noopener" role="button" aria-label="Reply on WhatsApp">Reply on WhatsApp</a>' : '') +
            '</div>' +
            (calRow ? '<div class="cal-row reveal">' + calRow + '</div>' : '') +
          '</div>' +
        '</section>';
    }

    /* ---------- Finale ---------- */
    var finaleHTML = '' +
      '<section id="finale" aria-label="Thank you">' +
        vFinale +
        '<div class="fin-crescent" aria-hidden="true">' +
          '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M30 8 A16 16 0 1 0 30 36 A12 12 0 1 1 30 8 Z"/></svg>' +
        '</div>' +
        '<div class="fin-thanks">' + esc(footer.thanks || "") + '</div>' +
        (footer.family ? '<div class="fin-family">' + esc(footer.family) + '</div>' : '') +
        (footer.closing ? '<div class="fin-closing">' + esc(footer.closing) + '</div>' : '') +
        '<button type="button" class="fin-share" id="shareBtn" aria-label="Share this invitation">Share this invitation</button>' +
        '<div class="fin-note">With love and duas</div>' +
      '</section>';

    /* ---------- Scratch content ---------- */
    var scratchDate = mainEv && mainEv.date ? prettyDate(mainEv.date) : "The wedding day";
    var scratchTime = mainEv && mainEv.time ? prettyTime(mainEv.time) : "";

    /* ---------- Montage ---------- */
    var html = '';
    html += '<!DOCTYPE html>';
    html += '<html lang="en" data-theme="' + esc(theme) + '">';
    html += '<head>';
    html += '<meta charset="utf-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
    html += '<meta name="theme-color" content="#2A0F1E">';
    html += '<title>' + esc(title) + '</title>';
    html += '<link rel="preconnect" href="https://fonts.googleapis.com">';
    html += '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
    html += '<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&family=Reem+Kufi:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">';
    html += '<style>' + window.CARD_CSS + '</style>';
    html += '</head>';
    html += '<body class="locked">';

    /* Arrival */
    html += '<div id="arrival" aria-label="Opening invitation">';
    html += vOpen;
    html += '<div id="arrivalLine">An invitation has arrived</div>';
    html += '<span class="ping" aria-hidden="true"></span>';
    html += '<div id="envelope" aria-label="Envelope">';
    html += envBg;
    html += '<div class="env-body" aria-hidden="true"></div>';
    html += '<div class="flap" aria-hidden="true"></div>';
    html += '<div class="env-face">';
    html += '<div class="env-to">To:</div>';
    html += '<div class="env-name"><span id="guestName">' + esc(guestName) + '</span></div>';
    html += '<div class="env-from">From: <span>' + esc(data.host || "") + '</span></div>';
    html += '</div>';
    html += '<button type="button" id="seal" aria-label="Open the invitation by tapping the seal">' + esc(seal) + '</button>';
    html += '</div>';
    html += '<div id="hintTap">Tap the seal to open</div>';
    html += '</div>';

    /* Corridor */
    html += '<section id="stage" aria-label="Invitation">';
    html += '<div id="stageInner">';
    html += vMain;
    html += '<div class="gold-bloom" aria-hidden="true"></div>';
    var archData = [arch0, arch1, arch2, arch3, arch4];
    for (var ai = 0; ai < archData.length; ai++) {
      if (ai === 4 && !ayah.show) continue;
      html += '<div class="arch" data-i="' + ai + '">';
      html += '<div class="arch-frame">' + archFrameSvg() + '</div>';
      html += '<div class="arch-content">' + archData[ai] + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</section>';

    /* Sweep */
    html += '<div class="sweep" aria-hidden="true"></div>';

    /* Scratch */
    html += '<section id="scratchWrap" aria-label="Scratch to reveal">';
    html += '<div class="scratch-panel">';
    html += '<canvas id="scratchCanvas" aria-label="Scratch here"></canvas>';
    html += '<div id="scratchContent">';
    html += '<div class="sc-kicker">You are invited</div>';
    html += '<div class="sc-line"></div>';
    html += '<div class="sc-date">' + esc(scratchDate) + '</div>';
    if (scratchTime) html += '<div class="sc-time">' + esc(scratchTime) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<button type="button" id="revealBtn" aria-label="Reveal invitation without scratching">Reveal invitation</button>';
    html += '</section>';

    /* Light sections */
    html += programmeHTML;
    html += countdownHTML;
    html += venueHTML;
    html += storyHTML;
    html += galleryHTML;
    html += duaHTML;
    html += rsvpHTML;

    /* Finale */
    html += finaleHTML;

    /* fx canvas */
    html += '<canvas id="fx" aria-hidden="true"></canvas>';

    /* Scripts (runtime injected via toString) */
    var safeJSON = JSON.stringify(data)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");

    html += '<script>';
    html += '(' + window.cardRuntimeCore.toString() + ')(' + safeJSON + ');';
    html += '(' + window.cardRuntimeScenes.toString() + ')(' + safeJSON + ');';
    html += '</' + 'script>';

    html += '</body>';
    html += '</html>';

    return html;
  };
})();
// END OF FILE card.js
