/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — UTM Campaign URL Builder
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const utmBaseUrl = document.getElementById('utmBaseUrl');
  const utmSource = document.getElementById('utmSource');
  const utmMedium = document.getElementById('utmMedium');
  const utmCampaign = document.getElementById('utmCampaign');
  const utmTerm = document.getElementById('utmTerm');
  const utmContent = document.getElementById('utmContent');

  const utmUrlResult = document.getElementById('utmUrlResult');
  const btnTestLink = document.getElementById('btnTestLink');
  const btnCopySingleUtm = document.getElementById('btnCopySingleUtm');
  const utmQrCanvas = document.getElementById('utmQrCanvas');
  const btnDownloadQr = document.getElementById('btnDownloadQr');

  const multiChannelTableBody = document.getElementById('multiChannelTableBody');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');

  // Pill selectors
  document.querySelectorAll('.quick-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const targetId = pill.dataset.target;
      const val = pill.dataset.val;
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = val;
        updateUtmUrls();
      }
    });
  });

  // Inputs listening
  [utmBaseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent].forEach(inp => {
    inp.addEventListener('input', updateUtmUrls);
  });

  function cleanVal(str) {
    return (str || '').trim().replace(/\s+/g, '_');
  }

  function assembleUrl(base, source, medium, campaign, term, content) {
    if (!base) return '';
    let url;
    try {
      url = new URL(base.startsWith('http') ? base : 'https://' + base);
    } catch (e) {
      return '';
    }

    if (source) url.searchParams.set('utm_source', cleanVal(source));
    if (medium) url.searchParams.set('utm_medium', cleanVal(medium));
    if (campaign) url.searchParams.set('utm_campaign', cleanVal(campaign));
    if (term) url.searchParams.set('utm_term', cleanVal(term));
    if (content) url.searchParams.set('utm_content', cleanVal(content));

    return url.href;
  }

  function updateUtmUrls() {
    const base = utmBaseUrl.value.trim() || 'https://sarkaritools.in/exam-studio.html';
    const source = utmSource.value.trim() || 'whatsapp';
    const medium = utmMedium.value.trim() || 'chat';
    const campaign = utmCampaign.value.trim() || 'ssc_cgl_admit_card';
    const term = utmTerm.value.trim();
    const content = utmContent.value.trim();

    const mainTrackedUrl = assembleUrl(base, source, medium, campaign, term, content);

    utmUrlResult.textContent = mainTrackedUrl;
    btnTestLink.href = mainTrackedUrl;

    renderQrCode(mainTrackedUrl);
    renderMultiChannel(base, campaign, term, content);
  }

  function renderQrCode(url) {
    if (!url) return;
    const ctx = utmQrCanvas.getContext('2d');
    ctx.clearRect(0, 0, utmQrCanvas.width, utmQrCanvas.height);

    if (typeof QRCode !== 'undefined') {
      // Use hidden temp div for qrcode.js then draw to canvas
      const tempDiv = document.createElement('div');
      try {
        new QRCode(tempDiv, {
          text: url,
          width: 160,
          height: 160,
          correctLevel: QRCode.CorrectLevel.H
        });
        setTimeout(() => {
          const img = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
          if (img) {
            ctx.drawImage(img, 0, 0, 160, 160);
          }
        }, 80);
      } catch (err) {
        console.warn('QR render error:', err);
      }
    }
  }

  function renderMultiChannel(base, campaign, term, content) {
    multiChannelTableBody.innerHTML = '';

    const channels = [
      { name: 'WhatsApp Group / Chat', source: 'whatsapp', medium: 'chat', badge: 'dns-badge-ns' },
      { name: 'Instagram Bio & Stories', source: 'instagram', medium: 'social', badge: 'dns-badge-txt' },
      { name: 'Facebook Ads / Meta', source: 'facebook', medium: 'cpc', badge: 'dns-badge-a' },
      { name: 'Google Ads (Search/PPC)', source: 'google', medium: 'cpc', badge: 'dns-badge-mx' },
      { name: 'Email Newsletter', source: 'newsletter', medium: 'email', badge: 'dns-badge-cname' },
      { name: 'Offline Standee / Flyer QR', source: 'offline_standee', medium: 'qr_print', badge: 'dns-badge-aaaa' }
    ];

    channels.forEach(ch => {
      const chUrl = assembleUrl(base, ch.source, ch.medium, campaign, term, content);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="dns-type-badge ${ch.badge}">${ch.name}</span></td>
        <td style="font-family: monospace; font-size: 12px; color: var(--navy); word-break: break-all;">${escapeHtml(chUrl)}</td>
        <td style="text-align: center;">
          <button type="button" class="btn btn-outline btn-copy-ch" data-url="${escapeHtml(chUrl)}" style="font-size: 11px; padding: 2px 8px;">Copy</button>
        </td>
      `;
      multiChannelTableBody.appendChild(tr);
    });

    multiChannelTableBody.querySelectorAll('.btn-copy-ch').forEach(btn => {
      btn.addEventListener('click', () => {
        const urlToCopy = btn.dataset.url;
        navigator.clipboard.writeText(urlToCopy).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        });
      });
    });
  }

  // Copy Single
  btnCopySingleUtm.addEventListener('click', () => {
    const text = utmUrlResult.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopySingleUtm.textContent;
      btnCopySingleUtm.textContent = '✓ Copied Link!';
      setTimeout(() => { btnCopySingleUtm.textContent = orig; }, 2000);
    });
  });

  // Download QR Code
  btnDownloadQr.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = utmQrCanvas.toDataURL('image/png');
    a.download = `campaign-qr-${utmCampaign.value.trim() || 'link'}.png`;
    a.click();
  });

  // Export CSV
  btnDownloadCsv.addEventListener('click', () => {
    const base = utmBaseUrl.value.trim() || 'https://sarkaritools.in/';
    const campaign = utmCampaign.value.trim() || 'campaign_2026';
    const term = utmTerm.value.trim();
    const content = utmContent.value.trim();

    const channels = [
      { name: 'WhatsApp', source: 'whatsapp', medium: 'chat' },
      { name: 'Instagram', source: 'instagram', medium: 'social' },
      { name: 'Facebook Ads', source: 'facebook', medium: 'cpc' },
      { name: 'Google Ads', source: 'google', medium: 'cpc' },
      { name: 'Email Newsletter', source: 'newsletter', medium: 'email' },
      { name: 'Offline Print QR', source: 'offline_standee', medium: 'qr_print' }
    ];

    let csv = `Channel,Source,Medium,Campaign,Tracked_URL\n`;
    channels.forEach(ch => {
      const url = assembleUrl(base, ch.source, ch.medium, campaign, term, content);
      csv += `"${ch.name}","${ch.source}","${ch.medium}","${campaign}","${url}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utm-campaign-links-${campaign}.csv`;
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

  // Initial populate
  utmBaseUrl.value = 'https://sarkaritools.in/tools/exam-studio.html';
  utmSource.value = 'whatsapp';
  utmMedium.value = 'chat';
  utmCampaign.value = 'ssc_cgl_special';
  updateUtmUrls();

});
