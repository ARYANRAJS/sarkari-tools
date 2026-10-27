/* ═══════════════════════════════════════════════════
   INSTAGRAM POST MOCKUP GENERATOR
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const igCard = document.getElementById('igCard');
  const inputUsername = document.getElementById('inputUsername');
  const inputLocation = document.getElementById('inputLocation');
  const inputVerified = document.getElementById('inputVerified');
  const inputAvatarFile = document.getElementById('inputAvatarFile');
  const inputPostPhoto = document.getElementById('inputPostPhoto');
  const inputCaption = document.getElementById('inputCaption');
  const inputLikes = document.getElementById('inputLikes');
  const inputRatio = document.getElementById('inputRatio');
  const inputTheme = document.getElementById('inputTheme');
  const btnDownloadPost = document.getElementById('btnDownloadPost');

  const igAvatar = document.getElementById('igAvatar');
  const igUsername = document.getElementById('igUsername');
  const igBadge = document.getElementById('igBadge');
  const igLocation = document.getElementById('igLocation');
  const igPhotoContainer = document.getElementById('igPhotoContainer');
  const igPhoto = document.getElementById('igPhoto');
  const igLikes = document.getElementById('igLikes');
  const igCaptionUser = document.getElementById('igCaptionUser');
  const igCaptionText = document.getElementById('igCaptionText');

  function formatCaption(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    escaped = escaped.replace(/(#[a-zA-Z0-9_\u0900-\u097F]+)/g, '<span class="tag">$1</span>');
    escaped = escaped.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="tag">$1</span>');
    return escaped;
  }

  function updateMockup() {
    const user = inputUsername.value.trim().toLowerCase() || 'username';
    igUsername.textContent = user;
    igCaptionUser.textContent = user;

    if (inputLocation.value.trim()) {
      igLocation.textContent = inputLocation.value.trim();
      igLocation.style.display = 'block';
    } else {
      igLocation.style.display = 'none';
    }

    igBadge.style.display = inputVerified.value === 'yes' ? 'inline-flex' : 'none';
    igLikes.textContent = inputLikes.value.trim() || '0';
    igCaptionText.innerHTML = formatCaption(inputCaption.value);

    // Aspect Ratio
    igPhotoContainer.className = `ig-photo-container ${inputRatio.value}`;

    // Theme
    if (inputTheme.value === 'dark') {
      igCard.classList.add('ig-dark');
    } else {
      igCard.classList.remove('ig-dark');
    }
  }

  inputAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => { igAvatar.src = evt.target.result; };
      reader.readAsDataURL(file);
    }
  });

  inputPostPhoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => { igPhoto.src = evt.target.result; };
      reader.readAsDataURL(file);
    }
  });

  [inputUsername, inputLocation, inputVerified, inputCaption, inputLikes, inputRatio, inputTheme].forEach((el) => {
    el.addEventListener('input', updateMockup);
    el.addEventListener('change', updateMockup);
  });

  btnDownloadPost.addEventListener('click', async () => {
    if (!window.html2canvas) {
      alert('Screenshot tool loading, please try again in a moment.');
      return;
    }

    const orig = btnDownloadPost.innerHTML;
    btnDownloadPost.innerHTML = '⏳ Rendering Post...';

    try {
      const canvas = await window.html2canvas(igCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      const a = document.createElement('a');
      a.download = `instagram_post_${inputUsername.value || 'mockup'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error(err);
      alert('Error exporting Instagram post image.');
    } finally {
      btnDownloadPost.innerHTML = orig;
    }
  });

  updateMockup();

})();
