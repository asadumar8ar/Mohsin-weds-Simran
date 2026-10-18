/* ============================================================
   NIKAH CARD BUILDER — builder.js
   The editor: renders form fields, live preview, download, autosave.

   Robustness rules followed here:
   1. Every uncaught error shows in a red box at the top.
   2. The editor UI is built BEFORE any network fetch.
   3. DOM elements are found by content, and created if missing.
   4. Missing card.js shows a clear message, never a spinner.
   5. card.css is fetched with an 8s timeout and a CSS fallback.
   6. The "Preparing your card" loader is always hidden at the end.

   Only ES2017 syntax is used (no optional chaining, no ??, no
   replaceAll, no top-level await, no class fields).
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. GLOBAL ERROR HANDLERS
     ============================================================ */

  window.onerror = function (message, file, line, col) {
    try {
      showError('Error: ' + message + '  (' + file + ':' + line + ':' + col + ')');
    } catch (ignore) {}
  };

  window.addEventListener('unhandledrejection', function (event) {
    try {
      var reason = event.reason;
      var msg = reason && reason.message ? reason.message : String(reason);
      showError('Unhandled promise rejection: ' + msg);
    } catch (ignore) {}
  });

  function showError(message) {
    try {
      var box = document.getElementById('nk-error-box');
      if (!box) {
        box = document.createElement('div');
        box.id = 'nk-error-box';
        box.style.cssText =
          'position:fixed;top:0;left:0;right:0;z-index:99999;' +
          'background:#c0392b;color:#fff;padding:10px 14px;' +
          'font-family:monospace;font-size:12px;line-height:1.5;' +
          'white-space:pre-wrap;max-height:40vh;overflow-y:auto;' +
          'box-shadow:0 2px 12px rgba(0,0,0,0.5);';
        document.body.appendChild(box);
      }
      var stamp = new Date().toLocaleTimeString();
      box.textContent += '[' + stamp + '] ' + message + '\n';
    } catch (e) {
      try { console.error(message); } catch (e2) {}
    }
  }

  /* ============================================================
     2. CONSTANTS
     ============================================================ */

  var STORAGE_KEY = 'nikahCardDraft';
  var PHOTO_MAX = 1200;
  var PHOTO_QUALITY = 0.75;
  var MUSIC_MAX = 3 * 1024 * 1024;
  var TOTAL_MAX = 8 * 1024 * 1024;
  var MAX_PHOTOS = 8;

  var VALID_THEMES = ['emerald', 'midnight', 'ivory-sage', 'rose-gold'];

  // Which keys of DEFAULT_CARD belong in which tab.
  var TABS = [
    { id: 'basic', label: 'Basic', keys: [
      'sealInitials', 'bismillah', 'salam', 'ayah',
      'inviteEn', 'inviteRoman', 'host',
      'person1', 'person2', 'dua', 'footer'
    ] },
    { id: 'events', label: 'Events', keys: ['events'] },
    { id: 'story-photos', label: 'Story and Photos', keys: ['story', 'gallery'] },
    { id: 'music', label: 'Music', keys: ['music'] },
    { id: 'contacts', label: 'Contacts and RSVP', keys: ['rsvp', 'contacts'] },
    { id: 'theme', label: 'Theme', keys: ['theme'] }
  ];

  // Friendly labels for keys. Falls back to humanize().
  var LABELS = {
    sealInitials: 'Seal initials',
    bismillah: 'Bismillah',
    salam: 'Salam greeting',
    ayah: 'Ayah',
    inviteEn: 'English invitation',
    inviteRoman: 'Roman (Hinglish) invitation',
    host: 'Host family line',
    person1: 'Person 1',
    person2: 'Person 2',
    events: 'Events',
    story: 'Our Story',
    gallery: 'Photos',
    dua: 'Dua',
    music: 'Music',
    rsvp: 'RSVP',
    contacts: 'Contacts',
    footer: 'Footer',
    theme: 'Theme',
    arabic: 'Arabic (exact)',
    translation: 'English meaning',
    sub: 'Subtitle',
    reference: 'Reference',
    name: 'Name',
    text: 'Text',
    title: 'Title',
    show: 'Show this section',
    src: 'File',
    whatsapp: 'WhatsApp number',
    note: 'Note',
    label: 'Label',
    phone: 'Phone',
    thanks: 'Thanks text',
    family: 'Family line',
    closing: 'Closing line',
    date: 'Date',
    time: 'Time',
    venue: 'Venue',
    address: 'Address',
    mapLink: 'Map link (https://...)',
    dress: 'Dress code',
    isMain: 'Main event'
  };

  // Minimal CSS used if card.css cannot be loaded. Keeps the preview
  // readable so the owner can still edit and download.
  var FALLBACK_CSS =
    '*,*::before,*::after{box-sizing:border-box;}' +
    'body{margin:0;background:#04211c;color:#f3efe1;font-family:Georgia,serif;' +
      'line-height:1.6;overflow-x:hidden;}' +
    'body.gate-closed{overflow:hidden;height:100vh;}' +
    'h1,h2,h3,p,figure,dl,dd{margin:0;}img{max-width:100%;display:block;}' +
    'button{font:inherit;color:inherit;cursor:pointer;}a{color:#e6c27e;}' +
    '.gate{position:fixed;inset:0;background:#030a09;display:grid;' +
      'place-items:center;z-index:100;}' +
    '.gate.is-done{display:none;}' +
    '.gate__seal{width:120px;height:120px;border-radius:50%;background:#e6c27e;' +
      'color:#04211c;border:2px solid #fff4d4;cursor:pointer;' +
      'font-family:cursive;font-size:1.4rem;}' +
    '.gate__title,.gate__title-en,.gate__seal-tap{color:#e6c27e;text-align:center;' +
      'margin:8px;font-size:14px;}' +
    '.gate__envelope{width:300px;height:220px;background:#0a2e26;' +
      'border:1px solid #e6c27e;border-radius:8px;position:relative;' +
      'display:grid;place-items:center;}' +
    '#fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;}' +
    '#card{position:relative;z-index:2;}' +
    '.scene{padding:2rem 1rem;}.scene__inner{max-width:640px;margin:0 auto;}' +
    '.hero{min-height:80vh;display:grid;place-items:center;text-align:center;}' +
    '.hero__name{font-family:cursive;font-size:2.5rem;color:#e6c27e;display:block;}' +
    '.hero__bismillah{font-size:1.3rem;color:#e6c27e;text-align:center;}' +
    '.hero__bismillah-sub{font-style:italic;text-align:center;color:#a8b8b0;}' +
    '.hero__heart{display:inline-block;color:#e6c27e;}' +
    '.hero__date{color:#e6c27e;text-align:center;margin:1rem 0;}' +
    '.salam,.events,.countdown,.venue,.story,.dua,.rsvp,.footer{' +
      'text-align:center;padding:2rem 1rem;}' +
    '.gold-text{color:#e6c27e;}.hand{font-family:cursive;}' +
    '.btn{display:inline-block;padding:0.6rem 1rem;border:1px solid #e6c27e;' +
      'border-radius:999px;color:#e6c27e;background:transparent;' +
      'text-decoration:none;font-size:0.75rem;letter-spacing:0.1em;' +
      'text-transform:uppercase;margin:0.3rem;}' +
    '.event-card{display:block;width:100%;background:rgba(255,255,255,0.05);' +
      'border:1px solid #e6c27e;border-radius:12px;padding:1rem;' +
      'margin:0.5rem 0;text-align:left;color:#f3efe1;}' +
    '.event-card__name{font-family:cursive;font-size:1.5rem;color:#e6c27e;}' +
    '.gallery{display:flex;gap:0.7rem;overflow-x:auto;padding:0.5rem;}' +
    '.polaroid{flex:0 0 200px;background:#fbf8ee;padding:0.5rem;border-radius:4px;}' +
    '.polaroid img{width:100%;height:auto;}' +
    '.mute{position:fixed;right:14px;bottom:14px;width:46px;height:46px;' +
      'border-radius:50%;border:1px solid #e6c27e;background:rgba(0,0,0,0.5);' +
      'color:#e6c27e;cursor:pointer;z-index:55;}' +
    '.clock{display:flex;justify-content:center;gap:0.5rem;flex-wrap:wrap;' +
      'margin:1rem 0;}.clock__unit{text-align:center;}' +
    '.clock__digits{display:flex;gap:2px;}' +
    '.digit{display:inline-block;padding:0.3rem 0.4rem;' +
      'background:rgba(255,255,255,0.1);border:1px solid #e6c27e;' +
      'border-radius:4px;font-weight:bold;}' +
    '.clock__label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;' +
      'color:#e6c27e;}' +
    '.venue__tab{padding:0.4rem 0.8rem;border:1px solid #e6c27e;' +
      'background:transparent;color:#f3efe1;border-radius:999px;' +
      'margin:0.2rem;cursor:pointer;}' +
    '.venue__tab[aria-selected="true"]{background:#e6c27e;color:#04211c;}' +
    '.countdown__target{font-size:12px;color:#e6c27e;text-align:center;}' +
    '.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
      'background:#072b24;color:#e6c27e;padding:8px 16px;border-radius:999px;' +
      'border:1px solid #e6c27e;opacity:0;transition:opacity 0.3s;' +
      'z-index:120;font-size:12px;}.toast.is-visible{opacity:1;}' +
    '.stagger>*{opacity:0;transform:translateY(10px);transition:all 0.6s;}' +
    '.scene.is-in .stagger>*{opacity:1;transform:none;}';

  /* ============================================================
     3. STATE
     ============================================================ */

  var state = null;
  var cssText = '';
  var currentTab = 'basic';
  var previewTimer = 0;
  var saveTimer = 0;

  /* ============================================================
     4. TINY HELPERS
     ============================================================ */

  function humanize(key) {
    var spaced = key.replace(/([A-Z])/g, ' $1').replace(/(\d)/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  }

  function label(key) {
    return LABELS[key] || humanize(key);
  }

  function slugify(value) {
    var out = String(value || 'card')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return out || 'card';
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function dataUrlBytes(url) {
    if (typeof url !== 'string' || url.indexOf('data:') !== 0) return 0;
    var comma = url.indexOf(',');
    if (comma < 0) return 0;
    return Math.floor((url.length - comma - 1) * 0.75);
  }

  function getByPath(root, path) {
    var node = root;
    for (var i = 0; i < path.length; i++) node = node[path[i]];
    return node;
  }

  function setByPath(root, path, value) {
    var node = root;
    for (var i = 0; i < path.length - 1; i++) node = node[path[i]];
    node[path[path.length - 1]] = value;
  }

  function clone(value) {
    if (value === null || typeof value !== 'object') return value;
    try { return JSON.parse(JSON.stringify(value)); } catch (e) { return value; }
  }

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach(function (key) {
      var v = extra[key];
      var existing = out[key];
      if (v && typeof v === 'object' && !Array.isArray(v) &&
          existing && typeof existing === 'object' && !Array.isArray(existing)) {
        out[key] = deepMerge(existing, v);
      } else {
        out[key] = v;
      }
    });
    return out;
  }

  /* ============================================================
     5. STATE LOADING
     ============================================================ */

  function loadState() {
    var base;
    try { base = clone(window.DEFAULT_CARD) || {}; } catch (e) { base = {}; }
    if (!base || typeof base !== 'object') base = {};
    if (!Array.isArray(base.events)) base.events = [];
    if (!Array.isArray(base.gallery)) base.gallery = [];
    if (!Array.isArray(base.contacts)) base.contacts = [];

    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var draft = JSON.parse(raw);
        if (draft && typeof draft === 'object') {
          base = deepMerge(base, draft);
        }
      }
    } catch (e) {
      // Corrupt draft. Ignore and start fresh.
    }

    if (VALID_THEMES.indexOf(base.theme) === -1) base.theme = 'emerald';

    return base;
  }

  /* ============================================================
     6. AUTOSAVE
     ============================================================ */

  function saveDraft() {
    try {
      var draft = clone(state);
      draft.gallery = [];
      if (draft.music) draft.music.src = '';
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      showSavedIndicator();
    } catch (e) {
      // Storage full or blocked. Ignore silently.
    }
  }

  function scheduleSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      saveTimer = 0;
      saveDraft();
    }, 700);
  }

  var savedNode = null;

  function showSavedIndicator() {
    if (!savedNode) {
      savedNode = document.createElement('div');
      savedNode.id = 'nk-saved-indicator';
      savedNode.style.cssText =
        'position:fixed;bottom:14px;left:50%;transform:translateX(-50%);' +
        'background:#072b24;border:1px solid rgba(230,194,126,0.4);' +
        'color:#e6c27e;padding:6px 14px;border-radius:999px;' +
        'font-family:Georgia,serif;font-size:11px;letter-spacing:0.1em;' +
        'text-transform:uppercase;z-index:70;opacity:0;' +
        'transition:opacity 0.3s;pointer-events:none;';
      savedNode.textContent = 'Draft saved automatically';
      document.body.appendChild(savedNode);
    }
    savedNode.style.opacity = '1';
    window.clearTimeout(showSavedIndicator._t);
    showSavedIndicator._t = window.setTimeout(function () {
      if (savedNode) savedNode.style.opacity = '0';
    }, 1500);
  }

  /* ============================================================
     7. DOM FINDERS
     ============================================================ */

  function findButtonByText(text) {
    var all = document.querySelectorAll('button, a, [role="button"]');
    var lower = String(text).toLowerCase();
    for (var i = 0; i < all.length; i++) {
      var t = (all[i].textContent || '').trim().toLowerCase();
      if (t === lower) return all[i];
    }
    return null;
  }

  function findLoaderByText() {
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var node = all[i];
      if (node.children.length > 2) continue;
      if (/preparing your card/i.test(node.textContent || '')) {
        // Walk up to find a matching overlay container.
        var p = node;
        for (var j = 0; j < 4 && p && p !== document.body; j++) {
          if (/loading|loader/i.test(p.className || '')) return p;
          p = p.parentElement;
        }
        return node;
      }
    }
    return null;
  }

  function ensureIframe() {
    var iframe = document.querySelector('iframe');
    if (iframe) return iframe;
    var wrap = document.createElement('div');
    wrap.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:#04211c;z-index:1;';
    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('title', 'Live preview');
    iframe.style.cssText = 'width:100%;height:100%;border:0;background:#04211c;';
    wrap.appendChild(iframe);
    document.body.appendChild(wrap);
    return iframe;
  }

  function ensureEditorPanel() {
    var panel = document.querySelector('aside.editor, .editor, [class*="editor-panel"]');
    if (panel && panel !== document.body && panel !== document.documentElement) {
      return panel;
    }

    var all = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,div,span,button,aside');
    for (var i = 0; i < all.length; i++) {
      var node = all[i];
      if (node.children.length > 2) continue;
      if (!/^edit\s*card$/i.test((node.textContent || '').trim())) continue;
      var p = node.parentElement;
      for (var j = 0; j < 6 && p && p !== document.body; j++) {
        var rect = p.getBoundingClientRect();
        if (rect.height > 100) return p;
        p = p.parentElement;
      }
    }

    var newPanel = document.createElement('div');
    newPanel.id = 'nk-editor';
    newPanel.style.cssText =
      'position:fixed;left:0;top:0;bottom:0;width:360px;max-width:90vw;' +
      'background:#072b24;color:#f3efe1;overflow-y:auto;z-index:60;' +
      'border-right:1px solid rgba(230,194,126,0.25);' +
      'display:flex;flex-direction:column;';
    document.body.appendChild(newPanel);
    return newPanel;
  }

  function ensureTabs(panel) {
    if (!panel) return null;
    var existing = panel.querySelector(
      '#editorTabs, .ed-tabs, .editor-tabs, [role="tablist"], .nk-tabs'
    );
    if (existing) return existing;
    var tabs = document.createElement('div');
    tabs.className = 'nk-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.style.cssText =
      'display:flex;gap:4px;padding:8px 10px;overflow-x:auto;flex:0 0 auto;' +
      'border-bottom:1px solid rgba(230,194,126,0.2);';
    panel.appendChild(tabs);
    return tabs;
  }

  function ensureBody(panel) {
    if (!panel) return null;
    var existing = panel.querySelector(
      '#editorBody, .ed-body, .editor__body, .nk-body'
    );
    if (existing) return existing;
    var body = document.createElement('div');
    body.className = 'nk-body';
    body.style.cssText = 'padding:10px;overflow-y:auto;flex:1 1 auto;';
    panel.appendChild(body);
    return body;
  }

  function hideLoader(loader) {
    var target = loader || findLoaderByText();
    if (target) {
      target.classList.add('is-hidden');
      target.style.display = 'none';
      target.style.opacity = '0';
      target.style.visibility = 'hidden';
      target.setAttribute('aria-hidden', 'true');
    }
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var node = all[i];
      if (node.children.length > 2) continue;
      if (/preparing your card/i.test(node.textContent || '')) {
        node.style.display = 'none';
      }
    }
  }

  /* ============================================================
     8. PHOTO RESIZE
     ============================================================ */

  function resizePhoto(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (Math.max(w, h) > PHOTO_MAX) {
            var r = PHOTO_MAX / Math.max(w, h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var result = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
          URL.revokeObjectURL(url);
          resolve(result);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read image'));
      };
      img.src = url;
    });
  }

  /* ============================================================
     9. GENERIC FIELD RENDERERS
     ============================================================ */

  function renderFields(container, obj, basePath) {
    if (!obj || typeof obj !== 'object') return;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      renderOneField(container, k, obj[k], basePath.concat([k]));
    }
  }

  function renderOneField(container, key, value, path) {
    if (key === 'theme') return renderThemeSelect(container, path, value);
    if (key === 'events') return renderEventsEditor(container, path, value);
    if (key === 'contacts') return renderContactsEditor(container, path, value);
    if (key === 'gallery') return renderGalleryEditor(container, path, value);
    if (key === 'music') return renderMusicEditor(container, path, value);

    if (typeof value === 'boolean') {
      return renderCheckbox(container, path, value, key);
    }
    if (typeof value === 'string') {
      return renderTextInput(container, path, value, key);
    }
    if (Array.isArray(value)) {
      // Not expected at the top level besides the special cases above.
      return;
    }
    if (value && typeof value === 'object') {
      return renderNestedGroup(container, key, value, path);
    }
    // Numbers or null: treat as text input.
    return renderTextInput(
      container,
      path,
      value === null || value === undefined ? '' : String(value),
      key
    );
  }

  function renderNestedGroup(container, key, value, path) {
    var group = document.createElement('div');
    group.style.cssText =
      'border:1px solid rgba(230,194,126,0.18);border-radius:8px;' +
      'padding:10px;margin:10px 0;background:rgba(255,255,255,0.02);';

    var heading = document.createElement('p');
    heading.style.cssText =
      'font-size:10px;letter-spacing:0.16em;text-transform:uppercase;' +
      'color:#e6c27e;margin:0 0 8px;';
    heading.textContent = label(key);
    group.appendChild(heading);

    renderFields(group, value, path);
    container.appendChild(group);
  }

  function renderTextInput(container, path, value, key) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:block;margin:8px 0;';

    var lbl = document.createElement('span');
    lbl.style.cssText =
      'display:block;font-size:10px;letter-spacing:0.16em;' +
      'text-transform:uppercase;color:#e6c27e;margin-bottom:4px;';
    lbl.textContent = label(key);
    wrap.appendChild(lbl);

    var isLong = String(value).length > 80 || String(value).indexOf('\n') !== -1;
    var input;
    if (isLong) {
      input = document.createElement('textarea');
      input.style.cssText =
        'width:100%;padding:8px;border:1px solid rgba(230,194,126,0.3);' +
        'border-radius:6px;background:rgba(0,0,0,0.25);color:#f3efe1;' +
        'font-family:Georgia,serif;font-size:14px;min-height:80px;' +
        'resize:vertical;box-sizing:border-box;';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.style.cssText =
        'width:100%;padding:8px;border:1px solid rgba(230,194,126,0.3);' +
        'border-radius:6px;background:rgba(0,0,0,0.25);color:#f3efe1;' +
        'font-family:Georgia,serif;font-size:14px;box-sizing:border-box;';
    }
    input.value = value;

    if (key === 'arabic' || key === 'salam') {
      input.setAttribute('dir', 'rtl');
      input.setAttribute('lang', 'ar');
    } else {
      input.setAttribute('dir', 'auto');
    }

    input.addEventListener('input', function () {
      setByPath(state, path, input.value);
      scheduleSave();
      schedulePreview();
    });

    wrap.appendChild(input);
    container.appendChild(wrap);
  }

  function renderCheckbox(container, path, value, key) {
    var wrap = document.createElement('label');
    wrap.style.cssText =
      'display:flex;align-items:center;gap:8px;margin:8px 0;cursor:pointer;';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.style.cssText = 'width:16px;height:16px;accent-color:#bf9546;';

    var span = document.createElement('span');
    span.textContent = label(key);
    span.style.cssText = 'font-size:13px;color:#f3efe1;';

    input.addEventListener('change', function () {
      setByPath(state, path, !!input.checked);
      scheduleSave();
      schedulePreview();
    });

    wrap.appendChild(input);
    wrap.appendChild(span);
    container.appendChild(wrap);
  }

  function renderThemeSelect(container, path, value) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:block;margin:8px 0;';

    var lbl = document.createElement('span');
    lbl.style.cssText =
      'display:block;font-size:10px;letter-spacing:0.16em;' +
      'text-transform:uppercase;color:#e6c27e;margin-bottom:4px;';
    lbl.textContent = 'Theme';
    wrap.appendChild(lbl);

    var select = document.createElement('select');
    select.style.cssText =
      'width:100%;padding:8px;border:1px solid rgba(230,194,126,0.3);' +
      'border-radius:6px;background:rgba(0,0,0,0.25);color:#f3efe1;' +
      'font-family:Georgia,serif;font-size:14px;box-sizing:border-box;';

    VALID_THEMES.forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ');
      if (t === value) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      setByPath(state, path, select.value);
      scheduleSave();
      schedulePreview();
    });

    wrap.appendChild(select);
    container.appendChild(wrap);
  }

  /* ============================================================
     10. SPECIAL EDITORS
     ============================================================ */

  function makeSmallButton(text, disabled, handler, danger) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.disabled = !!disabled;
    btn.style.cssText =
      'padding:4px 8px;border-radius:4px;font-family:Georgia,serif;' +
      'font-size:10px;cursor:' + (disabled ? 'not-allowed' : 'pointer') + ';' +
      'background:transparent;' +
      'border:1px solid ' + (danger ? 'rgba(255,155,155,0.4)' : 'rgba(230,194,126,0.3)') + ';' +
      'color:' + (danger ? '#ff9b9b' : '#f3efe1') + ';' +
      (disabled ? 'opacity:0.4;' : '');
    btn.addEventListener('click', handler);
    return btn;
  }

  function renderEventsEditor(container, path, events) {
    if (!Array.isArray(events)) {
      events = [];
      setByPath(state, path, events);
    }

    var group = document.createElement('div');
    group.style.cssText = 'margin:10px 0;';

    var heading = document.createElement('p');
    heading.style.cssText =
      'font-size:11px;letter-spacing:0.16em;text-transform:uppercase;' +
      'color:#e6c27e;margin:0 0 8px;';
    heading.textContent = 'Events (' + events.length + ')';
    group.appendChild(heading);

    for (var i = 0; i < events.length; i++) {
      group.appendChild(makeEventBlock(path, i, events.length));
    }

    var add = document.createElement('button');
    add.type = 'button';
    add.textContent = '+ Add Event';
    add.style.cssText =
      'width:100%;padding:10px;border:1px dashed rgba(230,194,126,0.4);' +
      'border-radius:8px;background:transparent;color:#e6c27e;' +
      'cursor:pointer;margin-top:8px;font-family:Georgia,serif;font-size:12px;';
    add.addEventListener('click', function () {
      var arr = getByPath(state, path);
      arr.push({
        name: 'New Event',
        date: '',
        time: '',
        venue: '',
        address: '',
        mapLink: '',
        dress: '',
        note: '',
        isMain: arr.length === 0
      });
      rebuildCurrentTab();
      scheduleSave();
      schedulePreview();
    });
    group.appendChild(add);

    container.appendChild(group);
  }

  function makeEventBlock(basePath, index, total) {
    var event = getByPath(state, basePath)[index];
    var details = document.createElement('details');
    details.style.cssText =
      'border:1px solid rgba(230,194,126,0.2);border-radius:6px;' +
      'padding:8px;margin-bottom:8px;background:rgba(255,255,255,0.02);';
    if (index === 0) details.open = true;

    var summary = document.createElement('summary');
    summary.style.cssText =
      'cursor:pointer;font-size:12px;color:#f3efe1;' +
      'display:flex;justify-content:space-between;';
    var sName = document.createElement('span');
    sName.textContent = (event.name || 'Event') + (event.isMain ? ' ★ Main' : '');
    summary.appendChild(sName);
    details.appendChild(summary);

    // Render every field on the event except isMain (shown as buttons).
    var keys = Object.keys(event);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k === 'isMain') continue;
      if (typeof event[k] === 'boolean') {
        renderCheckbox(details, basePath.concat([index, k]), event[k], k);
      } else if (typeof event[k] === 'string') {
        renderTextInput(details, basePath.concat([index, k]), event[k], k);
      }
    }

    var actions = document.createElement('div');
    actions.style.cssText =
      'display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;';

    actions.appendChild(makeSmallButton('↑ Up', index === 0, function () {
      var arr = getByPath(state, basePath);
      var tmp = arr[index - 1];
      arr[index - 1] = arr[index];
      arr[index] = tmp;
      rebuildCurrentTab();
      scheduleSave();
      schedulePreview();
    }));

    actions.appendChild(makeSmallButton('↓ Down', index === total - 1, function () {
      var arr = getByPath(state, basePath);
      var tmp = arr[index + 1];
      arr[index + 1] = arr[index];
      arr[index] = tmp;
      rebuildCurrentTab();
      scheduleSave();
      schedulePreview();
    }));

    actions.appendChild(makeSmallButton(
      event.isMain ? '★ Main event' : 'Set as main',
      !!event.isMain,
      function () {
        var arr = getByPath(state, basePath);
        for (var j = 0; j < arr.length; j++) arr[j].isMain = (j === index);
        rebuildCurrentTab();
        scheduleSave();
        schedulePreview();
      }
    ));

    actions.appendChild(makeSmallButton('Delete', false, function () {
      if (!window.confirm('Delete this event?')) return;
      var arr = getByPath(state, basePath);
      arr.splice(index, 1);
      var hasMain = false;
      for (var j = 0; j < arr.length; j++) if (arr[j].isMain) hasMain = true;
      if (arr.length && !hasMain) arr[0].isMain = true;
      rebuildCurrentTab();
      scheduleSave();
      schedulePreview();
    }, true));

    details.appendChild(actions);
    return details;
  }

  function renderContactsEditor(container, path, contacts) {
    if (!Array.isArray(contacts)) {
      contacts = [];
      setByPath(state, path, contacts);
    }
    while (contacts.length < 3) contacts.push({ label: '', phone: '' });

    var group = document.createElement('div');
    group.style.cssText = 'margin:10px 0;';

    var heading = document.createElement('p');
    heading.style.cssText =
      'font-size:11px;letter-spacing:0.16em;text-transform:uppercase;' +
      'color:#e6c27e;margin:0 0 8px;';
    heading.textContent = 'Contacts';
    group.appendChild(heading);

    for (var i = 0; i < 3; i++) {
      (function (index) {
        var row = document.createElement('div');
        row.style.cssText =
          'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;';

        var labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.placeholder = 'Label';
        labelInput.value = (getByPath(state, path)[index] || {}).label || '';
        labelInput.style.cssText =
          'padding:6px;border:1px solid rgba(230,194,126,0.3);' +
          'border-radius:4px;background:rgba(0,0,0,0.25);color:#f3efe1;' +
          'font-family:Georgia,serif;font-size:12px;box-sizing:border-box;';
        labelInput.addEventListener('input', function () {
          var arr = getByPath(state, path);
          if (!arr[index]) arr[index] = { label: '', phone: '' };
          arr[index].label = labelInput.value;
          scheduleSave();
          schedulePreview();
        });
        row.appendChild(labelInput);

        var phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.placeholder = 'Phone';
        phoneInput.value = (getByPath(state, path)[index] || {}).phone || '';
        phoneInput.style.cssText = labelInput.style.cssText;
        phoneInput.addEventListener('input', function () {
          var arr = getByPath(state, path);
          if (!arr[index]) arr[index] = { label: '', phone: '' };
          arr[index].phone = phoneInput.value;
          scheduleSave();
          schedulePreview();
        });
        row.appendChild(phoneInput);

        group.appendChild(row);
      })(i);
    }

    container.appendChild(group);
  }

  function renderGalleryEditor(container, path, photos) {
    if (!Array.isArray(photos)) {
      photos = [];
      setByPath(state, path, photos);
    }

    var group = document.createElement('div');
    group.style.cssText = 'margin:10px 0;';

    var heading = document.createElement('p');
    heading.style.cssText =
      'font-size:11px;letter-spacing:0.16em;text-transform:uppercase;' +
      'color:#e6c27e;margin:0 0 8px;';
    heading.textContent = 'Photos (' + photos.length + '/' + MAX_PHOTOS + ')';
    group.appendChild(heading);

    var grid = document.createElement('div');
    grid.style.cssText =
      'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));' +
      'gap:6px;margin-bottom:8px;';

    photos.forEach(function (src, index) {
      var tile = document.createElement('div');
      tile.style.cssText =
        'position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden;' +
        'border:1px solid rgba(230,194,126,0.3);';

      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Photo ' + (index + 1);
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      tile.appendChild(img);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.style.cssText =
        'position:absolute;top:2px;right:2px;width:20px;height:20px;' +
        'border-radius:50%;border:0;background:rgba(0,0,0,0.7);' +
        'color:#fff;cursor:pointer;font-size:12px;line-height:1;';
      remove.addEventListener('click', function () {
        var arr = getByPath(state, path);
        arr.splice(index, 1);
        rebuildCurrentTab();
        scheduleSave();
        schedulePreview();
      });
      tile.appendChild(remove);

      grid.appendChild(tile);
    });

    group.appendChild(grid);

    var upload = document.createElement('label');
    upload.style.cssText =
      'display:block;padding:10px;border:1px dashed rgba(230,194,126,0.4);' +
      'border-radius:8px;color:#e6c27e;cursor:pointer;text-align:center;' +
      'font-size:12px;';

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.cssText = 'display:none;';
    fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files || []);
      fileInput.value = '';
      if (!files.length) return;

      var arr = getByPath(state, path);
      var remaining = MAX_PHOTOS - arr.length;
      if (remaining <= 0) {
        window.alert('You already have ' + MAX_PHOTOS + ' photos.');
        return;
      }
      files = files.slice(0, remaining);

      var promises = files.map(function (f) { return resizePhoto(f); });
      Promise.all(promises).then(function (urls) {
        var target = getByPath(state, path);
        for (var i = 0; i < urls.length; i++) {
          if (target.length < MAX_PHOTOS) target.push(urls[i]);
        }
        rebuildCurrentTab();
        scheduleSave();
        schedulePreview();
        updateMediaStatus();
      }).catch(function (err) {
        showError('Photo error: ' + (err && err.message ? err.message : 'unknown'));
      });
    });
    upload.appendChild(fileInput);
    upload.appendChild(document.createTextNode(
      photos.length ? '+ Add more photos' : '+ Add photos'
    ));
    group.appendChild(upload);

    container.appendChild(group);
  }

  function renderMusicEditor(container, path, music) {
    if (!music || typeof music !== 'object') {
      music = { src: '', title: '' };
      setByPath(state, path, music);
    }

    var group = document.createElement('div');
    group.style.cssText = 'margin:10px 0;';

    var heading = document.createElement('p');
    heading.style.cssText =
      'font-size:11px;letter-spacing:0.16em;text-transform:uppercase;' +
      'color:#e6c27e;margin:0 0 8px;';
    heading.textContent = 'Background sound';
    group.appendChild(heading);

    var help = document.createElement('p');
    help.style.cssText = 'font-size:12px;color:#a8b8b0;margin:0 0 8px;line-height:1.5;';
    help.textContent = 'Nasheed or soft background sound (optional).';
    group.appendChild(help);

    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Title (optional)';
    titleInput.value = music.title || '';
    titleInput.style.cssText =
      'width:100%;padding:6px;border:1px solid rgba(230,194,126,0.3);' +
      'border-radius:4px;background:rgba(0,0,0,0.25);color:#f3efe1;' +
      'font-family:Georgia,serif;font-size:12px;box-sizing:border-box;' +
      'margin-bottom:6px;';
    titleInput.addEventListener('input', function () {
      var m = getByPath(state, path);
      m.title = titleInput.value;
      scheduleSave();
      schedulePreview();
    });
    group.appendChild(titleInput);

    var upload = document.createElement('label');
    upload.style.cssText =
      'display:block;padding:10px;border:1px dashed rgba(230,194,126,0.4);' +
      'border-radius:8px;color:#e6c27e;cursor:pointer;text-align:center;' +
      'font-size:12px;';
    upload.textContent = music.src
      ? 'Replace mp3 (' + formatBytes(dataUrlBytes(music.src)) + ')'
      : 'Upload mp3 (max 3 MB)';

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.cssText = 'display:none;';
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      if (file.size > MUSIC_MAX) {
        showError('Music file is ' + formatBytes(file.size) + ' (over 3 MB). Please choose a smaller file.');
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var m = getByPath(state, path);
        m.src = String(reader.result || '');
        rebuildCurrentTab();
        scheduleSave();
        schedulePreview();
        updateMediaStatus();
      };
      reader.onerror = function () {
        showError('Could not read music file.');
      };
      reader.readAsDataURL(file);
    });
    upload.appendChild(fileInput);
    group.appendChild(upload);

    if (music.src) {
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove music';
      remove.style.cssText =
        'margin-top:6px;padding:6px 12px;border:1px solid rgba(255,155,155,0.4);' +
        'border-radius:4px;background:transparent;color:#ff9b9b;' +
        'cursor:pointer;font-size:11px;font-family:Georgia,serif;';
      remove.addEventListener('click', function () {
        var m = getByPath(state, path);
        m.src = '';
        rebuildCurrentTab();
        scheduleSave();
        schedulePreview();
        updateMediaStatus();
      });
      group.appendChild(remove);
    }

    container.appendChild(group);
  }

  /* ============================================================
     11. TABS
     ============================================================ */

  function buildTabsUI(tabsContainer) {
    if (!tabsContainer) return;
    tabsContainer.textContent = '';

    TABS.forEach(function (tab, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nk-tab';
      btn.setAttribute('data-tab', tab.id);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.textContent = tab.label;
      btn.style.cssText =
        'flex:0 0 auto;padding:6px 12px;border-radius:999px;' +
        'font-family:Georgia,serif;font-size:10px;letter-spacing:0.1em;' +
        'text-transform:uppercase;cursor:pointer;white-space:nowrap;' +
        'border:1px solid rgba(230,194,126,0.25);' +
        'background:transparent;color:#f3efe1;';
      btn.addEventListener('click', function () { activateTab(tab.id); });
      tabsContainer.appendChild(btn);
    });

    activateTab('basic');
  }

  function activateTab(tabId) {
    currentTab = tabId;
    var tabs = document.querySelectorAll('.nk-tab');
    for (var i = 0; i < tabs.length; i++) {
      var isActive = tabs[i].getAttribute('data-tab') === tabId;
      tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabs[i].style.background = isActive
        ? 'linear-gradient(150deg,#bf9546,#e6c27e)'
        : 'transparent';
      tabs[i].style.color = isActive ? '#04211c' : '#f3efe1';
      tabs[i].style.fontWeight = isActive ? '600' : '400';
    }
    renderTab(tabId);
  }

  function renderTab(tabId) {
    var body = ensureBody(ensureEditorPanel());
    if (!body) return;
    body.textContent = '';

    var tab = null;
    for (var i = 0; i < TABS.length; i++) {
      if (TABS[i].id === tabId) { tab = TABS[i]; break; }
    }
    if (!tab) return;

    var panel = document.createElement('div');
    panel.className = 'nk-panel';

    for (var k = 0; k < tab.keys.length; k++) {
      var key = tab.keys[k];
      if (!(key in state)) continue;
      renderOneField(panel, key, state[key], [key]);
    }

    body.appendChild(panel);
  }

  function rebuildCurrentTab() {
    renderTab(currentTab);
  }

  /* ============================================================
     12. MEDIA TOTAL
     ============================================================ */

  function updateMediaStatus() {
    var total = 0;
    if (Array.isArray(state.gallery)) {
      state.gallery.forEach(function (src) { total += dataUrlBytes(src); });
    }
    if (state.music && state.music.src) total += dataUrlBytes(state.music.src);
    if (total > TOTAL_MAX) {
      showError(
        'Total media is ' + formatBytes(total) + ' (over 8 MB). ' +
        'Remove a photo or the music file.'
      );
    }
  }

  /* ============================================================
     13. PREVIEW
     ============================================================ */

  function renderPreview() {
    var iframe = document.querySelector('iframe');
    if (!iframe) return;
    if (!window.buildCardHTML) {
      showError('card.js not loaded or incomplete');
      return;
    }
    try {
      iframe.srcdoc = window.buildCardHTML(state, cssText);
    } catch (e) {
      showError('Preview error: ' + (e && e.message ? e.message : 'unknown'));
    }
  }

  function schedulePreview() {
    if (previewTimer) window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(function () {
      previewTimer = 0;
      renderPreview();
    }, 300);
  }

  /* ============================================================
     14. CSS FETCH (with timeout)
     ============================================================ */

  function fetchCssWithTimeout(ms) {
    var url = 'card.css?v=' + Date.now();
    var fetchPromise = fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
    var timeoutPromise = new Promise(function (resolve, reject) {
      window.setTimeout(function () {
        reject(new Error('Timeout after ' + ms + 'ms'));
      }, ms);
    });
    return Promise.race([fetchPromise, timeoutPromise]);
  }

  /* ============================================================
     15. DOWNLOAD + RESET
     ============================================================ */

  function download() {
    if (!window.buildCardHTML) {
      showError('card.js not loaded or incomplete');
      return;
    }
    try {
      var html = window.buildCardHTML(state, cssText);
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);

      var name1 = slugify(state.person1 && state.person1.name || 'groom');
      var name2 = slugify(state.person2 && state.person2.name || 'bride');

      var a = document.createElement('a');
      a.href = url;
      a.download = name1 + '-' + name2 + '-nikah-card.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);

      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      window.setTimeout(function () { window.location.reload(); }, 1500);
    } catch (e) {
      showError('Download failed: ' + (e && e.message ? e.message : 'unknown'));
    }
  }

  function resetToSample() {
    if (!window.confirm('Reset everything to the sample card? Your changes will be lost.')) {
      return;
    }
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    window.location.reload();
  }

  /* ============================================================
     16. BOOT
     ============================================================ */

  function boot() {
    try {
      // 1. Find or create DOM pieces.
      var panel = ensureEditorPanel();
      var tabs = ensureTabs(panel);
      var body = ensureBody(panel);
      var iframe = ensureIframe();
      var loader = findLoaderByText();
      var downloadBtn = findButtonByText('Download Card');
      var resetBtn = findButtonByText('Reset');

      // 2. Check card.js BEFORE doing anything else.
      if (!window.DEFAULT_CARD || typeof window.buildCardHTML !== 'function') {
        showError('card.js not loaded or incomplete');
        hideLoader(loader);
        return;
      }

      // 3. Load state (draft merged over defaults).
      state = loadState();

      // 4. Build editor UI FIRST (before any fetch).
      buildTabsUI(tabs);

      // 5. Wire chrome buttons.
      if (downloadBtn) downloadBtn.addEventListener('click', download);
      if (resetBtn) resetBtn.addEventListener('click', resetToSample);

      var editFab = document.getElementById('editFab');
      if (editFab && panel) {
        editFab.addEventListener('click', function () {
          panel.classList.add('is-open');
          document.body.classList.add('editor-open');
        });
      }
      var editorClose = document.getElementById('editorClose');
      if (editorClose && panel) {
        editorClose.addEventListener('click', function () {
          panel.classList.remove('is-open');
          document.body.classList.remove('editor-open');
        });
      }

      // 6. Fetch card.css with timeout, then always hide the loader.
      fetchCssWithTimeout(8000).then(function (css) {
        cssText = css;
        renderPreview();
        return null;
      }, function (err) {
        var fullUrl = window.location.origin + '/' + 'card.css';
        showError(
          'card.css not found at ' + fullUrl + ' (' +
          (err && err.message ? err.message : 'unknown') +
          '). Using fallback styles.'
        );
        cssText = FALLBACK_CSS;
        renderPreview();
        return null;
      }).then(function () {
        hideLoader(loader);
      }, function (err) {
        hideLoader(loader);
        showError('Preview step failed: ' + (err && err.message ? err.message : 'unknown'));
      });

    } catch (e) {
      showError('Boot failed: ' + (e && e.message ? e.message : String(e)));
      try { hideLoader(); } catch (e2) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
