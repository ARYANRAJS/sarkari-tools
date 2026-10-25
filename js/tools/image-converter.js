/* ═══════════════════════════════════════════════════
   AllToolsInOne — Image Format Converter Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const targetFormat = document.getElementById('targetFormat');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityVal = document.getElementById('qualityVal');
  const fileCount = document.getElementById('fileCount');
  const fileItemsContainer = document.getElementById('fileItemsContainer');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const convertAllBtn = document.getElementById('convertAllBtn');
  const resultsCard = document.getElementById('resultsCard');
  const downloadButtonsList = document.getElementById('downloadButtonsList');

  let fileList = []; // Array of { id, file, dataUrl, img, convertedBlob, newSize }

  qualitySlider.addEventListener('input', () => {
    qualityVal.textContent = `${qualitySlider.value}%`;
  });

  // Drag and Drop
  dropZone.addEventListener('click', () => fileInput.click());
  addMoreBtn.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      appendFiles(files);
    } else {
      window.showToast('Please select valid image files', 'error');
    }
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      appendFiles(files);
    }
    fileInput.value = '';
  });

  function appendFiles(newFiles) {
    newFiles.forEach(file => {
      const item = {
        id: 'img_' + Math.random().toString(36).substr(2, 9),
        file: file,
        dataUrl: null,
        img: null,
        convertedBlob: null,
        newSize: null
      };
      fileList.push(item);

      const reader = new FileReader();
      reader.onload = (e) => {
        item.dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          item.img = img;
          renderFileList();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    dropZone.style.display = 'none';
    toolWorkspace.style.display = 'block';
    resultsCard.style.display = 'none';
  }

  function renderFileList() {
    fileCount.textContent = fileList.length;
    fileItemsContainer.innerHTML = '';

    fileList.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'repeater-item';
      row.style.alignItems = 'center';

      const thumb = document.createElement('img');
      thumb.src = item.dataUrl || '';
      thumb.style.width = '52px';
      thumb.style.height = '52px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = 'var(--radius-sm)';
      thumb.style.border = '1px solid var(--gray-200)';

      const meta = document.createElement('div');
      meta.className = 'form-fields';
      meta.innerHTML = `
        <div style="font-weight: 600; font-size: var(--text-sm); color: var(--navy);">${item.file.name}</div>
        <div style="font-size: var(--text-xs); color: var(--gray-500); display: flex; gap: 12px; margin-top: 2px;">
          <span>Size: ${window.formatFileSize(item.file.size)}</span>
          <span>Type: ${(item.file.type || 'image').split('/')[1]?.toUpperCase()}</span>
          ${item.img ? `<span>Dim: ${item.img.naturalWidth}×${item.img.naturalHeight}px</span>` : ''}
        </div>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `;
      removeBtn.addEventListener('click', () => {
        fileList.splice(index, 1);
        if (fileList.length === 0) {
          dropZone.style.display = 'block';
          toolWorkspace.style.display = 'none';
        } else {
          renderFileList();
        }
      });

      row.appendChild(thumb);
      row.appendChild(meta);
      row.appendChild(removeBtn);
      fileItemsContainer.appendChild(row);
    });
  }

  clearAllBtn.addEventListener('click', () => {
    fileList = [];
    dropZone.style.display = 'block';
    toolWorkspace.style.display = 'none';
    resultsCard.style.display = 'none';
  });

  convertAllBtn.addEventListener('click', async () => {
    if (fileList.length === 0) {
      window.showToast('Please upload at least one image', 'error');
      return;
    }

    convertAllBtn.disabled = true;
    convertAllBtn.innerHTML = '<span class="chakra-spinner sm" style="display:inline-block; vertical-align:middle; margin-right:8px;"></span> Converting...';

    const mime = targetFormat.value;
    const quality = parseInt(qualitySlider.value, 10) / 100;
    let ext = 'jpg';
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/webp') ext = 'webp';
    else if (mime === 'image/bmp') ext = 'bmp';

    downloadButtonsList.innerHTML = '';

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList[i];
      if (!item.img) continue;

      const canvas = document.createElement('canvas');
      canvas.width = item.img.naturalWidth;
      canvas.height = item.img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // If target is JPEG/BMP, fill white background to avoid dark spots on transparent images
      if (mime === 'image/jpeg' || mime === 'image/bmp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(item.img, 0, 0);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime === 'image/bmp' ? 'image/png' : mime, quality));
      item.convertedBlob = blob;
      item.newSize = blob.size;

      const baseName = item.file.name.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}.${ext}`;

      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'btn btn-secondary btn-sm';
      dlBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${downloadName} (${window.formatFileSize(blob.size)})
      `;
      dlBtn.addEventListener('click', () => {
        window.downloadFile(blob, downloadName);
      });

      downloadButtonsList.appendChild(dlBtn);
    }

    convertAllBtn.disabled = false;
    convertAllBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
      Convert All Images
    `;

    resultsCard.style.display = 'block';
    resultsCard.scrollIntoView({ behavior: 'smooth' });
    window.showToast('All images converted! Click below to download.', 'success');
  });

})();
