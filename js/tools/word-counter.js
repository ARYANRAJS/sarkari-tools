/**
 * Sarkari Tools - Word Counter & Text Formatter
 * Real-time word, character, sentence counter and text transform utility
 */

document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const statWords = document.getElementById('statWords');
  const statChars = document.getElementById('statChars');
  const statCharsNoSpace = document.getElementById('statCharsNoSpace');
  const statSentences = document.getElementById('statSentences');
  const statParagraphs = document.getElementById('statParagraphs');
  const statReadingTime = document.getElementById('statReadingTime');

  const targetLimitSelect = document.getElementById('targetLimitSelect');
  const targetStatusText = document.getElementById('targetStatusText');
  const targetProgressBar = document.getElementById('targetProgressBar');

  const btnUpper = document.getElementById('btnUpper');
  const btnLower = document.getElementById('btnLower');
  const btnTitle = document.getElementById('btnTitle');
  const btnSentence = document.getElementById('btnSentence');
  const btnCleanSpaces = document.getElementById('btnCleanSpaces');
  const btnRemoveBlankLines = document.getElementById('btnRemoveBlankLines');

  const btnCopyText = document.getElementById('btnCopyText');
  const btnClearText = document.getElementById('btnClearText');

  function analyzeText() {
    if (!textInput) return;
    const text = textInput.value;

    // Characters
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;

    // Words
    const trimmed = text.trim();
    const wordsArray = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
    const words = wordsArray.length;

    // Sentences
    const sentences = trimmed.length > 0 ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;

    // Paragraphs
    const paragraphs = trimmed.length > 0 ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;

    // Reading time (approx 200 wpm)
    let readingTime = '< 1 min';
    if (words >= 200) {
      readingTime = `${Math.ceil(words / 200)} min`;
    }

    statWords.textContent = words.toLocaleString('en-IN');
    statChars.textContent = chars.toLocaleString('en-IN');
    statCharsNoSpace.textContent = charsNoSpace.toLocaleString('en-IN');
    statSentences.textContent = sentences.toLocaleString('en-IN');
    statParagraphs.textContent = paragraphs.toLocaleString('en-IN');
    statReadingTime.textContent = readingTime;

    updateTargetLimit(words, chars);
  }

  function updateTargetLimit(words, chars) {
    if (!targetLimitSelect || !targetStatusText || !targetProgressBar) return;
    const target = targetLimitSelect.value;

    if (target === 'none') {
      targetStatusText.textContent = `${words} words, ${chars} chars`;
      targetProgressBar.style.width = '0%';
      targetProgressBar.style.backgroundColor = 'var(--navy)';
      return;
    }

    let current = 0;
    let max = 0;
    let unit = '';

    if (target === 'char-100') {
      current = chars; max = 100; unit = 'chars';
    } else if (target === 'char-200') {
      current = chars; max = 200; unit = 'chars';
    } else if (target === 'word-250') {
      current = words; max = 250; unit = 'words';
    } else if (target === 'word-500') {
      current = words; max = 500; unit = 'words';
    } else if (target === 'word-1000') {
      current = words; max = 1000; unit = 'words';
    }

    const pct = Math.min(100, (current / max) * 100);
    targetProgressBar.style.width = `${pct}%`;

    if (current > max) {
      targetStatusText.innerHTML = `<span style="color: #b91c1c;">⚠️ ${current} / ${max} ${unit} (Exceeded by ${current - max})</span>`;
      targetProgressBar.style.backgroundColor = '#b91c1c';
    } else if (current >= max * 0.85) {
      targetStatusText.innerHTML = `<span style="color: #d97706;">⚡ ${current} / ${max} ${unit} (Nearing limit)</span>`;
      targetProgressBar.style.backgroundColor = '#d97706';
    } else {
      targetStatusText.textContent = `${current} / ${max} ${unit} (${(max - current)} left)`;
      targetProgressBar.style.backgroundColor = 'var(--navy)';
    }
  }

  if (textInput) {
    textInput.addEventListener('input', analyzeText);
  }
  if (targetLimitSelect) {
    targetLimitSelect.addEventListener('change', analyzeText);
  }

  // Case transforms
  if (btnUpper) {
    btnUpper.addEventListener('click', () => {
      textInput.value = textInput.value.toUpperCase();
      analyzeText();
    });
  }

  if (btnLower) {
    btnLower.addEventListener('click', () => {
      textInput.value = textInput.value.toLowerCase();
      analyzeText();
    });
  }

  if (btnTitle) {
    btnTitle.addEventListener('click', () => {
      textInput.value = textInput.value.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
      analyzeText();
    });
  }

  if (btnSentence) {
    btnSentence.addEventListener('click', () => {
      textInput.value = textInput.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      analyzeText();
    });
  }

  if (btnCleanSpaces) {
    btnCleanSpaces.addEventListener('click', () => {
      textInput.value = textInput.value.replace(/[ \t]+/g, ' ').replace(/ \n/g, '\n').trim();
      analyzeText();
      if (window.showToast) window.showToast('Extra spaces cleaned!');
    });
  }

  if (btnRemoveBlankLines) {
    btnRemoveBlankLines.addEventListener('click', () => {
      textInput.value = textInput.value.split('\n').filter(line => line.trim().length > 0).join('\n');
      analyzeText();
      if (window.showToast) window.showToast('Blank lines removed!');
    });
  }

  // Copy
  if (btnCopyText) {
    btnCopyText.addEventListener('click', () => {
      if (!textInput.value.trim()) {
        if (window.showToast) window.showToast('Nothing to copy!', 'error');
        return;
      }
      navigator.clipboard.writeText(textInput.value).then(() => {
        if (window.showToast) window.showToast('Text copied to clipboard!');
      });
    });
  }

  // Clear
  if (btnClearText) {
    btnClearText.addEventListener('click', () => {
      if (textInput.value.trim() && confirm('Clear all text?')) {
        textInput.value = '';
        analyzeText();
      }
    });
  }

  // Run initial analysis
  analyzeText();
});
