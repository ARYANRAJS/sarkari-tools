/* ═══════════════════════════════════════════════════
   HASH GENERATOR & CHECKSUM VERIFIER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const hashTextInput = document.getElementById('hashTextInput');
  const hashFileInput = document.getElementById('hashFileInput');
  const fileInfoNotice = document.getElementById('fileInfoNotice');
  const hashedFileName = document.getElementById('hashedFileName');
  const hashedFileSize = document.getElementById('hashedFileSize');
  const expectedHashInput = document.getElementById('expectedHashInput');
  const matchStatusBadge = document.getElementById('matchStatusBadge');

  const outSha256 = document.getElementById('out-sha256');
  const outMd5 = document.getElementById('out-md5');
  const outSha1 = document.getElementById('out-sha1');
  const outSha512 = document.getElementById('out-sha512');
  const outSha384 = document.getElementById('out-sha384');
  const copyButtons = document.querySelectorAll('.btn-copy-hash');

  // Convert buffer to hex string
  function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  // Calculate Web Crypto hashes (SHA-1, SHA-256, SHA-384, SHA-512)
  async function computeWebCryptoHash(algorithm, dataBuffer) {
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    return bufferToHex(hashBuffer);
  }

  // MD5 via CryptoJS
  function computeMd5(data) {
    if (typeof data === 'string') {
      return CryptoJS.MD5(data).toString();
    } else {
      // WordArray from ArrayBuffer
      const wordArray = CryptoJS.lib.WordArray.create(data);
      return CryptoJS.MD5(wordArray).toString();
    }
  }

  function checkMatch() {
    const expected = expectedHashInput.value.trim().toLowerCase();
    if (!expected) {
      matchStatusBadge.style.display = 'none';
      return;
    }

    const calculated = [
      outSha256.value.toLowerCase(),
      outMd5.value.toLowerCase(),
      outSha1.value.toLowerCase(),
      outSha512.value.toLowerCase(),
      outSha384.value.toLowerCase()
    ];

    const matchIdx = calculated.indexOf(expected);
    if (matchIdx !== -1) {
      matchStatusBadge.style.display = 'inline-block';
      matchStatusBadge.style.background = '#dcfce7';
      matchStatusBadge.style.color = '#15803d';
      matchStatusBadge.textContent = '✅ Verified Match!';
    } else {
      matchStatusBadge.style.display = 'inline-block';
      matchStatusBadge.style.background = '#fee2e2';
      matchStatusBadge.style.color = '#b91c1c';
      matchStatusBadge.textContent = '❌ No Match';
    }
  }

  async function hashText(str) {
    if (!str) {
      outSha256.value = '';
      outMd5.value = '';
      outSha1.value = '';
      outSha512.value = '';
      outSha384.value = '';
      checkMatch();
      return;
    }

    const enc = new TextEncoder();
    const dataBuffer = enc.encode(str);

    outMd5.value = computeMd5(str);
    outSha1.value = await computeWebCryptoHash('SHA-1', dataBuffer);
    outSha256.value = await computeWebCryptoHash('SHA-256', dataBuffer);
    outSha384.value = await computeWebCryptoHash('SHA-384', dataBuffer);
    outSha512.value = await computeWebCryptoHash('SHA-512', dataBuffer);

    checkMatch();
  }

  async function hashArrayBuffer(buffer) {
    outMd5.value = computeMd5(buffer);
    outSha1.value = await computeWebCryptoHash('SHA-1', buffer);
    outSha256.value = await computeWebCryptoHash('SHA-256', buffer);
    outSha384.value = await computeWebCryptoHash('SHA-384', buffer);
    outSha512.value = await computeWebCryptoHash('SHA-512', buffer);

    checkMatch();
  }

  hashTextInput.addEventListener('input', () => {
    fileInfoNotice.style.display = 'none';
    hashText(hashTextInput.value);
  });

  hashFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    hashedFileName.textContent = file.name;
    hashedFileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    fileInfoNotice.style.display = 'block';
    hashTextInput.value = `[File: ${file.name}]`;

    const reader = new FileReader();
    reader.onload = (evt) => {
      hashArrayBuffer(evt.target.result);
    };
    reader.readAsArrayBuffer(file);
  });

  expectedHashInput.addEventListener('input', checkMatch);

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input && input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        });
      }
    });
  });

  // Default initial sample
  hashTextInput.value = 'Hello World';
  hashText('Hello World');

})();
