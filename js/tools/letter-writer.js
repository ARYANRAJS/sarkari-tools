/* ═══════════════════════════════════════════════════
   Sarkari Result Tools — Application & Letter Writer Engine
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const langBtns = document.querySelectorAll('#langPicker .option-btn');
  const templateSelect = document.getElementById('templateSelect');
  const senderName = document.getElementById('senderName');
  const senderTitle = document.getElementById('senderTitle');
  const senderContact = document.getElementById('senderContact');
  const letterDate = document.getElementById('letterDate');
  const recipientTitle = document.getElementById('recipientTitle');
  const recipientOrg = document.getElementById('recipientOrg');
  const subjectLine = document.getElementById('subjectLine');
  const contextNotes = document.getElementById('contextNotes');
  const formatAiBtn = document.getElementById('formatAiBtn');
  const letterPreviewSheet = document.getElementById('letterPreviewSheet');
  const copyTextBtn = document.getElementById('copyTextBtn');
  const downloadWordBtn = document.getElementById('downloadWordBtn');
  const printLetterBtn = document.getElementById('printLetterBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  let currentLang = 'en'; // 'en' or 'hi'

  // Presets database for English and Hindi
  const PRESETS = {
    leave_sick: {
      en: {
        recTitle: 'The Principal / Manager',
        recOrg: 'Delhi Public School / XYZ Organization, New Delhi',
        subject: 'Application for 3 days sick leave due to viral fever',
        body: 'I respectfully state that I have been suffering from high viral fever since yesterday evening. The consulting doctor has strictly advised complete medical bed rest for 3 days from 23rd October to 25th October 2026.\n\nKindly grant me medical leave for the aforementioned period. I have enclosed the medical prescription for your kind verification.'
      },
      hi: {
        recTitle: 'प्रधानाचार्य महोदय / शाखा प्रबंधक',
        recOrg: 'राजकीय वरिष्ठ माध्यमिक विद्यालय / संस्थान, नई दिल्ली',
        subject: 'अस्वस्थ होने के कारण 3 दिन के अवकाश हेतु प्रार्थना पत्र',
        body: 'सविनय निवेदन यह है कि कल शाम से मेरी तबीयत अचानक खराब हो गई है और मुझे तेज ज्वर (बुखार) है। चिकित्सक ने मुझे स्वास्थ्य लाभ हेतु 3 दिन (दिनांक 23 अक्टूबर से 25 अक्टूबर 2026 तक) पूर्ण विश्राम की सलाह दी है।\n\nअतः आपसे विनम्र प्रार्थना है कि मुझे उक्त तीन दिनों का चिकित्सकीय अवकाश प्रदान करने की कृपा करें। इसके साथ चिकित्सक का परामर्श पत्र संलग्न है।'
      }
    },
    leave_casual: {
      en: {
        recTitle: 'The Head of Department',
        recOrg: 'Administration Wing, Municipal Corporation, New Delhi',
        subject: 'Application for 2 days casual leave for urgent personal work',
        body: 'I beg to submit that I have an unavoidable family commitment and urgent personal work at my native town on 24th and 25th October 2026, due to which I shall not be able to attend office.\n\nI have delegated all pending file clearances to my team. Kindly sanction me 2 days casual leave.'
      },
      hi: {
        recTitle: 'विभागाध्यक्ष महोदय',
        recOrg: 'प्रशासनिक संभाग, नगर निगम, नई दिल्ली',
        subject: 'अति आवश्यक घरेलू कार्य हेतु 2 दिन के आकस्मिक अवकाश बाबत',
        body: 'सविनय निवेदन है कि मुझे अपने गृह निवास पर आवश्यक पारिवारिक कार्य होने के कारण दिनांक 24 व 25 अक्टूबर 2026 को कार्यालय में उपस्थित होने में असमर्थ रहूँगा।\n\nअतः आपसे निवेदन है कि मुझे उक्त दो दिवस का आकस्मिक अवकाश (Casual Leave) स्वीकृत करने की महती कृपा करें।'
      }
    },
    bank_atm: {
      en: {
        recTitle: 'The Branch Manager',
        recOrg: 'State Bank of India, Main Market Branch, New Delhi',
        subject: 'Request for blocking lost ATM Debit card and issuance of new card',
        body: 'I hold a Savings Bank Account (Account No: 30123456789) with your esteemed branch. Regrettably, my ATM Debit Card was misplaced/lost yesterday during transit.\n\nTo safeguard my funds against unauthorized transactions, I request you to immediately block the lost card and issue a fresh replacement ATM card to my registered communication address at the earliest.'
      },
      hi: {
        recTitle: 'शाखा प्रबंधक महोदय',
        recOrg: 'भारतीय स्टेट बैंक, मुख्य शाखा, नई दिल्ली',
        subject: 'खोए हुए एटीएम कार्ड को ब्लॉक करने एवं नया कार्ड जारी करने हेतु आवेदन',
        body: 'सविनय निवेदन है कि मैं आपकी शाखा का एक नियमित खाताधारक हूँ (बचत खाता संख्या: 30123456789)। कल यात्रा के दौरान मेरा एटीएम डेबिट कार्ड कहीं गिरकर खो गया है।\n\nकिसी भी अनधिकृत वित्तीय लेनदेन से बचाव हेतु कृपया मेरे पुराने कार्ड को तत्काल प्रभाव से ब्लॉक कर मेरे पंजीकृत पते पर नया एटीएम कार्ड जारी करने की कृपा करें।'
      }
    },
    police_lost: {
      en: {
        recTitle: 'The Station House Officer (SHO)',
        recOrg: 'Police Station Connaught Place, New Delhi',
        subject: 'Complaint regarding loss of Mobile Phone and original ID documents',
        body: 'I wish to lodge a formal complaint regarding the loss of my smartphone (Make: Samsung Galaxy S23, IMEI: 358901234567890) and original Aadhaar card, which went missing today around 11:30 AM near Metro Gate No. 2.\n\nKindly register this report and issue a stamped acknowledgement (Lost Report / NCR) to enable me to apply for duplicate documents and track the device.'
      },
      hi: {
        recTitle: 'थाना प्रभारी महोदय (SHO)',
        recOrg: 'थाना कनॉट प्लेस, नई दिल्ली पुलिस',
        subject: 'मोबाइल फोन व मूल पहचान पत्र गुम होने के संबंध में सूचना पत्र (NCR)',
        body: 'सविनय निवेदन है कि आज दिनांक 22 अक्टूबर को पूर्वाह्न लगभग 11:30 बजे मेट्रो स्टेशन के समीप मेरा मोबाइल फोन (Samsung Galaxy, IMEI: 358901234567890) तथा पर्स जिसमें मूल आधार कार्ड था, अचानक कहीं गिरकर गुम हो गया है।\n\nकाफी तलाश करने पर भी यह प्राप्त नहीं हुआ। अतः आपसे प्रार्थना है कि इस संबंध में गुमशुदगी की रिपोर्ट दर्ज कर मुझे प्राप्ति रसीद प्रदान करने की कृपा करें ताकि नए दस्तावेज बनवाए जा सकें।'
      }
    },
    tc_college: {
      en: {
        recTitle: 'The Principal',
        recOrg: 'Government Higher Secondary School, New Delhi',
        subject: 'Application for issuance of School Leaving Certificate / Transfer Certificate (TC)',
        body: 'I was a bonafide student of Class 12th (Science Stream) in your reputed institution during the academic session 2025-26. I have cleared all school dues, library books, and laboratory equipment fees.\n\nAs my father has been transferred to another district, I request you to kindly issue my Transfer Certificate (TC) and Character Certificate at the earliest.'
      },
      hi: {
        recTitle: 'प्रधानाचार्य महोदय',
        recOrg: 'राजकीय उच्च माध्यमिक विद्यालय, नई दिल्ली',
        subject: 'स्थानांतरण प्रमाण पत्र (TC) एवं चरित्र प्रमाण पत्र जारी करने हेतु',
        body: 'सविनय निवेदन है कि मैंने आपके विद्यालय से सत्र 2025-26 में कक्षा 12वीं की परीक्षा प्रथम श्रेणी से उत्तीर्ण की है। मेरे विद्यालय के समस्त शुल्क एवं पुस्तकालय की पुस्तकें जमा की जा चुकी हैं।\n\nमेरे पिताजी का स्थानांतरण अन्य जनपद में हो जाने के कारण मुझे अन्यत्र प्रवेश लेना है। अतः मुझे स्थानांतरण प्रमाण पत्र (TC) तथा चरित्र प्रमाण पत्र प्रदान करने की कृपा करें।'
      }
    },
    job_cover: {
      en: {
        recTitle: 'The HR Manager / Recruitment Cell',
        recOrg: 'Bharat Heavy Electricals Limited (BHEL), Corporate Office, New Delhi',
        subject: 'Application for the post of Executive Trainee (Reference: Advt No. 04/2026)',
        body: 'With reference to your employment notification published in the Employment News for the post of Executive Trainee, I wish to offer my candidature for the said vacancy.\n\nI possess a First-Class Bachelor of Engineering degree with proven academic distinction and foundational internship exposure. My technical acumen, discipline, and commitment to public engineering make me a strong candidate. My detailed resume is enclosed herewith.'
      },
      hi: {
        recTitle: 'मुख्य कार्मिक प्रबंधक (भर्ती संभाग)',
        recOrg: 'भारत हेवी इलेक्ट्रिकल्स लिमिटेड (BHEL), नई दिल्ली',
        subject: 'कार्यकारी प्रशिक्षु (Executive Trainee) पद हेतु आवेदन पत्र',
        body: 'रोजगार समाचार में प्रकाशित विज्ञापन संख्या 04/2026 के संदर्भ में, मैं कार्यकारी प्रशिक्षु पद हेतु अपनी उम्मीदवारी प्रस्तुत कर रहा हूँ।\n\nमैंने प्रतिष्ठित संस्थान से प्रथम श्रेणी में तकनीकी स्नातक परीक्षा उत्तीर्ण की है। मेरा अनुशासन और कर्तव्यनिष्ठा इस पद के दायित्वों को भली-भांति निर्वहन करने के सर्वथा अनुकूल है। विस्तृत जीवन वृत्त (Resume) संलग्न है।'
      }
    },
    custom: {
      en: {
        recTitle: 'The Respected Authority / Officer',
        recOrg: 'Office / Department Name, City',
        subject: 'Subject of your application or official letter',
        body: 'State your matter clearly here in formal paragraphs. You can directly edit any word in the preview on the right.'
      },
      hi: {
        recTitle: 'सम्मानित अधिकारी महोदय',
        recOrg: 'संबंधित विभाग / कार्यालय का नाम, शहर',
        subject: 'पत्र का मुख्य विषय यहाँ लिखें',
        body: 'यहाँ अपनी बात स्पष्ट रूप से औपचारिक भाषा में लिखें। आप सीधे दाईं ओर दिए गए पत्र पर क्लिक करके किसी भी शब्द को बदल सकते हैं।'
      }
    }
  };

  // Language Switching
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.dataset.lang;
      applyPreset();
    });
  });

  templateSelect.addEventListener('change', applyPreset);

  function applyPreset() {
    const key = templateSelect.value;
    const data = (PRESETS[key] && PRESETS[key][currentLang]) || PRESETS.custom[currentLang];

    recipientTitle.value = data.recTitle;
    recipientOrg.value = data.recOrg;
    subjectLine.value = data.subject;
    contextNotes.value = data.body;

    if (currentLang === 'hi') {
      senderTitle.value = 'रोल नं. 42 / खाता संख्या: 30123456789';
      senderName.value = 'राहुल शर्मा';
      letterDate.value = '22 अक्टूबर 2026';
    } else {
      senderTitle.value = 'Roll No. 42 / Account No: 30123456789';
      senderName.value = 'Rahul Sharma';
      letterDate.value = '22 October 2026';
    }

    renderLetterSheet();
  }

  // Real-time render
  [senderName, senderTitle, senderContact, letterDate, recipientTitle, recipientOrg, subjectLine, contextNotes].forEach(el => {
    el.addEventListener('input', renderLetterSheet);
  });

  formatAiBtn.addEventListener('click', () => {
    renderLetterSheet();
    window.showToast('Formatted into official letter standard! You can edit directly in preview.', 'success');
  });

  function renderLetterSheet() {
    const isHindi = currentLang === 'hi';
    const toLabel = isHindi ? 'सेवा में,' : 'To,';
    const subLabel = isHindi ? 'विषय:' : 'Subject:';
    const salutation = isHindi ? 'महोदय / महोदया,' : 'Respected Sir / Madam,';
    const closeLabel = isHindi ? 'सधन्यवाद,' : 'Thanking you,';
    const signLabel = isHindi ? 'भवदीय / आपका आज्ञाकारी,' : 'Yours faithfully,';

    const sName = senderName.value || 'Name';
    const sTitle = senderTitle.value || '';
    const sContact = senderContact.value || '';
    const lDate = letterDate.value || '';
    const rTitle = recipientTitle.value || '';
    const rOrg = recipientOrg.value || '';
    const subj = subjectLine.value || '';
    const bodyContent = (contextNotes.value || '').split('\n\n').map(p => `<p style="margin-bottom: 14px; text-indent: 30px; text-align: justify;">${p.replace(/\n/g, '<br>')}</p>`).join('');

    letterPreviewSheet.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <div style="font-weight: 700; color: #1a237e;">${toLabel}</div>
          <div style="font-weight: 600; margin-top: 2px;">${rTitle}</div>
          <div style="color: #4b5563; max-width: 380px;">${rOrg}</div>
        </div>
        <div style="text-align: right; font-size: 13px; color: #4b5563;">
          <div><strong>${isHindi ? 'दिनांक:' : 'Date:'}</strong> ${lDate}</div>
        </div>
      </div>

      <div style="background: #f8fafc; border-left: 3px solid #1a237e; padding: 8px 14px; margin-bottom: 20px; font-weight: 700; color: #1e293b;">
        <span>${subLabel}</span> <u>${subj}</u>
      </div>

      <div style="margin-bottom: 14px; font-weight: 600; color: #1e293b;">
        ${salutation}
      </div>

      <div style="color: #374151; font-size: 14px; line-height: 1.8; margin-bottom: 30px;">
        ${bodyContent}
      </div>

      <div style="margin-bottom: 24px; color: #4b5563;">
        ${closeLabel}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
        <div style="font-size: 12px; color: #6b7280;">
          ${sContact ? `<div>${sContact}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="color: #4b5563; margin-bottom: 10px;">${signLabel}</div>
          <div style="font-weight: 700; font-size: 15px; color: #1a237e;">${sName}</div>
          ${sTitle ? `<div style="font-size: 12px; color: #4b5563;">${sTitle}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Copy Plain Text
  copyTextBtn.addEventListener('click', () => {
    const text = letterPreviewSheet.innerText;
    navigator.clipboard.writeText(text).then(() => {
      window.showToast('Letter text copied to clipboard!', 'success');
    });
  });

  // Download Word (.doc)
  downloadWordBtn.addEventListener('click', () => {
    const content = letterPreviewSheet.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Official Letter</title>
      <style>body{font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;}</style></head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + content + footer;

    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    window.downloadFile(blob, `${(subjectLine.value || 'Official_Letter').slice(0, 25).trim().replace(/\s+/g, '_')}.doc`);
    window.showToast('Downloaded Word (.doc) file!', 'success');
  });

  // Print
  printLetterBtn.addEventListener('click', () => {
    window.print();
  });

  // Download PDF
  downloadPdfBtn.addEventListener('click', async () => {
    if (!window.html2canvas || !window.jspdf) {
      window.showToast('PDF library loading... please wait 2 seconds', 'warning');
      return;
    }

    downloadPdfBtn.disabled = true;
    downloadPdfBtn.innerHTML = '<span class="chakra-spinner sm" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> Generating PDF...';

    try {
      const canvas = await window.html2canvas(letterPreviewSheet, {
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
      pdf.save('official_application_letter.pdf');
      window.showToast('Application PDF downloaded successfully! 📄', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Error generating PDF', 'error');
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = '📥 Download PDF';
    }
  });

  // Initial Load
  applyPreset();

})();
