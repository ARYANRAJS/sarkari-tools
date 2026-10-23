/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Photo BG Color Changer Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const quickColorBtns = document.querySelectorAll('#quickColorGroup .option-btn');
  const customColor = document.getElementById('customColor');
  const toleranceSlider = document.getElementById('toleranceSlider');
  const toleranceVal = document.getElementById('toleranceVal');
  const origCanvas = document.getElementById('origCanvas');
  const outputCanvas = document.getElementById('outputCanvas');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let currentImg = null;
  let sourceBgRgb = { r: 240, g: 240, b: 240 };
  let targetBgRgb = { r: 255, g: 255, b: 255 };

  // Quick Colors
  quickColorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      quickColorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.dataset.color;
      customColor.value = hex;
      targetBgRgb = hexToRgb(hex);
      processColorChange();
    });
  });

  customColor.addEventListener('input', () => {
    quickColorBtns.forEach(b => b.classList.remove('active'));
    targetBgRgb = hexToRgb(customColor.value);
    processColorChange();
  });

  toleranceSlider.addEventListener('input', () => {
    toleranceVal.textContent = `${toleranceSlider.value}%`;
    processColorChange();
  });

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
    if (e.target.files.length > 0) loadFile(e.target.files[0]);
  });

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImg = img;
        dropZone.style.display = 'none';
        toolWorkspace.style.display = 'block';

        origCanvas.width = img.naturalWidth;
        origCanvas.height = img.naturalHeight;
        const ctx = origCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Auto sample background from corner (8, 8)
        const p = ctx.getImageData(8, 8, 1, 1).data;
        sourceBgRgb = { r: p[0], g: p[1], b: p[2] };

        processColorChange();
        window.showToast('Photo loaded! Target color set to Pure White.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Click on orig canvas to sample custom background color
  origCanvas.addEventListener('click', (e) => {
    const rect = origCanvas.getBoundingClientRect();
    const scaleX = origCanvas.width / rect.width;
    const scaleY = origCanvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = origCanvas.getContext('2d');
    const p = ctx.getImageData(x, y, 1, 1).data;
    sourceBgRgb = { r: p[0], g: p[1], b: p[2] };
    processColorChange();
    window.showToast('Selected background color to replace!', 'info');
  });

  function processColorChange() {
    if (!currentImg) return;

    outputCanvas.width = currentImg.naturalWidth;
    outputCanvas.height = currentImg.naturalHeight;
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(currentImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const d = imgData.data;

    const maxDist = (parseInt(toleranceSlider.value, 10) / 100) * 441.67;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const dist = Math.sqrt(
        (r - sourceBgRgb.r) ** 2 +
        (g - sourceBgRgb.g) ** 2 +
        (b - sourceBgRgb.b) ** 2
      );

      if (dist <= maxDist) {
        d[i] = targetBgRgb.r;
        d[i + 1] = targetBgRgb.g;
        d[i + 2] = targetBgRgb.b;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    currentImg = null;
    fileInput.value = '';
    toolWorkspace.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    outputCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, 'passport_photo_new_bg.jpg');
        window.showToast('Photo downloaded successfully!', 'success');
      }
    }, 'image/jpeg', 0.95);
  });

})();
