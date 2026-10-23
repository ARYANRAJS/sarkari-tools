/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — Live Domain Availability Checker
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const domSearchInput = document.getElementById('domSearchInput');
  const btnCheckDomain = document.getElementById('btnCheckDomain');

  // Mode Tabs
  const modeTabs = document.querySelectorAll('#domainModeTabs .tool-tab');
  const panelMultiTld = document.getElementById('panelMultiTld');
  const panelBulkDom = document.getElementById('panelBulkDom');
  const panelSuggestions = document.getElementById('panelSuggestions');

  // Multi-TLD elements
  const multiProgressBox = document.getElementById('multiProgressBox');
  const multiProgressBar = document.getElementById('multiProgressBar');
  const multiProgressText = document.getElementById('multiProgressText');
  const multiProgressPct = document.getElementById('multiProgressPct');
  const primaryHeroBanner = document.getElementById('primaryHeroBanner');
  const multiResultsGrid = document.getElementById('multiResultsGrid');

  // Bulk elements
  const bulkInputArea = document.getElementById('bulkInputArea');
  const btnRunBulkCheck = document.getElementById('btnRunBulkCheck');
  const bulkResultsContainer = document.getElementById('bulkResultsContainer');
  const bulkTableBody = document.getElementById('bulkTableBody');
  const bulkAvailableCount = document.getElementById('bulkAvailableCount');
  const btnExportBulkCsv = document.getElementById('btnExportBulkCsv');

  // Suggestions elements
  const suggestionsList = document.getElementById('suggestionsList');

  let activeMode = 'multi';
  let bulkResultsData = [];

  // TLD Database with approx India retail pricing
  const TLD_PRICING = {
    'in': { price: '₹499/yr', reg: 'GoDaddy, BigRock, Hostinger' },
    'com': { price: '₹849/yr', reg: 'Namecheap, GoDaddy' },
    'co.in': { price: '₹399/yr', reg: 'BigRock, Hostinger' },
    'org': { price: '₹999/yr', reg: 'Namecheap, GoDaddy' },
    'net': { price: '₹1,099/yr', reg: 'Namecheap, GoDaddy' },
    'xyz': { price: '₹199/yr', reg: 'Hostinger, Namecheap' },
    'online': { price: '₹149/yr', reg: 'Hostinger, GoDaddy' },
    'store': { price: '₹249/yr', reg: 'Hostinger, BigRock' },
    'tech': { price: '₹399/yr', reg: 'Namecheap, Hostinger' },
    'info': { price: '₹499/yr', reg: 'GoDaddy, Namecheap' }
  };

  // Tab switching
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeMode = tab.dataset.mode;

      panelMultiTld.style.display = activeMode === 'multi' ? 'block' : 'none';
      panelBulkDom.style.display = activeMode === 'bulk' ? 'block' : 'none';
      panelSuggestions.style.display = activeMode === 'sugg' ? 'block' : 'none';

      if (activeMode === 'sugg' && suggestionsList.children.length === 0) {
        generateSuggestions();
      }
    });
  });

  // Quick Pills
  document.querySelectorAll('.quick-dom-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      domSearchInput.value = pill.dataset.name;
      triggerSearch();
    });
  });

  // Trigger search on Enter
  domSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerSearch();
  });

  btnCheckDomain.addEventListener('click', triggerSearch);

  function cleanQuery(input) {
    let raw = (input || '').trim().toLowerCase();
    raw = raw.replace(/^https?:\/\//i, '');
    raw = raw.replace(/^www\./i, '');
    raw = raw.split('/')[0];
    raw = raw.split('?')[0];
    raw = raw.split(':')[0];
    raw = raw.replace(/[^a-z0-9.-]/g, '');
    return raw;
  }

  function splitDomainAndTld(raw) {
    const knownTlds = ['co.in', 'org.in', 'net.in', 'gov.in', 'ac.in', 'edu.in', 'com', 'in', 'org', 'net', 'xyz', 'online', 'store', 'tech', 'info', 'biz', 'io', 'ai'];
    for (const t of knownTlds) {
      if (raw.endsWith('.' + t)) {
        const stem = raw.substring(0, raw.length - t.length - 1);
        return { stem, tld: t, hasTld: true };
      }
    }
    return { stem: raw, tld: 'com', hasTld: false };
  }

  // Live Dynamic Registry (RDAP) + DoH Query
  async function checkDomainLive(domain) {
    try {
      // 1. Primary Authority Check: Official ICANN RDAP (Registration Data Access Protocol)
      // Directly queries the official TLD Registry (.in NIXI, .com/.net Verisign, .org PIR, etc.)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      let rdapChecked = false;
      let rdapStatus = null;
      let registrarName = '';

      try {
        const rdapRes = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
          headers: { 'accept': 'application/rdap+json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        rdapChecked = true;
        rdapStatus = rdapRes.status;

        if (rdapRes.status === 200) {
          // Status 200 means domain is officially registered in Registry database (TAKEN!)
          const rdapJson = await rdapRes.json().catch(() => null);
          const regObj = rdapJson?.entities?.find(e => e.roles?.includes('registrar'));
          registrarName = regObj?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || '';
          return { available: false, domain, registrar: registrarName };
        } else if (rdapRes.status === 404) {
          // Status 404 means domain does NOT exist in Registry (Available!)
          // Continue to double verify with DNS
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // RDAP timeout / network error, proceed to DNS fallback
      }

      // 2. Secondary Verification: Cloudflare DNS over HTTPS
      const cfRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=SOA`, {
        headers: { 'accept': 'application/dns-json' },
        cache: 'no-store'
      });

      if (cfRes.ok) {
        const data = await cfRes.json();
        // If DNS has active records, it is definitely TAKEN
        if (data.Status === 0 && (data.Answer || data.Authority?.some(a => a.name === domain))) {
          return { available: false, domain };
        }

        // If RDAP confirmed 404 and DNS is Status 3 (NXDOMAIN) -> 100% Available!
        if (rdapChecked && rdapStatus === 404 && data.Status === 3) {
          return { available: true, domain };
        }
      }

      // If RDAP returned 404, trust official registry that domain is available
      if (rdapChecked && rdapStatus === 404) {
        return { available: true, domain };
      }

      // 3. Fallback: Google DNS over HTTPS
      const gRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
        cache: 'no-store'
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.Status === 0 && gData.Answer && gData.Answer.length > 0) {
          return { available: false, domain };
        }
      }

      // If RDAP was checked, return based on RDAP status
      if (rdapChecked) {
        return { available: rdapStatus === 404, domain };
      }

      // If neither could definitively prove availability, mark taken/protected for safety
      return { available: false, domain, error: true };
    } catch (e) {
      console.warn(`Domain check failed for ${domain}:`, e);
      return { available: false, domain, error: true };
    }
  }

  function getRegistrarLink(domain) {
    return `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(domain)}`;
  }

  function triggerSearch() {
    const raw = domSearchInput.value;
    const clean = cleanQuery(raw);

    if (!clean) {
      alert('Please enter a name or domain to check.');
      domSearchInput.focus();
      return;
    }

    if (activeMode === 'multi') {
      runMultiScan(clean);
    } else if (activeMode === 'bulk') {
      bulkInputArea.value = `${clean}.com\n${clean}.in\n${clean}.co.in\n${clean}.org\n${clean}.net`;
      runBulkCheck();
    } else {
      generateSuggestions(clean);
    }
  }

  // ════════════ MULTI-TLD SCANNER ════════════
  async function runMultiScan(inputQuery) {
    const { stem, tld, hasTld } = splitDomainAndTld(inputQuery);

    // Get selected TLDs
    const selectedTlds = Array.from(document.querySelectorAll('.tld-toggle:checked')).map(cb => cb.value);
    if (selectedTlds.length === 0) {
      selectedTlds.push('com', 'in');
    }

    // Ensure the specific searched TLD is included first
    let tldsToScan = [...selectedTlds];
    if (hasTld && !tldsToScan.includes(tld)) {
      tldsToScan.unshift(tld);
    } else if (hasTld) {
      tldsToScan = [tld, ...tldsToScan.filter(t => t !== tld)];
    }

    multiProgressBox.style.display = 'block';
    multiProgressBar.style.width = '0%';
    multiProgressPct.textContent = '0%';
    multiResultsGrid.innerHTML = '';
    primaryHeroBanner.style.display = 'none';

    // Build initial placeholder cards
    const cardMap = {};
    tldsToScan.forEach(ext => {
      const fullDom = `${stem}.${ext}`;
      const card = createPlaceholderCard(fullDom, ext);
      multiResultsGrid.appendChild(card);
      cardMap[fullDom] = card;
    });

    let completed = 0;
    const total = tldsToScan.length;

    // Scan each domain dynamically in parallel
    const promises = tldsToScan.map(async (ext) => {
      const fullDom = `${stem}.${ext}`;
      const res = await checkDomainLive(fullDom);

      completed++;
      const pct = Math.round((completed / total) * 100);
      multiProgressBar.style.width = `${pct}%`;
      multiProgressPct.textContent = `${pct}%`;
      multiProgressText.textContent = `Checked ${completed} of ${total} TLDs (${fullDom})...`;

      const card = cardMap[fullDom];
      if (card) {
        updateCardWithResult(card, fullDom, ext, res.available, res);
      }

      // If this was the exact domain user typed, update primary hero banner
      if (hasTld && fullDom === `${stem}.${tld}`) {
        renderHeroBanner(fullDom, res.available);
      }

      return res;
    });

    await Promise.all(promises);

    multiProgressText.textContent = `Completed! Verified ${total} TLDs in real time.`;
    setTimeout(() => {
      multiProgressBox.style.display = 'none';
    }, 1500);

    // Also pre-generate suggestions in background
    generateSuggestions(stem);
  }

  function createPlaceholderCard(fullDom, ext) {
    const card = document.createElement('div');
    card.className = 'domain-result-card is-checking';
    const price = TLD_PRICING[ext]?.price || '₹699/yr';

    card.innerHTML = `
      <div class="domain-name-wrap">
        <span class="domain-ext-badge">.${ext}</span>
        <div>
          <div class="domain-full-name">${escapeHtml(fullDom)}</div>
          <div style="font-size: 12px; color: var(--gray-500);">Checking global authoritative nameservers...</div>
        </div>
      </div>
      <div class="domain-actions-group">
        <span class="domain-status-badge checking">⏳ Checking</span>
        <span class="domain-price-pill">${price}</span>
      </div>
    `;
    return card;
  }

  function updateCardWithResult(card, fullDom, ext, isAvailable, res) {
    const price = TLD_PRICING[ext]?.price || '₹699/yr';
    card.className = `domain-result-card ${isAvailable ? 'is-available' : 'is-taken'}`;

    if (isAvailable) {
      card.innerHTML = `
        <div class="domain-name-wrap">
          <span class="domain-ext-badge" style="background: #16a34a;">.${ext}</span>
          <div>
            <div class="domain-full-name">${escapeHtml(fullDom)}</div>
            <div style="font-size: 12px; color: #16a34a; font-weight: 600;">✓ Available to register right now!</div>
          </div>
        </div>
        <div class="domain-actions-group">
          <span class="domain-status-badge available">● Available</span>
          <span class="domain-price-pill">${price}</span>
          <a href="${getRegistrarLink(fullDom)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 13px; padding: 6px 14px; text-decoration: none;">
            🛒 Buy / Register
          </a>
        </div>
      `;
    } else {
      const regDetail = res && res.registrar ? `Registered with ${escapeHtml(res.registrar)}` : 'Registered / Taken by someone else';
      card.innerHTML = `
        <div class="domain-name-wrap">
          <span class="domain-ext-badge" style="background: #475569;">.${ext}</span>
          <div>
            <div class="domain-full-name" style="color: #64748b; text-decoration: line-through;">${escapeHtml(fullDom)}</div>
            <div style="font-size: 12px; color: #dc2626; font-weight: 500;">🔒 ${regDetail}</div>
          </div>
        </div>
        <div class="domain-actions-group">
          <span class="domain-status-badge taken">🔒 Taken</span>
          <a href="whois-lookup.html" onclick="sessionStorage.setItem('whois_query', '${escapeHtml(fullDom)}')" class="btn btn-outline" style="font-size: 12px; padding: 5px 10px; text-decoration: none;">
            🔍 WHOIS Info
          </a>
          <a href="da-pa-checker.html" class="btn btn-outline" style="font-size: 12px; padding: 5px 10px; text-decoration: none;">
            📊 Check DA/PA
          </a>
        </div>
      `;
    }
  }

  function renderHeroBanner(domain, isAvailable) {
    primaryHeroBanner.style.display = 'block';
    if (isAvailable) {
      primaryHeroBanner.style.background = '#dcfce7';
      primaryHeroBanner.style.border = '2px solid #86efac';
      primaryHeroBanner.innerHTML = `
        <div style="font-size: 24px; font-weight: 800; color: #15803d; margin-bottom: 4px;">🎉 Yes! ${escapeHtml(domain)} is Available!</div>
        <div style="font-size: 14px; color: #166534; margin-bottom: 12px;">Grab this domain before someone else registers it.</div>
        <a href="${getRegistrarLink(domain)}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size: 14px; padding: 10px 24px; text-decoration: none;">
          ⚡ Register ${escapeHtml(domain)} Now
        </a>
      `;
    } else {
      primaryHeroBanner.style.background = '#fee2e2';
      primaryHeroBanner.style.border = '2px solid #fca5a5';
      primaryHeroBanner.innerHTML = `
        <div style="font-size: 22px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">🔒 Sorry, ${escapeHtml(domain)} is Already Taken.</div>
        <div style="font-size: 13px; color: #7f1d1d;">Check the other TLD extensions (.in, .co.in, .org) below or explore smart name alternatives.</div>
      `;
    }
  }

  // ════════════ BULK CHECKER ════════════
  btnRunBulkCheck.addEventListener('click', runBulkCheck);

  async function runBulkCheck() {
    const raw = bulkInputArea.value.trim();
    if (!raw) {
      alert('Please enter at least one domain to check.');
      return;
    }

    const lines = raw.split(/\r?\n/).map(l => cleanQuery(l)).filter(Boolean).slice(0, 20);
    if (lines.length === 0) return;

    bulkResultsContainer.style.display = 'block';
    bulkTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--navy); font-weight: 600;">Checking ${lines.length} domains in real time...</td></tr>`;

    bulkResultsData = [];
    let availableCount = 0;

    const results = [];
    for (const dom of lines) {
      const res = await checkDomainLive(dom);
      results.push(res);
      if (res.available) availableCount++;
    }

    bulkResultsData = results;
    bulkAvailableCount.textContent = availableCount;

    bulkTableBody.innerHTML = '';
    results.forEach(item => {
      const parts = item.domain.split('.');
      const ext = parts[parts.length - 1];
      const price = TLD_PRICING[ext]?.price || '₹699/yr';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--navy); font-size: 14px;">${escapeHtml(item.domain)}</td>
        <td style="text-align: center;">
          ${item.available 
            ? '<span class="domain-status-badge available">● Available</span>' 
            : '<span class="domain-status-badge taken">🔒 Taken</span>'}
        </td>
        <td style="text-align: center; font-weight: 600; color: var(--saffron-dark);">${price}</td>
        <td style="text-align: center;">
          ${item.available 
            ? `<a href="${getRegistrarLink(item.domain)}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size: 11px; padding: 4px 10px; text-decoration: none;">Buy Now</a>`
            : `<a href="whois-lookup.html" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px; text-decoration: none;">WHOIS</a>`}
        </td>
      `;
      bulkTableBody.appendChild(tr);
    });
  }

  // Export Bulk CSV
  btnExportBulkCsv.addEventListener('click', () => {
    if (bulkResultsData.length === 0) return;
    let csv = `Domain,Status,Estimated_Price\n`;
    bulkResultsData.forEach(r => {
      const parts = r.domain.split('.');
      const ext = parts[parts.length - 1];
      const price = TLD_PRICING[ext]?.price || '₹699/yr';
      csv += `"${r.domain}","${r.available ? 'AVAILABLE' : 'TAKEN'}","${price}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domain-availability-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ════════════ SMART NAME SUGGESTIONS ════════════
  async function generateSuggestions(stem) {
    const query = cleanQuery(stem || domSearchInput.value || 'sarkarihub');
    const base = splitDomainAndTld(query).stem;

    const variations = [
      `${base}.in`,
      `get${base}.com`,
      `the${base}.com`,
      `${base}online.in`,
      `${base}hub.com`,
      `${base}india.in`,
      `${base}portal.com`,
      `${base}point.in`
    ];

    suggestionsList.innerHTML = '<div style="color: var(--gray-500); font-size: 13px; grid-column: 1/-1; text-align: center; padding: 20px;">Generating &amp; live-checking brandable variations...</div>';

    const cardsHtml = await Promise.all(variations.map(async (dom) => {
      const res = await checkDomainLive(dom);
      return `
        <div class="domain-sugg-card" style="border-left: 4px solid ${res.available ? '#16a34a' : '#94a3b8'};">
          <div>
            <div style="font-weight: 700; color: var(--navy); font-size: 14px;">${escapeHtml(dom)}</div>
            <div style="font-size: 11px; color: ${res.available ? '#16a34a' : '#64748b'}; font-weight: 600;">
              ${res.available ? '✓ Available to Buy' : 'Taken'}
            </div>
          </div>
          ${res.available 
            ? `<a href="${getRegistrarLink(dom)}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size: 11px; padding: 4px 10px; text-decoration: none;">Get It</a>`
            : `<span style="font-size: 11px; color: #94a3b8;">Registered</span>`}
        </div>
      `;
    }));

    suggestionsList.innerHTML = cardsHtml.join('');
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

  // Initial trigger with sarkarihub
  domSearchInput.value = 'sarkarihub';
  triggerSearch();

});
