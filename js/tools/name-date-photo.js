/* ═══════════════════════════════════════════════════
   AllToolsInOne — Name & Date on Photo Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const candidateName = document.getElementById('candidateName');
  const dateText = document.getElementById('dateText');
  const extraText = document.getElementById('extraText');
  const fontSize = document.getElementById('fontSize');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const textPos = document.getElementById('textPos');
  const fontColor = document.getElementById('fontColor');
  const boxBgColor = document.getElementById('boxBgColor');
  const targetKb = document.getElementById('targetKb');
  const photoCanvas = document.getElementById('photoCanvas');
  const outputInfoText = document.getElementById('outputInfoText');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let currentImage = null;
  let finalBlob = null;

  // Drag and drop
  dropZone.addEventListener('click', () => fileInput.click());
  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      loadFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadFile(e.target.files[0]);
    }
  });

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        dropZone.style.display = 'none';
        toolWorkspace.style.display = 'block';
        renderCanvas();
        window.showToast('Photo loaded! Type your name and date below.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Inputs
  [candidateName, dateText, extraText].forEach(input => {
    input.addEventListener('input', renderCanvas);
  });
  [textPos, fontColor, boxBgColor, targetKb].forEach(input => {
    input.addEventListener('change', renderCanvas);
  });
  fontSize.addEventListener('input', () => {
    fontSizeVal.textContent = `${fontSize.value}px`;
    renderCanvas();
  });

  async function renderCanvas() {
    if (!currentImage) return;

    // Use standard passport width ~413 px or image natural width (max 600)
    const baseW = Math.min(Math.max(currentImage.naturalWidth, 350), 600);
    const aspect = currentImage.naturalWidth / currentImage.naturalHeight;
    const baseH = Math.round(baseW / aspect);

    const fSize = parseInt(fontSize.value, 10);
    const lines = [];
    if (candidateName.value.trim()) lines.push(candidateName.value.trim().toUpperCase());
    if (dateText.value.trim()) lines.push(dateText.value.trim());
    if (extraText.value.trim()) lines.push(extraText.value.trim());

    const lineCount = Math.max(lines.length, 1);
    const bannerPadding = 12;
    const lineHeight = fSize * 1.35;
    const bannerH = Math.round(lineCount * lineHeight + bannerPadding * 2);

    const totalW = baseW;
    const totalH = baseH + bannerH;

    photoCanvas.width = totalW;
    photoCanvas.height = totalH;
    const ctx = photoCanvas.getContext('2d');

    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, totalW, totalH);

    const isBottom = textPos.value === 'bottom';
    const photoY = isBottom ? 0 : bannerH;
    const bannerY = isBottom ? baseH : 0;

    // Draw Main Photo
    ctx.drawImage(currentImage, 0, photoY, baseW, baseH);

    // Draw Text Box Banner
    ctx.fillStyle = boxBgColor.value;
    ctx.fillRect(0, bannerY, totalW, bannerH);

    // Divider line between photo & banner
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const divY = isBottom ? baseH : bannerH;
    ctx.moveTo(0, divY);
    ctx.lineTo(totalW, divY);
    ctx.stroke();

    // Outer frame border
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, totalW - 2, totalH - 2);

    // Render Text Lines
    ctx.fillStyle = fontColor.value;
    ctx.font = `600 ${fSize}px 'Poppins', -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startTextY = bannerY + bannerPadding + lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, totalW / 2, startTextY + i * lineHeight);
    });

    // Compress
    const maxKb = parseInt(targetKb.value, 10);
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

    finalBlob = blob;
    outputInfoText.textContent = `${totalW}×${totalH} px | Size: ${window.formatFileSize(blob.size)}`;
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    currentImage = null;
    fileInput.value = '';
    toolWorkspace.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    if (!finalBlob) return;
    window.downloadFile(finalBlob, 'photo_with_name_date.jpg');
    window.showToast('Photo with Name & Date downloaded!', 'success');
  });

})();
