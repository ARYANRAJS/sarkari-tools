/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Passport Size Photo Maker Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const photoPreset = document.getElementById('photoPreset');
  const sheetLayout = document.getElementById('sheetLayout');
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomVal = document.getElementById('zoomVal');
  const addBorder = document.getElementById('addBorder');
  const addCutLines = document.getElementById('addCutLines');
  const photoCountDisplay = document.getElementById('photoCountDisplay');
  const sheetCanvas = document.getElementById('sheetCanvas');
  const resetBtn = document.getElementById('resetBtn');
  const downloadImgBtn = document.getElementById('downloadImgBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  let currentImage = null;

  // Preset Dimensions in mm
  const PRESETS = {
    passport_in: { wMm: 35, hMm: 45, name: 'Passport (3.5x4.5cm)' },
    stamp: { wMm: 20, hMm: 25, name: 'Stamp (2x2.5cm)' },
    pan_card: { wMm: 25, hMm: 35, name: 'PAN Card (2.5x3.5cm)' },
    us_visa: { wMm: 51, hMm: 51, name: 'US Visa (2x2 inch)' }
  };

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
        renderSheet();
        window.showToast('Portrait loaded! Ready to arrange sheet.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Events
  photoPreset.addEventListener('change', renderSheet);
  sheetLayout.addEventListener('change', renderSheet);
  addBorder.addEventListener('change', renderSheet);
  addCutLines.addEventListener('change', renderSheet);
  zoomSlider.addEventListener('input', () => {
    zoomVal.textContent = `${zoomSlider.value}%`;
    renderSheet();
  });

  function renderSheet() {
    if (!currentImage) return;

    const preset = PRESETS[photoPreset.value] || PRESETS.passport_in;
    const layout = sheetLayout.value;
    const zoom = parseInt(zoomSlider.value, 10) / 100;
    const border = addBorder.checked;
    const cutLines = addCutLines.checked;

    const DPI = 300;
    const mmToPx = (mm) => Math.round((mm / 25.4) * DPI);

    // Photo Dimensions in Pixels
    const photoW = mmToPx(preset.wMm);
    const photoH = mmToPx(preset.hMm);

    // Prepare Cropped Single Photo Canvas
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = photoW;
    singleCanvas.height = photoH;
    const sCtx = singleCanvas.getContext('2d');
    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, photoW, photoH);

    // Center crop with zoom
    const imgAspect = currentImage.naturalWidth / currentImage.naturalHeight;
    const targetAspect = photoW / photoH;

    let srcW, srcH, srcX, srcY;
    if (imgAspect > targetAspect) {
      srcH = currentImage.naturalHeight / zoom;
      srcW = srcH * targetAspect;
    } else {
      srcW = currentImage.naturalWidth / zoom;
      srcH = srcW / targetAspect;
    }
    srcX = (currentImage.naturalWidth - srcW) / 2;
    srcY = (currentImage.naturalHeight - srcH) / 2;

    sCtx.drawImage(currentImage, srcX, srcY, srcW, srcH, 0, 0, photoW, photoH);

    if (border) {
      sCtx.strokeStyle = '#333333';
      sCtx.lineWidth = 4;
      sCtx.strokeRect(2, 2, photoW - 4, photoH - 4);
    }

    // Determine Sheet Size and Arrangement
    let sheetW, sheetH, rows, cols, count;

    if (layout === 'single') {
      sheetCanvas.width = photoW;
      sheetCanvas.height = photoH;
      const ctx = sheetCanvas.getContext('2d');
      ctx.drawImage(singleCanvas, 0, 0);
      photoCountDisplay.textContent = '1';
      return;
    } else if (layout === '6_4x6') {
      // 4x6 inch paper (1200 x 1800 px)
      sheetW = 1800; // 6 inch
      sheetH = 1200; // 4 inch
      cols = 3;
      rows = 2;
      count = 6;
    } else {
      // A4 Sheet: 210 x 297 mm => 2480 x 3508 px
      sheetW = 2480;
      sheetH = 3508;

      if (layout === '5_a4') {
        cols = 5;
        rows = 1;
        count = 5;
      } else if (layout === '8_a4') {
        cols = 4;
        rows = 2;
        count = 8;
      } else if (layout === '10_a4') {
        cols = 5;
        rows = 2;
        count = 10;
      } else {
        // fill_a4
        cols = 5;
        rows = 6;
        count = 30;
      }
    }

    photoCountDisplay.textContent = count;
    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;
    const ctx = sheetCanvas.getContext('2d');

    // Clean White Paper Sheet
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetW, sheetH);

    // Margins and Spacing
    const marginX = mmToPx(15);
    const marginY = mmToPx(20);
    const gapX = mmToPx(5);
    const gapY = mmToPx(8);

    let drawn = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (drawn >= count) break;

        const posX = marginX + c * (photoW + gapX);
        const posY = marginY + r * (photoH + gapY);

        ctx.drawImage(singleCanvas, posX, posY);

        // Optional Dashed Cut Lines
        if (cutLines) {
          ctx.setLineDash([12, 12]);
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 2;
          ctx.strokeRect(posX - 4, posY - 4, photoW + 8, photoH + 8);
          ctx.setLineDash([]);
        }

        drawn++;
      }
    }
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    currentImage = null;
    fileInput.value = '';
    toolWorkspace.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // Download JPG
  downloadImgBtn.addEventListener('click', () => {
    sheetCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, `passport_photos_a4.jpg`);
        window.showToast('High resolution print photo sheet downloaded!', 'success');
      }
    }, 'image/jpeg', 0.98);
  });

  // Download Printable PDF
  downloadPdfBtn.addEventListener('click', () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.showToast('PDF library is loading, please try in a moment', 'warning');
      return;
    }

    const { jsPDF } = window.jspdf;
    const is4x6 = sheetLayout.value === '6_4x6';
    const orientation = is4x6 ? 'landscape' : 'portrait';
    const format = is4x6 ? [152.4, 101.6] : 'a4';

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    const imgData = sheetCanvas.toDataURL('image/jpeg', 0.95);
    const pdfW = is4x6 ? 152.4 : 210;
    const pdfH = is4x6 ? 101.6 : 297;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save('passport_photo_sheet.pdf');
    window.showToast('Print-ready PDF downloaded!', 'success');
  });

})();
