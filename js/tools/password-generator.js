/* ═══════════════════════════════════════════════════
   AllToolsInOne — Strong Password Generator Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const passwordOutput = document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copyBtn');
  const regenBtn = document.getElementById('regenBtn');
  const strengthText = document.getElementById('strengthText');
  const crackTimeText = document.getElementById('crackTimeText');
  const strengthBar = document.getElementById('strengthBar');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthVal = document.getElementById('lengthVal');
  const incUpper = document.getElementById('incUpper');
  const incLower = document.getElementById('incLower');
  const incNumbers = document.getElementById('incNumbers');
  const incSymbols = document.getElementById('incSymbols');
  const excAmbiguous = document.getElementById('excAmbiguous');
  const passwordHistoryList = document.getElementById('passwordHistoryList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const history = [];

  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const AMBIGUOUS = /[0O1lI]/g;

  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = `${lengthSlider.value} Characters`;
    generatePassword();
  });

  [incUpper, incLower, incNumbers, incSymbols, excAmbiguous].forEach(el => {
    el.addEventListener('change', generatePassword);
  });

  regenBtn.addEventListener('click', generatePassword);

  copyBtn.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    navigator.clipboard.writeText(passwordOutput.value).then(() => {
      copyBtn.textContent = '✓ Copied!';
      window.showToast('Password copied to clipboard!', 'success');
      setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
    }).catch(() => {
      passwordOutput.select();
      document.execCommand('copy');
      window.showToast('Password copied!', 'success');
    });
  });

  clearHistoryBtn.addEventListener('click', () => {
    history.length = 0;
    renderHistory();
  });

  function generatePassword() {
    let pool = '';
    if (incUpper.checked) pool += CHARS.upper;
    if (incLower.checked) pool += CHARS.lower;
    if (incNumbers.checked) pool += CHARS.numbers;
    if (incSymbols.checked) pool += CHARS.symbols;

    if (excAmbiguous.checked) {
      pool = pool.replace(AMBIGUOUS, '');
    }

    if (!pool) {
      passwordOutput.value = '';
      strengthText.textContent = 'Select at least one character type';
      strengthBar.style.width = '0%';
      return;
    }

    const length = parseInt(lengthSlider.value, 10);
    const randomVals = new Uint32Array(length);
    window.crypto.getRandomValues(randomVals);

    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += pool[randomVals[i] % pool.length];
    }

    passwordOutput.value = pwd;
    evaluateStrength(pwd, pool.length);

    // Save to history (avoid consecutive duplicates)
    if (history[0] !== pwd) {
      history.unshift(pwd);
      if (history.length > 8) history.pop();
      renderHistory();
    }
  }

  function evaluateStrength(pwd, poolSize) {
    // Entropy = length * log2(poolSize)
    const entropy = pwd.length * Math.log2(poolSize);

    let text = 'Weak';
    let color = '#ef4444';
    let width = '25%';
    let crackTime = 'a few seconds';

    if (entropy > 80) {
      text = 'Very Strong';
      color = '#10b981';
      width = '100%';
      crackTime = 'several million years';
    } else if (entropy > 60) {
      text = 'Strong';
      color = '#059669';
      width = '75%';
      crackTime = 'several centuries';
    } else if (entropy > 40) {
      text = 'Moderate';
      color = '#f59e0b';
      width = '50%';
      crackTime = 'a few months';
    }

    strengthText.textContent = `${text} Password (${Math.round(entropy)} bits entropy)`;
    strengthText.style.color = color;
    strengthBar.style.backgroundColor = color;
    strengthBar.style.width = width;
    crackTimeText.textContent = `Est. crack time: ${crackTime}`;
  }

  function renderHistory() {
    passwordHistoryList.innerHTML = '';
    history.forEach(p => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        font-family: monospace;
        font-size: var(--text-sm);
      `;
      row.innerHTML = `
        <span style="color: var(--navy); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%;">${p}</span>
        <button type="button" class="btn btn-ghost btn-sm" style="padding: 2px 8px; font-size: 11px;">Copy</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        navigator.clipboard.writeText(p);
        window.showToast('Copied from history!', 'success');
      });
      passwordHistoryList.appendChild(row);
    });
  }

  // Initial Run
  generatePassword();

})();
