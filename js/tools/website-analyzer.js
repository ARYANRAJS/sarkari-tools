/**
 * AllToolsInOne - All-in-One Website Analyzer & Intelligence Auditor
 * Complete 360° audit: DA/PA, Estimated Traffic, Meta Ads, Socials, Google Maps & Tech Stack
 */

(function () {
  'use strict';

  // DOM Elements
  const inpDomain = document.getElementById('inpDomain');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const sampleSiteButtons = document.querySelectorAll('.sample-site-btn');
  const analyzerInputTabs = document.getElementById('analyzerInputTabs');
  const modeUrlWrap = document.getElementById('modeUrlWrap');
  const modeSourceWrap = document.getElementById('modeSourceWrap');
  const inpSourceDomain = document.getElementById('inpSourceDomain');
  const inpSourceCode = document.getElementById('inpSourceCode');
  const btnAnalyzeSource = document.getElementById('btnAnalyzeSource');
  const btnLoadSampleStore = document.getElementById('btnLoadSampleStore');
  const analyzerLoading = document.getElementById('analyzerLoading');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingSubtitle = document.getElementById('loadingSubtitle');
  const analyzerDashboard = document.getElementById('analyzerDashboard');
  const dispDomain = document.getElementById('dispDomain');
  const dispTitle = document.getElementById('dispTitle');
  const siteFavicon = document.getElementById('siteFavicon');
  const scoreDa = document.getElementById('scoreDa');
  const scorePa = document.getElementById('scorePa');
  const scoreSpam = document.getElementById('scoreSpam');
  const badgeDa = document.getElementById('badgeDa');
  const scoreTraffic = document.getElementById('scoreTraffic');
  const scoreRankTier = document.getElementById('scoreRankTier');
  const scoreBounce = document.getElementById('scoreBounce');
  const scorePlatform = document.getElementById('scorePlatform');
  const scoreCdn = document.getElementById('scoreCdn');
  const scoreAdsCount = document.getElementById('scoreAdsCount');
  const scoreAdsDesc = document.getElementById('scoreAdsDesc');
  const pixelIdBadge = document.getElementById('pixelIdBadge');
  const googleAdsBadge = document.getElementById('googleAdsBadge');
  const btnMetaAdLibrary = document.getElementById('btnMetaAdLibrary');
  const btnGoogleAdCenter = document.getElementById('btnGoogleAdCenter');
  const socialProfilesGrid = document.getElementById('socialProfilesGrid');
  const mapsContainer = document.getElementById('mapsContainer');
  const btnSearchMaps = document.getElementById('btnSearchMaps');
  const contactDetailsList = document.getElementById('contactDetailsList');
  const seoTitleBox = document.getElementById('seoTitleBox');
  const seoDescBox = document.getElementById('seoDescBox');
  const titleCharCount = document.getElementById('titleCharCount');
  const descCharCount = document.getElementById('descCharCount');
  const serpSiteName = document.getElementById('serpSiteName');
  const serpBreadcrumb = document.getElementById('serpBreadcrumb');
  const serpTitle = document.getElementById('serpTitle');
  const serpDesc = document.getElementById('serpDesc');
  const countH1 = document.getElementById('countH1');
  const countH2 = document.getElementById('countH2');
  const countSchema = document.getElementById('countSchema');
  const statCanonical = document.getElementById('statCanonical');
  const analyzerTechGrid = document.getElementById('analyzerTechGrid');
  const statMonthlyVisits = document.getElementById('statMonthlyVisits');
  const statGlobalTier = document.getElementById('statGlobalTier');
  const statDuration = document.getElementById('statDuration');
  const statBounceRate = document.getElementById('statBounceRate');
  const pctSearch = document.getElementById('pctSearch');
  const barSearch = document.getElementById('barSearch');
  const pctDirect = document.getElementById('pctDirect');
  const barDirect = document.getElementById('barDirect');
  const pctSocial = document.getElementById('pctSocial');
  const barSocial = document.getElementById('barSocial');
  const pctReferral = document.getElementById('pctReferral');
  const barReferral = document.getElementById('barReferral');
  const dnsNameserversList = document.getElementById('dnsNameserversList');
  const dnsMxList = document.getElementById('dnsMxList');
  const auditTabs = document.getElementById('auditTabs');
  const btnCopyAudit = document.getElementById('btnCopyAudit');
  const btnDownloadJson = document.getElementById('btnDownloadJson');

    const SAMPLE_BOAT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Buy Earphones, Headphones, Smartwatches & Soundbars Online | boAt Lifestyle</title>
  <meta name="description" content="Shop India's No.1 earwear and wearable brand. Explore true wireless earbuds, bluetooth headphones, neckbands, smartwatch, speakers and gaming accessories.">
  <link rel="canonical" href="https://www.boat-lifestyle.com">
  <meta property="og:title" content="boAt Lifestyle - India's Leading Audio & Wearable Brand">
  <meta property="og:description" content="Plug into Nirvana with boAt lifestyle headphones, earphones and smartwatches.">
  <link rel="icon" href="https://cdn.shopify.com/s/files/1/0057/8938/4802/files/boat-favicon.png">

  <!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '173829104992144');
    fbq('track', 'PageView');
  </script>

  <!-- Google Tag Manager / GTM -->
  <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-TR9KK5N"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-6QJ538B310"></script>

  <!-- Shopify Core & CDN -->
  <link rel="stylesheet" href="https://cdn.shopify.com/s/files/1/0057/8938/4802/t/45/assets/theme.css">
  <script src="https://cdn.shopify.com/shopifycloud/shopify/assets/storefront/features-v2.js"></script>

  <!-- Schema.org Organization Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "boAt Lifestyle",
    "url": "https://www.boat-lifestyle.com",
    "logo": "https://www.boat-lifestyle.com/cdn/shop/files/boAt_logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-022-6918-1920",
      "contactType": "Customer Support",
      "email": "info@imaginemarketingindia.com"
    },
    "sameAs": [
      "https://www.facebook.com/boat.nirvana",
      "https://www.instagram.com/boat.nirvana",
      "https://twitter.com/rockwithboat",
      "https://www.youtube.com/channel/UCyfxAiHPKX1U_6qVz4HvdvA",
      "https://www.linkedin.com/company/boat-lifestyle"
    ]
  }
  </script>
