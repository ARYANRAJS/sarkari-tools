/* ═══════════════════════════════════════════════════
   AllToolsInOne — AI Background Remover Engine v2.0
   Pixel-level neural segmentation via MediaPipe,
   Boundary-Connected Color Matting, and Manual Refine Brush
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const inputCanvas = document.getElementById('inputCanvas');
  const outputCanvas = document.getElementById('outputCanvas');
  const maskCanvas = document.getElementById('maskCanvas');
  const processingOverlay = document.getElementById('processingOverlay');
  const processingMsg = document.getElementById('processingMsg');
  const aiStatusPill = document.getElementById('aiStatusPill');

  // Mode Tabs & Panels
  const removerModeTabs = document.getElementById('removerModeTabs');
  const aiOptionsPanel = document.getElementById('aiOptionsPanel');
  const colorOptionsPanel = document.getElementById('colorOptionsPanel');
  const brushOptionsPanel = document.getElementById('brushOptionsPanel');

  // AI Controls
  const featherSlider = document.getElementById('featherSlider');
  const dispFeatherVal = document.getElementById('dispFeatherVal');
  const btnRecomputeAi = document.getElementById('btnRecomputeAi');

  // Color Controls
  const bgKeyColor = document.getElementById('bgKeyColor');
  const autoSampleCornerBtn = document.getElementById('autoSampleCornerBtn');
  const pickFromImageBtn = document.getElementById('pickFromImageBtn');
  const toleranceSlider = document.getElementById('toleranceSlider');
  const toleranceVal = document.getElementById('toleranceVal');

  // Brush Controls
  const btnBrushErase = document.getElementById('btnBrushErase');
  const btnBrushRestore = document.getElementById('btnBrushRestore');
  const brushSizeSlider = document.getElementById('brushSizeSlider');
  const dispBrushSize = document.getElementById('dispBrushSize');

  // Background Swatches & Pickers
  const customColorPicker = document.getElementById('customColorPicker');
  const dispCustomHex = document.getElementById('dispCustomHex');

  // Actions
  const btnToggleView = document.getElementById('btnToggleView');
  const sideBySideWrap = document.getElementById('sideBySideWrap');
  const resetBtn = document.getElementById('resetBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const downloadJpgBtn = document.getElementById('downloadJpgBtn');

  // State
  let originalImage = null;
  let activeMode = 'ai'; // 'ai' | 'color' | 'brush'
  let brushAction = 'erase'; // 'erase' | 'restore'
  let activeBgColor = 'transparent'; // 'transparent' | hex
  let isPickingColor = false;
  let isDrawingBrush = false;
  let aiSegmenter = null;
  let hasAiMask = false;
  let sideBySideActive = true;

  // Initialize MediaPipe SelfieSegmentation
  function initMediaPipe() {
    if (typeof window.SelfieSegmentation === 'undefined') {
      console.warn('MediaPipe SelfieSegmentation not loaded yet.');
      return null;
    }

    try {
      const segmenter = new window.SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      });

      segmenter.setOptions({
        modelSelection: 1 // 1: Landscape/Portrait (faster and high quality for photos)
      });

      segmenter.onResults(onAiResults);
      return segmenter;
    } catch (e) {
      console.error('Error initializing SelfieSegmentation:', e);
      return null;
    }
  }

  // Handle Drag & Drop & Upload
  dropZone?.addEventListener('click', () => fileInput?.click());
  ['dragenter', 'dragover'].forEach(name => {
    dropZone?.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropZone?.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone?.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      loadImageFile(files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadImageFile(e.target.files[0]);
    }
  });

  // Load Image File
  function loadImageFile(file) {
    showProcessing('Loading photo and detecting pixels...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        if (dropZone) dropZone.style.display = 'none';
        if (toolWorkspace) toolWorkspace.style.display = 'block';

        // Setup input canvas
        inputCanvas.width = img.naturalWidth;
        inputCanvas.height = img.naturalHeight;
        const inCtx = inputCanvas.getContext('2d');
        inCtx.drawImage(img, 0, 0);

        // Setup mask canvas
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;

        // Setup output canvas
        outputCanvas.width = img.naturalWidth;
        outputCanvas.height = img.naturalHeight;

        // Run AI Auto-Detect by default
        runAiSegmentation();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Show / Hide Processing Overlay
  function showProcessing(msg = 'AI Segmenting Pixels...') {
    if (processingOverlay) {
      if (processingMsg) processingMsg.textContent = msg;
      processingOverlay.style.display = 'flex';
    }
  }

  function hideProcessing() {
    if (processingOverlay) {
      processingOverlay.style.display = 'none';
    }
  }

  // AI Segmentation Callback
  function onAiResults(results) {
    if (!results || !results.segmentationMask) {
      hideProcessing();
      window.showToast?.('AI could not detect subject, fallback to Color Matting', 'warning');
      switchMode('color');
      return;
    }

    const w = inputCanvas.width;
    const h = inputCanvas.height;

    // Draw MediaPipe mask to maskCanvas
    const mCtx = maskCanvas.getContext('2d');
    mCtx.clearRect(0, 0, w, h);
    mCtx.drawImage(results.segmentationMask, 0, 0, w, h);

    // Check if a person subject was detected
    const maskData = mCtx.getImageData(0, 0, w, h).data;
    let subjectPixelCount = 0;
    const totalPixels = w * h;
    for (let i = 0; i < maskData.length; i += 16) {
      if (maskData[i] > 100) subjectPixelCount++;
    }

    const ratio = subjectPixelCount / (totalPixels / 4);
    if (ratio < 0.02) {
      hideProcessing();
      window.showToast?.('No person detected. Switched to smart color matting for signatures/objects', 'info');
      switchMode('color');
      return;
    }

    hasAiMask = true;
    hideProcessing();
    renderOutput();
    window.showToast?.('✨ AI automatically detected person & removed background!', 'success');
  }

  // Trigger AI Model
  async function runAiSegmentation() {
    if (!originalImage) return;

    if (!aiSegmenter) {
      aiSegmenter = initMediaPipe();
    }

    if (!aiSegmenter) {
      // Fallback if CDN failed
      hideProcessing();
      window.showToast?.('AI library offline, running smart color matting...', 'info');
      runBoundaryColorMatting();
      return;
    }

    showProcessing('🤖 AI Neural Net Analyzing Pixels...');
    try {
      await aiSegmenter.send({ image: inputCanvas });
    } catch (err) {
      console.error('Error running MediaPipe:', err);
      hideProcessing();
      runBoundaryColorMatting();
    }
  }

  // Boundary-Connected Flood Fill (for non-people or plain backdrops)
  function runBoundaryColorMatting() {
    if (!originalImage) return;
    showProcessing('Running Smart Boundary Color Matting...');

    setTimeout(() => {
      const w = inputCanvas.width;
      const h = inputCanvas.height;
      const inCtx = inputCanvas.getContext('2d');
      const imgData = inCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const targetRgb = hexToRgb(bgKeyColor ? bgKeyColor.value : '#ffffff');
      const tolerance = parseFloat(toleranceSlider ? toleranceSlider.value : 25) || 25;
      const maxDist = (tolerance / 100) * 441.67;

      function dist(idx) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        return Math.sqrt((r - targetRgb.r)**2 + (g - targetRgb.g)**2 + (b - targetRgb.b)**2);
      }

      // BFS Flood-fill from borders only
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let qHead = 0;
      let qTail = 0;

      // Seed from all 4 borders
      for (let x = 0; x < w; x++) {
        const topIdx = x * 4;
        if (dist(topIdx) <= maxDist) {
          visited[x] = 1;
          queue[qTail++] = x;
        }
        const btmPos = (h - 1) * w + x;
        const btmIdx = btmPos * 4;
        if (dist(btmIdx) <= maxDist && !visited[btmPos]) {
          visited[btmPos] = 1;
          queue[qTail++] = btmPos;
        }
      }

      for (let y = 0; y < h; y++) {
        const leftPos = y * w;
        if (dist(leftPos * 4) <= maxDist && !visited[leftPos]) {
          visited[leftPos] = 1;
          queue[qTail++] = leftPos;
        }
        const rightPos = y * w + (w - 1);
        if (dist(rightPos * 4) <= maxDist && !visited[rightPos]) {
          visited[rightPos] = 1;
          queue[qTail++] = rightPos;
        }
      }

      while (qHead < qTail) {
        const pos = queue[qHead++];
        const x = pos % w;
        const y = Math.floor(pos / w);

        const neighbors = [
          x > 0 ? pos - 1 : -1,
          x < w - 1 ? pos + 1 : -1,
          y > 0 ? pos - w : -1,
          y < h - 1 ? pos + w : -1
        ];

        for (let i = 0; i < 4; i++) {
          const nPos = neighbors[i];
          if (nPos !== -1 && !visited[nPos]) {
            visited[nPos] = 1;
            if (dist(nPos * 4) <= maxDist) {
              queue[qTail++] = nPos;
            }
          }
        }
      }

      // Write mask: Foreground (not visited background) = 255 alpha, Background = 0 alpha
      const mCtx = maskCanvas.getContext('2d');
      const maskData = mCtx.createImageData(w, h);
      const mBytes = maskData.data;

      for (let p = 0, i = 0; p < w * h; p++, i += 4) {
        if (visited[p]) {
          // Background
          mBytes[i] = 0;
          mBytes[i + 1] = 0;
          mBytes[i + 2] = 0;
          mBytes[i + 3] = 0;
        } else {
          // Foreground subject
          mBytes[i] = 255;
          mBytes[i + 1] = 0;
          mBytes[i + 2] = 0;
          mBytes[i + 3] = 255;
        }
      }

      mCtx.putImageData(maskData, 0, 0);
      hasAiMask = true;
      hideProcessing();
      renderOutput();
      window.showToast?.('Color matting applied to boundary pixels!', 'success');
    }, 50);
  }

  // Master Compositor: Draw Foreground + Background onto OutputCanvas
  function renderOutput() {
    if (!originalImage || !hasAiMask) return;

    const w = inputCanvas.width;
    const h = inputCanvas.height;
    const outCtx = outputCanvas.getContext('2d');

    outCtx.clearRect(0, 0, w, h);

    // Apply Feathering if needed
    const feather = parseFloat(featherSlider ? featherSlider.value : 0) || 0;
    if (feather > 0) {
      outCtx.filter = `blur(${feather}px)`;
    } else {
      outCtx.filter = 'none';
    }

    // 1. Draw Mask
    outCtx.drawImage(maskCanvas, 0, 0, w, h);

    // Reset filter for sharp subject content
    outCtx.filter = 'none';

    // 2. Composite Subject inside Mask
    outCtx.globalCompositeOperation = 'source-in';
    outCtx.drawImage(originalImage, 0, 0, w, h);

    // 3. Composite New Background behind Subject
    if (activeBgColor !== 'transparent') {
      outCtx.globalCompositeOperation = 'destination-over';
      outCtx.fillStyle = activeBgColor;
      outCtx.fillRect(0, 0, w, h);
    }

    // Reset composite mode
    outCtx.globalCompositeOperation = 'source-over';
  }

  // Color Swatches
  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBgColor = btn.getAttribute('data-bg');
      renderOutput();
    });
  });

  // Custom Color Picker
  customColorPicker?.addEventListener('input', (e) => {
    document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
    activeBgColor = e.target.value;
    if (dispCustomHex) dispCustomHex.textContent = activeBgColor;
    renderOutput();
  });

  // Feather Slider
  featherSlider?.addEventListener('input', () => {
    if (dispFeatherVal) dispFeatherVal.textContent = featherSlider.value + ' px';
    renderOutput();
  });

  // Mode Switcher Tabs
  removerModeTabs?.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-tab-btn');
    if (!btn) return;
    const mode = btn.getAttribute('data-mode');
    switchMode(mode);
  });

  function switchMode(mode) {
    activeMode = mode;
    document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.mode-tab-btn[data-mode="${mode}"]`)?.classList.add('active');

    if (aiOptionsPanel) aiOptionsPanel.style.display = mode === 'ai' ? 'block' : 'none';
    if (colorOptionsPanel) colorOptionsPanel.style.display = mode === 'color' ? 'block' : 'none';
    if (brushOptionsPanel) brushOptionsPanel.style.display = mode === 'brush' ? 'block' : 'none';

    if (mode === 'ai') {
      if (aiStatusPill) {
        aiStatusPill.textContent = '🤖 Pixel AI Active';
        aiStatusPill.style.background = '#dbeafe';
        aiStatusPill.style.color = '#1e40af';
      }
      if (!hasAiMask) {
        if (originalImage) runAiSegmentation();
      } else {
        renderOutput();
      }
    } else if (mode === 'color') {
      if (aiStatusPill) {
        aiStatusPill.textContent = '🎯 Color Matting';
        aiStatusPill.style.background = '#fef3c7';
        aiStatusPill.style.color = '#92400e';
      }
      sampleCornerColor();
      if (originalImage) runBoundaryColorMatting();
    } else if (mode === 'brush') {
      if (aiStatusPill) {
        aiStatusPill.textContent = '🖌️ Manual Touch-up';
        aiStatusPill.style.background = '#dcfce7';
        aiStatusPill.style.color = '#166534';
      }
      window.showToast?.('Drag on the right canvas to Erase or Restore pixels', 'info');
    }
  }

  btnRecomputeAi?.addEventListener('click', runAiSegmentation);

  // Color Sampling Helpers
  function sampleCornerColor() {
    if (!originalImage || !inputCanvas) return;
    const ctx = inputCanvas.getContext('2d');
    const pixel = ctx.getImageData(8, 8, 1, 1).data;
    if (bgKeyColor) bgKeyColor.value = rgbToHex(pixel[0], pixel[1], pixel[2]);
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

  autoSampleCornerBtn?.addEventListener('click', () => {
    sampleCornerColor();
    runBoundaryColorMatting();
  });

  pickFromImageBtn?.addEventListener('click', () => {
    isPickingColor = true;
    window.showToast?.('Click anywhere on the background wall of the original photo', 'info');
  });

  inputCanvas?.addEventListener('click', (e) => {
    if (!originalImage) return;
    const rect = inputCanvas.getBoundingClientRect();
    const scaleX = inputCanvas.width / rect.width;
    const scaleY = inputCanvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = inputCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (bgKeyColor) bgKeyColor.value = rgbToHex(pixel[0], pixel[1], pixel[2]);

    if (activeMode === 'color') {
      runBoundaryColorMatting();
    } else {
      switchMode('color');
    }
  });

  toleranceSlider?.addEventListener('input', () => {
    if (toleranceVal) toleranceVal.textContent = toleranceSlider.value + '%';
    runBoundaryColorMatting();
  });

  bgKeyColor?.addEventListener('input', runBoundaryColorMatting);

  // Manual Brush Tool Handlers
  btnBrushErase?.addEventListener('click', () => {
    brushAction = 'erase';
    btnBrushErase.className = 'btn btn-primary btn-sm';
    if (btnBrushRestore) btnBrushRestore.className = 'btn btn-outline btn-sm';
  });

  btnBrushRestore?.addEventListener('click', () => {
    brushAction = 'restore';
    btnBrushRestore.className = 'btn btn-primary btn-sm';
    if (btnBrushErase) btnBrushErase.className = 'btn btn-outline btn-sm';
  });

  brushSizeSlider?.addEventListener('input', () => {
    if (dispBrushSize) dispBrushSize.textContent = brushSizeSlider.value + ' px';
  });

  function applyBrush(e) {
    if (!isDrawingBrush || activeMode !== 'brush' || !outputCanvas || !maskCanvas) return;
    const rect = outputCanvas.getBoundingClientRect();
    const scaleX = outputCanvas.width / rect.width;
    const scaleY = outputCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const radius = parseFloat(brushSizeSlider ? brushSizeSlider.value : 20) || 20;

    const mCtx = maskCanvas.getContext('2d');
    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(x, y, radius, 0, Math.PI * 2);

    if (brushAction === 'erase') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = '#000000';
      mCtx.fill();
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.fillStyle = '#ff0000';
      mCtx.fill();
    }
    mCtx.restore();

    renderOutput();
  }

  outputCanvas?.addEventListener('mousedown', (e) => {
    if (activeMode === 'brush') {
      isDrawingBrush = true;
      applyBrush(e);
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isDrawingBrush) applyBrush(e);
  });

  window.addEventListener('mouseup', () => {
    isDrawingBrush = false;
  });

  // Toggle View Mode (Side-by-side vs Single)
  btnToggleView?.addEventListener('click', () => {
    sideBySideActive = !sideBySideActive;
    const origBox = sideBySideWrap?.children[0];
    if (origBox) {
      origBox.style.display = sideBySideActive ? 'block' : 'none';
    }
    btnToggleView.textContent = sideBySideActive ? '👁️ Hide Original Photo' : '👁️ Show Original Photo';
  });

  // Reset Tool
  resetBtn?.addEventListener('click', () => {
    originalImage = null;
    hasAiMask = false;
    if (fileInput) fileInput.value = '';
    if (toolWorkspace) toolWorkspace.style.display = 'none';
    if (dropZone) dropZone.style.display = 'block';
  });

  // Download Handlers
  downloadPngBtn?.addEventListener('click', () => {
    if (!originalImage || !outputCanvas) return;
    const prevColor = activeBgColor;
    activeBgColor = 'transparent';
    renderOutput();

    outputCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, 'passport_cutout_transparent.png');
        window.showToast?.('Downloaded Transparent PNG cutout!', 'success');
      }
      activeBgColor = prevColor;
      renderOutput();
    }, 'image/png');
  });

  downloadJpgBtn?.addEventListener('click', () => {
    if (!originalImage || !outputCanvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outputCanvas.width;
    exportCanvas.height = outputCanvas.height;
    const eCtx = exportCanvas.getContext('2d');

    const effectiveBg = activeBgColor === 'transparent' ? '#ffffff' : activeBgColor;
    eCtx.fillStyle = effectiveBg;
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    eCtx.drawImage(outputCanvas, 0, 0);

    exportCanvas.toBlob((blob) => {
      if (blob) {
        window.downloadFile(blob, 'passport_photo_official.jpg');
        window.showToast?.('Downloaded Official JPG for Govt/Exam Submission!', 'success');
      }
    }, 'image/jpeg', 0.96);
  });

})();
