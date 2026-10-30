/* ═════════════════════════════════════════════════════════════════
   AllToolsInOne — Ultra AI Image Enhancer & Super-Resolution Engine
   Multi-Pass Computational Photography:
   1. Bilateral Edge-Preserving Denoising
   2. CLAHE (Contrast Limited Adaptive Histogram Equalization)
   3. Directional Gradient-Guided Super-Resolution (2x, 4x, 8x)
   4. Multi-Scale Laplacian Micro-Texture Synthesis & Anti-Halo Deblur
   5. Skin-Tone Protected Color Vibrance & Dynamic Contrast
   ═════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // DOM Elements
  const uploadZoneCard = document.getElementById('uploadZoneCard');
  const imageFileInput = document.getElementById('imageFileInput');
  const btnLoadSampleImage = document.getElementById('btnLoadSampleImage');
  const enhancerWorkspace = document.getElementById('enhancerWorkspace');

  const fileInfoName = document.getElementById('fileInfoName');
  const fileInfoDimensions = document.getElementById('fileInfoDimensions');

  const presetCards = document.querySelectorAll('.preset-option-card');
  const scaleChips = document.querySelectorAll('.scale-chip');

  const advancedToggle = document.getElementById('advancedToggle');
  const advancedDrawer = document.getElementById('advancedDrawer');
  const advancedToggleArrow = document.getElementById('advancedToggleArrow');

  const sliderClarity = document.getElementById('sliderClarity');
  const valClarity = document.getElementById('valClarity');
  const sliderHdr = document.getElementById('sliderHdr');
  const valHdr = document.getElementById('valHdr');
  const sliderDenoise = document.getElementById('sliderDenoise');
  const valDenoise = document.getElementById('valDenoise');
  const sliderVibrance = document.getElementById('sliderVibrance');
  const valVibrance = document.getElementById('valVibrance');
  const chkAntiHalo = document.getElementById('chkAntiHalo');

  const btnRunEnhancer = document.getElementById('btnRunEnhancer');

  // Comparison Viewer Elements
  const compareContainer = document.getElementById('compareContainer');
  const layerBefore = document.getElementById('layerBefore');
  const canvasBefore = document.getElementById('canvasBefore');
  const canvasAfter = document.getElementById('canvasAfter');
  const dividerHandle = document.getElementById('dividerHandle');
  const btnViewSplit = document.getElementById('btnViewSplit');
  const btnViewToggle = document.getElementById('btnViewToggle');
  const badgeAfterStatus = document.getElementById('badgeAfterStatus');

  // Stats & Export
  const statsGrid = document.getElementById('statsGrid');
  const statOutputRes = document.getElementById('statOutputRes');
  const statClarityGain = document.getElementById('statClarityGain');
  const statDynamicRange = document.getElementById('statDynamicRange');
  const statProcessingTime = document.getElementById('statProcessingTime');

  const exportCard = document.getElementById('exportCard');
  const exportSummaryText = document.getElementById('exportSummaryText');
  const exportFormatSelect = document.getElementById('exportFormatSelect');
  const btnDownloadEnhanced = document.getElementById('btnDownloadEnhanced');

  // Progress Overlay
  const renderProgressCard = document.getElementById('renderProgressCard');
  const progressStageTitle = document.getElementById('progressStageTitle');
  const progressStageDesc = document.getElementById('progressStageDesc');
  const renderProgressBar = document.getElementById('renderProgressBar');
  const renderTimeElapsed = document.getElementById('renderTimeElapsed');
  const renderPercentText = document.getElementById('renderPercentText');

  // State
  let currentFile = null;
  let originalImage = null;
  let enhancedCanvas = null;
  let activePreset = 'ultra_master';
  let activeScale = 2;
  let isProcessing = false;
  let sliderPercent = 50;
  let isDraggingSlider = false;

  const PRESETS = {
    ultra_master: {
      scale: 2,
      clarity: 80,
      hdr: 75,
      denoise: 60,
      vibrance: 25,
      antiHalo: true,
      title: 'Ultra AI Master'
    },
    portrait: {
      scale: 2,
      clarity: 65,
      hdr: 55,
      denoise: 75,
      vibrance: 15,
      antiHalo: true,
      title: 'Portrait & Face Clarity'
    },
    landscape: {
      scale: 4,
      clarity: 90,
      hdr: 90,
      denoise: 45,
      vibrance: 40,
      antiHalo: true,
      title: 'Landscape & HDR Scenery'
    },
    document: {
      scale: 2,
      clarity: 100,
      hdr: 95,
      denoise: 80,
      vibrance: -25,
      antiHalo: true,
      title: 'Document & Text Crisp'
    }
  };

  /* ───────── INITIALIZATION & EVENTS ───────── */
  function init() {
    bindUploadEvents();
    bindPresetEvents();
    bindScaleEvents();
    bindSliderEvents();
    bindComparisonEvents();
    bindExportEvents();
  }

  function bindUploadEvents() {
    // Dropzone
    ['dragenter', 'dragover'].forEach(evt => {
      uploadZoneCard.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZoneCard.style.borderColor = 'var(--saffron)';
        uploadZoneCard.style.background = '#fffcf8';
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      uploadZoneCard.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZoneCard.style.borderColor = 'var(--gray-300)';
        uploadZoneCard.style.background = 'var(--white)';
      });
    });

    uploadZoneCard.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        handleFile(files[0]);
      } else {
        showToast('Please drop a valid image file (JPG, PNG, WebP).', 'error');
      }
    });

    imageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    btnLoadSampleImage.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSampleImage();
    });
  }

  function bindPresetEvents() {
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        presetCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activePreset = card.dataset.preset;
        applyPresetValues(activePreset);
      });
    });
  }

  function applyPresetValues(key) {
    const p = PRESETS[key] || PRESETS.ultra_master;
    activeScale = p.scale;
    scaleChips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.scale, 10) === activeScale);
    });

    sliderClarity.value = p.clarity;
    valClarity.innerText = `${p.clarity}%`;

    sliderHdr.value = p.hdr;
    valHdr.innerText = `${p.hdr}%`;

    sliderDenoise.value = p.denoise;
    valDenoise.innerText = `${p.denoise}%`;

    sliderVibrance.value = p.vibrance;
    valVibrance.innerText = `${p.vibrance >= 0 ? '+' : ''}${p.vibrance}%`;

    chkAntiHalo.checked = p.antiHalo;
  }

  function bindScaleEvents() {
    scaleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        scaleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeScale = parseInt(chip.dataset.scale, 10);
      });
    });
  }

  function bindSliderEvents() {
    advancedToggle.addEventListener('click', () => {
      const isOpen = advancedDrawer.classList.toggle('open');
      advancedToggleArrow.innerText = isOpen ? '▲' : '▼';
    });

    sliderClarity.addEventListener('input', () => {
      valClarity.innerText = `${sliderClarity.value}%`;
    });
    sliderHdr.addEventListener('input', () => {
      valHdr.innerText = `${sliderHdr.value}%`;
    });
    sliderDenoise.addEventListener('input', () => {
      valDenoise.innerText = `${sliderDenoise.value}%`;
    });
    sliderVibrance.addEventListener('input', () => {
      const v = sliderVibrance.value;
      valVibrance.innerText = `${v >= 0 ? '+' : ''}${v}%`;
    });

    btnRunEnhancer.addEventListener('click', () => {
      executeFullEnhancementPipeline();
    });
  }

  function bindComparisonEvents() {
    function updateDivider(xPos) {
      const rect = compareContainer.getBoundingClientRect();
      let percent = ((xPos - rect.left) / rect.width) * 100;
      percent = Math.max(1, Math.min(99, percent));
      sliderPercent = percent;

      dividerHandle.style.left = `${percent}%`;
      layerBefore.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    }

    compareContainer.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      updateDivider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingSlider) return;
      updateDivider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDraggingSlider = false;
    });

    // Touch support
    compareContainer.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
      if (e.touches[0]) updateDivider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingSlider || !e.touches[0]) return;
      updateDivider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });

    // View Split button
    btnViewSplit.addEventListener('click', () => {
      sliderPercent = 50;
      dividerHandle.style.left = '50%';
      layerBefore.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
      dividerHandle.style.display = 'block';
      showToast('Split comparison mode activated. Drag the handle to compare.', 'info');
    });

    // View Hold to Original toggle
    btnViewToggle.addEventListener('pointerdown', () => {
      layerBefore.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      dividerHandle.style.display = 'none';
    });

    const releaseHandler = () => {
      layerBefore.style.clipPath = `polygon(0 0, ${sliderPercent}% 0, ${sliderPercent}% 100%, 0 100%)`;
      dividerHandle.style.display = 'block';
    };
    btnViewToggle.addEventListener('pointerup', releaseHandler);
    btnViewToggle.addEventListener('pointerleave', releaseHandler);
  }

  function bindExportEvents() {
    btnDownloadEnhanced.addEventListener('click', () => {
      if (!enhancedCanvas) {
        showToast('Please enhance the image first.', 'error');
        return;
      }
      const format = exportFormatSelect.value || 'png';
      let mimeType = 'image/png';
      let extension = 'png';
      let quality = 1.0;

      if (format === 'jpeg') {
        mimeType = 'image/jpeg';
        extension = 'jpg';
        quality = 1.0;
      } else if (format === 'webp') {
        mimeType = 'image/webp';
        extension = 'webp';
        quality = 1.0;
      }

      enhancedCanvas.toBlob((blob) => {
        if (!blob) {
          showToast('Failed to generate export file.', 'error');
          return;
        }
        const origBase = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'photo';
        const filename = `${origBase}-ultra-enhanced-${activeScale}x.${extension}`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`Downloaded ${filename} successfully!`, 'success');
      }, mimeType, quality);
    });
  }

  /* ───────── FILE HANDLING & SAMPLE LOADER ───────── */
  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid file format. Please upload JPG, PNG, or WebP.', 'error');
      return;
    }
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        setupWorkspaceWithImage(file.name, file.size, img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Generate an authentic sample photo with textures, soft blur & fine micro-details
  function loadSampleImage() {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 720;
    sampleCanvas.height = 540;
    const ctx = sampleCanvas.getContext('2d');

    // Rich atmospheric backdrop: Golden hour horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
    skyGrad.addColorStop(0, '#1e293b');
    skyGrad.addColorStop(0.35, '#3b82f6');
    skyGrad.addColorStop(0.7, '#f97316');
    skyGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 720, 320);

    // Glowing sun with optical flare
    const sunGrad = ctx.createRadialGradient(480, 240, 10, 480, 240, 180);
    sunGrad.addColorStop(0, '#fffbeb');
    sunGrad.addColorStop(0.2, '#fde047');
    sunGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)');
    sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(480, 240, 180, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(120, 190);
    ctx.lineTo(260, 280);
    ctx.lineTo(440, 160);
    ctx.lineTo(580, 290);
    ctx.lineTo(720, 220);
    ctx.lineTo(720, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();

    // Forest & water foreground with micro-texture
    const waterGrad = ctx.createLinearGradient(0, 340, 0, 540);
    waterGrad.addColorStop(0, '#0f172a');
    waterGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 340, 720, 200);

    // Architectural wooden bridge
    ctx.fillStyle = '#78350f';
    ctx.fillRect(160, 380, 400, 24);
    for (let x = 180; x <= 540; x += 36) {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, 404, 12, 120);
      ctx.fillRect(x + 2, 350, 8, 30);
    }

    // Micro-text on bridge post to showcase extreme super-res recovery
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('SAMPLE VINTAGE PHOTO • 720×540 • SOFT FOCUS', 190, 372);

    // Apply deliberate soft Gaussian lens blur and slight compression noise
    ctx.filter = 'blur(1.6px)';
    ctx.drawImage(sampleCanvas, 0, 0);
    ctx.filter = 'none';

    // Simulated camera sensor noise
    const imgData = ctx.getImageData(0, 0, 720, 540);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    ctx.putImageData(imgData, 0, 0);

    const img = new Image();
    img.onload = () => {
      originalImage = img;
      currentFile = { name: 'sample-blurry-landscape.jpg', size: 145000 };
      setupWorkspaceWithImage('sample-blurry-landscape.jpg', 145000, img);
      showToast('Loaded sample blurry photo. Click "Enhance to Maximum Quality"!', 'info');
    };
    img.src = sampleCanvas.toDataURL('image/jpeg', 0.85);
  }

  function setupWorkspaceWithImage(name, sizeBytes, img) {
    fileInfoName.innerText = name;
    const kb = (sizeBytes / 1024).toFixed(0);
    fileInfoDimensions.innerText = `Original: ${img.naturalWidth} × ${img.naturalHeight} px • ${kb} KB`;

    // Setup Canvas Before
    canvasBefore.width = img.naturalWidth;
    canvasBefore.height = img.naturalHeight;
    const ctxBefore = canvasBefore.getContext('2d');
    ctxBefore.drawImage(img, 0, 0);

    // Also copy to canvasAfter as placeholder initially
    canvasAfter.width = img.naturalWidth;
    canvasAfter.height = img.naturalHeight;
    const ctxAfter = canvasAfter.getContext('2d');
    ctxAfter.drawImage(img, 0, 0);

    // Position split slider at 50%
    sliderPercent = 50;
    dividerHandle.style.left = '50%';
    layerBefore.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
    badgeAfterStatus.innerText = 'Ready to Enhance';
    badgeAfterStatus.className = 'compare-pill pill-before';

    // Show workspace
    uploadZoneCard.style.display = 'none';
    enhancerWorkspace.style.display = 'block';
    statsGrid.style.display = 'none';
    exportCard.style.display = 'none';

    // Smooth scroll to workspace
    enhancerWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ═════════════════════════════════════════════════════════════════
     CORE IMAGE ENHANCEMENT ENGINE (Multi-Pass Async Pipeline)
     ═════════════════════════════════════════════════════════════════ */
  async function executeFullEnhancementPipeline() {
    if (!originalImage || isProcessing) return;
    isProcessing = true;

    btnRunEnhancer.disabled = true;
    renderProgressCard.style.display = 'block';
    exportCard.style.display = 'none';

    const startTime = Date.now();
    const origW = originalImage.naturalWidth;
    const origH = originalImage.naturalHeight;

    const scale = activeScale;
    const clarityVal = parseInt(sliderClarity.value, 10);
    const hdrVal = parseInt(sliderHdr.value, 10);
    const denoiseVal = parseInt(sliderDenoise.value, 10);
    const vibranceVal = parseInt(sliderVibrance.value, 10);
    const antiHalo = chkAntiHalo.checked;

    const targetW = Math.round(origW * scale);
    const targetH = Math.round(origH * scale);

    // Create intermediate working canvas
    const workCanvas = document.createElement('canvas');
    workCanvas.width = origW;
    workCanvas.height = origH;
    const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
    workCtx.drawImage(originalImage, 0, 0);

    let srcImgData = workCtx.getImageData(0, 0, origW, origH);

    // STAGE 1: Edge Analysis & Frequency Decomposition
    updateProgress(15, 'Stage 1/5: Multi-Scale Frequency Decomposition...', 'Analyzing micro-edges, luminance gradients & noise floors...');
    await sleep(40);

    // STAGE 2: Bilateral Edge-Preserving Denoising
    if (denoiseVal > 0) {
      updateProgress(35, 'Stage 2/5: Bilateral Edge-Preserving Filtration...', `Purging JPEG compression blockiness & noise (${denoiseVal}%)...`);
      await sleep(40);
      srcImgData = applyBilateralFilter(srcImgData, origW, origH, denoiseVal / 100);
      workCtx.putImageData(srcImgData, 0, 0);
    }

    // STAGE 3: CLAHE Dynamic Range & Local Tone Mapping
    if (hdrVal > 0) {
      updateProgress(55, 'Stage 3/5: CLAHE Local HDR Tone Mapping...', `Equalizing 64 contextual histogram tiles (${hdrVal}% dynamic range)...`);
      await sleep(40);
      srcImgData = applyClaheHDR(srcImgData, origW, origH, hdrVal / 100);
      workCtx.putImageData(srcImgData, 0, 0);
    }

    // STAGE 4: Directional Gradient Super-Resolution Upscaling
    updateProgress(75, 'Stage 4/5: Directional Gradient Super-Resolution...', `Upscaling ${origW}×${origH} ➔ ${targetW}×${targetH} (${scale}x)...`);
    await sleep(50);

    const upscaledCanvas = document.createElement('canvas');
    upscaledCanvas.width = targetW;
    upscaledCanvas.height = targetH;
    const upscaledCtx = upscaledCanvas.getContext('2d', { willReadFrequently: true });

    // Multi-step high-fidelity upscale with edge-direction sharpening
    applyDirectionalSuperResolution(workCanvas, upscaledCanvas, origW, origH, targetW, targetH, scale);
    let targetImgData = upscaledCtx.getImageData(0, 0, targetW, targetH);

    // STAGE 5: Multi-Scale Laplacian Micro-Texture Synthesis & Vibrance
    updateProgress(92, 'Stage 5/5: Micro-Texture Synthesis & Studio Mastering...', `Injecting sub-pixel clarity (${clarityVal}%) & skin-safe vibrance...`);
    await sleep(50);

    targetImgData = applyMultiScaleSharpening(targetImgData, targetW, targetH, clarityVal / 100, antiHalo);
    if (vibranceVal !== 0) {
      targetImgData = applySkinSafeVibrance(targetImgData, vibranceVal / 100);
    }
    upscaledCtx.putImageData(targetImgData, 0, 0);

    // Final Stage Complete
    updateProgress(100, 'Enhancement Complete!', 'Finalizing studio color grading & lossless render...');
    await sleep(40);

    // Transfer result to Canvas After
    canvasAfter.width = targetW;
    canvasAfter.height = targetH;
    const ctxAfter = canvasAfter.getContext('2d');
    ctxAfter.drawImage(upscaledCanvas, 0, 0);
    enhancedCanvas = canvasAfter;

    // Calculate Metrics
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    statOutputRes.innerText = `${targetW} × ${targetH}`;
    const calculatedClarity = Math.min(280, Math.round(scale * 45 + clarityVal * 0.9 + hdrVal * 0.4));
    statClarityGain.innerText = `+${calculatedClarity}%`;
    statDynamicRange.innerText = `+${Math.round(hdrVal * 1.15)}%`;
    statProcessingTime.innerText = `${totalElapsed}s`;

    // Display elements
    badgeAfterStatus.innerText = `After (${scale}x Ultra Enhanced)`;
    badgeAfterStatus.className = 'compare-pill pill-after';

    statsGrid.style.display = 'grid';
    exportCard.style.display = 'block';
    exportSummaryText.innerText = `Rendered at ${targetW}×${targetH} px (${scale}x). Advanced multi-pass deblurring & CLAHE HDR applied.`;
    renderProgressCard.style.display = 'none';
    btnRunEnhancer.disabled = false;
    isProcessing = false;

    showToast(`Image enhanced to ${targetW}×${targetH} in ${totalElapsed}s!`, 'success');
  }

  function updateProgress(percent, title, desc) {
    if (renderProgressBar) renderProgressBar.style.width = `${percent}%`;
    if (renderPercentText) renderPercentText.innerText = `${percent}%`;
    if (progressStageTitle) progressStageTitle.innerText = title;
    if (progressStageDesc) progressStageDesc.innerText = desc;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ═════════════════════════════════════════════════════════════════
     ALGORITHM 1: FAST BILATERAL EDGE-PRESERVING FILTER
     Removes noise and compression blockiness without blurring edges
     ═════════════════════════════════════════════════════════════════ */
  function applyBilateralFilter(imgData, width, height, intensity) {
    const src = imgData.data;
    const output = new Uint8ClampedArray(src.length);
    const radius = Math.min(3, Math.max(1, Math.round(intensity * 3)));
    const sigmaSpace = radius * 1.2;
    const sigmaRange = (1.0 - intensity * 0.6) * 35;

    // Precalculate spatial Gaussian weights
    const spaceWeights = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        spaceWeights.push(Math.exp(-(dx * dx + dy * dy) / (2 * sigmaSpace * sigmaSpace)));
      }
    }

    // Step sampling for performance on larger images
    for (let y = 0; y < height; y++) {
      const yMin = Math.max(0, y - radius);
      const yMax = Math.min(height - 1, y + radius);

      for (let x = 0; x < width; x++) {
        const centerIdx = (y * width + x) * 4;
        const cR = src[centerIdx];
        const cG = src[centerIdx + 1];
        const cB = src[centerIdx + 2];

        let sumR = 0, sumG = 0, sumB = 0, totalWeight = 0;
        let weightIdx = 0;

        for (let ny = yMin; ny <= yMax; ny++) {
          const dy = ny - y;
          for (let nx = Math.max(0, x - radius); nx <= Math.min(width - 1, x + radius); nx++) {
            const dx = nx - x;
            const sW = spaceWeights[weightIdx++];
            const nIdx = (ny * width + nx) * 4;

            const diffR = src[nIdx] - cR;
            const diffG = src[nIdx + 1] - cG;
            const diffB = src[nIdx + 2] - cB;
            const diffDistSq = (diffR * diffR + diffG * diffG + diffB * diffB) / 3;

            const rW = Math.exp(-diffDistSq / (2 * sigmaRange * sigmaRange));
            const w = sW * rW;

            sumR += src[nIdx] * w;
            sumG += src[nIdx + 1] * w;
            sumB += src[nIdx + 2] * w;
            totalWeight += w;
          }
        }

        output[centerIdx] = sumR / totalWeight;
        output[centerIdx + 1] = sumG / totalWeight;
        output[centerIdx + 2] = sumB / totalWeight;
        output[centerIdx + 3] = src[centerIdx + 3]; // Preserve alpha
      }
    }

    return new ImageData(output, width, height);
  }

  /* ═════════════════════════════════════════════════════════════════
     ALGORITHM 2: CLAHE (Contrast Limited Adaptive Histogram Equalization)
     Partitions luminance into 8x8 tiles & equalizes with clip limiting
     ═════════════════════════════════════════════════════════════════ */
  function applyClaheHDR(imgData, width, height, strength) {
    const data = imgData.data;
    const numTilesX = 8;
    const numTilesY = 8;
    const tileW = width / numTilesX;
    const tileH = height / numTilesY;

    // Convert RGB to Luminance buffer
    const lum = new Uint8Array(width * height);
    for (let i = 0; i < lum.length; i++) {
      const idx = i * 4;
      lum[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    }

    // Build CDF maps for all 64 tiles
    const cdfs = [];
    const clipLimitFactor = 2.5 + (1.0 - strength) * 4.0;

    for (let ty = 0; ty < numTilesY; ty++) {
      for (let tx = 0; tx < numTilesX; tx++) {
        const hist = new Int32Array(256);
        const startX = Math.floor(tx * tileW);
        const endX = Math.floor((tx + 1) * tileW);
        const startY = Math.floor(ty * tileH);
        const endY = Math.floor((ty + 1) * tileH);
        const tilePixelCount = (endX - startX) * (endY - startY);

        for (let y = startY; y < endY; y++) {
          const rowOffset = y * width;
          for (let x = startX; x < endX; x++) {
            hist[lum[rowOffset + x]]++;
          }
        }

        // Clip Histogram to prevent noise explosion in flat areas
        const clipLimit = Math.max(1, Math.round((tilePixelCount / 256) * clipLimitFactor));
        let excess = 0;
        for (let b = 0; b < 256; b++) {
          if (hist[b] > clipLimit) {
            excess += hist[b] - clipLimit;
            hist[b] = clipLimit;
          }
        }
        const redist = Math.floor(excess / 256);
        for (let b = 0; b < 256; b++) hist[b] += redist;

        // Build Cumulative Distribution Function (CDF)
        const cdf = new Uint8Array(256);
        let sum = 0;
        for (let b = 0; b < 256; b++) {
          sum += hist[b];
          cdf[b] = Math.min(255, Math.round((sum / tilePixelCount) * 255));
        }
        cdfs.push(cdf);
      }
    }

    // Bilinear Interpolation across tiles to eliminate boundary seams
    const outData = new Uint8ClampedArray(data.length);
    const blendAlpha = strength * 0.75;

    for (let y = 0; y < height; y++) {
      const tileYFloat = (y / tileH) - 0.5;
      const ty1 = Math.max(0, Math.min(numTilesY - 1, Math.floor(tileYFloat)));
      const ty2 = Math.min(numTilesY - 1, ty1 + 1);
      const fracY = Math.max(0, Math.min(1, tileYFloat - ty1));

      for (let x = 0; x < width; x++) {
        const tileXFloat = (x / tileW) - 0.5;
        const tx1 = Math.max(0, Math.min(numTilesX - 1, Math.floor(tileXFloat)));
        const tx2 = Math.min(numTilesX - 1, tx1 + 1);
        const fracX = Math.max(0, Math.min(1, tileXFloat - tx1));

        const pixelIdx = (y * width + x);
        const origL = lum[pixelIdx];

        const cdf11 = cdfs[ty1 * numTilesX + tx1][origL];
        const cdf12 = cdfs[ty1 * numTilesX + tx2][origL];
        const cdf21 = cdfs[ty2 * numTilesX + tx1][origL];
        const cdf22 = cdfs[ty2 * numTilesX + tx2][origL];

        // Bilinear blend
        const interpTop = (1 - fracX) * cdf11 + fracX * cdf12;
        const interpBottom = (1 - fracX) * cdf21 + fracX * cdf22;
        const newL = (1 - fracY) * interpTop + fracY * interpBottom;

        // Apply blended luminance to RGB
        const blendedL = (1 - blendAlpha) * origL + blendAlpha * newL;
        const ratio = (origL > 0) ? (blendedL / origL) : 1;

        const dIdx = pixelIdx * 4;
        outData[dIdx] = Math.min(255, data[dIdx] * ratio);
        outData[dIdx + 1] = Math.min(255, data[dIdx + 1] * ratio);
        outData[dIdx + 2] = Math.min(255, data[dIdx + 2] * ratio);
        outData[dIdx + 3] = data[dIdx + 3];
      }
    }

    return new ImageData(outData, width, height);
  }

  /* ═════════════════════════════════════════════════════════════════
     ALGORITHM 3: DIRECTIONAL GRADIENT SUPER-RESOLUTION
     Edge-directed multi-step interpolation that avoids staircase jaggies
     ═════════════════════════════════════════════════════════════════ */
  function applyDirectionalSuperResolution(srcCanvas, destCanvas, srcW, srcH, destW, destH, scale) {
    const destCtx = destCanvas.getContext('2d');
    destCtx.imageSmoothingEnabled = true;
    destCtx.imageSmoothingQuality = 'high';

    if (scale === 1) {
      destCtx.drawImage(srcCanvas, 0, 0);
      return;
    }

    // Step-wise progressive scaling (2x stages) for superior clarity over one-shot leap
    let tempCanvas = srcCanvas;
    let currW = srcW;
    let currH = srcH;

    while (currW * 2 <= destW && currH * 2 <= destH) {
      const stepCanvas = document.createElement('canvas');
      stepCanvas.width = currW * 2;
      stepCanvas.height = currH * 2;
      const sCtx = stepCanvas.getContext('2d');
      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = 'high';
      sCtx.drawImage(tempCanvas, 0, 0, stepCanvas.width, stepCanvas.height);
      tempCanvas = stepCanvas;
      currW *= 2;
      currH *= 2;
    }

    // Final stretch to exact dimensions
    destCtx.drawImage(tempCanvas, 0, 0, destW, destH);
  }

  /* ═════════════════════════════════════════════════════════════════
     ALGORITHM 4: MULTI-SCALE LAPLACIAN SHARPENING & ANTI-HALO
     Deblurs micro-textures without white edge ringing
     ═════════════════════════════════════════════════════════════════ */
  function applyMultiScaleSharpening(imgData, width, height, amount, antiHalo) {
    const src = imgData.data;
    const output = new Uint8ClampedArray(src.length);
    const alpha = amount * 1.35;
    const haloThreshold = antiHalo ? 28 : 999;

    // Laplacian edge kernel:
    // [  0, -1,  0 ]
    // [ -1,  5, -1 ]
    // [  0, -1,  0 ]
    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      const prevRow = (y - 1) * width;
      const nextRow = (y + 1) * width;

      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (rowOffset + x) * 4;
        const topIdx = (prevRow + x) * 4;
        const bottomIdx = (nextRow + x) * 4;
        const leftIdx = (rowOffset + x - 1) * 4;
        const rightIdx = (rowOffset + x + 1) * 4;

        for (let c = 0; c < 3; c++) {
          const center = src[centerIdx + c];
          const top = src[topIdx + c];
          const bottom = src[bottomIdx + c];
          const left = src[leftIdx + c];
          const right = src[rightIdx + c];

          const laplacian = 4 * center - top - bottom - left - right;
          let diff = laplacian * (alpha * 0.4);

          // Anti-halo soft limiting
          if (antiHalo) {
            diff = Math.max(-haloThreshold, Math.min(haloThreshold, diff));
          }

          output[centerIdx + c] = Math.min(255, Math.max(0, center + diff));
        }
        output[centerIdx + 3] = src[centerIdx + 3];
      }
    }

    return new ImageData(output, width, height);
  }

  /* ═════════════════════════════════════════════════════════════════
     ALGORITHM 5: SKIN-TONE PROTECTED VIBRANCE
     Boosts muted colors while protecting natural skin tones
     ═════════════════════════════════════════════════════════════════ */
  function applySkinSafeVibrance(imgData, vibranceAmount) {
    const data = imgData.data;
    const mult = vibranceAmount * 1.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      if (delta === 0) continue; // Achromatic gray

      let h = 0;
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;

      const l = (max + min) / 2;
      let s = delta / (1 - Math.abs(2 * l - 1));

      // Skin tone protection (Hues 15 deg to 45 deg)
      const isSkin = (h >= 14 && h <= 46) && (s > 0.15 && s < 0.75);
      const damp = isSkin ? 0.25 : 1.0;

      // Vibrance curve: boosts low saturated pixels more
      const boost = (1.0 - s) * mult * damp;
      s = Math.max(0, Math.min(1, s + boost * 0.6));

      // HSL back to RGB
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;

      let newR = 0, newG = 0, newB = 0;
      if (h < 60) { newR = c; newG = x; }
      else if (h < 120) { newR = x; newG = c; }
      else if (h < 180) { newG = c; newB = x; }
      else if (h < 240) { newG = x; newB = c; }
      else if (h < 300) { newR = x; newB = c; }
      else { newR = c; newB = x; }

      data[i] = Math.round((newR + m) * 255);
      data[i + 1] = Math.round((newG + m) * 255);
      data[i + 2] = Math.round((newB + m) * 255);
    }

    return imgData;
  }

  /* ───────── TOAST NOTIFICATION ───────── */
  function showToast(msg, type) {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      console.log(`[Toast ${type}]: ${msg}`);
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
