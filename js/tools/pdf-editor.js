/* ═══════════════════════════════════════════════════════════
   SARKARI TOOLS — Advanced PDF Editor
   100% client-side. pdf.js renders, pdf-lib exports.
   Pages: load / merge / rotate / delete / reorder / duplicate
   Objects: text, image, drawn signature (drag, resize, restyle)
   Stamps: watermark (all pages), page numbers
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  var $ = function (id) { return document.getElementById(id); };

  var state = {
    files: [],      // { name, bytes:Uint8Array, doc:pdfjsDoc, pages:n }
    pages: [],      // { fi, pno(1-based), rot(extra 0/90/180/270) }
    objects: [],    // { id, pi, type:'text'|'image', x,y,w,h (fractions of rotated view), text, fsPct, color, opacity, z, dataUrl }
    cur: -1,
    selId: null,
    zoom: 1,
    fitScale: 1,
    viewW: 0, viewH: 0,
    thumbToken: 0,
    zTop: 1
  };
  var uid = 1;
  var libCache = new Map(); // fi -> PDFLib.PDFDocument

  /* ───────── tiny helpers ───────── */
  function status(msg, bad) {
    var el = $('pdfStatus');
    el.textContent = msg;
    el.style.background = bad ? '#fef2f2' : '#eff6ff';
    el.style.color = bad ? '#b91c1c' : '#1d4ed8';
    el.style.borderColor = bad ? '#fecaca' : '#bfdbfe';
    el.classList.add('show');
  }
  function fmtKB(bytes) { return (bytes / 1024).toFixed(0) + ' KB'; }
  function normRot(r) { r = r % 360; if (r < 0) r += 360; return r; }

  /* ───────── file loading ───────── */
  async function loadFiles(fileList) {
    var ok = 0;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') continue;
      try {
        var buf = new Uint8Array(await f.arrayBuffer());
        var doc = await pdfjsLib.getDocument({ data: buf.slice() }).promise;
        var fi = state.files.length;
        state.files.push({ name: f.name, bytes: buf, doc: doc, pages: doc.numPages });
        for (var p = 1; p <= doc.numPages; p++) {
          state.pages.push({ fi: fi, pno: p, rot: 0 });
        }
        ok++;
      } catch (e) {
        status('Could not load "' + f.name + '" — ' + (e.message || 'invalid PDF'), true);
      }
    }
    if (ok) {
      status('✅ Loaded ' + ok + ' file' + (ok > 1 ? 's' : '') + ' — ' + state.pages.length + ' pages ready.');
      $('pdfWorkspace').style.display = '';
      window.scrollTo({ top: $('pdfWorkspace').offsetTop - 90, behavior: 'smooth' });
      renderFileList();
      await renderThumbs();
      state.cur = 0;
      await renderPage();
      updateExportSummary();
    }
  }

  function renderFileList() {
    var host = $('pdfFileList');
    host.innerHTML = '';
    state.files.forEach(function (f, fi) {
      var chip = document.createElement('div');
      chip.className = 'pdf-file-chip';
      chip.innerHTML = '<span>📄</span><span class="fname"></span><span class="fmeta"></span>';
      chip.querySelector('.fname').textContent = f.name;
      chip.querySelector('.fmeta').textContent = f.pages + ' pages · ' + fmtKB(f.bytes.length);
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn btn-outline';
      rm.style.cssText = 'padding:2px 8px;font-size:11px;margin-left:auto;color:#b91c1c;';
      rm.textContent = 'Remove';
      rm.onclick = function () {
        // 1) find which page positions belong to this file
        var removed = {};
        state.pages.forEach(function (p, i) { if (p.fi === fi) removed[i] = true; });
        // 2) rebuild page list, remembering old-index -> new-index mapping
        var oldToNew = {};
        var newList = [];
        state.pages.forEach(function (p, i) {
          if (removed[i]) return;
          oldToNew[i] = newList.length;
          newList.push(p);
        });
        // 3) drop objects of removed pages, renumber the rest
        state.objects = state.objects.filter(function (o) { return !removed[o.pi]; });
        state.objects.forEach(function (o) { o.pi = oldToNew[o.pi]; });
        state.pages = newList;
        state.pages.forEach(function (p) { if (p.fi > fi) p.fi--; });
        state.files.splice(fi, 1);
        libCache.clear();
        afterStructureChange();
      };
      chip.appendChild(rm);
      host.appendChild(chip);
    });
  }
  function afterStructureChange() {
    if (!state.pages.length) {
      $('pdfWorkspace').style.display = 'none';
      state.cur = -1;
      state.objects = [];
      updateExportSummary();
      return;
    }
    if (state.cur >= state.pages.length) state.cur = state.pages.length - 1;
    if (state.cur < 0) state.cur = 0;
    renderFileList();
    renderThumbs();
    renderPage();
    updateExportSummary();
  }

  /* ───────── thumbnails ───────── */
  async function renderThumbs() {
    var token = ++state.thumbToken;
    var grid = $('pdfThumbsGrid');
    grid.innerHTML = '';
    for (var i = 0; i < state.pages.length; i++) {
      var pg = state.pages[i];
      var cell = document.createElement('div');
      cell.className = 'pdf-thumb' + (i === state.cur ? ' active' : '');
      cell.dataset.pi = i;
      cell.innerHTML =
        '<span class="pnum">' + (i + 1) + '</span>' +
        '<span class="pop">' +
        '<button data-a="rl" title="Rotate left">↺</button>' +
        '<button data-a="rr" title="Rotate right">↻</button>' +
        '<button data-a="dup" title="Duplicate">⧉</button>' +
        '<button data-a="del" title="Delete">✕</button>' +
        '</span>' +
        '<span class="pop2">' +
        '<button data-a="mvL" title="Move left">◀</button>' +
        '<button data-a="mvR" title="Move right">▶</button>' +
        '</span>' +
        '<div class="tcanvas" style="min-height:60px;background:#f1f5f9;border-radius:4px;"></div>';
      grid.appendChild(cell);
      bindThumb(cell, i);
    }
    // render canvases sequentially (small scale)
    for (var j = 0; j < state.pages.length; j++) {
      if (token !== state.thumbToken) return;
      var cellEl = grid.children[j];
      var host = cellEl.querySelector('.tcanvas');
      try {
        var canvas = await renderThumbCanvas(state.pages[j], 150);
        host.innerHTML = '';
        host.style.minHeight = '';
        canvas.style.width = '100%';
        host.appendChild(canvas);
      } catch (e) {
        host.innerHTML = '<div style="font-size:11px;color:#94a3b8;padding:16px 4px;text-align:center;">preview n/a</div>';
      }
    }
  }
  function bindThumb(cell, i) {
    cell.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      var a = btn && btn.dataset.a;
      if (!a) {
        state.cur = i;
        renderPage();
        markActiveThumb();
        return;
      }
      ev.stopPropagation();
      if (a === 'rl') state.pages[i].rot = normRot(state.pages[i].rot - 90);
      if (a === 'rr') state.pages[i].rot = normRot(state.pages[i].rot + 90);
      if (a === 'dup') {
        state.pages.splice(i + 1, 0, { fi: state.pages[i].fi, pno: state.pages[i].pno, rot: state.pages[i].rot });
      }
      if (a === 'del') {
        state.pages.splice(i, 1);
        state.objects = state.objects.filter(function (o) { return o.pi !== i; });
        state.objects.forEach(function (o) { if (o.pi > i) o.pi--; });
        afterStructureChange();
        return;
      }
      if (a === 'mvL' && i > 0) {
        var t = state.pages[i - 1]; state.pages[i - 1] = state.pages[i]; state.pages[i] = t;
        state.cur = i - 1;
      }
      if (a === 'mvR' && i < state.pages.length - 1) {
        var t2 = state.pages[i + 1]; state.pages[i + 1] = state.pages[i]; state.pages[i] = t2;
        state.cur = i + 1;
      }
      afterStructureChange();
    });
  }
  function markActiveThumb() {
    var grid = $('pdfThumbsGrid');
    Array.prototype.forEach.call(grid.children, function (c, idx) {
      c.classList.toggle('active', idx === state.cur);
    });
  }
  async function renderThumbCanvas(pg, targetW) {
    var meta = state.files[pg.fi];
    var page = await meta.doc.getPage(pg.pno);
    var vp1 = page.getViewport({ scale: 1, rotation: normRot((page.rotate || 0) + pg.rot) });
    var scale = targetW / vp1.width;
    var vp = page.getViewport({ scale: scale, rotation: normRot((page.rotate || 0) + pg.rot) });
    var canvas = document.createElement('canvas');
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    return canvas;
  }

  /* ───────── main viewer ───────── */
  var renderTask = null;
  async function renderPage() {
    if (state.cur < 0 || !state.pages.length) return;
    var pg = state.pages[state.cur];
    var meta = state.files[pg.fi];
    var page = await meta.doc.getPage(pg.pno);
    var rot = normRot((page.rotate || 0) + pg.rot);
    var vp1 = page.getViewport({ scale: 1, rotation: rot });

    var shell = $('pdfViewerShell');
    var avail = Math.max(shell.clientWidth - 32, 260);
    state.fitScale = avail / vp1.width;
    var scale = state.fitScale * state.zoom;
    var vp = page.getViewport({ scale: scale, rotation: rot });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var canvas = $('pdfRenderCanvas');
    canvas.width = Math.floor(vp.width * dpr);
    canvas.height = Math.floor(vp.height * dpr);
    canvas.style.width = Math.floor(vp.width) + 'px';
    canvas.style.height = Math.floor(vp.height) + 'px';

    if (renderTask) { try { renderTask.cancel(); } catch (e) {} }
    renderTask = page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: vp,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
    });
    try { await renderTask.promise; } catch (e) { if (e && e.name !== 'RenderingCancelledException') console.warn(e); }

    var box = $('pdfPageBox');
    box.style.display = '';
    shell.classList.remove('empty');
    state.viewW = Math.floor(vp.width);
    state.viewH = Math.floor(vp.height);

    $('pageIndicator').textContent = 'Page ' + (state.cur + 1) + ' / ' + state.pages.length;
    $('zoomVal').textContent = Math.round(state.zoom * 100) + '%';
    $('btnPrevPage').disabled = state.cur <= 0;
    $('btnNextPage').disabled = state.cur >= state.pages.length - 1;

    renderObjectLayer();
    renderStampPreviews();
  }

  /* ───────── objects ───────── */
  function renderObjectLayer() {
    var layer = $('pdfObjectLayer');
    layer.innerHTML = '';
    var list = state.objects.filter(function (o) { return o.pi === state.cur; })
      .sort(function (a, b) { return a.z - b.z; });
    list.forEach(function (o) { layer.appendChild(buildObjectEl(o)); });
  }
  function buildObjectEl(o) {
    var el = document.createElement('div');
    el.className = 'pdf-obj' + (o.id === state.selId ? ' selected' : '');
    el.dataset.oid = o.id;
    el.style.left = (o.x * 100) + '%';
    el.style.top = (o.y * 100) + '%';
    if (o.type === 'text') {
      el.style.width = (o.w * 100) + '%';
      var txt = document.createElement('div');
      txt.className = 'obj-text';
      txt.contentEditable = 'true';
      txt.spellcheck = false;
      txt.textContent = o.text;
      txt.style.fontSize = 'max(12px, ' + (o.fsPct * state.viewH / 100) + 'px)';
      txt.style.color = o.color;
      txt.style.opacity = o.opacity;
      txt.style.fontFamily = "'Inter', sans-serif";
      txt.style.lineHeight = '1.25';
      txt.style.wordBreak = 'break-word';
      txt.addEventListener('input', function () {
        o.text = txt.innerText.replace(/\u00a0/g, ' ');
        syncObjHeight(o, el);
      });
      txt.addEventListener('dblclick', function (ev) { ev.stopPropagation(); });
      txt.addEventListener('blur', function () {
        o.text = txt.innerText.replace(/\u00a0/g, ' ');
        syncObjHeight(o, el);
      });
      el.appendChild(txt);
    } else {
      el.style.width = (o.w * 100) + '%';
      el.style.height = (o.h * 100) + '%';
      var img = document.createElement('img');
      img.src = o.dataUrl;
      img.draggable = false;
      img.style.opacity = o.opacity;
      el.appendChild(img);
    }
    var rz = document.createElement('div');
    rz.className = 'rz';
    el.appendChild(rz);
    bindObjectDrag(el, o, rz);
    el.addEventListener('pointerdown', function () { selectObject(o.id); }, true);
    return el;
  }
  function syncObjHeight(o, el) {
    if (o.type === 'text' && state.viewH) o.h = el.offsetHeight / state.viewH;
  }
  function bindObjectDrag(el, o, rz) {
    el.addEventListener('pointerdown', function (ev) {
      if (ev.target === rz) return;
      var editing = ev.target.isContentEditable && document.activeElement === ev.target;
      if (editing) return;
      ev.preventDefault();
      el.setPointerCapture(ev.pointerId);
      var startX = ev.clientX, startY = ev.clientY;
      var ox = o.x, oy = o.y;
      function move(e) {
        o.x = Math.min(1 - Math.min(o.w, 0.98), Math.max(0, ox + (e.clientX - startX) / state.viewW));
        o.y = Math.min(1 - 0.02, Math.max(0, oy + (e.clientY - startY) / state.viewH));
        el.style.left = (o.x * 100) + '%';
        el.style.top = (o.y * 100) + '%';
      }
      function up() {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        syncObjHeight(o, el);
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
    rz.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      rz.setPointerCapture(ev.pointerId);
      var startX = ev.clientX, startY = ev.clientY;
      var ow = o.w, oh = o.h;
      function move(e) {
        var dx = (e.clientX - startX) / state.viewW;
        var dy = (e.clientY - startY) / state.viewH;
        if (o.type === 'image') {
          o.w = Math.min(1, Math.max(0.04, ow + dx));
          o.h = Math.min(1, Math.max(0.02, oh + dy));
          el.style.height = (o.h * 100) + '%';
        } else {
          o.w = Math.min(1, Math.max(0.06, ow + dx));
        }
        el.style.width = (o.w * 100) + '%';
      }
      function up() {
        rz.removeEventListener('pointermove', move);
        rz.removeEventListener('pointerup', up);
        syncObjHeight(o, el);
      }
      rz.addEventListener('pointermove', move);
      rz.addEventListener('pointerup', up);
    });
  }
  function selectObject(id) {
    state.selId = id;
    Array.prototype.forEach.call($('pdfObjectLayer').children, function (c) {
      c.classList.toggle('selected', +c.dataset.oid === id);
    });
    var o = state.objects.find(function (x) { return x.id === id; });
    var bar = $('pdfObjToolbar');
    if (!o) { bar.classList.remove('show'); return; }
    bar.classList.add('show');
    var isText = o.type === 'text';
    $('objToolbarLabel').textContent = isText ? 'Text' : (o.isSign ? 'Signature' : 'Image');
    $('objFontMinus').style.display = isText ? '' : 'none';
    $('objFontPlus').style.display = isText ? '' : 'none';
    $('objColor').style.display = isText ? '' : 'none';
    if (isText) $('objColor').value = o.color;
  }
  function deleteSelected() {
    if (state.selId == null) return;
    state.objects = state.objects.filter(function (o) { return o.id !== state.selId; });
    state.selId = null;
    $('pdfObjToolbar').classList.remove('show');
    renderObjectLayer();
  }
  function addTextObject() {
    if (state.cur < 0) return;
    var o = {
      id: uid++, pi: state.cur, type: 'text',
      x: 0.36, y: 0.42, w: 0.28, h: 0.05,
      text: 'Type here', fsPct: 2.4, color: '#111827', opacity: 1,
      z: ++state.zTop
    };
    state.objects.push(o);
    renderObjectLayer();
    selectObject(o.id);
    var el = $('pdfObjectLayer').querySelector('[data-oid="' + o.id + '"] .obj-text');
    if (el) {
      el.focus();
      var range = document.createRange(); range.selectNodeContents(el);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      syncObjHeight(o, el.parentNode);
    }
  }
  function addImageObject(dataUrl, natW, natH, isSign) {
    if (state.cur < 0) return;
    var w = 0.3, h = w * (natH / natW) * (state.viewW / state.viewH);
    if (h > 0.4) { h = 0.4; w = h * (natW / natH) * (state.viewH / state.viewW); }
    var o = {
      id: uid++, pi: state.cur, type: 'image',
      x: (1 - w) / 2, y: isSign ? 0.62 : (1 - h) / 2, w: w, h: h,
      dataUrl: dataUrl, natW: natW, natH: natH, opacity: 1,
      z: ++state.zTop, isSign: !!isSign
    };
    state.objects.push(o);
    renderObjectLayer();
    selectObject(o.id);
  }
  function normalizeImageFile(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var MAX = 2000;
          var s = Math.min(1, MAX / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * s);
          c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve({ dataUrl: c.toDataURL('image/png'), w: c.width, h: c.height });
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  /* ───────── signature modal ───────── */
  var sig = { drawing: false, dirty: false };
  function openSignature() {
    $('pdfSigBackdrop').classList.add('show');
    var c = $('pdfSigCanvas');
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    sig.dirty = false;
  }
  function bindSignature() {
    var c = $('pdfSigCanvas');
    var ctx = c.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    function pos(ev) {
      var r = c.getBoundingClientRect();
      return {
        x: (ev.clientX - r.left) * (c.width / r.width),
        y: (ev.clientY - r.top) * (c.height / r.height)
      };
    }
    c.addEventListener('pointerdown', function (ev) {
      sig.drawing = true; sig.dirty = true;
      c.setPointerCapture(ev.pointerId);
      var p = pos(ev);
      ctx.strokeStyle = $('sigInkColor').value;
      ctx.lineWidth = +$('sigPenSize').value * 2.2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
    });
    c.addEventListener('pointermove', function (ev) {
      if (!sig.drawing) return;
      var p = pos(ev);
      ctx.lineTo(p.x, p.y); ctx.stroke();
    });
    c.addEventListener('pointerup', function () { sig.drawing = false; });
    $('btnSigClear').onclick = function () {
      ctx.clearRect(0, 0, c.width, c.height); sig.dirty = false;
    };
    $('btnSigCancel').onclick = function () { $('pdfSigBackdrop').classList.remove('show'); };
    $('btnSigSave').onclick = function () {
      if (!sig.dirty) { $('pdfSigBackdrop').classList.remove('show'); return; }
      // trim to drawn bounding box with padding
      var data = ctx.getImageData(0, 0, c.width, c.height);
      var minX = c.width, minY = c.height, maxX = 0, maxY = 0;
      for (var y = 0; y < c.height; y++) {
        for (var x = 0; x < c.width; x++) {
          if (data.data[(y * c.width + x) * 4 + 3] > 10) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX <= minX) { $('pdfSigBackdrop').classList.remove('show'); return; }
      var pad = 14;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(c.width, maxX + pad); maxY = Math.min(c.height, maxY + pad);
      var out = document.createElement('canvas');
      out.width = maxX - minX; out.height = maxY - minY;
      out.getContext('2d').drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
      $('pdfSigBackdrop').classList.remove('show');
      addImageObject(out.toDataURL('image/png'), out.width, out.height, true);
      status('✍️ Signature placed on page ' + (state.cur + 1) + ' — drag it into position.');
    };
  }

  /* ───────── stamp previews (watermark / page numbers) ───────── */
  function renderStampPreviews() {
    var wm = $('pdfWmPreview'), wmT = $('pdfWmPreviewText');
    if ($('wmEnabled').checked) {
      wm.style.display = '';
      wmT.textContent = $('wmText').value || ' ';
      wmT.style.fontSize = ($('wmSize').value / 100 * state.viewH) + 'px';
      wmT.style.opacity = ($('wmOpacity').value / 100);
      wmT.style.color = '#334155';
      wmT.style.transform = $('wmDiagonal').checked ? 'rotate(-30deg)' : 'none';
    } else {
      wm.style.display = 'none';
    }
    var pn = $('pdfPnPreview');
    if ($('pnEnabled').checked) {
      pn.style.display = '';
      pn.textContent = pnText(state.cur, state.pages.length);
      var pos = $('pnPosition').value;
      pn.style.left = pos.charAt(1) === 'c' ? '50%' : (pos.charAt(1) === 'r' ? '96%' : '4%');
      pn.style.top = pos.charAt(0) === 'b' ? 'calc(100% - 22px)' : '6px';
      pn.style.transform = pos.charAt(1) === 'c' ? 'translateX(-50%)' : 'none';
      pn.style.fontSize = Math.max(10, state.viewH * 0.014) + 'px';
    } else {
      pn.style.display = 'none';
    }
  }
  function pnText(i, n) {
    var f = $('pnFormat').value;
    if (f === 'pon') return 'Page ' + (i + 1);
    if (f === 'nof') return (i + 1) + ' / ' + n;
    return String(i + 1);
  }

  /* ───────── export ───────── */
  function hexToRgb01(hex) {
    var m = hex.replace('#', '');
    if (m.length === 3) m = m[0] + m[0] + m[1] + m[1] + m[2] + m[2];
    return {
      r: parseInt(m.substr(0, 2), 16) / 255,
      g: parseInt(m.substr(2, 2), 16) / 255,
      b: parseInt(m.substr(4, 2), 16) / 255
    };
  }
  // view rect (fractions of rotated view) -> unrotated page pts
  function viewRectToPts(vx, vy, vw, vh, W, H, total) {
    var px0, py0, px1, py1, wPt, hPt;
    if (total === 90) {
      px0 = vy * W; px1 = (vy + vh) * W;
      py0 = vx * H; py1 = (vx + vw) * H;
      wPt = px1 - px0; hPt = py1 - py0;
    } else if (total === 180) {
      px0 = (1 - vx - vw) * W; px1 = (1 - vx) * W;
      py0 = vy * H; py1 = (vy + vh) * H;
      wPt = px1 - px0; hPt = py1 - py0;
    } else if (total === 270) {
      px0 = (1 - vy - vh) * W; px1 = (1 - vy) * W;
      py0 = (1 - vx - vw) * H; py1 = (1 - vx) * H;
      wPt = px1 - px0; hPt = py1 - py0;
    } else {
      px0 = vx * W; px1 = (vx + vw) * W;
      py0 = vy * H; py1 = (vy + vh) * H;
      wPt = px1 - px0; hPt = py1 - py0;
    }
    return { x: px0, y: H - py1, w: wPt, h: hPt, yTop: H - py0 };
  }
  // draw an image so it appears upright in the ROTATED view of the page.
  // pdf-lib rotates counter-clockwise around the (x,y) anchor.
  function drawViewBox(copied, img, vx, vy, vw, vh, W, H, total, opacity) {
    var r = viewRectToPts(vx, vy, vw, vh, W, H, total);
    if (total === 90) {
      copied.drawImage(img, { x: r.x + r.w, y: r.y, width: r.h, height: r.w, rotate: PDFLib.degrees(90), opacity: opacity });
    } else if (total === 270) {
      copied.drawImage(img, { x: r.x, y: r.y + r.h, width: r.h, height: r.w, rotate: PDFLib.degrees(270), opacity: opacity });
    } else if (total === 180) {
      copied.drawImage(img, { x: r.x + r.w, y: r.y + r.h, width: r.w, height: r.h, rotate: PDFLib.degrees(180), opacity: opacity });
    } else {
      copied.drawImage(img, { x: r.x, y: r.y, width: r.w, height: r.h, opacity: opacity });
    }
  }
  function textToStampDataUrl(text, color, fontPx, dpr) {
    fontPx = fontPx || 32; dpr = dpr || 3;
    var lines = String(text).split('\n');
    var probe = document.createElement('canvas').getContext('2d');
    probe.font = '700 ' + (fontPx * dpr) + "px Inter, Arial, sans-serif";
    var maxW = 0;
    lines.forEach(function (l) { maxW = Math.max(maxW, probe.measureText(l || ' ').width); });
    if (maxW > 8000) { // keep canvas within safe bounds
      fontPx = Math.floor(fontPx * 8000 / maxW);
      probe.font = '700 ' + (fontPx * dpr) + "px Inter, Arial, sans-serif";
      maxW = 0;
      lines.forEach(function (l) { maxW = Math.max(maxW, probe.measureText(l || ' ').width); });
    }
    var lineH = fontPx * dpr * 1.25;
    var c = document.createElement('canvas');
    c.width = Math.ceil(maxW + 8);
    c.height = Math.ceil(lineH * lines.length + 8);
    var ctx = c.getContext('2d');
    ctx.font = '700 ' + (fontPx * dpr) + "px Inter, Arial, sans-serif";
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    lines.forEach(function (l, i) { ctx.fillText(l, 4, 4 + i * lineH); });
    return { dataUrl: c.toDataURL('image/png'), w: c.width, h: c.height };
  }
  async function getLibDoc(fi) {
    if (!libCache.has(fi)) {
      var bytes = state.files[fi].bytes.slice();
      libCache.set(fi, await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true }));
    }
    return libCache.get(fi);
  }
  async function exportPdf() {
    var btn = $('btnExportPdf');
    if (!state.pages.length) return;
    btn.disabled = true;
    var oldLabel = btn.innerHTML;
    status('⏳ Building your edited PDF in the browser…');
    try {
      var out = await PDFLib.PDFDocument.create();
      var helv = await out.embedFont(PDFLib.StandardFonts.Helvetica);
      var helvB = await out.embedFont(PDFLib.StandardFonts.HelveticaBold);
      var imgCache = new Map();

      async function embed(dataUrl) {
        if (imgCache.has(dataUrl)) return imgCache.get(dataUrl);
        var b64 = dataUrl.split(',')[1];
        var raw = Uint8Array.from(atob(b64), function (ch) { return ch.charCodeAt(0); });
        var img = raw[0] === 0x89 && raw[1] === 0x50 ? await out.embedPng(raw) : await out.embedJpg(raw);
        imgCache.set(dataUrl, img);
        return img;
      }

      for (var i = 0; i < state.pages.length; i++) {
        var pg = state.pages[i];
        var src = await getLibDoc(pg.fi);
        var _rotMeta = (await state.files[pg.fi].doc.getPage(pg.pno)).rotate || 0;
        var [copied] = await out.copyPages(src, [pg.pno - 1]);
        var total = normRot(_rotMeta + pg.rot);
        copied.setRotation(PDFLib.degrees(total));
        out.addPage(copied);
        var W = copied.getWidth(), H = copied.getHeight();

        // objects on this page (z ascending)
        var objs = state.objects.filter(function (o) { return o.pi === i; })
          .sort(function (a, b) { return a.z - b.z; });
        for (var k = 0; k < objs.length; k++) {
          var o = objs[k];
          try {
            if (o.type === 'image') {
              var img = await embed(o.dataUrl);
              drawViewBox(copied, img, o.x, o.y, o.w, o.h, W, H, total, o.opacity);
            } else if (total === 0 && !/[^\x20-\x7E\u00A0-\u00FF]/.test(o.text)) {
              var size = o.fsPct / 100 * H;
              var rgb = hexToRgb01(o.color);
              var lines = String(o.text).split('\n');
              var yBase = H - o.y * H - size * 0.85;
              for (var li = 0; li < lines.length; li++) {
                copied.drawText(lines[li], {
                  x: o.x * W, y: yBase - li * size * 1.25,
                  size: size, font: helv, opacity: o.opacity,
                  color: PDFLib.rgb(rgb.r, rgb.g, rgb.b)
                });
              }
            } else {
              // rotated page (or non-latin glyphs): stamp text as high-res transparent image
              var fontPx = Math.max(14, Math.round(o.fsPct / 100 * H * 0.6));
              var st = textToStampDataUrl(o.text, o.color, fontPx);
              var sImg = await embed(st.dataUrl);
              var sh = Math.max(o.h || 0.03, 0.03);
              drawViewBox(copied, sImg, o.x, o.y, o.w, sh, W, H, total, o.opacity);
            }
          } catch (e) { console.warn('object skipped', e); }
        }

        // watermark — placed in view space so it reads upright in the rotated view too
        if ($('wmEnabled').checked && $('wmText').value.trim()) {
          var wmTextV = $('wmText').value;
          var wmFontPx = Math.max(24, Math.round($('wmSize').value / 100 * H));
          var stWm = textToStampDataUrl(wmTextV, '#334155', wmFontPx, 2);
          var wImg = await embed(stWm.dataUrl);
          var wmOpacity = Math.max(0.03, Math.min(0.95, +$('wmOpacity').value / 100));
          if (total === 0 && $('wmDiagonal').checked) {
            var targetW = W * 0.82;
            var targetH = targetW * (stWm.h / stWm.w);
            if (targetH > H) { targetH = H * 0.3; targetW = targetH * (stWm.w / stWm.h); }
            // rotate −30° around the stamp's centre: shift anchor so centre stays mid-page
            var th = -30 * Math.PI / 180;
            var cxOff = (targetW / 2) * Math.cos(th) - (targetH / 2) * Math.sin(th);
            var cyOff = (targetW / 2) * Math.sin(th) + (targetH / 2) * Math.cos(th);
            copied.drawImage(wImg, {
              x: W / 2 - cxOff, y: H / 2 - cyOff,
              width: targetW, height: targetH,
              rotate: PDFLib.degrees(-30), opacity: wmOpacity
            });
          } else {
            // straight watermark: define a centered box in view fractions and reuse rotated draw
            var Vw = (total === 90 || total === 270) ? H : W;
            var Vh = (total === 90 || total === 270) ? W : H;
            var bw = 0.82;
            var bh = (bw * Vw * (stWm.h / stWm.w)) / Vh;
            if (bh > 0.3) { bh = 0.3; bw = (bh * Vh * (stWm.w / stWm.h)) / Vw; }
            drawViewBox(copied, wImg, (1 - bw) / 2, (1 - bh) / 2, bw, bh, W, H, total, wmOpacity);
          }
        }

        // page numbers
        if ($('pnEnabled').checked) {
          var label = pnText(i, state.pages.length);
          var pos = $('pnPosition').value;
          if (total === 0) {
            var pnSize = Math.max(8, H * 0.012);
            var tw = helvB.widthOfTextAtSize(label, pnSize);
            var px = pos.charAt(1) === 'c' ? (W - tw) / 2 : (pos.charAt(1) === 'r' ? W * 0.94 - tw : W * 0.06);
            var py = pos.charAt(0) === 'b' ? H * 0.035 : H * 0.955;
            copied.drawText(label, { x: px, y: py, size: pnSize, font: helvB, color: PDFLib.rgb(0.2, 0.25, 0.33) });
          } else {
            // rotated page: stamp the number as an image so it reads upright in view
            var stPn = textToStampDataUrl(label, '#334155', 24, 3);
            var pnImg = await embed(stPn.dataUrl);
            var Vw2 = (total === 90 || total === 270) ? H : W;
            var Vh2 = (total === 90 || total === 270) ? W : H;
            var bhh = 0.024;
            var bww = (bhh * Vh2 * (stPn.w / stPn.h)) / Vw2;
            var vxpn = pos.charAt(1) === 'c' ? 0.5 - bww / 2 : (pos.charAt(1) === 'r' ? 0.96 - bww : 0.04);
            var vypn = pos.charAt(0) === 'b' ? 0.972 - bhh : 0.012;
            drawViewBox(copied, pnImg, vxpn, vypn, bww, bhh, W, H, total, 0.9);
          }
        }
      }

      var bytesOut = await out.save();
      var blob = new Blob([bytesOut], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'edited-' + (state.files[0] ? state.files[0].name.replace(/\.pdf$/i, '') : 'document') + '.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
      status('✅ Done! Edited PDF (' + fmtKB(bytesOut.length) + ') downloaded — check your Downloads folder.');
    } catch (e) {
      console.error(e);
      status('Export failed: ' + (e.message || 'unknown error') + ' — try re-opening the PDF.', true);
    } finally {
      btn.innerHTML = oldLabel;
      btn.disabled = false;
    }
  }
  function updateExportSummary() {
    var n = state.pages.length;
    var ob = state.objects.length;
    $('exportSummary').textContent = n
      ? n + ' page' + (n > 1 ? 's' : '') + ' · ' + ob + ' edit' + (ob === 1 ? '' : 's') + ' · ready to export'
      : '';
    $('btnExportPdf').disabled = !n;
  }

  /* ───────── wiring ───────── */
  function bind() {
    var zone = $('pdfUploadZone');
    var input = $('pdfFileInput');
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') input.click(); });
    input.addEventListener('change', function () { loadFiles(input.files); input.value = ''; });
    ['dragover', 'dragenter'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('dragover'); });
    });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) loadFiles(e.dataTransfer.files);
    });

    $('btnAddMorePdfs').addEventListener('click', function () { input.click(); });
    $('btnClearAll').addEventListener('click', function () {
      if (!confirm('Remove all loaded PDFs and edits?')) return;
      state.files = []; state.pages = []; state.objects = [];
      state.cur = -1; state.selId = null; libCache.clear();
      $('pdfObjToolbar').classList.remove('show');
      afterStructureChange();
      status('');
    });

    $('btnPrevPage').addEventListener('click', function () { if (state.cur > 0) { state.cur--; renderPage(); markActiveThumb(); } });
    $('btnNextPage').addEventListener('click', function () { if (state.cur < state.pages.length - 1) { state.cur++; renderPage(); markActiveThumb(); } });
    $('btnZoomIn').addEventListener('click', function () { state.zoom = Math.min(3, state.zoom * 1.2); renderPage(); });
    $('btnZoomOut').addEventListener('click', function () { state.zoom = Math.max(0.4, state.zoom / 1.2); renderPage(); });
    $('btnZoomFit').addEventListener('click', function () { state.zoom = 1; renderPage(); });

    $('btnAddText').addEventListener('click', addTextObject);
    $('btnAddImage').addEventListener('click', function () { $('pdfImageInput').click(); });
    $('pdfImageInput').addEventListener('change', function () {
      var f = this.files[0]; this.value = '';
      if (!f || state.cur < 0) return;
      normalizeImageFile(f).then(function (r) {
        addImageObject(r.dataUrl, r.w, r.h, false);
      }).catch(function () { status('Could not read that image.', true); });
    });
    $('btnDrawSign').addEventListener('click', openSignature);
    bindSignature();

    // watermark controls
    $('wmEnabled').addEventListener('change', function () {
      ['wmText', 'wmSize', 'wmOpacity', 'wmDiagonal'].forEach(function (id) { $(id).disabled = !$('wmEnabled').checked; });
      renderStampPreviews();
    });
    ['wmText', 'wmSize', 'wmOpacity', 'wmDiagonal'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        $('wmSizeVal').textContent = $('wmSize').value + '%';
        $('wmOpacityVal').textContent = $('wmOpacity').value + '%';
        renderStampPreviews();
      });
    });
    $('pnEnabled').addEventListener('change', function () {
      ['pnPosition', 'pnFormat'].forEach(function (id) { $(id).disabled = !$('pnEnabled').checked; });
      renderStampPreviews();
    });
    ['pnPosition', 'pnFormat'].forEach(function (id) { $(id).addEventListener('change', renderStampPreviews); });

    // object toolbar
    $('objFontMinus').addEventListener('click', function () { adjustSel('fs', -0.3); });
    $('objFontPlus').addEventListener('click', function () { adjustSel('fs', +0.3); });
    $('objColor').addEventListener('input', function () { adjustSel('color', this.value); });
    $('objOpacityMinus').addEventListener('click', function () { adjustSel('op', -0.15); });
    $('objOpacityPlus').addEventListener('click', function () { adjustSel('op', +0.15); });
    $('objFront').addEventListener('click', function () {
      var o = selObj(); if (o) { o.z = ++state.zTop; renderObjectLayer(); }
    });
    $('objBack').addEventListener('click', function () {
      var o = selObj(); if (o) { o.z = -o.z; state.objects.forEach(function (x) { if (x !== o && x.z < 0) x.z += 0.5; }); renderObjectLayer(); }
    });
    $('objDelete').addEventListener('click', deleteSelected);

    $('btnExportPdf').addEventListener('click', exportPdf);

    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.isContentEditable || /INPUT|SELECT|TEXTAREA/.test(t.tagName))) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); e.preventDefault(); return; }
      var o = selObj();
      if (!o) return;
      var step = e.shiftKey ? 0.02 : 0.005;
      if (e.key === 'ArrowLeft') o.x = Math.max(0, o.x - step);
      else if (e.key === 'ArrowRight') o.x = Math.min(1 - 0.02, o.x + step);
      else if (e.key === 'ArrowUp') o.y = Math.max(0, o.y - step);
      else if (e.key === 'ArrowDown') o.y = Math.min(1 - 0.02, o.y + step);
      else return;
      renderObjectLayer();
      e.preventDefault();
    });

    // deselect on empty viewer click
    $('pdfViewerShell').addEventListener('pointerdown', function (e) {
      if (e.target === this || e.target === $('pdfPageBox') || e.target === $('pdfRenderCanvas')) {
        state.selId = null;
        selectObject(null);
      }
    });

    var rsz;
    window.addEventListener('resize', function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () { if (state.cur >= 0) { renderPage(); } }, 200);
    });
  }
  function selObj() { return state.objects.find(function (o) { return o.id === state.selId; }); }
  function adjustSel(what, val) {
    var o = selObj(); if (!o) return;
    if (what === 'fs') { o.fsPct = Math.min(20, Math.max(0.5, o.fsPct + val)); }
    if (what === 'color') { o.color = val; }
    if (what === 'op') { o.opacity = Math.min(1, Math.max(0.1, o.opacity + val)); }
    renderObjectLayer();
    selectObject(o.id);
  }

  // keep object-list summary fresh
  var _renderObjects = renderObjectLayer;
  renderObjectLayer = function () { _renderObjects(); updateExportSummary(); };

  bind();
})();
