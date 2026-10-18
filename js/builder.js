/* ============================================================
   NIKAH CARD BUILDER — builder.js

   This file is the editor. It:
   - Loads card.css as text (used for the live preview AND the export).
   - Reads/writes the working card data.
   - Renders the editor panels (Basic, Events, Story and Photos,
     Music, Contacts and RSVP, Theme).
   - Shows the live card inside a sandboxed iframe.
   - Downloads a single standalone HTML file.
   - Autosaves text to localStorage and clears the draft after download.

   It uses only window.DEFAULT_CARD and window.buildCardHTML from
   card.js. It never imports anything else.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. CONSTANTS
     ========================================================== */

  var STORAGE_KEY = 'nikahCardDraft';

  var PHOTO_MAX_DIM = 1200;                // longest side in pixels
  var PHOTO_QUALITY = 0.75;                // JPEG quality
  var MUSIC_MAX_BYTES = 3 * 1024 * 1024;   // 3 MB
  var TOTAL_MAX_BYTES = 8 * 1024 * 1024;   // 8 MB
  var MAX_PHOTOS = 8;

  var PREVIEW_DEBOUNCE = 400;              // ms between last keystroke and preview
  var DRAFT_DEBOUNCE = 700;                // ms between last keystroke and draft save

  var TABS = [
    { id: 'basic',        label: 'Basic' },
    { id: 'events',       label: 'Events' },
    { id: 'story-photos', label: 'Story & Photos' },
    { id: 'music',        label: 'Music' },
    { id: 'contacts',     label: 'Contacts & RSVP' },
    { id: 'theme',        label: 'Theme' }
  ];

  var THEMES = [
    { id: 'emerald',    label: 'Emerald' },
    { id: 'midnight',   label: 'Midnight' },
    { id: 'ivory-sage', label: 'Ivory Sage' },
    { id: 'rose-gold',  label: 'Rose Gold' }
  ];

  /* ==========================================================
     2. STATE
     ========================================================== */

  var data = null;           // working copy of the card
  var cssText = '';          // contents of card.css, loaded once
  var previewTimer = 0;
  var draftTimer = 0;
  var firstPreviewShown = false;

  var els = {
    previewFrame: null,
    previewLoading: null,
    editorPanel: null,
    editorBody: null,
    editorTabs: null,
    editorClose: null,
    editorScrim: null,
    editFab: null,
    downloadBtn: null,
    resetBtn: null,
    editorStatus: null,
    toast: null
  };

  /* ==========================================================
     3. SMALL HELPERS
     ========================================================== */

  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) {
      node.textContent = String(textContent);
    }
    return node;
  }

  function str(value, fallback) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  function isObj(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value) {
    if (value === null || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (e) { /* fall through */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  // Deep merge used to layer a draft over DEFAULT_CARD.
  function deepMerge(base, extra) {
    if (!isObj(extra)) return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (isObj(value) && isObj(out[key])) {
        out[key] = deepMerge(out[key], value);
      } else if (Array.isArray(value)) {
        out[key] = value.slice();
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  // "Ahmed Khan" -> "ahmed-khan"
  function slug(value) {
    var out = String(value || 'card')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return out || 'card';
  }

  // Human friendly byte size: "1.4 MB" or "480 KB".
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Approximate the real byte size of a base64 data URL.
  function dataUrlBytes(url) {
    if (typeof url !== 'string' || url.indexOf('data:') !== 0) return 0;
    var comma = url.indexOf(',');
    if (comma < 0) return 0;
    return Math.floor((url.length - comma - 1) * 0.75);
  }

  /* ==========================================================
     4. TOAST + STATUS
     ========================================================== */

  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      els.toast.classList.remove('is-visible');
    }, 2600);
  }

  function setStatus(message, isError) {
    if (!els.editorStatus) return;
    els.editorStatus.textContent = message;
    els.editorStatus.classList.toggle('is-error', !!isError);
  }

  // Compute total media weight and show it in the footer status line.
  function updateMediaStatus() {
    var total = 0;
    (data.gallery || []).forEach(function (src) {
      total += dataUrlBytes(src);
    });
    if (data.music && data.music.src) {
      total += dataUrlBytes(data.music.src);
    }

    if (total > TOTAL_MAX_BYTES) {
      setStatus(
        '⚠ Media is ' + formatBytes(total) + ' (over 8 MB). Try removing a photo or a song.',
        true
      );
      return;
    }

    setStatus('Media: ' + formatBytes(total) + ' of 8 MB');
  }

  /* ==========================================================
     5. DRAFT SAVE / LOAD
     Only text survives a refresh. Photos and music stay in memory
     and are only embedded in the downloaded HTML.
     ========================================================== */

  function loadDraft() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function saveDraftNow() {
    if (!data) return;
    try {
      var draft = clone(data);
      draft.gallery = [];
      draft.music = {
        src: '',
        title: (data.music && data.music.title) || ''
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      // Full quota or private mode. Nothing to do.
    }
  }

  function scheduleDraftSave() {
    if (draftTimer) window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(function () {
      draftTimer = 0;
      saveDraftNow();
    }, DRAFT_DEBOUNCE);
  }

  function clearDraft() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* ignore */ }
  }

  /* ==========================================================
     6. PREVIEW
     Setting iframe.srcdoc re-parses the whole document, so we
     debounce it. A tiny injected script auto-opens the card in the
     preview only, so the editor does not replay the gate on every
     keystroke. The downloaded file does NOT get this script.
     ========================================================== */

  function buildPreviewHtml() {
    var html = window.buildCardHTML(data, cssText);
    var snippet =
      '<script>(function(){try{' +
      'var isParent=false;' +
      'try{isParent=!!(window.parent&&window.parent!==window);}catch(e){}' +
      'if(!isParent)return;' +
      'var b=document.body;' +
      'var g=document.getElementById("gate");' +
      'var h=document.querySelector("[data-scene-hero]");' +
      'if(b)b.classList.remove("gate-closed");' +
      'if(g){g.classList.add("is-done");g.hidden=true;g.setAttribute("aria-hidden","true");}' +
      'if(h)h.classList.add("is-in");' +
      'try{window.dispatchEvent(new Event("nikah:gateopen"));}catch(e){}' +
      '}catch(e){}})();<\/script>';
    return html.replace(/<\/body>/i, snippet + '</body>');
  }

  function renderPreviewNow() {
    if (!els.previewFrame || !window.buildCardHTML) return;
    try {
      var html = buildPreviewHtml();
      els.previewFrame.srcdoc = html;
      if (!firstPreviewShown) {
        firstPreviewShown = true;
        if (els.previewLoading) els.previewLoading.classList.add('is-hidden');
      }
    } catch (error) {
      if (window.console) window.console.warn('Preview failed:', error);
      if (els.previewLoading) {
        els.previewLoading.textContent = 'Preview could not be built.';
        els.previewLoading.classList.remove('is-hidden');
      }
    }
  }

  function schedulePreview() {
    if (previewTimer) window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(function () {
      previewTimer = 0;
      renderPreviewNow();
    }, PREVIEW_DEBOUNCE);
  }

  // Called by every field after a change.
  function touch() {
    updateMediaStatus();
    schedulePreview();
    scheduleDraftSave();
  }

  /* ==========================================================
     7. PHOTO PROCESSING
     ========================================================== */

  function resizePhoto(file) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();

      image.onload = function () {
        try {
          var width = image.naturalWidth || image.width;
          var height = image.naturalHeight || image.height;
          var longest = Math.max(width, height);
          if (longest > PHOTO_MAX_DIM) {
            var ratio = PHOTO_MAX_DIM / longest;
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          var result = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
          URL.revokeObjectURL(objectUrl);
          resolve(result);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not read that image.'));
      };

      image.src = objectUrl;
    });
  }

  /* ==========================================================
     8. FORM HELPERS
     ========================================================== */

  // A labelled input or textarea. Returns the input node so callers
  // can attach their own input listener.
  function field(parent, label, value, opts) {
    opts = opts || {};
    var type = typeof opts === 'string' ? opts : (opts.type || 'text');
    var multiline = opts.multiline === true || type === 'textarea';

    var wrap = document.createElement('label');
    wrap.className = 'ed-field';
    wrap.appendChild(el('span', 'ed-label', label));

    var input;
    if (multiline) {
      input = document.createElement('textarea');
      input.className = 'ed-textarea';
    } else {
      input = document.createElement('input');
      input.className = 'ed-input';
      input.type = type;
    }
    input.value = value === null || value === undefined ? '' : String(value);
    if (opts.placeholder) input.placeholder = opts.placeholder;

    wrap.appendChild(input);
    parent.appendChild(wrap);
    return input;
  }

  function checkRow(parent, label, checked, onChange) {
    var wrap = document.createElement('label');
    wrap.className = 'ed-check';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(' ' + label));
    input.addEventListener('change', function () { onChange(input.checked); });
    parent.appendChild(wrap);
    return input;
  }

  function edBtn(label, onClick, variant) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ed-btn' + (variant ? ' ed-btn--' + variant : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function fileBtn(label, accept, onFile) {
    var wrap = document.createElement('label');
    wrap.className = 'ed-btn ed-file';
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(' ' + label));
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (file) onFile(file);
    });
    return wrap;
  }

  /* ==========================================================
     9. PANELS
     ========================================================== */

  // ---- Basic tab ----
  function buildBasicPanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'basic');

    // Section: Opening
    panel.appendChild(el('p', 'ed-label', 'Opening seal'));
    var initials = field(
      panel, 'Seal initials (shown on the envelope)', data.sealInitials, 'text'
    );
    initials.placeholder = 'M & S';
    initials.addEventListener('input', function () {
      data.sealInitials = initials.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Bismillah
    panel.appendChild(el('p', 'ed-label', 'Bismillah'));
    var bArabic = field(panel, 'Arabic (exact)', data.bismillah.arabic, 'textarea');
    bArabic.setAttribute('dir', 'rtl');
    bArabic.setAttribute('lang', 'ar');
    bArabic.addEventListener('input', function () {
      data.bismillah.arabic = bArabic.value;
      touch();
    });
    var bSub = field(panel, 'English meaning', data.bismillah.sub, 'text');
    bSub.addEventListener('input', function () {
      data.bismillah.sub = bSub.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Salam + Ayah
    panel.appendChild(el('p', 'ed-label', 'Salam and ayah'));
    var salam = field(panel, 'Salam greeting', data.salam, 'text');
    salam.setAttribute('dir', 'rtl');
    salam.setAttribute('lang', 'ar');
    salam.addEventListener('input', function () {
      data.salam = salam.value;
      touch();
    });

    checkRow(panel, 'Show the ayah', data.ayah.show, function (checked) {
      data.ayah.show = checked;
      touch();
    });

    var ayahArabic = field(panel, 'Ayah — Arabic (exact)', data.ayah.arabic, 'textarea');
    ayahArabic.setAttribute('dir', 'rtl');
    ayahArabic.setAttribute('lang', 'ar');
    ayahArabic.addEventListener('input', function () {
      data.ayah.arabic = ayahArabic.value;
      touch();
    });

    var ayahTrans = field(panel, 'Ayah — English translation', data.ayah.translation, 'textarea');
    ayahTrans.addEventListener('input', function () {
      data.ayah.translation = ayahTrans.value;
      touch();
    });

    var ayahRef = field(panel, 'Ayah — reference', data.ayah.reference, 'text');
    ayahRef.addEventListener('input', function () {
      data.ayah.reference = ayahRef.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Invitation
    panel.appendChild(el('p', 'ed-label', 'Invitation text'));
    var inviteEn = field(panel, 'English invite', data.inviteEn, 'textarea');
    inviteEn.addEventListener('input', function () {
      data.inviteEn = inviteEn.value;
      touch();
    });
    var inviteRoman = field(panel, 'Roman (Hinglish) invite', data.inviteRoman, 'textarea');
    inviteRoman.addEventListener('input', function () {
      data.inviteRoman = inviteRoman.value;
      touch();
    });
    var host = field(panel, 'Host line', data.host, 'text');
    host.addEventListener('input', function () {
      data.host = host.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Couple
    panel.appendChild(el('p', 'ed-label', 'The couple'));
    var p1Name = field(panel, 'Person 1 — name', data.person1.name, 'text');
    p1Name.addEventListener('input', function () {
      data.person1.name = p1Name.value;
      touch();
    });
    var p1Sub = field(panel, 'Person 1 — subtitle', data.person1.sub, 'text');
    p1Sub.addEventListener('input', function () {
      data.person1.sub = p1Sub.value;
      touch();
    });
    var p2Name = field(panel, 'Person 2 — name', data.person2.name, 'text');
    p2Name.addEventListener('input', function () {
      data.person2.name = p2Name.value;
      touch();
    });
    var p2Sub = field(panel, 'Person 2 — subtitle', data.person2.sub, 'text');
    p2Sub.addEventListener('input', function () {
      data.person2.sub = p2Sub.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Dua
    panel.appendChild(el('p', 'ed-label', 'Dua for the couple'));
    checkRow(panel, 'Show the dua', data.dua.show, function (checked) {
      data.dua.show = checked;
      touch();
    });
    var duaArabic = field(panel, 'Dua — Arabic (exact)', data.dua.arabic, 'textarea');
    duaArabic.setAttribute('dir', 'rtl');
    duaArabic.setAttribute('lang', 'ar');
    duaArabic.addEventListener('input', function () {
      data.dua.arabic = duaArabic.value;
      touch();
    });
    var duaTrans = field(panel, 'Dua — English translation', data.dua.translation, 'textarea');
    duaTrans.addEventListener('input', function () {
      data.dua.translation = duaTrans.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    // Section: Footer
    panel.appendChild(el('p', 'ed-label', 'Footer'));
    var thanks = field(panel, 'Thanks text', data.footer.thanks, 'textarea');
    thanks.addEventListener('input', function () {
      data.footer.thanks = thanks.value;
      touch();
    });
    var family = field(panel, 'Family line', data.footer.family, 'text');
    family.addEventListener('input', function () {
      data.footer.family = family.value;
      touch();
    });
    var closing = field(panel, 'Closing line', data.footer.closing, 'text');
    closing.addEventListener('input', function () {
      data.footer.closing = closing.value;
      touch();
    });

    return panel;
  }

  // ---- One event editor ----
  function buildEventEditor(event, index) {
    var details = document.createElement('details');
    details.className = 'ed-event';
    if (index === 0) details.open = true;

    var summary = document.createElement('summary');
    var nameSpan = el('span', null, event.name || 'Event');
    summary.appendChild(nameSpan);
    if (event.isMain) summary.appendChild(el('span', 'ed-event__flag', 'Main'));
    details.appendChild(summary);

    var body = el('div', 'ed-event__body');

    var nameInput = field(body, 'Name', event.name, 'text');
    nameInput.addEventListener('input', function () {
      event.name = nameInput.value;
      nameSpan.textContent = nameInput.value || 'Event';
      touch();
    });

    var dateInput = field(body, 'Date', event.date, 'date');
    dateInput.addEventListener('input', function () {
      event.date = dateInput.value;
      touch();
    });

    var timeInput = field(body, 'Time (IST)', event.time, 'time');
    timeInput.addEventListener('input', function () {
      event.time = timeInput.value;
      touch();
    });

    var venueInput = field(body, 'Venue name', event.venue, 'text');
    venueInput.addEventListener('input', function () {
      event.venue = venueInput.value;
      touch();
    });

    var addressInput = field(body, 'Address', event.address, 'textarea');
    addressInput.addEventListener('input', function () {
      event.address = addressInput.value;
      touch();
    });

    var mapInput = field(body, 'Map link (https://…)', event.mapLink, 'url');
    mapInput.placeholder = 'https://maps.app.goo.gl/…';
    mapInput.addEventListener('input', function () {
      event.mapLink = mapInput.value;
      touch();
    });

    var dressInput = field(body, 'Dress code', event.dress, 'text');
    dressInput.addEventListener('input', function () {
      event.dress = dressInput.value;
      touch();
    });

    var noteInput = field(body, 'Note', event.note, 'textarea');
    noteInput.addEventListener('input', function () {
      event.note = noteInput.value;
      touch();
    });

    // Actions: up, down, set main, delete.
    var actions = el('div', 'ed-actions');

    var up = edBtn('↑ Up', function () {
      if (index === 0) return;
      var prev = data.events[index - 1];
      data.events[index - 1] = data.events[index];
      data.events[index] = prev;
      rebuildEventsPanel();
      touch();
    });
    up.disabled = index === 0;

    var down = edBtn('↓ Down', function () {
      if (index === data.events.length - 1) return;
      var next = data.events[index + 1];
      data.events[index + 1] = data.events[index];
      data.events[index] = next;
      rebuildEventsPanel();
      touch();
    });
    down.disabled = index === data.events.length - 1;

    var main = edBtn(event.isMain ? '★ Main event' : 'Set as main', function () {
      data.events.forEach(function (candidate, position) {
        candidate.isMain = (position === index);
      });
      rebuildEventsPanel();
      touch();
    });
    main.disabled = !!event.isMain;

    var remove = edBtn('Delete', function () {
      data.events.splice(index, 1);
      if (data.events.length && !data.events.some(function (e) {
        return e.isMain;
      })) {
        data.events[0].isMain = true;
      }
      rebuildEventsPanel();
      touch();
    }, 'danger');

    actions.appendChild(up);
    actions.appendChild(down);
    actions.appendChild(main);
    actions.appendChild(remove);
    body.appendChild(actions);

    details.appendChild(body);
    return details;
  }

  // ---- Events tab ----
  function buildEventsPanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'events');
    panel.hidden = true;

    if (!data.events.length) {
      panel.appendChild(el('div', 'ed-empty', 'No events yet. Add one below.'));
    }

    data.events.forEach(function (event, index) {
      panel.appendChild(buildEventEditor(event, index));
    });

    var add = edBtn('+ Add Event', function () {
      data.events.push({
        name: 'New Event',
        date: '',
        time: '',
        venue: '',
        address: '',
        mapLink: '',
        dress: '',
        note: '',
        isMain: !data.events.some(function (candidate) {
          return candidate.isMain;
        })
      });
      rebuildEventsPanel();
      touch();
    }, 'gold');
    add.classList.add('ed-btn--wide');
    panel.appendChild(add);

    return panel;
  }

  function rebuildEventsPanel() {
    var old = document.querySelector('[data-panel="events"]');
    if (!old) return;
    var wasHidden = old.hidden;
    var fresh = buildEventsPanel();
    fresh.hidden = wasHidden;
    old.replaceWith(fresh);
  }

  // ---- Story and Photos tab ----
  function buildStoryPhotosPanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'story-photos');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Our Story'));

    checkRow(panel, 'Show "Our Story" section', data.story.show, function (checked) {
      data.story.show = checked;
      touch();
    });

    var storyTitle = field(panel, 'Story title', data.story.title, 'text');
    storyTitle.addEventListener('input', function () {
      data.story.title = storyTitle.value;
      touch();
    });

    var storyText = field(panel, 'Story text', data.story.text, 'textarea');
    storyText.addEventListener('input', function () {
      data.story.text = storyText.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));

    panel.appendChild(el('p', 'ed-label', 'Photos (up to 8)'));

    var thumbs = el('div', 'ed-thumbs');
    panel.appendChild(thumbs);

    var upload = fileBtn('Add photos', 'image/*', function (file) {
      if (data.gallery.length >= MAX_PHOTOS) {
        toast('You already have 8 photos.');
        return;
      }
      resizePhoto(file).then(function (dataUrl) {
        if (data.gallery.length >= MAX_PHOTOS) return;
        data.gallery.push(dataUrl);
        rebuildThumbs();
        touch();
      }).catch(function (error) {
        toast('Could not read that image.');
        if (window.console) window.console.warn(error);
      });
    });
    panel.appendChild(upload);

    function rebuildThumbs() {
      thumbs.textContent = '';
      if (!data.gallery.length) {
        thumbs.appendChild(el('p', 'ed-media-name', 'No photos yet.'));
        return;
      }
      data.gallery.forEach(function (src, index) {
        var tile = el('div', 'ed-thumb');
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Photo ' + (index + 1);
        img.loading = 'lazy';
        tile.appendChild(img);

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', 'Remove photo ' + (index + 1));
        removeBtn.addEventListener('click', function () {
          data.gallery.splice(index, 1);
          rebuildThumbs();
          touch();
        });
        tile.appendChild(removeBtn);
        thumbs.appendChild(tile);
      });
    }

    rebuildThumbs();
    return panel;
  }

  // ---- Music tab ----
  function buildMusicPanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'music');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Background sound'));
    panel.appendChild(el(
      'p',
      'ed-help',
      'Nasheed or soft background sound (optional). Starts only after the guest taps the seal.'
    ));

    var titleInput = field(panel, 'Title (optional)', data.music.title, 'text');
    titleInput.addEventListener('input', function () {
      data.music.title = titleInput.value;
      touch();
    });

    var statusEl = el(
      'p',
      'ed-media-name',
      data.music.src ? 'Music loaded.' : 'No music yet.'
    );

    var upload = fileBtn('Upload mp3', 'audio/mpeg,audio/mp3,audio/*', function (file) {
      if (file.size > MUSIC_MAX_BYTES) {
        statusEl.textContent =
          'File is ' + formatBytes(file.size) +
          ' (over 3 MB). Please choose a smaller file.';
        statusEl.className = 'ed-warn';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        data.music.src = String(reader.result || '');
        statusEl.textContent = 'Music loaded (' + file.name + ').';
        statusEl.className = 'ed-media-name';
        rebuildActions();
        touch();
      };
      reader.onerror = function () {
        statusEl.textContent = 'Could not read that file.';
        statusEl.className = 'ed-warn';
      };
      reader.readAsDataURL(file);
    });
    panel.appendChild(upload);

    var actionsRow = el('div', 'ed-actions');
    panel.appendChild(actionsRow);

    function rebuildActions() {
      actionsRow.textContent = '';
      if (!data.music.src) return;
      actionsRow.appendChild(edBtn('Remove music', function () {
        data.music.src = '';
        statusEl.textContent = 'No music yet.';
        statusEl.className = 'ed-media-name';
        rebuildActions();
        touch();
      }, 'danger'));
    }
    rebuildActions();

    panel.appendChild(statusEl);

    panel.appendChild(el(
      'p',
      'ed-help',
      'Tip: keep the file under 3 MB so the exported card loads quickly on mobile.'
    ));

    return panel;
  }

  // ---- Contacts and RSVP tab ----
  function buildContactsPanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'contacts');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'RSVP'));

    checkRow(panel, 'Show RSVP section', data.rsvp.show, function (checked) {
      data.rsvp.show = checked;
      touch();
    });

    var whatsapp = field(
      panel,
      'WhatsApp number (country code + number, digits only)',
      data.rsvp.whatsapp,
      'tel'
    );
    whatsapp.placeholder = '919876543210';
    whatsapp.addEventListener('input', function () {
      data.rsvp.whatsapp = whatsapp.value;
      touch();
    });

    var note = field(panel, 'RSVP note', data.rsvp.note, 'textarea');
    note.addEventListener('input', function () {
      data.rsvp.note = note.value;
      touch();
    });

    panel.appendChild(el('div', 'ed-divider'));
    panel.appendChild(el('p', 'ed-label', 'Contacts (up to 3)'));

    for (var i = 0; i < 3; i += 1) {
      (function (index) {
        var row = el('div', 'ed-row');
        var contact = data.contacts[index] || { label: '', phone: '' };

        var labelInput = field(row, 'Label ' + (index + 1), contact.label, 'text');
        labelInput.addEventListener('input', function () {
          if (!data.contacts[index]) data.contacts[index] = { label: '', phone: '' };
          data.contacts[index].label = labelInput.value;
          touch();
        });

        var phoneInput = field(row, 'Phone ' + (index + 1), contact.phone, 'tel');
        phoneInput.addEventListener('input', function () {
          if (!data.contacts[index]) data.contacts[index] = { label: '', phone: '' };
          data.contacts[index].phone = phoneInput.value;
          touch();
        });

        panel.appendChild(row);
      })(i);
    }

    return panel;
  }

  // ---- Theme tab ----
  function buildThemePanel() {
    var panel = el('div', 'ed-panel');
    panel.setAttribute('data-panel', 'theme');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Card theme'));

    var wrap = el('div', 'ed-themes');

    THEMES.forEach(function (theme) {
      var swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'ed-swatch';
      swatch.setAttribute('aria-pressed', data.theme === theme.id ? 'true' : 'false');
      swatch.appendChild(el('span', 'ed-swatch__dot ed-swatch__dot--' + theme.id));
      swatch.appendChild(el('span', null, theme.label));

      swatch.addEventListener('click', function () {
        data.theme = theme.id;
        wrap.querySelectorAll('.ed-swatch').forEach(function (node) {
          node.setAttribute('aria-pressed', 'false');
        });
        swatch.setAttribute('aria-pressed', 'true');
        touch();
      });

      wrap.appendChild(swatch);
    });

    panel.appendChild(wrap);
    return panel;
  }

  /* ==========================================================
     10. TABS
     ========================================================== */

  function buildTabs() {
    if (!els.editorTabs) return;
    els.editorTabs.textContent = '';

    TABS.forEach(function (tab, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ed-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-tab', tab.id);
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.textContent = tab.label;
      btn.addEventListener('click', function () { activateTab(tab.id); });
      els.editorTabs.appendChild(btn);
    });
  }

  function activateTab(id) {
    document.querySelectorAll('.ed-tab').forEach(function (node) {
      node.setAttribute(
        'aria-selected',
        node.getAttribute('data-tab') === id ? 'true' : 'false'
      );
    });
    document.querySelectorAll('.ed-panel').forEach(function (node) {
      node.hidden = node.getAttribute('data-panel') !== id;
    });
  }

  function rebuildAllPanels() {
    if (!els.editorBody) return;
    var activeTab = document.querySelector('.ed-tab[aria-selected="true"]');
    var activeId = activeTab ? activeTab.getAttribute('data-tab') : 'basic';

    els.editorBody.textContent = '';
    els.editorBody.appendChild(buildBasicPanel());
    els.editorBody.appendChild(buildEventsPanel());
    els.editorBody.appendChild(buildStoryPhotosPanel());
    els.editorBody.appendChild(buildMusicPanel());
    els.editorBody.appendChild(buildContactsPanel());
    els.editorBody.appendChild(buildThemePanel());

    activateTab(activeId);
  }

  /* ==========================================================
     11. DRAWER (mobile bottom sheet)
     On desktop the panel is always visible; opening/closing is a
     no-op for the layout, but still updates focus + aria.
     ========================================================== */

  var lastFocus = null;

  function openEditor() {
    if (!els.editorPanel) return;
    lastFocus = document.activeElement;
    els.editorPanel.classList.add('is-open');
    if (els.editorScrim) {
      els.editorScrim.classList.add('is-open');
      els.editorScrim.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('editor-open');
    if (els.editorClose) els.editorClose.focus();
  }

  function closeEditor() {
    if (!els.editorPanel) return;
    els.editorPanel.classList.remove('is-open');
    if (els.editorScrim) {
      els.editorScrim.classList.remove('is-open');
      els.editorScrim.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('editor-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (error) { /* ignore */ }
    }
  }

  /* ==========================================================
     12. DOWNLOAD
     Builds the same standalone HTML the preview uses, but WITHOUT
     the auto-open snippet. The exported file has no editor UI.
     ========================================================== */

  function download() {
    if (!window.buildCardHTML || !cssText) {
      toast('Card engine not ready yet. Please wait a moment.');
      return;
    }

    if (els.downloadBtn) {
      els.downloadBtn.disabled = true;
      els.downloadBtn.textContent = 'Preparing…';
    }

    try {
      var html = window.buildCardHTML(data, cssText);
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);

      var name1 = slug((data.person1 && data.person1.name) || 'groom');
      var name2 = slug((data.person2 && data.person2.name) || 'bride');

      var a = document.createElement('a');
      a.href = url;
      a.download = name1 + '-' + name2 + '-nikah-card.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);

      clearDraft();
      setStatus('Downloaded. Reloading for the next card…');
      toast('Downloaded. Reloading…');

      // Give the browser time to start the download, then start fresh.
      window.setTimeout(function () {
        window.location.reload();
      }, 1500);
    } catch (error) {
      if (window.console) window.console.error(error);
      if (els.downloadBtn) {
        els.downloadBtn.disabled = false;
        els.downloadBtn.textContent = 'Download Card';
      }
      setStatus('Download failed. Please try again.', true);
      toast('Download failed. See the console for details.');
    }
  }

  function resetToSample() {
    if (!window.confirm('Reset everything to the sample card? Your changes will be lost.')) {
      return;
    }
    data = freshData();
    clearDraft();
    rebuildAllPanels();
    renderPreviewNow();
    updateMediaStatus();
    toast('Reset to sample');
  }

  /* ==========================================================
     13. DATA BOOTSTRAP
     ========================================================== */

  // Fill empty slots so the editor always has the shape it expects.
  function padContacts(list) {
    var out = Array.isArray(list) ? list.slice(0, 3) : [];
    while (out.length < 3) out.push({ label: '', phone: '' });
    return out.map(function (contact) {
      return {
        label: str(contact && contact.label, ''),
        phone: str(contact && contact.phone, '')
      };
    });
  }

  function freshData() {
    var base = isObj(window.DEFAULT_CARD) ? clone(window.DEFAULT_CARD) : {
      events: [], gallery: [], contacts: []
    };
    base.contacts = padContacts(base.contacts);
    return base;
  }

  /* ==========================================================
     14. CARD.CSS LOADER
     ========================================================== */

  function loadCardCss() {
    return fetch('card.css', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) {
        throw new Error('card.css responded with status ' + response.status);
      }
      return response.text();
    });
  }

  /* ==========================================================
     15. INIT
     ========================================================== */

  function cacheElements() {
    els.previewFrame = document.getElementById('previewFrame');
    els.previewLoading = document.getElementById('previewLoading');
    els.editorPanel = document.getElementById('editorPanel');
    els.editorBody = document.getElementById('editorBody');
    els.editorTabs = document.getElementById('editorTabs');
    els.editorClose = document.getElementById('editorClose');
    els.editorScrim = document.getElementById('editorScrim');
    els.editFab = document.getElementById('editFab');
    els.downloadBtn = document.getElementById('downloadBtn');
    els.resetBtn = document.getElementById('resetBtn');
    els.editorStatus = document.getElementById('editorStatus');
    els.toast = document.getElementById('toast');
  }

  function bindChrome() {
    if (els.downloadBtn) {
      els.downloadBtn.addEventListener('click', download);
    }
    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', resetToSample);
    }
    if (els.editFab) {
      els.editFab.addEventListener('click', openEditor);
    }
    if (els.editorClose) {
      els.editorClose.addEventListener('click', closeEditor);
    }
    if (els.editorScrim) {
      els.editorScrim.addEventListener('click', closeEditor);
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && els.editorPanel &&
          els.editorPanel.classList.contains('is-open')) {
        closeEditor();
      }
    });
  }

  function init() {
    cacheElements();
    bindChrome();

    // Show a friendly message while we load the styles.
    if (els.editorStatus) {
      els.editorStatus.textContent = 'Loading card styles…';
    }

    loadCardCss().then(function (css) {
      cssText = css;

      // Merge a saved draft (text only) over the sample card.
      var draft = loadDraft();
      if (draft && isObj(draft)) {
        data = deepMerge(freshData(), draft);
      } else {
        data = freshData();
      }
      data.contacts = padContacts(data.contacts);

      // Sanity fixes for data that might be missing fields.
      if (!isObj(data.bismillah)) data.bismillah = { arabic: '', sub: '' };
      if (!isObj(data.ayah)) data.ayah = { show: true, arabic: '', translation: '', reference: '' };
      if (!isObj(data.dua)) data.dua = { show: true, arabic: '', translation: '' };
      if (!isObj(data.story)) data.story = { show: true, title: 'Our Story', text: '' };
      if (!isObj(data.footer)) data.footer = { thanks: '', family: '', closing: '' };
      if (!isObj(data.music)) data.music = { src: '', title: '' };
      if (!isObj(data.rsvp)) data.rsvp = { show: true, whatsapp: '', note: '' };
      if (!Array.isArray(data.events)) data.events = [];
      if (!Array.isArray(data.gallery)) data.gallery = [];

      // Build the UI now that we have both data and styles.
      buildTabs();
      rebuildAllPanels();
      updateMediaStatus();
      renderPreviewNow();
    }).catch(function (error) {
      if (window.console) window.console.error(error);
      setStatus(
        'Could not load card.css. Open this page from a web server, not a file:// URL.',
        true
      );
      if (els.previewLoading) {
        els.previewLoading.textContent =
          'card.css could not be loaded. Please open the builder from a web server.';
        els.previewLoading.classList.remove('is-hidden');
      }
      if (els.downloadBtn) els.downloadBtn.disabled = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
