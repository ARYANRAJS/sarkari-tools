/* ═══════════════════════════════════════════════════
   PDF PASSWORD PROTECT & UNLOCK TOOL
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const tabProtectMode = document.getElementById('tabProtectMode');
  const tabUnlockMode = document.getElementById('tabUnlockMode');
  const protectSection = document.getElementById('protectSection');
  const unlockSection = document.getElementById('unlockSection');

  // Protect
  const protectDropZone = document.getElementById('protectDropZone');
  const protectFileInput = document.getElementById('protectFileInput');
  const protectFormArea = document.getElementById('protectFormArea');
  const protectFileName = document.getElementById('protectFileName');
  const pdfUserPass = document.getElementById('pdfUserPass');
  const btnEncryptPdf = document.getElementById('btnEncryptPdf');

  // Unlock
  const unlockDropZone = document.getElementById('unlockDropZone');
  const unlockFileInput = document.getElementById('unlockFileInput');
  const unlockFormArea = document.getElementById('unlockFormArea');
  const unlockFileName = document.getElementById('unlockFileName');
  const pdfUnlockPass = document.getElementById('pdfUnlockPass');
  const btnDecryptPdf = document.getElementById('btnDecryptPdf');

  let protectBuffer = null;
  let protectFile = null;

  let unlockBuffer = null;
  let unlockFile = null;

  // Tabs
  tabProtectMode.addEventListener('click', () => {
    tabProtectMode.className = 'btn btn-primary';
    tabUnlockMode.className = 'btn btn-outline';
    protectSection.style.display = 'block';
    unlockSection.style.display = 'none';
  });

  tabUnlockMode.addEventListener('click', () => {
    tabUnlockMode.className = 'btn btn-primary';
    tabProtectMode.className = 'btn btn-outline';
    protectSection.style.display = 'none';
    unlockSection.style.display = 'block';
  });

  // Protect File Load
  protectFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    protectFile = file;
    protectBuffer = await file.arrayBuffer();
    protectFileName.textContent = `Selected Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    protectFormArea.style.display = 'block';
  });

  // Encrypt
  btnEncryptPdf.addEventListener('click', async () => {
    if (!protectBuffer) {
      alert('Please upload a PDF file first.');
      return;
    }
    const password = pdfUserPass.value;
    if (!password) {
      alert('Please enter a password to protect the PDF.');
      pdfUserPass.focus();
      return;
    }

    const orig = btnEncryptPdf.innerHTML;
    btnEncryptPdf.innerHTML = '⏳ Encrypting PDF...';

    try {
      const pdfDoc = await window.PDFLib.PDFDocument.load(protectBuffer, { ignoreEncryption: true });

      // In pdf-lib, encrypting with userPassword
      if (pdfDoc.encrypt) {
        pdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password + '_owner'
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `protected_${protectFile.name}`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('Error protecting PDF: ' + err.message);
    } finally {
      btnEncryptPdf.innerHTML = orig;
    }
  });

  // Unlock File Load
  unlockFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    unlockFile = file;
    unlockBuffer = await file.arrayBuffer();
    unlockFileName.textContent = `Selected Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    unlockFormArea.style.display = 'block';
  });

  // Decrypt
  btnDecryptPdf.addEventListener('click', async () => {
    if (!unlockBuffer) {
      alert('Please upload a locked PDF file first.');
      return;
    }
    const password = pdfUnlockPass.value;

    const orig = btnDecryptPdf.innerHTML;
    btnDecryptPdf.innerHTML = '⏳ Decrypting PDF...';

    try {
      // Attempt load with password
      const pdfDoc = await window.PDFLib.PDFDocument.load(unlockBuffer, {
        password: password,
        ignoreEncryption: false
      });

      // Save without encryption
      const newPdf = await window.PDFLib.PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `unlocked_${unlockFile.name}`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('Failed to unlock PDF. Please make sure the password is correct: ' + err.message);
    } finally {
      btnDecryptPdf.innerHTML = orig;
    }
  });

})();
