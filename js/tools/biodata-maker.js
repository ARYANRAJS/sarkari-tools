/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Marriage Biodata Maker Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const biodataPreviewSheet = document.getElementById('biodataPreviewSheet');
  const bioThemeBtns = document.querySelectorAll('#bioThemePicker .option-btn');
  const loadBioDemoBtn = document.getElementById('loadBioDemoBtn');
  const printBioBtn = document.getElementById('printBioBtn');
  const downloadBioPdfBtn = document.getElementById('downloadBioPdfBtn');

  // Input Fields
  const bioSymbolSelect = document.getElementById('bioSymbolSelect');
  const bioName = document.getElementById('bioName');
  const bioDob = document.getElementById('bioDob');
  const bioTob = document.getElementById('bioTob');
  const bioPob = document.getElementById('bioPob');
  const bioHeight = document.getElementById('bioHeight');
  const bioComplexion = document.getElementById('bioComplexion');
  const bioReligion = document.getElementById('bioReligion');
  const bioGotra = document.getElementById('bioGotra');
  const bioRashi = document.getElementById('bioRashi');
  const bioManglik = document.getElementById('bioManglik');
  const bioEducation = document.getElementById('bioEducation');
  const bioOccupation = document.getElementById('bioOccupation');
  const bioIncome = document.getElementById('bioIncome');
  const bioFather = document.getElementById('bioFather');
  const bioMother = document.getElementById('bioMother');
  const bioSiblings = document.getElementById('bioSiblings');
  const bioFamilyType = document.getElementById('bioFamilyType');
  const bioAddress = document.getElementById('bioAddress');
  const bioPhone = document.getElementById('bioPhone');
  const bioEmail = document.getElementById('bioEmail');

  let currentTheme = 'bio-traditional';

  // Theme Switching
  bioThemeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bioThemeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      biodataPreviewSheet.className = `biodata-sheet ${currentTheme}`;
      renderBiodata();
    });
  });

  const allInputs = [
    bioSymbolSelect, bioName, bioDob, bioTob, bioPob, bioHeight, bioComplexion,
    bioReligion, bioGotra, bioRashi, bioManglik, bioEducation, bioOccupation,
    bioIncome, bioFather, bioMother, bioSiblings, bioFamilyType, bioAddress,
    bioPhone, bioEmail
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', renderBiodata);
    input.addEventListener('change', renderBiodata);
  });

  function renderBiodata() {
    const symbol = bioSymbolSelect.value;
    const name = bioName.value || 'Name';

    biodataPreviewSheet.innerHTML = `
      <div class="bio-heading">
        <div class="bio-symbol">${symbol}</div>
        <h2 style="font-size: 22px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin: 4px 0 2px;">MATRIMONIAL BIODATA</h2>
        <div style="font-size: 13px; color: #6b7280; font-weight: 500;">(शादी हेतु बायोडाटा)</div>
      </div>

      <!-- Section: Personal Details -->
      <div class="sec-title">1. Personal Details / व्यक्तिगत विवरण</div>
      <table class="bio-table">
        <tr><td class="bio-label">Full Name / नाम:</td><td class="bio-val" style="font-weight: 700; font-size: 14px; color: #1a237e;">${name}</td></tr>
        ${bioDob.value ? `<tr><td class="bio-label">Date of Birth / जन्म तिथि:</td><td class="bio-val">${bioDob.value}</td></tr>` : ''}
        ${bioTob.value ? `<tr><td class="bio-label">Time of Birth / जन्म समय:</td><td class="bio-val">${bioTob.value}</td></tr>` : ''}
        ${bioPob.value ? `<tr><td class="bio-label">Place of Birth / जन्म स्थान:</td><td class="bio-val">${bioPob.value}</td></tr>` : ''}
        ${bioHeight.value ? `<tr><td class="bio-label">Height / कद:</td><td class="bio-val">${bioHeight.value}</td></tr>` : ''}
        ${bioComplexion.value ? `<tr><td class="bio-label">Complexion / रंग-रूप:</td><td class="bio-val">${bioComplexion.value}</td></tr>` : ''}
      </table>

      <!-- Section: Kundli & Religious Details -->
      <div class="sec-title">2. Religious & Astrology / धार्मिक एवं कुंडली विवरण</div>
      <table class="bio-table">
        ${bioReligion.value ? `<tr><td class="bio-label">Religion & Caste / धर्म व जाति:</td><td class="bio-val">${bioReligion.value}</td></tr>` : ''}
        ${bioGotra.value ? `<tr><td class="bio-label">Gotra / गोत्र:</td><td class="bio-val">${bioGotra.value}</td></tr>` : ''}
        ${bioRashi.value ? `<tr><td class="bio-label">Rashi & Nakshatra / राशि व नक्षत्र:</td><td class="bio-val">${bioRashi.value}</td></tr>` : ''}
        ${bioManglik.value ? `<tr><td class="bio-label">Manglik / मांगलिक दोष:</td><td class="bio-val" style="font-weight: 600;">${bioManglik.value}</td></tr>` : ''}
      </table>

      <!-- Section: Education & Profession -->
      <div class="sec-title">3. Education & Profession / शिक्षा व व्यवसाय</div>
      <table class="bio-table">
        ${bioEducation.value ? `<tr><td class="bio-label">Highest Qualification / शिक्षा:</td><td class="bio-val" style="font-weight: 600;">${bioEducation.value}</td></tr>` : ''}
        ${bioOccupation.value ? `<tr><td class="bio-label">Occupation / व्यवसाय:</td><td class="bio-val">${bioOccupation.value}</td></tr>` : ''}
        ${bioIncome.value ? `<tr><td class="bio-label">Annual Income / वार्षिक आय:</td><td class="bio-val" style="color: #059669; font-weight: 600;">${bioIncome.value}</td></tr>` : ''}
      </table>

      <!-- Section: Family Background -->
      <div class="sec-title">4. Family Background / पारिवारिक विवरण</div>
      <table class="bio-table">
        ${bioFather.value ? `<tr><td class="bio-label">Father's Name / पिता का नाम:</td><td class="bio-val">${bioFather.value}</td></tr>` : ''}
        ${bioMother.value ? `<tr><td class="bio-label">Mother's Name / माता का नाम:</td><td class="bio-val">${bioMother.value}</td></tr>` : ''}
        ${bioSiblings.value ? `<tr><td class="bio-label">Siblings / भाई-बहन:</td><td class="bio-val">${bioSiblings.value}</td></tr>` : ''}
        ${bioFamilyType.value ? `<tr><td class="bio-label">Family Values / परिवार:</td><td class="bio-val">${bioFamilyType.value}</td></tr>` : ''}
      </table>

      <!-- Section: Contact Details -->
      <div class="sec-title">5. Contact Information / संपर्क विवरण</div>
      <table class="bio-table">
        ${bioAddress.value ? `<tr><td class="bio-label">Address / पता:</td><td class="bio-val">${bioAddress.value}</td></tr>` : ''}
        ${bioPhone.value ? `<tr><td class="bio-label">Phone Numbers / दूरभाष:</td><td class="bio-val" style="font-weight: 600; color: #1a237e;">${bioPhone.value}</td></tr>` : ''}
        ${bioEmail.value ? `<tr><td class="bio-label">Email / ईमेल:</td><td class="bio-val">${bioEmail.value}</td></tr>` : ''}
      </table>
    `;
  }

  // Demo Data
  loadBioDemoBtn.addEventListener('click', () => {
    bioName.value = 'Rohit Kumar Sharma';
    bioDob.value = '18 August 1997';
    bioTob.value = '06:45 AM';
    bioPob.value = 'Jaipur, Rajasthan';
    bioHeight.value = '5 ft 10 in (178 cm)';
    bioComplexion.value = 'Fair / B+ Positive';
    bioReligion.value = 'Hindu, Gaur Brahmin';
    bioGotra.value = 'Kaushik (Maternal: Vashisht)';
    bioRashi.value = 'Leo (सिंह) / Magha';
    bioEducation.value = 'B.Tech (Computer Science) - NIT Jaipur';
    bioOccupation.value = 'Senior Software Engineer, MNC Gurugram';
    bioIncome.value = '₹ 22 Lakhs Per Annum';
    bioFather.value = 'Shri Ramesh Sharma (Gazetted Officer, Govt of Rajasthan)';
    bioMother.value = 'Smt. Sunita Sharma (Homemaker)';
    bioSiblings.value = '1 Younger Sister (MBA, Unmarried)';
    bioFamilyType.value = 'Nuclear Family with Traditional Values';
    bioAddress.value = 'Plot No. 45, Surya Nagar, Gopalpura Bypass, Jaipur, Rajasthan';
    bioPhone.value = '+91 98290 12345, +91 94140 67890';
    renderBiodata();
    window.showToast('Sample Matrimonial Biodata loaded!', 'success');
  });

  // Print
  printBioBtn.addEventListener('click', () => {
    window.print();
  });

  // Download PDF
  downloadBioPdfBtn.addEventListener('click', async () => {
    if (!window.html2canvas || !window.jspdf) {
      window.showToast('PDF library loading... please wait 2 seconds', 'warning');
      return;
    }

    downloadBioPdfBtn.disabled = true;
    downloadBioPdfBtn.innerHTML = '<span class="chakra-spinner sm" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> Generating PDF...';

    try {
      const canvas = await window.html2canvas(biodataPreviewSheet, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      const fileName = `${(bioName.value || 'Marriage_Biodata').trim().replace(/\s+/g, '_')}_Biodata.pdf`;
      pdf.save(fileName);
      window.showToast('Marriage Biodata PDF downloaded! 💍', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Error generating Biodata PDF', 'error');
    } finally {
      downloadBioPdfBtn.disabled = false;
      downloadBioPdfBtn.innerHTML = '📥 Download PDF';
    }
  });

  // Initial Render
  renderBiodata();

})();