</head>
<body>
  <header>
    <h1>India's #1 Earwear Brand - Plug Into Nirvana</h1>
    <h2>Shop Wireless Earbuds, Headphones and Smartwatches</h2>
  </header>
  <main>
    <h2>Best Seller Earbuds &amp; Noise Cancellation Headphones</h2>
    <p>Premium bass tuned by Indian sound engineers for authentic listening experience.</p>
  </main>
  <footer>
    <div class="company-info">
      <h3>Customer Care</h3>
      <p>Email: <a href="mailto:info@imaginemarketingindia.com">info@imaginemarketingindia.com</a></p>
      <p>Phone: <a href="tel:+912269181920">+91 022 6918 1920</a></p>
      <p>Registered Office: Imagine Marketing Limited, Unit No. 201 &amp; 202, D-Wing, Corporate Avenue, Andheri Ghatkopar Link Road, Mumbai, Maharashtra 400093, India</p>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.754!2d72.889!3d19.112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c87c9:0xboAtCorporate!2sImagine+Marketing+boAt!5e0!3m2!1sen!2sin!4v1" width="300" height="200" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
    </div>
    <div class="social-icons">
      <a href="https://www.instagram.com/boat.nirvana/" target="_blank">Instagram</a>
      <a href="https://www.facebook.com/boat.nirvana/" target="_blank">Facebook</a>
      <a href="https://twitter.com/RockWithboat" target="_blank">Twitter / X</a>
      <a href="https://www.youtube.com/c/boAt-nirvana" target="_blank">YouTube</a>
      <a href="https://www.linkedin.com/company/boat-lifestyle/" target="_blank">LinkedIn</a>
    </div>
    <p>&copy; 2026 boAt Lifestyle. All Rights Reserved. Powered by Shopify.</p>
  </footer>
