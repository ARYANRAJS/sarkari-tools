/* ═══════════════════════════════════════════════════
   AllToolsInOne — Image to PDF Converter Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const toolWorkspace = document.getElementById('toolWorkspace');
  const pageSize = document.getElementById('pageSize');
  const pageOrientation = document.getElementById('pageOrientation');
  const pageMargin = document.getElementById('pageMargin');
  const imageFit = document.getElementById('imageFit');
  const headerText = document.getElementById('headerText');
  const footerText = document.getElementById('footerText');
  const pageNumberPos = document.getElementById('pageNumberPos');
  const pageNumberFormat = document.getElementById('pageNumberFormat');
  const watermarkText = document.getElementById('watermarkText');
  const watermarkColor = document.getElementById('watermarkColor');
  const watermarkOpacity = document.getElementById('watermarkOpacity');
  const opacityVal = document.getElementById('opacityVal');
  const watermarkStyle = document.getElementById('watermarkStyle');
  const pageCountDisplay = document.getElementById('pageCountDisplay');
  const pagesList = document.getElementById('pagesList');
  const addMorePagesBtn = document.getElementById('addMorePagesBtn');
  const clearPagesBtn = document.getElementById('clearPagesBtn');
  const generatePdfBtn = document.getElementById('generatePdfBtn');

  let pages = []; // Array of { id, file, dataUrl, img }

  watermarkOpacity.addEventListener('input', () => {
    opacityVal.textContent = `${watermarkOpacity.value}%`;
  });

  // Drag and Drop
  dropZone.addEventListener('click', () => fileInput.click());
  addMorePagesBtn.addEventListener('click', () => fileInput.click());

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
      addFiles(files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      addFiles(files);
    }
    fileInput.value = '';
  });

  function addFiles(newFiles) {
    newFiles.forEach(file => {
      const pageObj = {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        file: file,
        dataUrl: null,
        img: null
      };
      pages.push(pageObj);

      const reader = new FileReader();
      reader.onload = (e) => {
        pageObj.dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          pageObj.img = img;
          renderPagesGrid();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    dropZone.style.display = 'none';
    toolWorkspace.style.display = 'block';
  }

  function renderPagesGrid() {
    pageCountDisplay.textContent = pages.length;
    pagesList.innerHTML = '';

    pages.forEach((page, idx) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        padding: 6px;
        position: relative;
        text-align: center;
      `;

      card.innerHTML = `
        <div style="position: absolute; top: 8px; left: 8px; background: var(--navy); color: white; font-size: 10px; font-weight: 700; border-radius: 4px; padding: 2px 6px;">P${idx + 1}</div>
        <img src="${page.dataUrl || ''}" style="width: 100%; height: 110px; object-fit: contain; background: #f1f5f9; border-radius: 4px; margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <button type="button" class="btn btn-ghost btn-sm move-left" style="padding: 2px 6px;" title="Move earlier">‹</button>
          <button type="button" class="btn btn-ghost btn-sm del-btn" style="padding: 2px 6px; color: var(--error);" title="Remove">✕</button>
          <button type="button" class="btn btn-ghost btn-sm move-right" style="padding: 2px 6px;" title="Move later">›</button>
        </div>
      `;

      card.querySelector('.del-btn').addEventListener('click', () => {
        pages.splice(idx, 1);
        if (pages.length === 0) {
          dropZone.style.display = 'block';
          toolWorkspace.style.display = 'none';
        } else {
          renderPagesGrid();
        }
      });

      card.querySelector('.move-left').addEventListener('click', () => {
        if (idx > 0) {
          const temp = pages[idx];
          pages[idx] = pages[idx - 1];
          pages[idx - 1] = temp;
          renderPagesGrid();
        }
      });

      card.querySelector('.move-right').addEventListener('click', () => {
        if (idx < pages.length - 1) {
          const temp = pages[idx];
          pages[idx] = pages[idx + 1];
          pages[idx + 1] = temp;
          renderPagesGrid();
        }
      });

      pagesList.appendChild(card);
    });
  }

  clearPagesBtn.addEventListener('click', () => {
    pages = [];
    dropZone.style.display = 'block';
    toolWorkspace.style.display = 'none';
  });

  // Generate PDF
  generatePdfBtn.addEventListener('click', async () => {
    if (pages.length === 0) {
      window.showToast('Please add at least one page', 'error');
      return;
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.showToast('PDF library loading... please wait 2 seconds', 'warning');
      return;
    }

    generatePdfBtn.disabled = true;
    generatePdfBtn.innerHTML = '<span class="chakra-spinner sm" style="display:inline-block; vertical-align:middle; margin-right:8px;"></span> Compiling PDF...';

    try {
      const { jsPDF } = window.jspdf;
      const orient = pageOrientation.value;
      const size = pageSize.value;
      const marginType = pageMargin.value;
      const fit = imageFit.value;

      const pdf = new jsPDF({
        orientation: orient,
        unit: 'mm',
        format: size
      });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      let marginMm = 0;
      if (marginType === 'small') marginMm = 5;
      else if (marginType === 'normal' || marginType === 'box_border') marginMm = 12;

      const hText = headerText.value.trim();
      const fText = footerText.value.trim();
      const numPos = pageNumberPos.value;
      const numFmt = pageNumberFormat.value;
      const wmText = watermarkText.value.trim();
      const wmAlpha = parseInt(watermarkOpacity.value, 10) / 100;
      const isBoxBorder = marginType === 'box_border';

      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage(size, orient);

        const page = pages[i];
        if (!page.img) continue;

        // Content Area dimensions
        const contentX = marginMm;
        const contentY = marginMm + (hText ? 6 : 0);
        const contentW = pdfW - marginMm * 2;
        const contentH = pdfH - marginMm * 2 - (hText ? 6 : 0) - (fText || numPos !== 'none' ? 6 : 0);

        // Fit image
        const imgAspect = page.img.naturalWidth / page.img.naturalHeight;
        let drawW, drawH, drawX, drawY;

        if (fit === 'stretch') {
          drawW = contentW;
          drawH = contentH;
          drawX = contentX;
          drawY = contentY;
        } else {
          // Keep aspect ratio
          const boxAspect = contentW / contentH;
          if (imgAspect > boxAspect) {
            drawW = contentW;
            drawH = contentW / imgAspect;
          } else {
            drawH = contentH;
            drawW = contentH * imgAspect;
          }
          drawX = contentX + (contentW - drawW) / 2;
          drawY = contentY + (contentH - drawH) / 2;
        }

        // Add Image
        pdf.addImage(page.dataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');

        // Decorative Box Border
        if (isBoxBorder) {
          pdf.setDrawColor(30, 41, 59);
          pdf.setLineWidth(0.4);
          pdf.rect(6, 6, pdfW - 12, pdfH - 12);
        }

        // Header Text
        if (hText) {
          pdf.setFontSize(9);
          pdf.setTextColor(71, 85, 105);
          pdf.text(hText, pdfW / 2, 8, { align: 'center' });
        }

        // Footer Text
        if (fText) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(fText, 12, pdfH - 6);
        }

        // Page Number
        if (numPos !== 'none') {
          let numStr = `${i + 1}`;
          if (numFmt === 'page_x_of_y') numStr = `Page ${i + 1} of ${totalPages}`;
          else if (numFmt === 'x_slash_y') numStr = `${i + 1} / ${totalPages}`;

          pdf.setFontSize(9);
          pdf.setTextColor(51, 65, 85);

          if (numPos === 'bottom_center') {
            pdf.text(numStr, pdfW / 2, pdfH - 6, { align: 'center' });
          } else if (numPos === 'bottom_right') {
            pdf.text(numStr, pdfW - 12, pdfH - 6, { align: 'right' });
          } else if (numPos === 'top_right') {
            pdf.text(numStr, pdfW - 12, 8, { align: 'right' });
          }
        }

        // Watermark
        if (wmText) {
          pdf.saveGraphicsState();
          pdf.setGState(new pdf.GState({ opacity: wmAlpha }));
          pdf.setFontSize(36);
          pdf.setTextColor(148, 163, 184);

          if (watermarkStyle.value === 'diagonal') {
            pdf.text(wmText, pdfW / 2, pdfH / 2, {
              align: 'center',
              angle: 45
            });
          } else {
            pdf.text(wmText, pdfW / 2, pdfH / 2, {
              align: 'center'
            });
          }
          pdf.restoreGraphicsState();
        }
      }

      pdf.save('sarkari_documents_merged.pdf');
      window.showToast('PDF generated and downloaded successfully! 🎉', 'success');

    } catch (err) {
      console.error(err);
      window.showToast('Error generating PDF', 'error');
    } finally {
      generatePdfBtn.disabled = false;
      generatePdfBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Generate & Download PDF
      `;
    }
  });

})();
