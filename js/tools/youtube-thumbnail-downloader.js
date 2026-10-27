/* ═══════════════════════════════════════════════════
   YOUTUBE THUMBNAIL DOWNLOADER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const ytUrl = document.getElementById('ytUrl');
  const btnFetch = document.getElementById('btnFetch');
  const btnPaste = document.getElementById('btnPaste');
  const urlError = document.getElementById('urlError');
  const resultsContainer = document.getElementById('resultsContainer');
  const thumbGrid = document.getElementById('thumbGrid');
  const videoIdLabel = document.getElementById('videoIdLabel');

  function extractYouTubeID(url) {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Regular expressions for various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = cleanUrl.match(patterns[i]);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  }

  // Force download via fetch & blob or invisible canvas
  async function downloadThumbnail(imageUrl, filename) {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Network error');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: direct window open or download attribute
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function fetchThumbnails() {
    const raw = ytUrl.value.trim();
    urlError.style.display = 'none';

    if (!raw) {
      urlError.textContent = 'Please enter or paste a valid YouTube video URL.';
      urlError.style.display = 'block';
      resultsContainer.style.display = 'none';
      return;
    }

    const videoId = extractYouTubeID(raw);
    if (!videoId) {
      urlError.textContent = 'Invalid YouTube URL. Please provide a standard link like https://youtube.com/watch?v=... or https://youtu.be/...';
      urlError.style.display = 'block';
      resultsContainer.style.display = 'none';
      return;
    }

    videoIdLabel.textContent = `Video ID: ${videoId}`;

    const resolutions = [
      {
        title: 'Full HD 1080p (MaxRes)',
        dimensions: '1920 × 1080',
        badge: 'Highest Quality',
        url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        filename: `${videoId}_1080p_maxres.jpg`
      },
      {
        title: 'High Definition (HQ)',
        dimensions: '1280 × 720',
        badge: '720p HD',
        url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        filename: `${videoId}_720p_hq.jpg`
      },
      {
        title: 'Standard Definition (SD)',
        dimensions: '640 × 480',
        badge: '480p SD',
        url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        filename: `${videoId}_480p_sd.jpg`
      },
      {
        title: 'Medium Quality (MQ)',
        dimensions: '320 × 180',
        badge: 'Mobile Size',
        url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        filename: `${videoId}_320p_mq.jpg`
      }
    ];

    thumbGrid.innerHTML = '';

    resolutions.forEach((res) => {
      const card = document.createElement('div');
      card.className = 'thumb-card';
      card.innerHTML = `
        <div class="thumb-img-wrapper">
          <span class="thumb-badge">${res.badge}</span>
          <img src="${res.url}" alt="${res.title}" loading="lazy" onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg';">
        </div>
        <div class="thumb-card-body">
          <div>
            <div style="font-weight: 600; font-size: 14px; color: var(--navy);">${res.title}</div>
            <div style="font-size: 12px; color: var(--gray-600);">${res.dimensions} • JPEG</div>
          </div>
          <button type="button" class="btn btn-primary btn-dl-thumb" style="padding: 6px 14px; font-size: 12px;">
            📥 Download
          </button>
        </div>
      `;

      card.querySelector('.btn-dl-thumb').addEventListener('click', () => {
        downloadThumbnail(res.url, res.filename);
      });

      thumbGrid.appendChild(card);
    });

    resultsContainer.style.display = 'block';
  }

  // Listeners
  btnFetch.addEventListener('click', fetchThumbnails);
  ytUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchThumbnails();
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        ytUrl.value = text;
        fetchThumbnails();
      }
    } catch (e) {
      ytUrl.focus();
    }
  });

  // Sample default
  ytUrl.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  fetchThumbnails();

})();
