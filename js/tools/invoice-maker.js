/**
 * Sarkari Tools - Cyber Cafe & Shop Invoice Maker
 * Generates instant printable cash receipts & PDF invoices
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Shop & Cust
  const shopName = document.getElementById('shopName');
  const shopPhone = document.getElementById('shopPhone');
  const shopGstin = document.getElementById('shopGstin');
  const shopAddress = document.getElementById('shopAddress');

  const custName = document.getElementById('custName');
  const custPhone = document.getElementById('custPhone');
  const invoiceNo = document.getElementById('invoiceNo');
  const invoiceDate = document.getElementById('invoiceDate');
  const paymentMode = document.getElementById('paymentMode');

  const discountInput = document.getElementById('discountInput');
  const gstRateSelect = document.getElementById('gstRateSelect');
  const invoiceNotes = document.getElementById('invoiceNotes');

  // Preview Bill Elements
  const billShopName = document.getElementById('billShopName');
  const billShopAddress = document.getElementById('billShopAddress');
  const billShopPhone = document.getElementById('billShopPhone');
  const billShopGstin = document.getElementById('billShopGstin');

  const billInvoiceNo = document.getElementById('billInvoiceNo');
  const billDate = document.getElementById('billDate');
  const billPaymentMode = document.getElementById('billPaymentMode');
  const billCustName = document.getElementById('billCustName');
  const billCustPhone = document.getElementById('billCustPhone');

  const billItemsBody = document.getElementById('billItemsBody');
  const btnAddItem = document.getElementById('btnAddItem');
  const quickAddBtns = document.querySelectorAll('.quick-add-btn');

  const billSubtotal = document.getElementById('billSubtotal');
  const billDiscountRow = document.getElementById('billDiscountRow');
  const billDiscount = document.getElementById('billDiscount');
  const billGstRow = document.getElementById('billGstRow');
  const billGstRate = document.getElementById('billGstRate');
  const billGstAmount = document.getElementById('billGstAmount');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const billWords = document.getElementById('billWords');
  const billNotes = document.getElementById('billNotes');

  // Actions
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnPrintBill = document.getElementById('btnPrintBill');

  // Default date to today
  if (invoiceDate && !invoiceDate.value) {
    const today = new Date().toISOString().split('T')[0];
    invoiceDate.value = today;
  }

  // Items State
  let items = [
    { desc: 'Online Exam Form Filling (SSC CGL)', qty: 1, rate: 100 },
    { desc: 'Admit Card Print (Color)', qty: 2, rate: 20 },
    { desc: 'Passport Size Photos (8 Pcs)', qty: 1, rate: 50 }
  ];

  function formatRupees(num) {
    return '₹' + Number(num).toFixed(2);
  }

  // Indian Number to Words converter
  function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    num = Math.round(num);
    if (num === 0) return 'Rupees Zero Only';

    function inWords(n) {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit !== 0 ? ' ' + a[digit] : ' ');
    }

    let str = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    num %= 100;

    if (crore > 0) str += inWords(crore) + 'Crore ';
    if (lakh > 0) str += inWords(lakh) + 'Lakh ';
    if (thousand > 0) str += inWords(thousand) + 'Thousand ';
    if (hundred > 0) str += inWords(hundred) + 'Hundred ';
    if (num > 0) {
      if (str !== '') str += 'and ';
      str += inWords(num);
    }

    return 'Rupees ' + str.trim() + ' Only';
  }

  // Render Items Table
  function renderItems() {
    if (!billItemsBody) return;
    billItemsBody.innerHTML = '';

    let subtotal = 0;

    items.forEach((item, index) => {
      const lineTotal = item.qty * item.rate;
      subtotal += lineTotal;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #f1f5f9';

      tr.innerHTML = `
        <td style="padding: 8px 10px; color: #64748b;">${index + 1}</td>
        <td style="padding: 8px 10px;">
          <input type="text" class="item-desc-input" data-index="${index}" value="${item.desc.replace(/"/g, '&quot;')}" style="width: 100%; border: 1px solid transparent; background: transparent; font-size: 13px; font-weight: 500; color: #1e293b; padding: 2px 4px; border-radius: 4px;" onfocus="this.style.border='1px solid #cbd5e1'; this.style.background='#fff'" onblur="this.style.border='1px solid transparent'; this.style.background='transparent'">
        </td>
        <td style="padding: 8px 10px; text-align: center;">
          <input type="number" class="item-qty-input" data-index="${index}" value="${item.qty}" min="1" max="1000" style="width: 48px; text-align: center; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; font-size: 13px;">
        </td>
        <td style="padding: 8px 10px; text-align: right;">
          <input type="number" class="item-rate-input" data-index="${index}" value="${item.rate}" min="0" step="any" style="width: 65px; text-align: right; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; font-size: 13px;">
        </td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 600; color: #0f172a;">${formatRupees(lineTotal)}</td>
        <td class="no-print" style="padding: 8px 10px; text-align: center;">
          <button type="button" class="btn-delete-row" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; padding: 2px 6px;" title="Remove row">✕</button>
        </td>
      `;

      billItemsBody.appendChild(tr);
    });

    // Attach listeners to input fields inside table
    billItemsBody.querySelectorAll('.item-desc-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        items[idx].desc = e.target.value;
      });
    });

    billItemsBody.querySelectorAll('.item-qty-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        items[idx].qty = parseFloat(e.target.value) || 0;
        recalculateTotals();
      });
    });

    billItemsBody.querySelectorAll('.item-rate-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        items[idx].rate = parseFloat(e.target.value) || 0;
        recalculateTotals();
      });
    });

    billItemsBody.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        items.splice(idx, 1);
        renderItems();
      });
    });

    recalculateTotals();
  }

  // Recalculate totals
  function recalculateTotals() {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.qty * item.rate);
    });

    const discount = parseFloat(discountInput.value) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const gstPercent = parseFloat(gstRateSelect.value) || 0;
    const gstAmt = (taxable * gstPercent) / 100;
    const grandTotal = taxable + gstAmt;

    billSubtotal.textContent = formatRupees(subtotal);

    if (discount > 0) {
      billDiscountRow.style.display = 'flex';
      billDiscount.textContent = '-' + formatRupees(discount);
    } else {
      billDiscountRow.style.display = 'none';
    }

    if (gstPercent > 0) {
      billGstRow.style.display = 'flex';
      billGstRate.textContent = gstPercent;
      billGstAmount.textContent = formatRupees(gstAmt);
    } else {
      billGstRow.style.display = 'none';
    }

    billGrandTotal.textContent = formatRupees(grandTotal);
    billWords.textContent = numberToWords(grandTotal);
  }

  // Quick Add Buttons
  quickAddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const rate = parseFloat(btn.dataset.rate) || 0;
      items.push({ desc: name, qty: 1, rate: rate });
      renderItems();
      if (window.showToast) window.showToast(`Added ${name}`);
    });
  });

  // Add Item
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
      items.push({ desc: 'Computer / Xerox Service', qty: 1, rate: 20 });
      renderItems();
    });
  }

  // Sync Header & Customer Details
  function syncHeaders() {
    billShopName.textContent = shopName.value || 'Sharma Digital CSC & Cyber Cafe';
    billShopAddress.textContent = shopAddress.value || '';
    billShopPhone.textContent = shopPhone.value ? `Phone: ${shopPhone.value}` : '';

    if (shopGstin.value.trim()) {
      billShopGstin.style.display = 'block';
      billShopGstin.textContent = `GSTIN: ${shopGstin.value.trim()}`;
    } else {
      billShopGstin.style.display = 'none';
    }

    billCustName.textContent = custName.value || 'Walk-in Customer';
    billCustPhone.textContent = custPhone.value || '-';
    billInvoiceNo.textContent = invoiceNo.value || 'INV-001';
    billDate.textContent = invoiceDate.value || new Date().toISOString().split('T')[0];
    billPaymentMode.textContent = paymentMode.value;
    billNotes.textContent = invoiceNotes.value || '';
  }

  const syncInputs = [shopName, shopPhone, shopGstin, shopAddress, custName, custPhone, invoiceNo, invoiceDate, paymentMode, discountInput, gstRateSelect, invoiceNotes];
  syncInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        syncHeaders();
        recalculateTotals();
      });
      inp.addEventListener('change', () => {
        syncHeaders();
        recalculateTotals();
      });
    }
  });

  // Download PDF
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      const billPaper = document.getElementById('billPaper');
      if (!billPaper) return;

      const noPrintElements = billPaper.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.style.display = 'none');

      if (window.showToast) window.showToast('Generating high-res invoice PDF...');

      html2canvas(billPaper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        noPrintElements.forEach(el => el.style.display = '');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${invoiceNo.value || 'receipt'}.pdf`);

        if (window.showToast) window.showToast('Invoice PDF downloaded successfully!');
      }).catch(err => {
        noPrintElements.forEach(el => el.style.display = '');
        console.error('PDF error:', err);
        if (window.showToast) window.showToast('Failed to create PDF. Please retry.', 'error');
      });
    });
  }

  // Print Bill
  if (btnPrintBill) {
    btnPrintBill.addEventListener('click', () => {
      const billPaper = document.getElementById('billPaper');
      if (!billPaper) return;

      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert('Please allow popups to print your invoice.');
        return;
      }

      // Clone bill paper and strip .no-print elements
      const clone = billPaper.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach(el => el.remove());

      // Replace inputs with plain text in clone
      clone.querySelectorAll('input').forEach(inp => {
        const span = document.createElement('span');
        span.textContent = inp.value;
        inp.parentNode.replaceChild(span, inp);
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cash Receipt - ${invoiceNo.value}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 10px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 10px; }
          </style>
        </head>
        <body>
          ${clone.outerHTML}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }

  // Initial setup
  syncHeaders();
  renderItems();
});
