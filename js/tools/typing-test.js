/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Govt Exam Typing Test Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const langSelect = document.getElementById('langSelect');
  const timeSelect = document.getElementById('timeSelect');
  const passageSelect = document.getElementById('passageSelect');
  const timeLeftDisplay = document.getElementById('timeLeftDisplay');
  const netWpmDisplay = document.getElementById('netWpmDisplay');
  const accuracyDisplay = document.getElementById('accuracyDisplay');
  const errorCountDisplay = document.getElementById('errorCountDisplay');
  const typingDisplay = document.getElementById('typingDisplay');
  const typingInput = document.getElementById('typingInput');
  const restartBtn = document.getElementById('restartBtn');
  const finishTestBtn = document.getElementById('finishTestBtn');
  const testResultCard = document.getElementById('testResultCard');
  const sscStatusBadge = document.getElementById('sscStatusBadge');
  const resGrossWpm = document.getElementById('resGrossWpm');
  const resNetWpm = document.getElementById('resNetWpm');
  const resAccuracy = document.getElementById('resAccuracy');
  const resTotalChars = document.getElementById('resTotalChars');

  // Realistic Examination Passages
  const PASSAGES = {
    en: [
      `The Digital India initiative was launched with the vision to transform India into a digitally empowered society and knowledge economy. By improving digital infrastructure, enabling direct digital delivery of public services, and enhancing digital literacy across urban and rural sectors, governance has become transparent and accessible to every citizen. The expansion of broadband networks, combined with digital identity systems, has modernized welfare schemes, eliminated duplicate beneficiaries, and promoted ease of living. In recruitment and educational assessments, computer-based examinations have replaced conventional offline modes, ensuring transparency and timely result publication across national testing boards.`,
      `Indian Railways represents the lifeline of national logistics and passenger mobility, connecting diverse cultures, industries, and geographical regions. Recent modernization efforts focus on high-speed rail corridors, dedicated freight lines, redevelopment of world-class stations, and advanced automatic train protection systems. These comprehensive infrastructural enhancements foster economic growth by reducing transit times and logistics costs for agricultural and manufacturing hubs. As sustainable transportation becomes imperative, electrification of railway networks substantially curbs carbon emissions while offering reliable, economical connectivity to millions of daily commuters across India.`,
      `Environmental conservation and sustainable water management have emerged as critical priorities for developing nations. Rapid industrialization and expanding urbanization demand responsible resource consumption, conservation of natural wetlands, and reforestation drives. Government programs promoting renewable solar energy, zero-emission electric vehicles, and community-led rainwater harvesting have catalyzed active citizen participation. Safeguarding biodiversity not only maintains ecological balance but also strengthens resilience against unpredictable climatic patterns and droughts, securing prosperity for upcoming generations.`
    ],
    hi: [
      `डिजिटल भारत कार्यक्रम का मुख्य उद्देश्य देश को डिजिटल रूप से सशक्त समाज और ज्ञान आधारित अर्थव्यवस्था में बदलना है। सरकारी सेवाओं को इलेक्ट्रॉनिक रूप से नागरिकों तक पहुंचाने के लिए आधुनिक तकनीक का उपयोग किया जा रहा है। आधार प्रणाली और प्रत्यक्ष लाभ अंतरण ने लोक कल्याणकारी योजनाओं में पारदर्शिता सुनिश्चित की है। युवाओं के लिए ऑनलाइन शिक्षा, कौशल विकास और प्रतियोगी परीक्षाओं की तैयारी के नए अवसर उत्पन्न हुए हैं। प्रशासन में सूचना प्रौद्योगिकी का प्रयोग भ्रष्टाचार को समाप्त करने में अत्यंत प्रभावी सिद्ध हुआ है।`,
      `भारतीय रेल देश के सामाजिक और आर्थिक विकास की जीवनरेखा है। विशाल रेल नेटवर्क प्रतिदिन करोड़ों यात्रियों और लाखों टन माल को गंतव्य तक पहुंचाता है। आधुनिक वंदे भारत ट्रेनों और अमृत भारत स्टेशन पुनर्विकास योजना के माध्यम से रेलवे को वैश्विक स्तर का बनाया जा रहा है। पर्यावरण संरक्षण को ध्यान में रखते हुए अधिकांश रेल मार्गों का शत-प्रतिशत विद्युतीकरण किया जा चुका है। समर्पित माल ढुलाई गलियारे व्यापार को तीव्र गति प्रदान कर रहे हैं।`,
      `पर्यावरण संरक्षण और जल संचयन आज के समय की सर्वोच्च आवश्यकता है। प्राकृतिक संसाधनों का विवेकपूर्ण उपयोग ही आने वाली पीढ़ियों के सुरक्षित भविष्य की आधारशिला है। वनों का विस्तार, सौर ऊर्जा का अधिकतम उपयोग और नदियों का पुनरुद्धार जनभागीदारी से ही संभव है। जब प्रत्येक नागरिक अपने दैनिक जीवन में स्वच्छता और संरक्षण का संकल्प लेगा, तभी एक समृद्ध और स्वच्छ भारत का निर्माण होगा।`
    ]
  };

  // State
  let targetText = '';
  let totalTime = 600; // seconds
  let timeLeft = 600;
  let timerInterval = null;
  let isRunning = false;
  let startTime = null;

  // Initialize Passage
  function loadPassage() {
    const lang = langSelect.value;
    const pIdx = parseInt(passageSelect.value, 10);
    const list = PASSAGES[lang] || PASSAGES.en;
    targetText = list[pIdx] || list[0];

    // Render characters
    renderTextDisplay();

    // Reset stats
    totalTime = parseInt(timeSelect.value, 10);
    timeLeft = totalTime;
    updateTimerDisplay();
    netWpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    errorCountDisplay.textContent = '0';
    typingInput.value = '';
    typingInput.disabled = false;
    clearInterval(timerInterval);
    isRunning = false;
    testResultCard.style.display = 'none';
  }

  function renderTextDisplay() {
    typingDisplay.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < targetText.length; i++) {
      const span = document.createElement('span');
      span.textContent = targetText[i];
      span.className = i === 0 ? 'current' : 'pending';
      frag.appendChild(span);
    }
    typingDisplay.appendChild(frag);
  }

  function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timeLeftDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Events
  langSelect.addEventListener('change', loadPassage);
  timeSelect.addEventListener('change', loadPassage);
  passageSelect.addEventListener('change', loadPassage);
  restartBtn.addEventListener('click', loadPassage);
  finishTestBtn.addEventListener('click', endTest);

  // Typing Input Handling
  typingInput.addEventListener('input', () => {
    if (!isRunning) {
      isRunning = true;
      startTime = Date.now();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        updateRealtimeStats();
        if (timeLeft <= 0) {
          endTest();
        }
      }, 1000);
    }

    const typed = typingInput.value;
    const spans = typingDisplay.querySelectorAll('span');
    let errors = 0;
    let correct = 0;

    for (let i = 0; i < spans.length; i++) {
      if (i < typed.length) {
        if (typed[i] === targetText[i]) {
          spans[i].className = 'correct';
          correct++;
        } else {
          spans[i].className = 'incorrect';
          errors++;
        }
      } else if (i === typed.length) {
        spans[i].className = 'current';
      } else {
        spans[i].className = 'pending';
      }
    }

    errorCountDisplay.textContent = errors;
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    accuracyDisplay.textContent = `${accuracy}%`;

    // Auto scroll typing display to follow current character
    const currentSpan = spans[typed.length];
    if (currentSpan) {
      currentSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Auto finish if reached end of text
    if (typed.length >= targetText.length) {
      endTest();
    }
  });

  function updateRealtimeStats() {
    const elapsedMinutes = Math.max((Date.now() - startTime) / 60000, 0.05);
    const typed = typingInput.value;
    const wordsTyped = typed.length / 5;
    const grossWpm = Math.round(wordsTyped / elapsedMinutes);

    // Errors
    let errors = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== targetText[i]) errors++;
    }

    const netWpm = Math.max(0, Math.round((wordsTyped - (errors / 5)) / elapsedMinutes));
    netWpmDisplay.textContent = netWpm;
  }

  function endTest() {
    clearInterval(timerInterval);
    isRunning = false;
    typingInput.disabled = true;

    const typed = typingInput.value;
    const elapsedMinutes = Math.max((totalTime - timeLeft) / 60, 0.1);
    const wordsTyped = typed.length / 5;
    const grossWpm = Math.round(wordsTyped / elapsedMinutes);

    let errors = 0;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === targetText[i]) correct++;
      else errors++;
    }

    const netWpm = Math.max(0, Math.round((wordsTyped - (errors / 5)) / elapsedMinutes));
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;

    // SSC Qualifying standard
    const isHindi = langSelect.value === 'hi';
    const targetWpm = isHindi ? 30 : 35;
    const isPassed = netWpm >= targetWpm && accuracy >= (isHindi ? 90 : 93);

    // Populate Results
    resGrossWpm.textContent = grossWpm;
    resNetWpm.textContent = netWpm;
    resAccuracy.textContent = `${accuracy}%`;
    resTotalChars.textContent = typed.length;

    if (isPassed) {
      sscStatusBadge.textContent = 'QUALIFIED ✓';
      sscStatusBadge.style.cssText = 'background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; font-size: 16px; font-weight: 700; padding: 6px 18px; border-radius: 9999px;';
    } else {
      sscStatusBadge.textContent = `NEED PRACTICE (Target: ${targetWpm} WPM)`;
      sscStatusBadge.style.cssText = 'background: #fee2e2; color: #b91c1c; border: 1.5px solid #fca5a5; font-size: 14px; font-weight: 700; padding: 6px 14px; border-radius: 9999px;';
    }

    testResultCard.style.display = 'block';
    testResultCard.scrollIntoView({ behavior: 'smooth' });
    window.showToast(isPassed ? 'Congratulations! You met the exam qualifying criteria!' : 'Test completed! Review your speed report.', isPassed ? 'success' : 'info');
  }

  // Initial Load
  loadPassage();

})();
