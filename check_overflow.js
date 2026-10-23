const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 });

  const files = fs.readdirSync('tools').filter(f => f.endsWith('.html'));
  files.unshift('../index.html');

  console.log(`Testing ${files.length} pages at 375px viewport...`);

  const results = [];

  for (const file of files) {
    const url = file.startsWith('..') ? 'http://localhost/' : `http://localhost/tools/${file}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
      // wait a tiny bit for render
      await page.waitForTimeout(200);

      const data = await page.evaluate(() => {
        const docWidth = document.documentElement.offsetWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasOverflow = scrollWidth > windowWidth + 1;

        let culprit = null;
        if (hasOverflow) {
          const culprits = [];
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > windowWidth + 1 || el.offsetWidth > windowWidth + 1) {
              if (el.scrollWidth > el.clientWidth && (el.className?.includes('nav') || el.className?.includes('tab'))) return;
              culprits.push(`${el.tagName}.${el.className || ''}#${el.id || ''} (w: ${el.offsetWidth}, right: ${Math.round(r.right)})`);
            }
          });
          culprit = culprits.slice(0, 5).join(' | ');
        }

        return { docWidth, scrollWidth, windowWidth, hasOverflow, culprit };
      });

      results.push({ file, ...data });
      if (data.hasOverflow) {
        console.log(`❌ OVERFLOW on ${file}: scrollWidth=${data.scrollWidth} > ${data.windowWidth}`);
        console.log(`   Culprits: ${data.culprit}`);
      } else {
        console.log(`✅ OK: ${file}`);
      }
    } catch (err) {
      console.log(`⚠️ Error loading ${file}: ${err.message}`);
    }
  }

  await browser.close();
}

testAll();
