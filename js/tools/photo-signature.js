/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Photo & Signature Joiner Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const photoDropZone = document.getElementById('photoDropZone');
  const signDropZone = document.getElementById('signDropZone');
  const photoInput = document.getElementById('photoInput');
  const signInput = document.getElementById('signInput');
  const photoLabel = document.getElementById('photoLabel');
  const signLabel = document.getElementById('signLabel');
  const photoThumb = document.getElementById('photoThumb');
  const signThumb = document.getElementById('signThumb');
  const layoutMode = document.getElementById('layoutMode');
  const canvasPreset = document.getElementById('canvasPreset');
  const customDimRow = document.getElementById('customDimRow');
  const customW = document.getElementById('customW');
  const customH = document.getElementById('customH');
  const photoRatio = document.getElementById('photoRatio');
  const ratioVal = document.getElementById('ratioVal');
  const targetKb = document.getElementById('targetKb');
  const addDividerLine = document.getElementById('addDividerLine');
  const addOuterBorder = document.getElementById('addOuterBorder');
  const joinCanvas = document.getElementById('joinCanvas');
  const outputSizeText = document.getElementById('outputSizeText');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let photoImg = null;
  let signImg = null;
  let finalBlob = null;

  // Upload Handlers
  photoDropZone.addEventListener('click', () => photoInput.click());
  signDropZone.addEventListener('click', () => signInput.click());

  photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) loadPhoto(e.target.files[0]);
  });
  signInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) loadSign(e.target.files[0]);
  });

  function loadPhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        photoImg = img;
        photoThumb.src = e.target.result;
        photoThumb.style.display = 'block';
        photoLabel.textContent = '✓ Photograph Loaded';
        photoDropZone.style.borderColor = 'var(--success)';
        renderCombined();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function loadSign(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        signImg = img;
        signThumb.src = e.target.result;
        signThumb.style.display = 'block';
        signLabel.textContent = '✓ Signature Loaded';
        signDropZone.style.borderColor = 'var(--success)';
        renderCombined();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Dimension Change
  canvasPreset.addEventListener('change', () => {
    customDimRow.style.display = canvasPreset.value === 'custom' ? 'grid' : 'none';
    renderCombined();
  });
  customW.addEventListener('input', renderCombined);
  customH.addEventListener('input', renderCombined);
  layoutMode.addEventListener('change', renderCombined);
  addDividerLine.addEventListener('change', renderCombined);
  addOuterBorder.addEventListener('change', renderCombined);
  targetKb.addEventListener('change', renderCombined);

  photoRatio.addEventListener('input', () => {
    ratioVal.textContent = `${photoRatio.value}% Photo`;
    renderCombined();
  });

  // Render Combined Canvas
  async function renderCombined() {
    let w = 350;
    let h = 450;

    const presetVal = canvasPreset.value;
    if (presetVal === 'custom') {
      w = parseInt(customW.value, 10) || 350;
      h = parseInt(customH.value, 10) || 450;
    } else {
      const parts = presetVal.split('x');
      w = parseInt(parts[0], 10);
      h = parseInt(parts[1], 10);
    }

    joinCanvas.width = w;
    joinCanvas.height = h;
    const ctx = joinCanvas.getContext('2d');

    // Fill White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const isVertical = layoutMode.value === 'vertical';
    const ratio = parseInt(photoRatio.value, 10) / 100;

    if (isVertical) {
      const photoH = Math.round(h * ratio);
      const signH = h - photoH;

      // Draw Photo
      if (photoImg) {
        drawImageFit(ctx, photoImg, 4, 4, w - 8, photoH - 6);
      } else {
        drawPlaceholder(ctx, 'Passport Photo Area', 0, 0, w, photoH);
      }

      // Divider Line
      if (addDividerLine.checked) {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, photoH);
        ctx.lineTo(w - 4, photoH);
        ctx.stroke();
      }

      // Draw Signature
      if (signImg) {
        drawImageFit(ctx, signImg, 8, photoH + 4, w - 16, signH - 8);
      } else {
        drawPlaceholder(ctx, 'Signature Area', 0, photoH, w, signH);
      }

    } else {
      // Horizontal
      const photoW = Math.round(w * ratio);
      const signW = w - photoW;

      if (photoImg) {
        drawImageFit(ctx, photoImg, 4, 4, photoW - 6, h - 8);
      } else {
        drawPlaceholder(ctx, 'Photo', 0, 0, photoW, h);
      }

      if (addDividerLine.checked) {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(photoW, 4);
        ctx.lineTo(photoW, h - 4);
        ctx.stroke();
      }

      if (signImg) {
        drawImageFit(ctx, signImg, photoW + 4, 4, signW - 8, h - 8);
      } else {
        drawPlaceholder(ctx, 'Signature', photoW, 0, signW, h);
      }
    }

    // Outer Border
    if (addOuterBorder.checked) {
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
    }

    // Compress to blob & calculate size
    const maxKb = parseInt(targetKb.value, 10);
    let quality = 0.92;
    let blob = await new Promise(r => joinCanvas.toBlob(r, 'image/jpeg', quality));

    if (maxKb > 0) {
      let attempts = 0;
      const targetBytes = maxKb * 1024;
      while (blob.size > targetBytes && quality > 0.1 && attempts < 10) {
        quality = Math.max(0.1, quality * (targetBytes / blob.size) * 0.96);
        blob = await new Promise(r => joinCanvas.toBlob(r, 'image/jpeg', quality));
        attempts++;
      }
    }

    finalBlob = blob;
    outputSizeText.textContent = `Dimensions: ${w}×${h} px | Size: ${window.formatFileSize(blob.size)}`;
  }

  function drawImageFit(ctx, img, dx, dy, dw, dh) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = dw / dh;

    let rw, rh;
    if (imgAspect > boxAspect) {
      rw = dw;
      rh = dw / imgAspect;
    } else {
      rh = dh;
      rw = dh * imgAspect;
    }

    const rx = dx + (dw - rw) / 2;
    const ry = dy + (dh - rh) / 2;

    ctx.drawImage(img, rx, ry, rw, rh);
  }

  function drawPlaceholder(ctx, text, x, y, w, h) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }

  // Initial draw
  renderCombined();

  // Reset
  resetBtn.addEventListener('click', () => {
    photoImg = null;
    signImg = null;
    photoInput.value = '';
    signInput.value = '';
    photoThumb.style.display = 'none';
    signThumb.style.display = 'none';
    photoLabel.textContent = '1. Select Photograph';
    signLabel.textContent = '2. Select Signature';
    photoDropZone.style.borderColor = 'var(--gray-300)';
    signDropZone.style.borderColor = 'var(--gray-300)';
    renderCombined();
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    if (!finalBlob) return;
    window.downloadFile(finalBlob, 'sarkari_photo_signature_joined.jpg');
    window.showToast('Photo & Signature joined file downloaded!', 'success');
  });

})();
