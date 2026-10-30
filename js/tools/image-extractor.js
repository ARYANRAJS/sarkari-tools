/* ═══════════════════════════════════════════════════
   AllToolsInOne — Webpage Image Extractor & HD Downloader v1.1
   Extracts photos, icons, SVGs, and CSS backgrounds from any URL
   Supports Max Source HD (CDN un-stripping), 2x/4x Super-Resolution Upscaling,
   and Bulk HD ZIP export
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
  let activeHdQuality = 1; // 1 (Original HD) | 2 (2x Upscale) | 4 (4x Ultra HD)
  let autoUnstripHd = true;
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

  // HD Engine Elements
  const hdQualityToggle = document.getElementById('hdQualityToggle');
  const chkAutoUnstripHd = document.getElementById('chkAutoUnstripHd');

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

    // HD Quality Selector (1x, 2x, 4x)
    hdQualityToggle?.addEventListener('click', (e) => {
      const btn = e.target.closest('.quality-toggle-btn');
      if (!btn) return;
      document.querySelectorAll('#hdQualityToggle .quality-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeHdQuality = parseInt(btn.getAttribute('data-quality'), 10) || 1;
      
      const label = activeHdQuality === 1 ? 'Max Source HD' : (activeHdQuality === 2 ? '⚡ 2x HD Upscale' : '🔥 4x Ultra HD');
      window.showToast?.(`HD Mode set to: ${label}`, 'info', 2000);
      renderGalleryCards(); // updates card button texts
    });

    chkAutoUnstripHd?.addEventListener('change', (e) => {
      autoUnstripHd = e.target.checked;
    });

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

    // Top Bar Quick Actions
    const btnQuickSelectAll = document.getElementById('btnQuickSelectAll');
    btnQuickSelectAll?.addEventListener('click', () => btnSelectAll?.click());

    const btnQuickDownloadZip = document.getElementById('btnQuickDownloadZip');
    btnQuickDownloadZip?.addEventListener('click', () => btnDownloadAllZip?.click());
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

    // Fast-path: Direct image URL pasted
    if (/\.(jpe?g|png|webp|gif|svg|bmp|avif)(\?.*)?$/i.test(rawUrl)) {
      showLoading(true, 'Direct image detected...', 'Loading HD original...');
      setTimeout(() => {
        parseAndExtract(`<img src="${rawUrl}">`, rawUrl);
        showLoading(false);
        btnExtractUrl.disabled = false;
        window.showToast?.('Direct image loaded in HD!', 'success');
      }, 50);
      return;
    }

    showLoading(true, `Extracting HD images from ${parsedUrl.hostname}...`, 'Connecting through high-speed proxy cascade...');
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

    showLoading(true, 'Parsing pasted HTML source...', 'Extracting high-resolution image paths, attributes, and SVG tags...');
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

  // 5. Intelligent CDN Un-stripping: Transforms Thumbnails into Raw 4K/HD Source
  function getHdUrl(url) {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
    let hd = url;

    try {
      // A. Wikipedia / Wikimedia Commons Raw Original (often 4000x3000px)
      // Pattern: /wikipedia/commons/thumb/a/ab/File.jpg/300px-File.jpg -> /wikipedia/commons/a/ab/File.jpg
      if (hd.includes('upload.wikimedia.org') && hd.includes('/thumb/')) {
        hd = hd.replace(/\/thumb\//, '/');
        hd = hd.replace(/\/[^/]+px-[^/]+$/, '');
      }

      // B. WordPress / Jetpack / WooCommerce Uncropped Raw
      // Pattern: /photo-300x200.jpg -> /photo.jpg
      if (hd.match(/-[0-9]{2,4}x[0-9]{2,4}\.(jpe?g|png|webp)/i)) {
        hd = hd.replace(/-[0-9]{2,4}x[0-9]{2,4}(\.(jpe?g|png|webp))/i, '$1');
        hd = hd.replace(/[?&](resize|fit|w|h)=[0-9%C,]+/g, '');
      }

      // C. Shopify Master Resolution
      // Pattern: shoe_small.jpg -> shoe_master.jpg
      if (hd.includes('cdn.shopify.com')) {
        hd = hd.replace(/_(small|compact|medium|large|grande|pico|thumb|100x100|200x200|300x300|400x400|600x600|1024x1024)\./g, '_master.');
      }

      // D. YouTube Thumbnails (Upgrade to 1080p Full HD)
      if (hd.includes('img.youtube.com') || hd.includes('i.ytimg.com')) {
        hd = hd.replace(/\/(default|hqdefault|mqdefault|sddefault)\.jpg/g, '/maxresdefault.jpg');
      }

      // E. Unsplash High-Res (Upgrade to 2.5K Studio Resolution)
      if (hd.includes('images.unsplash.com')) {
        hd = hd.replace(/[?&]w=[0-9]+/g, '&w=2560').replace(/[?&]q=[0-9]+/g, '&q=100');
        if (!hd.includes('w=2560')) hd += (hd.includes('?') ? '&' : '?') + 'w=2560&q=100';
      }

      // F. Amazon E-commerce Studio Shots (Upgrade to SL1500)
      if (hd.includes('images-na.ssl-images-amazon.com') || hd.includes('m.media-amazon.com')) {
        hd = hd.replace(/\._[A-Z0-9,._-]+_\./, '._SL1500_.');
      }

      // G. Twitter / X Original Image
      if (hd.includes('pbs.twimg.com')) {
        hd = hd.replace(/[?&]name=[a-z0-9_]+/g, '&name=orig');
        if (!hd.includes('name=')) hd += (hd.includes('?') ? '&' : '?') + 'name=orig';
      }

      // H. Cloudinary / ImageKit / imgix thumbnail un-cropping
      if (hd.includes('cloudinary.com') || hd.includes('imagekit.io')) {
        hd = hd.replace(/\/c_thumb,w_[0-9]+,h_[0-9]+/, '');
        hd = hd.replace(/\/tr:w-[0-9]+,h-[0-9]+/, '');
      }

      // I. Pinterest Master Originals (236x / 474x / 564x / 736x -> originals)
      if (hd.includes('pinimg.com')) {
        hd = hd.replace(/\/(236x|474x|564x|600x|736x)\//, '/originals/');
      }
    } catch (e) {
      console.warn('Error upgrading HD url:', e);
    }

    return hd;
  }

  // 6. HTML Parser & Normalizer
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

    function addImage(url, sourceType, metaLabel = '', preferredHdUrl = null) {
      if (!url) return;
      const clean = resolveUrl(url, baseUrl);
      if (!clean || clean.length < 5) return;
      if (foundSet.has(clean)) return; // Deduplicate
      foundSet.add(clean);

      // Determine HD URL
      let candidateHd = preferredHdUrl ? resolveUrl(preferredHdUrl, baseUrl) : null;
      if (!candidateHd && autoUnstripHd) {
        candidateHd = getHdUrl(clean);
      }
      const finalHdUrl = candidateHd || clean;
      const isHdUpgraded = finalHdUrl !== clean;

      const type = detectImageType(clean);
      const filename = generateCleanFilename(finalHdUrl || clean, imageList.length, type);

      const item = {
        id: 'img_' + imageList.length,
        url: clean,
        hdUrl: finalHdUrl,
        isHdUpgraded: isHdUpgraded,
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
        // Check if wrapped in an anchor link pointing to high-res image
        let parentLinkHd = null;
        const parentA = img.closest('a');
        if (parentA) {
          const href = parentA.getAttribute('href');
          if (href && href.match(/\.(jpe?g|png|webp|gif|svg|avif|bmp)(\?.*)?$/i)) {
            parentLinkHd = href;
          }
        }

        // Check high-res zoom attributes
        const zoomAttr = img.getAttribute('data-zoom-image') ||
                         img.getAttribute('data-highres') ||
                         img.getAttribute('data-large-file') ||
                         img.getAttribute('data-full-url') ||
                         img.getAttribute('data-original') ||
                         img.getAttribute('data-src');

        // Check srcset for highest resolution candidate
        const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        let highestSrcsetCandidate = null;
        if (srcset) {
          highestSrcsetCandidate = extractHighestSrcsetCandidate(srcset);
        }

        const bestHdCandidate = parentLinkHd || zoomAttr || highestSrcsetCandidate;

        // Direct src
        const src = img.getAttribute('src');
        if (src) {
          addImage(src, 'img', '', bestHdCandidate);
        } else if (bestHdCandidate) {
          addImage(bestHdCandidate, 'img', 'High-Res', bestHdCandidate);
        }

        // Also add other candidate images if multiple unique
        if (highestSrcsetCandidate && highestSrcsetCandidate !== src) {
          addImage(highestSrcsetCandidate, 'img', 'Srcset 4K');
        }
      });

      // Picture sources
      doc.querySelectorAll('picture source').forEach(source => {
        const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
        if (srcset) {
          const best = extractHighestSrcsetCandidate(srcset);
          if (best) addImage(best, 'img', 'Picture HD');
        }
      });
    }

    // 2. SVG Vectors (Infinitely scalable)
    if (allowSvg) {
      // Find inline <svg>
      doc.querySelectorAll('svg').forEach((svg, idx) => {
        try {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svg);
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

    // 5. Linked High-Res Images (<a href="...jpg">)
    if (allowLinked) {
      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.match(/\.(jpe?g|png|webp|gif|svg|avif|bmp)(\?.*)?$/i)) {
          addImage(href, 'link', 'Linked Photo');
        }
      });
    }

    extractedImages = imageList;

    if (extractedImages.length === 0) {
      window.showToast?.('No images found on this page. Check extraction options or try another URL.', 'warning');
      if (resultsWorkspace) resultsWorkspace.style.display = 'none';
      return;
    }

    // Count how many were upgraded to HD
    const hdCount = extractedImages.filter(i => i.isHdUpgraded).length;

    // Show workspace
    if (resultsWorkspace) resultsWorkspace.style.display = 'block';
    resultsWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (hdCount > 0) {
      window.showToast?.(`🎉 Extracted ${extractedImages.length} images (${hdCount} auto-upgraded to 4K/HD)!`, 'success');
    } else {
      window.showToast?.(`🎉 Extracted ${extractedImages.length} images successfully!`, 'success');
    }

    // Reset filters
    activeFormatFilter = 'all';
    activeSizeFilter = 'all';
    searchQuery = '';
    if (inpSearchFilter) inpSearchFilter.value = '';
    document.querySelectorAll('#formatChipBar .filter-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-fmt') === 'all'));

    applyFiltersAndRender();
  }

  // Helper to extract the highest resolution URL from a srcset attribute
  function extractHighestSrcsetCandidate(srcsetStr) {
    if (!srcsetStr) return null;
    const parts = srcsetStr.split(',');
    let maxVal = -1;
    let bestUrl = null;

    parts.forEach(part => {
      const tokens = part.trim().split(/\s+/);
      const url = tokens[0];
      const descriptor = tokens[1] || '';

      let numVal = 1;
      if (descriptor.endsWith('w')) {
        numVal = parseInt(descriptor, 10) || 1;
      } else if (descriptor.endsWith('x')) {
        numVal = (parseFloat(descriptor) || 1) * 1000;
      }

      if (numVal > maxVal) {
        maxVal = numVal;
        bestUrl = url;
      }
    });

    return bestUrl;
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
    // Probe HD URL if available, else standard URL
    probe.src = item.hdUrl || item.url;
  }

  // 7. Filtering & Sorting Engine
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

    // Quick Top Bar counters
    const topBarBadge = document.getElementById('topBarShowingBadge');
    if (topBarBadge) topBarBadge.textContent = showingCount;
    const topBarZipCount = document.getElementById('topBarZipCount');
    if (topBarZipCount) topBarZipCount.textContent = totalCount;
  }

  // 8. Render Gallery Cards with HD Badges & Clear Download Action
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
      const hdBadgeHtml = item.isHdUpgraded ? `<span class="img-hd-source-badge">⭐ 4K Source</span>` : '';

      const dlButtonLabel = activeHdQuality === 1 
        ? (item.isHdUpgraded ? 'Download 4K' : 'Download HD') 
        : (activeHdQuality === 2 ? 'Download 2x HD' : 'Download 4x HD');

      card.innerHTML = `
        <div class="img-preview-box checkerboard-bg">
          <!-- Checkbox Top-Left inside Preview -->
          <label class="img-card-checkbox-wrap" title="Select for bulk download">
            <input type="checkbox" class="img-card-checkbox" data-id="${item.id}" ${item.selected ? 'checked' : ''}>
          </label>

          <!-- Badges Top-Right inside Preview -->
          <div class="img-badges-top-right">
            <span class="img-format-badge">${item.type}</span>
            ${hdBadgeHtml}
          </div>

          <!-- Thumbnail Image -->
          <img src="${item.url}" alt="${item.filename}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2394a3b8\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg>';">
          
          <!-- Dimensions Bottom-Right inside Preview -->
          <span class="img-dim-badge" id="dim_${item.id}">${dimText}</span>
        </div>

        <!-- Info & Actions Area -->
        <div class="img-card-info">
          <div class="img-card-name" title="${item.filename}">${item.filename}</div>
          <div class="img-card-actions">
            <button type="button" class="btn-card-download ${item.isHdUpgraded || activeHdQuality > 1 ? 'is-hd' : ''} btn-dl-single" data-id="${item.id}" title="Download image (${activeHdQuality}x HD)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>${dlButtonLabel}</span>
            </button>
            <button type="button" class="btn-card-icon btn-copy-single" data-url="${item.hdUrl || item.url}" title="Copy Direct Image URL">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </button>
            <a href="${item.hdUrl || item.url}" target="_blank" rel="noopener noreferrer" class="btn-card-icon" title="Open Full Resolution in New Tab">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
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
      dlBtn?.addEventListener('click', () => downloadSingleImage(item, activeHdQuality));

      // Copy URL
      const copyBtn = card.querySelector('.btn-copy-single');
      copyBtn?.addEventListener('click', () => copyImageUrl(item.hdUrl || item.url));

      frag.appendChild(card);
    });

    galleryGrid.appendChild(frag);
  }

  // 9. Client-Side HD Super-Resolution Upscaler (Canvas Bicubic + Unsharp-Mask)
  async function upscaleImageBlob(blob, factor = 2) {
    if (factor <= 1) return blob;

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          const targetW = Math.round(img.naturalWidth * factor);
          const targetH = Math.round(img.naturalHeight * factor);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');

          // High quality bicubic scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Subtle unsharp-mask filter for crisp edges
          applyUnsharpMask(ctx, targetW, targetH, 0.35);

          canvas.toBlob((upscaledBlob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(upscaledBlob || blob);
          }, 'image/png');
        } catch (e) {
          console.warn('Canvas upscale failed, returning raw blob:', e);
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(blob);
      };

      img.src = objectUrl;
    });
  }

  // Unsharp-mask convolution kernel
  function applyUnsharpMask(ctx, w, h, strength = 0.35) {
    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const copy = new Uint8ClampedArray(data);

      const c = 1 + 4 * strength;
      const s = -strength;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          for (let ch = 0; ch < 3; ch++) {
            const val = copy[idx + ch] * c
              + (copy[idx - 4 + ch] + copy[idx + 4 + ch] + copy[idx - w * 4 + ch] + copy[idx + w * 4 + ch]) * s;
            data[idx + ch] = Math.min(255, Math.max(0, val));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {}
  }

  // 10. Single Image Downloader (Prioritizes HD URL & Upscaling)
  async function downloadSingleImage(item, qualityFactor = 1) {
    const targetUrl = item.hdUrl || item.url;
    window.showToast?.(`Downloading HD: ${item.filename}...`, 'info', 2000);

    let rawBlob = await fetchImageBlob(targetUrl);

    // Fallback to preview url if HD link failed
    if (!rawBlob && item.url && item.url !== targetUrl) {
      rawBlob = await fetchImageBlob(item.url);
    }

    // If blob was successfully fetched, optionally upscale to 2x or 4x
    if (rawBlob) {
      let finalBlob = rawBlob;
      let finalName = item.filename;

      if (qualityFactor > 1 && item.type !== 'SVG') {
        window.showToast?.(`Upscaling to ${qualityFactor}x HD Super-Resolution...`, 'info', 1500);
        finalBlob = await upscaleImageBlob(rawBlob, qualityFactor);
        finalName = finalName.replace(/(\.[a-z0-9]+)$/i, `_${qualityFactor}x_HD$1`);
      }

      window.downloadFile?.(finalBlob, finalName);
      window.showToast?.(`Saved HD: ${finalName}!`, 'success');
      return;
    }

    // 4. Anchor click fallback (navigates or triggers browser download)
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = item.filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.showToast?.('Download opened in browser tab!', 'info');
  }

  // 11. Download Selected as HD ZIP
  async function handleDownloadSelected() {
    const selected = extractedImages.filter(i => i.selected);
    if (selected.length === 0) {
      window.showToast?.('Please check at least 1 image to download, or use "Download All as HD ZIP"', 'warning');
      return;
    }
    await packageZip(selected, `selected_hd_images_${selected.length}.zip`, activeHdQuality);
  }

  // 12. Download All as HD ZIP
  async function handleDownloadAllZip() {
    if (extractedImages.length === 0) {
      window.showToast?.('No images to download', 'warning');
      return;
    }
    await packageZip(extractedImages, `all_hd_images_${extractedImages.length}.zip`, activeHdQuality);
  }

  // ZIP Packaging Helper using JSZip with HD Super-Resolution Support
  async function packageZip(itemsList, zipFilename, qualityFactor = 1) {
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

    const qualityLabel = qualityFactor > 1 ? ` (${qualityFactor}x HD)` : '';
    updateZipProgress(0, `Starting HD ZIP packaging for ${total} images${qualityLabel}...`);

    // Process in batches of 4
    const BATCH_SIZE = 4;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = itemsList.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (item, batchIdx) => {
        try {
          const targetUrl = item.hdUrl || item.url;
          let blob = await fetchImageBlob(targetUrl);
          
          // Fallback to preview url if HD link failed
          if (!blob && item.url !== targetUrl) {
            blob = await fetchImageBlob(item.url);
          }

          if (blob) {
            // Apply 2x or 4x upscale if requested
            if (qualityFactor > 1 && item.type !== 'SVG') {
              blob = await upscaleImageBlob(blob, qualityFactor);
            }

            const safeName = sanitizeZipName(item.filename, i + batchIdx, qualityFactor);
            zip.file(safeName, blob);
          }
        } catch (err) {
          console.warn(`Could not add image ${item.url} to ZIP:`, err);
        } finally {
          completed++;
          const pct = Math.round((completed / total) * 85);
          updateZipProgress(pct, `Processed ${completed} of ${total} images in HD...`);
        }
      }));
    }

    updateZipProgress(90, 'Compressing HD archive into ZIP...');

    try {
      const zipContent = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      updateZipProgress(100, 'Complete! Downloading HD ZIP...');
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

  function isSameOriginUrl(url) {
    try {
      if (url.startsWith('data:') || url.startsWith('blob:')) return true;
      const parsed = new URL(url, window.location.href);
      return parsed.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  async function fetchImageBlob(url) {
    if (!url) return null;

    // 1. Data URLs & Blob URLs
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      try {
        const res = await fetch(url);
        return await res.blob();
      } catch (e) {}
    }

    // 2. Same-Origin images can be fetched directly without CORS issues
    if (isSameOriginUrl(url)) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.blob();
      } catch (e) {}
    }

    // 3. Cross-Origin: Primary Cloudflare Edge Image Proxy (wsrv.nl)
    // Always provides Access-Control-Allow-Origin: * and streams original binaries
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 9000);
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 80) return blob;
      }
    } catch (e) {}

    // 4. Cross-Origin: Secondary Image Proxy (images.weserv.nl)
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 9000);
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 80) return blob;
      }
    } catch (e) {}

    // 5. Fallback: AllOrigins Raw CORS Proxy
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 7000);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 80) return blob;
      }
    } catch (e) {}

    // 6. Direct CORS Fetch (fallback if origin allows CORS)
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { mode: 'cors', signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) return await res.blob();
    } catch (e) {}

    return null;
  }

  function sanitizeZipName(name, index, qualityFactor = 1) {
    let clean = (name || '').replace(/[\\/:*?"<>|]/g, '_');
    if (!clean || clean.length < 3) clean = `image_${index + 1}.jpg`;
    if (qualityFactor > 1) {
      clean = clean.replace(/(\.[a-z0-9]+)$/i, `_${qualityFactor}x_HD$1`);
    }
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
        window.showToast?.('Copied High-Res image URL to clipboard!', 'success');
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
      window.showToast?.('Copied High-Res image URL to clipboard!', 'success');
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
