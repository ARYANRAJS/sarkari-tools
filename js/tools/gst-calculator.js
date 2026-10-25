/**
 * AllToolsInOne - Indian GST & Profit Margin Calculator
 * Real-time calculation of CGST, SGST, IGST inclusive/exclusive breakdowns and margins
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = document.querySelectorAll('#gstTabs .tool-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // GST Elements
  const gstAmount = document.getElementById('gstAmount');
  const modeRadios = document.querySelectorAll('input[name="gstMode"]');
  const slabButtons = document.querySelectorAll('.slab-btn');
  const customGstRate = document.getElementById('customGstRate');
  const supplyType = document.getElementById('supplyType');

  const dispFinalAmount = document.getElementById('dispFinalAmount');
  const dispModeBadge = document.getElementById('dispModeBadge');
  const dispBasePrice = document.getElementById('dispBasePrice');
  const dispCgstRate = document.getElementById('dispCgstRate');
  const dispCgstAmount = document.getElementById('dispCgstAmount');
  const dispSgstRate = document.getElementById('dispSgstRate');
  const dispSgstAmount = document.getElementById('dispSgstAmount');
  const dispIgstRate = document.getElementById('dispIgstRate');
  const dispIgstAmount = document.getElementById('dispIgstAmount');
  const dispTotalTax = document.getElementById('dispTotalTax');

  const intraStateRows = document.getElementById('intraStateRows');
  const interStateRow = document.getElementById('interStateRow');
  const btnCopyGst = document.getElementById('btnCopyGst');

  // Profit Margin Elements
  const costPrice = document.getElementById('costPrice');
  const sellingPrice = document.getElementById('sellingPrice');
  const dispNetProfit = document.getElementById('dispNetProfit');
  const dispProfitMargin = document.getElementById('dispProfitMargin');
  const dispMarkup = document.getElementById('dispMarkup');
  const marginInsight = document.getElementById('marginInsight');

  function formatRupees(num) {
    return '₹' + Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Radio styling & mode handling
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.btn-check').forEach(lbl => {
        const inp = lbl.querySelector('input');
        if (inp.checked) {
          lbl.style.border = '1.5px solid var(--navy)';
          lbl.style.background = '#eef2ff';
        } else {
          lbl.style.border = '1.5px solid var(--border-color)';
          lbl.style.background = 'transparent';
        }
      });
      calculateGst();
    });
  });

  // Slab buttons
  slabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slabButtons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
      customGstRate.value = btn.dataset.rate;
      calculateGst();
    });
  });

  // Calculate GST
  function calculateGst() {
    if (!gstAmount || !customGstRate) return;

    const amount = parseFloat(gstAmount.value) || 0;
    const rate = parseFloat(customGstRate.value) || 0;
    const isExclusive = document.querySelector('input[name="gstMode"]:checked').value === 'exclusive';
    const isIntra = supplyType.value === 'intra';

    let basePrice = 0;
    let totalTax = 0;
    let finalAmount = 0;

    if (isExclusive) {
      basePrice = amount;
      totalTax = (amount * rate) / 100;
      finalAmount = basePrice + totalTax;
      dispModeBadge.textContent = `Net Amount + ${rate}% GST Added`;
      dispModeBadge.style.background = '#dcfce7';
      dispModeBadge.style.color = '#15803d';
    } else {
      finalAmount = amount;
      basePrice = amount / (1 + (rate / 100));
      totalTax = finalAmount - basePrice;
      dispModeBadge.textContent = `${rate}% GST Extracted from Total`;
      dispModeBadge.style.background = '#e0e7ff';
      dispModeBadge.style.color = '#3730a3';
    }

    dispFinalAmount.textContent = formatRupees(finalAmount);
    dispBasePrice.textContent = formatRupees(basePrice);
    dispTotalTax.textContent = formatRupees(totalTax);

    if (isIntra) {
      intraStateRows.style.display = 'block';
      interStateRow.style.display = 'none';

      const halfRate = (rate / 2).toFixed(2).replace(/\.00$/, '');
      const halfTax = totalTax / 2;

      dispCgstRate.textContent = `${halfRate}%`;
      dispCgstAmount.textContent = formatRupees(halfTax);
      dispSgstRate.textContent = `${halfRate}%`;
      dispSgstAmount.textContent = formatRupees(halfTax);
    } else {
      intraStateRows.style.display = 'none';
      interStateRow.style.display = 'flex';

      dispIgstRate.textContent = `${rate}%`;
      dispIgstAmount.textContent = formatRupees(totalTax);
    }
  }

  [gstAmount, customGstRate, supplyType].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateGst);
      el.addEventListener('change', calculateGst);
    }
  });

  // Copy Slip
  if (btnCopyGst) {
    btnCopyGst.addEventListener('click', () => {
      const isIntra = supplyType.value === 'intra';
      let slip = `GST TAX BREAKDOWN:\n` +
        `------------------------\n` +
        `Base Price: ${dispBasePrice.textContent}\n`;

      if (isIntra) {
        slip += `CGST (${dispCgstRate.textContent}): ${dispCgstAmount.textContent}\n` +
                `SGST (${dispSgstRate.textContent}): ${dispSgstAmount.textContent}\n`;
      } else {
        slip += `IGST (${dispIgstRate.textContent}): ${dispIgstAmount.textContent}\n`;
      }

      slip += `Total GST: ${dispTotalTax.textContent}\n` +
              `Total Payable: ${dispFinalAmount.textContent}\n` +
              `------------------------\n` +
              `Generated via AllToolsInOne.in`;

      navigator.clipboard.writeText(slip).then(() => {
        if (window.showToast) window.showToast('GST slip copied to clipboard!');
      });
    });
  }

  // Calculate Margin & Profit
  function calculateMargin() {
    if (!costPrice || !sellingPrice) return;

    const cp = parseFloat(costPrice.value) || 0;
    const sp = parseFloat(sellingPrice.value) || 0;

    const profit = sp - cp;
    const margin = sp > 0 ? (profit / sp) * 100 : 0;
    const markup = cp > 0 ? (profit / cp) * 100 : 0;

    dispNetProfit.textContent = formatRupees(profit);
    dispProfitMargin.textContent = margin.toFixed(2) + '%';
    dispMarkup.textContent = markup.toFixed(2) + '%';

    if (profit >= 0) {
      dispNetProfit.style.color = '#15803d';
      marginInsight.style.background = '#f0fdf4';
      marginInsight.style.borderColor = '#bbf7d0';
      marginInsight.innerHTML = `You earn <strong>${formatRupees(profit)}</strong> on every unit sold, giving a <strong>${margin.toFixed(2)}% margin</strong> on sales revenue.`;
    } else {
      dispNetProfit.style.color = '#b91c1c';
      marginInsight.style.background = '#fee2e2';
      marginInsight.style.borderColor = '#fca5a5';
      marginInsight.innerHTML = `⚠️ <strong>Loss Alert!</strong> You are selling at a loss of <strong>${formatRupees(Math.abs(profit))}</strong> per unit. Increase Selling Price above ${formatRupees(cp)}.`;
    }
  }

  [costPrice, sellingPrice].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateMargin);
      el.addEventListener('change', calculateMargin);
    }
  });

  // Initial runs
  calculateGst();
  calculateMargin();
});
