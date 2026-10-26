/**
 * AllToolsInOne - Multi-Image to Text (OCR) Converter
 * High-accuracy client-side Optical Character Recognition
 * Supports Batch processing, English, Hindi (हिंदी), and Live Text Editing
 */

(function () {
  'use strict';

  // State
  let items = [];
  let activeWorker = null;
  let activeWorkerLang = null;
  let isProcessingBatch = false;

  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const btnBrowse = document.getElementById('btnBrowse');
  const btnPasteClipboard = document.getElementById('btnPasteClipboard');
  const btnSampleDoc = document.getElementById('btnSampleDoc');
  const btnEmptySample = document.getElementById('btnEmptySample');
  const ocrCardsContainer = document.getElementById('ocrCardsContainer');
  const emptyState = document.getElementById('emptyState');
  const batchBar = document.getElementById('batchBar');
  const batchCountBadge = document.getElementById('batchCountBadge');
  const batchStatusText = document.getElementById('batchStatusText');
  const batchProgressWrapper = document.getElementById('batchProgressWrapper');
  const batchProgressBar = document.getElementById('batchProgressBar');
  const btnExtractAll = document.getElementById('btnExtractAll');
  const btnCopyAll = document.getElementById('btnCopyAll');
  const btnDownloadAllTxt = document.getElementById('btnDownloadAllTxt');
  const btnDownloadWord = document.getElementById('btnDownloadWord');
  const btnDownloadZip = document.getElementById('btnDownloadZip');
  const btnClearAll = document.getElementById('btnClearAll');
  const btnToggleFindReplace = document.getElementById('btnToggleFindReplace');
  const findReplaceBar = document.getElementById('findReplaceBar');
  const findInput = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  const btnApplyReplace = document.getElementById('btnApplyReplace');
  const replaceCountMsg = document.getElementById('replaceCountMsg');
  const ocrLanguage = document.getElementById('ocrLanguage');
  const ocrPreprocessMode = document.getElementById('ocrPreprocessMode');
  const ocrDelimiter = document.getElementById('ocrDelimiter');
  const imageModal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const preprocessCanvas = document.getElementById('preprocessCanvas');

  // Initialize
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Browse & Input
    btnBrowse?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', handleFileSelect);

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone?.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt ? Array.from(dt.files) : [];
      if (files.length > 0) {
        handleFiles(files);
      }
    });

    // Paste from clipboard
    btnPasteClipboard?.addEventListener('click', pasteFromClipboard);
    window.addEventListener('paste', handleGlobalPaste);

    // Samples
    btnSampleDoc?.addEventListener('click', loadSampleImages);
    btnEmptySample?.addEventListener('click', loadSampleImages);

    // Batch Actions
    btnExtractAll?.addEventListener('click', extractAllText);
    btnCopyAll?.addEventListener('click', copyAllText);
    btnDownloadAllTxt?.addEventListener('click', downloadAllTxt);
    btnDownloadWord?.addEventListener('click', downloadWordDoc);
    btnDownloadZip?.addEventListener('click', downloadZip);
    btnClearAll?.addEventListener('click', clearAll);

    // Find & Replace
    btnToggleFindReplace?.addEventListener('click', () => {
      if (findReplaceBar) {
        findReplaceBar.style.display = findReplaceBar.style.display === 'none' ? 'block' : 'none';
      }
    });
    btnApplyReplace?.addEventListener('click', applyFindAndReplace);

    // Modal
    modalCloseBtn?.addEventListener('click', closeModal);
    imageModal?.addEventListener('click', (e) => {
      if (e.target === imageModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal?.style.display === 'flex') {
        closeModal();
      }
    });
  }

  // Handle files
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
      fileInput.value = '';
    }
  }

  function handleFiles(files) {
    const validImageFiles = files.filter(f => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast('Please select valid image files (PNG, JPG, WebP, BMP)', 'error');
      return;
    }

    validImageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const item = {
            id: 'ocr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            file: file,
            name: file.name,
            size: file.size,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
            originalDataUrl: dataUrl,
            enhancedDataUrl: null,
            status: 'ready', // 'ready', 'processing', 'done', 'error'
            progress: 0,
            statusText: 'Ready',
            extractedText: '',
            confidence: 0,
            wordsCount: 0,
            charsCount: 0,
            error: null
          };
          items.push(item);
          renderCard(item);
          updateBatchBar();
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  // Clipboard Paste
  async function pasteFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;
      for (const cbItem of clipboardItems) {
        for (const type of cbItem.types) {
          if (type.startsWith('image/')) {
            const blob = await cbItem.getType(type);
            const file = new File([blob], `pasted_image_${Date.now()}.${type.split('/')[1] || 'png'}`, { type });
            handleFiles([file]);
            foundImage = true;
          }
        }
      }
      if (!foundImage) {
        showToast('No image found in clipboard. Use PrintScreen or Copy Image first.', 'error');
      }
    } catch (err) {
      showToast('Clipboard access denied or unsupported. Use Ctrl+V on the page.', 'error');
    }
  }

  function handleGlobalPaste(e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    const itemsList = e.clipboardData ? e.clipboardData.items : [];
    const files = [];
    for (let i = 0; i < itemsList.length; i++) {
      if (itemsList[i].type.indexOf('image') !== -1) {
        const file = itemsList[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      handleFiles(files);
      showToast(`Pasted ${files.length} image(s) from clipboard!`, 'success');
    }
  }

  // Load Sample Images (1 English Document + 1 Hindi Form)
  function loadSampleImages() {
    // Generate Sample 1: English Certificate / Notice
    const c1 = document.createElement('canvas');
    c1.width = 900;
    c1.height = 420;
    const ctx1 = c1.getContext('2d');
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(0, 0, c1.width, c1.height);

    // Decorative header
    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 26px sans-serif';
    ctx1.fillText('GOVERNMENT OF INDIA — STAFF SELECTION COMMISSION', 40, 50);

    ctx1.fillStyle = '#f59e0b';
    ctx1.fillRect(40, 65, 820, 3);

    ctx1.fillStyle = '#1e293b';
    ctx1.font = 'bold 20px sans-serif';
    ctx1.fillText('OFFICIAL NOTICE: Combined Graduate Level Examination (CGL 2026)', 40, 105);

    ctx1.fillStyle = '#334155';
    ctx1.font = '16px sans-serif';
    ctx1.fillText('1. Online Registration Commences: 15-November-2026', 40, 150);
    ctx1.fillText('2. Closing Date for Submission: 15-December-2026 (23:00 Hrs)', 40, 185);
    ctx1.fillText('3. Minimum Age Requirement: 18 Years as on Cutoff Date', 40, 220);
    ctx1.fillText('4. Essential Educational Qualification: Bachelor Degree in Any Stream', 40, 255);
    ctx1.fillText('5. Candidate must upload passport photograph and digital signature.', 40, 290);

    ctx1.fillStyle = '#64748b';
    ctx1.font = 'italic 14px sans-serif';
    ctx1.fillText('For official syllabus and exam centers visit: https://sarkaritools.in', 40, 350);

    c1.toBlob(blob => {
      const file1 = new File([blob], 'Sample_English_Notice.png', { type: 'image/png' });

      // Generate Sample 2: Hindi Sarkari Exam Application Form
      const c2 = document.createElement('canvas');
      c2.width = 900;
      c2.height = 420;
      const ctx2 = c2.getContext('2d');
      ctx2.fillStyle = '#ffffff';
      ctx2.fillRect(0, 0, c2.width, c2.height);

      ctx2.fillStyle = '#0f172a';
      ctx2.font = 'bold 26px sans-serif';
      ctx2.fillText('कर्मचारी चयन आयोग — भारत सरकार (प्रवेश पत्र)', 40, 50);

      ctx2.fillStyle = '#16a34a';
      ctx2.fillRect(40, 65, 820, 3);

      ctx2.fillStyle = '#1e293b';
      ctx2.font = 'bold 20px sans-serif';
      ctx2.fillText('उम्मीदवार विवरण एवं महत्वपूर्ण दिशा-निर्देश 2026', 40, 105);

      ctx2.fillStyle = '#334155';
      ctx2.font = '16px sans-serif';
      ctx2.fillText('१. अभ्यर्थी का नाम: राहुल कुमार शर्मा (Rahul Kumar Sharma)', 40, 150);
      ctx2.fillText('२. अनुक्रमांक / रोल नंबर: 220108945672', 40, 185);
      ctx2.fillText('३. परीक्षा केंद्र: राजकीय इंटर कॉलेज, सिविल लाइंस', 40, 220);
      ctx2.fillText('४. परीक्षा समय: प्रातः 09:30 बजे से 11:30 बजे तक', 40, 255);
      ctx2.fillText('५. आवश्यक दस्तावेज: मूल आधार कार्ड एवं दो पासपोर्ट साइज फोटो अनिवार्य हैं।', 40, 290);

      ctx2.fillStyle = '#dc2626';
      ctx2.font = 'bold 15px sans-serif';
      ctx2.fillText('विशेष सूचना: परीक्षा कक्ष में मोबाइल फोन एवं इलेक्ट्रॉनिक घड़ी पूर्णतः वर्जित है।', 40, 350);

      c2.toBlob(blob2 => {
        const file2 = new File([blob2], 'Sample_Hindi_Form.png', { type: 'image/png' });
        handleFiles([file1, file2]);
        showToast('Loaded English & Hindi sample documents!', 'success');
      }, 'image/png');
    }, 'image/png');
  }

  // Preprocessing Pipeline (Grayscale, Contrast Stretch, Binarization, Sharpening, Upscaling)
  async function preprocessImage(imgUrl, mode) {
    if (mode === 'none') {
      return imgUrl;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        // Upscale small images to guarantee optimal character height (min 30-35px per character)
        const minDim = Math.min(targetWidth, targetHeight);
        let scale = 1;
        if (mode === 'upscale' || minDim < 800) {
          scale = minDim < 500 ? 2.2 : (minDim < 800 ? 1.6 : 1.3);
        }

        targetWidth = Math.round(targetWidth * scale);
        targetHeight = Math.round(targetHeight * scale);

        const canvas = preprocessCanvas || document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;
        const len = data.length;

        // Step 1: Grayscale + Find min/max for contrast stretching
        let minLum = 255;
        let maxLum = 0;
        const lumValues = new Uint8Array(targetWidth * targetHeight);

        for (let i = 0, p = 0; i < len; i += 4, p++) {
          // Standard ITU-R BT.601 luminance
          const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          lumValues[p] = lum;
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        // Contrast Stretch Normalization
        const lumRange = maxLum - minLum || 1;
        for (let p = 0; p < lumValues.length; p++) {
          lumValues[p] = Math.min(255, Math.max(0, Math.round(((lumValues[p] - minLum) / lumRange) * 255)));
        }

        // Step 2: Mode-specific filtering
        if (mode === 'binarize') {
          // Otsu's optimal global thresholding
          const threshold = computeOtsuThreshold(lumValues);
          for (let i = 0, p = 0; i < len; i += 4, p++) {
            const val = lumValues[p] < threshold ? 0 : 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
        } else if (mode === 'photo') {
          // Shadow reduction + adaptive contrast
          for (let i = 0, p = 0; i < len; i += 4, p++) {
            let val = lumValues[p];
            // S-curve contrast boost
            val = val < 128 ? (2 * val * val) / 255 : 255 - (2 * (255 - val) * (255 - val)) / 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
        } else {
          // 'auto' or 'upscale': Grayscale with enhanced contrast & sharpening
          for (let i = 0, p = 0; i < len; i += 4, p++) {
            const val = lumValues[p];
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Optional Step 3: Apply Sharpen Convolution for crisp Hindi matras & English fonts
        if (mode === 'auto' || mode === 'upscale') {
          applySharpenKernel(ctx, targetWidth, targetHeight);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imgUrl;
    });
  }

  // Otsu's Threshold Algorithm
  function computeOtsuThreshold(lumArray) {
    const histogram = new Array(256).fill(0);
    const total = lumArray.length;
    for (let i = 0; i < total; i++) {
      histogram[lumArray[i]]++;
    }

    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histogram[t];

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let varMax = 0;
    let threshold = 128;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const varBetween = wB * wF * (mB - mF) * (mB - mF);

      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }
    return threshold;
  }

  // 3x3 Convolution Sharpening Kernel
  function applySharpenKernel(ctx, w, h) {
    try {
      const src = ctx.getImageData(0, 0, w, h);
      const dst = ctx.createImageData(w, h);
      const s = src.data;
      const d = dst.data;

      // Sharpen kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          const up = ((y - 1) * w + x) * 4;
          const down = ((y + 1) * w + x) * 4;
          const left = (y * w + (x - 1)) * 4;
          const right = (y * w + (x + 1)) * 4;

          const val = 5 * s[idx] - (s[up] + s[down] + s[left] + s[right]);
          const clamped = Math.min(255, Math.max(0, val));
          d[idx] = clamped;
          d[idx + 1] = clamped;
          d[idx + 2] = clamped;
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(dst, 0, 0);
    } catch (e) {
      // Fallback silently if canvas security prevents convolution
    }
  }

  // Get or Initialize Tesseract Worker
  async function getTesseractWorker(lang) {
    if (activeWorker && activeWorkerLang === lang) {
      return activeWorker;
    }

    if (activeWorker) {
      try {
        await activeWorker.terminate();
      } catch (e) {}
      activeWorker = null;
    }

    // Languages: 'eng', 'hin', or 'eng+hin'
    const langArray = lang.includes('+') ? lang.split('+') : [lang];

    activeWorker = await window.Tesseract.createWorker(langArray, 1, {
      logger: (m) => {
        // Broadcast logger messages to currently processing item
        if (window.__currentProcessingItem) {
          const item = window.__currentProcessingItem;
          if (m.status === 'recognizing text') {
            item.progress = Math.round((m.progress || 0) * 100);
            item.statusText = `Recognizing text... ${item.progress}%`;
          } else if (m.status === 'loading language traineddata') {
            item.progress = Math.round((m.progress || 0) * 100);
            item.statusText = `Downloading OCR model... ${item.progress}%`;
          } else if (m.status) {
            item.statusText = m.status;
          }
          updateCardProgress(item);
        }
      }
    });

    activeWorkerLang = lang;
    return activeWorker;
  }

  // Process a single item
  async function processItem(item) {
    if (item.status === 'processing') return;

    item.status = 'processing';
    item.progress = 5;
    item.statusText = 'Enhancing image quality...';
    updateCardProgress(item);

    window.__currentProcessingItem = item;

    try {
      const mode = ocrPreprocessMode ? ocrPreprocessMode.value : 'auto';
      const lang = ocrLanguage ? ocrLanguage.value : 'eng+hin';

      // 1. Run Preprocessing
      const enhancedUrl = await preprocessImage(item.originalDataUrl, mode);
      item.enhancedDataUrl = enhancedUrl;
      item.progress = 20;
      item.statusText = 'Initializing OCR neural net...';
      updateCardProgress(item);

      // 2. Run OCR
      const worker = await getTesseractWorker(lang);
      const ret = await worker.recognize(enhancedUrl);

      // 3. Process Result
      const text = (ret.data.text || '').trim();
      item.extractedText = text;
      item.confidence = Math.round(ret.data.confidence || 0);
      item.status = 'done';
      item.progress = 100;
      item.statusText = `Completed (${item.confidence}% Confidence)`;

      updateCounts(item);
      updateCardFull(item);
    } catch (err) {
      console.error('OCR Error on item', item.name, err);
      item.status = 'error';
      item.statusText = 'Error during extraction';
      item.error = err.message || 'Recognition failed';
      updateCardFull(item);
    } finally {
      window.__currentProcessingItem = null;
    }
  }

  // Extract All (Batch)
  async function extractAllText() {
    if (items.length === 0) {
      showToast('No images to extract. Please add images first.', 'error');
      return;
    }
    if (isProcessingBatch) return;

    isProcessingBatch = true;
    btnExtractAll.disabled = true;
    btnExtractAll.innerText = '⏳ Processing Batch...';

    if (batchProgressWrapper) batchProgressWrapper.style.display = 'block';

    let completed = 0;
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      batchStatusText.innerText = `Processing ${i + 1} of ${total}: ${item.name}`;
      if (batchProgressBar) {
        batchProgressBar.style.width = Math.round((i / total) * 100) + '%';
      }

      await processItem(item);
      completed++;
    }

    if (batchProgressBar) batchProgressBar.style.width = '100%';
    batchStatusText.innerText = `All ${total} images extracted successfully!`;
    showToast(`Batch OCR finished for all ${total} images!`, 'success');

    btnExtractAll.disabled = false;
    btnExtractAll.innerText = '⚡ Extract All Text';
    isProcessingBatch = false;
  }

  // Render individual card
  function renderCard(item) {
    if (emptyState) emptyState.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'ocr-card';
    card.id = `card_${item.id}`;

    card.innerHTML = `
      <div class="ocr-card-header">
        <div class="ocr-card-header-left">
          <img src="${item.originalDataUrl}" class="ocr-thumbnail" id="thumb_${item.id}" alt="Thumbnail" title="Click to view full image">
          <div class="ocr-file-info">
            <div class="ocr-file-name" title="${item.name}">${escapeHtml(item.name)}</div>
            <div class="ocr-file-meta">
              <span>${formatBytes(item.size)}</span>
              <span>•</span>
              <span>${item.dimensions.width} × ${item.dimensions.height} px</span>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="ocr-badge status-ready" id="statusBadge_${item.id}">Ready</span>
          <span class="ocr-badge" id="confBadge_${item.id}" style="display: none;"></span>
          <button type="button" class="btn btn-outline ocr-btn-sm" id="btnDelete_${item.id}" style="color: #dc2626; border-color: #fca5a5;" title="Remove this image">
            ✕
          </button>
        </div>
      </div>

      <!-- Individual Item Progress Bar -->
      <div class="ocr-progress-container" id="cardProgressWrapper_${item.id}" style="display: none; height: 4px; border-radius: 0;">
        <div class="ocr-progress-fill animated" id="cardProgressBar_${item.id}" style="width: 0%;"></div>
      </div>

      <div class="ocr-card-body">
        <textarea class="ocr-textarea" id="textarea_${item.id}" placeholder="Extracted text will appear here. You can edit, type, and format text freely...">${escapeHtml(item.extractedText)}</textarea>
      </div>

      <div class="ocr-card-footer">
        <div class="ocr-counts" id="counts_${item.id}">
          <span>Words: <strong>0</strong></span>
          <span>Chars: <strong>0</strong></span>
        </div>
        <div class="ocr-card-actions">
          <button type="button" class="btn btn-primary ocr-btn-sm" id="btnExtractSingle_${item.id}">
            ⚡ Extract Text
          </button>
          <button type="button" class="btn btn-outline ocr-btn-sm" id="btnCopy_${item.id}">
            📋 Copy
          </button>
          <button type="button" class="btn btn-outline ocr-btn-sm" id="btnDownloadSingle_${item.id}">
            ⬇️ .txt
          </button>
          <button type="button" class="btn btn-outline ocr-btn-sm" id="btnCleanSingle_${item.id}" title="Fix spaces & line breaks">
            🧹 Clean
          </button>
        </div>
      </div>
    `;

    ocrCardsContainer.appendChild(card);
    bindCardEvents(item);
  }

  // Bind Card Events
  function bindCardEvents(item) {
    const card = document.getElementById(`card_${item.id}`);
    if (!card) return;

    // Thumbnail zoom
    const thumb = document.getElementById(`thumb_${item.id}`);
    thumb?.addEventListener('click', () => {
      openModal(item.name, item.enhancedDataUrl || item.originalDataUrl);
    });

    // Textarea live editing
    const textarea = document.getElementById(`textarea_${item.id}`);
    textarea?.addEventListener('input', (e) => {
      item.extractedText = e.target.value;
      updateCounts(item);
    });

    // Extract single
    const btnExtract = document.getElementById(`btnExtractSingle_${item.id}`);
    btnExtract?.addEventListener('click', () => processItem(item));

    // Copy single
    const btnCopy = document.getElementById(`btnCopy_${item.id}`);
    btnCopy?.addEventListener('click', () => {
      const text = item.extractedText;
      if (!text) {
        showToast('No text extracted yet to copy.', 'error');
        return;
      }
      copyToClipboard(text);
      btnCopy.innerText = '✅ Copied!';
      setTimeout(() => { btnCopy.innerText = '📋 Copy'; }, 2000);
    });

    // Download single txt
    const btnDown = document.getElementById(`btnDownloadSingle_${item.id}`);
    btnDown?.addEventListener('click', () => {
      const text = item.extractedText;
      if (!text) {
        showToast('No text to download yet.', 'error');
        return;
      }
      const safeName = item.name.replace(/\.[^/.]+$/, '') + '_extracted.txt';
      downloadFile(safeName, text, 'text/plain;charset=utf-8');
    });

    // Clean formatting
    const btnClean = document.getElementById(`btnCleanSingle_${item.id}`);
    btnClean?.addEventListener('click', () => {
      let t = item.extractedText || '';
      // Clean multiple horizontal spaces
      t = t.replace(/[ \t]+/g, ' ');
      // Clean 3+ consecutive linebreaks into 2
      t = t.replace(/\n{3,}/g, '\n\n');
      // Trim lines
      t = t.split('\n').map(l => l.trim()).join('\n');

      item.extractedText = t;
      if (textarea) textarea.value = t;
      updateCounts(item);
      showToast('Cleaned whitespace and line breaks!', 'success');
    });

    // Delete item
    const btnDel = document.getElementById(`btnDelete_${item.id}`);
    btnDel?.addEventListener('click', () => {
      items = items.filter(x => x.id !== item.id);
      card.remove();
      updateBatchBar();
      if (items.length === 0 && emptyState) {
        emptyState.style.display = 'block';
      }
    });
  }

  // Update Progress on Card
  function updateCardProgress(item) {
    const pWrap = document.getElementById(`cardProgressWrapper_${item.id}`);
    const pBar = document.getElementById(`cardProgressBar_${item.id}`);
    const badge = document.getElementById(`statusBadge_${item.id}`);

    if (pWrap && pBar) {
      if (item.status === 'processing') {
        pWrap.style.display = 'block';
        pBar.style.width = Math.max(5, item.progress) + '%';
      } else {
        pWrap.style.display = 'none';
      }
    }

    if (badge) {
      badge.className = `ocr-badge status-${item.status}`;
      badge.innerText = item.statusText || item.status;
    }
  }

  // Update Complete Card UI
  function updateCardFull(item) {
    updateCardProgress(item);

    const textarea = document.getElementById(`textarea_${item.id}`);
    if (textarea) {
      textarea.value = item.extractedText || '';
    }

    const confBadge = document.getElementById(`confBadge_${item.id}`);
    if (confBadge) {
      if (item.status === 'done' && item.confidence > 0) {
        confBadge.style.display = 'inline-flex';
        let confClass = 'confidence-high';
        if (item.confidence < 70) confClass = 'confidence-low';
        else if (item.confidence < 85) confClass = 'confidence-mid';

        confBadge.className = `ocr-badge ${confClass}`;
        confBadge.innerText = `🎯 ${item.confidence}% Acc.`;
      } else {
        confBadge.style.display = 'none';
      }
    }

    const btnExtract = document.getElementById(`btnExtractSingle_${item.id}`);
    if (btnExtract) {
      if (item.status === 'done') {
        btnExtract.innerText = '🔄 Re-Extract';
        btnExtract.className = 'btn btn-outline ocr-btn-sm';
      } else if (item.status === 'processing') {
        btnExtract.innerText = '⏳ Extracting...';
        btnExtract.disabled = true;
      } else {
        btnExtract.innerText = '⚡ Extract Text';
        btnExtract.disabled = false;
      }
    }

    updateCounts(item);
  }

  // Word & Character Counter
  function updateCounts(item) {
    const text = item.extractedText || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    item.wordsCount = words;
    item.charsCount = chars;

    const countsEl = document.getElementById(`counts_${item.id}`);
    if (countsEl) {
      countsEl.innerHTML = `<span>Words: <strong>${words}</strong></span><span>Chars: <strong>${chars}</strong></span>`;
    }
  }

  // Update Batch Bar UI
  function updateBatchBar() {
    if (!batchBar) return;
    if (items.length === 0) {
      batchBar.style.display = 'none';
      return;
    }
    batchBar.style.display = 'flex';

    const doneCount = items.filter(x => x.status === 'done').length;
    batchCountBadge.innerText = `${items.length} Image${items.length > 1 ? 's' : ''}`;
    batchStatusText.innerText = doneCount > 0 
      ? `${doneCount} of ${items.length} extracted`
      : 'Ready to extract';
  }

  // Combine All Extracted Texts
  function getCombinedText() {
    const delimiter = ocrDelimiter ? ocrDelimiter.value : 'filename';
    const parts = [];

    items.forEach((item, idx) => {
      const text = (item.extractedText || '').trim();
      if (!text) return;

      let header = '';
      if (delimiter === 'filename') {
        header = `\n========================================\n--- File: ${item.name} ---\n========================================\n`;
      } else if (delimiter === 'page') {
        header = `\n[--- Page ${idx + 1} : ${item.name} ---]\n`;
      } else {
        header = `\n\n`;
      }
      parts.push(header + text);
    });

    return parts.join('\n').trim();
  }

  // Batch: Copy All
  function copyAllText() {
    const combined = getCombinedText();
    if (!combined) {
      showToast('No extracted text available yet. Please extract text first.', 'error');
      return;
    }
    copyToClipboard(combined);
    btnCopyAll.innerText = '✅ Copied All!';
    setTimeout(() => { btnCopyAll.innerText = '📋 Copy All'; }, 2000);
    showToast(`Copied text from all ${items.length} images!`, 'success');
  }

  // Batch: Download All TXT
  function downloadAllTxt() {
    const combined = getCombinedText();
    if (!combined) {
      showToast('No extracted text to download. Please extract text first.', 'error');
      return;
    }
    downloadFile(`AllToolsInOne_OCR_Batch_${Date.now()}.txt`, combined, 'text/plain;charset=utf-8');
    showToast('Downloaded combined text file!', 'success');
  }

  // Batch: Download Word Document (.doc)
  function downloadWordDoc() {
    const combined = getCombinedText();
    if (!combined) {
      showToast('No extracted text to download. Please extract text first.', 'error');
      return;
    }

    // Wrap in standard Word HTML format
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Extracted OCR Document</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
          h2 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; }
          pre { font-family: Consolas, monospace; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h2>Extracted Text — AllToolsInOne OCR</h2>
        <pre>${escapeHtml(combined)}</pre>
      </body>
      </html>
    `;

    downloadFile(`AllToolsInOne_OCR_Document_${Date.now()}.doc`, htmlContent, 'application/msword;charset=utf-8');
    showToast('Downloaded Word (.doc) document!', 'success');
  }

  // Batch: Download ZIP of individual files
  async function downloadZip() {
    const doneItems = items.filter(x => (x.extractedText || '').trim());
    if (doneItems.length === 0) {
      showToast('No extracted text to package. Please extract text first.', 'error');
      return;
    }

    if (typeof window.JSZip === 'undefined') {
      showToast('ZIP library loading... Please try again in 2 seconds.', 'error');
      return;
    }

    btnDownloadZip.innerText = '⏳ Zipping...';
    try {
      const zip = new window.JSZip();
      doneItems.forEach((item, idx) => {
        const safeName = item.name.replace(/\.[^/.]+$/, '') + `_extracted.txt`;
        zip.file(safeName, item.extractedText);
      });

      // Add a summary file
      zip.file('_ALL_EXTRACTED_COMBINED.txt', getCombinedText());

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `AllToolsInOne_OCR_Batch_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);

      showToast(`Downloaded ZIP containing ${doneItems.length} text files!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create ZIP: ' + err.message, 'error');
    } finally {
      btnDownloadZip.innerText = '📦 ZIP';
    }
  }

  // Find and Replace in all textareas
  function applyFindAndReplace() {
    const findVal = findInput ? findInput.value : '';
    const replaceVal = replaceInput ? replaceInput.value : '';

    if (!findVal) {
      showToast('Enter text to find.', 'error');
      return;
    }

    let matchCount = 0;
    items.forEach(item => {
      if (item.extractedText && item.extractedText.includes(findVal)) {
        const regex = new RegExp(escapeRegex(findVal), 'g');
        const matches = (item.extractedText.match(regex) || []).length;
        matchCount += matches;
        item.extractedText = item.extractedText.replace(regex, replaceVal);

        const textarea = document.getElementById(`textarea_${item.id}`);
        if (textarea) textarea.value = item.extractedText;
        updateCounts(item);
      }
    });

    if (replaceCountMsg) {
      replaceCountMsg.innerText = `Replaced ${matchCount} occurrence(s) across all cards.`;
    }
    showToast(`Replaced ${matchCount} occurrence(s)!`, 'success');
  }

  // Clear All
  function clearAll() {
    if (items.length === 0) return;
    if (confirm('Are you sure you want to remove all uploaded images and extracted text?')) {
      items = [];
      ocrCardsContainer.innerHTML = '';
      if (emptyState) {
        ocrCardsContainer.appendChild(emptyState);
        emptyState.style.display = 'block';
      }
      updateBatchBar();
      showToast('Cleared all images.', 'info');
    }
  }

  // Modal Functions
  function openModal(title, url) {
    if (!imageModal || !modalImg) return;
    modalImg.src = url;
    if (modalTitle) modalTitle.innerText = title;
    imageModal.style.display = 'flex';
  }

  function closeModal() {
    if (!imageModal) return;
    imageModal.style.display = 'none';
  }

  // Helpers
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function showToast(msg, type = 'info') {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      // Fallback banner
      let toast = document.getElementById('ocrToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ocrToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.color = '#fff';
        toast.style.fontWeight = '600';
        toast.style.fontSize = '14px';
        toast.style.zIndex = '99999';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
      }
      toast.style.background = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : '#3b82f6');
      toast.innerText = msg;
      toast.style.opacity = '1';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, 3000);
    }
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
