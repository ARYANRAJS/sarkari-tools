/* ═══════════════════════════════════════════════════
   SARKARI RESULT TOOLS — Schema Markup Generator
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const schemaTypeSelect = document.getElementById('schemaTypeSelect');
  const schemaCodeOutput = document.getElementById('schemaCodeOutput');
  const btnCopySchema = document.getElementById('btnCopySchema');
  const btnDownloadSchema = document.getElementById('btnDownloadSchema');

  // Form containers
  const formFaq = document.getElementById('formFaq');
  const formLocal = document.getElementById('formLocal');
  const formArticle = document.getElementById('formArticle');
  const formProduct = document.getElementById('formProduct');
  const formOrg = document.getElementById('formOrg');

  // FAQ builder elements
  const faqListContainer = document.getElementById('faqListContainer');
  const btnAddFaq = document.getElementById('btnAddFaq');

  let faqItems = [
    {
      q: 'How do I resize a passport photo to under 50 KB for government exams?',
      a: 'Upload your photo into our Exam Photo Studio tool, set width to 3.5cm and height to 4.5cm, choose max file size 50 KB, and click Download.'
    },
    {
      q: 'Is this utility website completely free to use?',
      a: 'Yes, 100% free with no sign-up or registration required. All photo, PDF and document processing happens locally in your browser for complete privacy.'
    },
    {
      q: 'Can I combine photo and signature on a single sheet for SSC and UPSC forms?',
      a: 'Yes, use the Photo & Signature Joiner tool to upload both images, choose your required spacing and output dimensions, and generate a compliant file.'
    }
  ];

  // Schema type selector change
  schemaTypeSelect.addEventListener('change', () => {
    const val = schemaTypeSelect.value;
    formFaq.style.display = val === 'faq' ? 'block' : 'none';
    formLocal.style.display = val === 'local' ? 'block' : 'none';
    formArticle.style.display = val === 'article' ? 'block' : 'none';
    formProduct.style.display = val === 'product' ? 'block' : 'none';
    formOrg.style.display = val === 'organization' ? 'block' : 'none';
    updateSchemaOutput();
  });

  // ════════════ FAQ HANDLERS ════════════
  function renderFaqList() {
    faqListContainer.innerHTML = '';
    faqItems.forEach((item, idx) => {
      const box = document.createElement('div');
      box.style.cssText = 'background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 12px;';
      box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 600; font-size: 13px; color: var(--navy);">Q${idx + 1}: Question</span>
          ${faqItems.length > 1 ? `<button type="button" class="btn btn-outline btn-del-faq" data-idx="${idx}" style="color: #dc2626; padding: 2px 8px; font-size: 11px;">✕ Remove</button>` : ''}
        </div>
        <input type="text" class="form-input faq-q" data-idx="${idx}" value="${escapeHtml(item.q)}" placeholder="Enter question..." style="margin-bottom: 8px;">
        <textarea class="form-input faq-a" data-idx="${idx}" rows="2" placeholder="Enter answer..." style="resize: vertical;">${escapeHtml(item.a)}</textarea>
      `;
      faqListContainer.appendChild(box);
    });

    faqListContainer.querySelectorAll('.faq-q').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        faqItems[i].q = e.target.value;
        updateSchemaOutput();
      });
    });

    faqListContainer.querySelectorAll('.faq-a').forEach(ta => {
      ta.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        faqItems[i].a = e.target.value;
        updateSchemaOutput();
      });
    });

    faqListContainer.querySelectorAll('.btn-del-faq').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        faqItems.splice(i, 1);
        renderFaqList();
        updateSchemaOutput();
      });
    });
  }

  btnAddFaq.addEventListener('click', () => {
    faqItems.push({ q: '', a: '' });
    renderFaqList();
    updateSchemaOutput();
  });

  // Attach input listeners to all other schema form fields
  document.querySelectorAll('#formLocal input, #formLocal select, #formArticle input, #formProduct input, #formOrg input').forEach(elem => {
    elem.addEventListener('input', updateSchemaOutput);
  });

  function updateSchemaOutput() {
    const type = schemaTypeSelect.value;
    let schemaObj = {};

    if (type === 'faq') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqItems.filter(f => f.q.trim()).map(f => ({
          '@type': 'Question',
          'name': f.q.trim(),
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a.trim()
          }
        }))
      };
    } else if (type === 'local') {
      const name = document.getElementById('locName').value.trim() || 'Sharma Cyber Cafe';
      const cat = document.getElementById('locType').value;
      const url = document.getElementById('locUrl').value.trim() || 'https://example.com';
      const phone = document.getElementById('locPhone').value.trim() || '+91 98765 43210';
      const street = document.getElementById('locStreet').value.trim() || 'Shop 12, Main Road';
      const city = document.getElementById('locCity').value.trim() || 'New Delhi';
      const postal = document.getElementById('locPostal').value.trim() || '110001';
      const price = document.getElementById('locPrice').value.trim() || '₹₹';

      schemaObj = {
        '@context': 'https://schema.org',
        '@type': cat,
        'name': name,
        'url': url,
        'telephone': phone,
        'priceRange': price,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': street,
          'addressLocality': city,
          'postalCode': postal,
          'addressCountry': 'IN'
        }
      };
    } else if (type === 'article') {
      const headline = document.getElementById('artHeadline').value.trim() || 'SSC CGL 2026 Notification Out';
      const desc = document.getElementById('artDesc').value.trim() || 'Comprehensive application and eligibility guide.';
      const author = document.getElementById('artAuthor').value.trim() || 'Hariom Bhati';
      const publisher = document.getElementById('artPublisher').value.trim() || 'Sarkari Result Tools';
      const datePub = document.getElementById('artDatePub').value || new Date().toISOString().split('T')[0];
      const img = document.getElementById('artImage').value.trim() || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200';

      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': headline,
        'description': desc,
        'image': img,
        'datePublished': datePub,
        'dateModified': datePub,
        'author': {
          '@type': 'Person',
          'name': author
        },
        'publisher': {
          '@type': 'Organization',
          'name': publisher
        }
      };
    } else if (type === 'product') {
      const name = document.getElementById('prodName').value.trim() || 'Passport Photo Print Pack';
      const brand = document.getElementById('prodBrand').value.trim() || 'PrintShop Pro';
      const price = document.getElementById('prodPrice').value.trim() || '50';
      const rating = document.getElementById('prodRating').value.trim() || '4.8';
      const reviews = document.getElementById('prodReviews').value.trim() || '128';

      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': name,
        'brand': {
          '@type': 'Brand',
          'name': brand
        },
        'offers': {
          '@type': 'Offer',
          'price': price,
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': rating,
          'reviewCount': reviews
        }
      };
    } else if (type === 'organization') {
      const name = document.getElementById('orgName').value.trim() || 'Sarkari Result Tools';
      const url = document.getElementById('orgUrl').value.trim() || 'https://sarkaritools.in';
      const logo = document.getElementById('orgLogo').value.trim() || 'https://sarkaritools.in/favicon.svg';
      const social = document.getElementById('orgSocial').value.trim();

      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': name,
        'url': url,
        'logo': logo
      };

      if (social) {
        schemaObj.sameAs = [social];
      }
    }

    const jsonStr = JSON.stringify(schemaObj, null, 2);
    const code = `<script type="application/ld+json">\n${jsonStr}\n<\/script>`;
    schemaCodeOutput.textContent = code;
  }

  // Copy Schema
  btnCopySchema.addEventListener('click', () => {
    navigator.clipboard.writeText(schemaCodeOutput.textContent).then(() => {
      const orig = btnCopySchema.textContent;
      btnCopySchema.textContent = '✓ Copied Schema!';
      setTimeout(() => { btnCopySchema.textContent = orig; }, 2000);
    });
  });

  // Download Schema
  btnDownloadSchema.addEventListener('click', () => {
    const code = schemaCodeOutput.textContent;
    const blob = new Blob([code], { type: 'application/ld+json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-${schemaTypeSelect.value}.jsonld`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Initialize
  renderFaqList();
  // Set default published date to today
  document.getElementById('artDatePub').value = new Date().toISOString().split('T')[0];
  updateSchemaOutput();

});
