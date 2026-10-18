/* ==========================================================================
   builder.js — the editor UI, live preview, autosave, download and reset.
   Wrapped in an IIFE so nothing leaks to window.
   Uses only ES2017 syntax (no optional chaining, no ??, no class fields).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  var errorBox = document.getElementById('errorBox');
  var loader = document.getElementById('loader');
  var previewFrame = document.getElementById('previewFrame');
  var downloadBtn = document.getElementById('downloadBtn');
  var resetBtn = document.getElementById('resetBtn');
  var saveNote = document.getElementById('saveNote');
  var editorEl = document.getElementById('editor');
  var editBtn = document.getElementById('editBtn');
  var sheetBackdrop = document.getElementById('sheetBackdrop');

  /* ---------- global error plumbing ---------- */
  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = String(msg);
    errorBox.hidden = false;
  }

  function hideLoader() {
    if (loader) loader.hidden = true;
  }

  window.onerror = function (msg, file, line, col) {
    var where = (file || '') + ':' + (line || '0') + (col ? ':' + col : '');
    showError('Script error:\n' + msg + '\n' + where);
    hideLoader();
  };
  window.addEventListener('unhandledrejection', function (ev) {
    var reason = ev && ev.reason ? (ev.reason.message || String(ev.reason)) : 'unknown';
    showError('Unhandled promise rejection:\n' + reason);
    hideLoader();
  });

  /* ---------- check that all four support files loaded ---------- */
  var missing = [];
  if (!window.CARD_LOADED_STYLE || !window.CARD_CSS) {
    missing.push('card-style.js did not load or is incomplete');
  }
  if (!window.CARD_LOADED_RUNTIME || typeof window.cardRuntime !== 'function') {
    missing.push('card-runtime.js did not load or is incomplete');
  }
  if (!window.CARD_LOADED_DATA || !window.DEFAULT_CARD || typeof window.buildCardHTML !== 'function') {
    missing.push('card.js did not load or is incomplete');
  }
  if (missing.length) {
    showError('Cannot start the builder:\n- ' + missing.join('\n- '));
    hideLoader();
    return;
  }

  /* ---------- safe helpers ---------- */
  function esc(v) {
    return window.escapeHtml(v === null || v === undefined ? '' : v);
  }
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  function slug(s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }
  function setPath(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    var i;
    for (i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] === null || typeof cur[k] !== 'object') cur[k] = {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /* ==========================================================================
     STATE
     ========================================================================== */
  var DRAFT_KEY = 'nikahCardDraft';
  var state = null;

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    var keys = Object.keys(source);
    var i;
    for (i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k === 'gallery' || k === 'music') continue; // media stays in memory only
      var sv = source[k];
      if (Array.isArray(sv)) {
        target[k] = clone(sv);
      } else if (sv !== null && typeof sv === 'object') {
        if (target[k] === null || typeof target[k] !== 'object' || Array.isArray(target[k])) {
          target[k] = {};
        }
        deepMerge(target[k], sv);
      } else {
        target[k] = sv;
      }
    }
    return target;
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function normalizeState() {
    if (!state || typeof state !== 'object') state = clone(window.DEFAULT_CARD);
    if (!Array.isArray(state.events)) state.events = [];
    if (state.events.length) {
      var hasMain = false;
      var i;
      for (i = 0; i < state.events.length; i++) {
        if (state.events[i] && state.events[i].isMain) { hasMain = true; break; }
      }
      if (!hasMain) state.events[0].isMain = true;
    }
    if (!Array.isArray(state.gallery)) state.gallery = [];
    if (!Array.isArray(state.contacts)) state.contacts = [];
    if (state.contacts.length === 0) state.contacts.push({ label: '', phone: '' });
    if (state.contacts.length > 3) state.contacts = state.contacts.slice(0, 3);
    if (typeof state.music !== 'string') state.music = '';
  }

  function buildInitialState() {
    var base = clone(window.DEFAULT_CARD);
    var draft = loadDraft();
    if (draft && typeof draft === 'object') {
      deepMerge(base, draft);
    }
    state = base;
    normalizeState();
  }

  /* ---------- autosave (text fields only) ---------- */
  var saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 700);
  }
  function saveDraft() {
    try {
      var copy = clone(state);
      copy.gallery = [];
      copy.music = '';
      localStorage.setItem(DRAFT_KEY, JSON.stringify(copy));
      if (saveNote) {
        saveNote.classList.add('flash');
        setTimeout(function () { saveNote.classList.remove('flash'); }, 900);
      }
    } catch (e) {
      // quota or private mode: keep working, just don't persist
    }
  }

  /* ==========================================================================
     LIVE PREVIEW (debounced 300ms)
     ========================================================================== */
  var previewTimer = null;
  function updatePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      try {
        previewFrame.srcdoc = window.buildCardHTML(state);
      } catch (e) {
        showError('Preview could not be built: ' + (e && e.message ? e.message : String(e)));
      }
    }, 300);
  }

  /* ==========================================================================
     INPUT HANDLING (one delegated listener for the whole editor)
     ========================================================================== */
  function handleInput(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var path = t.getAttribute('data-path');
    if (!path) return;
    var value;
    if (t.type === 'checkbox') value = !!t.checked;
    else if (t.type === 'file') return; // file inputs handled separately
    else value = t.value;
    setPath(state, path, value);
    scheduleSave();
    updatePreview();
  }

  /* ==========================================================================
     PANEL: BASIC
     ========================================================================== */
  function renderBasicPanel() {
    var el = document.getElementById('panel-basic');
    if (!el) return;
    var D = state;
    el.innerHTML =
      '<div class="field"><label>Seal initials (shown on the envelope)</label>' +
        '<input type="text" data-path="sealInitials" value="' + esc(D.sealInitials) + '"></div>' +

      '<p class="field-label">Bismillah</p>' +
      '<div class="field"><label>Arabic</label>' +
        '<input type="text" dir="rtl" data-path="bismillah.ar" value="' + esc(D.bismillah.ar) + '"></div>' +
      '<div class="field"><label>Translation</label>' +
        '<textarea data-path="bismillah.sub" rows="2">' + esc(D.bismillah.sub) + '</textarea></div>' +

      '<div class="field"><label>Salam greeting</label>' +
        '<input type="text" data-path="salam" value="' + esc(D.salam) + '"></div>' +

      '<div class="switch-row"><span>Show Ayah section</span>' +
        '<input type="checkbox" data-path="ayah.show" ' + (D.ayah.show ? 'checked' : '') + '></div>' +
      '<div class="field"><label>Ayah Arabic</label>' +
        '<textarea dir="rtl" data-path="ayah.ar" rows="2">' + esc(D.ayah.ar) + '</textarea></div>' +
      '<div class="field"><label>Ayah translation</label>' +
        '<textarea data-path="ayah.translation" rows="3">' + esc(D.ayah.translation) + '</textarea></div>' +
      '<div class="field"><label>Ayah reference</label>' +
        '<input type="text" data-path="ayah.reference" value="' + esc(D.ayah.reference) + '"></div>' +

      '<p class="field-label">Invitation text</p>' +
      '<div class="field"><label>English</label>' +
        '<textarea data-path="inviteEn" rows="3">' + esc(D.inviteEn) + '</textarea></div>' +
      '<div class="field"><label>Roman Urdu</label>' +
        '<textarea data-path="inviteRoman" rows="3">' + esc(D.inviteRoman) + '</textarea></div>' +
      '<div class="field"><label>Host family line</label>' +
        '<input type="text" data-path="host" value="' + esc(D.host) + '"></div>' +

      '<p class="field-label">Couple</p>' +
      '<div class="field"><label>First person name</label>' +
        '<input type="text" data-path="person1.name" value="' + esc(D.person1.name) + '"></div>' +
      '<div class="field"><label>First person sub-line</label>' +
        '<input type="text" data-path="person1.sub" value="' + esc(D.person1.sub) + '"></div>' +
      '<div class="field"><label>Second person name</label>' +
        '<input type="text" data-path="person2.name" value="' + esc(D.person2.name) + '"></div>' +
      '<div class="field"><label>Second person sub-line</label>' +
        '<input type="text" data-path="person2.sub" value="' + esc(D.person2.sub) + '"></div>';
  }

  /* ==========================================================================
     PANEL: EVENTS
     ========================================================================== */
  function renderEventsPanel() {
    var el = document.getElementById('panel-events');
    if (!el) return;
    var html = '<p class="hint">Each event becomes a flip card in the timeline. The main event drives the countdown.</p>';
    state.events.forEach(function (ev, i) {
      var name = ev.name || ('Event ' + (i + 1));
      html +=
        '<details class="item-card" data-event-details="' + i + '">' +
          '<summary class="item-head">' +
            '<span class="item-title">' + esc(name) + '</span>' +
            (ev.isMain ? '<span class="badge-main">Main</span>' : '') +
          '</summary>' +
          '<div class="field"><label>Name</label>' +
            '<input type="text" data-path="events.' + i + '.name" value="' + esc(ev.name) + '"></div>' +
          '<div class="row2">' +
            '<div class="field"><label>Date</label>' +
              '<input type="date" data-path="events.' + i + '.date" value="' + esc(ev.date) + '"></div>' +
            '<div class="field"><label>Time (24h)</label>' +
              '<input type="time" data-path="events.' + i + '.time" value="' + esc(ev.time) + '"></div>' +
          '</div>' +
          '<div class="field"><label>Venue</label>' +
            '<input type="text" data-path="events.' + i + '.venue" value="' + esc(ev.venue) + '"></div>' +
          '<div class="field"><label>Address</label>' +
            '<textarea data-path="events.' + i + '.address" rows="2">' + esc(ev.address) + '</textarea></div>' +
          '<div class="field"><label>Map link (https://...)</label>' +
            '<input type="url" data-path="events.' + i + '.mapLink" value="' + esc(ev.mapLink) + '"></div>' +
          '<div class="field"><label>Dress code</label>' +
            '<input type="text" data-path="events.' + i + '.dress" value="' + esc(ev.dress) + '"></div>' +
          '<div class="field"><label>Note</label>' +
            '<input type="text" data-path="events.' + i + '.note" value="' + esc(ev.note) + '"></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-sm" type="button" data-action="up" data-index="' + i + '">Up</button>' +
            '<button class="btn btn-sm" type="button" data-action="down" data-index="' + i + '">Down</button>' +
            (!ev.isMain
              ? '<button class="btn btn-sm btn-gold" type="button" data-action="main" data-index="' + i + '">Set main</button>'
              : '') +
            '<button class="btn btn-sm danger" type="button" data-action="delete" data-index="' + i + '">Delete</button>' +
          '</div>' +
        '</details>';
    });
    html += '<button class="btn btn-gold" id="addEventBtn" type="button" style="margin-top:8px;">+ Add Event</button>';
    el.innerHTML = html;
  }

  function addEvent() {
    state.events.push({
      name: 'New Event', date: '', time: '', venue: '',
      address: '', mapLink: '', dress: '', note: '', isMain: false
    });
    renderEventsPanel();
    scheduleSave();
    updatePreview();
  }

  function moveEvent(idx, dir) {
    var n = idx + dir;
    if (n < 0 || n >= state.events.length) return;
    var tmp = state.events[idx];
    state.events[idx] = state.events[n];
    state.events[n] = tmp;
    renderEventsPanel();
    scheduleSave();
    updatePreview();
  }

  function setMainEvent(idx) {
    state.events.forEach(function (ev, i) { ev.isMain = (i === idx); });
    renderEventsPanel();
    scheduleSave();
    updatePreview();
  }

  function deleteEvent(idx) {
    if (!window.confirm('Delete this event?')) return;
    state.events.splice(idx, 1);
    var hasMain = state.events.some(function (ev) { return ev && ev.isMain; });
    if (!hasMain && state.events.length) state.events[0].isMain = true;
    renderEventsPanel();
    scheduleSave();
    updatePreview();
  }

  function handleEventsClick(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (t.id === 'addEventBtn') { addEvent(); return; }
    var action = t.getAttribute('data-action');
    if (!action) return;
    var idx = parseInt(t.getAttribute('data-index'), 10);
    if (isNaN(idx)) return;
    if (action === 'up') moveEvent(idx, -1);
    else if (action === 'down') moveEvent(idx, 1);
    else if (action === 'main') setMainEvent(idx);
    else if (action === 'delete') deleteEvent(idx);
  }

  /* ==========================================================================
     PANEL: STORY & PHOTOS (includes Dua toggles)
     ========================================================================== */
  function renderStoryPanel() {
    var el = document.getElementById('panel-story');
    if (!el) return;
    var gal = '';
    state.gallery.forEach(function (src, i) {
      gal +=
        '<div class="photo-cell">' +
          '<img src="' + esc(src) + '" alt="Photo ' + (i + 1) + '">' +
          '<button type="button" class="photo-remove" data-remove-photo="' + i + '" ' +
            'aria-label="Remove photo ' + (i + 1) + '">&times;</button>' +
        '</div>';
    });
    var disabled = state.gallery.length >= 8 ? ' disabled' : '';

    el.innerHTML =
      '<div class="switch-row"><span>Show Our Story section</span>' +
        '<input type="checkbox" data-path="story.show" ' + (state.story.show ? 'checked' : '') + '></div>' +
      '<div class="field"><label>Story title</label>' +
        '<input type="text" data-path="story.title" value="' + esc(state.story.title) + '"></div>' +
      '<div class="field"><label>Story text</label>' +
        '<textarea data-path="story.text" rows="4">' + esc(state.story.text) + '</textarea></div>' +

      '<div class="switch-row"><span>Show Dua section</span>' +
        '<input type="checkbox" data-path="dua.show" ' + (state.dua.show ? 'checked' : '') + '></div>' +
      '<div class="field"><label>Dua Arabic</label>' +
        '<input type="text" dir="rtl" data-path="dua.ar" value="' + esc(state.dua.ar) + '"></div>' +
      '<div class="field"><label>Dua translation</label>' +
        '<textarea data-path="dua.translation" rows="2">' + esc(state.dua.translation) + '</textarea></div>' +

      '<p class="field-label">Gallery (' + state.gallery.length + '/8)</p>' +
      '<p class="hint">Photos are resized to 1200px max and stored as JPEG in the card.</p>' +
      '<input type="file" id="photoInput" accept="image/*" multiple' + disabled + '>' +
      '<div class="photo-grid">' + gal + '</div>';
  }

  function resizeImage(file, maxDim, quality, cb) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        var w = img.width;
        var h = img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var nw = Math.max(1, Math.round(w * scale));
        var nh = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = nw;
        canvas.height = nh;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, nw, nh);
        try {
          cb(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
          cb(null);
        }
      };
      img.onerror = function () { cb(null); };
      img.src = ev.target.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  function checkMediaSize() {
    var total = 0;
    state.gallery.forEach(function (s) { total += s.length; });
    if (state.music) total += state.music.length;
    if (total > 8 * 1024 * 1024) {
      window.alert('Total media is over 8MB. The card may be slow to open. Consider removing a photo or the music.');
    }
  }

  function handlePhotoFiles(files) {
    if (!files || !files.length) return;
    var remaining = 8 - state.gallery.length;
    if (remaining <= 0) return;
    var list = Array.prototype.slice.call(files, 0, remaining);
    var done = 0;
    var total = list.length;
    list.forEach(function (file) {
      if (!file || !/^image\//.test(file.type)) {
        done += 1;
        if (done === total) finish();
        return;
      }
      resizeImage(file, 1200, 0.75, function (dataUrl) {
        if (dataUrl) state.gallery.push(dataUrl);
        done += 1;
        if (done === total) finish();
      });
    });
    function finish() {
      renderStoryPanel();
      scheduleSave();
      updatePreview();
      checkMediaSize();
    }
  }

  function handleStoryChange(e) {
    var t = e.target;
    if (!t) return;
    if (t.id === 'photoInput') {
      handlePhotoFiles(t.files);
      t.value = '';
    }
  }

  function handleStoryClick(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var rm = t.getAttribute('data-remove-photo');
    if (rm === null) return;
    var idx = parseInt(rm, 10);
    if (isNaN(idx)) return;
    state.gallery.splice(idx, 1);
    renderStoryPanel();
    scheduleSave();
    updatePreview();
  }

  /* ==========================================================================
     PANEL: MUSIC
     ========================================================================== */
  function renderMusicPanel() {
    var el = document.getElementById('panel-music');
    if (!el) return;
    var cur = '';
    if (state.music) {
      var kb = Math.round(state.music.length / 1024);
      cur =
        '<p class="hint">Current audio: uploaded (' + kb + ' KB)</p>' +
        '<button class="btn btn-sm danger" id="removeMusic" type="button">Remove music</button>';
    }
    el.innerHTML =
      '<p class="field-label">Nasheed or soft background sound (optional)</p>' +
      '<p class="hint">Plays when the guest taps the seal. Keep it under 3MB for fast loading. MP3 recommended.</p>' +
      '<input type="file" id="musicInput" accept="audio/*">' +
      cur;
  }

  function handleMusicChange(e) {
    var t = e.target;
    if (!t || t.id !== 'musicInput') return;
    var file = t.files && t.files[0];
    t.value = '';
    if (!file) return;
    if (!/^audio\//.test(file.type)) {
      window.alert('Please choose an audio file (MP3, M4A, OGG).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      if (!window.confirm('This audio is over 3MB. Large files make the card slow to open. Continue?')) {
        return;
      }
    }
    var reader = new FileReader();
    reader.onload = function (ev) {
      state.music = String(ev.target.result || '');
      renderMusicPanel();
      scheduleSave();
      updatePreview();
      checkMediaSize();
    };
    reader.onerror = function () {
      window.alert('Could not read the audio file.');
    };
    reader.readAsDataURL(file);
  }

  function handleMusicClick(e) {
    var t = e.target;
    if (!t || t.id !== 'removeMusic') return;
    state.music = '';
    renderMusicPanel();
    scheduleSave();
    updatePreview();
  }

  /* ==========================================================================
     PANEL: CONTACTS & RSVP
     ========================================================================== */
  function renderRsvpPanel() {
    var el = document.getElementById('panel-rsvp');
    if (!el) return;
    var contactsHtml = '';
    state.contacts.forEach(function (c, i) {
      contactsHtml +=
        '<div class="row2">' +
          '<div class="field"><label>Label ' + (i + 1) + '</label>' +
            '<input type="text" data-path="contacts.' + i + '.label" value="' + esc(c.label) + '"></div>' +
          '<div class="field"><label>Phone</label>' +
            '<input type="tel" data-path="contacts.' + i + '.phone" value="' + esc(c.phone) + '"></div>' +
        '</div>';
    });

    var addBtn = state.contacts.length < 3
      ? '<button class="btn btn-sm" id="addContact" type="button">+ Add contact</button>'
      : '';

    el.innerHTML =
      '<div class="switch-row"><span>Show RSVP section</span>' +
        '<input type="checkbox" data-path="rsvp.show" ' + (state.rsvp.show ? 'checked' : '') + '></div>' +
      '<div class="field"><label>WhatsApp number (country code, digits only)</label>' +
        '<input type="tel" data-path="rsvp.whatsapp" value="' + esc(state.rsvp.whatsapp) + '"></div>' +
      '<div class="field"><label>RSVP note</label>' +
        '<input type="text" data-path="rsvp.note" value="' + esc(state.rsvp.note) + '"></div>' +
      '<p class="field-label">Contacts (up to 3)</p>' +
      contactsHtml +
      addBtn +
      '<p class="hint">Contacts appear inside the RSVP section of the finished card.</p>';
  }

  function handleRsvpClick(e) {
    var t = e.target;
    if (!t || t.id !== 'addContact') return;
    if (state.contacts.length >= 3) return;
    state.contacts.push({ label: '', phone: '' });
    renderRsvpPanel();
    scheduleSave();
    updatePreview();
  }

  /* ==========================================================================
     PANEL: THEME
     ========================================================================== */
  function renderThemePanel() {
    var el = document.getElementById('panel-theme');
    if (!el) return;
    var themes = [
      { id: 'emerald',    label: 'Emerald',    bg: '#08241b', fg: '#d4af37' },
      { id: 'midnight',   label: 'Midnight',   bg: '#09162c', fg: '#d6b25c' },
      { id: 'ivory-sage', label: 'Ivory Sage', bg: '#f6f3e9', fg: '#8a6a1c' },
      { id: 'rose-gold',  label: 'Rose Gold',  bg: '#2d1019', fg: '#e0a9a0' }
    ];
    var html = '<p class="hint">Pick a colour palette for the invitation card.</p><div class="theme-grid">';
    themes.forEach(function (t) {
      html +=
        '<button class="theme-btn' + (state.theme === t.id ? ' active' : '') + '" ' +
          'type="button" data-theme-id="' + t.id + '">' +
          '<span class="swatch" style="background:' + t.bg + ';border-color:' + t.fg + '"></span>' +
          '<span>' + t.label + '</span>' +
        '</button>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function handleThemeClick(e) {
    var t = e.target;
    while (t && t !== this && (!t.getAttribute || !t.getAttribute('data-theme-id'))) {
      t = t.parentNode;
    }
    if (!t || t === this) return;
    var id = t.getAttribute('data-theme-id');
    if (!id) return;
    state.theme = id;
    renderThemePanel();
    scheduleSave();
    updatePreview();
  }

  /* ==========================================================================
     TABS
     ========================================================================== */
  function setupTabs() {
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');
    Array.prototype.forEach.call(tabs, function (t) {
      t.addEventListener('click', function () {
        var name = t.getAttribute('data-tab');
        Array.prototype.forEach.call(tabs, function (x) {
          var active = x.getAttribute('data-tab') === name;
          x.classList.toggle('active', active);
          x.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        Array.prototype.forEach.call(panels, function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === name);
        });
      });
    });
  }

  /* ==========================================================================
     MOBILE SHEET
     ========================================================================== */
  function setupSheet() {
    if (!editorEl || !editBtn || !sheetBackdrop) return;
    editBtn.addEventListener('click', function () {
      editorEl.classList.add('open');
      sheetBackdrop.hidden = false;
    });
    sheetBackdrop.addEventListener('click', function () {
      editorEl.classList.remove('open');
      sheetBackdrop.hidden = true;
    });
    var handle = editorEl.querySelector('.sheet-handle');
    if (handle) {
      handle.style.cursor = 'pointer';
      handle.addEventListener('click', function () {
        editorEl.classList.remove('open');
        sheetBackdrop.hidden = true;
      });
    }
  }

  /* ==========================================================================
     DOWNLOAD & RESET
     ========================================================================== */
  function downloadCard() {
    try {
      var html = window.buildCardHTML(state);
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var n1 = slug(state.person1 && state.person1.name) || 'groom';
      var n2 = slug(state.person2 && state.person2.name) || 'bride';
      var a = document.createElement('a');
      a.href = url;
      a.download = n1 + '-' + n2 + '-nikah-card.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 400);
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      setTimeout(function () { window.location.reload(); }, 1500);
    } catch (e) {
      showError('Download failed: ' + (e && e.message ? e.message : String(e)));
    }
  }

  function resetAll() {
    if (!window.confirm('Reset the card and clear the draft? This cannot be undone.')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    window.location.reload();
  }

  /* ==========================================================================
     INIT — everything runs here, in a try/catch, with a finally that hides
     the loader so we never show an endless spinner.
     ========================================================================== */
  function init() {
    buildInitialState();
    setupTabs();
    setupSheet();

    // delegated input handling
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleInput);
    document.addEventListener('change', handleStoryChange);
    document.addEventListener('change', handleMusicChange);

    // per-panel click handlers (delegated so they survive re-renders)
    var panelEvents = document.getElementById('panel-events');
    if (panelEvents) panelEvents.addEventListener('click', handleEventsClick);
    var panelStory = document.getElementById('panel-story');
    if (panelStory) panelStory.addEventListener('click', handleStoryClick);
    var panelMusic = document.getElementById('panel-music');
    if (panelMusic) panelMusic.addEventListener('click', handleMusicClick);
    var panelRsvp = document.getElementById('panel-rsvp');
    if (panelRsvp) panelRsvp.addEventListener('click', handleRsvpClick);
    var panelTheme = document.getElementById('panel-theme');
    if (panelTheme) panelTheme.addEventListener('click', handleThemeClick);

    // render all panels before the first preview
    renderBasicPanel();
    renderEventsPanel();
    renderStoryPanel();
    renderMusicPanel();
    renderRsvpPanel();
    renderThemePanel();

    // header buttons
    if (downloadBtn) downloadBtn.addEventListener('click', downloadCard);
    if (resetBtn) resetBtn.addEventListener('click', resetAll);

    // first preview
    updatePreview();
  }

  try {
    init();
  } catch (err) {
    showError('Builder failed to start: ' + (err && err.message ? err.message : String(err)));
  } finally {
    hideLoader();
  }

})();
// END OF FILE builder.js
