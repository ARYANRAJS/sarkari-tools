/* ═══════════════════════════════════════════════════
   BIONIC READING CONVERTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const rawText = document.getElementById('rawText');
  const bionicOutput = document.getElementById('bionicOutput');
  const fixationRange = document.getElementById('fixationRange');
  const fixationVal = document.getElementById('fixationVal');
  const saccadeSelect = document.getElementById('saccadeSelect');
  const srcWordCount = document.getElementById('srcWordCount');
  const readingSpeedEst = document.getElementById('readingSpeedEst');
  const btnSampleText = document.getElementById('btnSampleText');
  const btnClear = document.getElementById('btnClear');
  const btnCopyHtml = document.getElementById('btnCopyHtml');
  const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');

  const btnThemeLight = document.getElementById('btnThemeLight');
  const btnThemeSepia = document.getElementById('btnThemeSepia');
  const btnThemeDark = document.getElementById('btnThemeDark');

  // Convert a single word to bionic format
  function bionifyWord(word, fixationRatio) {
    if (!word || word.length <= 1) return word;

    // Check for leading or trailing punctuation
    const match = word.match(/^([^a-zA-Z0-9\u0900-\u097F]*)([a-zA-Z0-9\u0900-\u097F]+)([^a-zA-Z0-9\u0900-\u097F]*)$/);
    if (!match) return `<b>${word}</b>`;

    const leading = match[1];
    const core = match[2];
    const trailing = match[3];

    // Calculate how many characters to bold based on fixationRatio
    let boldLen = Math.ceil(core.length * fixationRatio);
    if (core.length === 1) boldLen = 1;
    else if (core.length <= 3) boldLen = 1;
    else if (core.length <= 5) boldLen = Math.min(2, boldLen);

    const boldPart = core.slice(0, boldLen);
    const restPart = core.slice(boldLen);

    return `${leading}<b>${boldPart}</b>${restPart}${trailing}`;
  }

  function bionifyMarkdownWord(word, fixationRatio) {
    if (!word || word.length <= 1) return word;
    const match = word.match(/^([^a-zA-Z0-9\u0900-\u097F]*)([a-zA-Z0-9\u0900-\u097F]+)([^a-zA-Z0-9\u0900-\u097F]*)$/);
    if (!match) return `**${word}**`;

    const leading = match[1];
    const core = match[2];
    const trailing = match[3];

    let boldLen = Math.ceil(core.length * fixationRatio);
    if (core.length <= 3) boldLen = 1;
    else if (core.length <= 5) boldLen = Math.min(2, boldLen);

    const boldPart = core.slice(0, boldLen);
    const restPart = core.slice(boldLen);

    return `${leading}**${boldPart}**${restPart}${trailing}`;
  }

  function renderBionic() {
    const text = rawText.value;
    if (!text.trim()) {
      bionicOutput.innerHTML = '<span style="color: #94a3b8; font-style: italic;">Bionic reading formatted output will appear here as you type...</span>';
      srcWordCount.textContent = '0 words';
      readingSpeedEst.textContent = 'Est: 0 sec reading';
      return;
    }

    const words = text.trim().split(/\s+/);
    srcWordCount.textContent = `${words.length} words`;

    // Average reading speed: 250 wpm for bionic reading
    const minutes = Math.ceil(words.length / 260);
    readingSpeedEst.textContent = `Est: ~${minutes} min read (${Math.round((words.length / 260) * 60)}s)`;

    const fixationRatio = parseInt(fixationRange.value, 10) / 100;
    const saccade = parseInt(saccadeSelect.value, 10);

    const paragraphs = text.split('\n');
    const resultHtml = [];

    let wordCounter = 0;
    paragraphs.forEach((para) => {
      if (!para.trim()) {
        resultHtml.push('<br>');
        return;
      }
      const pWords = para.split(' ');
      const bWords = pWords.map((w) => {
        if (!w) return '';
        wordCounter++;
        if (wordCounter % saccade === 0) {
          return bionifyWord(w, fixationRatio);
        }
        return w;
      });
      resultHtml.push(`<p style="margin-bottom: 14px;">${bWords.join(' ')}</p>`);
    });

    bionicOutput.innerHTML = resultHtml.join('');
  }

  // Listeners
  rawText.addEventListener('input', renderBionic);
  fixationRange.addEventListener('input', (e) => {
    fixationVal.textContent = `${e.target.value}%`;
    renderBionic();
  });
  saccadeSelect.addEventListener('change', renderBionic);

  // Themes
  btnThemeLight.addEventListener('click', () => {
    bionicOutput.className = 'bionic-preview-box';
    btnThemeLight.className = 'btn btn-primary';
    btnThemeSepia.className = 'btn btn-outline';
    btnThemeDark.className = 'btn btn-outline';
  });

  btnThemeSepia.addEventListener('click', () => {
    bionicOutput.className = 'bionic-preview-box theme-sepia';
    btnThemeSepia.className = 'btn btn-primary';
    btnThemeLight.className = 'btn btn-outline';
    btnThemeDark.className = 'btn btn-outline';
  });

  btnThemeDark.addEventListener('click', () => {
    bionicOutput.className = 'bionic-preview-box theme-dark';
    btnThemeDark.className = 'btn btn-primary';
    btnThemeLight.className = 'btn btn-outline';
    btnThemeSepia.className = 'btn btn-outline';
  });

  btnSampleText.addEventListener('click', () => {
    rawText.value = `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. It powers everything from autonomous vehicles and medical diagnostics to voice assistants and fraud detection algorithms.\n\nIn developing economies like India, AI holds immense potential to bridge traditional infrastructure gaps. From predicting monsoon agricultural yields to delivering personalized education in regional languages, automated systems are reshaping public services. However, ethical considerations regarding algorithmic bias and privacy remain critical topics for policymakers and engineers alike.`;
    renderBionic();
  });

  btnClear.addEventListener('click', () => {
    rawText.value = '';
    renderBionic();
  });

  btnCopyHtml.addEventListener('click', () => {
    if (!bionicOutput.innerHTML) return;
    const blob = new Blob([bionicOutput.innerHTML], { type: 'text/html' });
    const textBlob = new Blob([bionicOutput.innerText], { type: 'text/plain' });
    const item = new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob });

    navigator.clipboard.write([item]).then(() => {
      const orig = btnCopyHtml.innerHTML;
      btnCopyHtml.innerHTML = '✅ Rich Text Copied!';
      setTimeout(() => { btnCopyHtml.innerHTML = orig; }, 2000);
    });
  });

  btnCopyMarkdown.addEventListener('click', () => {
    const text = rawText.value;
    if (!text.trim()) return;

    const fixationRatio = parseInt(fixationRange.value, 10) / 100;
    const saccade = parseInt(saccadeSelect.value, 10);
    const paragraphs = text.split('\n');
    let wordCounter = 0;

    const mdLines = paragraphs.map((para) => {
      if (!para.trim()) return '';
      const words = para.split(' ');
      const bWords = words.map((w) => {
        if (!w) return '';
        wordCounter++;
        if (wordCounter % saccade === 0) {
          return bionifyMarkdownWord(w, fixationRatio);
        }
        return w;
      });
      return bWords.join(' ');
    });

    navigator.clipboard.writeText(mdLines.join('\n\n')).then(() => {
      const orig = btnCopyMarkdown.innerHTML;
      btnCopyMarkdown.innerHTML = '✅ Markdown Copied!';
      setTimeout(() => { btnCopyMarkdown.innerHTML = orig; }, 2000);
    });
  });

})();
