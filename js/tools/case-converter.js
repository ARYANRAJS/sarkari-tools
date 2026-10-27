/* ═══════════════════════════════════════════════════
   TEXT CASE CONVERTER & STRING UTILITIES
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const caseInput = document.getElementById('caseInput');
  const caseStats = document.getElementById('caseStats');
  const btnCaseList = document.querySelectorAll('.btn-case');
  const btnClear = document.getElementById('btnClear');
  const btnCopy = document.getElementById('btnCopy');
  const btnDownload = document.getElementById('btnDownload');

  function updateStats() {
    const text = caseInput.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    caseStats.textContent = `${words} words | ${chars} chars`;
  }

  function toSentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
  }

  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function toCamelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  }

  function toPascalCase(str) {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  function toSnakeCase(str) {
    return str
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }

  function toKebabCase(str) {
    return str
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
  }

  function toConstantCase(str) {
    return toSnakeCase(str).toUpperCase();
  }

  function toAlternateCase(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      out += i % 2 === 0 ? str[i].toLowerCase() : str[i].toUpperCase();
    }
    return out;
  }

  function reverseText(str) {
    return str.split('').reverse().join('');
  }

  function cleanSpaces(str) {
    return str.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, '');
  }

  function applyAction(action) {
    const val = caseInput.value;
    if (!val) return;

    let res = val;
    switch (action) {
      case 'sentence': res = toSentenceCase(val); break;
      case 'upper': res = val.toUpperCase(); break;
      case 'lower': res = val.toLowerCase(); break;
      case 'title': res = toTitleCase(val); break;
      case 'capitalize': res = val.replace(/\b\w/g, (c) => c.toUpperCase()); break;
      case 'camel': res = toCamelCase(val); break;
      case 'pascal': res = toPascalCase(val); break;
      case 'snake': res = toSnakeCase(val); break;
      case 'kebab': res = toKebabCase(val); break;
      case 'constant': res = toConstantCase(val); break;
      case 'alternate': res = toAlternateCase(val); break;
      case 'reverse': res = reverseText(val); break;
      case 'clean': res = cleanSpaces(val); break;
    }

    caseInput.value = res;
    updateStats();
  }

  btnCaseList.forEach((btn) => {
    btn.addEventListener('click', () => {
      btnCaseList.forEach((b) => b.className = 'btn btn-outline btn-case');
      btn.className = 'btn btn-primary btn-case';
      const action = btn.getAttribute('data-action');
      applyAction(action);
    });
  });

  caseInput.addEventListener('input', updateStats);

  btnClear.addEventListener('click', () => {
    caseInput.value = '';
    updateStats();
  });

  btnCopy.addEventListener('click', () => {
    if (!caseInput.value) return;
    navigator.clipboard.writeText(caseInput.value).then(() => {
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopy.innerHTML = orig; }, 1800);
    });
  });

  btnDownload.addEventListener('click', () => {
    if (!caseInput.value) return;
    const blob = new Blob([caseInput.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted_text.txt';
    a.click();
  });

  // Default sample
  caseInput.value = 'all-in-one free online tools for government application forms, students and developers.';
  updateStats();

})();
