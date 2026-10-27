/* ═══════════════════════════════════════════════════
   PRIVACY POLICY & TERMS GENERATOR
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentDoc = 'privacy'; // or 'terms'
  let currentFormat = 'html'; // or 'md'

  const tabPrivacy = document.getElementById('tabPrivacy');
  const tabTerms = document.getElementById('tabTerms');
  const docHeading = document.getElementById('docHeading');
  const btnViewHtml = document.getElementById('btnViewHtml');
  const btnViewMd = document.getElementById('btnViewMd');

  const siteName = document.getElementById('siteName');
  const siteUrl = document.getElementById('siteUrl');
  const siteEmail = document.getElementById('siteEmail');
  const checkAdSense = document.getElementById('checkAdSense');
  const checkAnalytics = document.getElementById('checkAnalytics');
  const checkAccounts = document.getElementById('checkAccounts');

  const policyOutput = document.getElementById('policyOutput');
  const btnGenerate = document.getElementById('btnGenerate');
  const btnCopyPolicy = document.getElementById('btnCopyPolicy');
  const btnDownloadPolicy = document.getElementById('btnDownloadPolicy');

  function generateDocument() {
    const name = siteName.value.trim() || 'My Website';
    const url = siteUrl.value.trim() || 'https://example.com';
    const email = siteEmail.value.trim() || 'support@example.com';
    const hasAdSense = checkAdSense.checked;
    const hasAnalytics = checkAnalytics.checked;
    const hasAccounts = checkAccounts.checked;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (currentDoc === 'privacy') {
      if (currentFormat === 'html') {
        policyOutput.value = generatePrivacyHTML(name, url, email, hasAdSense, hasAnalytics, hasAccounts, dateStr);
      } else {
        policyOutput.value = generatePrivacyMD(name, url, email, hasAdSense, hasAnalytics, hasAccounts, dateStr);
      }
    } else {
      if (currentFormat === 'html') {
        policyOutput.value = generateTermsHTML(name, url, email, dateStr);
      } else {
        policyOutput.value = generateTermsMD(name, url, email, dateStr);
      }
    }
  }

  function generatePrivacyHTML(name, url, email, adsense, analytics, accounts, date) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Privacy Policy - ${name}</title>
</head>
<body>
  <h1>Privacy Policy for ${name}</h1>
  <p>Last updated: ${date}</p>

  <p>At <strong>${name}</strong>, accessible from <a href="${url}">${url}</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by ${name} and how we use it.</p>

  <h2>1. Consent</h2>
  <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

  <h2>2. Information We Collect</h2>
  <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
  ${accounts ? `<p>If you register for an Account on ${name}, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>` : `<p>We do not require users to register or create accounts to use our free online web utilities.</p>`}

  <h2>3. Log Files</h2>
  <p>${name} follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>

  ${adsense ? `<h2>4. Google DoubleClick DART Cookie & Advertising</h2>
  <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a></p>` : ''}

  ${analytics ? `<h2>5. Google Analytics & Web Metrics</h2>
  <p>We may use Google Analytics and Google Tag Manager to monitor and analyze the use of our service. Google Analytics tracks and reports website traffic to help us optimize user experience.</p>` : ''}

  <h2>6. GDPR Data Protection Rights</h2>
  <p>We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following: the right to access, the right to rectification, the right to erasure, the right to restrict processing, the right to object to processing, and the right to data portability.</p>

  <h2>7. Contact Us</h2>
  <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at: <a href="mailto:${email}">${email}</a>.</p>
</body>
</html>`;
  }

  function generatePrivacyMD(name, url, email, adsense, analytics, accounts, date) {
    return `# Privacy Policy for ${name}
*Last updated: ${date}*

At **${name}**, accessible from [${url}](${url}), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by ${name} and how we use it.

## 1. Consent
By using our website, you hereby consent to our Privacy Policy and agree to its terms.

## 2. Information We Collect
The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
${accounts ? `If you register for an Account on ${name}, we may ask for your contact information, including name, email address, and contact details.` : `We do not require user account registration for accessing our public online web tools.`}

## 3. Log Files
${name} follows standard log file procedures. The information collected includes IP addresses, browser type, Internet Service Provider (ISP), date/time stamps, and referring pages. None of this data is linked to personally identifiable information.

${adsense ? `## 4. Google DoubleClick DART Cookie
Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to visitors based upon their visits across the internet. Visitors may opt out of DART cookies by visiting: [https://policies.google.com/technologies/ads](https://policies.google.com/technologies/ads)` : ''}

${analytics ? `## 5. Analytics & Tag Metrics
We use Google Analytics and Tag Manager to understand site traffic trends and refine user tool experience.` : ''}

## 6. GDPR & CCPA Compliance
Users possess full rights regarding data erasure, restriction, access, and objection under international data privacy frameworks.

## 7. Contact Us
For any inquiries or privacy requests, contact us at: **${email}**`;
  }

  function generateTermsHTML(name, url, email, date) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Terms and Conditions - ${name}</title>
</head>
<body>
  <h1>Terms and Conditions for ${name}</h1>
  <p>Last updated: ${date}</p>

  <h2>1. Agreement to Terms</h2>
  <p>These Terms and Conditions constitute a legally binding agreement made between you and <strong>${name}</strong> ("Company", "we", "us", or "our"), concerning your access to and use of the <a href="${url}">${url}</a> website.</p>

  <h2>2. Intellectual Property Rights</h2>
  <p>Unless otherwise indicated, the Site and its original content, features, and functionality are owned by ${name} and are protected by copyright, trademark, and other intellectual property laws.</p>

  <h2>3. User Representations</h2>
  <p>By using the Site, you represent and warrant that you will not access the Site through automated or non-human means, or use the Site for any illegal or unauthorized purpose.</p>

  <h2>4. Disclaimer of Warranties</h2>
  <p>The site and utilities are provided on an AS-IS and AS-AVAILABLE basis. You agree that your use of the site and our free services will be at your sole risk.</p>

  <h2>5. Limitation of Liability</h2>
  <p>In no event will ${name}, or its directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, or punitive damages arising from your use of the site.</p>

  <h2>6. Contact Us</h2>
  <p>To resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:${email}">${email}</a>.</p>
</body>
</html>`;
  }

  function generateTermsMD(name, url, email, date) {
    return `# Terms and Conditions for ${name}
*Last updated: ${date}*

## 1. Agreement to Terms
These Terms and Conditions constitute a legally binding agreement made between you and **${name}** concerning your access to and use of [${url}](${url}).

## 2. Intellectual Property Rights
Unless otherwise indicated, the Site, codebase, web utilities, and trademarks are proprietary property owned by ${name}.

## 3. Acceptable Use
You agree not to use the website for any unlawful, harassing, or prohibited purposes, or to interfere with the proper working of the web services.

## 4. Disclaimer of Warranties
The site and all utilities are provided on an **AS-IS** basis. We make no warranties of any kind regarding accuracy, uninterrupted availability, or fitness for a particular purpose.

## 5. Limitation of Liability
In no event shall ${name} or its affiliates be liable for any indirect, special, or consequential damages resulting from your use of the web tools.

## 6. Contact Information
For any legal questions regarding these Terms, contact us at: **${email}**`;
  }

  // Event Listeners
  tabPrivacy.addEventListener('click', () => {
    currentDoc = 'privacy';
    tabPrivacy.className = 'btn btn-primary';
    tabTerms.className = 'btn btn-outline';
    docHeading.textContent = 'Privacy Policy Preview:';
    generateDocument();
  });

  tabTerms.addEventListener('click', () => {
    currentDoc = 'terms';
    tabTerms.className = 'btn btn-primary';
    tabPrivacy.className = 'btn btn-outline';
    docHeading.textContent = 'Terms & Conditions Preview:';
    generateDocument();
  });

  btnViewHtml.addEventListener('click', () => {
    currentFormat = 'html';
    btnViewHtml.className = 'btn btn-primary';
    btnViewMd.className = 'btn btn-outline';
    generateDocument();
  });

  btnViewMd.addEventListener('click', () => {
    currentFormat = 'md';
    btnViewMd.className = 'btn btn-primary';
    btnViewHtml.className = 'btn btn-outline';
    generateDocument();
  });

  btnGenerate.addEventListener('click', generateDocument);
  [siteName, siteUrl, siteEmail, checkAdSense, checkAnalytics, checkAccounts].forEach((el) => {
    el.addEventListener('input', generateDocument);
    el.addEventListener('change', generateDocument);
  });

  btnCopyPolicy.addEventListener('click', () => {
    if (!policyOutput.value) return;
    navigator.clipboard.writeText(policyOutput.value).then(() => {
      const orig = btnCopyPolicy.innerHTML;
      btnCopyPolicy.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyPolicy.innerHTML = orig; }, 1800);
    });
  });

  btnDownloadPolicy.addEventListener('click', () => {
    if (!policyOutput.value) return;
    const ext = currentFormat === 'html' ? 'html' : 'md';
    const blob = new Blob([policyOutput.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentDoc}_${siteName.value.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    a.click();
  });

  // Initial
  generateDocument();

})();
