/**
 * AllToolsInOne - Online Barcode Generator & Label Sheet Maker
 * Generates Code 128, EAN-13, UPC, Code 39 barcodes with SVG, PNG & A4 label sheets
 */

document.addEventListener('DOMContentLoaded', () => {
  const barcodeValue = document.getElementById('barcodeValue');
  const barcodeFormat = document.getElementById('barcodeFormat');
  const barcodeFormatTip = document.getElementById('barcodeFormatTip');

  const barHeight = document.getElementById('barHeight');
  const valBarHeight = document.getElementById('valBarHeight');
  const barWidth = document.getElementById('barWidth');
  const barcodeColor = document.getElementById('barcodeColor');
  const barcodeBgColor = document.getElementById('barcodeBgColor');

  const chkDisplayValue = document.getElementById('chkDisplayValue');
  const barcodeFontSize = document.getElementById('barcodeFontSize');
  const barcodeTextAlign = document.getElementById('barcodeTextAlign');
  const sheetLabelCount = document.getElementById('sheetLabelCount');

  const barcodeSvg = document.getElementById('barcodeSvg');
  const btnDownloadSvg = document.getElementById('btnDownloadSvg');
  const btnDownloadPng = document.getElementById('btnDownloadPng');
  const btnPrintLabels = document.getElementById('btnPrintLabels');

  // Format Tips
  const TIPS = {
    CODE128: 'Code 128: Supports uppercase, lowercase, numbers, and symbols.',
    EAN13: 'EAN-13: Requires exactly 12 or 13 numbers (e.g. 890123456789).',
    EAN8: 'EAN-8: Requires exactly 7 or 8 numbers (e.g. 1234567).',
    UPC: 'UPC-A: Requires exactly 11 or 12 numbers.',
    CODE39: 'Code 39: Supports uppercase letters, numbers, and - . $ / + % space.',
    ITF14: 'ITF-14: Requires exactly 14 numbers.',
    pharmacode: 'Pharmacode: Requires numbers between 3 and 131070.'
  };

  // Adjust sample data when user changes format
  if (barcodeFormat) {
    barcodeFormat.addEventListener('change', () => {
      const fmt = barcodeFormat.value;
      if (barcodeFormatTip) {
        barcodeFormatTip.textContent = TIPS[fmt] || '';
      }

      let val = barcodeValue.value.trim();
      if (fmt === 'EAN13' && !/^\d{12,13}$/.test(val)) {
        barcodeValue.value = '890123456789';
      } else if (fmt === 'EAN8' && !/^\d{7,8}$/.test(val)) {
        barcodeValue.value = '96385074';
      } else if (fmt === 'UPC' && !/^\d{11,12}$/.test(val)) {
        barcodeValue.value = '123456789012';
      } else if (fmt === 'ITF14' && !/^\d{13,14}$/.test(val)) {
        barcodeValue.value = '10012345678902';
      } else if (fmt === 'pharmacode' && !/^\d+$/.test(val)) {
        barcodeValue.value = '12345';
      }
      renderBarcode();
    });
  }

  if (barHeight && valBarHeight) {
    barHeight.addEventListener('input', () => {
      valBarHeight.textContent = barHeight.value + 'px';
      renderBarcode();
    });
  }

  // Render Barcode
  function renderBarcode() {
    if (!barcodeSvg || typeof JsBarcode === 'undefined') return;

    let val = (barcodeValue.value || '12345678').trim();
    const fmt = barcodeFormat.value;
    const height = parseInt(barHeight.value, 10) || 80;
    const width = parseInt(barWidth.value, 10) || 2;
    const lineColor = barcodeColor.value || '#000000';
    const bgColor = barcodeBgColor.value || '#ffffff';
    const showText = chkDisplayValue.checked;
    const fontSize = parseInt(barcodeFontSize.value, 10) || 16;
    const textAlign = barcodeTextAlign.value || 'center';

    try {
      JsBarcode(barcodeSvg, val, {
        format: fmt,
        width: width,
        height: height,
        displayValue: showText,
        fontSize: fontSize,
        textAlign: textAlign,
        lineColor: lineColor,
        background: bgColor,
        margin: 10,
        valid: function(valid) {
          if (!valid) {
            console.warn('Barcode not valid for format:', fmt);
          }
        }
      });
    } catch (err) {
      console.error('Barcode error:', err);
    }
  }

  // Attach live listeners
  const inputs = [barcodeValue, barWidth, barcodeColor, barcodeBgColor, chkDisplayValue, barcodeFontSize, barcodeTextAlign];
  inputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', renderBarcode);
      inp.addEventListener('change', renderBarcode);
    }
  });

  // Download SVG
  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', () => {
      const svgData = new XMLSerializer().serializeToString(barcodeSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${barcodeValue.value || 'code'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('Vector SVG Barcode Downloaded!');
    });
  }

  // Download PNG
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', () => {
      const svgData = new XMLSerializer().serializeToString(barcodeSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 2; // High-res
        canvas.height = img.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = barcodeBgColor.value || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `barcode-${barcodeValue.value || 'code'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showToast) window.showToast('High-Resolution PNG Downloaded!');
      };
      img.src = url;
    });
  }

  // Print A4 Label Sheet
  if (btnPrintLabels) {
    btnPrintLabels.addEventListener('click', () => {
      const count = parseInt(sheetLabelCount.value, 10) || 24;
      const svgHtml = barcodeSvg.outerHTML;

      const printWindow = window.open('', '_blank', 'width=850,height=950');
      if (!printWindow) {
        alert('Please allow popups to print your barcode sticker sheet.');
        return;
      }

      let gridItemsHtml = '';
      for (let i = 0; i < count; i++) {
        gridItemsHtml += `
          <div class="label-item">
            <div class="barcode-box">${svgHtml}</div>
          </div>
        `;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>A4 Barcode Label Sheet - ${barcodeValue.value}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
            .sheet-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              width: 100%;
            }
            .label-item {
              border: 1px dashed #cbd5e1;
              padding: 6px;
              text-align: center;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
              height: 95px;
            }
            .label-item svg {
              max-width: 100%;
              max-height: 85px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="sheet-grid">
            ${gridItemsHtml}
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }

  // Initial Run
  renderBarcode();
});
