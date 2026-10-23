/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — All-in-One Exam Studio Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Elements
  const examPresetBtns = document.querySelectorAll('#examPresetsGrid .preset-btn');
  const criteriaNotification = document.getElementById('criteriaNotification');

  // Photo Elements
  const photoDropZone = document.getElementById('photoDropZone');
  const photoInput = document.getElementById('photoInput');
  const photoSettingsArea = document.getElementById('photoSettingsArea');
  const photoStatusBadge = document.getElementById('photoStatusBadge');
  const addDateCheckbox = document.getElementById('addDateCheckbox');
  const dateFieldsRow = document.getElementById('dateFieldsRow');
  const candidateName = document.getElementById('candidateName');
  const dopText = document.getElementById('dopText');
  const photoBgSelect = document.getElementById('photoBgSelect');
  const photoTargetKb = document.getElementById('photoTargetKb');
  const photoCanvas = document.getElementById('photoCanvas');
  const photoSizeOutput = document.getElementById('photoSizeOutput');
  const downloadPhotoBtn = document.getElementById('downloadPhotoBtn');

  // Signature Elements
  const signDropZone = document.getElementById('signDropZone');
  const signInput = document.getElementById('signInput');
  const signSettingsArea = document.getElementById('signSettingsArea');
  const signStatusBadge = document.getElementById('signStatusBadge');
  const signContrastSelect = document.getElementById('signContrastSelect');
  const signTargetKb = document.getElementById('signTargetKb');
  const signCanvas = document.getElementById('signCanvas');
  const signSizeOutput = document.getElementById('signSizeOutput');
  const downloadSignBtn = document.getElementById('downloadSignBtn');

  const downloadBothBtn = document.getElementById('downloadBothBtn');

  // State
  let currentExam = 'ssc';
  let photoImg = null;
  let signImg = null;
  let photoBlob = null;
  let signBlob = null;

  const EXAM_PRESETS = {
    ssc: {
      name: 'SSC (CGL, CHSL, MTS, GD)',
      photoW: 413, photoH: 531, photoMaxKb: 50,
      signW: 280, signH: 120, signMaxKb: 20,
      desc: 'SSC Portal: Photo 3.5×4.5 cm (20-50 KB, JPG). Signature 4.0×2.0 cm (10-20 KB, JPG).'
    },
    upsc: {
      name: 'UPSC Civil Services / NDA',
      photoW: 350, photoH: 350, photoMaxKb: 200,
      signW: 350, signH: 350, signMaxKb: 200,
      desc: 'UPSC Portal: Photo 350×350 px (20-300 KB, JPG). Signature 350×350 px (20-300 KB, JPG).'
    },
    ibps: {
      name: 'IBPS / SBI Banking',
      photoW: 200, photoH: 230, photoMaxKb: 50,
      signW: 140, signH: 60, signMaxKb: 20,
      desc: 'IBPS Banking: Photo 200×230 px (20-50 KB, JPG). Signature 140×60 px (10-20 KB, JPG).'
    },
    rrb: {
      name: 'Railway RRB (NTPC, Group D)',
      photoW: 413, photoH: 531, photoMaxKb: 70,
      signW: 280, signH: 120, signMaxKb: 70,
      desc: 'Railway RRB: Photo 3.5×4.5 cm (30-70 KB, JPG). Signature 140×60 mm (30-70 KB, JPG).'
    },
    police: {
      name: 'State Police (UP, Bihar, MP)',
      photoW: 350, photoH: 450, photoMaxKb: 50,
      signW: 200, signH: 100, signMaxKb: 20,
      desc: 'State Police: Photo 350×450 px (20-50 KB). Signature 200×100 px (5-20 KB).'
    },
    custom: {
      name: 'Custom Parameters',
      photoW: 413, photoH: 531, photoMaxKb: 50,
      signW: 280, signH: 120, signMaxKb: 20,
      desc: 'Custom Mode: Adjust dimensions and file limits as per notification.'
    }
  };

  // Switch Exam Presets
  examPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      examPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentExam = btn.dataset.exam;
      const p = EXAM_PRESETS[currentExam];
      criteriaNotification.innerHTML = `<strong>${p.name} Criteria Loaded:</strong> ${p.desc}`;

      photoTargetKb.value = p.photoMaxKb > 100 ? '200' : `${p.photoMaxKb}`;
      signTargetKb.value = p.signMaxKb > 20 ? '50' : `${p.signMaxKb}`;

      renderPhoto();
      renderSign();
    });
  });

  // Photo Upload
  photoDropZone.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) loadPhotoFile(e.target.files[0]);
  });

  function loadPhotoFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        photoImg = img;
        photoDropZone.style.display = 'none';
        photoSettingsArea.style.display = 'block';
        photoStatusBadge.textContent = '✓ Ready';
        photoStatusBadge.style.cssText = 'font-size: 11px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 999px;';
        renderPhoto();
        window.showToast('Photograph loaded in Studio!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Signature Upload
  signDropZone.addEventListener('click', () => signInput.click());
  signInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) loadSignFile(e.target.files[0]);
  });

  function loadSignFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        signImg = img;
        signDropZone.style.display = 'none';
        signSettingsArea.style.display = 'block';
        signStatusBadge.textContent = '✓ Ready';
        signStatusBadge.style.cssText = 'font-size: 11px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 999px;';
        renderSign();
        window.showToast('Signature loaded in Studio!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Date Checkbox toggle
  addDateCheckbox.addEventListener('change', () => {
    dateFieldsRow.style.display = addDateCheckbox.checked ? 'flex' : 'none';
    renderPhoto();
  });

  [candidateName, dopText].forEach(inp => inp.addEventListener('input', renderPhoto));
  [photoBgSelect, photoTargetKb].forEach(inp => inp.addEventListener('change', renderPhoto));
  [signContrastSelect, signTargetKb].forEach(inp => inp.addEventListener('change', renderSign));

  // Photo Processor
  async function renderPhoto() {
    if (!photoImg) return;
    const preset = EXAM_PRESETS[currentExam];
    const targetW = preset.photoW;
    const targetH = preset.photoH;

    const hasDate = addDateCheckbox.checked;
    const bannerH = hasDate ? Math.round(targetH * 0.18) : 0;
    const imgAreaH = targetH - bannerH;

    photoCanvas.width = targetW;
    photoCanvas.height = targetH;
    const ctx = photoCanvas.getContext('2d');

    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);

    // Draw Photo
    ctx.drawImage(photoImg, 0, 0, targetW, imgAreaH);

    // Background Tint replacement if selected
    const bgMode = photoBgSelect.value;
    if (bgMode === 'white' || bgMode === 'blue') {
      const imgData = ctx.getImageData(0, 0, targetW, imgAreaH);
      const d = imgData.data;
      const cornerR = d[0], cornerG = d[1], cornerB = d[2];
      const targetR = bgMode === 'white' ? 255 : 56;
      const targetG = bgMode === 'white' ? 255 : 189;
      const targetB = bgMode === 'white' ? 255 : 248;

      for (let i = 0; i < d.length; i += 4) {
        const dist = Math.sqrt((d[i] - cornerR) ** 2 + (d[i+1] - cornerG) ** 2 + (d[i+2] - cornerB) ** 2);
        if (dist < 80) {
          d[i] = targetR; d[i+1] = targetG; d[i+2] = targetB;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Name & DOP Banner
    if (hasDate) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, imgAreaH, targetW, bannerH);
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, imgAreaH, targetW, bannerH);

      ctx.fillStyle = '#000000';
      ctx.font = `700 ${Math.round(bannerH * 0.38)}px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(candidateName.value.toUpperCase(), targetW / 2, imgAreaH + bannerH * 0.35);

      ctx.font = `600 ${Math.round(bannerH * 0.32)}px Poppins, sans-serif`;
      ctx.fillText(dopText.value, targetW / 2, imgAreaH + bannerH * 0.75);
    }

    // Compress to target KB
    const maxKb = parseInt(photoTargetKb.value, 10);
    let quality = 0.94;
    let blob = await new Promise(r => photoCanvas.toBlob(r, 'image/jpeg', quality));
    if (maxKb > 0) {
      let attempts = 0;
      const targetBytes = maxKb * 1024;
      while (blob.size > targetBytes && quality > 0.1 && attempts < 10) {
        quality = Math.max(0.1, quality * (targetBytes / blob.size) * 0.96);
        blob = await new Promise(r => photoCanvas.toBlob(r, 'image/jpeg', quality));
        attempts++;
      }
    }

    photoBlob = blob;
    photoSizeOutput.textContent = `Dimensions: ${targetW}×${targetH} px | Size: ${window.formatFileSize(blob.size)}`;
  }

  // Signature Processor
  async function renderSign() {
    if (!signImg) return;
    const preset = EXAM_PRESETS[currentExam];
    const targetW = preset.signW;
    const targetH = preset.signH;

    signCanvas.width = targetW;
    signCanvas.height = targetH;
    const ctx = signCanvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);

    // Draw signature centered with margin
    const pad = 6;
    ctx.drawImage(signImg, pad, pad, targetW - pad * 2, targetH - pad * 2);

    // Contrast & Paper Whiten Enhancement
    const contrastMode = signContrastSelect.value;
    if (contrastMode === 'boost' || contrastMode === 'pure_bw') {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        const brightness = (d[i] + d[i+1] + d[i+2]) / 3;
        if (contrastMode === 'pure_bw') {
          const val = brightness > 150 ? 255 : 0;
          d[i] = val; d[i+1] = val; d[i+2] = val;
        } else {
          // Whiten yellowish/greyish paper background while darkening ink
          if (brightness > 160) {
            d[i] = 255; d[i+1] = 255; d[i+2] = 255;
          } else {
            d[i] = Math.max(0, d[i] * 0.7);
            d[i+1] = Math.max(0, d[i+1] * 0.7);
            d[i+2] = Math.max(0, d[i+2] * 0.7);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Outer subtle border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, targetW, targetH);

    // Compress
    const maxKb = parseInt(signTargetKb.value, 10);
    let quality = 0.92;
    let blob = await new Promise(r => signCanvas.toBlob(r, 'image/jpeg', quality));
    if (maxKb > 0) {
      let attempts = 0;
      const targetBytes = maxKb * 1024;
      while (blob.size > targetBytes && quality > 0.1 && attempts < 10) {
        quality = Math.max(0.1, quality * (targetBytes / blob.size) * 0.96);
        blob = await new Promise(r => signCanvas.toBlob(r, 'image/jpeg', quality));
        attempts++;
      }
    }

    signBlob = blob;
    signSizeOutput.textContent = `Dimensions: ${targetW}×${targetH} px | Size: ${window.formatFileSize(blob.size)}`;
  }

  // Individual Downloads
  downloadPhotoBtn.addEventListener('click', () => {
    if (!photoBlob) return;
    window.downloadFile(photoBlob, `${currentExam}_photo_approved.jpg`);
    window.showToast('Photograph downloaded for exam portal!', 'success');
  });

  downloadSignBtn.addEventListener('click', () => {
    if (!signBlob) return;
    window.downloadFile(signBlob, `${currentExam}_signature_approved.jpg`);
    window.showToast('Signature downloaded for exam portal!', 'success');
  });

  // Download Both
  downloadBothBtn.addEventListener('click', () => {
    if (!photoBlob && !signBlob) {
      window.showToast('Please upload photo and signature first', 'warning');
      return;
    }
    if (photoBlob) {
      window.downloadFile(photoBlob, `${currentExam}_photo_approved.jpg`);
    }
    if (signBlob) {
      setTimeout(() => {
        window.downloadFile(signBlob, `${currentExam}_signature_approved.jpg`);
      }, 300);
    }
    window.showToast('Downloaded both Photo and Signature files! 🚀', 'success');
  });

})();
