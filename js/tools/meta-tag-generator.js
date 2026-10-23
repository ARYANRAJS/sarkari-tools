/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — SEO Meta Tag & Social Generator
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const inpTitle = document.getElementById('inpTitle');
  const inpDesc = document.getElementById('inpDesc');
  const inpUrl = document.getElementById('inpUrl');
  const inpSiteName = document.getElementById('inpSiteName');
  const inpKeywords = document.getElementById('inpKeywords');
  const inpRobots = document.getElementById('inpRobots');
  const inpOgImage = document.getElementById('inpOgImage');
  const inpTwitterHandle = document.getElementById('inpTwitterHandle');

  const titleCounter = document.getElementById('titleCounter');
  const descCounter = document.getElementById('descCounter');
  const titleMeter = document.getElementById('titleMeter');
  const descMeter = document.getElementById('descMeter');

  // Preview elements
  const serpTitleDisplay = document.getElementById('serpTitleDisplay');
  const serpDescDisplay = document.getElementById('serpDescDisplay');
  const serpUrlDisplay = document.getElementById('serpUrlDisplay');
  const serpSiteDisplay = document.getElementById('serpSiteDisplay');

  const fbImgPreview = document.getElementById('fbImgPreview');
  const fbDomainDisplay = document.getElementById('fbDomainDisplay');
  const fbTitleDisplay = document.getElementById('fbTitleDisplay');
  const fbDescDisplay = document.getElementById('fbDescDisplay');

  const twImgPreview = document.getElementById('twImgPreview');
  const twDomainDisplay = document.getElementById('twDomainDisplay');
  const twTitleDisplay = document.getElementById('twTitleDisplay');
  const twDescDisplay = document.getElementById('twDescDisplay');

  const metaCodeOutput = document.getElementById('metaCodeOutput');
  const btnCopyTags = document.getElementById('btnCopyTags');
  const btnDownloadTags = document.getElementById('btnDownloadTags');

  // Presets
  const btnPresetSarkari = document.getElementById('btnPresetSarkari');
  const btnPresetBlog = document.getElementById('btnPresetBlog');
  const btnPresetHome = document.getElementById('btnPresetHome');
  const btnPresetProduct = document.getElementById('btnPresetProduct');

  // Tab switching for previews
  document.querySelectorAll('#previewTabs .tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#previewTabs .tool-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.preview;
      document.getElementById('previewGoogle').style.display = target === 'google' ? 'block' : 'none';
      document.getElementById('previewFacebook').style.display = target === 'facebook' ? 'block' : 'none';
      document.getElementById('previewTwitter').style.display = target === 'twitter' ? 'block' : 'none';
    });
  });

  // Preset handlers
  btnPresetSarkari.addEventListener('click', () => {
    inpTitle.value = 'SSC CGL 2026 Online Application Form, Notification & Eligibility';
    inpDesc.value = 'Apply online for SSC CGL 2026 recruitment. Download official notification PDF, check exam dates, age limit, syllabus and tier-1 exam pattern.';
    inpUrl.value = 'https://sarkaritools.in/exams/ssc-cgl-2026';
    inpSiteName.value = 'Sarkari Result Tools';
    inpKeywords.value = 'ssc cgl 2026, ssc application form, sarkari result, cgl notification';
    inpOgImage.value = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200';
    inpTwitterHandle.value = '@SarkariTools';
    updateAll();
  });

  btnPresetBlog.addEventListener('click', () => {
    inpTitle.value = 'Top 10 Technical SEO Strategies to Rank #1 on Google in 2026';
    inpDesc.value = 'Discover proven technical SEO techniques including Core Web Vitals optimization, Schema markup, and crawl budget management to boost organic rankings.';
    inpUrl.value = 'https://example.com/blog/technical-seo-guide';
    inpSiteName.value = 'TechMarketer Insights';
    inpKeywords.value = 'technical seo, google ranking, schema markup, core web vitals';
    inpOgImage.value = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200';
    inpTwitterHandle.value = '@TechMarketer';
    updateAll();
  });

  btnPresetHome.addEventListener('click', () => {
    inpTitle.value = 'Cyber Cafe Digital Suite & Online Document Utilities';
    inpDesc.value = 'One-stop portal for photo resizing, signature joining, PDF compression, invoice generation, and government exam utilities for cyber cafes and students.';
    inpUrl.value = 'https://sarkaritools.in/';
    inpSiteName.value = 'Sarkari Tools';
    inpKeywords.value = 'photo resizer, pdf compressor, cyber cafe tools, online utilities';
    inpOgImage.value = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200';
    inpTwitterHandle.value = '@SarkariTools';
    updateAll();
  });

  btnPresetProduct.addEventListener('click', () => {
    inpTitle.value = 'Best HP Laser Multi-Function Scanner & Printer for Cyber Cafes';
    inpDesc.value = 'Shop heavy-duty wireless all-in-one printer with dual-sided scanning, high-yield ink bottles, and instant warranty support across India.';
    inpUrl.value = 'https://example.com/products/hp-laser-mfp';
    inpSiteName.value = 'PrintTech Solutions';
    inpKeywords.value = 'cyber cafe printer, laser printer, hp scanner';
    inpOgImage.value = 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=1200';
    inpTwitterHandle.value = '@PrintTechIndia';
    updateAll();
  });

  // Inputs listening
  [inpTitle, inpDesc, inpUrl, inpSiteName, inpKeywords, inpRobots, inpOgImage, inpTwitterHandle].forEach(elem => {
    elem.addEventListener('input', updateAll);
  });

  function updateAll() {
    const title = inpTitle.value.trim() || 'Your Compelling Page Title Goes Here';
    const desc = inpDesc.value.trim() || 'Your meta description summarizes the content of your page to invite search engine users to click on your snippet.';
    const url = inpUrl.value.trim() || 'https://example.com/page-name';
    const siteName = inpSiteName.value.trim() || 'Your Brand';
    const keywords = inpKeywords.value.trim();
    const robots = inpRobots.value;
    const ogImg = inpOgImage.value.trim();
    const twitterHandle = inpTwitterHandle.value.trim() || '@brand';

    // Domain extraction
    let domain = 'example.com';
    try {
      const u = new URL(url);
      domain = u.hostname.replace(/^www\./i, '');
    } catch (e) {
      domain = 'example.com';
    }

    // Counters & Meters
    const tLen = inpTitle.value.length;
    titleCounter.textContent = `${tLen} / 60 chars`;
    const tPercent = Math.min(100, Math.round((tLen / 60) * 100));
    titleMeter.style.width = `${tPercent}%`;
    if (tLen > 60) {
      titleMeter.className = 'pixel-meter-fill danger';
      titleCounter.style.color = '#dc2626';
    } else if (tLen > 50) {
      titleMeter.className = 'pixel-meter-fill';
      titleCounter.style.color = '#16a34a';
    } else {
      titleMeter.className = 'pixel-meter-fill warning';
      titleCounter.style.color = '#ca8a04';
    }

    const dLen = inpDesc.value.length;
    descCounter.textContent = `${dLen} / 160 chars`;
    const dPercent = Math.min(100, Math.round((dLen / 160) * 100));
    descMeter.style.width = `${dPercent}%`;
    if (dLen > 160) {
      descMeter.className = 'pixel-meter-fill danger';
      descCounter.style.color = '#dc2626';
    } else if (dLen >= 120) {
      descMeter.className = 'pixel-meter-fill';
      descCounter.style.color = '#16a34a';
    } else {
      descMeter.className = 'pixel-meter-fill warning';
      descCounter.style.color = '#ca8a04';
    }

    // Update SERP preview
    serpTitleDisplay.textContent = title;
    serpDescDisplay.textContent = desc;
    serpSiteDisplay.textContent = siteName;
    serpUrlDisplay.textContent = url.replace(/https?:\/\//i, '').replace(/\/$/, '');

    // Update FB / WhatsApp preview
    fbTitleDisplay.textContent = title;
    fbDescDisplay.textContent = desc;
    fbDomainDisplay.textContent = domain.toUpperCase();
    if (ogImg) {
      fbImgPreview.style.backgroundImage = `url('${ogImg}')`;
      fbImgPreview.innerHTML = '';
    } else {
      fbImgPreview.style.backgroundImage = 'none';
      fbImgPreview.innerHTML = '<span>1200 × 630 Social Banner Preview</span>';
    }

    // Update Twitter preview
    twTitleDisplay.textContent = title;
    twDescDisplay.textContent = desc;
    twDomainDisplay.textContent = domain;
    if (ogImg) {
      twImgPreview.style.backgroundImage = `url('${ogImg}')`;
      twImgPreview.innerHTML = '';
    } else {
      twImgPreview.style.backgroundImage = 'none';
      twImgPreview.innerHTML = '<span>Summary Large Image Banner</span>';
    }

    // Assemble Code
    let html = `<!-- Primary Meta Tags -->\n`;
    html += `<title>${escapeHtml(title)}</title>\n`;
    html += `<meta name="title" content="${escapeHtml(title)}">\n`;
    html += `<meta name="description" content="${escapeHtml(desc)}">\n`;
    if (keywords) {
      html += `<meta name="keywords" content="${escapeHtml(keywords)}">\n`;
    }
    html += `<meta name="robots" content="${escapeHtml(robots)}">\n`;
    html += `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n`;
    html += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `<link rel="canonical" href="${escapeHtml(url)}">\n\n`;

    html += `<!-- Open Graph / Facebook / WhatsApp -->\n`;
    html += `<meta property="og:type" content="website">\n`;
    html += `<meta property="og:url" content="${escapeHtml(url)}">\n`;
    html += `<meta property="og:title" content="${escapeHtml(title)}">\n`;
    html += `<meta property="og:description" content="${escapeHtml(desc)}">\n`;
    if (ogImg) {
      html += `<meta property="og:image" content="${escapeHtml(ogImg)}">\n`;
    }
    if (siteName) {
      html += `<meta property="og:site_name" content="${escapeHtml(siteName)}">\n`;
    }
    html += `\n<!-- Twitter / X -->\n`;
    html += `<meta property="twitter:card" content="summary_large_image">\n`;
    html += `<meta property="twitter:url" content="${escapeHtml(url)}">\n`;
    html += `<meta property="twitter:title" content="${escapeHtml(title)}">\n`;
    html += `<meta property="twitter:description" content="${escapeHtml(desc)}">\n`;
    if (ogImg) {
      html += `<meta property="twitter:image" content="${escapeHtml(ogImg)}">\n`;
    }
    if (twitterHandle) {
      html += `<meta property="twitter:creator" content="${escapeHtml(twitterHandle)}">\n`;
    }

    metaCodeOutput.textContent = html;
  }

  // Copy code
  btnCopyTags.addEventListener('click', () => {
    const code = metaCodeOutput.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const orig = btnCopyTags.textContent;
      btnCopyTags.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => { btnCopyTags.textContent = orig; }, 2000);
    });
  });

  // Download code
  btnDownloadTags.addEventListener('click', () => {
    const code = metaCodeOutput.textContent;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-meta-tags.html';
    a.click();
    URL.revokeObjectURL(url);
  });

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Initial populate with Sarkari Exam preset
  btnPresetSarkari.click();

});
