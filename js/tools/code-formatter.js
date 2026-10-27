/* ═══════════════════════════════════════════════════
   CODE FORMATTER & MINIFIER (HTML, CSS, JS, JSON)
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentLang = 'json';

  const langButtons = document.querySelectorAll('.btn-lang');
  const indentSelect = document.getElementById('indentSelect');
  const srcCode = document.getElementById('srcCode');
  const destCode = document.getElementById('destCode');
  const inputSizeStats = document.getElementById('inputSizeStats');
  const outputStats = document.getElementById('outputStats');
  const btnFormat = document.getElementById('btnFormat');
  const btnMinify = document.getElementById('btnMinify');
  const btnSampleCode = document.getElementById('btnSampleCode');
  const btnClearCode = document.getElementById('btnClearCode');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const btnDownloadCode = document.getElementById('btnDownloadCode');

  function getIndent() {
    const val = indentSelect.value;
    if (val === 'tab') return '\t';
    return ' '.repeat(parseInt(val, 10) || 2);
  }

  // Formatting implementations
  function formatJSON(code, indent) {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, indent);
  }

  function minifyJSON(code) {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed);
  }

  function formatCSS(code, indent) {
    let formatted = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
      .replace(/\s+/g, ' ')
      .replace(/{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/}\s*/g, '\n}\n\n')
      .trim();

    const lines = formatted.split('\n');
    let out = '';
    lines.forEach((line) => {
      const l = line.trim();
      if (!l) return;
      if (l.endsWith('}')) {
        out += l + '\n\n';
      } else if (l.endsWith('{')) {
        out += l + '\n';
      } else {
        out += indent + l + '\n';
      }
    });
    return out.trim();
  }

  function minifyCSS(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
      .replace(/\s*([\{\}:;,])\s*/g, '$1') // remove spacing around symbols
      .replace(/;\}/g, '}') // remove trailing semicolon
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatHTML(code, indent) {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    let html = code.replace(reg, '$1\r\n$2$3');
    let pad = 0;

    html.split('\r\n').forEach((node) => {
      let indentCount = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indentCount = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indentCount = 1;
      } else {
        indentCount = 0;
      }

      let padding = '';
      for (let i = 0; i < pad; i++) {
        padding += indent;
      }

      formatted += padding + node.trim() + '\n';
      pad += indentCount;
    });

    return formatted.trim();
  }

  function minifyHTML(code) {
    return code
      .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
      .replace(/>\s+</g, '><') // remove spaces between tags
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatJS(code, indent) {
    // Simple bracket-based clean beautifier for vanilla JS
    let out = '';
    let depth = 0;
    const clean = code.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
    const lines = clean.split('\n');

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      if (line.startsWith('}') || line.startsWith(']')) {
        depth = Math.max(0, depth - 1);
      }

      out += indent.repeat(depth) + line + '\n';

      if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')) {
        depth++;
      }
    });

    return out.trim();
  }

  function minifyJS(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments
      .replace(/\/\/[^\n]*\n/g, '\n') // single line comments
      .replace(/\s+/g, ' ')
      .replace(/\s*([=+\-*\/%{}();,:<>!&|])\s*/g, '$1')
      .trim();
  }

  function updateStats(origText, resultText) {
    const origBytes = new Blob([origText]).size;
    const resBytes = new Blob([resultText]).size;
    inputSizeStats.textContent = `${origText.length} chars | ${origBytes} bytes`;

    if (!resultText) {
      outputStats.textContent = '0 chars (0% savings)';
      return;
    }

    const diff = origBytes - resBytes;
    const pct = origBytes > 0 ? ((diff / origBytes) * 100).toFixed(1) : 0;
    outputStats.textContent = `${resultText.length} chars | ${resBytes} bytes (${pct >= 0 ? '-' + pct : '+' + Math.abs(pct)}% size change)`;
  }

  function doFormat() {
    const raw = srcCode.value.trim();
    if (!raw) return;
    const indent = getIndent();

    try {
      let res = '';
      if (currentLang === 'json') res = formatJSON(raw, indent);
      else if (currentLang === 'css') res = formatCSS(raw, indent);
      else if (currentLang === 'html') res = formatHTML(raw, indent);
      else if (currentLang === 'js') res = formatJS(raw, indent);

      destCode.value = res;
      updateStats(raw, res);
    } catch (err) {
      destCode.value = `⚠️ Syntax Error in ${currentLang.toUpperCase()}:\n${err.message}`;
    }
  }

  function doMinify() {
    const raw = srcCode.value.trim();
    if (!raw) return;

    try {
      let res = '';
      if (currentLang === 'json') res = minifyJSON(raw);
      else if (currentLang === 'css') res = minifyCSS(raw);
      else if (currentLang === 'html') res = minifyHTML(raw);
      else if (currentLang === 'js') res = minifyJS(raw);

      destCode.value = res;
      updateStats(raw, res);
    } catch (err) {
      destCode.value = `⚠️ Syntax Error in ${currentLang.toUpperCase()}:\n${err.message}`;
    }
  }

  // Samples
  const samples = {
    json: '{"title":"AllToolsInOne","version":2.0,"features":["100% Client Side","Fast","Ad Free"],"metrics":{"tools":68,"active":true}}',
    html: '<!DOCTYPE html><html><head><title>Sample</title></head><body><div class="container"><h1>Hello World</h1><p>Fast online tools.</p></div></body></html>',
    css: '.container{max-width:1200px;margin:0 auto;padding:20px;background:#ffffff;border-radius:8px;}h1{font-size:24px;color:#1e3a8a;}',
    js: 'function calculateSum(a,b){const result=a+b;console.log("Sum is:",result);return result;}calculateSum(15,25);'
  };

  btnFormat.addEventListener('click', doFormat);
  btnMinify.addEventListener('click', doMinify);
  srcCode.addEventListener('input', () => {
    updateStats(srcCode.value, destCode.value);
  });

  btnClearCode.addEventListener('click', () => {
    srcCode.value = '';
    destCode.value = '';
    updateStats('', '');
  });

  btnSampleCode.addEventListener('click', () => {
    srcCode.value = samples[currentLang] || samples.json;
    doFormat();
  });

  btnCopyCode.addEventListener('click', () => {
    if (!destCode.value || destCode.value.startsWith('⚠️')) return;
    navigator.clipboard.writeText(destCode.value).then(() => {
      const orig = btnCopyCode.innerHTML;
      btnCopyCode.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyCode.innerHTML = orig; }, 1800);
    });
  });

  btnDownloadCode.addEventListener('click', () => {
    if (!destCode.value || destCode.value.startsWith('⚠️')) return;
    const blob = new Blob([destCode.value], { type: 'text/plain;charset=utf-8' });
    const extMap = { json: 'json', html: 'html', css: 'css', js: 'js' };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `formatted_code.${extMap[currentLang] || 'txt'}`;
    a.click();
  });

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      langButtons.forEach((b) => { b.className = 'btn btn-outline btn-lang'; });
      btn.className = 'btn btn-primary btn-lang';
      currentLang = btn.getAttribute('data-lang');
      srcCode.value = samples[currentLang] || '';
      doFormat();
    });
  });

  // Default initial run
  srcCode.value = samples.json;
  doFormat();

})();
