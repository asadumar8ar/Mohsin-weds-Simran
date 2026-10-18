/* builder.js — editor UI, preview, download, autosave. */
"use strict";
(function () {

  /* ============================================================
     Tiny helpers
     ============================================================ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) {
    var l = (r || document).querySelectorAll(s);
    var o = []; for (var i = 0; i < l.length; i++) o.push(l[i]); return o;
  }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function setStep(name) { window.__step = name; }
  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
  function getPath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function setPath(obj, path, val) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  function slugify(s) {
    s = String(s == null ? "" : s).toLowerCase().trim();
    s = s.replace(/[^a-z0-9\-_ ]/g, "");
    s = s.replace(/\s+/g, "-");
    return s || "nikah";
  }
  function showError(msg) {
    var box = $("#errorBox");
    if (!box) return;
    box.textContent = (box.textContent ? box.textContent + "\n\n" : "") + msg;
    box.classList.add("visible");
    try { window.__errs.push("BUILDER: " + msg); } catch (e) {}
  }
  function setStatus(msg, cls) {
    var s = $("#statusLine");
    if (!s) return;
    s.textContent = msg || "";
    s.className = cls || "";
  }
  function hideLoader() {
    var l = $("#loader");
    if (l) l.classList.add("hidden");
  }

  /* ============================================================
     Global error handlers
     ============================================================ */
  window.onerror = function (msg, file, line) {
    try {
      showError("Error: " + msg + " (" + (file ? file.split("/").pop() : "?") + ":" + line + ")");
    } catch (e) {}
  };
  window.addEventListener("unhandledrejection", function (e) {
    try {
      var r = e && e.reason;
      showError("Promise error: " + (r && r.message ? r.message : String(r)));
    } catch (err) {}
  });

  /* ============================================================
     Boot
     ============================================================ */
  var state = null;
  var previewTimer = null;
  var previewFrame = $("#previewFrame");
  var editorRoot = $("#editor");
  var editorInner = $("#editorInner");
  var savedTimer = null;

  try {
    /* ---------- STEP 1: check ---------- */
    setStep("check");
    if (!window.CARD_LOADED_STYLE) { showError("card-style.js is missing or incomplete."); return; }
    if (!window.CARD_LOADED_RUNTIME) { showError("card-runtime.js is missing or incomplete."); return; }
    if (!window.CARD_LOADED_SCENES) { showError("card-scenes.js is missing or incomplete."); return; }
    if (!window.CARD_LOADED_DATA) { showError("card.js is missing or incomplete."); return; }
    if (typeof window.buildCardHTML !== "function") { showError("card.js: buildCardHTML is missing."); return; }
    if (!window.DEFAULT_CARD || !window.CARD_SCHEMA) { showError("card.js: DEFAULT_CARD or CARD_SCHEMA is missing."); return; }

    /* ---------- STEP 2: state ---------- */
    setStep("state");
    state = deepClone(window.DEFAULT_CARD);
    try {
      var raw = localStorage.getItem("nikahCardDraft");
      if (raw) {
        var draft = JSON.parse(raw);
        if (draft && typeof draft === "object") {
          /* Merge key by key (shallow on top level; deep for known nested objects) */
          var textOnlyDraft = stripMedia(draft);
          mergeInto(state, textOnlyDraft);
        }
      }
    } catch (e) { /* ignore corrupt draft */ }

    /* ---------- STEP 3: editor ---------- */
    setStep("editor");
    buildEditor();

    /* ---------- STEP 4: preview ---------- */
    setStep("preview");
    schedulePreview(0);

    /* ---------- STEP 5: ready ---------- */
    setStep("ready");
  } catch (err) {
    showError("Builder failed to start: " + (err && err.message ? err.message : String(err)));
  } finally {
    hideLoader();
    window.__appReady = true;
  }

  /* ============================================================
     State merge helpers
     ============================================================ */
  function stripMedia(draft) {
    /* Drafts should never carry media (image data URLs, gallery, music src).
       But we allow text URLs for videos/images to be draftable too, except
       audio which is large. We strip audio src and gallery + image fields to
       avoid huge localStorage blobs. */
    var out = deepClone(draft);
    try {
      if (out.music) out.music = { src: "" };
      if (out.images) out.images = { hero: "", couple: "", floral: "", envelope: "" };
      if (out.gallery) out.gallery = [];
      if (out.videos) out.videos = { opening: "", main: "", finale: "" };
    } catch (e) {}
    return out;
  }

  function mergeInto(target, src) {
    if (!src || typeof src !== "object") return;
    for (var k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      var v = src[k];
      if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object" && !Array.isArray(target[k])) {
        mergeInto(target[k], v);
      } else if (Array.isArray(v)) {
        if (k === "events" || k === "contacts") {
          target[k] = deepClone(v);
        } else if (k === "gallery") {
          target[k] = [];
        }
      } else if (v !== undefined && v !== null) {
        if (k === "music" || k === "images" || k === "videos") continue;
        target[k] = v;
      }
    }
  }

  /* ============================================================
     BUILD EDITOR
     ============================================================ */
  function buildEditor() {
    if (!editorInner) return;
    editorInner.innerHTML = "";

    /* Note */
    var note = el("p", "editor-note");
    note.innerHTML = "<strong>Download, put the file in a folder as index.html, drag the folder to Netlify Drop (app.netlify.com/drop), share the link.</strong> For guest links, use the Guest link maker in <em>Contacts and RSVP</em>.";
    editorInner.appendChild(note);

    /* Tabs */
    var tabsBar = el("div", "ed-tabs");
    tabsBar.setAttribute("role", "tablist");
    var tabNames = ["Basic", "Events", "Story and Photos", "Music", "Images and Video", "Contacts and RSVP", "Theme"];
    var tabButtons = [];
    var panels = [];

    for (var ti = 0; ti < tabNames.length; ti++) {
      (function (name, idx) {
        var b = el("button", "ed-tab" + (idx === 0 ? " active" : ""), name);
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", idx === 0 ? "true" : "false");
        b.setAttribute("aria-controls", "ed-panel-" + idx);
        on(b, "click", function () {
          for (var i = 0; i < tabButtons.length; i++) {
            tabButtons[i].classList.toggle("active", i === idx);
            tabButtons[i].setAttribute("aria-selected", i === idx ? "true" : "false");
            panels[i].classList.toggle("active", i === idx);
          }
        });
        tabButtons.push(b);
        tabsBar.appendChild(b);
      })(tabNames[ti], ti);
    }
    editorInner.appendChild(tabsBar);

    /* Panels */
    for (var pi = 0; pi < tabNames.length; pi++) {
      var p = el("div", "ed-panel" + (pi === 0 ? " active" : ""));
      p.id = "ed-panel-" + pi;
      p.setAttribute("role", "tabpanel");
      panels.push(p);
      editorInner.appendChild(p);
    }

    /* Fill each field into the correct panel */
    for (var si = 0; si < window.CARD_SCHEMA.length; si++) {
      var item = window.CARD_SCHEMA[si];
      var panelIdx = tabNames.indexOf(item.tab);
      if (panelIdx < 0) panelIdx = 0;
      var field = renderField(item);
      if (field) panels[panelIdx].appendChild(field);
    }

    /* Guest link maker (Contacts and RSVP tab) */
    var contactsPanel = panels[5];
    if (contactsPanel) contactsPanel.appendChild(buildGuestMaker());

    /* Mobile sheet open/close */
    var fab = $("#editFab");
    if (fab && editorRoot) {
      on(fab, "click", function () {
        var open = editorRoot.classList.toggle("sheet-open");
        fab.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ============================================================
     RENDER ONE FIELD
     ============================================================ */
  function renderField(item) {
    var wrap = el("div", "ed-field");
    var id = "ed-" + item.path.replace(/\./g, "-");

    if (item.type === "checkbox") {
      var labC = el("label", "ed-check");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = id;
      cb.checked = !!getPath(state, item.path);
      on(cb, "change", function () {
        setPath(state, item.path, cb.checked);
        onAnyChange();
      });
      labC.appendChild(cb);
      labC.appendChild(document.createTextNode(item.label || ""));
      wrap.appendChild(labC);
      if (item.hint) wrap.appendChild(el("div", "ed-hint", item.hint));
      return wrap;
    }

    var lbl = el("label", null, item.label || item.path);
    lbl.setAttribute("for", id);
    wrap.appendChild(lbl);

    if (item.type === "text" || item.type === "date" || item.type === "time") {
      var inp = document.createElement("input");
      inp.type = item.type === "text" ? "text" : item.type;
      inp.className = "ed-input";
      inp.id = id;
      inp.value = getPath(state, item.path) == null ? "" : String(getPath(state, item.path));
      var isArabic = /\.ar$/.test(item.path);
      if (isArabic) inp.setAttribute("dir", "rtl");
      on(inp, "input", function () {
        setPath(state, item.path, inp.value);
        onAnyChange();
      });
      wrap.appendChild(inp);
    } else if (item.type === "textarea") {
      var ta = document.createElement("textarea");
      ta.className = "ed-textarea";
      ta.id = id;
      ta.value = getPath(state, item.path) == null ? "" : String(getPath(state, item.path));
      var isArTa = /\.ar$/.test(item.path);
      if (isArTa) ta.setAttribute("dir", "rtl");
      on(ta, "input", function () {
        setPath(state, item.path, ta.value);
        onAnyChange();
      });
      wrap.appendChild(ta);
    } else if (item.type === "select") {
      var sel = document.createElement("select");
      sel.className = "ed-select";
      sel.id = id;
      var opts = item.options || [];
      for (var oi = 0; oi < opts.length; oi++) {
        var op = document.createElement("option");
        op.value = opts[oi].value;
        op.textContent = opts[oi].label;
        if (String(getPath(state, item.path)) === opts[oi].value) op.selected = true;
        sel.appendChild(op);
      }
      on(sel, "change", function () {
        setPath(state, item.path, sel.value);
        onAnyChange();
      });
      wrap.appendChild(sel);
    } else if (item.type === "audio") {
      wrap.appendChild(renderAudioField(item, id));
    } else if (item.type === "image") {
      wrap.appendChild(renderImageField(item, id));
    } else if (item.type === "imageList") {
      wrap.appendChild(renderImageListField(item, id));
    } else if (item.type === "list") {
      wrap.appendChild(renderListField(item, id));
    }

    if (item.hint) wrap.appendChild(el("div", "ed-hint", item.hint));
    return wrap;
  }

  /* ---------- Audio ---------- */
  function renderAudioField(item, id) {
    var box = el("div");
    var currentVal = getPath(state, item.path) || "";
    var fileRow = el("div", "ed-file-row");

    var fileInp = document.createElement("input");
    fileInp.type = "file";
    fileInp.accept = "audio/mpeg,audio/mp3,audio/*";
    fileInp.id = id;
    on(fileInp, "change", function () {
      var f = fileInp.files && fileInp.files[0];
      if (!f) return;
      if (f.size > 3 * 1024 * 1024) {
        setStatus("Audio is " + (f.size / 1048576).toFixed(1) + "MB — over 3MB may be slow to load.", "warn");
      }
      var reader = new FileReader();
      reader.onload = function () {
        setPath(state, item.path, String(reader.result || ""));
        refreshAudioPreview();
        onAnyChange();
      };
      reader.readAsDataURL(f);
    });
    fileRow.appendChild(fileInp);

    var clearBtn = el("button", "btn-mini danger", "Clear");
    clearBtn.type = "button";
    on(clearBtn, "click", function () {
      setPath(state, item.path, "");
      refreshAudioPreview();
      onAnyChange();
    });
    fileRow.appendChild(clearBtn);
    box.appendChild(fileRow);

    var preview = el("div", "ed-hint", "");
    box.appendChild(preview);

    function refreshAudioPreview() {
      var v = getPath(state, item.path) || "";
      if (!v) { preview.textContent = "No audio selected."; return; }
      var kind = /^data:/i.test(v) ? "uploaded file" : "external URL";
      preview.textContent = "Current: " + kind;
    }
    refreshAudioPreview();
    return box;
  }

  /* ---------- Image (single) ---------- */
  function renderImageField(item, id) {
    var box = el("div");
    var currentVal = getPath(state, item.path) || "";
    var fileRow = el("div", "ed-file-row");
    var fileInp = document.createElement("input");
    fileInp.type = "file";
    fileInp.accept = "image/*";
    fileInp.id = id;
    on(fileInp, "change", function () {
      var f = fileInp.files && fileInp.files[0];
      if (!f) return;
      resizeImage(f, 1200, 0.75, function (dataUrl) {
        setPath(state, item.path, dataUrl);
        refresh();
        onAnyChange();
      });
    });
    fileRow.appendChild(fileInp);

    var clearBtn = el("button", "btn-mini danger", "Clear");
    clearBtn.type = "button";
    on(clearBtn, "click", function () {
      setPath(state, item.path, "");
      refresh();
      onAnyChange();
    });
    fileRow.appendChild(clearBtn);
    box.appendChild(fileRow);

    var urlRow = el("div", "ed-url-row");
    var urlInp = document.createElement("input");
    urlInp.type = "text";
    urlInp.className = "ed-input";
    urlInp.placeholder = "or paste an https image URL";
    urlInp.value = (currentVal && !/^data:/i.test(currentVal)) ? currentVal : "";
    on(urlInp, "change", function () {
      setPath(state, item.path, urlInp.value.trim());
      refresh();
      onAnyChange();
    });
    urlRow.appendChild(urlInp);
    box.appendChild(urlRow);

    var thumbs = el("div", "ed-thumb-grid");
    box.appendChild(thumbs);

    function refresh() {
      thumbs.innerHTML = "";
      var v = getPath(state, item.path) || "";
      urlInp.value = (v && !/^data:/i.test(v)) ? v : "";
      if (!v) return;
      var t = el("div", "ed-thumb");
      var im = document.createElement("img");
      im.src = v;
      im.alt = "preview";
      t.appendChild(im);
      var del = el("button", "ed-thumb-del", "×");
      del.type = "button";
      del.setAttribute("aria-label", "Remove image");
      on(del, "click", function () {
        setPath(state, item.path, "");
        refresh();
        onAnyChange();
      });
      t.appendChild(del);
      thumbs.appendChild(t);
    }
    refresh();
    return box;
  }

  /* ---------- Image list (gallery, max 8) ---------- */
  function renderImageListField(item, id) {
    var box = el("div");
    var fileRow = el("div", "ed-file-row");
    var fileInp = document.createElement("input");
    fileInp.type = "file";
    fileInp.accept = "image/*";
    fileInp.multiple = true;
    fileInp.id = id;
    on(fileInp, "change", function () {
      var files = fileInp.files;
      if (!files || !files.length) return;
      var list = getPath(state, item.path) || [];
      var remaining = 8 - list.length;
      if (remaining <= 0) { setStatus("Gallery is full (8 photos max).", "warn"); return; }
      var toRead = Math.min(files.length, remaining);
      var finished = 0;
      for (var i = 0; i < toRead; i++) {
        (function (f) {
          resizeImage(f, 1200, 0.75, function (dataUrl) {
            list.push(dataUrl);
            finished++;
            if (finished === toRead) {
              setPath(state, item.path, list);
              refresh();
              onAnyChange();
            }
          });
        })(files[i]);
      }
      fileInp.value = "";
    });
    fileRow.appendChild(fileInp);

    var clearBtn = el("button", "btn-mini danger", "Clear all");
    clearBtn.type = "button";
    on(clearBtn, "click", function () {
      setPath(state, item.path, []);
      refresh();
      onAnyChange();
    });
    fileRow.appendChild(clearBtn);
    box.appendChild(fileRow);

    var thumbs = el("div", "ed-thumb-grid");
    box.appendChild(thumbs);

    function refresh() {
      thumbs.innerHTML = "";
      var list = getPath(state, item.path) || [];
      for (var i = 0; i < list.length; i++) {
        (function (src, idx) {
          var t = el("div", "ed-thumb");
          var im = document.createElement("img");
          im.src = src;
          im.alt = "Photo " + (idx + 1);
          t.appendChild(im);
          var del = el("button", "ed-thumb-del", "×");
          del.type = "button";
          del.setAttribute("aria-label", "Remove photo");
          on(del, "click", function () {
            var arr = getPath(state, item.path) || [];
            arr.splice(idx, 1);
            setPath(state, item.path, arr);
            refresh();
            onAnyChange();
          });
          t.appendChild(del);
          thumbs.appendChild(t);
        })(list[i], i);
      }
    }
    refresh();
    return box;
  }

  /* ---------- List (events / contacts) ---------- */
  function renderListField(item, id) {
    var box = el("div");
    var listWrap = el("div", "ed-list");
    box.appendChild(listWrap);

    var addBtn = el("button", "btn-add", "+ Add " + (item.tab === "Events" ? "event" : "contact"));
    addBtn.type = "button";
    on(addBtn, "click", function () {
      var arr = getPath(state, item.path) || [];
      if (item.path === "contacts" && arr.length >= 3) {
        setStatus("Contacts are limited to 3.", "warn");
        return;
      }
      var blank = {};
      for (var f = 0; f < item.fields.length; f++) blank[item.fields[f].key] = "";
      if (item.path === "events") blank.isMain = arr.length === 0;
      arr.push(blank);
      setPath(state, item.path, arr);
      refresh();
      onAnyChange();
    });
    box.appendChild(addBtn);

    function refresh() {
      listWrap.innerHTML = "";
      var arr = getPath(state, item.path) || [];
      for (var i = 0; i < arr.length; i++) {
        listWrap.appendChild(renderListItem(item, i, arr[i], refresh));
      }
    }
    refresh();
    return box;
  }

  function renderListItem(item, idx, data, refreshAll) {
    var wrap = el("div", "ed-item");
    var title = data[item.itemLabel] || (item.path === "events" ? "Event " + (idx + 1) : "Contact " + (idx + 1));

    var head = el("div", "ed-item-head");
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.setAttribute("aria-expanded", "false");

    var titleEl = el("div", "ed-item-title");
    titleEl.textContent = title;
    if (item.path === "events" && data.isMain) {
      var tag = el("span", "tag", "main");
      titleEl.appendChild(tag);
    }
    head.appendChild(titleEl);
    var chev = el("div", "ed-item-chev", "▸");
    head.appendChild(chev);
    wrap.appendChild(head);

    var body = el("div", "ed-item-body");
    wrap.appendChild(body);

    function toggleOpen() {
      var open = wrap.classList.toggle("open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
    }
    on(head, "click", toggleOpen);
    on(head, "keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleOpen(); }
    });

    /* Fields */
    for (var f = 0; f < item.fields.length; f++) {
      (function (fdef) {
        var fWrap = el("div", "ed-field");
        var fid = "ed-" + item.path + "-" + idx + "-" + fdef.key;
        var fLbl = el("label", null, fdef.label);
        fLbl.setAttribute("for", fid);
        fWrap.appendChild(fLbl);
        var inp;
        if (fdef.type === "textarea") {
          inp = document.createElement("textarea");
          inp.className = "ed-textarea";
        } else {
          inp = document.createElement("input");
          inp.type = fdef.type === "date" ? "date" : (fdef.type === "time" ? "time" : "text");
          inp.className = "ed-input";
        }
        inp.id = fid;
        inp.value = data[fdef.key] == null ? "" : String(data[fdef.key]);
        on(inp, "input", function () {
          data[fdef.key] = inp.value;
          /* Update title live */
          if (fdef.key === item.itemLabel) {
            titleEl.firstChild && (titleEl.firstChild.nodeValue = inp.value || ("Event " + (idx + 1)));
          }
          onAnyChange();
        });
        fWrap.appendChild(inp);
        if (fdef.hint) fWrap.appendChild(el("div", "ed-hint", fdef.hint));
        body.appendChild(fWrap);
      })(item.fields[f]);
    }

    /* Actions */
    var actions = el("div", "ed-item-actions");

    var up = el("button", "btn-mini", "↑ Up");
    up.type = "button";
    on(up, "click", function () {
      var arr = getPath(state, item.path) || [];
      if (idx === 0) return;
      var t = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = t;
      setPath(state, item.path, arr);
      refreshAll();
      onAnyChange();
    });
    actions.appendChild(up);

    var down = el("button", "btn-mini", "↓ Down");
    down.type = "button";
    on(down, "click", function () {
      var arr = getPath(state, item.path) || [];
      if (idx >= arr.length - 1) return;
      var t = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = t;
      setPath(state, item.path, arr);
      refreshAll();
      onAnyChange();
    });
    actions.appendChild(down);

    if (item.path === "events") {
      var mainBtn = el("button", "btn-mini gold", data.isMain ? "★ Main" : "Set as main");
      mainBtn.type = "button";
      if (data.isMain) mainBtn.setAttribute("aria-pressed", "true");
      on(mainBtn, "click", function () {
        var arr = getPath(state, item.path) || [];
        for (var a = 0; a < arr.length; a++) arr[a].isMain = (a === idx);
        setPath(state, item.path, arr);
        refreshAll();
        onAnyChange();
      });
      actions.appendChild(mainBtn);
    }

    var del = el("button", "btn-mini danger", "Delete");
    del.type = "button";
    on(del, "click", function () {
      if (!window.confirm("Delete this " + (item.path === "events" ? "event" : "contact") + "?")) return;
      var arr = getPath(state, item.path) || [];
      var wasMain = arr[idx] && arr[idx].isMain;
      arr.splice(idx, 1);
      if (item.path === "events" && wasMain && arr.length && !arr.some(function (x) { return x.isMain; })) {
        arr[0].isMain = true;
      }
      setPath(state, item.path, arr);
      refreshAll();
      onAnyChange();
    });
    actions.appendChild(del);

    body.appendChild(actions);
    return wrap;
  }

  /* ============================================================
     Guest link maker
     ============================================================ */
  function buildGuestMaker() {
    var box = el("div", "guest-maker");
    box.appendChild(el("h4", null, "Guest link maker"));
    var urlWrap = el("div", "ed-field");
    var urlLbl = el("label", null, "Published page URL");
    urlLbl.setAttribute("for", "guestUrl");
    urlWrap.appendChild(urlLbl);
    var urlInp = document.createElement("input");
    urlInp.type = "url";
    urlInp.id = "guestUrl";
    urlInp.className = "ed-input";
    urlInp.placeholder = "https://your-site.netlify.app/";
    urlWrap.appendChild(urlInp);
    box.appendChild(urlWrap);

    var nameWrap = el("div", "ed-field");
    var nameLbl = el("label", null, "Guest name");
    nameLbl.setAttribute("for", "guestNameInp");
    nameWrap.appendChild(nameLbl);
    var nameInp = document.createElement("input");
    nameInp.type = "text";
    nameInp.id = "guestNameInp";
    nameInp.className = "ed-input";
    nameInp.placeholder = "e.g. Ahmed Ali";
    nameWrap.appendChild(nameInp);
    box.appendChild(nameWrap);

    var resWrap = el("div", "guest-result");
    var resInp = document.createElement("input");
    resInp.type = "text";
    resInp.className = "ed-input";
    resInp.readOnly = true;
    resInp.placeholder = "Result appears here";
    resInp.id = "guestResult";
    resWrap.appendChild(resInp);
    var copyBtn = el("button", "btn-mini gold", "Copy");
    copyBtn.type = "button";
    resWrap.appendChild(copyBtn);
    box.appendChild(resWrap);

    function update() {
      var u = urlInp.value.trim();
      var n = nameInp.value.trim();
      if (!u || !n) { resInp.value = ""; return; }
      var sep = u.indexOf("?") > -1 ? "&" : "?";
      resInp.value = u + sep + "guest=" + encodeURIComponent(n);
    }
    on(urlInp, "input", update);
    on(nameInp, "input", update);
    on(copyBtn, "click", function () {
      if (!resInp.value) return;
      try {
        resInp.select();
        document.execCommand("copy");
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copy-flash");
        setTimeout(function () { copyBtn.textContent = "Copy"; copyBtn.classList.remove("copy-flash"); }, 1600);
      } catch (e) {}
    });

    /* Try to prefill current origin */
    try {
      if (location.protocol === "http:" || location.protocol === "https:") {
        urlInp.value = location.origin + location.pathname;
        update();
      }
    } catch (e) {}

    return box;
  }

  /* ============================================================
     Image resize helper
     ============================================================ */
  function resizeImage(file, maxSide, quality, cb) {
    try {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          try {
            var w = img.width, h = img.height;
            var scale = Math.min(1, maxSide / Math.max(w, h));
            var nw = Math.round(w * scale);
            var nh = Math.round(h * scale);
            var cnv = document.createElement("canvas");
            cnv.width = nw; cnv.height = nh;
            var c = cnv.getContext("2d");
            c.drawImage(img, 0, 0, nw, nh);
            var dataUrl = cnv.toDataURL("image/jpeg", quality);
            cb(dataUrl);
          } catch (err) { cb(String(reader.result || "")); }
        };
        img.onerror = function () { cb(String(reader.result || "")); };
        img.src = String(reader.result || "");
      };
      reader.onerror = function () { cb(""); };
      reader.readAsDataURL(file);
    } catch (e) { cb(""); }
  }

  /* ============================================================
     Preview scheduling
     ============================================================ */
  function onAnyChange() {
    schedulePreview(300);
    scheduleAutosave();
  }

  function schedulePreview(delay) {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, delay || 300);
  }

  function renderPreview() {
    try {
      if (!previewFrame) return;
      var html = window.buildCardHTML(state);
      previewFrame.srcdoc = html;
      /* Warn if total media is heavy */
      var total = mediaBytes(state);
      if (total > 8 * 1024 * 1024) {
        setStatus("Media is over 8MB — this may load slowly on phones.", "warn");
      }
    } catch (e) {
      showError("Preview failed: " + (e && e.message ? e.message : String(e)));
    }
  }

  function mediaBytes(d) {
    var total = 0;
    function dataUrlBytes(v) {
      if (typeof v !== "string") return 0;
      var i = v.indexOf("base64,");
      if (i < 0) return 0;
      return Math.floor((v.length - i - 7) * 0.75);
    }
    try {
      total += dataUrlBytes(d.music && d.music.src);
      if (d.images) {
        total += dataUrlBytes(d.images.hero);
        total += dataUrlBytes(d.images.couple);
        total += dataUrlBytes(d.images.floral);
        total += dataUrlBytes(d.images.envelope);
      }
      if (d.gallery) for (var i = 0; i < d.gallery.length; i++) total += dataUrlBytes(d.gallery[i]);
    } catch (e) {}
    return total;
  }

  /* ============================================================
     AUTOSAVE (text only)
     ============================================================ */
  function scheduleAutosave() {
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(doAutosave, 500);
  }

  function doAutosave() {
    try {
      var draft = draftFromState();
      localStorage.setItem("nikahCardDraft", JSON.stringify(draft));
      setStatus("Draft saved automatically", "saved");
      setTimeout(function () {
        var s = $("#statusLine");
        if (s && s.textContent === "Draft saved automatically") setStatus("", "");
      }, 2200);
    } catch (e) {
      /* localStorage may be full */
      setStatus("Could not save draft (storage full?)", "warn");
    }
  }

  function draftFromState() {
    /* Save only text fields; never image/audio data URLs. */
    var d = deepClone(state);
    d.music = { src: "" };
    d.images = { hero: "", couple: "", floral: "", envelope: "" };
    d.gallery = [];
    d.videos = { opening: "", main: "", finale: "" };
    /* Also strip drafts that would be huge: keep only simple strings */
    return d;
  }

  /* ============================================================
     DOWNLOAD
     ============================================================ */
  (function wireDownload() {
    var btn = $("#downloadBtn");
    if (!btn) return;
    on(btn, "click", function () {
      try {
        var html = window.buildCardHTML(state);
        var blob = new Blob([html], { type: "text/html;charset=utf-8" });
        var name1 = (state.person1 && state.person1.name) || "nikah";
        var name2 = (state.person2 && state.person2.name) || "card";
        var filename = slugify(name1) + "-" + slugify(name2) + "-nikah-card.html";
        if (navigator.msSaveOrOpenBlob) {
          navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {}
            try { localStorage.removeItem("nikahCardDraft"); } catch (e) {}
            setTimeout(function () { location.reload(); }, 1500);
          }, 300);
        }
        setStatus("Downloading…", "saved");
      } catch (e) {
        showError("Download failed: " + (e && e.message ? e.message : String(e)));
      }
    });
  })();

  /* ============================================================
     RESET
     ============================================================ */
  (function wireReset() {
    var btn = $("#resetBtn");
    if (!btn) return;
    on(btn, "click", function () {
      if (!window.confirm("Reset the draft and start over? This clears all your edits.")) return;
      try { localStorage.removeItem("nikahCardDraft"); } catch (e) {}
      location.reload();
    });
  })();

})();
// END OF FILE builder.js
