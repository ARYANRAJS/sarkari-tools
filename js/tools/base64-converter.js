/* ═══════════════════════════════════════════════════
   BASE64 ENCODER & DECODER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Tabs
  const tabTextMode = document.getElementById('tabTextMode');
  const tabFileMode = document.getElementById('tabFileMode');
  const textModeArea = document.getElementById('textModeArea');
  const fileModeArea = document.getElementById('fileModeArea');

  // Text Mode Elements
  const btnActionEncode = document.getElementById('btnActionEncode');
  const btnActionDecode = document.getElementById('btnActionDecode');
  const textInputLabel = document.getElementById('textInputLabel');
  const textOutputLabel = document.getElementById('textOutputLabel');
  const srcTextBase64 = document.getElementById('srcTextBase64');
  const destTextBase64 = document.getElementById('destTextBase64');
  const inputByteStats = document.getElementById('inputByteStats');
  const outputByteStats = document.getElementById('outputByteStats');
  const btnCopyTextBase64 = document.getElementById('btnCopyTextBase64');
  const btnClearTextBase64 = document.getElementById('btnClearTextBase64');

  // File Mode Elements
  const fileDropZone = document.getElementById('fileDropZone');
  const fileInputBase64 = document.getElementById('fileInputBase64');
  const fileResultSection = document.getElementById('fileResultSection');
  const filePreviewThumb = document.getElementById('filePreviewThumb');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileSizeDisplay = document.getElementById('fileSizeDisplay');
  const dataUriOutput = document.getElementById('dataUriOutput');
  const rawBase64Output = document.getElementById('rawBase64Output');
  const btnCopyDataUri = document.getElementById('btnCopyDataUri');
  const btnCopyRawBase64 = document.getElementById('btnCopyRawBase64');

  let textAction = 'encode'; // or 'decode'

  // UTF-8 Safe Base64 Encoding
  function utf8ToBase64(str) {
    try {
      const bytes = new TextEncoder().encode(str);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      return btoa(binString);
    } catch (e) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  // UTF-8 Safe Base64 Decoding
  function base64ToUtf8(base64) {
    try {
      const binString = atob(base64.trim().replace(/\s+/g, ''));
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return decodeURIComponent(escape(atob(base64.trim())));
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function processText() {
    const input = srcTextBase64.value;
    inputByteStats.textContent = `${new Blob([input]).size} bytes`;

    if (!input) {
      destTextBase64.value = '';
      outputByteStats.textContent = '0 bytes';
      return;
    }

    try {
      let output = '';
      if (textAction === 'encode') {
        output = utf8ToBase64(input);
      } else {
        output = base64ToUtf8(input);
      }
      destTextBase64.value = output;
      outputByteStats.textContent = `${new Blob([output]).size} bytes`;
    } catch (err) {
      destTextBase64.value = `⚠️ Error decoding Base64 string: ${err.message}`;
      outputByteStats.textContent = 'Invalid Base64';
    }
  }

  // Text Mode Toggles
  btnActionEncode.addEventListener('click', () => {
    textAction = 'encode';
    btnActionEncode.className = 'btn btn-primary';
    btnActionDecode.className = 'btn btn-outline';
    textInputLabel.textContent = 'Input Plain Text:';
    textOutputLabel.textContent = 'Base64 Encoded Output:';
    srcTextBase64.placeholder = 'Type or paste text to encode...';
    processText();
  });

  btnActionDecode.addEventListener('click', () => {
    textAction = 'decode';
    btnActionDecode.className = 'btn btn-primary';
    btnActionEncode.className = 'btn btn-outline';
    textInputLabel.textContent = 'Input Base64 String:';
    textOutputLabel.textContent = 'Decoded Plain Text:';
    srcTextBase64.placeholder = 'Paste Base64 string to decode...';
    processText();
  });

  srcTextBase64.addEventListener('input', processText);

  btnClearTextBase64.addEventListener('click', () => {
    srcTextBase64.value = '';
    processText();
  });

  btnCopyTextBase64.addEventListener('click', () => {
    if (!destTextBase64.value || destTextBase64.value.startsWith('⚠️')) return;
    navigator.clipboard.writeText(destTextBase64.value).then(() => {
      const orig = btnCopyTextBase64.innerHTML;
      btnCopyTextBase64.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyTextBase64.innerHTML = orig; }, 2000);
    });
  });

  // Tab switching
  tabTextMode.addEventListener('click', () => {
    tabTextMode.className = 'btn btn-primary';
    tabFileMode.className = 'btn btn-outline';
    textModeArea.style.display = 'block';
    fileModeArea.style.display = 'none';
  });

  tabFileMode.addEventListener('click', () => {
    tabFileMode.className = 'btn btn-primary';
    tabTextMode.className = 'btn btn-outline';
    textModeArea.style.display = 'none';
    fileModeArea.style.display = 'block';
  });

  // File to Base64 Processing
  function handleFile(file) {
    if (!file) return;

    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = `${formatBytes(file.size)} (${file.type || 'unknown type'})`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      dataUriOutput.value = dataUri;

      // Extract raw base64 after comma
      const commaIdx = dataUri.indexOf(',');
      const rawBase64 = commaIdx !== -1 ? dataUri.substring(commaIdx + 1) : dataUri;
      rawBase64Output.value = rawBase64;

      if (file.type.startsWith('image/')) {
        filePreviewThumb.src = dataUri;
        filePreviewThumb.style.display = 'block';
      } else {
        filePreviewThumb.style.display = 'none';
      }

      fileResultSection.style.display = 'block';
    };

    reader.readAsDataURL(file);
  }

  fileInputBase64.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = 'var(--navy)';
    fileDropZone.style.background = '#f1f5f9';
  });

  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.style.borderColor = 'var(--border-color)';
    fileDropZone.style.background = '#f8fafc';
  });

  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = 'var(--border-color)';
    fileDropZone.style.background = '#f8fafc';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  btnCopyDataUri.addEventListener('click', () => {
    if (!dataUriOutput.value) return;
    navigator.clipboard.writeText(dataUriOutput.value).then(() => {
      const orig = btnCopyDataUri.innerHTML;
      btnCopyDataUri.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyDataUri.innerHTML = orig; }, 2000);
    });
  });

  btnCopyRawBase64.addEventListener('click', () => {
    if (!rawBase64Output.value) return;
    navigator.clipboard.writeText(rawBase64Output.value).then(() => {
      const orig = btnCopyRawBase64.innerHTML;
      btnCopyRawBase64.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyRawBase64.innerHTML = orig; }, 2000);
    });
  });

  // Sample initial text
  srcTextBase64.value = 'Hello World! Welcome to AllToolsInOne 🚀 नमस्ते भारत';
  processText();

})();
