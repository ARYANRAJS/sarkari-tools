/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Age Calculator Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dobInput = document.getElementById('dobInput');
  const asOfDateInput = document.getElementById('asOfDateInput');
  const categorySelect = document.getElementById('categorySelect');
  const calculateBtn = document.getElementById('calculateBtn');
  const mainAgeDisplay = document.getElementById('mainAgeDisplay');
  const statMonths = document.getElementById('statMonths');
  const statWeeks = document.getElementById('statWeeks');
  const statDays = document.getElementById('statDays');
  const statNextBday = document.getElementById('statNextBday');
  const examEligibilityGrid = document.getElementById('examEligibilityGrid');

  // Exam Database with standard age limits (min, max for General category)
  const EXAMS = [
    { name: 'SSC CGL (Combined Graduate Level)', min: 18, max: 32, note: 'Inspectors & Assistants' },
    { name: 'SSC CHSL (10+2 Level)', min: 18, max: 27, note: 'LDC / DEO Posts' },
    { name: 'SSC MTS & Havaldar', min: 18, max: 25, note: 'Matriculation Level' },
    { name: 'Railway RRB NTPC', min: 18, max: 33, note: 'Graduate & Under-Grad' },
    { name: 'UPSC Civil Services (IAS/IPS)', min: 21, max: 32, note: 'Graduation Required' },
    { name: 'IBPS PO / Clerk (Banking)', min: 20, max: 30, note: 'Nationalized Banks' },
    { name: 'State Police Constable', min: 18, max: 25, note: 'General State Norms' },
    { name: 'NDA & NA Exam (Defence)', min: 16.5, max: 19.5, note: 'No Category Relaxation' }
  ];

  // Set default As of Date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  asOfDateInput.value = `${yyyy}-${mm}-${dd}`;

  calculateBtn.addEventListener('click', calculateAge);
  categorySelect.addEventListener('change', calculateAge);
  dobInput.addEventListener('change', calculateAge);
  asOfDateInput.addEventListener('change', calculateAge);

  function calculateAge() {
    if (!dobInput.value || !asOfDateInput.value) {
      window.showToast('Please select both Date of Birth and Cutoff Date', 'warning');
      return;
    }

    const birthDate = new Date(dobInput.value);
    const targetDate = new Date(asOfDateInput.value);

    if (birthDate > targetDate) {
      window.showToast('Date of Birth cannot be after the Cutoff Date', 'error');
      return;
    }

    // Exact years, months, days calculation
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month of targetDate
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Display Main Age
    mainAgeDisplay.textContent = `${years} Years, ${months} Months, ${days} Days`;

    // Total Diff in Time
    const diffTime = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    statMonths.textContent = totalMonths.toLocaleString();
    statWeeks.textContent = totalWeeks.toLocaleString();
    statDays.textContent = totalDays.toLocaleString();

    // Next Birthday Calculation
    let nextBday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday < targetDate) {
      nextBday = new Date(targetDate.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }
    const daysToBday = Math.ceil((nextBday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    statNextBday.textContent = daysToBday === 0 ? 'Today! 🎂' : `${daysToBday} Days`;

    // Compute Eligibility with Category Relaxation
    const relaxation = parseInt(categorySelect.value, 10);
    const candidateAgeYears = years + (months / 12) + (days / 365.25);

    renderEligibility(candidateAgeYears, relaxation);
  }

  function renderEligibility(ageInYears, relaxation) {
    examEligibilityGrid.innerHTML = '';

    EXAMS.forEach(exam => {
      // NDA has strict no relaxation
      const effMax = exam.name.includes('NDA') ? exam.max : (exam.max + relaxation);
      const effMin = exam.min;

      let isEligible = false;
      let statusText = '';
      let badgeClass = '';

      if (ageInYears < effMin) {
        statusText = 'Under-Age';
        badgeClass = 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;';
      } else if (ageInYears > effMax) {
        statusText = 'Over-Age';
        badgeClass = 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;';
      } else {
        isEligible = true;
        statusText = 'Eligible ✓';
        badgeClass = 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;';
      }

      const card = document.createElement('div');
      card.style.cssText = `
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        transition: transform var(--duration-fast);
      `;

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
            <h4 style="font-size: var(--text-sm); font-weight: 600; color: var(--navy); line-height: 1.3;">${exam.name}</h4>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); white-space: nowrap; ${badgeClass}">${statusText}</span>
          </div>
          <p style="font-size: var(--text-xs); color: var(--gray-500);">${exam.note}</p>
        </div>
        <div style="font-size: 11px; color: var(--gray-600); border-top: 1px dashed var(--gray-200); padding-top: 6px; display: flex; justify-content: space-between;">
          <span>Allowed: <strong>${effMin} - ${effMax} Yrs</strong></span>
          ${relaxation > 0 && !exam.name.includes('NDA') ? `<span style="color: var(--saffron-dark);">+${relaxation}Yrs Rel.</span>` : ''}
        </div>
      `;

      examEligibilityGrid.appendChild(card);
    });
  }

  // Initial calculation on load
  calculateAge();

})();
