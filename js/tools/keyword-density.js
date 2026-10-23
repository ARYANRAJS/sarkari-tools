/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — Keyword Density & Content Optimizer
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const chkFilterStopwords = document.getElementById('chkFilterStopwords');
  const chkCaseSensitive = document.getElementById('chkCaseSensitive');
  const selMinLength = document.getElementById('selMinLength');

  const statWords = document.getElementById('statWords');
  const statChars = document.getElementById('statChars');
  const statSentences = document.getElementById('statSentences');
  const statReadingTime = document.getElementById('statReadingTime');
  const statFleschScore = document.getElementById('statFleschScore');
  const statFleschLabel = document.getElementById('statFleschLabel');

  const stuffingAlertBox = document.getElementById('stuffingAlertBox');
  const stuffingAlertText = document.getElementById('stuffingAlertText');

  const count1w = document.getElementById('count1w');
  const count2w = document.getElementById('count2w');
  const count3w = document.getElementById('count3w');

  const keywordFilterInput = document.getElementById('keywordFilterInput');
  const keywordTableBody = document.getElementById('keywordTableBody');
  const btnCopyKeywords = document.getElementById('btnCopyKeywords');
  const btnDownloadKeywords = document.getElementById('btnDownloadKeywords');

  // Sample buttons
  const btnSampleSeo = document.getElementById('btnSampleSeo');
  const btnSampleExam = document.getElementById('btnSampleExam');
  const btnSampleAffiliate = document.getElementById('btnSampleAffiliate');
  const btnClearText = document.getElementById('btnClearText');

  let activePhraseLen = 1;
  let cachedResults = { 1: [], 2: [], 3: [] };
  let totalWordCount = 0;

  // Standard Stop Words
  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
    'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
    'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
    'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
    'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
    'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself',
    'will', 'also', 'just', 'get', 'can', 'make', 'may', 'well', 'many', 'much', 'like', 'even'
  ]);

  // Tab switching
  document.querySelectorAll('#phraseTabs .tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#phraseTabs .tool-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activePhraseLen = parseInt(tab.dataset.len, 10);
      renderTable();
    });
  });

  // Event listeners
  textInput.addEventListener('input', debounce(analyzeText, 150));
  chkFilterStopwords.addEventListener('change', analyzeText);
  chkCaseSensitive.addEventListener('change', analyzeText);
  selMinLength.addEventListener('change', analyzeText);
  keywordFilterInput.addEventListener('input', renderTable);

  btnClearText.addEventListener('click', () => {
    textInput.value = '';
    analyzeText();
    textInput.focus();
  });

  btnSampleSeo.addEventListener('click', () => {
    textInput.value = `Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

As an internet marketing strategy, SEO considers how search engines work, the computer-programmed algorithms that dictate search engine behavior, what people search for, the actual search terms or keywords typed into search engines, and which search engines are preferred by their targeted audience. SEO is performed because a website will receive more visitors from a search engine when websites rank higher on the search engine results page (SERP). These visitors can then potentially be converted into customers.

High quality content, technical SEO optimization, fast loading speeds, and relevant backlinks are essential pillars for long-term organic search success in modern search algorithms.`;
    analyzeText();
  });

  btnSampleExam.addEventListener('click', () => {
    textInput.value = `Staff Selection Commission (SSC) has released the official recruitment notification for Combined Graduate Level Examination (SSC CGL 2026). Candidates who have completed their graduation degree from any recognized university in India are eligible to apply online.

The online application process begins today on the official SSC website. Candidates must prepare their passport size photo, scanned signature, and educational certificates before filling out the online application form. The photo must be recently clicked with clear white background and must meet the specified dimensions and file size limits under 50 KB.

The examination will be conducted in two tiers: Tier-1 computer-based examination and Tier-2 examination. Candidates must check the official syllabus, exam pattern, age relaxation criteria, and cutoff marks carefully before submitting the online application form.`;
    analyzeText();
  });

  btnSampleAffiliate.addEventListener('click', () => {
    textInput.value = `Finding the best wireless printer for a busy cyber cafe or printing shop can significantly increase daily productivity. A high quality laser printer with multi-function scanning capabilities ensures crisp black and white document printing at an ultra-low cost per page.

When selecting a printer for business use, consider paper tray capacity, wireless mobile printing connectivity, scan resolution, and availability of affordable replacement toner cartridges. High speed document printing is essential for customer satisfaction during peak government exam admission seasons.`;
    analyzeText();
  });

  function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? Math.max(1, syllables.length) : 1;
  }

  function calculateFlesch(words, sentences, text) {
    if (words.length === 0 || sentences === 0) return { score: 0, label: 'No Text' };
    
    let totalSyllables = 0;
    words.forEach(w => {
      totalSyllables += countSyllables(w);
    });

    const wordsPerSentence = words.length / sentences;
    const syllablesPerWord = totalSyllables / words.length;

    let score = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
    score = Math.max(0, Math.min(100, Math.round(score)));

    let label = 'Standard';
    if (score >= 90) label = 'Very Easy';
    else if (score >= 80) label = 'Easy to Read';
    else if (score >= 70) label = 'Fairly Easy';
    else if (score >= 60) label = 'Plain English (Good)';
    else if (score >= 50) label = 'Fairly Difficult';
    else if (score >= 30) label = 'Difficult / College';
    else label = 'Very Confusing';

    return { score, label };
  }

  function analyzeText() {
    const raw = textInput.value;
    if (!raw.trim()) {
      statWords.textContent = '0';
      statChars.textContent = '0';
      statSentences.textContent = '0';
      statReadingTime.textContent = '0s';
      statFleschScore.textContent = '0';
      statFleschLabel.textContent = 'Readability';
      stuffingAlertBox.style.display = 'none';
      count1w.textContent = '0';
      count2w.textContent = '0';
      count3w.textContent = '0';
      keywordTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--gray-500);">Type or paste text above to calculate keyword density.</td></tr>`;
      cachedResults = { 1: [], 2: [], 3: [] };
      return;
    }

    // Basic stats
    const charCount = raw.length;
    const sentences = (raw.match(/[.!?]+(?:\s+|$)/g) || []).length || 1;
    
    // Clean tokens
    const filterStopwords = chkFilterStopwords.checked;
    const caseSensitive = chkCaseSensitive.checked;
    const minLen = parseInt(selMinLength.value, 10);

    const rawWords = raw.match(/\b[\w'-]+\b/g) || [];
    totalWordCount = rawWords.length;

    // Reading & Speaking times
    const readSecs = Math.round((totalWordCount / 200) * 60);
    const readMins = Math.floor(readSecs / 60);
    const remSecs = readSecs % 60;
    const timeStr = readMins > 0 ? `${readMins}m ${remSecs}s` : `${remSecs}s`;

    // Flesch score
    const flesch = calculateFlesch(rawWords, sentences, raw);

    statWords.textContent = totalWordCount.toLocaleString();
    statChars.textContent = charCount.toLocaleString();
    statSentences.textContent = sentences.toLocaleString();
    statReadingTime.textContent = timeStr;
    statFleschScore.textContent = flesch.score;
    statFleschLabel.textContent = flesch.label;

    // Normalized words array for N-gram extraction
    const normWords = rawWords.map(w => caseSensitive ? w : w.toLowerCase());

    // 1-Word Analysis
    const freq1 = {};
    normWords.forEach(w => {
      const clean = w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      if (clean.length < minLen) return;
      if (filterStopwords && STOP_WORDS.has(clean.toLowerCase())) return;
      freq1[clean] = (freq1[clean] || 0) + 1;
    });

    const arr1 = Object.keys(freq1).map(k => ({
      phrase: k,
      count: freq1[k],
      density: totalWordCount > 0 ? ((freq1[k] / totalWordCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // 2-Word Analysis
    const freq2 = {};
    for (let i = 0; i < normWords.length - 1; i++) {
      const w1 = normWords[i].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      const w2 = normWords[i + 1].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      if (w1.length < 2 || w2.length < 2) continue;
      if (filterStopwords && (STOP_WORDS.has(w1.toLowerCase()) && STOP_WORDS.has(w2.toLowerCase()))) continue;
      const phrase = `${w1} ${w2}`;
      freq2[phrase] = (freq2[phrase] || 0) + 1;
    }

    const arr2 = Object.keys(freq2).filter(k => freq2[k] >= 2).map(k => ({
      phrase: k,
      count: freq2[k],
      density: totalWordCount > 0 ? (((freq2[k] * 2) / totalWordCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // 3-Word Analysis
    const freq3 = {};
    for (let i = 0; i < normWords.length - 2; i++) {
      const w1 = normWords[i].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      const w2 = normWords[i + 1].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      const w3 = normWords[i + 2].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      if (w1.length < 2 || w2.length < 2 || w3.length < 2) continue;
      if (filterStopwords && (STOP_WORDS.has(w1.toLowerCase()) && STOP_WORDS.has(w3.toLowerCase()))) continue;
      const phrase = `${w1} ${w2} ${w3}`;
      freq3[phrase] = (freq3[phrase] || 0) + 1;
    }

    const arr3 = Object.keys(freq3).filter(k => freq3[k] >= 2).map(k => ({
      phrase: k,
      count: freq3[k],
      density: totalWordCount > 0 ? (((freq3[k] * 3) / totalWordCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    cachedResults = { 1: arr1, 2: arr2, 3: arr3 };

    count1w.textContent = arr1.length;
    count2w.textContent = arr2.length;
    count3w.textContent = arr3.length;

    // Check stuffing risk on top 1-word
    const stuffed = arr1.filter(item => item.count >= 4 && item.density > 2.8);
    if (stuffed.length > 0) {
      stuffingAlertBox.style.display = 'block';
      const names = stuffed.map(s => `"${s.phrase}" (${s.density.toFixed(1)}%)`).join(', ');
      stuffingAlertText.textContent = `High repetition detected for: ${names}. Google algorithms recommend keeping individual keyword density under 2.5% to avoid over-optimization penalties.`;
    } else {
      stuffingAlertBox.style.display = 'none';
    }

    renderTable();
  }

  function renderTable() {
    const list = cachedResults[activePhraseLen] || [];
    const filter = (keywordFilterInput.value || '').trim().toLowerCase();

    const filtered = filter 
      ? list.filter(item => item.phrase.toLowerCase().includes(filter))
      : list;

    keywordTableBody.innerHTML = '';

    if (filtered.length === 0) {
      keywordTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--gray-500);">No keywords found matching "${filter}".</td></tr>`;
      return;
    }

    filtered.slice(0, 100).forEach((item, idx) => {
      let statusHtml = '<span class="status-pill pass">Ideal (1 - 2.5%)</span>';
      if (item.density > 2.8 && item.count >= 4) {
        statusHtml = '<span class="status-pill fail">High Risk (&gt; 2.8%)</span>';
      } else if (item.density < 0.5) {
        statusHtml = '<span class="status-pill warn">Low (&lt; 0.5%)</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--gray-400); font-size: 11px;">${idx + 1}</td>
        <td style="font-weight: 600; color: var(--navy);">${escapeHtml(item.phrase)}</td>
        <td style="text-align: center; font-weight: 600; color: var(--gray-800);">${item.count}</td>
        <td style="text-align: center; font-weight: 700; color: ${item.density > 2.8 ? '#dc2626' : 'var(--navy)'};">${item.density.toFixed(2)}%</td>
        <td style="text-align: center;">${statusHtml}</td>
      `;
      keywordTableBody.appendChild(tr);
    });
  }

  // Copy Table
  btnCopyKeywords.addEventListener('click', () => {
    const list = cachedResults[activePhraseLen] || [];
    if (list.length === 0) return;
    
    let txt = `Keyword/Phrase\tFrequency\tDensity%\n`;
    list.forEach(i => {
      txt += `${i.phrase}\t${i.count}\t${i.density.toFixed(2)}%\n`;
    });

    navigator.clipboard.writeText(txt).then(() => {
      const orig = btnCopyKeywords.textContent;
      btnCopyKeywords.textContent = '✓ Copied!';
      setTimeout(() => { btnCopyKeywords.textContent = orig; }, 2000);
    });
  });

  // Download CSV
  btnDownloadKeywords.addEventListener('click', () => {
    const list = cachedResults[activePhraseLen] || [];
    if (list.length === 0) return;

    let csv = `Keyword/Phrase,Frequency,Density_Percent\n`;
    list.forEach(i => {
      csv += `"${i.phrase.replace(/"/g, '""')}",${i.count},${i.density.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-density-${activePhraseLen}word.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function debounce(fn, wait) {
    let t;
    return function(...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Initial populate with SEO sample
  btnSampleSeo.click();

});
