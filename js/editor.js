/* ============================================================
   CINEMATIC INDIAN WEDDING CARD — editor.js

   This file is the "Builder" side of the project. It is loaded ONLY
   on the builder page. When the owner downloads the ZIP, this file is
   removed from the final card, so guests never see any editing UI.

   What it does:
   1. Draws the floating "Edit Card" button and the side drawer.
   2. Reads and writes the card data, updates the card live by calling
      window.renderCard(data) with a small debounce.
   3. Resizes photos, warns about large audio/video uploads.
   4. Autosaves text to localStorage "weddingCardDraft" (media is not saved).
   5. "Download Card (ZIP)": fetches index.html, style.css, script.js,
      builds a clean final index.html with the card data inline, packs
      media into assets/, loads JSZip from cdnjs, downloads the ZIP,
      clears the draft and reloads.

   Beginner note: everything below is wrapped in one function so no
   variables leak into the global scope. The only globals we touch are
   window.renderCard and window.DEFAULT_CARD, both defined in script.js.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. CONSTANTS
     ========================================================== */

  var STORAGE_KEY = 'weddingCardDraft';

  var TABS = [
    { id: 'basic',        label: 'Basic' },
    { id: 'events',       label: 'Events' },
    { id: 'story-photos', label: 'Story & Photos' },
    { id: 'media',        label: 'Music & Video' },
    { id: 'contacts',     label: 'Contacts & RSVP' },
    { id: 'theme',        label: 'Theme' }
  ];

  var THEMES = ['maroon', 'emerald', 'blush', 'midnight'];

  var MUSIC_MAX_BYTES = 4 * 1024 * 1024;   // 4MB
  var VIDEO_MAX_BYTES = 6 * 1024 * 1024;   // 6MB
  var PHOTO_MAX_DIMENSION = 1200;          // px on the longest side
  var PHOTO_QUALITY = 0.75;                // JPEG quality

  var JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

  /* ==========================================================
     2. SMALL HELPERS
     ========================================================== */

  // Create a DOM element. Text is always inserted safely with textContent.
  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) {
      node.textContent = String(textContent);
    }
    return node;
  }

  // Always return a string, never "undefined".
  function str(value, fallback) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  // "The Grand Pavilion" becomes "the-grand-pavilion".
  function slug(value) {
    var out = String(value || 'card')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return out || 'card';
  }

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  // Deep clone. structuredClone is fast; JSON is the fallback.
  function clone(value) {
    if (value === null || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (err) { /* ignore */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  // Deep merge: extra wins, but nested objects are combined.
  function deepMerge(base, extra) {
    if (!isObject(extra)) return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (isObject(value) && isObject(out[key])) {
        out[key] = deepMerge(out[key], value);
      } else if (Array.isArray(value)) {
        out[key] = value.slice();
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  // Escape a string before using it inside HTML (only the title needs this).
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // "data:image/jpeg;base64,XXXX" -> { mime, isBase64, data }.
  function parseDataUrl(url) {
    var match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(url || '');
    if (!match) return null;
    return {
      mime: match[1] || 'application/octet-stream',
      isBase64: !!match[2],
      data: match[3] || ''
    };
  }

  // Map a MIME type to a file extension we can use inside assets/.
  function mimeToExt(mime) {
    var map = {
      'image/jpeg': 'jpg',
      'image/jpg':  'jpg',
      'image/png':  'png',
      'image/webp': 'webp',
      'image/gif':  'gif',
      'audio/mpeg': 'mp3',
      'audio/mp3':  'mp3',
      'audio/wav':  'wav',
      'audio/ogg':  'ogg',
      'audio/mp4':  'm4a',
      'audio/aac':  'aac',
      'video/mp4':  'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov'
    };
    return map[mime] || null;
  }

  // Decode base64 into a byte array that JSZip can store.
  function base64ToBytes(base64) {
    var binary = atob(base64);
    var length = binary.length;
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  /* ==========================================================
     3. STATE

     `data` is the single source of truth for the editor. Every field
     in the drawer reads from and writes to this object. Calling
     window.renderCard(clone(data)) redraws the card behind the drawer.
     ========================================================== */

  var data = null;

  // Fill contacts to exactly 3 entries so the editor always has 3 rows.
  function normalizeContacts(list) {
    var out = Array.isArray(list) ? list.slice(0, 3) : [];
    while (out.length < 3) out.push({ label: '', phone: '' });
    return out.map(function (contact) {
      return {
        label: str(contact && contact.label, ''),
        phone: str(contact && contact.phone, '')
      };
    });
  }

  // Build a fresh copy of the sample card with safe defaults applied.
  function freshData() {
    var base = isObject(window.DEFAULT_CARD)
      ? window.DEFAULT_CARD
      : { events: [], gallery: [], contacts: [] };
    var next = deepMerge(clone(base), {});
    next.contacts = normalizeContacts(next.contacts);
    return next;
  }

  /* ==========================================================
     4. DRAFT SAVE / LOAD
     Only text fields survive a page refresh. Media stays in memory.
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

  function saveDraft() {
    if (!data) return;
    try {
      // Strip media before saving so localStorage never fills up.
      var draft = clone(data);
      draft.gallery = [];
      draft.music = { src: '', title: str(data.music && data.music.title, '') };
      draft.video = { src: '' };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      // Private mode or full quota: give up quietly.
    }
  }

  function clearDraft() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* ignore */ }
  }

  /* ==========================================================
     5. DEBOUNCED LIVE RENDER
     Typing triggers one render 120ms after the last keystroke, so the
     card behind the drawer updates smoothly without lagging.
     ========================================================== */

  var renderTimer = 0;

  function scheduleRender() {
    if (renderTimer) window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(function () {
      renderTimer = 0;
      if (typeof window.renderCard === 'function') {
        try { window.renderCard(clone(data)); } catch (error) {
          if (window.console) window.console.warn('Render failed:', error);
        }
      }
      saveDraft();
    }, 120);
  }

  /* ==========================================================
     6. FORM FIELD HELPERS
     ========================================================== */

  // A labelled input or textarea. Returns the input so callers can bind
  // an input listener that writes back into `data`.
  function field(parent, label, value, options) {
    var opts;
    if (typeof options === 'string') opts = { type: options };
    else if (options === 'textarea') opts = { multiline: true };
    else opts = options || {};

    var wrap = document.createElement('label');
    wrap.className = 'ed-field';
    wrap.appendChild(el('span', 'ed-label', label));

    var input;
    if (opts.multiline) {
      input = document.createElement('textarea');
      input.className = 'ed-textarea';
    } else {
      input = document.createElement('input');
      input.className = 'ed-input';
      input.type = opts.type || 'text';
    }
    input.value = value === null || value === undefined ? '' : String(value);
    if (opts.placeholder) input.placeholder = opts.placeholder;

    wrap.appendChild(input);
    parent.appendChild(wrap);
    return input;
  }

  // A small "action" button.
  function edBtn(label, onClick, variant) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ed-btn' + (variant ? ' ed-btn--' + variant : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // A checkbox row.
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

  // A file button (a label wrapping a hidden file input).
  function fileButton(label, accept, onFile) {
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
     7. PHOTO PROCESSING
     Reads the image, scales it down to fit within 1200px, and turns it
     into a JPEG data URL at 0.75 quality. Keeps the card light.
     ========================================================== */

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();

      image.onload = function () {
        try {
          var width = image.naturalWidth || image.width;
          var height = image.naturalHeight || image.height;
          var longest = Math.max(width, height);
          if (longest > PHOTO_MAX_DIMENSION) {
            var ratio = PHOTO_MAX_DIMENSION / longest;
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          var ctx = canvas.getContext('2d');
          // White background so transparent PNGs don't turn black in JPEG.
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
     8. PANEL BUILDERS
     ========================================================== */

  // ---- Basic tab ----
  function buildBasicPanel() {
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'basic');

    panel.appendChild(el('p', 'ed-label', 'Gate scene'));
    var gateLine = field(panel, 'Gate heading', data.gate.line, 'text');
    gateLine.addEventListener('input', function () {
      data.gate.line = gateLine.value;
      scheduleRender();
    });

    var gateTap = field(panel, 'Tap button text', data.gate.tapText, 'text');
    gateTap.addEventListener('input', function () {
      data.gate.tapText = gateTap.value;
      scheduleRender();
    });

    panel.appendChild(el('p', 'ed-label', 'Invitation'));

    var blessing = field(panel, 'Blessing line', data.blessing, 'textarea');
    blessing.addEventListener('input', function () {
      data.blessing = blessing.value;
      scheduleRender();
    });

    var host = field(panel, 'Host line', data.host, 'text');
    host.addEventListener('input', function () {
      data.host = host.value;
      scheduleRender();
    });

    var invite = field(panel, 'Invite text', data.inviteText, 'textarea');
    invite.addEventListener('input', function () {
      data.inviteText = invite.value;
      scheduleRender();
    });

    panel.appendChild(el('p', 'ed-label', 'Couple'));

    var p1Name = field(panel, 'Person 1 name', data.person1.name, 'text');
    p1Name.addEventListener('input', function () {
      data.person1.name = p1Name.value;
      scheduleRender();
    });

    var p1Sub = field(panel, 'Person 1 subtitle', data.person1.sub, 'text');
    p1Sub.addEventListener('input', function () {
      data.person1.sub = p1Sub.value;
      scheduleRender();
    });

    var p2Name = field(panel, 'Person 2 name', data.person2.name, 'text');
    p2Name.addEventListener('input', function () {
      data.person2.name = p2Name.value;
      scheduleRender();
    });

    var p2Sub = field(panel, 'Person 2 subtitle', data.person2.sub, 'text');
    p2Sub.addEventListener('input', function () {
      data.person2.sub = p2Sub.value;
      scheduleRender();
    });

    panel.appendChild(el('p', 'ed-label', 'Footer'));

    var thanks = field(panel, 'Thanks line', data.footer.thanks, 'textarea');
    thanks.addEventListener('input', function () {
      data.footer.thanks = thanks.value;
      scheduleRender();
    });

    var family = field(panel, 'Family line', data.footer.family, 'text');
    family.addEventListener('input', function () {
      data.footer.family = family.value;
      scheduleRender();
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
    if (event.isMain) {
      summary.appendChild(el('span', 'ed-event__main-flag', 'Main'));
    }
    details.appendChild(summary);

    var body = el('div', 'ed-event__body');

    var nameInput = field(body, 'Name', event.name, 'text');
    nameInput.addEventListener('input', function () {
      event.name = nameInput.value;
      nameSpan.textContent = nameInput.value || 'Event';
      scheduleRender();
    });

    var dateInput = field(body, 'Date', event.date, 'date');
    dateInput.addEventListener('input', function () {
      event.date = dateInput.value;
      scheduleRender();
    });

    var timeInput = field(body, 'Time (IST)', event.time, 'time');
    timeInput.addEventListener('input', function () {
      event.time = timeInput.value;
      scheduleRender();
    });

    var venueInput = field(body, 'Venue name', event.venue, 'text');
    venueInput.addEventListener('input', function () {
      event.venue = venueInput.value;
      scheduleRender();
    });

    var addressInput = field(body, 'Address', event.address, 'textarea');
    addressInput.addEventListener('input', function () {
      event.address = addressInput.value;
      scheduleRender();
    });

    var mapInput = field(body, 'Map link (https://…)', event.mapLink, 'url');
    mapInput.placeholder = 'https://maps.app.goo.gl/…';
    mapInput.addEventListener('input', function () {
      event.mapLink = mapInput.value;
      scheduleRender();
    });

    var dressInput = field(body, 'Dress code', event.dress, 'text');
    dressInput.addEventListener('input', function () {
      event.dress = dressInput.value;
      scheduleRender();
    });

    var noteInput = field(body, 'Note', event.note, 'textarea');
    noteInput.addEventListener('input', function () {
      event.note = noteInput.value;
      scheduleRender();
    });

    // Actions row: up, down, set main, delete.
    var actions = el('div', 'ed-actions');

    var up = edBtn('↑ Up', function () {
      if (index === 0) return;
      var previous = data.events[index - 1];
      data.events[index - 1] = data.events[index];
      data.events[index] = previous;
      rebuildEventsPanel();
      scheduleRender();
    });
    up.disabled = index === 0;

    var down = edBtn('↓ Down', function () {
      if (index === data.events.length - 1) return;
      var next = data.events[index + 1];
      data.events[index + 1] = data.events[index];
      data.events[index] = next;
      rebuildEventsPanel();
      scheduleRender();
    });
    down.disabled = index === data.events.length - 1;

    var main = edBtn(event.isMain ? '★ Main event' : 'Set as main', function () {
      data.events.forEach(function (candidate, position) {
        candidate.isMain = (position === index);
      });
      rebuildEventsPanel();
      scheduleRender();
    });
    main.disabled = !!event.isMain;

    var remove = edBtn('Delete', function () {
      data.events.splice(index, 1);
      if (data.events.length && !data.events.some(function (candidate) {
        return candidate.isMain;
      })) {
        data.events[0].isMain = true;
      }
      rebuildEventsPanel();
      scheduleRender();
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
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'events');
    panel.hidden = true;

    if (!data.events.length) {
      panel.appendChild(el('p', 'ed-media-name', 'No events yet. Add one below.'));
    }

    data.events.forEach(function (event, index) {
      panel.appendChild(buildEventEditor(event, index));
    });

    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'ed-btn ed-btn--gold';
    add.textContent = '+ Add Event';
    add.addEventListener('click', function () {
      data.events.push({
        name: 'New Event',
        date: '',
        time: '',
        venue: '',
        address: '',
        mapLink: '',
        dress: '',
        note: '',
        isMain: !data.events.some(function (candidate) { return candidate.isMain; })
      });
      rebuildEventsPanel();
      scheduleRender();
    });
    panel.appendChild(add);

    return panel;
  }

  // Replace the existing Events panel without touching other panels.
  function rebuildEventsPanel() {
    var old = document.querySelector('[data-panel="events"]');
    if (!old) return;
    var wasHidden = old.hidden;
    var fresh = buildEventsPanel();
    fresh.hidden = wasHidden;
    old.replaceWith(fresh);
  }

  // ---- Story & Photos tab ----
  function buildStoryPhotosPanel() {
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'story-photos');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Our Story'));

    checkRow(panel, 'Show "Our Story" section', data.story.show, function (checked) {
      data.story.show = checked;
      scheduleRender();
    });

    var storyTitle = field(panel, 'Story title', data.story.title, 'text');
    storyTitle.addEventListener('input', function () {
      data.story.title = storyTitle.value;
      scheduleRender();
    });

    var storyText = field(panel, 'Story text', data.story.text, 'textarea');
    storyText.addEventListener('input', function () {
      data.story.text = storyText.value;
      scheduleRender();
    });

    panel.appendChild(el('p', 'ed-label', 'Photos (up to 8)'));

    var upload = fileButton('Add photos', 'image/*', function (file) {
      if (data.gallery.length >= 8) return;
      resizeImage(file).then(function (dataUrl) {
        if (data.gallery.length >= 8) return;
        data.gallery.push(dataUrl);
        rebuildPhotoThumbs();
        scheduleRender();
      }).catch(function (error) {
        if (window.console) window.console.warn(error);
      });
    });
    panel.appendChild(upload);

    var thumbs = el('div', 'ed-thumbs');
    panel.appendChild(thumbs);

    function rebuildPhotoThumbs() {
      thumbs.textContent = '';
      if (!data.gallery.length) {
        thumbs.appendChild(el('p', 'ed-media-name', 'No photos yet. Add up to 8.'));
        return;
      }
      data.gallery.forEach(function (src, index) {
        var tile = el('div', 'ed-thumb');
        var image = document.createElement('img');
        image.src = src;
        image.alt = 'Photo ' + (index + 1);
        image.loading = 'lazy';
        tile.appendChild(image);

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', 'Remove photo ' + (index + 1));
        removeBtn.addEventListener('click', function () {
          data.gallery.splice(index, 1);
          rebuildPhotoThumbs();
          scheduleRender();
        });
        tile.appendChild(removeBtn);
        thumbs.appendChild(tile);
      });
    }

    rebuildPhotoThumbs();
    return panel;
  }

  // ---- Music & Video tab ----
  function buildMediaPanel() {
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'media');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Background music'));

    var titleInput = field(panel, 'Music title (optional)', data.music.title, 'text');
    titleInput.addEventListener('input', function () {
      data.music.title = titleInput.value;
      scheduleRender();
    });

    var musicStatus = el('p', 'ed-media-name',
      data.music.src ? 'Music loaded.' : 'No music yet. Upload a short mp3.');

    var musicUpload = fileButton('Upload mp3', 'audio/mpeg,audio/mp3,audio/*', function (file) {
      if (file.size > MUSIC_MAX_BYTES) {
        musicStatus.textContent = 'That file is over 4MB. Please pick a smaller mp3.';
        musicStatus.className = 'ed-warn';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        data.music.src = String(reader.result || '');
        musicStatus.textContent = 'Music loaded (' + file.name + ').';
        musicStatus.className = 'ed-media-name';
        scheduleRender();
      };
      reader.onerror = function () {
        musicStatus.textContent = 'Could not read that file.';
        musicStatus.className = 'ed-warn';
      };
      reader.readAsDataURL(file);
    });
    panel.appendChild(musicUpload);
    panel.appendChild(musicStatus);

    panel.appendChild(el('p', 'ed-label', 'Background video (optional)'));

    var videoStatus = el('p', 'ed-media-name',
      data.video.src ? 'Video loaded.' : 'No video yet. Upload a short mp4.');

    var videoUpload = fileButton('Upload mp4', 'video/mp4,video/*', function (file) {
      if (file.size > VIDEO_MAX_BYTES) {
        videoStatus.textContent = 'That file is over 6MB. Please pick a smaller mp4.';
        videoStatus.className = 'ed-warn';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        data.video.src = String(reader.result || '');
        videoStatus.textContent = 'Video loaded (' + file.name + ').';
        videoStatus.className = 'ed-media-name';
        scheduleRender();
      };
      reader.onerror = function () {
        videoStatus.textContent = 'Could not read that file.';
        videoStatus.className = 'ed-warn';
      };
      reader.readAsDataURL(file);
    });
    panel.appendChild(videoUpload);
    panel.appendChild(videoStatus);

    var note = el('p', 'ed-media-name',
      'Files stay in memory only. Exporting puts them into the ZIP.');
    panel.appendChild(note);

    return panel;
  }

  // ---- Contacts & RSVP tab ----
  function buildContactsPanel() {
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'contacts');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'RSVP'));

    checkRow(panel, 'Show RSVP section', data.rsvp.show, function (checked) {
      data.rsvp.show = checked;
      scheduleRender();
    });

    var whatsapp = field(
      panel,
      'WhatsApp number (with country code, digits only)',
      data.rsvp.whatsapp,
      'tel'
    );
    whatsapp.placeholder = '919876543210';
    whatsapp.addEventListener('input', function () {
      data.rsvp.whatsapp = whatsapp.value;
      scheduleRender();
    });

    var rsvpNote = field(panel, 'RSVP note', data.rsvp.note, 'textarea');
    rsvpNote.addEventListener('input', function () {
      data.rsvp.note = rsvpNote.value;
      scheduleRender();
    });

    panel.appendChild(el('p', 'ed-label', 'Contacts (up to 3)'));

    for (var i = 0; i < 3; i += 1) {
      (function (index) {
        var row = el('div', 'ed-row');
        var contact = data.contacts[index] || { label: '', phone: '' };

        var labelInput = field(row, 'Label ' + (index + 1), contact.label, 'text');
        labelInput.addEventListener('input', function () {
          if (!data.contacts[index]) data.contacts[index] = { label: '', phone: '' };
          data.contacts[index].label = labelInput.value;
          scheduleRender();
        });

        var phoneInput = field(row, 'Phone ' + (index + 1), contact.phone, 'tel');
        phoneInput.addEventListener('input', function () {
          if (!data.contacts[index]) data.contacts[index] = { label: '', phone: '' };
          data.contacts[index].phone = phoneInput.value;
          scheduleRender();
        });

        panel.appendChild(row);
      })(i);
    }

    return panel;
  }

  // ---- Theme tab ----
  function buildThemePanel() {
    var panel = el('div', 'editor-panel');
    panel.setAttribute('data-panel', 'theme');
    panel.hidden = true;

    panel.appendChild(el('p', 'ed-label', 'Card theme'));

    var wrap = el('div', 'ed-themes');

    THEMES.forEach(function (theme) {
      var swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'ed-swatch';
      swatch.setAttribute('aria-pressed', data.theme === theme ? 'true' : 'false');

      swatch.appendChild(el('span', 'ed-swatch__dot ed-swatch__dot--' + theme));
      swatch.appendChild(el('span', null, theme.charAt(0).toUpperCase() + theme.slice(1)));

      swatch.addEventListener('click', function () {
        data.theme = theme;
        wrap.querySelectorAll('.ed-swatch').forEach(function (node) {
          node.setAttribute('aria-pressed', 'false');
        });
        swatch.setAttribute('aria-pressed', 'true');
        scheduleRender();
      });

      wrap.appendChild(swatch);
    });

    panel.appendChild(wrap);
    return panel;
  }

  /* ==========================================================
     9. TABS
     ========================================================== */

  function buildTabs() {
    var wrap = el('div', 'editor-tabs');
    wrap.setAttribute('role', 'tablist');
    wrap.setAttribute('aria-label', 'Editor sections');

    TABS.forEach(function (tab, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editor-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-tab', tab.id);
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.textContent = tab.label;
      btn.addEventListener('click', function () { activateTab(tab.id); });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  function activateTab(id) {
    document.querySelectorAll('.editor-tab').forEach(function (node) {
      node.setAttribute('aria-selected',
        node.getAttribute('data-tab') === id ? 'true' : 'false');
    });
    document.querySelectorAll('.editor-panel').forEach(function (node) {
      node.hidden = node.getAttribute('data-panel') !== id;
    });
  }

  /* ==========================================================
     10. DRAWER (fab + scrim + drawer)
     ========================================================== */

  var lastFocus = null;

  function openDrawer() {
    var drawer = document.getElementById('editorDrawer');
    var scrim = document.getElementById('editorScrim');
    if (!drawer || !scrim) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('editor-open');
    var closeBtn = document.getElementById('editorClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById('editorDrawer');
    var scrim = document.getElementById('editorScrim');
    if (!drawer || !scrim) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('editor-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (error) { /* ignore */ }
    }
  }

  function editIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d',
      'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
    svg.appendChild(path);
    return svg;
  }

  // Rebuild every panel from `data`. Used after "Reset to sample".
  function rebuildAllPanels() {
    var body = document.querySelector('.editor-body');
    if (!body) return;
    var activeTab = document.querySelector('.editor-tab[aria-selected="true"]');
    var activeId = activeTab ? activeTab.getAttribute('data-tab') : 'basic';

    body.textContent = '';
    body.appendChild(buildBasicPanel());
    body.appendChild(buildEventsPanel());
    body.appendChild(buildStoryPhotosPanel());
    body.appendChild(buildMediaPanel());
    body.appendChild(buildContactsPanel());
    body.appendChild(buildThemePanel());

    activateTab(activeId);
  }

  function buildDrawer() {
    var root = document.getElementById('editor-root');
    if (!root) return;

    // ---- Floating Edit Card button ----
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'editor-fab';
    fab.id = 'editorFab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-controls', 'editorDrawer');
    fab.appendChild(editIcon());
    fab.appendChild(document.createTextNode(' Edit Card'));
    fab.addEventListener('click', openDrawer);
    root.appendChild(fab);

    // ---- Scrim ----
    var scrim = el('div', 'editor-scrim');
    scrim.id = 'editorScrim';
    scrim.addEventListener('click', closeDrawer);
    root.appendChild(scrim);

    // ---- Drawer ----
    var drawer = el('aside', 'editor-drawer');
    drawer.id = 'editorDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Edit card');
    drawer.setAttribute('aria-hidden', 'true');

    // Head
    var head = el('div', 'editor-head');
    head.appendChild(el('div', 'editor-head__title', 'Edit Card'));
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'editor-close';
    closeBtn.id = 'editorClose';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close editor');
    closeBtn.addEventListener('click', closeDrawer);
    head.appendChild(closeBtn);
    drawer.appendChild(head);

    // "How to use" note at the top.
    var note = el('p', 'editor-note');
    note.appendChild(el('strong', null, 'How to use: '));
    note.appendChild(document.createTextNode(
      'Download, unzip, drag the folder to Netlify Drop or GitHub Pages, then share the link with your guests.'
    ));
    drawer.appendChild(note);

    // Tabs
    drawer.appendChild(buildTabs());

    // Panels
    var body = el('div', 'editor-body');
    body.appendChild(buildBasicPanel());
    body.appendChild(buildEventsPanel());
    body.appendChild(buildStoryPhotosPanel());
    body.appendChild(buildMediaPanel());
    body.appendChild(buildContactsPanel());
    body.appendChild(buildThemePanel());
    drawer.appendChild(body);

    // Footer
    var foot = el('div', 'editor-foot');

    var resetRow = el('div', 'editor-foot__row');
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'ed-btn';
    resetBtn.textContent = 'Reset to sample';
    resetBtn.addEventListener('click', resetToSample);
    resetRow.appendChild(resetBtn);
    foot.appendChild(resetRow);

    var downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'ed-btn ed-btn--gold ed-btn--big';
    downloadBtn.id = 'downloadBtn';
    downloadBtn.textContent = 'Download Card (ZIP)';
    downloadBtn.addEventListener('click', downloadZip);
    foot.appendChild(downloadBtn);

    drawer.appendChild(foot);
    root.appendChild(drawer);

    // Escape closes the drawer.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  function resetToSample() {
    if (!window.confirm('Reset everything to the sample card? Your changes will be lost.')) {
      return;
    }
    data = freshData();
    clearDraft();
    if (typeof window.renderCard === 'function') {
      try { window.renderCard(clone(data)); } catch (error) { /* ignore */ }
    }
    rebuildAllPanels();
  }

  /* ==========================================================
     11. DOWNLOAD ZIP
     ========================================================== */

  // Dynamically load JSZip the first time it's needed.
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = JSZIP_URL;
      script.async = true;
      script.onload = function () {
        if (window.JSZip) resolve(window.JSZip);
        else reject(new Error('JSZip did not finish loading.'));
      };
      script.onerror = function () {
        reject(new Error('Could not load JSZip. Please check your internet and try again.'));
      };
      document.head.appendChild(script);
    });
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load ' + url + ' (' + response.status + ')');
      }
      return response.text();
    });
  }

  // Turn every media data URL into an entry inside `assets/`.
  // Returns { data: cleanCopy, assets: { 'assets/photo1.jpg': Uint8Array } }.
  function prepareExport() {
    var exportData = clone(data);
    var assets = {};

    // Photos
    exportData.gallery = [];
    (data.gallery || []).forEach(function (src, index) {
      if (typeof src !== 'string') return;

      if (src.indexOf('data:') !== 0) {
        // External URL or relative path: keep it as it is.
        exportData.gallery.push(src);
        return;
      }

      var parsed = parseDataUrl(src);
      if (!parsed || !parsed.isBase64) return;

      try {
        var ext = mimeToExt(parsed.mime) || 'jpg';
        var filename = 'assets/photo' + (index + 1) + '.' + ext;
        assets[filename] = base64ToBytes(parsed.data);
        exportData.gallery.push(filename);
      } catch (error) {
        // Bad base64 in a photo: skip that one, keep the rest.
      }
    });

    // Music
    if (data.music && data.music.src && data.music.src.indexOf('data:') === 0) {
      var music = parseDataUrl(data.music.src);
      if (music && music.isBase64) {
        try {
          var musicExt = mimeToExt(music.mime) || 'mp3';
          var musicPath = 'assets/music.' + musicExt;
          assets[musicPath] = base64ToBytes(music.data);
          exportData.music.src = musicPath;
        } catch (error) { /* ignore */ }
      }
    }

    // Video
    if (data.video && data.video.src && data.video.src.indexOf('data:') === 0) {
      var video = parseDataUrl(data.video.src);
      if (video && video.isBase64) {
        try {
          var videoExt = mimeToExt(video.mime) || 'mp4';
          var videoPath = 'assets/video.' + videoExt;
          assets[videoPath] = base64ToBytes(video.data);
          exportData.video.src = videoPath;
        } catch (error) { /* ignore */ }
      }
    }

    return { data: exportData, assets: assets };
  }

  // Rewrite index.html: remove editor.js, remove #editor-root,
  // inject the card data as inline JSON, and set the title.
  function buildFinalHtml(sourceHtml, exportData) {
    var out = sourceHtml;

    // 1. Remove the editor script tag.
    out = out.replace(
      /<script\s+src=["']editor\.js["']\s*>\s*<\/script>\s*/gi,
      ''
    );

    // 2. Remove the empty <div id="editor-root"></div>.
    out = out.replace(
      /<div\s+id=["']editor-root["']\s*>\s*<\/div>\s*/gi,
      ''
    );

    // 3. Build the inline data script. Escape "<" so "</script>" inside
    //    user text can never break out of the tag.
    var json = JSON.stringify(exportData).replace(/</g, '\\u003c');
    var dataTag = '<script id="card-data" type="application/json">' +
      json + '</script>\n  ';

    // 4. Insert the data tag just before script.js so it is in the DOM
    //    when script.js looks for it.
    out = out.replace(
      /(<script\s+src=["']script\.js["']\s*>\s*<\/script>)/i,
      dataTag + '$1'
    );

    // 5. Set the <title>.
    var name1 = (exportData.person1 && exportData.person1.name) || 'Wedding';
    var name2 = (exportData.person2 && exportData.person2.name) || 'Invitation';
    var title = escapeHtml(name1 + ' & ' + name2 + ' - Wedding Invitation');
    out = out.replace(/<title>[^<]*<\/title>/i, '<title>' + title + '</title>');

    return out;
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function downloadZip() {
    var btn = document.getElementById('downloadBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Preparing…';
    }

    var exportPayload;
    try {
      exportPayload = prepareExport();
    } catch (error) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Download Card (ZIP)';
      }
      window.alert('Could not prepare your media: ' +
        (error && error.message ? error.message : 'unknown error'));
      return;
    }

    Promise.all([
      loadJSZip(),
      fetchText('index.html'),
      fetchText('style.css'),
      fetchText('script.js')
    ]).then(function (results) {
      var JSZip = results[0];
      var indexHtml = results[1];
      var styleCss = results[2];
      var scriptJs = results[3];

      var finalHtml = buildFinalHtml(indexHtml, exportPayload.data);

      var zip = new JSZip();
      zip.file('index.html', finalHtml);
      zip.file('style.css', styleCss);
      zip.file('script.js', scriptJs);

      var assetKeys = Object.keys(exportPayload.assets);
      if (assetKeys.length) {
        var assetsFolder = zip.folder('assets');
        assetKeys.forEach(function (path) {
          var insideName = path.replace(/^assets\//, '');
          assetsFolder.file(insideName, exportPayload.assets[path]);
        });
      }

      return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    }).then(function (blob) {
      var name1 = slug((data.person1 && data.person1.name) || 'wedding');
      var name2 = slug((data.person2 && data.person2.name) || 'card');
      triggerDownload(blob, name1 + '-' + name2 + '-card.zip');

      if (btn) btn.textContent = 'Downloaded! Reloading…';
      clearDraft();

      window.setTimeout(function () {
        window.location.reload();
      }, 1500);
    }).catch(function (error) {
      if (window.console) window.console.error(error);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Download Card (ZIP)';
      }
      window.alert(
        'Could not build the ZIP.\n\n' +
        (error && error.message ? error.message :
          'Please make sure you opened this page from a web server, not a file:// URL.')
      );
    });
  }

  /* ==========================================================
     12. INIT
     ========================================================== */

  function init() {
    // Build the editor's working copy of the data.
    var draft = loadDraft();
    if (draft && isObject(draft)) {
      data = deepMerge(freshData(), draft);
    } else {
      data = freshData();
    }
    data.contacts = normalizeContacts(data.contacts);

    // If a draft was found, apply it to the card immediately so the
    // very first paint already shows the owner's saved version.
    if (draft && typeof window.renderCard === 'function') {
      try { window.renderCard(clone(data)); } catch (error) {
        if (window.console) window.console.warn(error);
      }
    }

    buildDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
