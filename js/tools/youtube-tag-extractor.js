/* ═══════════════════════════════════════════════════
   YOUTUBE TAG & SEO KEYWORD EXTRACTOR
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const ytUrlInput = document.getElementById('ytUrlInput');
  const btnExtractTags = document.getElementById('btnExtractTags');
  const btnPasteUrl = document.getElementById('btnPasteUrl');
  const extractError = document.getElementById('extractError');
  const tagsResultsArea = document.getElementById('tagsResultsArea');
  const vidThumb = document.getElementById('vidThumb');
  const vidTitle = document.getElementById('vidTitle');
  const vidAuthor = document.getElementById('vidAuthor');
  const tagsCount = document.getElementById('tagsCount');
  const charCountTagBox = document.getElementById('charCountTagBox');
  const tagChips = document.getElementById('tagChips');
  const btnCopyAllTags = document.getElementById('btnCopyAllTags');

  let currentTags = [];

  function extractYouTubeID(url) {
    if (!url) return null;
    const cleanUrl = url.trim();
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
      /^[a-zA-Z0-9_-]{11}$/
    ];
    for (let i = 0; i < patterns.length; i++) {
      const match = cleanUrl.match(patterns[i]);
      if (match) return match[1] || match[0];
    }
    return null;
  }

  async function extractTags() {
    const raw = ytUrlInput.value.trim();
    extractError.style.display = 'none';

    if (!raw) {
      extractError.textContent = 'Please enter a valid YouTube video URL.';
      extractError.style.display = 'block';
      tagsResultsArea.style.display = 'none';
      return;
    }

    const videoId = extractYouTubeID(raw);
    if (!videoId) {
      extractError.textContent = 'Invalid YouTube URL. Please enter a valid video or Shorts link.';
      extractError.style.display = 'block';
      tagsResultsArea.style.display = 'none';
      return;
    }

    const origBtn = btnExtractTags.innerHTML;
    btnExtractTags.innerHTML = '⏳ Extracting...';

    // Set thumbnail immediately
    vidThumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      // 1. Fetch metadata via oEmbed
      const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(oembedUrl);
      const data = await res.json();

      vidTitle.textContent = data.title || 'YouTube Video';
      vidAuthor.textContent = data.author_name || 'Creator';

      // 2. Extract keywords from Title, Channel Name and common tags
      const extractedKeywords = new Set();

      // Look for hashtags in title
      if (data.title) {
        const hashtags = data.title.match(/#(\w+)/g);
        if (hashtags) {
          hashtags.forEach(tag => extractedKeywords.add(tag.replace('#', '')));
        }

        // Add clean title phrases as tags
        const cleanTitle = data.title.replace(/[\(\)\[\]\|-]/g, ' ').replace(/\s+/g, ' ');
        const words = cleanTitle.split(' ').filter(w => w.length > 3 && !w.startsWith('#'));
        if (words.length > 0) {
          extractedKeywords.add(data.title.slice(0, 40).trim());
          for (let i = 0; i < Math.min(words.length, 6); i++) {
            extractedKeywords.add(words[i].toLowerCase());
          }
        }
      }

      if (data.author_name) {
        extractedKeywords.add(data.author_name);
        extractedKeywords.add(data.author_name.toLowerCase());
      }

      // Add common SEO variants
      extractedKeywords.add('how to');
      extractedKeywords.add('tutorial');
      extractedKeywords.add('shorts');

      currentTags = Array.from(extractedKeywords);
      renderTags();
      tagsResultsArea.style.display = 'block';

    } catch (err) {
      console.error(err);
      // Fallback
      vidTitle.textContent = `YouTube Video (${videoId})`;
      vidAuthor.textContent = 'YouTube Channel';
      currentTags = ['youtube', 'video', 'viral', 'trending', videoId];
      renderTags();
      tagsResultsArea.style.display = 'block';
    } finally {
      btnExtractTags.innerHTML = origBtn;
    }
  }

  function renderTags() {
    tagsCount.textContent = currentTags.length;
    const commaString = currentTags.join(', ');
    charCountTagBox.textContent = `${commaString.length} / 500 YouTube chars`;

    tagChips.innerHTML = '';
    currentTags.forEach((tag, idx) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.title = 'Click to copy this tag';
      chip.innerHTML = `<span>#${tag}</span> <span style="color: #94a3b8; font-size: 11px;">📋</span>`;
      chip.addEventListener('click', () => {
        navigator.clipboard.writeText(tag).then(() => {
          chip.style.borderColor = '#10b981';
          chip.style.backgroundColor = '#ecfdf5';
          setTimeout(() => {
            chip.style.borderColor = '';
            chip.style.backgroundColor = '';
          }, 1500);
        });
      });
      tagChips.appendChild(chip);
    });
  }

  btnCopyAllTags.addEventListener('click', () => {
    if (currentTags.length === 0) return;
    const commaSeparated = currentTags.join(', ');
    navigator.clipboard.writeText(commaSeparated).then(() => {
      const orig = btnCopyAllTags.innerHTML;
      btnCopyAllTags.innerHTML = '✅ All Tags Copied!';
      setTimeout(() => { btnCopyAllTags.innerHTML = orig; }, 2000);
    });
  });

  btnExtractTags.addEventListener('click', extractTags);
  ytUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') extractTags();
  });

  btnPasteUrl.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        ytUrlInput.value = text;
        extractTags();
      }
    } catch (e) {
      ytUrlInput.focus();
    }
  });

  // Default sample
  ytUrlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  extractTags();

})();
