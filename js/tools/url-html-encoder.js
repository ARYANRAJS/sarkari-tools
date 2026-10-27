/* ═══════════════════════════════════════════════════
   URL & HTML ENTITY ENCODER / DECODER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentCategory = 'url'; // or 'html'
  let currentAction = 'encode'; // or 'decode'

  const tabUrlMode = document.getElementById('tabUrlMode');
  const tabHtmlMode = document.getElementById('tabHtmlMode');
  const btnModeEncode = document.getElementById('btnModeEncode');
  const btnModeDecode = document.getElementById('btnModeDecode');
  const inputLabel = document.getElementById('inputLabel');
  const outputLabel = document.getElementById('outputLabel');
  const srcInput = document.getElementById('srcInput');
  const destOutput = document.getElementById('destOutput');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const btnSample = document.getElementById('btnSample');
  const btnClear = document.getElementById('btnClear');
  const btnSwap = document.getElementById('btnSwap');
  const btnCopy = document.getElementById('btnCopy');

  function encodeHTML(str) {
    return str.replace(/[\u00A0-\u9999<>\&"']/g, (i) => '&#' + i.charCodeAt(0) + ';');
  }

  function decodeHTML(str) {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent || '';
  }

  function process() {
    const text = srcInput.value;
    inputStats.textContent = `${text.length} chars`;

    if (!text) {
      destOutput.value = '';
      outputStats.textContent = '0 chars';
      return;
    }

    try {
      let result = '';
      if (currentCategory === 'url') {
        if (currentAction === 'encode') {
          result = encodeURIComponent(text);
        } else {
          result = decodeURIComponent(text);
        }
      } else {
        if (currentAction === 'encode') {
          result = encodeHTML(text);
        } else {
          result = decodeHTML(text);
        }
      }
      destOutput.value = result;
      outputStats.textContent = `${result.length} chars`;
    } catch (err) {
      destOutput.value = `⚠️ Error during conversion: ${err.message}`;
    }
  }

  // Tabs
  tabUrlMode.addEventListener('click', () => {
    currentCategory = 'url';
    tabUrlMode.className = 'btn btn-primary';
    tabHtmlMode.className = 'btn btn-outline';
    updateLabels();
    process();
  });

  tabHtmlMode.addEventListener('click', () => {
    currentCategory = 'html';
    tabHtmlMode.className = 'btn btn-primary';
    tabUrlMode.className = 'btn btn-outline';
    updateLabels();
    process();
  });

  btnModeEncode.addEventListener('click', () => {
    currentAction = 'encode';
    btnModeEncode.className = 'btn btn-primary';
    btnModeDecode.className = 'btn btn-outline';
    updateLabels();
    process();
  });

  btnModeDecode.addEventListener('click', () => {
    currentAction = 'decode';
    btnModeDecode.className = 'btn btn-primary';
    btnModeEncode.className = 'btn btn-outline';
    updateLabels();
    process();
  });

  function updateLabels() {
    if (currentAction === 'encode') {
      inputLabel.textContent = `Plain ${currentCategory.toUpperCase()} Input:`;
      outputLabel.textContent = `Encoded ${currentCategory.toUpperCase()} Output:`;
    } else {
      inputLabel.textContent = `Encoded ${currentCategory.toUpperCase()} Input:`;
      outputLabel.textContent = `Decoded ${currentCategory.toUpperCase()} Output:`;
    }
  }

  srcInput.addEventListener('input', process);

  btnClear.addEventListener('click', () => {
    srcInput.value = '';
    process();
  });

  btnSwap.addEventListener('click', () => {
    const temp = destOutput.value;
    if (currentAction === 'encode') {
      btnModeDecode.click();
    } else {
      btnModeEncode.click();
    }
    srcInput.value = temp;
    process();
  });

  btnSample.addEventListener('click', () => {
    if (currentCategory === 'url') {
      srcInput.value = 'https://alltoolsinone.com/search?query=online tools & pdf editor=free#section';
    } else {
      srcInput.value = '<div class="banner"><h1>Hello & Welcome!</h1><p onclick="alert(\'hi\')">Click here</p></div>';
    }
    process();
  });

  btnCopy.addEventListener('click', () => {
    if (!destOutput.value || destOutput.value.startsWith('⚠️')) return;
    navigator.clipboard.writeText(destOutput.value).then(() => {
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopy.innerHTML = orig; }, 1800);
    });
  });

  // Default sample
  srcInput.value = 'https://alltoolsinone.com/search?q=developer tools & privacy=100%';
  process();

})();
