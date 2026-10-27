/* ═══════════════════════════════════════════════════
   COLOR CONVERTER & PALETTE STUDIO
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const nativeColorPicker = document.getElementById('nativeColorPicker');
  const inputHex = document.getElementById('inputHex');
  const mainColorSwatch = document.getElementById('mainColorSwatch');
  const swatchLabelText = document.getElementById('swatchLabelText');
  const valRgb = document.getElementById('valRgb');
  const valHsl = document.getElementById('valHsl');
  const valCmyk = document.getElementById('valCmyk');

  const boxContrastWhite = document.getElementById('boxContrastWhite');
  const boxContrastBlack = document.getElementById('boxContrastBlack');
  const ratioWhite = document.getElementById('ratioWhite');
  const ratioBlack = document.getElementById('ratioBlack');
  const badgeWhite = document.getElementById('badgeWhite');
  const badgeBlack = document.getElementById('badgeBlack');
  const paletteGrid = document.getElementById('paletteGrid');
  const copyButtons = document.querySelectorAll('.btn-copy-color');

  // Conversions
  function hexToRgb(hex) {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToCmyk(r, g, b) {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    };
  }

  // WCAG Relative Luminance & Contrast Ratio
  function getLuminance(r, g, b) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(lum1, lum2) {
    const brighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  function updateColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const cleanHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    // Update main swatch & inputs
    mainColorSwatch.style.backgroundColor = cleanHex;
    swatchLabelText.textContent = cleanHex;
    nativeColorPicker.value = cleanHex;
    inputHex.value = cleanHex;

    valRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    valHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    valCmyk.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    // Contrast calculations
    const lumBg = getLuminance(rgb.r, rgb.g, rgb.b);
    const lumWhite = getLuminance(255, 255, 255);
    const lumBlack = getLuminance(0, 0, 0);

    const cWhite = getContrastRatio(lumWhite, lumBg).toFixed(2);
    const cBlack = getContrastRatio(lumBg, lumBlack).toFixed(2);

    boxContrastWhite.style.backgroundColor = cleanHex;
    boxContrastBlack.style.backgroundColor = cleanHex;

    ratioWhite.textContent = `${cWhite}:1`;
    ratioBlack.textContent = `${cBlack}:1`;

    badgeWhite.textContent = cWhite >= 7 ? 'Pass AAA' : cWhite >= 4.5 ? 'Pass AA' : 'Fail';
    badgeWhite.style.color = cWhite >= 4.5 ? '#86efac' : '#fca5a5';

    badgeBlack.textContent = cBlack >= 7 ? 'Pass AAA' : cBlack >= 4.5 ? 'Pass AA' : 'Fail';
    badgeBlack.style.color = cBlack >= 4.5 ? '#15803d' : '#b91c1c';

    // Text color on main swatch
    mainColorSwatch.style.color = cWhite >= cBlack ? '#ffffff' : '#000000';

    // Harmonies
    renderHarmonies(hsl);
  }

  function renderHarmonies(hsl) {
    const harmonies = [
      { name: 'Complementary', h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
      { name: 'Analogous +30', h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l },
      { name: 'Analogous -30', h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l },
      { name: 'Triadic 1', h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
      { name: 'Triadic 2', h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l },
      { name: 'Lighter Shade', h: hsl.h, s: hsl.s, l: Math.min(90, hsl.l + 25) },
      { name: 'Darker Shade', h: hsl.h, s: hsl.s, l: Math.max(10, hsl.l - 25) }
    ];

    paletteGrid.innerHTML = '';
    harmonies.forEach((item) => {
      const rgb = hslToRgb(item.h, item.s, item.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      const card = document.createElement('div');
      card.className = 'palette-card';
      card.innerHTML = `
        <div class="palette-card-preview" style="background-color: ${hex};"></div>
        <div class="palette-card-label">${hex}</div>
        <div style="font-size: 10px; color: var(--gray-600); padding-bottom: 6px;">${item.name}</div>
      `;
      card.addEventListener('click', () => {
        updateColor(hex);
      });
      paletteGrid.appendChild(card);
    });
  }

  // Listeners
  nativeColorPicker.addEventListener('input', (e) => {
    updateColor(e.target.value);
  });

  inputHex.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (/^#?[0-9A-Fa-f]{3,6}$/.test(val)) {
      updateColor(val.startsWith('#') ? val : '#' + val);
    }
  });

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input && input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        });
      }
    });
  });

  // Default color
  updateColor('#2563EB');

})();
