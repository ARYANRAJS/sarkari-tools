/* ═══════════════════════════════════════════════════
   TEXT TO HANDWRITING CONVERTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('paperCanvas');
  const ctx = canvas.getContext('2d');

  const textInput = document.getElementById('textInput');
  const fontSelect = document.getElementById('fontSelect');
  const inkSelect = document.getElementById('inkSelect');
  const paperSelect = document.getElementById('paperSelect');
  const fontSizeRange = document.getElementById('fontSizeRange');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const lineHeightRange = document.getElementById('lineHeightRange');
  const lineHeightVal = document.getElementById('lineHeightVal');
  const jitterRange = document.getElementById('jitterRange');
  const charCountDisplay = document.getElementById('charCountDisplay');
  const btnSampleText = document.getElementById('btnSampleText');
  const btnClear = document.getElementById('btnClear');
  const btnDownloadImage = document.getElementById('btnDownloadImage');
  const btnDownloadPDF = document.getElementById('btnDownloadPDF');
  const btnPrevPage = document.getElementById('btnPrevPage');
  const btnNextPage = document.getElementById('btnNextPage');
  const pageIndicator = document.getElementById('pageIndicator');

  // Canvas Dimensions (A4 Ratio @ 800 x 1130)
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1130;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  let pages = [''];
  let currentPageIndex = 0;

  // Draw paper background
  function drawPaperBackground(paperStyle) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (paperStyle === 'legal') {
      ctx.fillStyle = '#fff9d6'; // Pale yellow legal
    } else {
      ctx.fillStyle = '#ffffff'; // White
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle paper texture noise simulation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let i = 0; i < 50; i++) {
      const rx = Math.random() * CANVAS_WIDTH;
      const ry = Math.random() * CANVAS_HEIGHT;
      ctx.fillRect(rx, ry, Math.random() * 2, Math.random() * 2);
    }

    if (paperStyle === 'blank') return;

    const lineHeight = parseInt(lineHeightRange.value, 10);
    const topMargin = 120;
    const bottomMargin = 80;
    const leftMargin = paperStyle === 'ruled_margin' || paperStyle === 'legal' ? 140 : 60;
    const rightMargin = 60;

    // Horizontal blue ruled lines
    ctx.strokeStyle = paperStyle === 'legal' ? '#e2d58b' : '#cce0ff';
    ctx.lineWidth = 1;

    for (let y = topMargin; y <= CANVAS_HEIGHT - bottomMargin; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(CANVAS_WIDTH - rightMargin, y);
      ctx.stroke();
    }

    // Vertical Red Margin line
    if (paperStyle === 'ruled_margin' || paperStyle === 'legal') {
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin - 15, 60);
      ctx.lineTo(leftMargin - 15, CANVAS_HEIGHT - 60);
      ctx.stroke();

      // Double margin line if ruled_margin
      if (paperStyle === 'ruled_margin') {
        ctx.beginPath();
        ctx.moveTo(leftMargin - 18, 60);
        ctx.lineTo(leftMargin - 18, CANVAS_HEIGHT - 60);
        ctx.stroke();
      }
    }

    // Top Header line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, topMargin - 30);
    ctx.lineTo(CANVAS_WIDTH - rightMargin, topMargin - 30);
    ctx.stroke();
  }

  // Calculate text wrapping and split into pages
  function paginateText(rawText) {
    const fontSize = parseInt(fontSizeRange.value, 10);
    const lineHeight = parseInt(lineHeightRange.value, 10);
    const paperStyle = paperSelect.value;
    const leftMargin = paperStyle === 'ruled_margin' || paperStyle === 'legal' ? 140 : 60;
    const rightMargin = 60;
    const maxWidth = CANVAS_WIDTH - leftMargin - rightMargin;

    const topMargin = 120;
    const bottomMargin = 80;
    const maxLinesPerPage = Math.floor((CANVAS_HEIGHT - topMargin - bottomMargin) / lineHeight);

    ctx.font = `${fontSize}px ${fontSelect.value}`;

    const paragraphs = rawText.split('\n');
    const allLines = [];

    paragraphs.forEach((para) => {
      if (para.trim() === '') {
        allLines.push('');
        return;
      }
      const words = para.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          allLines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        allLines.push(currentLine);
      }
    });

    const newPages = [];
    for (let i = 0; i < allLines.length; i += maxLinesPerPage) {
      newPages.push(allLines.slice(i, i + maxLinesPerPage));
    }

    if (newPages.length === 0) newPages.push([]);
    pages = newPages;

    if (currentPageIndex >= pages.length) {
      currentPageIndex = Math.max(0, pages.length - 1);
    }

    updatePaginationUI();
  }

  function updatePaginationUI() {
    pageIndicator.textContent = `Page ${currentPageIndex + 1} / ${pages.length}`;
    btnPrevPage.disabled = currentPageIndex === 0;
    btnNextPage.disabled = currentPageIndex === pages.length - 1;
  }

  // Draw handwritten text onto the canvas for current page
  function renderCurrentPage() {
    drawPaperBackground(paperSelect.value);

    const lines = pages[currentPageIndex] || [];
    const fontSize = parseInt(fontSizeRange.value, 10);
    const lineHeight = parseInt(lineHeightRange.value, 10);
    const jitter = parseInt(jitterRange.value, 10);
    const paperStyle = paperSelect.value;
    const leftMargin = paperStyle === 'ruled_margin' || paperStyle === 'legal' ? 140 : 60;
    const topMargin = 120;

    ctx.font = `${fontSize}px ${fontSelect.value}`;
    ctx.fillStyle = inkSelect.value;

    let y = topMargin - (lineHeight * 0.2); // Baseline aligned above line

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      if (line) {
        let x = leftMargin;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          const charWidth = ctx.measureText(char).width;

          // Add subtle organic jitter for realistic handwriting
          const jX = jitter > 0 ? (Math.random() - 0.5) * (jitter * 0.4) : 0;
          const jY = jitter > 0 ? (Math.random() - 0.5) * (jitter * 0.6) : 0;
          const tilt = jitter > 0 ? (Math.random() - 0.5) * (jitter * 0.015) : 0;

          ctx.save();
          ctx.translate(x + jX, y + jY);
          if (tilt !== 0) ctx.rotate(tilt);
          ctx.fillText(char, 0, 0);
          ctx.restore();

          x += charWidth;
        }
      }
      y += lineHeight;
    }
  }

  function refresh() {
    const text = textInput.value;
    charCountDisplay.textContent = `${text.length} chars`;
    paginateText(text);
    renderCurrentPage();
  }

  // Listeners
  textInput.addEventListener('input', refresh);
  fontSelect.addEventListener('change', () => {
    // Give font time to load if not cached
    document.fonts.load(`24px ${fontSelect.value}`).then(refresh);
  });
  inkSelect.addEventListener('change', renderCurrentPage);
  paperSelect.addEventListener('change', refresh);

  fontSizeRange.addEventListener('input', (e) => {
    fontSizeVal.textContent = e.target.value;
    refresh();
  });

  lineHeightRange.addEventListener('input', (e) => {
    lineHeightVal.textContent = e.target.value;
    refresh();
  });

  jitterRange.addEventListener('input', renderCurrentPage);

  btnPrevPage.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      updatePaginationUI();
      renderCurrentPage();
    }
  });

  btnNextPage.addEventListener('click', () => {
    if (currentPageIndex < pages.length - 1) {
      currentPageIndex++;
      updatePaginationUI();
      renderCurrentPage();
    }
  });

  btnSampleText.addEventListener('click', () => {
    textInput.value = `Title: Importance of Digital Literacy in Modern India\n\nDigital literacy has become a fundamental pillar for socioeconomic development across the nation. Over the past decade, initiatives like Digital India, UPI, and common service centres (CSCs) have empowered millions in rural and urban areas alike.\n\nFrom online educational portals and telemedicine to digital banking and Direct Benefit Transfer (DBT), technological integration ensures transparent and efficient governance. Every student and citizen must acquire essential digital competencies to thrive in this evolving landscape.`;
    refresh();
  });

  btnClear.addEventListener('click', () => {
    textInput.value = '';
    refresh();
  });

  btnDownloadImage.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `handwriting_page_${currentPageIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  btnDownloadPDF.addEventListener('click', async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('PDF library loading... please try again in a second.');
      return;
    }

    const origText = btnDownloadPDF.innerHTML;
    btnDownloadPDF.innerHTML = '⏳ Generating PDF...';

    const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const initialPageIndex = currentPageIndex;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();
      currentPageIndex = i;
      renderCurrentPage();

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    // Restore user view
    currentPageIndex = initialPageIndex;
    renderCurrentPage();
    updatePaginationUI();

    pdf.save('handwritten_assignment.pdf');
    btnDownloadPDF.innerHTML = origText;
  });

  // Initial render when fonts are ready
  document.fonts.ready.then(() => {
    refresh();
  });

})();
