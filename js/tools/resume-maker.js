/* ═══════════════════════════════════════════════════
   AllToolsInOne — Resume / CV Maker Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Elements
  const resumePreviewSheet = document.getElementById('resumePreviewSheet');
  const templateBtns = document.querySelectorAll('#templatePicker .option-btn');
  const loadDemoBtn = document.getElementById('loadDemoBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  // Input Elements
  const inpName = document.getElementById('inpName');
  const inpTitle = document.getElementById('inpTitle');
  const inpEmail = document.getElementById('inpEmail');
  const inpPhone = document.getElementById('inpPhone');
  const inpCity = document.getElementById('inpCity');
  const inpLinkedin = document.getElementById('inpLinkedin');
  const inpSummary = document.getElementById('inpSummary');
  const inpSkills = document.getElementById('inpSkills');
  const inpLanguages = document.getElementById('inpLanguages');
  const inpDeclaration = document.getElementById('inpDeclaration');

  const eduListContainer = document.getElementById('eduListContainer');
  const expListContainer = document.getElementById('expListContainer');
  const addEduBtn = document.getElementById('addEduBtn');
  const addExpBtn = document.getElementById('addExpBtn');

  let currentTheme = 'theme-classic';

  // State
  let educationData = [
    { degree: 'Bachelor of Commerce (Hons.)', institution: 'Delhi University (SRCC)', year: '2023', score: '8.4 CGPA' },
    { degree: 'Class XII (Senior Secondary)', institution: 'CBSE Board - Delhi Public School', year: '2020', score: '94.2%' },
    { degree: 'Class X (Secondary)', institution: 'CBSE Board - Delhi Public School', year: '2018', score: '92.0%' }
  ];

  let experienceData = [
    { title: 'Accounts & Audit Intern', company: 'P.K. & Associates Chartered Accountants', period: 'July 2023 - Present', desc: 'Assisted in statutory tax audits, ledger verification, GST return reconciliations, and prepared structured financial statements for medium-scale manufacturing firms.' },
    { title: 'Project Trainee', company: 'National Informatics Centre (NIC) Project', period: 'Jan 2023 - June 2023', desc: 'Conducted verification of data records for public distribution portal and generated monthly operational compliance reports.' }
  ];

  // Template Switching
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      resumePreviewSheet.className = `resume-a4-sheet ${currentTheme}`;
      renderPreview();
    });
  });

  // Repeater Renders
  function renderEduInputs() {
    eduListContainer.innerHTML = '';
    educationData.forEach((edu, idx) => {
      const row = document.createElement('div');
      row.className = 'repeater-item';
      row.innerHTML = `
        <div class="form-fields">
          <div class="form-row">
            <input type="text" class="form-input edu-deg" placeholder="Degree / Exam" value="${edu.degree}">
            <input type="text" class="form-input edu-inst" placeholder="College / Board" value="${edu.institution}">
          </div>
          <div class="form-row" style="margin-top: 6px;">
            <input type="text" class="form-input edu-yr" placeholder="Year" value="${edu.year}">
            <input type="text" class="form-input edu-sc" placeholder="Marks / CGPA" value="${edu.score}">
          </div>
        </div>
        <button type="button" class="remove-btn del-edu">✕</button>
      `;

      row.querySelector('.edu-deg').addEventListener('input', (e) => { edu.degree = e.target.value; renderPreview(); });
      row.querySelector('.edu-inst').addEventListener('input', (e) => { edu.institution = e.target.value; renderPreview(); });
      row.querySelector('.edu-yr').addEventListener('input', (e) => { edu.year = e.target.value; renderPreview(); });
      row.querySelector('.edu-sc').addEventListener('input', (e) => { edu.score = e.target.value; renderPreview(); });
      row.querySelector('.del-edu').addEventListener('click', () => {
        educationData.splice(idx, 1);
        renderEduInputs();
        renderPreview();
      });

      eduListContainer.appendChild(row);
    });
  }

  function renderExpInputs() {
    expListContainer.innerHTML = '';
    experienceData.forEach((exp, idx) => {
      const row = document.createElement('div');
      row.className = 'repeater-item';
      row.innerHTML = `
        <div class="form-fields">
          <div class="form-row">
            <input type="text" class="form-input exp-title" placeholder="Job Title" value="${exp.title}">
            <input type="text" class="form-input exp-comp" placeholder="Company / Dept" value="${exp.company}">
          </div>
          <div class="form-row" style="margin-top: 6px;">
            <input type="text" class="form-input exp-per" placeholder="Duration (e.g. 2023 - Present)" value="${exp.period}">
          </div>
          <div style="margin-top: 6px;">
            <textarea class="form-textarea exp-desc" rows="2" placeholder="Responsibilities / Achievements">${exp.desc}</textarea>
          </div>
        </div>
        <button type="button" class="remove-btn del-exp">✕</button>
      `;

      row.querySelector('.exp-title').addEventListener('input', (e) => { exp.title = e.target.value; renderPreview(); });
      row.querySelector('.exp-comp').addEventListener('input', (e) => { exp.company = e.target.value; renderPreview(); });
      row.querySelector('.exp-per').addEventListener('input', (e) => { exp.period = e.target.value; renderPreview(); });
      row.querySelector('.exp-desc').addEventListener('input', (e) => { exp.desc = e.target.value; renderPreview(); });
      row.querySelector('.del-exp').addEventListener('click', () => {
        experienceData.splice(idx, 1);
        renderExpInputs();
        renderPreview();
      });

      expListContainer.appendChild(row);
    });
  }

  addEduBtn.addEventListener('click', () => {
    educationData.push({ degree: 'New Degree / Course', institution: 'Board / Institute', year: '2024', score: 'First Class' });
    renderEduInputs();
    renderPreview();
  });

  addExpBtn.addEventListener('click', () => {
    experienceData.push({ title: 'Designation', company: 'Organization', period: '2023 - 2024', desc: 'Key duties and achievements performed in this role.' });
    renderExpInputs();
    renderPreview();
  });

  // Input Listeners
  [inpName, inpTitle, inpEmail, inpPhone, inpCity, inpLinkedin, inpSummary, inpSkills, inpLanguages, inpDeclaration].forEach(inp => {
    inp.addEventListener('input', renderPreview);
  });

  // Render Preview Engine
  function renderPreview() {
    const name = inpName.value || 'YOUR FULL NAME';
    const title = inpTitle.value || 'Target Position';
    const email = inpEmail.value || '';
    const phone = inpPhone.value || '';
    const city = inpCity.value || '';
    const linkedin = inpLinkedin.value || '';
    const summary = inpSummary.value || '';
    const skills = (inpSkills.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const languages = (inpLanguages.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const declaration = inpDeclaration.value || '';

    if (currentTheme === 'theme-modern') {
      // 2-Column Modern Layout
      resumePreviewSheet.innerHTML = `
        <div class="res-sidebar">
          <div class="res-name">${name}</div>
          <div class="res-title">${title}</div>

          <div style="margin-bottom: 24px;">
            <div class="res-sec-title">Contact</div>
            <div style="font-size: 11px; line-height: 1.8; opacity: 0.9;">
              ${phone ? `<div>📞 ${phone}</div>` : ''}
              ${email ? `<div>✉️ ${email}</div>` : ''}
              ${city ? `<div>📍 ${city}</div>` : ''}
              ${linkedin ? `<div>🔗 ${linkedin}</div>` : ''}
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <div class="res-sec-title">Key Skills</div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
              ${skills.map(s => `<span style="background: rgba(255,255,255,0.12); padding: 3px 8px; border-radius: 4px;">• ${s}</span>`).join('')}
            </div>
          </div>

          <div>
            <div class="res-sec-title">Languages</div>
            <div style="font-size: 11px; line-height: 1.6; opacity: 0.9;">
              ${languages.map(l => `<div>• ${l}</div>`).join('')}
            </div>
          </div>
        </div>

        <div class="res-main">
          ${summary ? `
          <div class="res-section">
            <div class="res-sec-title">Professional Summary</div>
            <p style="color: #4b5563; font-size: 12px; line-height: 1.6;">${summary}</p>
          </div>` : ''}

          <div class="res-section">
            <div class="res-sec-title">Work Experience</div>
            ${experienceData.map(exp => `
              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 13px; color: #1a237e;">
                  <span>${exp.title}</span>
                  <span style="font-size: 11px; color: #6b7280; font-weight: 400;">${exp.period}</span>
                </div>
                <div style="font-weight: 500; font-size: 11px; color: #ff9933; margin-bottom: 4px;">${exp.company}</div>
                <p style="font-size: 11.5px; color: #4b5563; line-height: 1.5;">${exp.desc}</p>
              </div>
            `).join('')}
          </div>

          <div class="res-section">
            <div class="res-sec-title">Education & Qualifications</div>
            ${educationData.map(edu => `
              <div style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: #1a237e;">${edu.degree}</div>
                  <div style="font-size: 11px; color: #6b7280;">${edu.institution}</div>
                </div>
                <div style="text-align: right; font-size: 11px;">
                  <div style="font-weight: 600; color: #059669;">${edu.score}</div>
                  <div style="color: #9ca3af;">${edu.year}</div>
                </div>
              </div>
            `).join('')}
          </div>

          ${declaration ? `
          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px dashed #e5e7eb; font-size: 10.5px; color: #6b7280;">
            <strong>Declaration:</strong> ${declaration}
            <div style="margin-top: 16px; text-align: right; font-weight: 600; color: #1a237e;">(${name})</div>
          </div>` : ''}
        </div>
      `;
    } else {
      // Classic & Saffron Layouts (Single Column Standard)
      resumePreviewSheet.innerHTML = `
        <div class="res-header">
          <div class="res-name">${name}</div>
          <div class="res-title" style="margin-top: 2px;">${title}</div>
          <div class="res-contact">
            ${phone ? `<span>📞 ${phone}</span>` : ''}
            ${email ? `<span>✉️ ${email}</span>` : ''}
            ${city ? `<span>📍 ${city}</span>` : ''}
            ${linkedin ? `<span>🔗 ${linkedin}</span>` : ''}
          </div>
        </div>

        ${summary ? `
        <div class="res-section">
          <div class="res-sec-title">Career Objective</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">${summary}</p>
        </div>` : ''}

        <div class="res-section">
          <div class="res-sec-title">Educational Qualifications</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; text-align: left; color: #1e293b;">
                <th style="padding: 6px 8px;">Examination / Degree</th>
                <th style="padding: 6px 8px;">Board / University</th>
                <th style="padding: 6px 8px;">Year</th>
                <th style="padding: 6px 8px; text-align: right;">Percentage/CGPA</th>
              </tr>
            </thead>
            <tbody>
              ${educationData.map(edu => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 8px; font-weight: 600;">${edu.degree}</td>
                  <td style="padding: 6px 8px; color: #475569;">${edu.institution}</td>
                  <td style="padding: 6px 8px; color: #64748b;">${edu.year}</td>
                  <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: #059669;">${edu.score}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="res-section">
          <div class="res-sec-title">Work Experience & Internships</div>
          ${experienceData.map(exp => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 12.5px;">
                <span style="color: #1a237e;">${exp.title} — <span style="font-weight: 400; color: #475569;">${exp.company}</span></span>
                <span style="font-size: 11px; color: #64748b; font-weight: 500;">${exp.period}</span>
              </div>
              <p style="font-size: 11.5px; color: #374151; line-height: 1.5; margin-top: 2px;">${exp.desc}</p>
            </div>
          `).join('')}
        </div>

        <div class="res-section">
          <div class="res-sec-title">Key Competencies & Technical Skills</div>
          <div style="font-size: 12px; color: #374151;">
            <strong>Skills:</strong> ${skills.join(' • ')}
          </div>
          <div style="font-size: 12px; color: #374151; margin-top: 4px;">
            <strong>Languages Known:</strong> ${languages.join(', ')}
          </div>
        </div>

        ${declaration ? `
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
          <strong>Declaration:</strong> ${declaration}
          <div style="display: flex; justify-content: space-between; margin-top: 18px;">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br><strong>Place:</strong> ${city || 'India'}</div>
            <div style="text-align: right;"><strong>Signature:</strong><br><br><strong>(${name})</strong></div>
          </div>
        </div>` : ''}
      `;
    }
  }

  // Load Demo Data
  loadDemoBtn.addEventListener('click', () => {
    inpName.value = 'Rahul Kumar Sharma';
    inpTitle.value = 'Assistant Audit Officer (Selected SSC CGL 2026)';
    inpEmail.value = 'rahul.sharma@govmail.in';
    inpPhone.value = '+91 98765 43210';
    inpCity.value = 'New Delhi, India';
    inpSummary.value = 'First-class Commerce graduate from University of Delhi with thorough proficiency in financial auditing, quantitative problem solving, and public administration.';
    inpSkills.value = 'Financial Accounting, Taxation, Advanced MS Excel, Public Finance, Audit Reporting, Quantitative Analysis';
    inpLanguages.value = 'Hindi (Native), English (Fluent)';
    renderPreview();
    window.showToast('Sample Resume data loaded!', 'success');
  });

  // Print
  printResumeBtn.addEventListener('click', () => {
    window.print();
  });

  // Download PDF
  downloadPdfBtn.addEventListener('click', async () => {
    if (!window.html2canvas || !window.jspdf) {
      window.showToast('PDF libraries loading, please retry in 2 seconds', 'warning');
      return;
    }

    downloadPdfBtn.disabled = true;
    downloadPdfBtn.innerHTML = '<span class="chakra-spinner sm" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> Generating PDF...';

    try {
      const canvas = await window.html2canvas(resumePreviewSheet, {
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
      const fileName = `${(inpName.value || 'Resume').trim().replace(/\s+/g, '_')}_CV.pdf`;
      pdf.save(fileName);
      window.showToast('Resume PDF downloaded successfully! 📄', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Error generating Resume PDF', 'error');
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = '📥 Download PDF';
    }
  });

  // Init
  renderEduInputs();
  renderExpInputs();
  renderPreview();

})();
