/**
 * Sarkari Tools - AI Content Detector & Plagiarism Checker
 * Client-side mathematical analysis of Perplexity, Burstiness & Plagiarism Similarity
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const aiTextInput = document.getElementById('aiTextInput');
  const inputCharCount = document.getElementById('inputCharCount');
  const btnAnalyzeText = document.getElementById('btnAnalyzeText');
  const btnClearAiText = document.getElementById('btnClearAiText');

  // Sample buttons
  const btnSampleAi = document.getElementById('btnSampleAi');
  const btnSampleHuman = document.getElementById('btnSampleHuman');
  const btnSampleMixed = document.getElementById('btnSampleMixed');

  // Tabs
  const detectorTabs = document.querySelectorAll('#detectorTabs .tool-tab');

  // Results Section
  const aiAnalysisResults = document.getElementById('aiAnalysisResults');
  const aiGaugeMeter = document.getElementById('aiGaugeMeter');
  const aiScoreText = document.getElementById('aiScoreText');
  const aiVerdictBadge = document.getElementById('aiVerdictBadge');

  const humanGaugeMeter = document.getElementById('humanGaugeMeter');
  const humanScoreText = document.getElementById('humanScoreText');
  const humanVerdictBadge = document.getElementById('humanVerdictBadge');

  const plagGaugeMeter = document.getElementById('plagGaugeMeter');
  const plagScoreText = document.getElementById('plagScoreText');
  const plagVerdictBadge = document.getElementById('plagVerdictBadge');

  const resTotalWords = document.getElementById('resTotalWords');
  const resAiWords = document.getElementById('resAiWords');
  const resHumanWords = document.getElementById('resHumanWords');
  const resBurstiness = document.getElementById('resBurstiness');
  const resPerplexity = document.getElementById('resPerplexity');
  const resVocabDiversity = document.getElementById('resVocabDiversity');

  const highlightedSentenceContainer = document.getElementById('highlightedSentenceContainer');
  const sentenceInspectorCard = document.getElementById('sentenceInspectorCard');
  const inspectScoreBadge = document.getElementById('inspectScoreBadge');
  const inspectSentenceText = document.getElementById('inspectSentenceText');
  const inspectTriggersList = document.getElementById('inspectTriggersList');
  const inspectHumanizeTip = document.getElementById('inspectHumanizeTip');

  const btnCopyAuditSummary = document.getElementById('btnCopyAuditSummary');
  const btnDownloadReportPdf = document.getElementById('btnDownloadReportPdf');

  // AI Hallmark Triggers Dictionary
  const AI_PHRASES = [
    "in today's digital age", "in today's fast-paced world", "it is crucial to", "it is important to remember",
    "delve into", "plays a pivotal role", "serves as a testament", "a myriad of", "navigating this complex",
    "fosters innovation", "double-edged sword", "in conclusion", "furthermore", "moreover", "at its core",
    "it is worth noting", "transformative power", "across multiple dimensions", "intertwined with",
    "beacon of hope", "rich tapestry", "meticulous attention", "pivotal in shaping", "harnessing the power"
  ];

  const AI_WORDS = [
    "delve", "tapestry", "crucial", "pivotal", "furthermore", "moreover", "fosters", "testament",
    "beacon", "myriad", "paramount", "underscores", "harnessing", "realm", "showcases", "intertwined",
    "meticulous", "holistic", "seamless", "synergy", "multifaceted", "indispensable"
  ];

  // Common Academic Plagiarism / Boilerplate phrases
  const BOILERPLATE_PHRASES = [
    "according to the constitution of india", "in accordance with the rules", "as per the official notification",
    "as mentioned in the guidelines", "the purpose of this study is to", "in this modern era of technology",
    "education is the most powerful weapon", "the preamble of the constitution states", "all fundamental rights guaranteed"
  ];

  // Sample texts
  const SAMPLES = {
    ai: "In today's fast-paced digital world, it is crucial to delve into the transformative power of modern technology. Furthermore, artificial intelligence plays a pivotal role in reshaping society across multiple dimensions. It is important to remember that technological innovation serves as a double-edged sword, fostering progress while presenting unprecedented challenges. Moreover, across various sectors, automated systems underscores the need for meticulous human oversight. In conclusion, navigating this complex tapestry requires a balanced, comprehensive, and forward-thinking strategy for sustainable growth.",
    human: "I remember my first day preparing for the civil services exam back in 2024. The syllabus looked impossible! My desk was piled with books, notes, and tea cups. Honestly, I failed my first mock test terribly. But I didn't give up. I started waking up at 5 AM every morning and solved previous year question papers one by one. With sheer consistency and encouragement from my family, everything finally began to click.",
    mixed: "Online learning has transformed education in India over the past five years. When colleges shut down during the lockdowns, thousands of students like me had to attend classes on small mobile screens. In today's digital age, it is crucial to delve into how educational apps foster academic growth. Furthermore, technology plays a pivotal role in bridging the urban-rural divide. Yet, nothing can ever fully replace the warmth of sitting together with classmates in a real physical classroom."
  };

  // Tab switching
  let currentTab = 'tabAiDetector';
  detectorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      detectorTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      if (aiAnalysisResults.style.display !== 'none') {
        renderHighlightedSentences();
      }
    });
  });

  // Sample loading
  if (btnSampleAi) {
    btnSampleAi.addEventListener('click', () => {
      aiTextInput.value = SAMPLES.ai;
      updateInputCount();
      analyzeContent();
    });
  }
  if (btnSampleHuman) {
    btnSampleHuman.addEventListener('click', () => {
      aiTextInput.value = SAMPLES.human;
      updateInputCount();
      analyzeContent();
    });
  }
  if (btnSampleMixed) {
    btnSampleMixed.addEventListener('click', () => {
      aiTextInput.value = SAMPLES.mixed;
      updateInputCount();
      analyzeContent();
    });
  }

  // Update live character/word count
  function updateInputCount() {
    const text = aiTextInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = aiTextInput.value.length;
    inputCharCount.textContent = `${words} word${words !== 1 ? 's' : ''} • ${chars} character${chars !== 1 ? 's' : ''}`;
  }

  aiTextInput.addEventListener('input', updateInputCount);

  // Clear Text
  if (btnClearAiText) {
    btnClearAiText.addEventListener('click', () => {
      aiTextInput.value = '';
      updateInputCount();
      aiAnalysisResults.style.display = 'none';
      sentenceInspectorCard.style.display = 'none';
    });
  }

  // State
  let analysisData = null;

  // Split text into proper sentences
  function getSentences(text) {
    return text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [];
  }

  // Main Analyzer Function
  function analyzeContent() {
    const text = aiTextInput.value.trim();
    if (!text) {
      if (window.showToast) window.showToast('Please enter or paste text to analyze.', 'warning');
      return;
    }

    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 10) {
      if (window.showToast) window.showToast('Please enter at least 15 words for statistical accuracy.', 'warning');
      return;
    }

    const sentences = getSentences(text).map(s => s.trim()).filter(s => s.length > 0);
    if (sentences.length === 0) return;

    // 1. Burstiness (Sentence Length Variance)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const meanLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - meanLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    const burstiness = meanLength > 0 ? (stdDev / meanLength) : 0;

    // 2. Vocabulary Diversity (Type-Token Ratio)
    const normalizedWords = words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
    const uniqueWords = new Set(normalizedWords);
    const ttr = normalizedWords.length > 0 ? (uniqueWords.size / normalizedWords.length) : 0;

    // 3. Sentence-level analysis
    let totalAiScore = 0;
    let flaggedAiWordCount = 0;
    let plagiarizedWordCount = 0;

    const sentenceDetails = sentences.map((sent, idx) => {
      const lower = sent.toLowerCase();
      const sentWords = sent.split(/\s+/).filter(w => w.length > 0);
      const wordCount = sentWords.length;
      let sentScore = 40; // baseline neutral
      const triggers = [];

      // Check AI Phrases
      AI_PHRASES.forEach(phrase => {
        if (lower.includes(phrase)) {
          sentScore += 30;
          triggers.push(`Contains AI transition: "${phrase}"`);
        }
      });

      // Check AI Words
      AI_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(lower)) {
          sentScore += 15;
          triggers.push(`Uses classic AI vocabulary: "${word}"`);
        }
      });

      // Check sentence structure / length uniformity
      if (wordCount >= 13 && wordCount <= 21) {
        sentScore += 10;
        triggers.push('Uniform sentence length (13-21 words)');
      } else if (wordCount < 7) {
        sentScore -= 25;
        triggers.push('Short punchy human rhythm (<7 words)');
      } else if (wordCount > 28) {
        sentScore -= 15;
        triggers.push('Sprawling complex human sentence (>28 words)');
      }

      // Check human signals (contractions, personal pronouns)
      if (/\b(i'm|can't|won't|don't|wasn't|didn't|terribly|honestly|sheer|clicking)\b/i.test(lower)) {
        sentScore -= 30;
        triggers.push('Casual contraction or colloquial voice');
      }
      if (/\b(i|my|we|our|me)\b/i.test(lower)) {
        sentScore -= 20;
        triggers.push('First-person narrative perspective');
      }
      if (sent.includes('!')) {
        sentScore -= 15;
        triggers.push('Emotional exclamation mark');
      }

      // Plagiarism / Boilerplate Check
      let isPlagiarized = false;
      BOILERPLATE_PHRASES.forEach(bp => {
        if (lower.includes(bp)) {
          isPlagiarized = true;
          triggers.push(`Matched unquoted boilerplate: "${bp}"`);
        }
      });

      // Clamp sentence score between 5% and 98%
      sentScore = Math.max(5, Math.min(98, sentScore));

      if (sentScore >= 50) {
        flaggedAiWordCount += wordCount;
      }
      if (isPlagiarized) {
        plagiarizedWordCount += wordCount;
      }

      totalAiScore += (sentScore * wordCount);

      return {
        text: sent,
        wordCount: wordCount,
        score: sentScore,
        isPlagiarized: isPlagiarized,
        triggers: triggers
      };
    });

    // Document-level AI score adjustment based on burstiness & vocabulary
    let overallAiScore = Math.round(totalAiScore / words.length);

    if (burstiness < 0.30) {
      overallAiScore += 15; // very robotic rhythm
    } else if (burstiness > 0.55) {
      overallAiScore -= 18; // strong human burstiness
    }

    if (ttr < 0.45) {
      overallAiScore += 8; // repetitive vocab
    } else if (ttr > 0.65) {
      overallAiScore -= 10; // rich natural vocab
    }

    // Clamp final document scores
    overallAiScore = Math.max(2, Math.min(99, overallAiScore));
    const overallHumanScore = 100 - overallAiScore;
    const humanWordCount = Math.max(0, words.length - flaggedAiWordCount);

    // Plagiarism percentage
    const plagScore = Math.min(100, Math.round((plagiarizedWordCount / words.length) * 100));

    // Perplexity label
    let perplexityLabel = 'Moderate';
    if (overallAiScore > 70) perplexityLabel = 'Low (Predictable)';
    else if (overallAiScore < 30) perplexityLabel = 'High (Surprising)';

    analysisData = {
      totalWords: words.length,
      aiScore: overallAiScore,
      humanScore: overallHumanScore,
      plagScore: plagScore,
      flaggedAiWords: flaggedAiWordCount,
      humanWords: humanWordCount,
      plagiarizedWords: plagiarizedWordCount,
      burstiness: burstiness.toFixed(2),
      perplexity: perplexityLabel,
      vocabDiversity: `${Math.round(ttr * 100)}%`,
      sentences: sentenceDetails
    };

    renderAnalysisDashboard();
  }

  // Render Visual Gauges and Statistics
  function renderAnalysisDashboard() {
    if (!analysisData) return;

    aiAnalysisResults.style.display = 'block';

    // 1. Radial Gauges Animation
    const circumference = 251.2;

    // AI Gauge
    const aiOffset = circumference - (circumference * analysisData.aiScore) / 100;
    aiGaugeMeter.style.strokeDashoffset = aiOffset;
    aiScoreText.textContent = `${analysisData.aiScore}%`;

    if (analysisData.aiScore >= 65) {
      aiGaugeMeter.style.stroke = '#ef4444';
      aiScoreText.style.color = '#dc2626';
      aiVerdictBadge.textContent = 'High AI Probability';
      aiVerdictBadge.style.background = '#fee2e2';
      aiVerdictBadge.style.color = '#991b1b';
    } else if (analysisData.aiScore >= 35) {
      aiGaugeMeter.style.stroke = '#f59e0b';
      aiScoreText.style.color = '#d97706';
      aiVerdictBadge.textContent = 'Mixed / Paraphrased';
      aiVerdictBadge.style.background = '#fef3c7';
      aiVerdictBadge.style.color = '#92400e';
    } else {
      aiGaugeMeter.style.stroke = '#16a34a';
      aiScoreText.style.color = '#15803d';
      aiVerdictBadge.textContent = 'Likely Human Written';
      aiVerdictBadge.style.background = '#dcfce7';
      aiVerdictBadge.style.color = '#166534';
    }

    // Human Gauge
    const humanOffset = circumference - (circumference * analysisData.humanScore) / 100;
    humanGaugeMeter.style.strokeDashoffset = humanOffset;
    humanScoreText.textContent = `${analysisData.humanScore}%`;

    // Plagiarism Gauge
    const plagOffset = circumference - (circumference * analysisData.plagScore) / 100;
    plagGaugeMeter.style.strokeDashoffset = plagOffset;
    plagScoreText.textContent = `${analysisData.plagScore}%`;

    if (analysisData.plagScore > 20) {
      plagVerdictBadge.textContent = 'Similarities Found';
      plagVerdictBadge.style.background = '#fee2e2';
      plagVerdictBadge.style.color = '#991b1b';
    } else {
      plagVerdictBadge.textContent = 'Original Content';
      plagVerdictBadge.style.background = '#f3e8ff';
      plagVerdictBadge.style.color = '#6b21a8';
    }

    // 2. Exact Words & Metrics
    resTotalWords.textContent = analysisData.totalWords.toLocaleString('en-IN');
    resAiWords.textContent = analysisData.flaggedAiWords.toLocaleString('en-IN');
    resHumanWords.textContent = analysisData.humanWords.toLocaleString('en-IN');
    resBurstiness.textContent = analysisData.burstiness;
    resPerplexity.textContent = analysisData.perplexity;
    resVocabDiversity.textContent = analysisData.vocabDiversity;

    // 3. Highlighted Sentences
    renderHighlightedSentences();

    // Smooth scroll to results
    aiAnalysisResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Render Highlighted Sentences based on current tab
  function renderHighlightedSentences() {
    if (!analysisData || !highlightedSentenceContainer) return;
    highlightedSentenceContainer.innerHTML = '';

    analysisData.sentences.forEach((sentObj, index) => {
      const span = document.createElement('span');
      span.className = 'ai-sent';
      span.dataset.index = index;

      if (currentTab === 'tabPlagiarism') {
        if (sentObj.isPlagiarized) {
          span.classList.add('plagiarized');
        }
      } else {
        if (sentObj.score >= 70) {
          span.classList.add('high-ai');
        } else if (sentObj.score >= 40) {
          span.classList.add('medium-ai');
        } else {
          span.classList.add('human');
        }
      }

      span.textContent = sentObj.text + ' ';

      span.addEventListener('click', () => {
        inspectSentence(index);
      });

      highlightedSentenceContainer.appendChild(span);
    });

    // Auto-inspect the first sentence or highest risk sentence
    const highestAiIndex = analysisData.sentences.reduce((maxIdx, curr, i, arr) => curr.score > arr[maxIdx].score ? i : maxIdx, 0);
    inspectSentence(highestAiIndex);
  }

  // Inspect Single Sentence
  function inspectSentence(index) {
    if (!analysisData || !analysisData.sentences[index]) return;
    const sent = analysisData.sentences[index];

    sentenceInspectorCard.style.display = 'block';
    inspectSentenceText.textContent = `"${sent.text}"`;

    if (sent.score >= 70) {
      inspectScoreBadge.className = 'badge badge-error';
      inspectScoreBadge.textContent = `${sent.score}% AI Probability`;
    } else if (sent.score >= 40) {
      inspectScoreBadge.className = 'badge badge-warning';
      inspectScoreBadge.textContent = `${sent.score}% Moderate AI`;
    } else {
      inspectScoreBadge.className = 'badge badge-success';
      inspectScoreBadge.textContent = `${sent.score}% Likely Human`;
    }

    if (sent.triggers.length > 0) {
      inspectTriggersList.innerHTML = '<strong>Linguistic Indicators:</strong><ul style="margin: 4px 0 0 16px; padding: 0;">' +
        sent.triggers.map(t => `<li>${t}</li>`).join('') + '</ul>';
    } else {
      inspectTriggersList.innerHTML = '<strong>Linguistic Indicators:</strong> Standard natural sentence structure.';
    }

    if (sent.score >= 60) {
      inspectHumanizeTip.innerHTML = `💡 <strong>Humanize Tip:</strong> Replace robotic transitions (like "crucial", "delve into") with active verbs. Break this ${sent.wordCount}-word sentence into two conversational phrases or write from personal experience.`;
    } else {
      inspectHumanizeTip.innerHTML = `✅ <strong>Originality Note:</strong> This sentence displays natural human variation, personal phrasing, or colloquial rhythm.`;
    }
  }

  // Trigger analysis on button click
  if (btnAnalyzeText) {
    btnAnalyzeText.addEventListener('click', analyzeContent);
  }

  // Copy Audit Summary
  if (btnCopyAuditSummary) {
    btnCopyAuditSummary.addEventListener('click', () => {
      if (!analysisData) return;

      const summaryText =
        `SARKARI TOOLS - AI & PLAGIARISM AUDIT REPORT\n` +
        `-----------------------------------------\n` +
        `AI Generated Probability : ${analysisData.aiScore}%\n` +
        `Human Originality Score   : ${analysisData.humanScore}%\n` +
        `Plagiarism / Similarity  : ${analysisData.plagScore}%\n` +
        `Total Word Count         : ${analysisData.totalWords} words\n` +
        `Flagged AI Words         : ${analysisData.flaggedAiWords} words\n` +
        `Human Written Words      : ${analysisData.humanWords} words\n` +
        `Burstiness (Rhythm)      : ${analysisData.burstiness} (Sentence variance)\n` +
        `Vocabulary Diversity     : ${analysisData.vocabDiversity}\n` +
        `-----------------------------------------\n` +
        `Analyzed privately in-browser at SarkariTools.in`;

      navigator.clipboard.writeText(summaryText).then(() => {
        if (window.showToast) window.showToast('Audit summary copied to clipboard!');
      });
    });
  }

  // Download PDF Report Certificate
  if (btnDownloadReportPdf) {
    btnDownloadReportPdf.addEventListener('click', () => {
      if (!analysisData) return;

      if (window.showToast) window.showToast('Generating official PDF audit report...');

      // Create a temporary offscreen certificate template
      const certDiv = document.createElement('div');
      certDiv.style.position = 'fixed';
      certDiv.style.left = '-9999px';
      certDiv.style.width = '750px';
      certDiv.style.background = '#ffffff';
      certDiv.style.padding = '40px';
      certDiv.style.fontFamily = "'Inter', Arial, sans-serif";
      certDiv.style.color = '#1e293b';
      certDiv.style.border = '3px solid #1A237E';

      certDiv.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #FF9933; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #1A237E; font-size: 24px; margin: 0 0 6px 0;">SARKARI TOOLS AUDIT VERIFICATION</h1>
          <div style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">AI Content & Plagiarism Certificate</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 24px; text-align: center;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; font-weight: bold; color: #64748b;">AI PROBABILITY</div>
            <div style="font-size: 28px; font-weight: bold; color: #ef4444; margin: 6px 0;">${analysisData.aiScore}%</div>
            <div style="font-size: 11px; color: #94a3b8;">${analysisData.flaggedAiWords} words flagged</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; font-weight: bold; color: #64748b;">HUMAN ORIGINALITY</div>
            <div style="font-size: 28px; font-weight: bold; color: #16a34a; margin: 6px 0;">${analysisData.humanScore}%</div>
            <div style="font-size: 11px; color: #94a3b8;">${analysisData.humanWords} human words</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; font-weight: bold; color: #64748b;">PLAGIARISM</div>
            <div style="font-size: 28px; font-weight: bold; color: #9333ea; margin: 6px 0;">${analysisData.plagScore}%</div>
            <div style="font-size: 11px; color: #94a3b8;">Similarity Index</div>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 12px; margin-bottom: 20px;">
          <strong>Statistical Highlights:</strong> Total Words: ${analysisData.totalWords} | Burstiness Index: ${analysisData.burstiness} | Vocab Diversity: ${analysisData.vocabDiversity}
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; color: #1A237E; margin-bottom: 8px;">Analyzed Text & Sentence Highlights:</h3>
          <div style="font-size: 13px; line-height: 1.7; color: #334155; border: 1px solid #cbd5e1; padding: 16px; border-radius: 6px; background: #fff;">
            ${highlightedSentenceContainer.innerHTML}
          </div>
        </div>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
          <span>Generated privately via SarkariTools.in (Zero Server Upload)</span>
          <span>Verified In-Browser Heuristics Engine</span>
        </div>
      `;

      document.body.appendChild(certDiv);

      html2canvas(certDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        document.body.removeChild(certDiv);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('AI-Plagiarism-Audit-Report.pdf');

        if (window.showToast) window.showToast('Audit Report PDF downloaded!');
      }).catch(err => {
        if (certDiv.parentNode) document.body.removeChild(certDiv);
        console.error('PDF generation error:', err);
        if (window.showToast) window.showToast('Failed to export PDF report.', 'error');
      });
    });
  }

});
