/* ═══════════════════════════════════════════════════
   FAKE TWEET / X POST GENERATOR
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const tweetCard = document.getElementById('tweetCard');
  const inputName = document.getElementById('inputName');
  const inputHandle = document.getElementById('inputHandle');
  const inputBadge = document.getElementById('inputBadge');
  const inputAvatar = document.getElementById('inputAvatar');
  const inputText = document.getElementById('inputText');
  const inputMedia = document.getElementById('inputMedia');
  const inputRetweets = document.getElementById('inputRetweets');
  const inputQuotes = document.getElementById('inputQuotes');
  const inputLikes = document.getElementById('inputLikes');
  const inputBookmarks = document.getElementById('inputBookmarks');
  const inputViews = document.getElementById('inputViews');
  const inputTheme = document.getElementById('inputTheme');
  const btnDownloadTweet = document.getElementById('btnDownloadTweet');

  const tweetAvatar = document.getElementById('tweetAvatar');
  const tweetName = document.getElementById('tweetName');
  const tweetHandle = document.getElementById('tweetHandle');
  const tweetBadge = document.getElementById('tweetBadge');
  const tweetText = document.getElementById('tweetText');
  const tweetMedia = document.getElementById('tweetMedia');
  const tweetViews = document.getElementById('tweetViews');
  const statRetweets = document.getElementById('statRetweets');
  const statQuotes = document.getElementById('statQuotes');
  const statLikes = document.getElementById('statLikes');
  const statBookmarks = document.getElementById('statBookmarks');

  function formatTweetText(text) {
    if (!text) return '';
    // Escape HTML first
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Colorize hashtags and mentions
    escaped = escaped.replace(/(#[a-zA-Z0-9_\u0900-\u097F]+)/g, '<span class="hashtag">$1</span>');
    escaped = escaped.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');

    return escaped;
  }

  function updateMockup() {
    tweetName.textContent = inputName.value || 'Name';
    const handle = inputHandle.value.replace(/^@/, '');
    tweetHandle.textContent = `@${handle || 'handle'}`;

    // Badge
    const badgeType = inputBadge.value;
    if (badgeType === 'blue') {
      tweetBadge.style.display = 'inline-flex';
      tweetBadge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zM9.7 16.3l-3.3-3.3 1.4-1.4 1.9 1.9 5.3-5.3 1.4 1.4-6.7 6.7z"/></svg>`;
    } else if (badgeType === 'gold') {
      tweetBadge.style.display = 'inline-flex';
      tweetBadge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#e2b714"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zM9.7 16.3l-3.3-3.3 1.4-1.4 1.9 1.9 5.3-5.3 1.4 1.4-6.7 6.7z"/></svg>`;
    } else {
      tweetBadge.style.display = 'none';
    }

    tweetText.innerHTML = formatTweetText(inputText.value);

    // Stats
    statRetweets.textContent = inputRetweets.value || '0';
    statQuotes.textContent = inputQuotes.value || '0';
    statLikes.textContent = inputLikes.value || '0';
    statBookmarks.textContent = inputBookmarks.value || '0';
    tweetViews.textContent = inputViews.value || '0';

    // Theme
    tweetCard.className = `tweet-card-box tweet-theme-${inputTheme.value}`;
  }

  // Avatar Upload
  inputAvatar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        tweetAvatar.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Media Attachment Upload
  inputMedia.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        tweetMedia.src = evt.target.result;
        tweetMedia.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      tweetMedia.style.display = 'none';
      tweetMedia.src = '';
    }
  });

  // Input Listeners
  [inputName, inputHandle, inputBadge, inputText, inputRetweets, inputQuotes, inputLikes, inputBookmarks, inputViews, inputTheme].forEach((el) => {
    el.addEventListener('input', updateMockup);
    el.addEventListener('change', updateMockup);
  });

  // Download image via html2canvas
  btnDownloadTweet.addEventListener('click', async () => {
    if (!window.html2canvas) {
      alert('Screenshot tool loading, please try again in a moment.');
      return;
    }

    const origText = btnDownloadTweet.innerHTML;
    btnDownloadTweet.innerHTML = '⏳ Rendering Image...';

    try {
      const canvas = await window.html2canvas(tweetCard, {
        scale: 2, // 2x Retina resolution
        useCORS: true,
        backgroundColor: null
      });

      const a = document.createElement('a');
      a.download = `tweet_${inputHandle.value.replace(/^@/, '') || 'mockup'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error(err);
      alert('Error generating tweet image screenshot.');
    } finally {
      btnDownloadTweet.innerHTML = origText;
    }
  });

  updateMockup();

})();
