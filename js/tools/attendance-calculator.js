/**
 * AllToolsInOne - College Attendance & CGPA Calculator
 * Client-side calculation of 75% college attendance requirements and CGPA conversion
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = document.querySelectorAll('.tool-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Attendance Calculator Elements
  const inpTotalClasses = document.getElementById('inpTotalClasses');
  const inpAttendedClasses = document.getElementById('inpAttendedClasses');
  const inpTargetPercent = document.getElementById('inpTargetPercent');

  const currentPercentDisplay = document.getElementById('currentPercentDisplay');
  const attendanceAdviceBadge = document.getElementById('attendanceAdviceBadge');
  const resClassesHeld = document.getElementById('resClassesHeld');
  const resClassesAttended = document.getElementById('resClassesAttended');
  const resClassesMissed = document.getElementById('resClassesMissed');

  function calculateAttendance() {
    if (!inpTotalClasses || !inpAttendedClasses || !inpTargetPercent) return;

    let total = parseInt(inpTotalClasses.value, 10);
    let attended = parseInt(inpAttendedClasses.value, 10);
    const target = parseFloat(inpTargetPercent.value) || 75;

    if (isNaN(total) || total <= 0) total = 1;
    if (isNaN(attended) || attended < 0) attended = 0;

    if (attended > total) {
      attended = total;
      inpAttendedClasses.value = total;
    }

    const missed = total - attended;
    const currentPercent = (attended / total) * 100;

    // Update stats
    resClassesHeld.textContent = total;
    resClassesAttended.textContent = attended;
    resClassesMissed.textContent = missed;
    currentPercentDisplay.textContent = currentPercent.toFixed(2) + '%';

    const targetDecimal = target / 100;

    if (currentPercent < target) {
      // Must attend X more classes
      // (attended + X) / (total + X) >= targetDecimal
      // attended + X >= targetDecimal * total + targetDecimal * X
      // X * (1 - targetDecimal) >= targetDecimal * total - attended
      // X = ceil((targetDecimal * total - attended) / (1 - targetDecimal))
      const classesNeeded = Math.ceil((targetDecimal * total - attended) / (1 - targetDecimal));
      
      currentPercentDisplay.style.color = '#dc2626'; // Red
      attendanceAdviceBadge.style.background = '#fee2e2';
      attendanceAdviceBadge.style.color = '#991b1b';
      attendanceAdviceBadge.style.borderColor = '#fca5a5';
      attendanceAdviceBadge.innerHTML = `⚠️ <strong>Attendance Shortage!</strong> You need to attend the next <strong>${classesNeeded} consecutive class${classesNeeded > 1 ? 'es' : ''}</strong> without missing any to reach ${target}%.`;
    } else {
      // Safe to bunk Y classes
      // attended / (total + Y) >= targetDecimal
      // total + Y <= attended / targetDecimal
      // Y = floor((attended / targetDecimal) - total)
      const safeToBunk = Math.floor((attended / targetDecimal) - total);

      currentPercentDisplay.style.color = '#16a34a'; // Green
      attendanceAdviceBadge.style.background = '#dcfce7';
      attendanceAdviceBadge.style.color = '#166534';
      attendanceAdviceBadge.style.borderColor = '#86efac';

      if (safeToBunk > 0) {
        attendanceAdviceBadge.innerHTML = `🎉 <strong>Safe Zone!</strong> You can safely miss the next <strong>${safeToBunk} class${safeToBunk > 1 ? 'es' : ''}</strong> and your attendance will still stay above ${target}%.`;
      } else {
        attendanceAdviceBadge.innerHTML = `⚖️ <strong>Borderline Alert:</strong> You are right at ${currentPercent.toFixed(1)}%. You cannot afford to miss any class right now without falling below ${target}%.`;
      }
    }
  }

  [inpTotalClasses, inpAttendedClasses, inpTargetPercent].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateAttendance);
      el.addEventListener('change', calculateAttendance);
    }
  });

  // CGPA to Percentage Elements
  const inpCgpa = document.getElementById('inpCgpa');
  const cgpaFormulaSelect = document.getElementById('cgpaFormulaSelect');
  const cgpaPercentResult = document.getElementById('cgpaPercentResult');
  const cgpaFormulaNote = document.getElementById('cgpaFormulaNote');

  function calculateCgpa() {
    if (!inpCgpa || !cgpaFormulaSelect || !cgpaPercentResult) return;

    let cgpa = parseFloat(inpCgpa.value);
    if (isNaN(cgpa)) cgpa = 0;
    if (cgpa > 10) {
      cgpa = 10;
      inpCgpa.value = 10;
    }
    if (cgpa < 0) {
      cgpa = 0;
      inpCgpa.value = 0;
    }

    const formula = cgpaFormulaSelect.value;
    let percentage = 0;
    let formulaNote = '';

    switch (formula) {
      case '9.5':
        percentage = cgpa * 9.5;
        formulaNote = `Official CBSE standard: ${cgpa.toFixed(2)} × 9.5 = ${percentage.toFixed(2)}%`;
        break;
      case '10':
        percentage = cgpa * 10;
        formulaNote = `Direct Scale standard: ${cgpa.toFixed(2)} × 10 = ${percentage.toFixed(2)}%`;
        break;
      case 'mumbai':
        percentage = (cgpa * 7.1) + 11;
        formulaNote = `Mumbai University standard: (${cgpa.toFixed(2)} × 7.1) + 11 = ${percentage.toFixed(2)}%`;
        break;
      case 'vtu':
        percentage = Math.max(0, (cgpa - 0.75) * 10);
        formulaNote = `VTU Karnataka standard: (${cgpa.toFixed(2)} - 0.75) × 10 = ${percentage.toFixed(2)}%`;
        break;
      case 'aktu':
        percentage = cgpa * 10;
        formulaNote = `AKTU / UPTU standard: ${cgpa.toFixed(2)} × 10 = ${percentage.toFixed(2)}%`;
        break;
      default:
        percentage = cgpa * 9.5;
        formulaNote = `${cgpa.toFixed(2)} × 9.5 = ${percentage.toFixed(2)}%`;
    }

    if (percentage > 100) percentage = 100;
    cgpaPercentResult.textContent = percentage.toFixed(2) + '%';
    if (cgpaFormulaNote) {
      cgpaFormulaNote.textContent = formulaNote;
    }
  }

  [inpCgpa, cgpaFormulaSelect].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateCgpa);
      el.addEventListener('change', calculateCgpa);
    }
  });

  // Initial runs
  calculateAttendance();
  calculateCgpa();
});
