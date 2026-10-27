/* ═══════════════════════════════════════════════════
   NUMBERS TO WORDS CONVERTER (Indian & International)
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const numInput = document.getElementById('numInput');
  const sysSelect = document.getElementById('sysSelect');
  const currencySelect = document.getElementById('currencySelect');
  const caseSelect = document.getElementById('caseSelect');
  const suffixSelect = document.getElementById('suffixSelect');
  const wordsResult = document.getElementById('wordsResult');
  const formattedNumber = document.getElementById('formattedNumber');
  const btnCopyWords = document.getElementById('btnCopyWords');
  const btnClear = document.getElementById('btnClear');
  const sampleButtons = document.querySelectorAll('.btn-sample');

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convertTwoDigits(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit > 0 ? '-' + ones[unit] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred > 0) {
      str += ones[hundred] + ' hundred';
      if (rest > 0) str += ' and ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str;
  }

  // Indian Numbering System: Thousands, Lakhs, Crores, Arabs, Kharabs
  function indianSystemToWords(num) {
    if (num === 0) return 'zero';

    let n = Math.floor(num);
    const parts = [];

    const units = [
      { name: 'kharab', val: 100000000000 },
      { name: 'arab', val: 1000000000 },
      { name: 'crore', val: 10000000 },
      { name: 'lakh', val: 100000 },
      { name: 'thousand', val: 1000 }
    ];

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (n >= u.val) {
        const count = Math.floor(n / u.val);
        parts.push(convertThreeDigits(count) + ' ' + u.name);
        n %= u.val;
      }
    }

    if (n > 0) {
      parts.push(convertThreeDigits(n));
    }

    return parts.join(' ');
  }

  // International System: Thousands, Millions, Billions, Trillions
  function internationalSystemToWords(num) {
    if (num === 0) return 'zero';

    let n = Math.floor(num);
    const parts = [];

    const units = [
      { name: 'trillion', val: 1000000000000 },
      { name: 'billion', val: 1000000000 },
      { name: 'million', val: 1000000 },
      { name: 'thousand', val: 1000 }
    ];

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (n >= u.val) {
        const count = Math.floor(n / u.val);
        parts.push(convertThreeDigits(count) + ' ' + u.name);
        n %= u.val;
      }
    }

    if (n > 0) {
      parts.push(convertThreeDigits(n));
    }

    return parts.join(' ');
  }

  function applyCasing(str, casing) {
    if (!str) return '';
    if (casing === 'upper') return str.toUpperCase();
    if (casing === 'lower') return str.toLowerCase();
    if (casing === 'sentence') return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    // Title case
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function update() {
    let raw = numInput.value.replace(/,/g, '').trim();
    if (!raw || isNaN(raw) || Number(raw) < 0) {
      wordsResult.textContent = 'Enter a valid positive number or amount...';
      wordsResult.style.color = 'var(--gray-600)';
      formattedNumber.textContent = '0';
      return;
    }

    const num = parseFloat(raw);
    const intPart = Math.floor(num);
    const decMatch = raw.split('.');
    let decPart = 0;
    if (decMatch.length > 1) {
      decPart = parseInt(decMatch[1].slice(0, 2).padEnd(2, '0'), 10);
    }

    const system = sysSelect.value;
    const currency = currencySelect.value;
    const casing = caseSelect.value;
    const suffix = suffixSelect.value;

    let mainWords = system === 'indian' ? indianSystemToWords(intPart) : internationalSystemToWords(intPart);
    let decimalWords = decPart > 0 ? (system === 'indian' ? indianSystemToWords(decPart) : internationalSystemToWords(decPart)) : '';

    let finalWords = '';

    if (currency === 'inr') {
      finalWords = mainWords + ' ' + (intPart === 1 ? 'rupee' : 'rupees');
      if (decPart > 0) {
        finalWords += ' and ' + decimalWords + ' ' + (decPart === 1 ? 'paise' : 'paise');
      }
      formattedNumber.textContent = '₹ ' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    } else if (currency === 'usd') {
      finalWords = mainWords + ' ' + (intPart === 1 ? 'dollar' : 'dollars');
      if (decPart > 0) {
        finalWords += ' and ' + decimalWords + ' ' + (decPart === 1 ? 'cent' : 'cents');
      }
      formattedNumber.textContent = '$ ' + num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else {
      finalWords = mainWords;
      if (decPart > 0) {
        finalWords += ' point ' + decimalWords;
      }
      formattedNumber.textContent = system === 'indian'
        ? num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        : num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    if (suffix === 'only') {
      finalWords += ' only';
    }

    finalWords = applyCasing(finalWords.trim(), casing);

    wordsResult.textContent = finalWords;
    wordsResult.style.color = 'var(--navy)';
  }

  // Listeners
  numInput.addEventListener('input', update);
  sysSelect.addEventListener('change', update);
  currencySelect.addEventListener('change', update);
  caseSelect.addEventListener('change', update);
  suffixSelect.addEventListener('change', update);

  sampleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      numInput.value = btn.getAttribute('data-val');
      update();
    });
  });

  btnClear.addEventListener('click', () => {
    numInput.value = '';
    update();
  });

  btnCopyWords.addEventListener('click', () => {
    const text = wordsResult.textContent;
    if (!text || text.includes('Enter a valid')) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopyWords.innerHTML;
      btnCopyWords.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyWords.innerHTML = orig; }, 2000);
    });
  });

  // Default initial value
  numInput.value = '1250500';
  update();

})();
