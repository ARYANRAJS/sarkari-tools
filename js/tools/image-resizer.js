/* ═══════════════════════════════════════════════════
   AllToolsInOne — Image Resizer Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const targetWidth = document.getElementById('targetWidth');
  const targetHeight = document.getElementById('targetHeight');
  const lockAspect = document.getElementById('lockAspect');
  const scalePercent = document.getElementById('scalePercent');
  const percentValue = document.getElementById('percentValue');
  const formatSelect = document.getElementById('formatSelect');
  const targetKb = document.getElementById('targetKb');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityValue = document.getElementById('qualityValue');
  const origPreview = document.getElementById('origPreview');
  const origInfo = document.getElementById('origInfo');
  const origSize = document.getElementById('origSize');
  const resizedPreview = document.getElementById('resizedPreview');
  const resizedInfo = document.getElementById('resizedInfo');
  const resizedSize = document.getElementById('resizedSize');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const tabBtns = document.querySelectorAll('#resizeModeTabs .tool-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // State
  let currentFile = null;
  let originalImage = null;
  let originalAspectRatio = 1;
  let currentMode = 'pixel'; // 'pixel' or 'percent'
  let latestBlob = null;
  let isUpdating = false;

  // Init Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
      currentMode = btn.dataset.tab === 'pixel-tab' ? 'pixel' : 'percent';
      processResize();
    });
  });

  // Drag and Drop
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
      handleFile(files[0]);
    } else {
      window.showToast('Please upload a valid image file', 'error');
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        originalAspectRatio = img.naturalWidth / img.naturalHeight;

        // Populate Original Info
        origPreview.src = e.target.result;
        origInfo.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
        origSize.textContent = window.formatFileSize(file.size);

        // Set default values based on image or passport preset
        targetWidth.value = Math.min(img.naturalWidth, 413);
        targetHeight.value = Math.round(targetWidth.value / originalAspectRatio);
        
        dropZone.style.display = 'none';
        toolWorkspace.style.display = 'block';

        processResize();
        window.showToast('Photo loaded successfully! Adjust size as needed.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Preset Handlers
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const w = parseInt(btn.dataset.w, 10);
      const h = parseInt(btn.dataset.h, 10);
      const kb = parseInt(btn.dataset.kb, 10);

      targetWidth.value = w;
      targetHeight.value = h;
      lockAspect.checked = false; // Presets are explicit dimensions
      if (kb && targetKb) {
        targetKb.value = kb;
      }
      // Switch to pixel tab
      document.querySelector('[data-tab="pixel-tab"]').click();
      processResize();
    });
  });

  // Inputs Change Handlers
  targetWidth.addEventListener('input', () => {
    if (lockAspect.checked && originalAspectRatio) {
      targetHeight.value = Math.round(parseInt(targetWidth.value || 0, 10) / originalAspectRatio);
    }
    processResize();
  });

  targetHeight.addEventListener('input', () => {
    if (lockAspect.checked && originalAspectRatio) {
      targetWidth.value = Math.round(parseInt(targetHeight.value || 0, 10) * originalAspectRatio);
    }
    processResize();
  });

  scalePercent.addEventListener('input', () => {
    percentValue.textContent = `${scalePercent.value}%`;
    processResize();
  });

  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
    processResize();
  });

  formatSelect.addEventListener('change', processResize);
  targetKb.addEventListener('change', processResize);

  // Resize Engine with KB compression loop
  async function processResize() {
    if (!originalImage || isUpdating) return;
    isUpdating = true;

    try {
      let finalW, finalH;
      if (currentMode === 'percent') {
        const factor = parseInt(scalePercent.value, 10) / 100;
        finalW = Math.max(1, Math.round(originalImage.naturalWidth * factor));
        finalH = Math.max(1, Math.round(originalImage.naturalHeight * factor));
      } else {
        finalW = Math.max(1, parseInt(targetWidth.value, 10) || 100);
        finalH = Math.max(1, parseInt(targetHeight.value, 10) || 100);
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background for JPEGs (in case transparent PNG is resized to JPG)
      const format = formatSelect.value;
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalW, finalH);
      }

      ctx.drawImage(originalImage, 0, 0, finalW, finalH);

      const maxKb = parseInt(targetKb.value, 10);
      let quality = parseInt(qualitySlider.value, 10) / 100;

      let blob = await canvasToBlob(canvas, format, quality);

      // If user specified target KB and format supports compression (JPEG/WEBP)
      if (maxKb > 0 && (format === 'image/jpeg' || format === 'image/webp')) {
        let attempts = 0;
        const targetBytes = maxKb * 1024;
        while (blob.size > targetBytes && quality > 0.1 && attempts < 12) {
          quality = Math.max(0.08, quality * (targetBytes / blob.size) * 0.95);
          blob = await canvasToBlob(canvas, format, quality);
          attempts++;
        }
      }

      latestBlob = blob;
      resizedPreview.src = URL.createObjectURL(blob);
      resizedInfo.textContent = `${finalW} × ${finalH} px`;
      resizedSize.textContent = window.formatFileSize(blob.size);

    } catch (err) {
      console.error(err);
      window.showToast('Error processing image resize', 'error');
    } finally {
      isUpdating = false;
    }
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    currentFile = null;
    originalImage = null;
    latestBlob = null;
    toolWorkspace.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    if (!latestBlob) return;
    const format = formatSelect.value;
    let ext = 'jpg';
    if (format === 'image/png') ext = 'png';
    else if (format === 'image/webp') ext = 'webp';

    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'sarkari_photo';
    window.downloadFile(latestBlob, `${baseName}_resized.${ext}`);
    window.showToast('Image downloaded successfully!', 'success');
  });

})();
