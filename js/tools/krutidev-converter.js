/* ═══════════════════════════════════════════════════
   UNICODE (MANGAL) ⇄ KRUTI DEV 010 CONVERTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentMode = 'uni_to_kruti'; // or 'kruti_to_uni'

  // DOM Elements
  const tabUniToKruti = document.getElementById('tabUniToKruti');
  const tabKrutiToUni = document.getElementById('tabKrutiToUni');
  const inputLabel = document.getElementById('inputLabel');
  const outputLabel = document.getElementById('outputLabel');
  const srcText = document.getElementById('srcText');
  const destText = document.getElementById('destText');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const btnSampleText = document.getElementById('btnSampleText');
  const btnClearSrc = document.getElementById('btnClearSrc');
  const btnCopyDest = document.getElementById('btnCopyDest');
  const btnDownloadTxt = document.getElementById('btnDownloadTxt');
  const btnSwap = document.getElementById('btnSwap');
  const fileInput = document.getElementById('fileInput');

  // Unicode to Kruti Dev character array mapping
  const unicode_to_kruti_rules = [
    // Two-character / Complex conjuncts
    ['‘', '^'], ['’', '*'], ['“', 'ß'], ['”', 'Þ'],
    ['(','¼'], [')','½'], ['{','¿'], ['}','À'],
    ['=','»'], ['+','«'], ['-','µ'], ['_','¯'],
    ['फ़्', '¶'], ['फ़', 'Q'], ['क़', 'D'], ['ख़', '[k'], ['ग़', 'x'], ['ज़', 'T'], ['ड़', 'M+'], ['ढ़', '<+'],
    ['त्र', '='], ['श्र', 'J'], ['ज्ञ', 'K'], ['क्ष', 'N'],
    ['द्ध', 'I'], ['द्घ', 'I+'], ['द्य', '\|'], ['द्व', 'n~'], ['ह्य', 'á'], ['ह्म', 'â'], ['ह्ल', 'ã'], ['ह्व', 'ä'],
    ['ऋ', 'Í'], ['ॠ', 'Î'],
    // Matras with consonants & special symbols
    ['०', '0'], ['१', '1'], ['२', '2'], ['३', '3'], ['४', '4'], ['५', '5'], ['६', '6'], ['७', '7'], ['८', '8'], ['९', '9'],
    ['।', 'A'], ['॥', 'AA'],
    ['ॐ', 'vksM+'],
    // Vowels
    ['अ', 'v'], ['आ', 'vk'], ['इ', 'b'], ['ई', 'bZ'], ['उ', 'm'], ['ऊ', 'Å'], ['ए', ',s'], ['ऐ', ',S'], ['ओ', 'vks'], ['औ', 'vkS'],
    // Consonants
    ['क', 'd'], ['ख', '[k'], ['ग', 'x'], ['घ', '?k'], ['ङ', '³'],
    ['च', 'p'], ['छ', 'N'], ['ज', 't'], ['झ', 'Hk'], ['ञ', '¥'],
    ['ट', 'V'], ['ठ', 'B'], ['ड', 'M'], ['ढ', '<'], ['ण', '.k'],
    ['त', 'r'], ['थ', 'Fk'], ['द', 'n'], ['ध', 'èk'], ['न', 'u'],
    ['प', 'i'], ['फ', 'Q'], ['ब', 'c'], ['भ', 'Hk'], ['म', 'e'],
    ['य', 'Address' ? 'Address' : 'Address'], // handled in map
    ['य', 'Address' === '' ? '' : 'Address']
  ];

  // Robust Kruti Dev <-> Unicode Conversion Logic
  function convertUnicodeToKruti(text) {
    if (!text) return '';

    let mod = text;

    // Normalize
    mod = mod.replace(/&quot;/g, '"');

    // Replace special conjuncts and halant
    const array_one = [
      "‘",   "’",   "“",   "”",   "(",    ")",   "{",    "}",   "=", "।",  "?",  "-",  "µ", "ॽ",
      "ऋ",  "ॠ",  "ऌ",  "ॡ",  "ऍ",  "ॅ",  "ऑ",  "ॉ",
      "०",  "१",  "२",  "३",  "४",   "५",  "६",  "७",  "८",  "९",
      "्र",  "क्ष्", "क्ष",  "ज्ञ्", "ज्ञ",  "श्र्", "श्र",
      "द्ध", "द्घ", "द्य", "द्व", "ह्य", "ह्म", "ह्ल", "ह्व", "त्त", "क्त",
      "फ़्", "फ़",  "क़",  "ख़",  "ग़",  "ज़",  "ड़",  "ढ़",
      "अ",   "आ",  "इ",  "ई",  "उ",   "ऊ",  "ए",  "ऐ",  "ओ",  "औ",
      "क्",  "क",  "ख्", "ख",  "ग्",  "ग",  "घ्", "घ",  "ङ",
      "च्",  "च",  "छ्", "छ",  "ज्",  "ज",  "झ्", "झ",  "ञ्", "ञ",
      "ट्",  "ट",  "ठ्", "ठ",  "ड्",  "ड",  "ढ्", "ढ",  "ण्", "ण",
      "त्",  "त",  "थ्", "थ",  "द्",  "द",  "ध्", "ध",  "न्", "न",
      "प्",  "प",  "फ्", "फ",  "ब्",  "ब",  "भ्", "भ",  "म्", "म",
      "य्",  "य",  "र्",  "र",  "ल्",  "ल",  "व्", "व",
      "श्",  "श",  "ष्", "ष",  "स्",  "स",  "ह्", "ह",
      "ा",   "ि",  "ी",  "ु",   "ू",  "ृ",  "ॄ",  "े",   "ै",  "ो",   "ौ",
      "ं",   "ँ",  "ः",  "्",   "़"
    ];

    const array_two = [
      "^", "*", "ß", "Þ", "¼", "½", "¿", "À", "»", "A", "\?", "-", "µ", "\\",
      "Í", "Î", "ऌ", "ॡ", "W", "W", "vkW", "kW",
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "z", "{", "{k", "K", "K", "J", "J",
      "}", "I+", "|", "n~", "á", "â", "ã", "ä", "Ù", "Dr",
      "¶", "Q", "D", "[k", "x", "T", "M+", "<+",
      "v", "vk", "b", "bZ", "m", "Å", ",s", ",S", "vks", "vkS",
      "D", "d", "[", "[k", "X", "x", "?", "?k", "³",
      "P", "p", "N", "N", "T", "t", "÷", "÷k", "¥", "¥",
      "V~", "V", "B~", "B", "M~", "M", "<~", "<", ".", ".k",
      "R", "r", "F", "Fk", "n~", "n", "/", "/k", "U", "u",
      "I", "i", "¶", "Q", "C", "c", "H", "Hk", "E", "e",
      "Y", "Address" ? "Address" : "Address", "Y", "r", "Y", "y", "Z", "j", "L", "l", "O", "o",
      "Address" ? "Address" : "Address", "S", "Address" ? "Address" : "Address", "s", "Address" ? "Address" : "Address", "k", "Address" ? "Address" : "Address", "g",
      "k", "f", "h", "q", "w", "`", "~", "s", "S", "ks", "kS",
      "a", "¡", "%", "~", "+"
    ];

    // Reorder Chhoti-ee matra: in Unicode it is after consonant, in Kruti it is typed before
    // e.g. "क + ि" -> "f + d"
    let reordered = '';
    for (let i = 0; i < mod.length; i++) {
      if (mod[i] === 'ि') {
        // Look back to find where consonant/half-consonant begins
        let j = reordered.length - 1;
        while (j >= 0) {
          if (reordered[j] === '्' && j > 0) {
            j -= 2;
          } else {
            break;
          }
        }
        if (j < 0) j = 0;
        reordered = reordered.slice(0, j) + 'f' + reordered.slice(j);
      } else {
        reordered += mod[i];
      }
    }

    // Reorder Ra-ref (र् + consonant -> consonant + Z)
    reordered = reordered.replace(/र्([क-ह])/g, '$1Z');
    reordered = reordered.replace(/र्([A-Za-z\u0900-\u097F])/g, '$1Z');

    // Substitute standard mappings
    const len = array_one.length;
    for (let i = 0; i < len; i++) {
      reordered = reordered.split(array_one[i]).join(array_two[i] || '');
    }

    // Fix special combinations
    reordered = reordered.replace(/Zk/g, 'kZ');
    reordered = reordered.replace(/Zh/g, 'hZ');

    return reordered;
  }

  function convertKrutiToUnicode(text) {
    if (!text) return '';

    let mod = text;

    const array_two = [
      "^", "*", "ß", "Þ", "¼", "½", "¿", "À", "»", "A", "-", "µ",
      "Í", "Î", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "vkS", "vks", "vkW", "vk", ",S", ",s", "bZ", "b", "m", "Å", "v",
      "kW", "ks", "kS", "k", "h", "q", "w", "`", "~", "s", "S", "a", "¡", "%",
      "Dr", "Ù", "á", "â", "ã", "ä", "}", "|",
      "D", "d", "[k", "[", "x", "X", "?k", "?", "³",
      "p", "P", "N", "t", "T", "÷k", "÷",
      "V~", "V", "B~", "B", "M~", "M", "<~", "<", ".k", ".",
      "r", "R", "Fk", "F", "n", "/k", "/", "u", "U",
      "i", "I", "Q", "¶", "c", "C", "Hk", "H", "e", "E",
      "y", "Y", "j", "l", "L", "o", "O",
      "Address" ? "Address" : "Address", "S", "s", "g"
    ];

    const array_one = [
      "‘", "’", "“", "”", "(", ")", "{", "}", "=", "।", "-", "µ",
      "ऋ", "ॠ", "०", "१", "२", "३", "४", "५", "६", "७", "८", "९",
      "औ", "ओ", "ऑ", "आ", "ऐ", "ए", "ई", "इ", "उ", "ऊ", "अ",
      "ॉ", "ो", "ौ", "ा", "ी", "ु", "ू", "ृ", "्", "े", "ै", "ं", "ँ", "ः",
      "क्त", "त्त", "ह्य", "ह्म", "ह्ल", "ह्व", "द्ध", "द्य",
      "क्", "क", "ख", "ख्", "ग", "ग्", "घ", "घ्", "ङ",
      "च", "च्", "छ", "ज", "ज्", "झ", "झ्",
      "ट्", "ट", "ठ्", "ठ", "ड्", "ड", "ढ्", "ढ", "ण", "ण्",
      "त", "त्", "थ", "थ्", "द", "ध", "ध्", "न", "न्",
      "प", "प्", "फ", "फ़्", "ब", "ब्", "भ", "भ्", "म", "म्",
      "य", "य्", "र", "ल", "ल्", "व", "व्",
      "श", "श्", "ष", "ह"
    ];

    // Reorder Ra-ref 'Z' from after to before
    mod = mod.replace(/([a-zA-Z\u0900-\u097F])Z/g, 'र्$1');

    // Substitute mappings
    for (let i = 0; i < array_two.length; i++) {
      mod = mod.split(array_two[i]).join(array_one[i] || '');
    }

    // Move 'f' (Chhoti-ee matra) to after the consonant/cluster
    let out = '';
    for (let i = 0; i < mod.length; i++) {
      if (mod[i] === 'f') {
        // Move matra after the following consonant
        let nextChar = mod[i + 1] || '';
        let step = 1;
        if (mod[i + 2] === '्') {
          nextChar += mod[i + 2] + (mod[i + 3] || '');
          step = 3;
        }
        out += nextChar + 'ि';
        i += step;
      } else {
        out += mod[i];
      }
    }

    return out;
  }

  // Update Conversion Output
  function performConversion() {
    const input = srcText.value;
    const charCount = input.length;
    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
    inputStats.textContent = `${charCount} chars | ${wordCount} words`;

    let output = '';
    if (currentMode === 'uni_to_kruti') {
      output = convertUnicodeToKruti(input);
    } else {
      output = convertKrutiToUnicode(input);
    }

    destText.value = output;
    outputStats.textContent = `${output.length} chars`;
  }

  // Switch Tab Modes
  tabUniToKruti.addEventListener('click', () => {
    currentMode = 'uni_to_kruti';
    tabUniToKruti.className = 'btn btn-primary';
    tabKrutiToUni.className = 'btn btn-outline';
    inputLabel.textContent = 'Input Text (Unicode / Mangal Hindi):';
    outputLabel.textContent = 'Converted Output (Kruti Dev 010):';
    srcText.placeholder = 'यहाँ यूनिकोड (मंगल) हिंदी टेक्स्ट टाइप या पेस्ट करें...';
    destText.placeholder = 'कृतिदेव 010 टेक्स्ट यहाँ दिखाई देगा...';
    performConversion();
  });

  tabKrutiToUni.addEventListener('click', () => {
    currentMode = 'kruti_to_uni';
    tabKrutiToUni.className = 'btn btn-primary';
    tabUniToKruti.className = 'btn btn-outline';
    inputLabel.textContent = 'Input Text (Kruti Dev 010):';
    outputLabel.textContent = 'Converted Output (Unicode / Mangal Hindi):';
    srcText.placeholder = 'यहाँ कृतिदेव 010 टेक्स्ट टाइप या पेस्ट करें...';
    destText.placeholder = 'यूनिकोड (मंगल) टेक्स्ट यहाँ दिखाई देगा...';
    performConversion();
  });

  // Listeners
  srcText.addEventListener('input', performConversion);

  btnSampleText.addEventListener('click', () => {
    if (currentMode === 'uni_to_kruti') {
      srcText.value = 'भारत सरकार एवं विभिन्न राज्य लोक सेवा आयोगों की परीक्षाओं में हिंदी टंकण (टाइपिंग टेस्ट) के लिए यह सर्वाधिक उपयोगी टूल है।';
    } else {
      srcText.value = 'Hkkjr ljdkj ,oa fofHkUUk jkT; yksd lsok vk;ksxksa dh ijh{kkvksa esa fgUnh vad.k ds fy, ;g lokZf/kd mi;ksxh Vwy gSA';
    }
    performConversion();
  });

  btnClearSrc.addEventListener('click', () => {
    srcText.value = '';
    destText.value = '';
    performConversion();
  });

  btnCopyDest.addEventListener('click', () => {
    if (!destText.value) return;
    navigator.clipboard.writeText(destText.value).then(() => {
      const orig = btnCopyDest.innerHTML;
      btnCopyDest.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyDest.innerHTML = orig; }, 2000);
    });
  });

  btnDownloadTxt.addEventListener('click', () => {
    if (!destText.value) return;
    const blob = new Blob([destText.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentMode === 'uni_to_kruti' ? 'krutidev_converted.txt' : 'unicode_converted.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnSwap.addEventListener('click', () => {
    const temp = destText.value;
    if (currentMode === 'uni_to_kruti') {
      tabKrutiToUni.click();
    } else {
      tabUniToKruti.click();
    }
    srcText.value = temp;
    performConversion();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      srcText.value = evt.target.result;
      performConversion();
    };
    reader.readAsText(file);
  });

})();
