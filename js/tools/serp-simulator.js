/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — SERP Snippet Simulator
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const simTitle = document.getElementById('simTitle');
  const simDesc = document.getElementById('simDesc');
  const simUrl = document.getElementById('simUrl');
  const simSiteName = document.getElementById('simSiteName');
  const simSearchQuery = document.getElementById('simSearchQuery');
  const chkShowStars = document.getElementById('chkShowStars');
  const chkShowDate = document.getElementById('chkShowDate');

  const titlePixelBadge = document.getElementById('titlePixelBadge');
  const titlePixelFill = document.getElementById('titlePixelFill');
  const titleCharCount = document.getElementById('titleCharCount');

  const descPixelBadge = document.getElementById('descPixelBadge');
  const descPixelFill = document.getElementById('descPixelFill');
  const descCharCount = document.getElementById('descCharCount');

  const serpDisplayBox = document.getElementById('serpDisplayBox');
  const dispTitle = document.getElementById('dispTitle');
  const dispDesc = document.getElementById('dispDesc');
  const dispSiteName = document.getElementById('dispSiteName');
  const dispBreadcrumb = document.getElementById('dispBreadcrumb');
  const dispRatingRow = document.getElementById('dispRatingRow');
  const deviceIndicator = document.getElementById('deviceIndicator');

  // Canvas for measuring pixels
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let currentDevice = 'desktop';

  // Device tabs
  document.querySelectorAll('#deviceTabs .tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#deviceTabs .tool-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDevice = tab.dataset.device;

      if (currentDevice === 'mobile') {
        serpDisplayBox.style.maxWidth = '400px';
        dispTitle.style.fontSize = '18px';
        deviceIndicator.textContent = 'Mobile View (Touch Optimized)';
      } else {
        serpDisplayBox.style.maxWidth = '650px';
        dispTitle.style.fontSize = '20px';
        deviceIndicator.textContent = 'Desktop View (Arial 20px)';
      }
      updateSerp();
    });
  });

  // Event listeners
  [simTitle, simDesc, simUrl, simSiteName, simSearchQuery].forEach(inp => {
    inp.addEventListener('input', updateSerp);
  });
  [chkShowStars, chkShowDate].forEach(chk => {
    chk.addEventListener('change', updateSerp);
  });

  function measurePixelWidth(text, font) {
    ctx.font = font;
    return Math.round(ctx.measureText(text).width);
  }

  function truncateByPixel(text, maxPixels, font) {
    ctx.font = font;
    if (ctx.measureText(text).width <= maxPixels) {
      return { text, truncated: false };
    }

    let low = 0;
    let high = text.length;
    let best = '';

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const sub = text.substring(0, mid) + '...';
      const w = ctx.measureText(sub).width;

      if (w <= maxPixels) {
        best = sub;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return { text: best, truncated: true };
  }

  function highlightKeywords(text, query) {
    if (!query.trim()) return escapeHtml(text);
    const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return escapeHtml(text);

    // Escape regex
    const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    return escapeHtml(text).replace(regex, '<strong>$1</strong>');
  }

  function updateSerp() {
    const rawTitle = simTitle.value.trim() || 'Free Passport Photo Maker & Size Resizer for Government Exams';
    const rawDesc = simDesc.value.trim() || 'Crop, resize, change photo background to white, and compress under 50KB for SSC, UPSC, and government online applications in 1 click.';
    const rawUrl = simUrl.value.trim() || 'https://alltoolsinone.com/tools/passport-photo.html';
    const siteName = simSiteName.value.trim() || 'AllToolsInOne';
    const query = simSearchQuery.value.trim();

    // Fonts
    const titleFont = currentDevice === 'desktop' ? '20px Arial' : '18px Arial';
    const descFont = '14px Arial';

    const maxTitlePixels = currentDevice === 'desktop' ? 580 : 380;
    const maxDescPixels = currentDevice === 'desktop' ? 960 : 700;

    // Measurement
    const titleWidth = measurePixelWidth(rawTitle, titleFont);
    const descWidth = measurePixelWidth(rawDesc, descFont);

    // Badges & meters
    titlePixelBadge.textContent = `${titleWidth} px / ${maxTitlePixels} px`;
    titleCharCount.textContent = `${rawTitle.length} characters`;

    const titlePct = Math.min(100, Math.round((titleWidth / maxTitlePixels) * 100));
    titlePixelFill.style.width = `${titlePct}%`;
    if (titleWidth > maxTitlePixels) {
      titlePixelFill.className = 'pixel-meter-fill danger';
      titlePixelBadge.className = 'status-pill fail';
    } else if (titleWidth > maxTitlePixels * 0.85) {
      titlePixelFill.className = 'pixel-meter-fill';
      titlePixelBadge.className = 'status-pill pass';
    } else {
      titlePixelFill.className = 'pixel-meter-fill warning';
      titlePixelBadge.className = 'status-pill warn';
    }

    descPixelBadge.textContent = `${descWidth} px / ${maxDescPixels} px`;
    descCharCount.textContent = `${rawDesc.length} characters`;

    const descPct = Math.min(100, Math.round((descWidth / maxDescPixels) * 100));
    descPixelFill.style.width = `${descPct}%`;
    if (descWidth > maxDescPixels) {
      descPixelFill.className = 'pixel-meter-fill danger';
      descPixelBadge.className = 'status-pill fail';
    } else if (descWidth > maxDescPixels * 0.7) {
      descPixelFill.className = 'pixel-meter-fill';
      descPixelBadge.className = 'status-pill pass';
    } else {
      descPixelFill.className = 'pixel-meter-fill warning';
      descPixelBadge.className = 'status-pill warn';
    }

    // Truncate
    const truncatedTitleObj = truncateByPixel(rawTitle, maxTitlePixels, titleFont);
    const truncatedDescObj = truncateByPixel(rawDesc, maxDescPixels, descFont);

    // Format breadcrumb URL
    let breadcrumb = rawUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    breadcrumb = breadcrumb.split('/').join(' > ');
    dispBreadcrumb.textContent = breadcrumb;
    dispSiteName.textContent = siteName;

    // Render Title with keyword bolding
    dispTitle.innerHTML = highlightKeywords(truncatedTitleObj.text, query);

    // Rich rating row
    dispRatingRow.style.display = chkShowStars.checked ? 'flex' : 'none';

    // Description with Date Snippet
    let datePrefix = '';
    if (chkShowDate.checked) {
      datePrefix = `<span style="color: #70757a; font-size: 13px;">Oct 22, 2026 — </span>`;
    }
    dispDesc.innerHTML = datePrefix + highlightKeywords(truncatedDescObj.text, query);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Initial populate
  simTitle.value = 'Free Passport Photo Maker & Size Resizer for Government Exams';
  simDesc.value = 'Crop, resize, change photo background to white, and compress under 50KB for SSC, UPSC, and government online applications in 1 click.';
  simUrl.value = 'https://alltoolsinone.com/tools/passport-photo.html';
  simSiteName.value = 'AllToolsInOne';
  simSearchQuery.value = 'passport photo resizer';
  updateSerp();

});
