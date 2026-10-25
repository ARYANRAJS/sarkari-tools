/* ═══════════════════════════════════════════════════════════
   SARKARI TOOLS — AI Video Subtitle Maker
   100% client-side. Whisper (transformers.js) runs in a Web
   Worker. WebAudio extracts 16 kHz mono audio for ASR.
   Timeline editor: drag / retime cue blocks. SRT/VTT/TXT export.
   Display modes: original, Devanagari, Hinglish (Roman).
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var state = {
    fileName: null,
    fileUrl: null,
    duration: 0,
    audio: null,          // Float32Array @16kHz mono (for ASR)
    cues: [],             // {id, start, end, text}
    uid: 1,
    lang: 'auto',
    model: 'Xenova/whisper-tiny',
    display: 'orig',      // orig | deva | hinglish
    activeCueId: null,
    workerBusy: false
  };

  /* ───────── tiny helpers ───────── */
  function status(msg, bad) {
    var el = $('subStatus');
    el.textContent = msg;
    el.style.background = bad ? '#fef2f2' : '#eff6ff';
    el.style.color = bad ? '#b91c1c' : '#1d4ed8';
    el.style.borderColor = bad ? '#fecaca' : '#bfdbfe';
    el.classList.add('show');
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function fmtShort(t) {
    if (!isFinite(t)) t = 0;
    var m = Math.floor(t / 60), s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
  }
  // cue time input format: m:ss.mmm  (compact but precise)
  function fmtCueTime(t) {
    if (!isFinite(t)) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t - m * 60);
    var ms = Math.round((t - m * 60 - s) * 1000);
    return m + ':' + (s < 10 ? '0' : '') + s + '.' + ('00' + ms).slice(-3);
  }
  function parseCueTime(str) {
    var m = String(str).trim().match(/^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/);
    if (!m) return null;
    var ms = m[3] ? +(('' + m[3]).length === 3 ? m[3] : (m[3] + '00').slice(0, 3)) : 0;
    return (+m[1]) * 60 + (+m[2]) + ms / 1000;
  }
  function fmtSrtTime(t) {
    if (!isFinite(t)) t = 0;
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60);
    var s = Math.floor(t % 60), ms = Math.round((t - Math.floor(t)) * 1000);
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    return p2(h) + ':' + p2(m) + ':' + p2(s) + ',' + ('00' + ms).slice(-3);
  }

  /* ───────── Devanagari → Roman (Hinglish) ───────── */
  var DEVA_MAP = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  var MATRAS = 'ािीुूृेैोौ';
  function isDevConsonant(ch) {
    return ch >= '\u0915' && ch <= '\u0939';
  }
  function devaToRoman(text) {
    var out = '';
    var pendingC = ''; // consonant awaiting vowel / virama / resolution
    function resolve(withA) {
      if (pendingC) { out += pendingC + (withA ? 'a' : ''); pendingC = ''; }
    }
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (isDevConsonant(ch)) {
        resolve(true);
        pendingC = DEVA_MAP[ch] || '';
      } else if (ch === '्') { // virama — suppress inherent a
        resolve(false);
      } else if (MATRAS.indexOf(ch) >= 0) {
        resolve(false);
        out += DEVA_MAP[ch] || '';
      } else if (DEVA_MAP[ch] !== undefined) {
        resolve(true);
        out += DEVA_MAP[ch];
      } else if (ch === '़') { // nukta — attach to previous output (ज़ → j + z handled crudely)
        out += 'z';
      } else {
        resolve(true); // word/space end: final schwa dropped
        out += ch;
      }
    }
    resolve(false); // trailing consonant: no inherent a at word end
    return out;
  }
  function hasDevanagari(s) { return /[\u0900-\u097F]/.test(s); }
  function displayText(cue) {
    if (state.display === 'hinglish' && hasDevanagari(cue.text)) return devaToRoman(cue.text);
    return cue.text;
  }

  /* ───────── media load + audio extraction ───────── */
  async function loadMedia(file) {
    status('⏳ Reading "' + file.name + '"…');
    state.fileName = file.name;
    if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
    state.fileUrl = URL.createObjectURL(file);
    var v = $('subVideo');
    v.src = state.fileUrl;
    await new Promise(function (res, rej) {
      v.onloadedmetadata = res;
      v.onerror = function () { rej(new Error('Browser cannot play this file format')); };
      setTimeout(function () { rej(new Error('Timed out reading the file')); }, 20000);
    });
    state.duration = v.duration || 0;
    if (state.duration > 3600) {
      status('File is over 1 hour — please split it first (on-device AI limit).', true);
      return;
    }
    $('subWorkspace').style.display = '';
    $('subMediaInfo').textContent = '📄 ' + file.name + ' · duration ' + fmtShort(state.duration) +
      ' · ' + (file.size / 1048576).toFixed(1) + ' MB';
    window.scrollTo({ top: $('subWorkspace').offsetTop - 90, behavior: 'smooth' });
    renderTimeline();
    renderCueList();
    status('✅ Media loaded. Press "Auto-Generate Subtitles" for AI, or add cues manually.');
    // extract audio in background
    extractAudio(file).then(function (audio) {
      state.audio = audio;
    }).catch(function (e) {
      console.warn('audio extract failed', e);
      status('⚠ Playing works, but the audio track could not be extracted for AI transcription (' +
        (e.message || 'unsupported codec') + '). You can still add subtitles manually.', true);
    });
  }

  async function extractAudio(file) {
    var buf = await file.arrayBuffer();
    var ctx = null;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    } catch (e) { ctx = null; }
    var decoded;
    if (ctx) {
      try { decoded = await ctx.decodeAudioData(buf.slice(0)); }
      catch (e) { decoded = null; }
      ctx.close();
    }
    if (!decoded) {
      // fallback: standard context + offline resample
      var ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      decoded = await ctx2.decodeAudioData(buf.slice(0));
      ctx2.close();
      var off = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
      var src = off.createBufferSource();
      src.buffer = decoded;
      src.connect(off.destination);
      src.start();
      decoded = await off.startRendering();
    }
    // mono mixdown
    var chs = decoded.numberOfChannels, len = decoded.length;
    var out = new Float32Array(len);
    for (var c = 0; c < chs; c++) {
      var d = decoded.getChannelData(c);
      for (var i = 0; i < len; i++) out[i] += d[i] / chs;
    }
    return out;
  }

  /* ───────── Whisper worker ───────── */
  var worker = null;
  function getWorker() {
    if (worker) return worker;
    var src = [
      "import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';",
      'env.allowLocalModels = false;',
      'var asr = null, loadedModel = null;',
      'async function makePipeline(model) {',
      '  var opts = { quantized: true, progress_callback: function (p) { self.postMessage({ type: "dl", data: p }); } };',
      '  try {',
      '    return await pipeline("automatic-speech-recognition", model, opts);',
      '  } catch (e) {',
      '    // some networks block huggingface.co — retry once via the public mirror',
      '    self.postMessage({ type: "mirror" });',
      '    env.remoteHost = "https://hf-mirror.com/";',
      '    return await pipeline("automatic-speech-recognition", model, opts);',
      '  }',
      '}',
      'self.onmessage = async function (e) {',
      '  var msg = e.data;',
      '  try {',
      '    if (msg.type === "transcribe") {',
      '      if (!asr || loadedModel !== msg.model) {',
      '        asr = await makePipeline(msg.model);',
      '        loadedModel = msg.model;',
      '      }',
      '      var opts = { chunk_length_s: 30, stride_length_s: 5, return_timestamps: true };',
      '      if (msg.language && msg.language !== "auto") opts.language = msg.language;',
      '      if (msg.translate) opts.task = "translate";',
      '      var out = await asr(msg.audio, opts);',
      '      self.postMessage({ type: "result", data: { text: out.text, chunks: out.chunks || [] } });',
      '    }',
      '  } catch (err) {',
      '    self.postMessage({ type: "error", data: (err && err.message) || String(err) });',
      '  }',
      '};'
    ].join('\n');
    var blob = new Blob([src], { type: 'text/javascript' });
    worker = new Worker(URL.createObjectURL(blob), { type: 'module' });
    worker.onmessage = onWorkerMessage;
    worker.onerror = function (e) {
      state.workerBusy = false;
      progressHide();
      status('❌ AI engine failed to load — check your internet connection (model downloads once from CDN).', true);
      console.error(e);
    };
    return worker;
  }

  var dlFiles = {}; // file -> {loaded, total}
  function onWorkerMessage(e) {
    var m = e.data;
    if (m.type === 'dl') {
      var p = m.data || {};
      if (p.status === 'progress' && p.file && p.total) {
        dlFiles[p.file] = { loaded: p.loaded || 0, total: p.total };
      } else if (p.status === 'done' && p.file) {
        dlFiles[p.file] = { loaded: 1, total: 1 };
      }
      var tot = 0, loaded = 0, any = false;
      Object.keys(dlFiles).forEach(function (k) {
        any = true; tot += dlFiles[k].total; loaded += dlFiles[k].loaded;
      });
      if (any && tot > 0) {
        progressShow('Downloading AI model (cached after this)…', Math.round(loaded / tot * 100));
      }
    } else if (m.type === 'ready') {
      if (state.workerBusy) status('🧠 AI model ready — transcribing…');
    } else if (m.type === 'mirror') {
      if (state.workerBusy) status('🧠 Main model host unreachable — retrying via mirror (hf-mirror.com)…');
    } else if (m.type === 'result') {
      state.workerBusy = false;
      progressHide();
      applyTranscription(m.data);
    } else if (m.type === 'error') {
      state.workerBusy = false;
      progressHide();
      status('❌ Transcription failed: ' + m.data, true);
    }
  }
  function progressShow(label, pct) {
    $('subProgressWrap').classList.add('show');
    $('subProgressLabel').textContent = label;
    $('subProgressPct').textContent = pct + '%';
    $('subProgressFill').style.width = pct + '%';
  }
  function progressHide() {
    $('subProgressWrap').classList.remove('show');
    $('subProgressFill').style.width = '0%';
  }

  function applyTranscription(data) {
    var chunks = data.chunks || [];
    if (!chunks.length && data.text && data.text.trim()) {
      chunks = [{ timestamp: [0, state.duration], text: data.text }];
    }
    var made = 0;
    chunks.forEach(function (c) {
      var s = c.timestamp && c.timestamp[0] != null ? c.timestamp[0] : 0;
      var en = c.timestamp && c.timestamp[1] != null ? c.timestamp[1] : s + 2;
      var txt = (c.text || '').trim();
      if (!txt) return;
      state.cues.push({ id: state.uid++, start: s, end: Math.max(en, s + 0.3), text: txt });
      made++;
    });
    sortCues();
    renderCueList();
    renderTimeline();
    if (made) {
      status('✅ AI ne ' + made + ' subtitle cues banaye! Timeline pe drag karke timings adjust karo, text edit karo, phir SRT download karo.');
    } else {
      status('AI could not detect clear speech. Try the Base/Small model, or check the audio.', true);
    }
  }

  function transcribe() {
    if (state.workerBusy) { status('AI is already working — please wait…', true); return; }
    if (!state.audio) { status('Audio is still being extracted — try again in a few seconds.', true); return; }
    state.workerBusy = true;
    dlFiles = {};
    progressShow('Starting on-device AI…', 2);
    status('🧠 Running Whisper AI fully on your device — keep this tab open…');
    getWorker().postMessage({
      type: 'transcribe',
      audio: state.audio,
      model: $('subModelSelect').value,
      language: state.lang,
      translate: $('subTranslate').checked
    });
  }

  /* ───────── cues: CRUD ───────── */
  function sortCues() {
    state.cues.sort(function (a, b) { return a.start - b.start; });
  }
  function addCue(atTime) {
    var t = atTime != null ? atTime : (state.duration ? clamp($('subVideo').currentTime, 0, state.duration - 2) : 0);
    var cue = { id: state.uid++, start: t, end: t + 2, text: '' };
    state.cues.push(cue);
    sortCues();
    renderCueList();
    renderTimeline();
    var ta = $('subCueList').querySelector('[data-cid="' + cue.id + '"] textarea');
    if (ta) ta.focus();
    return cue;
  }
  function splitCue(id) {
    var cue = state.cues.find(function (c) { return c.id === id; });
    if (!cue) return;
    var words = cue.text.split(/\s+/).filter(Boolean);
    if (words.length < 2) { status('Type at least two words before splitting this cue.', true); return; }
    var half = Math.ceil(words.length / 2);
    var midT = cue.start + (cue.end - cue.start) / 2;
    var second = { id: state.uid++, start: midT, end: cue.end, text: words.slice(half).join(' ') };
    cue.text = words.slice(0, half).join(' ');
    cue.end = midT;
    state.cues.push(second);
    sortCues(); renderCueList(); renderTimeline();
  }
  function mergeCue(id) {
    var idx = state.cues.findIndex(function (c) { return c.id === id; });
    if (idx < 0 || idx === state.cues.length - 1) return;
    var a = state.cues[idx], b = state.cues[idx + 1];
    a.text = (a.text + ' ' + b.text).trim();
    a.end = Math.max(a.end, b.end);
    state.cues.splice(idx + 1, 1);
    renderCueList(); renderTimeline();
  }
  function nudge(id, which, delta) {
    var cue = state.cues.find(function (c) { return c.id === id; });
    if (!cue) return;
    if (which === 'start') cue.start = clamp(cue.start + delta, 0, cue.end - 0.1);
    if (which === 'end') cue.end = clamp(cue.end + delta, cue.start + 0.1, state.duration || 1e9);
    if (which === 'both') {
      var d = delta;
      cue.start = clamp(cue.start + d, 0, 1e9);
      cue.end = clamp(cue.end + d, 0.1, state.duration || 1e9);
    }
    sortCues(); renderCueList(); renderTimeline(); syncPlayhead();
  }

  /* ───────── cue list rendering ───────── */
  function renderCueList() {
    var host = $('subCueList');
    host.innerHTML = '';
    $('cueCountBadge').textContent = '(' + state.cues.length + ')';
    if (!state.cues.length) {
      host.innerHTML = '<div class="sub-empty-hint">No subtitles yet — run the AI above, import an SRT/VTT file, or add a cue manually.</div>';
      return;
    }
    state.cues.forEach(function (cue) {
      var row = document.createElement('div');
      row.className = 'sub-cue' + (cue.id === state.activeCueId ? ' active' : '');
      row.dataset.cid = cue.id;
      row.innerHTML =
        '<div class="sub-cue-head">' +
        '<span class="sub-cue-num"></span>' +
        '<input class="sub-time-input" data-f="start">' +
        '<span style="color:#94a3b8;">→</span>' +
        '<input class="sub-time-input" data-f="end">' +
        '<button type="button" data-a="seek" title="Play from here">▶</button>' +
        '<button type="button" data-a="nss" title="Start −0.1s">⟨−</button>' +
        '<button type="button" data-a="nsp" title="Start +0.1s">+⟩</button>' +
        '<button type="button" data-a="nes" title="End −0.1s">−⟩</button>' +
        '<button type="button" data-a="nep" title="End +0.1s">+⟩</button>' +
        '<button type="button" data-a="split" title="Split cue">✂</button>' +
        '<button type="button" data-a="merge" title="Merge with next">⇊⇡</button>' +
        '<button type="button" data-a="del" class="danger" title="Delete cue" style="margin-left:auto;">🗑</button>' +
        '</div>' +
        '<textarea placeholder="Subtitle text… (Hindi, English ya Hinglish — jo chahiye)"></textarea>';
      row.querySelector('.sub-cue-num').textContent = (state.cues.indexOf(cue) + 1);
      var si = row.querySelector('[data-f="start"]'), ei = row.querySelector('[data-f="end"]');
      si.value = fmtCueTime(cue.start); ei.value = fmtCueTime(cue.end);
      var ta = row.querySelector('textarea');
      ta.value = displayText(cue);
      ta.dataset.orig = cue.text;

      si.addEventListener('change', function () {
        var v = parseCueTime(si.value);
        if (v == null) { si.value = fmtCueTime(cue.start); return; }
        cue.start = clamp(v, 0, cue.end - 0.1);
        si.value = fmtCueTime(cue.start);
        sortCues(); renderCueList(); renderTimeline();
      });
      ei.addEventListener('change', function () {
        var v = parseCueTime(ei.value);
        if (v == null) { ei.value = fmtCueTime(cue.end); return; }
        cue.end = clamp(v, cue.start + 0.1, state.duration || 1e9);
        ei.value = fmtCueTime(cue.end);
        sortCues(); renderCueList(); renderTimeline();
      });
      ta.addEventListener('input', function () { cue.text = ta.value; });
      row.addEventListener('click', function (ev) {
        var btn = ev.target.closest('button');
        if (!btn) return;
        ev.preventDefault();
        var a = btn.dataset.a;
        if (a === 'seek') { $('subVideo').currentTime = cue.start; play(); }
        if (a === 'nss') nudge(cue.id, 'start', -0.1);
        if (a === 'nsp') nudge(cue.id, 'start', +0.1);
        if (a === 'nes') nudge(cue.id, 'end', -0.1);
        if (a === 'nep') nudge(cue.id, 'end', +0.1);
        if (a === 'split') splitCue(cue.id);
        if (a === 'merge') mergeCue(cue.id);
        if (a === 'del') {
          state.cues = state.cues.filter(function (c) { return c.id !== cue.id; });
          renderCueList(); renderTimeline();
        }
      });
      host.appendChild(row);
    });
  }

  /* ───────── timeline ───────── */
  function renderTimeline() {
    var tl = $('subTimeline');
    var ruler = $('subTlRuler');
    ruler.innerHTML = '';
    var dur = state.duration || 60;
    $('subTlDuration').textContent = fmtShort(dur);
    var ticks = Math.max(4, Math.min(12, Math.round(dur / 10)));
    for (var i = 0; i < ticks; i++) {
      var t = document.createElement('div');
      t.className = 'sub-tl-tick';
      t.innerHTML = '<i>' + fmtShort(dur / ticks * i) + '</i>';
      ruler.appendChild(t);
    }
    // remove old cue blocks
    Array.prototype.slice.call(tl.querySelectorAll('.sub-tl-cue')).forEach(function (el) { el.remove(); });
    state.cues.forEach(function (cue) {
      var el = document.createElement('div');
      el.className = 'sub-tl-cue';
      el.dataset.cid = cue.id;
      el.style.left = (cue.start / dur * 100) + '%';
      el.style.width = Math.max(0.6, (cue.end - cue.start) / dur * 100) + '%';
      var label = document.createElement('span');
      label.textContent = displayText(cue).slice(0, 40) || '·';
      el.appendChild(label);
      var hL = document.createElement('div'); hL.className = 'hL';
      var hR = document.createElement('div'); hR.className = 'hR';
      el.appendChild(hL); el.appendChild(hR);
      bindTlBlock(el, cue, hL, hR);
      tl.appendChild(el);
    });
    syncPlayhead();
  }

  function bindTlBlock(el, cue, hL, hR) {
    var tl = $('subTimeline');
    var dur = function () { return state.duration || 60; };

    function pxToSec(px) { return px / tl.clientWidth * dur(); }

    hL.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      drag(ev, function (dx) { cue.start = clamp(cue.start + dx, 0, cue.end - 0.1); });
    });
    hR.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      drag(ev, function (dx) { cue.end = clamp(cue.end + dx, cue.start + 0.1, dur()); });
    });
    el.addEventListener('pointerdown', function (ev) {
      if (ev.target === hL || ev.target === hR) return;
      ev.preventDefault();
      selectCue(cue.id);
      drag(ev, function (dx) {
        var len = cue.end - cue.start;
        cue.start = clamp(cue.start + dx, 0, dur() - len);
        cue.end = cue.start + len;
      });
    });
    el.addEventListener('dblclick', function () {
      $('subVideo').currentTime = cue.start; play();
    });

    function drag(ev, apply) {
      var moved = false;
      var startX = ev.clientX;
      function moveFn(e) {
        var dx = pxToSec(e.clientX - startX);
        startX = e.clientX;
        if (Math.abs(dx) > 0) moved = true;
        apply(dx);
        renderTimeline();
      }
      function upFn() {
        document.removeEventListener('pointermove', moveFn);
        document.removeEventListener('pointerup', upFn);
        if (moved) { sortCues(); renderCueList(); renderTimeline(); }
      }
      document.addEventListener('pointermove', moveFn);
      document.addEventListener('pointerup', upFn);
    }
  }

  $('subTimeline').addEventListener('pointerdown', function (ev) {
    if (ev.target.closest('.sub-tl-cue')) return;
    var r = this.getBoundingClientRect();
    var t = (ev.clientX - r.left) / r.width * (state.duration || 60);
    $('subVideo').currentTime = clamp(t, 0, state.duration || 0);
  });

  function selectCue(id) {
    state.activeCueId = id;
    Array.prototype.forEach.call($('subCueList').children, function (c) {
      c.classList.toggle('active', +c.dataset.cid === id);
    });
  }

  /* ───────── playback sync ───────── */
  var rafId = null;
  function play() { $('subVideo').play(); }
  function syncPlayhead() {
    var v = $('subVideo');
    if (!state.duration) return;
    $('subTlPlayhead').style.left = (clamp(v.currentTime / state.duration, 0, 1) * 100) + '%';
    $('subTimecode').textContent = fmtShort(v.currentTime) + ' / ' + fmtShort(state.duration);
    // active cue
    var cur = null;
    for (var i = 0; i < state.cues.length; i++) {
      if (v.currentTime >= state.cues[i].start && v.currentTime <= state.cues[i].end) { cur = state.cues[i]; break; }
    }
    var ov = $('subOverlay');
    if (cur) {
      ov.style.display = '';
      $('subOverlayText').textContent = displayText(cur);
      if (cur.id !== state.activeCueId) {
        selectCue(cur.id);
        var rowEl = $('subCueList').querySelector('[data-cid="' + cur.id + '"]');
        if (rowEl) rowEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    } else {
      ov.style.display = 'none';
      if (state.activeCueId != null) { state.activeCueId = null; selectCue(null); }
    }
    rafId = requestAnimationFrame(syncPlayhead);
  }

  /* ───────── import / export ───────── */
  function parseSrtVtt(text) {
    var cues = [];
    var isVtt = /^\s*WEBVTT/i.test(text);
    text = text.replace(/^\s*WEBVTT[^\n]*\n/, '').replace(/\r/g, '');
    var blocks = text.split(/\n{2,}/);
    var timeRe = /(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;
    blocks.forEach(function (b) {
      var lines = b.split('\n').filter(function (l) { return l.trim() && !/^NOTE/.test(l); });
      var ti = -1;
      for (var i = 0; i < lines.length; i++) { if (timeRe.test(lines[i])) { ti = i; break; } }
      if (ti < 0) return;
      var m = lines[ti].match(timeRe);
      var s = ((m[1] ? +m[1].replace(':', '') : 0) * 3600) + (+m[2] * 60) + (+m[3]) + (+(('' + m[4]).length === 3 ? m[4] : (m[4] + '00').slice(0, 3)) / 1000);
      var e = ((m[5] ? +m[5].replace(':', '') : 0) * 3600) + (+m[6] * 60) + (+m[7]) + (+(('' + m[8]).length === 3 ? m[8] : (m[8] + '00').slice(0, 3)) / 1000);
      var txt = lines.slice(ti + 1).join('\n').replace(/<[^>]+>/g, '').trim();
      if (txt) cues.push({ id: state.uid++, start: s, end: e, text: txt });
    });
    return cues;
  }
  function buildSubtitles(fmt) {
    var out = fmt === 'vtt' ? 'WEBVTT\n\n' : '';
    state.cues.forEach(function (cue, i) {
      var txt = displayText(cue);
      if (fmt === 'srt') {
        out += (i + 1) + '\n' + fmtSrtTime(cue.start) + ' --> ' + fmtSrtTime(cue.end) + '\n' + txt + '\n\n';
      } else {
        var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
        var t2s = function (t) {
          var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
          var ms = ('00' + Math.round((t - Math.floor(t)) * 1000)).slice(-3);
          return p2(h) + ':' + p2(m) + ':' + p2(s) + '.' + ms;
        };
        out += (i + 1) + '\n' + t2s(cue.start) + ' --> ' + t2s(cue.end) + '\n' + txt + '\n\n';
      }
    });
    return out;
  }
  function download(name, content, type) {
    var blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
  }
  function baseName() {
    return (state.fileName || 'subtitles').replace(/\.[^.]+$/, '');
  }

  /* ───────── wiring ───────── */
  function bind() {
    var zone = $('subUploadZone');
    var input = $('subFileInput');
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') input.click(); });
    input.addEventListener('change', function () { if (input.files[0]) loadMedia(input.files[0]); input.value = ''; });
    ['dragover', 'dragenter'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('dragover'); });
    });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) loadMedia(e.dataTransfer.files[0]);
    });

    $('subLangPills').addEventListener('click', function (e) {
      var b = e.target.closest('.sub-lang-pill'); if (!b) return;
      state.lang = b.dataset.lang;
      Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('active', c === b); });
    });
    $('subDisplayPills').addEventListener('click', function (e) {
      var b = e.target.closest('.sub-lang-pill'); if (!b) return;
      state.display = b.dataset.mode;
      Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('active', c === b); });
      renderCueList(); renderTimeline();
    });

    $('btnTranscribe').addEventListener('click', transcribe);
    $('btnAddCue').addEventListener('click', function () { addCue(); });
    $('btnClearCues').addEventListener('click', function () {
      if (!state.cues.length || !confirm('Delete all ' + state.cues.length + ' cues?')) return;
      state.cues = []; renderCueList(); renderTimeline();
    });
    $('btnImportSrt').addEventListener('click', function () { $('subImportInput').click(); });
    $('subImportInput').addEventListener('change', function () {
      var f = this.files[0]; this.value = '';
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var cues = parseSrtVtt(fr.result);
        if (!cues.length) { status('No cues found in that file — is it a valid SRT/VTT?', true); return; }
        state.cues = state.cues.concat(cues);
        sortCues(); renderCueList(); renderTimeline();
        status('📥 Imported ' + cues.length + ' cues from "' + f.name + '".');
      };
      fr.readAsText(f);
    });

    $('btnExportSrt').addEventListener('click', function () {
      if (!state.cues.length) { status('Nothing to export yet — generate or add cues first.', true); return; }
      download(baseName() + '.srt', buildSubtitles('srt'));
    });
    $('btnExportVtt').addEventListener('click', function () {
      if (!state.cues.length) { status('Nothing to export yet — generate or add cues first.', true); return; }
      download(baseName() + '.vtt', buildSubtitles('vtt'));
    });
    $('btnExportTxt').addEventListener('click', function () {
      if (!state.cues.length) { status('Nothing to export yet — generate or add cues first.', true); return; }
      var txt = state.cues.map(function (c) { return displayText(c); }).join('\n');
      download(baseName() + '-transcript.txt', txt);
    });

    var v = $('subVideo');
    $('btnPlayPause').addEventListener('click', function () {
      if (v.paused) { v.play(); } else { v.pause(); }
    });
    v.addEventListener('play', function () { $('btnPlayPause').textContent = '⏸ Pause'; });
    v.addEventListener('pause', function () { $('btnPlayPause').textContent = '▶ Play'; });
    $('btnPrevCue').addEventListener('click', function () {
      var t = v.currentTime;
      var prev = state.cues.filter(function (c) { return c.end < t - 0.05; }).pop();
      if (prev) { v.currentTime = prev.start; play(); }
    });
    $('btnNextCue').addEventListener('click', function () {
      var t = v.currentTime;
      var next = state.cues.find(function (c) { return c.start > t + 0.05; });
      if (next) { v.currentTime = next.start; play(); }
    });

    if (rafId === null) rafId = requestAnimationFrame(syncPlayhead);

    window.addEventListener('resize', function () { renderTimeline(); });
  }

  bind();
})();
