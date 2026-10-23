/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Background Remover Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const bgKeyColor = document.getElementById('bgKeyColor');
  const autoDetectBgBtn = document.getElementById('autoDetectBgBtn');
  const pickColorBtn = document.getElementById('pickColorBtn');
  const toleranceSlider = document.getElementById('toleranceSlider');
  const toleranceVal = document.getElementById('toleranceVal');
  const newBgSelect = document.getElementById('newBgSelect');
  const customColorGroup = document.getElementById('customColorGroup');
  const customColorPicker = document.getElementById('customColorPicker');
  const inputCanvas = document.getElementById('inputCanvas');
  const outputCanvas = document.getElementById('outputCanvas');
  const resetBtn = document.getElementById('resetBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const downloadJpgBtn = document.getElementById('downloadJpgBtn');

  let originalImage = null;
  let pickingMode = false;

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
        originalImage = img;
        dropZone.style.display = 'none';
        toolWorkspace.style.display = 'block';

        // Draw input canvas
        inputCanvas.width = img.naturalWidth;
        inputCanvas.height = img.naturalHeight;
        const ctx = inputCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Auto sample background from top-left corner
        sampleCornerColor();
        processBackground();
        window.showToast('Photo loaded. Click image to pick background color!', 'info');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function sampleCornerColor() {
    if (!originalImage) return;
    const ctx = inputCanvas.getContext('2d');
    const pixel = ctx.getImageData(8, 8, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    bgKeyColor.value = hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  // Click on original image to sample color
  inputCanvas.addEventListener('click', (e) => {
    const rect = inputCanvas.getBoundingClientRect();
    const scaleX = inputCanvas.width / rect.width;
    const scaleY = inputCanvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = inputCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    bgKeyColor.value = rgbToHex(pixel[0], pixel[1], pixel[2]);
    processBackground();
    window.showToast('Sampled background color!', 'success');
  });

  autoDetectBgBtn.addEventListener('click', () => {
    sampleCornerColor();
    processBackground();
  });

  pickColorBtn.addEventListener('click', () => {
    window.showToast('Click anywhere on the background of the original photo', 'info');
  });

  bgKeyColor.addEventListener('input', processBackground);
  toleranceSlider.addEventListener('input', () => {
    toleranceVal.textContent = `${toleranceSlider.value}%`;
    processBackground();
  });

  newBgSelect.addEventListener('change', () => {
    customColorGroup.style.display = newBgSelect.value === 'custom' ? 'flex' : 'none';
    processBackground();
  });

  customColorPicker.addEventListener('input', processBackground);

  function processBackground() {
    if (!originalImage) return;

    outputCanvas.width = originalImage.naturalWidth;
    outputCanvas.height = originalImage.naturalHeight;
    const ctx = outputCanvas.getContext('2d');

    ctx.drawImage(originalImage, 0, 0);
    const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imgData.data;

    const targetRgb = hexToRgb(bgKeyColor.value);
    const maxDist = (parseInt(toleranceSlider.value, 10) / 100) * 441.67; // 441.67 is sqrt(255^2 * 3)

    let replaceBg = newBgSelect.value;
    let replacementRgb = null;
    let isTransparent = false;

    if (replaceBg === 'transparent') {
      isTransparent = true;
    } else if (replaceBg === 'custom') {
      replacementRgb = hexToRgb(customColorPicker.value);
    } else {
      replacementRgb = hexToRgb(replaceBg);
    }

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        (r - targetRgb.r) ** 2 +
        (g - targetRgb.g) ** 2 +
        (b - targetRgb.b) ** 2
      );

      if (dist <= maxDist) {
        if (isTransparent) {
          data[i + 3] = 0; // Transparent
        } else {
          data[i] = replacementRgb.r;
          data[i + 1] = replacementRgb.g;
          data[i + 2] = replacementRgb.b;
          data[i + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    originalImage = null;
    fileInput.value = '';
    toolWorkspace.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // Download PNG (with transparency or solid color)
  downloadPngBtn.addEventListener('click', () => {
    outputCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, 'passport_photo_cutout.png');
        window.showToast('Downloaded PNG with transparency!', 'success');
      }
    }, 'image/png');
  });

  // Download JPG
  downloadJpgBtn.addEventListener('click', () => {
    // If transparent was selected, composite on white for JPEG
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = outputCanvas.width;
    tempCanvas.height = outputCanvas.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.fillStyle = '#FFFFFF';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(outputCanvas, 0, 0);

    tempCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, 'passport_photo_bg.jpg');
        window.showToast('Downloaded JPG for govt form submission!', 'success');
      }
    }, 'image/jpeg', 0.95);
  });

})();
