/* ═══════════════════════════════════════════════════
   IMAGE SLICER & GRID SPLITTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const sliceDropZone = document.getElementById('sliceDropZone');
  const sliceFileInput = document.getElementById('sliceFileInput');
  const inputCols = document.getElementById('inputCols');
  const inputRows = document.getElementById('inputRows');
  const presetButtons = document.querySelectorAll('.btn-preset');
  const btnDownloadZip = document.getElementById('btnDownloadZip');
  const sliceGridContainer = document.getElementById('sliceGridContainer');
  const sliceTotalCount = document.getElementById('sliceTotalCount');
  const imgDimensionsLabel = document.getElementById('imgDimensionsLabel');

  let loadedImage = null;
  let sliceBlobs = [];

  function processImage() {
    if (!loadedImage) return;

    const cols = Math.max(1, Math.min(8, parseInt(inputCols.value, 10) || 3));
    const rows = Math.max(1, Math.min(8, parseInt(inputRows.value, 10) || 3));
    const total = cols * rows;

    sliceTotalCount.textContent = total;
    sliceGridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    sliceGridContainer.innerHTML = '';
    sliceBlobs = [];

    const imgWidth = loadedImage.naturalWidth || loadedImage.width;
    const imgHeight = loadedImage.naturalHeight || loadedImage.height;
    imgDimensionsLabel.textContent = `${imgWidth} × ${imgHeight} px`;

    const sliceW = Math.floor(imgWidth / cols);
    const sliceH = Math.floor(imgHeight / rows);

    let index = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement('canvas');
        canvas.width = sliceW;
        canvas.height = sliceH;
        const ctx = canvas.getContext('2d');

        // Draw quadrant from source
        const sx = c * sliceW;
        const sy = r * sliceH;
        ctx.drawImage(loadedImage, sx, sy, sliceW, sliceH, 0, 0, sliceW, sliceH);

        const card = document.createElement('div');
        card.className = 'slice-card';

        const img = document.createElement('img');
        const dataUrl = canvas.toDataURL('image/png');
        img.src = dataUrl;

        const sliceIndex = index;
        const filename = `slice_${sliceIndex}_r${r + 1}_c${c + 1}.png`;

        // Save blob for zip
        canvas.toBlob((blob) => {
          sliceBlobs.push({ filename, blob });
        }, 'image/png');

        card.innerHTML = `
          <div class="slice-card-footer">
            <span>Piece #${sliceIndex}</span>
            <button type="button" class="btn btn-outline btn-dl-piece" style="padding: 2px 6px; font-size: 11px;">📥 Save</button>
          </div>
        `;
        card.insertBefore(img, card.firstChild);

        card.querySelector('.btn-dl-piece').addEventListener('click', () => {
          const a = document.createElement('a');
          a.download = filename;
          a.href = dataUrl;
          a.click();
        });

        sliceGridContainer.appendChild(card);
        index++;
      }
    }
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        processImage();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  sliceFileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  sliceDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    sliceDropZone.style.borderColor = 'var(--navy)';
  });

  sliceDropZone.addEventListener('dragleave', () => {
    sliceDropZone.style.borderColor = 'var(--border-color)';
  });

  sliceDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    sliceDropZone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  inputCols.addEventListener('change', processImage);
  inputRows.addEventListener('change', processImage);

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetButtons.forEach((b) => b.className = 'btn btn-outline btn-preset');
      btn.className = 'btn btn-primary btn-preset';
      inputCols.value = btn.getAttribute('data-cols');
      inputRows.value = btn.getAttribute('data-rows');
      processImage();
    });
  });

  btnDownloadZip.addEventListener('click', async () => {
    if (sliceBlobs.length === 0) {
      alert('Please upload an image first.');
      return;
    }

    if (!window.JSZip) {
      alert('ZIP library loading, please try again in a moment.');
      return;
    }

    const orig = btnDownloadZip.innerHTML;
    btnDownloadZip.innerHTML = '⏳ Creating ZIP archive...';

    const zip = new window.JSZip();
    sliceBlobs.forEach((item) => {
      zip.file(item.filename, item.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'sliced_image_grid.zip';
    a.click();

    btnDownloadZip.innerHTML = orig;
  });

  // Load a sample image to demo immediately
  const sampleImg = new Image();
  sampleImg.crossOrigin = 'anonymous';
  sampleImg.onload = () => {
    loadedImage = sampleImg;
    processImage();
  };
  sampleImg.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80';

})();