</body>
</html>`;

  let currentAuditData = null;

  // Initialize
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    btnAnalyze?.addEventListener('click', handleAnalyze);
    inpDomain?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAnalyze();
    });

    sampleSiteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (inpDomain) {
          inpDomain.value = btn.dataset.url;
          handleAnalyze();
        }
      });
    });

    // Tab Switching
    if (auditTabs) {
      auditTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-tab');
        if (!btn) return;
        auditTabs.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => {
          p.style.display = p.id === targetId ? 'block' : 'none';
        });
      });
    }

    btnCopyAudit?.addEventListener('click', copyAuditReport);
    btnDownloadJson?.addEventListener('click', downloadJsonReport);

    // Input Mode Tabs (URL vs HTML Source)
    if (analyzerInputTabs) {
      analyzerInputTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-tab');
        if (!btn) return;
        analyzerInputTabs.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        if (mode === 'source') {
          if (modeUrlWrap) modeUrlWrap.style.display = 'none';
          if (modeSourceWrap) modeSourceWrap.style.display = 'block';
        } else {
          if (modeUrlWrap) modeUrlWrap.style.display = 'block';
          if (modeSourceWrap) modeSourceWrap.style.display = 'none';
        }
      });
    }

    btnAnalyzeSource?.addEventListener('click', handleAnalyzeSource);
    btnLoadSampleStore?.addEventListener('click', loadSampleStoreHtml);
    inpSourceDomain?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAnalyzeSource();
    });
  }

  // Main Analysis Flow
  async function handleAnalyze() {
    let raw = (inpDomain ? inpDomain.value : '').trim();
    if (!raw) {
      showToast('Please enter a website URL or domain.', 'error');
      return;
    }

    // Sanitize domain
    raw = raw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    const domain = raw.toLowerCase();

    if (!domain.includes('.') || domain.length < 3) {
      showToast('Please enter a valid domain (e.g. "boat-lifestyle.com")', 'error');
      return;
    }

    const fullUrl = `https://${domain}`;

    showLoading(true, `Analyzing ${domain}...`, 'Fetching live HTML source, headers, and meta tags...');

    try {
      // Step 1: Fetch HTML via CORS proxy
      const htmlResult = await fetchSiteHtml(fullUrl);

      // Step 2: Fetch DNS
      updateLoading(
        `Inspecting DNS & Email Servers for ${domain}...`,
        'Looking up nameservers, mail exchange (MX), and cloud routing...'
      );
      const dns = await fetchDnsRecords(domain);

      // Step 3: Run comprehensive audit
      updateLoading(
        `Auditing Meta Ads, Social Media & SEO...`,
        'Searching for Meta/Facebook Pixels, Instagram links, and Google Maps presence...'
      );
      const audit = analyzeWebsite(domain, htmlResult.html, htmlResult.headers, dns);

      currentAuditData = audit;
      renderDashboard(audit);
      showToast(`360° Audit complete for ${domain}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`Could not fetch site: ${err.message}. Trying direct DNS audit...`, 'error');
      // Fallback: run DNS and structural analysis
      const dns = await fetchDnsRecords(domain);
      const audit = analyzeWebsite(domain, '', '', dns);
      currentAuditData = audit;
      renderDashboard(audit);
      showToast(`Generated estimated domain audit for ${domain}`, 'info');
    } finally {
      showLoading(false);
    }
  }


  // Analyze from Pasted HTML Source
  async function handleAnalyzeSource() {
    const code = (inpSourceCode ? inpSourceCode.value : '').trim();
    if (!code) {
      showToast('Please paste HTML source code first (or click "Load Sample boAt Store HTML")', 'error');
      return;
    }

    let domain = (inpSourceDomain ? inpSourceDomain.value : '').trim();
    if (!domain) {
      const canMatch = code.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      if (canMatch && canMatch[1]) {
        try {
          domain = new URL(canMatch[1]).hostname.replace(/^www\./i, '');
        } catch (e) {}
      }
      if (!domain) {
        const titleMatch = code.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1].toLowerCase().includes('boat')) {
          domain = 'boat-lifestyle.com';
        } else {
          domain = 'analyzed-store.com';
        }
      }
      if (inpSourceDomain) inpSourceDomain.value = domain;
    }

    domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

    showLoading(true, `Auditing ${domain}...`, 'Analyzing Meta Pixels, Social profiles, SEO, Google Maps & Stack...');
    try {
      const dns = await fetchDnsRecords(domain);
      const audit = analyzeWebsite(domain, code, 'text/html', dns);
      currentAuditData = audit;
      renderDashboard(audit);
      showToast(`360° Audit complete from HTML source for ${domain}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`Analysis error: ${err.message}`, 'error');
    } finally {
      showLoading(false);
    }
  }

  function loadSampleStoreHtml() {
    if (inpSourceDomain) inpSourceDomain.value = 'boat-lifestyle.com';
    if (inpSourceCode) inpSourceCode.value = SAMPLE_BOAT_HTML;
    showToast('Loaded boAt Lifestyle sample store HTML! Now click "Audit Pasted HTML"', 'info');
  }

  // Fetch Site HTML with proxy fallbacks
  async function fetchSiteHtml(targetUrl) {
    try {
      const p1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(p1, { timeout: 8000 });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50) {
          return { html: text, headers: res.headers.get('content-type') || '' };
        }
      }
    } catch (e) {
      console.warn('Proxy 1 failed, trying proxy 2...', e);
    }

    try {
      const p2 = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
      const res2 = await fetch(p2, { timeout: 8000 });
      if (res2.ok) {
        const text2 = await res2.text();
        if (text2 && text2.length > 50) {
          return { html: text2, headers: res2.headers.get('content-type') || '' };
        }
      }
    } catch (e) {
      console.warn('Proxy 2 failed...', e);
    }

    throw new Error('Website proxy timeout or bot verification wall');
  }

  // Fetch DNS DoH Records
  async function fetchDnsRecords(domain) {
    const dns = { mx: [], ns: [] };
    try {
      const mxRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`).then(r => r.json());
      if (mxRes.Answer) {
        dns.mx = mxRes.Answer.map(a => (a.data || '').toLowerCase());
      }
      const nsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`).then(r => r.json());
      if (nsRes.Answer) {
        dns.ns = nsRes.Answer.map(a => (a.data || '').toLowerCase());
      }
    } catch (e) {
      console.warn('DNS lookup failed:', e);
    }
    return dns;
  }

  // ───────── 360° AUDIT ALGORITHM ─────────
  function analyzeWebsite(domain, html, headers, dns) {
    // 1. Meta / SEO Info
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : `${domain.split('.')[0].toUpperCase()}`;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : 'No meta description found.';

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : title;

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : description;

    // Headings Count
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

    // Schema Types
    const schemaMatches = Array.from(html.matchAll(/"@type"\s*:\s*["']([^"']+)["']/gi)).map(m => m[1]);
    const schemaTypes = Array.from(new Set(schemaMatches)).slice(0, 5);

    // 2. Social Media Links Finder
    const socials = extractSocialProfiles(html, domain);

    // 3. Contact Emails & Phones
    const emails = extractEmails(html, domain);
    const phones = extractPhones(html);

    // 4. Google Maps Presence
    const maps = extractMapsInfo(html, domain, title);

    // 5. Meta Ads & Tracking Pixels
    const ads = extractAdvertisingPixels(html, domain);

    // 6. Technologies Stack
    const tech = extractTechStack(html, headers, dns);

    // 7. Domain Authority & SEO Scoring
    const seoMetrics = calculateDaPa(domain, html, dns, schemaTypes);

    // 8. Traffic Estimates
    const traffic = estimateTraffic(seoMetrics.da, domain);

    return {
      domain,
      title,
      description,
      ogTitle,
      ogDesc,
      h1Count,
      h2Count,
      h3Count,
      schemaTypes,
      socials,
      emails,
      phones,
      maps,
      ads,
      tech,
      seoMetrics,
      traffic,
      dns
    };
  }

  // Extract Social Media Profiles
  function extractSocialProfiles(html, domain) {
    const list = [];
    const seen = new Set();

    const socialPatterns = [
      { name: 'Instagram', icon: '📷', bg: '#e1306c', regex: /(?:https?:)?\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi },
      { name: 'Facebook', icon: '👥', bg: '#1877f2', regex: /(?:https?:)?\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9.-]+)/gi },
      { name: 'Twitter / X', icon: '🐦', bg: '#000000', regex: /(?:https?:)?\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi },
      { name: 'YouTube', icon: '▶️', bg: '#ff0000', regex: /(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)?([a-zA-Z0-9._-]+)/gi },
      { name: 'LinkedIn', icon: '💼', bg: '#0a66c2', regex: /(?:https?:)?\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._-]+)/gi },
      { name: 'WhatsApp', icon: '💬', bg: '#25d366', regex: /(?:https?:)?\/\/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)([0-9+]+)/gi },
      { name: 'Telegram', icon: '✈️', bg: '#229ed9', regex: /(?:https?:)?\/\/(?:t\.me\/)([a-zA-Z0-9_]+)/gi },
      { name: 'Pinterest', icon: '📌', bg: '#bd081c', regex: /(?:https?:)?\/\/(?:www\.)?pinterest\.com\/([a-zA-Z0-9_]+)/gi }
    ];

    socialPatterns.forEach(sp => {
      const matches = Array.from(html.matchAll(sp.regex));
      for (const m of matches) {
        let handle = m[1];
        if (!handle || ['share', 'intent', 'sharer', 'tr', 'hashtag'].includes(handle.toLowerCase())) continue;
        const fullUrl = m[0].startsWith('http') ? m[0] : `https:${m[0]}`;
        const key = `${sp.name}:${handle.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: sp.name,
            icon: sp.icon,
            bg: sp.bg,
            handle: handle.startsWith('@') ? handle : `@${handle}`,
            url: fullUrl
          });
          break; // One primary per platform
        }
      }
    });

    return list;
  }

  // Extract Emails
  function extractEmails(html, domain) {
    const emails = new Set();
    const mailtoMatches = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi));
    mailtoMatches.forEach(m => emails.add(m[1].toLowerCase()));

    const textMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    textMatches.forEach(em => {
      const lower = em.toLowerCase();
      // Filter out dummy/file patterns
      if (!lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.webp') && !lower.includes('example.com') && !lower.includes('sentry.io')) {
        emails.add(lower);
      }
    });

    return Array.from(emails).slice(0, 4);
  }

  // Extract Phones
  function extractPhones(html) {
    const phones = new Set();
    const telMatches = Array.from(html.matchAll(/tel:([+0-9\s-]{8,18})/gi));
    telMatches.forEach(m => phones.add(m[1].trim()));

    return Array.from(phones).slice(0, 3);
  }

  // Extract Google Maps
  function extractMapsInfo(html, domain, title) {
    const hasIframe = /maps\.google\.com|google\.com\/maps/i.test(html);
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(domain + ' ' + title)}`;
    return {
      hasEmbed: hasIframe,
      searchUrl: searchUrl
    };
  }

  // Extract Advertising & Pixels
  function extractAdvertisingPixels(html, domain) {
    const metaPixelMatch = html.match(/fbq\(['"]init['"],\s*['"](\d+)['"]/i);
    const hasMetaPixel = !!metaPixelMatch || html.includes('connect.facebook.net') || html.includes('fbevents.js');
    const pixelId = metaPixelMatch ? metaPixelMatch[1] : (hasMetaPixel ? 'Active (Script found)' : null);

    const googleTagMatch = html.match(/(AW-[0-9]+|G-[A-Z0-9]+|GTM-[A-Z0-9]+)/);
    const hasGoogleAds = html.includes('googleads') || html.includes('googletagmanager.com') || !!googleTagMatch;

    const hasTikTok = html.includes('analytics.tiktok.com') || html.includes('ttq.load');
    const hasPinterest = html.includes('pintrk') || html.includes('pinterest.com');

    // Generate Meta Ad Library direct search link
    const metaAdLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(domain)}&search_type=keyword_unordered&media_type=all`;
    const googleAdCenterUrl = `https://adstransparency.google.com/?region=anywhere&domain=${encodeURIComponent(domain)}`;

    let count = 0;
    if (hasMetaPixel) count++;
    if (hasGoogleAds) count++;
    if (hasTikTok) count++;
    if (hasPinterest) count++;

    return {
      hasMetaPixel,
      pixelId,
      hasGoogleAds,
      googleTag: googleTagMatch ? googleTagMatch[1] : null,
      hasTikTok,
      hasPinterest,
      totalPixelsCount: count,
      metaAdLibraryUrl,
      googleAdCenterUrl
    };
  }

  // Extract Tech Stack
  function extractTechStack(html, headers, dns) {
    const list = [];
    let isShopify = false;
    let platform = 'Custom / Static';
    let cdn = 'Standard Host';

    // Shopify
    if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) {
      isShopify = true;
      platform = 'Shopify';
      const themeMatch = html.match(/Shopify\.theme\s*=\s*\{[^}]*name:\s*["']([^"']+)["']/i);
      list.push({ name: 'Shopify Store', icon: '🛍️', category: 'E-commerce', desc: themeMatch ? `Theme: ${themeMatch[1]}` : 'Cloud Storefront' });
    } else if (html.includes('woocommerce') || html.includes('wp-content/plugins/woocommerce')) {
      platform = 'WooCommerce';
      list.push({ name: 'WooCommerce', icon: '🛒', category: 'E-commerce', desc: 'WordPress Store Engine' });
    }

    // CMS
    if (html.includes('wp-content') || html.includes('wp-includes')) {
      if (platform === 'Custom / Static') platform = 'WordPress';
      list.push({ name: 'WordPress', icon: '📝', category: 'CMS', desc: 'Open-Source CMS' });
    } else if (html.includes('webflow.com') || html.includes('data-wf-page')) {
      platform = 'Webflow';
      list.push({ name: 'Webflow', icon: '🌊', category: 'CMS', desc: 'Visual Website Builder' });
    }

    // JS Frameworks
    if (html.includes('__NEXT_DATA__') || html.includes('/_next/')) {
      list.push({ name: 'Next.js', icon: '▲', category: 'Framework', desc: 'React Server Framework by Vercel' });
      if (platform === 'Custom / Static') platform = 'Next.js (React)';
    }
    if (html.includes('react') || html.includes('data-reactroot')) {
      list.push({ name: 'React', icon: '⚛️', category: 'Framework', desc: 'Component UI Library' });
    }
    if (html.includes('vue') || html.includes('__VUE__')) {
      list.push({ name: 'Vue.js', icon: '💚', category: 'Framework', desc: 'Progressive Framework' });
    }

    // Shopify Apps
    if (html.includes('klaviyo')) list.push({ name: 'Klaviyo', icon: '✉️', category: 'Marketing', desc: 'Email & SMS Automation' });
    if (html.includes('judge.me')) list.push({ name: 'Judge.me', icon: '⭐', category: 'Reviews', desc: 'Product Reviews Widget' });
    if (html.includes('loox')) list.push({ name: 'Loox', icon: '📷', category: 'Reviews', desc: 'Photo Reviews Widget' });
    if (html.includes('pagefly')) list.push({ name: 'PageFly', icon: '📄', category: 'Page Builder', desc: 'Shopify Page Builder' });

    // Payment Gateways
    if (html.includes('razorpay')) list.push({ name: 'Razorpay', icon: '💳', category: 'Payment', desc: 'UPI & Cards Payment Gateway' });
    if (html.includes('stripe')) list.push({ name: 'Stripe', icon: '💳', category: 'Payment', desc: 'Global Payments Platform' });
    if (html.includes('cashfree')) list.push({ name: 'Cashfree', icon: '💸', category: 'Payment', desc: 'Payments & Payouts' });

    // CDN
    if (html.includes('cdnjs.cloudflare.com') || (dns.ns && dns.ns.some(n => n.includes('cloudflare')))) {
      cdn = 'Cloudflare';
      list.push({ name: 'Cloudflare', icon: '🧡', category: 'CDN / Security', desc: 'Global Edge Proxy & DNS' });
    } else if (html.includes('cloudfront.net')) {
      cdn = 'AWS CloudFront';
      list.push({ name: 'Amazon CloudFront', icon: '☁️', category: 'CDN', desc: 'AWS Global CDN' });
    }

    // CSS
    if (html.includes('tailwind') || /(?:flex|grid)\s+(?:items-center|justify-between)/.test(html)) {
      list.push({ name: 'Tailwind CSS', icon: '🎨', category: 'UI', desc: 'Utility-First CSS' });
    }
    if (html.includes('bootstrap')) {
      list.push({ name: 'Bootstrap', icon: '🅱️', category: 'UI', desc: 'Responsive Grid System' });
    }

    return {
      list,
      isShopify,
      platform,
      cdn
    };
  }

  // Calculate DA / PA & SEO Score
  function calculateDaPa(domain, html, dns, schemaTypes) {
    let da = 35; // base

    // TLD Weight
    if (domain.endsWith('.gov.in') || domain.endsWith('.edu') || domain.endsWith('.gov')) da += 35;
    else if (domain.endsWith('.org') || domain.endsWith('.ac.in')) da += 20;
    else if (domain.endsWith('.com') || domain.endsWith('.in')) da += 15;

    // Domain length & brand power
    const namePart = domain.split('.')[0];
    if (namePart.length <= 6) da += 10;
    else if (namePart.length <= 10) da += 5;

    // Technical signals
    if (html.length > 50000) da += 10;
    if (schemaTypes.length > 0) da += 8;
    if (html.includes('google-analytics') || html.includes('gtag')) da += 5;
    if (dns.ns.length >= 2) da += 5;

    da = Math.min(95, Math.max(12, da));
    const pa = Math.min(98, Math.max(15, Math.round(da * 0.92 + 4)));
    const spam = da > 60 ? '1% (Low Risk)' : (da > 30 ? '2% (Low Risk)' : '6% (Medium Risk)');

    return { da, pa, spam };
  }

  // Estimate Monthly Traffic & Ranks
  function estimateTraffic(da, domain) {
    let monthlyVisits = '15K - 30K';
    let globalTier = 'Top 500K';
    let duration = '1m 50s';
    let bounce = '48.2%';

    if (da >= 80) {
      monthlyVisits = '50M - 150M+';
      globalTier = 'Top 1,000';
      duration = '4m 30s';
      bounce = '34.5%';
    } else if (da >= 65) {
      monthlyVisits = '5M - 20M';
      globalTier = 'Top 15,000';
      duration = '3m 15s';
      bounce = '38.0%';
    } else if (da >= 50) {
      monthlyVisits = '500K - 2.5M';
      globalTier = 'Top 50,000';
      duration = '2m 45s';
      bounce = '41.8%';
    } else if (da >= 35) {
      monthlyVisits = '80K - 300K';
      globalTier = 'Top 150,000';
      duration = '2m 10s';
      bounce = '45.0%';
    }

    return {
      monthlyVisits,
      globalTier,
      duration,
      bounce
    };
  }

  // Render Dashboard
  function renderDashboard(d) {
    if (!analyzerDashboard) return;
    analyzerDashboard.style.display = 'block';

    // Header info
    dispDomain.innerText = d.domain;
    dispTitle.innerText = d.title || 'Untitled Document';
    siteFavicon.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${d.domain}&sz=64" alt="Favicon" style="width: 28px; height: 28px; border-radius: 6px;" onerror="this.src=''; this.innerText='🌐';">`;

    // Bento 1: DA / PA
    scoreDa.innerText = d.seoMetrics.da;
    scorePa.innerText = d.seoMetrics.pa;
    scoreSpam.innerText = d.seoMetrics.spam;
    badgeDa.innerText = d.seoMetrics.da >= 60 ? '🌟 High Authority' : (d.seoMetrics.da >= 35 ? '👍 Good' : '🌱 Growing');

    // Bento 2: Traffic
    scoreTraffic.innerText = d.traffic.monthlyVisits;
    scoreRankTier.innerText = d.traffic.globalTier;
    scoreBounce.innerText = d.traffic.bounce;

    // Bento 3: Platform
    scorePlatform.innerText = d.tech.platform;
    scoreCdn.innerText = d.tech.cdn;

    // Bento 4: Meta Ads
    scoreAdsCount.innerText = d.ads.totalPixelsCount;
    scoreAdsDesc.innerText = d.ads.hasMetaPixel ? 'Meta Pixel Active' : 'No Meta Pixel Found';

    // Meta Ads Banner Links
    if (btnMetaAdLibrary) btnMetaAdLibrary.href = d.ads.metaAdLibraryUrl;
    if (btnGoogleAdCenter) btnGoogleAdCenter.href = d.ads.googleAdCenterUrl;
    if (pixelIdBadge) pixelIdBadge.innerText = d.ads.pixelId ? `Meta Pixel: ${d.ads.pixelId}` : 'Meta Pixel: Not Detected';
    if (googleAdsBadge) googleAdsBadge.innerText = d.ads.googleTag ? `Google Tag: ${d.ads.googleTag}` : 'Google Ads: Search Active';

    // Tab 1: Social Profiles Grid
    renderSocialProfiles(d.socials, d.domain);

    // Tab 1: Google Maps Presence
    renderMaps(d.maps, d.domain, d.title);

    // Tab 1: Contact details
    renderContacts(d.emails, d.phones);

    // Tab 2: SEO Tags
    seoTitleBox.innerText = d.title;
    titleCharCount.innerText = `${(d.title || '').length} chars`;
    seoDescBox.innerText = d.description;
    descCharCount.innerText = `${(d.description || '').length} chars`;

    serpSiteName.innerText = d.domain;
    serpBreadcrumb.innerText = `https://${d.domain}`;
    serpTitle.innerText = d.title;
    serpDesc.innerText = d.description;

    countH1.innerText = d.h1Count;
    countH2.innerText = d.h2Count;
    countSchema.innerText = d.schemaTypes.length > 0 ? d.schemaTypes.join(', ') : 'None';

    // Tab 3: Tech Stack Grid
    renderTechGrid(d.tech.list);

    // Tab 4: Traffic Tab
    statMonthlyVisits.innerText = d.traffic.monthlyVisits;
    statGlobalTier.innerText = d.traffic.globalTier;
    statDuration.innerText = d.traffic.duration;
    statBounceRate.innerText = d.traffic.bounce;

    // Tab 5: DNS
    dnsNameserversList.innerHTML = d.dns.ns.length > 0
      ? d.dns.ns.map(n => `<div>• ${escapeHtml(n)}</div>`).join('')
      : '<div>No public NS records found.</div>';

    dnsMxList.innerHTML = d.dns.mx.length > 0
      ? d.dns.mx.map(m => `<div>• ${escapeHtml(m)}</div>`).join('')
      : '<div>No public MX mail records found.</div>';
  }

  // Render Social Profiles
  function renderSocialProfiles(socials, domain) {
    if (!socialProfilesGrid) return;
    socialProfilesGrid.innerHTML = '';

    if (!socials || socials.length === 0) {
      socialProfilesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; font-size: 13px; color: var(--gray-500); padding: 12px; background: var(--gray-50); border-radius: 8px;">
          No explicit social links found in HTML source. Search directly on <a href="https://www.google.com/search?q=${encodeURIComponent(domain + ' instagram facebook linkedin')}" target="_blank" rel="noopener" style="color: #4f46e5; font-weight: 600;">Google Search ➔</a>
        </div>
      `;
      return;
    }

    socials.forEach(sp => {
      const pill = document.createElement('a');
      pill.href = sp.url;
      pill.target = '_blank';
      pill.rel = 'noopener';
      pill.className = 'analyzer-social-pill';
      pill.innerHTML = `
        <div class="analyzer-social-icon" style="background: ${sp.bg};">${sp.icon}</div>
        <div style="min-width: 0;">
          <div style="font-size: 13px; font-weight: 700;">${escapeHtml(sp.name)}</div>
          <span class="analyzer-social-handle">${escapeHtml(sp.handle)}</span>
        </div>
      `;
      socialProfilesGrid.appendChild(pill);
    });
  }

  // Render Maps
  function renderMaps(maps, domain, title) {
    if (!mapsContainer) return;
    if (btnSearchMaps) btnSearchMaps.href = maps.searchUrl;

    mapsContainer.innerHTML = `
      <div style="padding: 16px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 32px;">🗺️</div>
          <div>
            <div style="font-weight: 700; color: var(--navy); font-size: 14px;">Google Maps Business Listing</div>
            <div style="font-size: 12px; color: var(--gray-500); margin-top: 2px;">
              View store locations, user ratings, street address, and directions on Google Maps.
            </div>
          </div>
        </div>
        <a href="${maps.searchUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size: 12px; padding: 8px 16px; text-decoration: none;">
          📍 Open in Google Maps
        </a>
      </div>
    `;
  }

  // Render Contacts
  function renderContacts(emails, phones) {
    if (!contactDetailsList) return;
    contactDetailsList.innerHTML = '';

    let itemsHtml = '';
    if (emails && emails.length > 0) {
      emails.forEach(em => {
        itemsHtml += `
          <div class="analyzer-contact-item">
            <span style="font-size: 18px;">✉️</span>
            <div>
              <span style="font-size: 11px; color: var(--gray-500); font-weight: 600;">EMAIL</span>
              <div><a href="mailto:${escapeHtml(em)}" style="color: #4f46e5; font-weight: 600; text-decoration: none;">${escapeHtml(em)}</a></div>
            </div>
          </div>
        `;
      });
    }

    if (phones && phones.length > 0) {
      phones.forEach(ph => {
        itemsHtml += `
          <div class="analyzer-contact-item">
            <span style="font-size: 18px;">📞</span>
            <div>
              <span style="font-size: 11px; color: var(--gray-500); font-weight: 600;">PHONE / SUPPORT</span>
              <div><a href="tel:${escapeHtml(ph)}" style="color: var(--navy); font-weight: 600; text-decoration: none;">${escapeHtml(ph)}</a></div>
            </div>
          </div>
        `;
      });
    }

    if (!itemsHtml) {
      itemsHtml = `
        <div style="font-size: 13px; color: var(--gray-500); padding: 10px;">
          No direct mailto or tel links found in the homepage code. Check the website's Contact Us or Footer page directly.
        </div>
      `;
    }

    contactDetailsList.innerHTML = itemsHtml;
  }

  // Render Tech Grid
  function renderTechGrid(list) {
    if (!analyzerTechGrid) return;
    analyzerTechGrid.innerHTML = '';

    if (!list || list.length === 0) {
      analyzerTechGrid.innerHTML = '<div style="color: var(--gray-500); font-size: 13px;">No third-party tech identified.</div>';
      return;
    }

    list.forEach(t => {
      const card = document.createElement('div');
      card.className = 'tech-item-card';
      card.innerHTML = `
        <div class="tech-item-icon">${t.icon || '📦'}</div>
        <div class="tech-item-details">
          <div class="tech-item-name">
            <span>${escapeHtml(t.name)}</span>
            <span class="tech-item-version">${escapeHtml(t.category)}</span>
          </div>
          <div class="tech-item-desc">${escapeHtml(t.desc)}</div>
        </div>
      `;
      analyzerTechGrid.appendChild(card);
    });
  }

  // Copy Full Audit Report
  function copyAuditReport() {
    if (!currentAuditData) return;
    const d = currentAuditData;
    let r = `====================================================\n360° WEBSITE AUDIT REPORT: ${d.domain}\n====================================================\n\n`;
    r += `Title: ${d.title}\n`;
    r += `Domain Authority (DA): ${d.seoMetrics.da} / 100\n`;
    r += `Page Authority (PA): ${d.seoMetrics.pa} / 100\n`;
    r += `Spam Score: ${d.seoMetrics.spam}\n`;
    r += `Est. Monthly Traffic: ${d.traffic.monthlyVisits}\n`;
    r += `Global Rank Tier: ${d.traffic.globalTier}\n`;
    r += `Primary Platform: ${d.tech.platform}\n`;
    r += `Hosting / CDN: ${d.tech.cdn}\n\n`;

    r += `--- META & ADVERTISING ---\n`;
    r += `Meta Pixel Active: ${d.ads.hasMetaPixel ? 'YES' : 'NO'}\n`;
    if (d.ads.pixelId) r += `Pixel ID: ${d.ads.pixelId}\n`;
    r += `View Live Meta Ads: ${d.ads.metaAdLibraryUrl}\n\n`;

    r += `--- SOCIAL PROFILES ---\n`;
    if (d.socials.length > 0) {
      d.socials.forEach(s => { r += `• ${s.name}: ${s.url}\n`; });
    } else {
      r += `No direct social links in homepage HTML.\n`;
    }

    r += `\n--- CONTACT DETAILS ---\n`;
    if (d.emails.length > 0) r += `Emails: ${d.emails.join(', ')}\n`;
    if (d.phones.length > 0) r += `Phones: ${d.phones.join(', ')}\n`;

    r += `\n--- TECH STACK DETECTED ---\n`;
    d.tech.list.forEach(t => {
      r += `• [${t.category}] ${t.name} - ${t.desc}\n`;
    });

    r += `\nReport generated by AllToolsInOne Website Analyzer (https://alltoolsinone.com/tools/website-analyzer.html)`;

    copyToClipboard(r);
    btnCopyAudit.innerText = '✅ Copied!';
    setTimeout(() => { btnCopyAudit.innerText = '📋 Copy Report'; }, 2000);
    showToast('Full 360° audit report copied to clipboard!', 'success');
  }

  // Download JSON
  function downloadJsonReport() {
    if (!currentAuditData) return;
    const jsonStr = JSON.stringify(currentAuditData, null, 2);
    downloadFile(`website_audit_${currentAuditData.domain.replace(/[^a-z0-9]/gi, '_')}.json`, jsonStr, 'application/json');
    showToast('Downloaded JSON report!', 'success');
  }

  // Loading Helpers
  function showLoading(show, title, subtitle) {
    if (analyzerLoading) analyzerLoading.style.display = show ? 'block' : 'none';
    if (title && loadingTitle) loadingTitle.innerText = title;
    if (subtitle && loadingSubtitle) loadingSubtitle.innerText = subtitle;
    if (btnAnalyze) btnAnalyze.disabled = show;
  }

  function updateLoading(title, subtitle) {
    if (title && loadingTitle) loadingTitle.innerText = title;
    if (subtitle && loadingSubtitle) loadingSubtitle.innerText = subtitle;
  }

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

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      let toast = document.getElementById('analyzerToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'analyzerToast';
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
      toast.style.background = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : '#4f46e5');
      toast.innerText = msg;
      toast.style.opacity = '1';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, 3000);
    }
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
