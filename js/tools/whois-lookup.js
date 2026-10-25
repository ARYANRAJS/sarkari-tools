/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — Domain WHOIS & DNS Checker
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const domainInput = document.getElementById('domainInput');
  const btnLookup = document.getElementById('btnLookup');
  const lookupLoading = document.getElementById('lookupLoading');
  const lookupResults = document.getElementById('lookupResults');

  // Overview elements
  const resDomainName = document.getElementById('resDomainName');
  const resTld = document.getElementById('resTld');
  const resDomainStatus = document.getElementById('resDomainStatus');
  const resIpAddress = document.getElementById('resIpAddress');
  const resHostingProvider = document.getElementById('resHostingProvider');
  const resAge = document.getElementById('resAge');
  const resSecurityScore = document.getElementById('resSecurityScore');
  const resEmailSec = document.getElementById('resEmailSec');

  const dnsTableBody = document.getElementById('dnsTableBody');
  const authAuditList = document.getElementById('authAuditList');
  const btnCopyDns = document.getElementById('btnCopyDns');
  const btnDownloadDns = document.getElementById('btnDownloadDns');

  // Counter elements
  const countAll = document.getElementById('countAll');
  const countA = document.getElementById('countA');
  const countAAAA = document.getElementById('countAAAA');
  const countMX = document.getElementById('countMX');
  const countTXT = document.getElementById('countTXT');
  const countNS = document.getElementById('countNS');

  let currentRecords = [];
  let currentDomain = '';
  let activeFilter = 'ALL';

  // Sample buttons
  document.querySelectorAll('.quick-sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      domainInput.value = btn.dataset.domain;
      performLookup();
    });
  });

  // Enter key trigger
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performLookup();
    }
  });

  btnLookup.addEventListener('click', performLookup);

  function cleanDomain(input) {
    let raw = (input || '').trim().toLowerCase();
    raw = raw.replace(/^https?:\/\//i, '');
    raw = raw.replace(/^www\./i, '');
    raw = raw.split('/')[0];
    raw = raw.split('?')[0];
    raw = raw.split(':')[0];
    return raw;
  }

  async function queryDoH(domain, type) {
    try {
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
      const res = await fetch(url, {
        headers: { 'accept': 'application/dns-json' },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.Answer || [];
    } catch (err) {
      // Fallback to Google DoH
      try {
        const gUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
        const gRes = await fetch(gUrl, { cache: 'no-store' });
        if (!gRes.ok) throw new Error(`Google HTTP ${gRes.status}`);
        const gData = await gRes.json();
        return gData.Answer || [];
      } catch (e2) {
        console.warn(`DNS lookup failed for ${type}:`, e2);
        return [];
      }
    }
  }

  const TYPE_MAP = {
    1: 'A',
    28: 'AAAA',
    15: 'MX',
    16: 'TXT',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA'
  };

  async function performLookup() {
    const rawVal = domainInput.value;
    const domain = cleanDomain(rawVal);

    if (!domain || !domain.includes('.')) {
      alert('Please enter a valid domain name (e.g. google.com or sarkariresult.com)');
      domainInput.focus();
      return;
    }

    currentDomain = domain;
    lookupLoading.style.display = 'block';
    lookupResults.style.display = 'none';

    try {
      // Fetch all DNS record types in parallel
      const [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords, dmarcRecords] = await Promise.all([
        queryDoH(domain, 'A'),
        queryDoH(domain, 'AAAA'),
        queryDoH(domain, 'MX'),
        queryDoH(domain, 'TXT'),
        queryDoH(domain, 'NS'),
        queryDoH(`_dmarc.${domain}`, 'TXT')
      ]);

      const allFetched = [
        ...aRecords.map(r => ({ ...r, resolvedType: 'A' })),
        ...aaaaRecords.map(r => ({ ...r, resolvedType: 'AAAA' })),
        ...mxRecords.map(r => ({ ...r, resolvedType: 'MX' })),
        ...txtRecords.map(r => ({ ...r, resolvedType: 'TXT' })),
        ...nsRecords.map(r => ({ ...r, resolvedType: 'NS' })),
        ...dmarcRecords.map(r => ({ ...r, resolvedType: 'TXT', isDmarc: true }))
      ];

      currentRecords = allFetched;

      renderOverview(domain, allFetched);
      renderTabsCount(allFetched);
      renderTable(allFetched, activeFilter);
      renderEmailAudit(allFetched, domain);

      lookupLoading.style.display = 'none';
      lookupResults.style.display = 'block';

      // Scroll to results
      lookupResults.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      lookupLoading.style.display = 'none';
      alert('Error fetching DNS records. Please check the domain name and your internet connection.');
      console.error(err);
    }
  }

  function detectProvider(records) {
    const nsText = records.filter(r => r.resolvedType === 'NS').map(r => r.data.toLowerCase()).join(' ');
    if (nsText.includes('cloudflare')) return 'Cloudflare Managed DNS';
    if (nsText.includes('awsdns')) return 'Amazon Route 53 (AWS)';
    if (nsText.includes('googledomains') || nsText.includes('google')) return 'Google Cloud DNS';
    if (nsText.includes('domaincontrol') || nsText.includes('godaddy')) return 'GoDaddy DNS';
    if (nsText.includes('hostinger')) return 'Hostinger Nameservers';
    if (nsText.includes('namecheap')) return 'Namecheap DNS';
    if (nsText.includes('bluehost')) return 'Bluehost Hosting';
    if (nsText.includes('digitalocean')) return 'DigitalOcean DNS';
    if (nsText) return 'Custom Authoritative DNS';
    return 'Managed Nameservers';
  }

  function renderOverview(domain, records) {
    resDomainName.textContent = domain;
    
    // TLD
    const parts = domain.split('.');
    const tld = '.' + parts.slice(1).join('.');
    resTld.textContent = `TLD: ${tld.toUpperCase()}`;

    // A records / IP
    const aRecs = records.filter(r => r.resolvedType === 'A');
    if (aRecs.length > 0) {
      resDomainStatus.innerHTML = '<span style="color:#16a34a;">● Live &amp; Resolving</span>';
      resIpAddress.textContent = `IPv4: ${aRecs[0].data}${aRecs.length > 1 ? ` (+${aRecs.length - 1} more)` : ''}`;
    } else {
      resDomainStatus.innerHTML = '<span style="color:#eab308;">● No IPv4 Record</span>';
      resIpAddress.textContent = 'IP: Not resolved';
    }

    // Host
    const provider = detectProvider(records);
    resHostingProvider.textContent = provider;

    // Mail Host
    const mxRecs = records.filter(r => r.resolvedType === 'MX').map(r => r.data.toLowerCase()).join(' ');
    let mailProvider = 'No MX configured';
    if (mxRecs.includes('google') || mxRecs.includes('aspmx')) mailProvider = 'Google Workspace Mail';
    else if (mxRecs.includes('outlook') || mxRecs.includes('microsoft')) mailProvider = 'Microsoft 365 Exchange';
    else if (mxRecs.includes('zoho')) mailProvider = 'Zoho Mail India';
    else if (mxRecs.includes('proton')) mailProvider = 'ProtonMail Secure';
    else if (mxRecs) mailProvider = 'Self-hosted Mail Server';
    resAge.textContent = mailProvider;

    // Security score
    let score = 40;
    const hasA = aRecs.length > 0;
    const hasMX = records.some(r => r.resolvedType === 'MX');
    const hasSPF = records.some(r => r.resolvedType === 'TXT' && r.data.toLowerCase().includes('v=spf1'));
    const hasDMARC = records.some(r => r.isDmarc || (r.resolvedType === 'TXT' && r.data.toLowerCase().includes('v=dmarc1')));

    if (hasA) score += 20;
    if (hasMX) score += 10;
    if (hasSPF) score += 15;
    if (hasDMARC) score += 15;

    resSecurityScore.textContent = `${score}/100`;
    resSecurityScore.style.color = score >= 80 ? '#16a34a' : (score >= 60 ? '#ca8a04' : '#dc2626');
    resEmailSec.textContent = `SPF: ${hasSPF ? 'Configured ✓' : 'Missing ✗'} | DMARC: ${hasDMARC ? 'Protected ✓' : 'Missing ✗'}`;
  }

  function renderTabsCount(records) {
    countAll.textContent = records.length;
    countA.textContent = records.filter(r => r.resolvedType === 'A').length;
    countAAAA.textContent = records.filter(r => r.resolvedType === 'AAAA').length;
    countMX.textContent = records.filter(r => r.resolvedType === 'MX').length;
    countTXT.textContent = records.filter(r => r.resolvedType === 'TXT').length;
    countNS.textContent = records.filter(r => r.resolvedType === 'NS').length;
  }

  // Filter tabs handling
  document.querySelectorAll('#dnsTabs .tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#dnsTabs .tool-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.type;
      renderTable(currentRecords, activeFilter);
    });
  });

  function renderTable(records, filter) {
    dnsTableBody.innerHTML = '';

    const filtered = filter === 'ALL' 
      ? records 
      : records.filter(r => r.resolvedType === filter);

    if (filtered.length === 0) {
      dnsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--gray-500);">No ${filter} records found for this domain.</td></tr>`;
      return;
    }

    filtered.forEach(rec => {
      const type = rec.resolvedType || TYPE_MAP[rec.type] || 'RECORD';
      const badgeClass = `dns-badge-${type.toLowerCase()}`;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="dns-type-badge ${badgeClass}">${type}</span></td>
        <td style="color: var(--gray-700);">${escapeHtml(rec.name || currentDomain)}</td>
        <td style="color: var(--navy); font-weight: 500;">${escapeHtml(rec.data || '')}</td>
        <td style="color: var(--gray-500);">${rec.TTL || 300}s</td>
      `;
      dnsTableBody.appendChild(tr);
    });
  }

  function renderEmailAudit(records, domain) {
    authAuditList.innerHTML = '';

    const spfRec = records.find(r => r.resolvedType === 'TXT' && r.data.toLowerCase().includes('v=spf1'));
    const dmarcRec = records.find(r => r.isDmarc || (r.resolvedType === 'TXT' && r.data.toLowerCase().includes('v=dmarc1')));
    const mxRecs = records.filter(r => r.resolvedType === 'MX');

    // SPF check
    const spfItem = document.createElement('div');
    spfItem.className = 'seo-audit-item';
    if (spfRec) {
      spfItem.innerHTML = `
        <div class="seo-audit-icon pass">✓</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">SPF (Sender Policy Framework) Validated</div>
          <div class="seo-audit-detail"><code>${escapeHtml(spfRec.data)}</code></div>
        </div>
      `;
    } else {
      spfItem.innerHTML = `
        <div class="seo-audit-icon fail">✗</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">SPF Record Not Detected</div>
          <div class="seo-audit-detail">Without SPF, spammers can spoof emails from your domain name. Add a TXT record with <code>v=spf1 include:... ~all</code>.</div>
        </div>
      `;
    }
    authAuditList.appendChild(spfItem);

    // DMARC check
    const dmarcItem = document.createElement('div');
    dmarcItem.className = 'seo-audit-item';
    if (dmarcRec) {
      dmarcItem.innerHTML = `
        <div class="seo-audit-icon pass">✓</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">DMARC Policy Configured</div>
          <div class="seo-audit-detail"><code>${escapeHtml(dmarcRec.data)}</code></div>
        </div>
      `;
    } else {
      dmarcItem.innerHTML = `
        <div class="seo-audit-icon warn">!</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">DMARC Policy Missing (_dmarc.${domain})</div>
          <div class="seo-audit-detail">Google and Yahoo now require DMARC compliance to ensure your emails reach inbox instead of spam. Add a TXT record for <code>_dmarc.${domain}</code>.</div>
        </div>
      `;
    }
    authAuditList.appendChild(dmarcItem);

    // MX check
    const mxItem = document.createElement('div');
    mxItem.className = 'seo-audit-item';
    if (mxRecs.length > 0) {
      mxItem.innerHTML = `
        <div class="seo-audit-icon pass">✓</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">${mxRecs.length} Mail Exchange (MX) Server(s) Active</div>
          <div class="seo-audit-detail">Incoming mail routing is healthy and verified.</div>
        </div>
      `;
    } else {
      mxItem.innerHTML = `
        <div class="seo-audit-icon warn">!</div>
        <div class="seo-audit-info">
          <div class="seo-audit-title">No MX Records Found</div>
          <div class="seo-audit-detail">This domain cannot receive incoming business emails at @${domain}.</div>
        </div>
      `;
    }
    authAuditList.appendChild(mxItem);
  }

  // Copy to clipboard
  btnCopyDns.addEventListener('click', () => {
    if (currentRecords.length === 0) return;
    const txt = formatDnsReport(currentDomain, currentRecords);
    navigator.clipboard.writeText(txt).then(() => {
      const orig = btnCopyDns.textContent;
      btnCopyDns.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => { btnCopyDns.textContent = orig; }, 2000);
    });
  });

  // Download Report
  btnDownloadDns.addEventListener('click', () => {
    if (currentRecords.length === 0) return;
    const txt = formatDnsReport(currentDomain, currentRecords);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dns-report-${currentDomain}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function formatDnsReport(domain, records) {
    let out = `DNS & WHOIS AUDIT REPORT\n`;
    out += `Domain: ${domain}\n`;
    out += `Generated On: ${new Date().toLocaleString()}\n`;
    out += `Provider: ${detectProvider(records)}\n`;
    out += `=====================================================\n\n`;

    records.forEach(r => {
      out += `[${r.resolvedType}]  ${r.name}  ->  ${r.data}  (TTL: ${r.TTL}s)\n`;
    });

    out += `\n=====================================================\n`;
    out += `Report generated by AllToolsInOne (alltoolsinone.com)\n`;
    return out;
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

});
