/* ═══════════════════════════════════════════════════
   PDF MERGE & SPLIT TOOL (100% Client-Side)
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Tabs
  const tabMergeMode = document.getElementById('tabMergeMode');
  const tabSplitMode = document.getElementById('tabSplitMode');
  const mergeSection = document.getElementById('mergeSection');
  const splitSection = document.getElementById('splitSection');

  // Merge Elements
  const mergeFileInput = document.getElementById('mergeFileInput');
  const mergeListArea = document.getElementById('mergeListArea');
  const mergeFileList = document.getElementById('mergeFileList');
  const mergeCount = document.getElementById('mergeCount');
  const btnClearMerge = document.getElementById('btnClearMerge');
  const btnExecuteMerge = document.getElementById('btnExecuteMerge');
  const mergeDropZone = document.getElementById('mergeDropZone');

  // Split Elements
  const splitFileInput = document.getElementById('splitFileInput');
  const splitDropZone = document.getElementById('splitDropZone');
  const splitOptionsArea = document.getElementById('splitOptionsArea');
  const splitFileName = document.getElementById('splitFileName');
  const splitTotalPages = document.getElementById('splitTotalPages');
  const rangeInputGroup = document.getElementById('rangeInputGroup');
  const pageRangeStr = document.getElementById('pageRangeStr');
  const btnExecuteSplit = document.getElementById('btnExecuteSplit');
  const splitTypeRadios = document.querySelectorAll('input[name="splitType"]');

  let mergeFiles = []; // Array of { file, name, size, pageCount, arrayBuffer }
  let loadedSplitPdf = null;
  let loadedSplitBuffer = null;
  let loadedSplitFile = null;

  // Tab switching
  tabMergeMode.addEventListener('click', () => {
    tabMergeMode.className = 'btn btn-primary';
    tabSplitMode.className = 'btn btn-outline';
    mergeSection.style.display = 'block';
    splitSection.style.display = 'none';
  });

  tabSplitMode.addEventListener('click', () => {
    tabSplitMode.className = 'btn btn-primary';
    tabMergeMode.className = 'btn btn-outline';
    mergeSection.style.display = 'none';
    splitSection.style.display = 'block';
  });

  // Helper for formatting sizes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // --- MERGE LOGIC ---
  async function addMergeFiles(files) {
    if (!window.PDFLib) {
      alert('PDF processing engine loading... please try again in a few seconds.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) continue;

      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPageCount();

        mergeFiles.push({
          file,
          name: file.name,
          size: file.size,
          pageCount: pages,
          buffer
        });
      } catch (err) {
        console.warn('Could not load PDF file:', file.name, err);
      }
    }
    renderMergeList();
  }

  function renderMergeList() {
    mergeCount.textContent = mergeFiles.length;
    mergeFileList.innerHTML = '';

    if (mergeFiles.length === 0) {
      mergeListArea.style.display = 'none';
      return;
    }

    mergeFiles.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'pdf-file-item';
      div.innerHTML = `
        <div class="pdf-item-title">
          <span style="color: var(--saffron);">#${index + 1}</span>
          <span>${item.name}</span>
          <span style="font-size: 11px; color: var(--gray-600); font-weight: normal;">(${formatBytes(item.size)} • ${item.pageCount} pages)</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn btn-outline btn-up" style="padding: 2px 6px; font-size: 11px;" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn btn-outline btn-down" style="padding: 2px 6px; font-size: 11px;" ${index === mergeFiles.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn btn-outline btn-del" style="padding: 2px 6px; font-size: 11px; color: #b91c1c;">✕</button>
        </div>
      `;

      div.querySelector('.btn-up').addEventListener('click', () => {
        if (index > 0) {
          const temp = mergeFiles[index];
          mergeFiles[index] = mergeFiles[index - 1];
          mergeFiles[index - 1] = temp;
          renderMergeList();
        }
      });

      div.querySelector('.btn-down').addEventListener('click', () => {
        if (index < mergeFiles.length - 1) {
          const temp = mergeFiles[index];
          mergeFiles[index] = mergeFiles[index + 1];
          mergeFiles[index + 1] = temp;
          renderMergeList();
        }
      });

      div.querySelector('.btn-del').addEventListener('click', () => {
        mergeFiles.splice(index, 1);
        renderMergeList();
      });

      mergeFileList.appendChild(div);
    });

    mergeListArea.style.display = 'block';
  }

  mergeFileInput.addEventListener('change', (e) => {
    addMergeFiles(e.target.files);
  });

  mergeDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    mergeDropZone.style.borderColor = 'var(--navy)';
  });
  mergeDropZone.addEventListener('dragleave', () => {
    mergeDropZone.style.borderColor = 'var(--border-color)';
  });
  mergeDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    mergeDropZone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files) addMergeFiles(e.dataTransfer.files);
  });

  btnClearMerge.addEventListener('click', () => {
    mergeFiles = [];
    renderMergeList();
  });

  btnExecuteMerge.addEventListener('click', async () => {
    if (mergeFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    const orig = btnExecuteMerge.innerHTML;
    btnExecuteMerge.innerHTML = '⏳ Merging PDFs...';

    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();

      for (let i = 0; i < mergeFiles.length; i++) {
        const item = mergeFiles[i];
        const donorPdf = await window.PDFLib.PDFDocument.load(item.buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'merged_document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert('Error merging PDF files: ' + err.message);
    } finally {
      btnExecuteMerge.innerHTML = orig;
    }
  });

  // --- SPLIT LOGIC ---
  async function loadSplitFile(file) {
    if (!file) return;
    try {
      loadedSplitFile = file;
      loadedSplitBuffer = await file.arrayBuffer();
      loadedSplitPdf = await window.PDFLib.PDFDocument.load(loadedSplitBuffer, { ignoreEncryption: true });

      const total = loadedSplitPdf.getPageCount();
      splitFileName.textContent = file.name;
      splitTotalPages.textContent = `Total Pages: ${total}`;
      pageRangeStr.value = total > 1 ? `1-${Math.min(total, 3)}` : '1';
      splitOptionsArea.style.display = 'block';
    } catch (err) {
      alert('Could not open PDF file. It might be password-protected: ' + err.message);
    }
  }

  splitFileInput.addEventListener('change', (e) => {
    loadSplitFile(e.target.files[0]);
  });

  splitDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    splitDropZone.style.borderColor = 'var(--navy)';
  });
  splitDropZone.addEventListener('dragleave', () => {
    splitDropZone.style.borderColor = 'var(--border-color)';
  });
  splitDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    splitDropZone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadSplitFile(e.dataTransfer.files[0]);
    }
  });

  splitTypeRadios.forEach((r) => {
    r.addEventListener('change', (e) => {
      if (e.target.value === 'range') {
        rangeInputGroup.style.display = 'block';
      } else {
        rangeInputGroup.style.display = 'none';
      }
    });
  });

  function parsePageRanges(rangeStr, maxPages) {
    const pages = new Set();
    const parts = rangeStr.split(',');
    parts.forEach((p) => {
      const part = p.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i - 1); // 0-based
          }
        }
      } else {
        const single = parseInt(part, 10);
        if (!isNaN(single) && single >= 1 && single <= maxPages) {
          pages.add(single - 1);
        }
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  }

  btnExecuteSplit.addEventListener('click', async () => {
    if (!loadedSplitPdf) {
      alert('Please upload a PDF file first.');
      return;
    }

    const mode = document.querySelector('input[name="splitType"]:checked').value;
    const totalPages = loadedSplitPdf.getPageCount();
    const orig = btnExecuteSplit.innerHTML;
    btnExecuteSplit.innerHTML = '⏳ Splitting PDF...';

    try {
      if (mode === 'range') {
        const indices = parsePageRanges(pageRangeStr.value, totalPages);
        if (indices.length === 0) {
          alert('Please enter a valid page range within 1 to ' + totalPages);
          btnExecuteSplit.innerHTML = orig;
          return;
        }

        const newPdf = await window.PDFLib.PDFDocument.create();
        const donorPdf = await window.PDFLib.PDFDocument.load(loadedSplitBuffer, { ignoreEncryption: true });
        const copied = await newPdf.copyPages(donorPdf, indices);
        copied.forEach((p) => newPdf.addPage(p));

        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `split_pages_${loadedSplitFile.name}`;
        a.click();

      } else {
        // All individual pages as ZIP
        if (!window.JSZip) {
          alert('ZIP utility loading, please try again in a moment.');
          btnExecuteSplit.innerHTML = orig;
          return;
        }

        const zip = new window.JSZip();
        const donorPdf = await window.PDFLib.PDFDocument.load(loadedSplitBuffer, { ignoreEncryption: true });

        for (let i = 0; i < totalPages; i++) {
          const singlePdf = await window.PDFLib.PDFDocument.create();
          const [copiedPage] = await singlePdf.copyPages(donorPdf, [i]);
          singlePdf.addPage(copiedPage);
          const bytes = await singlePdf.save();
          zip.file(`page_${i + 1}.pdf`, bytes);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `all_pages_${loadedSplitFile.name.replace('.pdf', '')}.zip`;
        a.click();
      }
    } catch (err) {
      console.error(err);
      alert('Error during splitting: ' + err.message);
    } finally {
      btnExecuteSplit.innerHTML = orig;
    }
  });

})();
