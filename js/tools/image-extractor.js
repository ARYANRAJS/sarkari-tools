/* ═══════════════════════════════════════════════════
   AllToolsInOne — Webpage Image Extractor & Downloader v1.0
   Extracts photos, icons, SVGs, and CSS backgrounds from any URL
   Supports single downloads, filtering, and bulk ZIP export
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // State
  let extractedImages = [];
  let currentFilteredList = [];
  let activeTab = 'url'; // 'url' | 'source'
  let activeFormatFilter = 'all';
  let activeSizeFilter = 'all';
  let activeSortOrder = 'original';
  let searchQuery = '';

  // DOM Elements - Mode Switcher
  const extractTabs = document.getElementById('extractTabs');
  const modeUrlSection = document.getElementById('modeUrlSection');
  const modeSourceSection = document.getElementById('modeSourceSection');

  // Input Elements
  const inpTargetUrl = document.getElementById('inpTargetUrl');
  const btnExtractUrl = document.getElementById('btnExtractUrl');
  const inpSourceBaseUrl = document.getElementById('inpSourceBaseUrl');
  const txtSourceHtml = document.getElementById('txtSourceHtml');
  const btnExtractSource = document.getElementById('btnExtractSource');

  // Option Checkboxes
  const chkImgTags = document.getElementById('chkImgTags');
  const chkSvgTags = document.getElementById('chkSvgTags');
  const chkBgImages = document.getElementById('chkBgImages');
  const chkMetaImages = document.getElementById('chkMetaImages');
  const chkLinkedImages = document.getElementById('chkLinkedImages');

  // Status & Progress
  const loadingStatusWrap = document.getElementById('loadingStatusWrap');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingSubtitle = document.getElementById('loadingSubtitle');

  // Results & Filters
  const resultsWorkspace = document.getElementById('resultsWorkspace');
  const statTotalImages = document.getElementById('statTotalImages');
  const statShowingImages = document.getElementById('statShowingImages');
  const statSelectedImages = document.getElementById('statSelectedImages');
  const inpSearchFilter = document.getElementById('inpSearchFilter');
  const formatChipBar = document.getElementById('formatChipBar');
  const selSizeFilter = document.getElementById('selSizeFilter');
  const selSortOrder = document.getElementById('selSortOrder');
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmptyNotice = document.getElementById('galleryEmptyNotice');

  // Bulk Actions
  const btnSelectAll = document.getElementById('btnSelectAll');
  const btnDeselectAll = document.getElementById('btnDeselectAll');
  const btnDownloadSelected = document.getElementById('btnDownloadSelected');
  const btnDownloadAllZip = document.getElementById('btnDownloadAllZip');
  const btnSelectedCount = document.getElementById('btnSelectedCount');
  const btnAllZipCount = document.getElementById('btnAllZipCount');
  const zipProgressBox = document.getElementById('zipProgressBox');
  const zipProgressMsg = document.getElementById('zipProgressMsg');
  const zipProgressPct = document.getElementById('zipProgressPct');
  const zipProgressBarFill = document.getElementById('zipProgressBarFill');

  // Initialize
  function init() {
    setupTabSwitching();
    setupEventListeners();
  }

  // 1. Tab Switching (URL vs Source)
  function setupTabSwitching() {
    extractTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool-tab');
      if (!btn) return;
      document.querySelectorAll('#extractTabs .tool-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeTab = btn.getAttribute('data-mode');
      if (activeTab === 'url') {
        modeUrlSection.style.display = 'block';
        modeSourceSection.style.display = 'none';
      } else {
        modeUrlSection.style.display = 'none';
        modeSourceSection.style.display = 'block';
      }
    });

    // Sample URLs
    document.querySelectorAll('.sample-url-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        if (inpTargetUrl) {
          inpTargetUrl.value = url;
          btnExtractUrl?.click();
        }
      });
    });
  }

  // 2. Event Listeners
  function setupEventListeners() {
    btnExtractUrl?.addEventListener('click', handleExtractUrl);
    inpTargetUrl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleExtractUrl();
    });

    btnExtractSource?.addEventListener('click', handleExtractSource);

    // Filter Chips
    formatChipBar?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip-btn');
      if (!chip) return;
      document.querySelectorAll('#formatChipBar .filter-chip-btn').forEach(b => b.classList.remove('active'));
      chip.classList.add('active');
      activeFormatFilter = chip.getAttribute('data-fmt');
      applyFiltersAndRender();
    });

    // Size Filter
    selSizeFilter?.addEventListener('change', () => {
      activeSizeFilter = selSizeFilter.value;
      applyFiltersAndRender();
    });

    // Sort Order
    selSortOrder?.addEventListener('change', () => {
      activeSortOrder = selSortOrder.value;
      applyFiltersAndRender();
    });

    // Search Query
    inpSearchFilter?.addEventListener('input', () => {
      searchQuery = inpSearchFilter.value.trim().toLowerCase();
      applyFiltersAndRender();
    });

    // Select / Deselect All
    btnSelectAll?.addEventListener('click', () => {
      currentFilteredList.forEach(item => item.selected = true);
      updateSelectionCounts();
      renderGalleryCards();
    });

    btnDeselectAll?.addEventListener('click', () => {
      extractedImages.forEach(item => item.selected = false);
      updateSelectionCounts();
      renderGalleryCards();
    });

    // Download Actions
    btnDownloadSelected?.addEventListener('click', handleDownloadSelected);
    btnDownloadAllZip?.addEventListener('click', handleDownloadAllZip);
  }

  // 3. Extract from Live URL
  async function handleExtractUrl() {
    let rawUrl = (inpTargetUrl?.value || '').trim();
    if (!rawUrl) {
      window.showToast?.('Please enter a valid website URL', 'warning');
      inpTargetUrl?.focus();
      return;
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
      inpTargetUrl.value = rawUrl;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch (e) {
      window.showToast?.('Invalid URL format. Please include domain (e.g. example.com)', 'warning');
      return;
    }

    showLoading(true, `Extracting images from ${parsedUrl.hostname}...`, 'Connecting through high-speed proxy cascade...');
    btnExtractUrl.disabled = true;

    try {
      const html = await fetchSiteHtml(rawUrl);
      parseAndExtract(html, rawUrl);
      showLoading(false);
      btnExtractUrl.disabled = false;
    } catch (err) {
      showLoading(false);
      btnExtractUrl.disabled = false;
      console.error('Image extraction error:', err);
      window.showToast?.('Could not scan website directly. Please copy & paste page HTML in Tab 2!', 'warning', 5000);
      
      // Auto-populate base URL in tab 2 for convenience
      if (inpSourceBaseUrl) inpSourceBaseUrl.value = rawUrl;
    }
  }

  // 4. Extract from Pasted Source HTML
  function handleExtractSource() {
    const rawHtml = (txtSourceHtml?.value || '').trim();
    if (!rawHtml) {
      window.showToast?.('Please paste webpage HTML source in the box', 'warning');
      txtSourceHtml?.focus();
      return;
    }

    let baseUrl = (inpSourceBaseUrl?.value || '').trim();
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    showLoading(true, 'Parsing pasted HTML source...', 'Extracting image paths, attributes, and SVG tags...');
    setTimeout(() => {
      parseAndExtract(rawHtml, baseUrl || 'https://example.com');
      showLoading(false);
    }, 50);
  }

  // Multi-Proxy Fetch Cascade
  async function fetchSiteHtml(targetUrl) {
    // Attempt 1: Jina AI Reader HTML Proxy
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
        headers: { 'X-Return-Format': 'html' },
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) return text;
      }
    } catch (e) {
      console.warn('Proxy 1 (Jina) failed:', e);
    }

    // Attempt 2: CodeTabs Proxy
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) return text;
      }
    } catch (e) {
      console.warn('Proxy 2 (CodeTabs) failed:', e);
    }

    // Attempt 3: AllOrigins Raw
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) return text;
      }
    } catch (e) {
      console.warn('Proxy 3 (AllOrigins Raw) failed:', e);
    }

    // Attempt 4: AllOrigins JSON API
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents && data.contents.length > 200) {
          return data.contents;
        }
      }
    } catch (e) {
      console.warn('Proxy 4 (AllOrigins JSON) failed:', e);
    }

    throw new Error('All CORS proxies failed. Site may have strict anti-scraping bot protection.');
  }

  // 5. HTML Parser & Normalizer
  function parseAndExtract(htmlString, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const allowImg = chkImgTags ? chkImgTags.checked : true;
    const allowSvg = chkSvgTags ? chkSvgTags.checked : true;
    const allowBg = chkBgImages ? chkBgImages.checked : true;
    const allowMeta = chkMetaImages ? chkMetaImages.checked : true;
    const allowLinked = chkLinkedImages ? chkLinkedImages.checked : true;

    const foundSet = new Set();
    const imageList = [];

    function addImage(url, sourceType, metaLabel = '') {
      if (!url) return;
      const clean = resolveUrl(url, baseUrl);
      if (!clean || clean.length < 5) return;
      if (foundSet.has(clean)) return; // Deduplicate
      foundSet.add(clean);

      const type = detectImageType(clean);
      const filename = generateCleanFilename(clean, imageList.length, type);

      const item = {
        id: 'img_' + imageList.length,
        url: clean,
        type: type,
        filename: filename,
        sourceType: sourceType,
        metaLabel: metaLabel,
        width: 0,
        height: 0,
        selected: false,
        index: imageList.length
      };

      imageList.push(item);

      // Probe natural dimensions in background
      probeDimensions(item);
    }

    // 1. Standard <img> and <picture>
    if (allowImg) {
      doc.querySelectorAll('img').forEach(img => {
        // Direct src
        const src = img.getAttribute('src');
        if (src) addImage(src, 'img');

        // Lazy loading attributes common in modern CMS
        ['data-src', 'data-original', 'data-lazy-src', 'data-srcset', 'data-full'].forEach(attr => {
          const val = img.getAttribute(attr);
          if (val) parseSrcsetOrUrl(val, (u) => addImage(u, 'img'));
        });

        // Srcset
        const srcset = img.getAttribute('srcset');
        if (srcset) parseSrcsetOrUrl(srcset, (u) => addImage(u, 'img'));
      });

      // Picture sources
      doc.querySelectorAll('picture source').forEach(source => {
        const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
        if (srcset) parseSrcsetOrUrl(srcset, (u) => addImage(u, 'img'));
      });
    }

    // 2. SVG Vectors
    if (allowSvg) {
      // Find inline <svg>
      doc.querySelectorAll('svg').forEach((svg, idx) => {
        try {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svg);
          // Ensure xmlns attribute
          if (!svgString.includes('xmlns=')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
          addImage(svgDataUrl, 'svg', `Vector #${idx + 1}`);
        } catch (e) {}
      });
    }

    // 3. CSS Background Images
    if (allowBg) {
      const bgRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;

      // Inline styles
      doc.querySelectorAll('[style*="background"], [style*="url"]').forEach(el => {
        const style = el.getAttribute('style') || '';
        let match;
        while ((match = bgRegex.exec(style)) !== null) {
          if (match[1]) addImage(match[1], 'bg');
        }
      });

      // Internal <style> tags
      doc.querySelectorAll('style').forEach(styleTag => {
        const text = styleTag.textContent || '';
        let match;
        while ((match = bgRegex.exec(text)) !== null) {
          if (match[1] && !match[1].startsWith('#')) addImage(match[1], 'bg');
        }
      });
    }

    // 4. Social & Meta tags
    if (allowMeta) {
      const metaSelectors = [
        'meta[property="og:image"]',
        'meta[property="og:image:url"]',
        'meta[name="twitter:image"]',
        'meta[name="twitter:image:src"]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]'
      ];
      doc.querySelectorAll(metaSelectors.join(',')).forEach(meta => {
        const content = meta.getAttribute('content') || meta.getAttribute('href');
        if (content) addImage(content, 'meta', meta.getAttribute('property') || meta.getAttribute('name') || 'Meta/Icon');
      });
    }

    // 5. Linked Images (<a href="...jpg">)
    if (allowLinked) {
      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.match(/\.(jpe?g|png|webp|gif|svg|avif|bmp)(\?.*)?$/i)) {
          addImage(href, 'link');
        }
      });
    }

    extractedImages = imageList;

    if (extractedImages.length === 0) {
      window.showToast?.('No images found on this page. Check extraction options or try another URL.', 'warning');
      if (resultsWorkspace) resultsWorkspace.style.display = 'none';
      return;
    }

    // Show workspace
    if (resultsWorkspace) resultsWorkspace.style.display = 'block';
    resultsWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.showToast?.(`🎉 Extracted ${extractedImages.length} images successfully!`, 'success');

    // Reset filters
    activeFormatFilter = 'all';
    activeSizeFilter = 'all';
    searchQuery = '';
    if (inpSearchFilter) inpSearchFilter.value = '';
    document.querySelectorAll('#formatChipBar .filter-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-fmt') === 'all'));

    applyFiltersAndRender();
  }

  // URL Helpers
  function resolveUrl(src, base) {
    if (!src) return null;
    src = src.trim();
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;
    if (src.startsWith('//')) return 'https:' + src;

    try {
      return new URL(src, base).href;
    } catch (e) {
      return null;
    }
  }

  function parseSrcsetOrUrl(str, callback) {
    if (!str) return;
    if (str.includes(',')) {
      str.split(',').forEach(part => {
        const trimmed = part.trim().split(/\s+/)[0];
        if (trimmed) callback(trimmed);
      });
    } else {
      callback(str.trim().split(/\s+/)[0]);
    }
  }

  function detectImageType(url) {
    const lower = url.toLowerCase();
    if (lower.startsWith('data:image/svg') || lower.includes('.svg')) return 'SVG';
    if (lower.startsWith('data:image/png') || lower.includes('.png')) return 'PNG';
    if (lower.startsWith('data:image/webp') || lower.includes('.webp')) return 'WEBP';
    if (lower.startsWith('data:image/gif') || lower.includes('.gif')) return 'GIF';
    if (lower.startsWith('data:image/avif') || lower.includes('.avif')) return 'AVIF';
    if (lower.startsWith('data:image/jpeg') || lower.includes('.jpg') || lower.includes('.jpeg')) return 'JPG';
    return 'IMG';
  }

  function generateCleanFilename(url, index, ext) {
    if (url.startsWith('data:image/svg')) return `vector_${index + 1}.svg`;
    if (url.startsWith('data:image/')) return `image_${index + 1}.${ext.toLowerCase()}`;

    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const base = pathname.substring(pathname.lastIndexOf('/') + 1).split('?')[0];
      if (base && base.includes('.')) {
        return base.replace(/[^a-zA-Z0-9._-]/g, '_');
      }
    } catch (e) {}

    return `image_${index + 1}.${ext.toLowerCase()}`;
  }

  // Background Dimension Prober
  function probeDimensions(item) {
    const probe = new Image();
    probe.onload = () => {
      item.width = probe.naturalWidth || 0;
      item.height = probe.naturalHeight || 0;

      // Update badge if card already in DOM
      const cardDim = document.getElementById(`dim_${item.id}`);
      if (cardDim && item.width > 0) {
        cardDim.textContent = `${item.width} × ${item.height}`;
      }
    };
    probe.onerror = () => {
      // SVG or blocked image
      const cardDim = document.getElementById(`dim_${item.id}`);
      if (cardDim && item.type === 'SVG') {
        cardDim.textContent = 'Vector SVG';
      }
    };
    probe.src = item.url;
  }

  // 6. Filtering & Sorting Engine
  function applyFiltersAndRender() {
    let list = [...extractedImages];

    // Format filter
    if (activeFormatFilter !== 'all') {
      list = list.filter(item => item.type.toLowerCase() === activeFormatFilter);
    }

    // Size filter
    if (activeSizeFilter === 'large') {
      list = list.filter(item => (item.width >= 800 || item.height >= 800));
    } else if (activeSizeFilter === 'medium') {
      list = list.filter(item => (item.width >= 200 || item.height >= 200) && item.width < 800 && item.height < 800);
    } else if (activeSizeFilter === 'small') {
      list = list.filter(item => item.width > 0 && item.width < 200 && item.height < 200);
    }

    // Search query filter
    if (searchQuery) {
      list = list.filter(item => {
        return item.filename.toLowerCase().includes(searchQuery) || item.url.toLowerCase().includes(searchQuery);
      });
    }

    // Sort order
    if (activeSortOrder === 'largest') {
      list.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    } else if (activeSortOrder === 'smallest') {
      list.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    } else if (activeSortOrder === 'type') {
      list.sort((a, b) => a.type.localeCompare(b.type));
    } else {
      list.sort((a, b) => a.index - b.index);
    }

    currentFilteredList = list;
    updateSelectionCounts();
    renderGalleryCards();
  }

  function updateSelectionCounts() {
    const totalCount = extractedImages.length;
    const showingCount = currentFilteredList.length;
    const selectedCount = extractedImages.filter(i => i.selected).length;

    if (statTotalImages) statTotalImages.textContent = totalCount;
    if (statShowingImages) statShowingImages.textContent = showingCount;
    if (statSelectedImages) statSelectedImages.textContent = selectedCount;

    if (btnSelectedCount) btnSelectedCount.textContent = selectedCount;
    if (btnAllZipCount) btnAllZipCount.textContent = totalCount;
  }

  // 7. Render Gallery Cards
  function renderGalleryCards() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    if (currentFilteredList.length === 0) {
      if (galleryEmptyNotice) galleryEmptyNotice.style.display = 'block';
      return;
    }
    if (galleryEmptyNotice) galleryEmptyNotice.style.display = 'none';

    const frag = document.createDocumentFragment();

    currentFilteredList.forEach(item => {
      const card = document.createElement('div');
      card.className = `img-card ${item.selected ? 'selected' : ''}`;
      card.id = `card_${item.id}`;

      const dimText = item.width > 0 ? `${item.width} × ${item.height}` : (item.type === 'SVG' ? 'Vector SVG' : 'Probing...');

      card.innerHTML = `
        <input type="checkbox" class="img-card-checkbox" data-id="${item.id}" ${item.selected ? 'checked' : ''} title="Select for download">
        <span class="img-card-badge">${item.type}</span>
        <div class="img-preview-box checkerboard-bg">
          <img src="${item.url}" alt="${item.filename}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2394a3b8\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg>';">
          <span class="img-dim-badge" id="dim_${item.id}">${dimText}</span>
        </div>
        <div class="img-card-info">
          <div class="img-card-name" title="${item.filename}">${item.filename}</div>
          <div class="img-card-actions">
            <button type="button" class="img-btn-sm img-btn-primary btn-dl-single" data-id="${item.id}" title="Download this image">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Save
            </button>
            <button type="button" class="img-btn-sm btn-copy-single" data-url="${item.url}" title="Copy Image URL">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              URL
            </button>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="img-btn-sm" title="Open Full in New Tab">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;

      // Checkbox event
      const chk = card.querySelector('.img-card-checkbox');
      chk?.addEventListener('change', (e) => {
        item.selected = e.target.checked;
        card.classList.toggle('selected', item.selected);
        updateSelectionCounts();
      });

      // Single Download
      const dlBtn = card.querySelector('.btn-dl-single');
      dlBtn?.addEventListener('click', () => downloadSingleImage(item));

      // Copy URL
      const copyBtn = card.querySelector('.btn-copy-single');
      copyBtn?.addEventListener('click', () => copyImageUrl(item.url));

      frag.appendChild(card);
    });

    galleryGrid.appendChild(frag);
  }

  // 8. Single Image Downloader (CORS-safe)
  async function downloadSingleImage(item) {
    window.showToast?.(`Downloading ${item.filename}...`, 'info', 2000);

    // 1. Data URLs
    if (item.url.startsWith('data:')) {
      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        window.downloadFile?.(blob, item.filename);
        window.showToast?.(`Saved ${item.filename}!`, 'success');
        return;
      } catch (e) {}
    }

    // 2. Direct CORS Fetch
    try {
      const res = await fetch(item.url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        window.downloadFile?.(blob, item.filename);
        window.showToast?.(`Saved ${item.filename}!`, 'success');
        return;
      }
    } catch (e) {}

    // 3. Proxy Fetch fallback
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(item.url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        window.downloadFile?.(blob, item.filename);
        window.showToast?.(`Saved ${item.filename}!`, 'success');
        return;
      }
    } catch (e) {}

    // 4. Anchor click fallback (navigates or triggers browser download)
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.showToast?.('Download opened in browser tab!', 'info');
  }

  // 9. Download Selected as ZIP or Sequence
  async function handleDownloadSelected() {
    const selected = extractedImages.filter(i => i.selected);
    if (selected.length === 0) {
      window.showToast?.('Please check at least 1 image to download, or use "Download All as ZIP"', 'warning');
      return;
    }
    await packageZip(selected, `selected_images_${selected.length}.zip`);
  }

  // 10. Download All as ZIP
  async function handleDownloadAllZip() {
    if (extractedImages.length === 0) {
      window.showToast?.('No images to download', 'warning');
      return;
    }
    await packageZip(extractedImages, `all_images_${extractedImages.length}.zip`);
  }

  // ZIP Packaging Helper using JSZip
  async function packageZip(itemsList, zipFilename) {
    if (typeof window.JSZip === 'undefined') {
      window.showToast?.('JSZip library is loading, please try again in a second', 'info');
      return;
    }

    if (zipProgressBox) zipProgressBox.style.display = 'block';
    if (btnDownloadAllZip) btnDownloadAllZip.disabled = true;
    if (btnDownloadSelected) btnDownloadSelected.disabled = true;

    const zip = new window.JSZip();
    const total = itemsList.length;
    let completed = 0;

    updateZipProgress(0, `Starting ZIP packaging for ${total} images...`);

    // Process in batches of 4
    const BATCH_SIZE = 4;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = itemsList.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (item, batchIdx) => {
        try {
          const blob = await fetchImageBlob(item.url);
          if (blob) {
            const safeName = sanitizeZipName(item.filename, i + batchIdx);
            zip.file(safeName, blob);
          }
        } catch (err) {
          console.warn(`Could not add image ${item.url} to ZIP:`, err);
        } finally {
          completed++;
          const pct = Math.round((completed / total) * 85);
          updateZipProgress(pct, `Fetched ${completed} of ${total} images...`);
        }
      }));
    }

    updateZipProgress(90, 'Compressing archive into ZIP...');

    try {
      const zipContent = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      updateZipProgress(100, 'Complete! Downloading ZIP...');
      window.downloadFile?.(zipContent, zipFilename);
      window.showToast?.(`Downloaded ${zipFilename} successfully!`, 'success');
    } catch (e) {
      console.error('ZIP generation error:', e);
      window.showToast?.('Failed to create ZIP file. Try downloading individually.', 'error');
    } finally {
      setTimeout(() => {
        if (zipProgressBox) zipProgressBox.style.display = 'none';
        if (btnDownloadAllZip) btnDownloadAllZip.disabled = false;
        if (btnDownloadSelected) btnDownloadSelected.disabled = false;
      }, 1500);
    }
  }

  async function fetchImageBlob(url) {
    if (url.startsWith('data:')) {
      const res = await fetch(url);
      return await res.blob();
    }

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) return await res.blob();
    } catch (e) {}

    // Proxy fallback
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) return await res.blob();
    } catch (e) {}

    return null;
  }

  function sanitizeZipName(name, index) {
    let clean = (name || '').replace(/[\\/:*?"<>|]/g, '_');
    if (!clean || clean.length < 3) clean = `image_${index + 1}.jpg`;
    return clean;
  }

  function updateZipProgress(pct, msg) {
    if (zipProgressPct) zipProgressPct.textContent = `${pct}%`;
    if (zipProgressMsg) zipProgressMsg.textContent = msg;
    if (zipProgressBarFill) zipProgressBarFill.style.width = `${pct}%`;
  }

  // Copy URL Helper
  function copyImageUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        window.showToast?.('Copied image URL to clipboard!', 'success');
      }).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      window.showToast?.('Copied image URL to clipboard!', 'success');
    } catch (e) {
      window.showToast?.('Could not copy link to clipboard', 'warning');
    }
    document.body.removeChild(ta);
  }

  // Loading Indicator
  function showLoading(show, title = '', subtitle = '') {
    if (!loadingStatusWrap) return;
    if (show) {
      if (loadingTitle) loadingTitle.textContent = title;
      if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
      loadingStatusWrap.style.display = 'block';
    } else {
      loadingStatusWrap.style.display = 'none';
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
