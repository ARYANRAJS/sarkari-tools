/**
 * AllToolsInOne - All Tools Directory Page Controller
 * Handles live sidebar filters, top sorting, view modes, and real-time search
 */

(function () {
  'use strict';

  // State
  const state = {
    category: 'all',
    badge: 'all',
    tag: null,
    searchQuery: '',
    sortBy: 'newest', // Default is Newly Added First
    viewMode: 'grid' // 'grid' | 'list'
  };

  // DOM Elements
  const dirSearchInput = document.getElementById('dirSearchInput');
  const dirSearchClear = document.getElementById('dirSearchClear');
  const dirSortSelect = document.getElementById('dirSortSelect');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  const toolsContainer = document.getElementById('directoryToolsContainer');
  const resultsCounter = document.getElementById('dirResultsCounter');
  const chipsList = document.getElementById('dirChipsList');
  const chipsRow = document.getElementById('dirChipsRow');
  const categoryListContainer = document.getElementById('filterCategoryList');
  const badgeGroup = document.getElementById('filterBadgeGroup');
  const tagsGrid = document.getElementById('filterTagsGrid');
  const btnResetAll = document.getElementById('btnResetAll');
  const btnResetEmpty = document.getElementById('btnResetEmpty');
  const btnMobileFilter = document.getElementById('btnMobileFilter');
  const directorySidebar = document.getElementById('directorySidebar');
  const directoryBackdrop = document.getElementById('directoryBackdrop');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');

  // Curated Popular Tags
  const POPULAR_TAGS = [
    'PDF', 'Shopify', 'QR Code', 'OCR', 'Calculator', 'Resume', 
    'Image', 'Meta Ads', 'Typing', 'Whois', 'Video', 'Barcode'
  ];

  function init() {
    // Wait for TOOLS array to be available
    const tools = getTools();
    if (!tools || tools.length === 0) {
      setTimeout(init, 50);
      return;
    }

    // Read initial state from URL query or hash
    readUrlParams();

    // Render filter sidebar options
    renderCategoriesSidebar(tools);
    renderTagsCloud();

    // Setup event listeners
    setupEventListeners();

    // Initial render
    applyFiltersAndRender();
  }

  function getTools() {
    return window.SARKARI_TOOLS || [];
  }

  function getCategories() {
    return window.SARKARI_CATEGORIES || [
      { id: 'all', label: 'All Tools' },
      { id: 'image', label: 'Image Tools' },
      { id: 'pdf', label: 'PDF Tools' },
      { id: 'calculator', label: 'Calculators' },
      { id: 'exam', label: 'Exam Tools' },
      { id: 'document', label: 'Documents' },
      { id: 'utility', label: 'Utilities' },
      { id: 'video', label: 'Video & Subtitles' },
      { id: 'seo', label: 'SEO & Marketing' }
    ];
  }

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) state.category = params.get('category');
    if (params.get('badge')) state.badge = params.get('badge');
    if (params.get('tag')) state.tag = params.get('tag');
    if (params.get('q')) state.searchQuery = params.get('q');
    if (params.get('sort')) state.sortBy = params.get('sort');

    // Also support hash like #image or #seo
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validCats = ['image', 'pdf', 'calculator', 'exam', 'document', 'utility', 'video', 'seo'];
      if (validCats.includes(hash)) {
        state.category = hash;
      }
    }

    if (dirSearchInput && state.searchQuery) {
      dirSearchInput.value = state.searchQuery;
      if (dirSearchClear) dirSearchClear.style.display = 'block';
    }

    if (dirSortSelect && state.sortBy) {
      dirSortSelect.value = state.sortBy;
    }
  }

  function renderCategoriesSidebar(tools) {
    if (!categoryListContainer) return;
    const cats = getCategories();

    categoryListContainer.innerHTML = cats.map(cat => {
      const count = cat.id === 'all'
        ? tools.length
        : tools.filter(t => t.category === cat.id).length;

      const icon = getCategoryIcon(cat.id);
      const isActive = state.category === cat.id;

      return `
        <button type="button" class="filter-category-btn ${isActive ? 'active' : ''}" data-category="${cat.id}">
          <span class="filter-cat-left">
            <span>${icon}</span>
            <span class="filter-cat-name">${cat.label}</span>
          </span>
          <span class="filter-count-badge">${count}</span>
        </button>
      `;
    }).join('');
  }

  function renderTagsCloud() {
    if (!tagsGrid) return;
    tagsGrid.innerHTML = POPULAR_TAGS.map(tag => {
      const isActive = state.tag && state.tag.toLowerCase() === tag.toLowerCase();
      return `
        <button type="button" class="filter-tag-chip ${isActive ? 'active' : ''}" data-tag="${tag}">
          ${tag}
        </button>
      `;
    }).join('');
  }

  function setupEventListeners() {
    // Search Input
    dirSearchInput?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (dirSearchClear) {
        dirSearchClear.style.display = state.searchQuery ? 'block' : 'none';
      }
      applyFiltersAndRender();
    });

    dirSearchClear?.addEventListener('click', () => {
      if (dirSearchInput) dirSearchInput.value = '';
      state.searchQuery = '';
      dirSearchClear.style.display = 'none';
      applyFiltersAndRender();
      dirSearchInput?.focus();
    });

    // Keyboard shortcut / or Ctrl+K to search
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== dirSearchInput) {
        e.preventDefault();
        dirSearchInput?.focus();
        dirSearchInput?.select();
      }
    });

    // Sort Dropdown
    dirSortSelect?.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRender();
    });

    // View Switcher
    viewGridBtn?.addEventListener('click', () => {
      state.viewMode = 'grid';
      viewGridBtn.classList.add('active');
      viewListBtn?.classList.remove('active');
      applyFiltersAndRender();
    });

    viewListBtn?.addEventListener('click', () => {
      state.viewMode = 'list';
      viewListBtn.classList.add('active');
      viewGridBtn?.classList.remove('active');
      applyFiltersAndRender();
    });

    // Category Buttons
    categoryListContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-category-btn');
      if (!btn) return;
      state.category = btn.dataset.category;
      updateSidebarCategoryUI();
      applyFiltersAndRender();
      closeMobileDrawer();
    });

    // Badge Filter Group
    badgeGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-badge-pill');
      if (!btn) return;
      state.badge = btn.dataset.badge;
      badgeGroup.querySelectorAll('.filter-badge-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFiltersAndRender();
      closeMobileDrawer();
    });

    // Tags Cloud
    tagsGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tag-chip');
      if (!btn) return;
      const clickedTag = btn.dataset.tag;
      state.tag = state.tag === clickedTag ? null : clickedTag;
      renderTagsCloud();
      applyFiltersAndRender();
      closeMobileDrawer();
    });

    // Reset Buttons
    btnResetAll?.addEventListener('click', resetAllFilters);
    btnResetEmpty?.addEventListener('click', resetAllFilters);

    // Active Chips remove
    chipsList?.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.dir-chip-remove');
      if (!removeBtn) return;
      const type = removeBtn.dataset.type;
      if (type === 'category') state.category = 'all';
      if (type === 'badge') state.badge = 'all';
      if (type === 'tag') state.tag = null;
      if (type === 'query') {
        state.searchQuery = '';
        if (dirSearchInput) dirSearchInput.value = '';
        if (dirSearchClear) dirSearchClear.style.display = 'none';
      }
      updateSidebarCategoryUI();
      updateBadgeUI();
      renderTagsCloud();
      applyFiltersAndRender();
    });

    // Mobile Drawer Controls
    btnMobileFilter?.addEventListener('click', openMobileDrawer);
    mobileDrawerClose?.addEventListener('click', closeMobileDrawer);
    directoryBackdrop?.addEventListener('click', closeMobileDrawer);
  }

  function openMobileDrawer() {
    directorySidebar?.classList.add('mobile-open');
    directoryBackdrop?.classList.add('mobile-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    directorySidebar?.classList.remove('mobile-open');
    directoryBackdrop?.classList.remove('mobile-open');
    document.body.style.overflow = '';
  }

  function updateSidebarCategoryUI() {
    if (!categoryListContainer) return;
    categoryListContainer.querySelectorAll('.filter-category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === state.category);
    });
  }

  function updateBadgeUI() {
    if (!badgeGroup) return;
    badgeGroup.querySelectorAll('.filter-badge-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.badge === state.badge);
    });
  }

  function resetAllFilters() {
    state.category = 'all';
    state.badge = 'all';
    state.tag = null;
    state.searchQuery = '';
    state.sortBy = 'newest';

    if (dirSearchInput) dirSearchInput.value = '';
    if (dirSearchClear) dirSearchClear.style.display = 'none';
    if (dirSortSelect) dirSortSelect.value = 'newest';

    updateSidebarCategoryUI();
    updateBadgeUI();
    renderTagsCloud();
    applyFiltersAndRender();
  }

  /* ───────── FILTERING & SORTING ENGINE ───────── */
  function applyFiltersAndRender() {
    const allTools = getTools();
    let filtered = [...allTools];

    // 1. Category Filter
    if (state.category && state.category !== 'all') {
      filtered = filtered.filter(t => t.category === state.category);
    }

    // 2. Badge Filter
    if (state.badge && state.badge !== 'all') {
      if (state.badge === 'popular') {
        filtered = filtered.filter(t => t.badge && t.badge.toLowerCase().includes('popular'));
      } else if (state.badge === 'new') {
        filtered = filtered.filter(t => t.badge && t.badge.toLowerCase().includes('new'));
      }
    }

    // 3. Tag Filter
    if (state.tag) {
      const qTag = state.tag.toLowerCase();
      filtered = filtered.filter(t => {
        const inName = t.name.toLowerCase().includes(qTag);
        const inDesc = t.description.toLowerCase().includes(qTag);
        const inKeywords = (t.keywords || []).some(k => k.toLowerCase().includes(qTag));
        return inName || inDesc || inKeywords;
      });
    }

    // 4. Search Query Filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const inName = t.name.toLowerCase().includes(q);
        const inDesc = t.description.toLowerCase().includes(q);
        const inCat = (t.categoryLabel || '').toLowerCase().includes(q);
        const inKeywords = (t.keywords || []).some(k => k.toLowerCase().includes(q));
        return inName || inDesc || inCat || inKeywords;
      });
    }

    // 5. Sorting
    filtered = sortTools(filtered, state.sortBy);

    // Update Counter & Active Chips
    renderActiveChips(allTools.length, filtered.length);

    // Render Cards or Empty State
    renderToolsView(filtered);

    // Sync URL without reload
    syncUrl();
  }

  // Chronological hierarchy of recently added tools (newest first)
  const NEWEST_TOOL_IDS = [
    'website-analyzer',
    'tech-detector',
    'image-to-text',
    'whois-lookup',
    'pdf-editor',
    'video-subtitle-maker',
    'barcode-generator',
    'schema-generator',
    'gst-calculator',
    'google-maps-qr-generator',
    'wifi-qr-generator',
    'vcard-qr-generator',
    'ai-plagiarism-checker',
    'invoice-maker',
    'upi-qr-generator'
  ];

  function sortTools(tools, sortBy) {
    const arr = [...tools];
    switch (sortBy) {
      case 'newest':
      default:
        return arr.sort((a, b) => {
          const aIdx = NEWEST_TOOL_IDS.indexOf(a.id);
          const bIdx = NEWEST_TOOL_IDS.indexOf(b.id);
          const aRank = aIdx !== -1 ? aIdx : ((a.badge || '').toLowerCase().includes('new') ? 50 : 100);
          const bRank = bIdx !== -1 ? bIdx : ((b.badge || '').toLowerCase().includes('new') ? 50 : 100);
          if (aRank !== bRank) return aRank - bRank;
          return a.name.localeCompare(b.name);
        });
      case 'recommended':
        return arr; // Original catalog order
      case 'name-asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case 'popular':
        return arr.sort((a, b) => {
          const aPop = (a.badge || '').toLowerCase().includes('popular') ? 1 : 0;
          const bPop = (b.badge || '').toLowerCase().includes('popular') ? 1 : 0;
          return bPop - aPop;
        });
      case 'category':
        return arr.sort((a, b) => (a.categoryLabel || '').localeCompare(b.categoryLabel || ''));
    }
  }

  function renderActiveChips(totalCount, filteredCount) {
    if (resultsCounter) {
      resultsCounter.innerText = `Showing ${filteredCount} of ${totalCount} tools`;
    }

    if (!chipsList) return;

    const chips = [];

    if (state.category !== 'all') {
      const catObj = getCategories().find(c => c.id === state.category);
      chips.push(`
        <span class="dir-chip">
          <span>📁 ${catObj ? catObj.label : state.category}</span>
          <span class="dir-chip-remove" data-type="category" title="Remove filter">✕</span>
        </span>
      `);
    }

    if (state.badge !== 'all') {
      chips.push(`
        <span class="dir-chip">
          <span>⭐ ${state.badge === 'popular' ? 'Popular' : 'New'}</span>
          <span class="dir-chip-remove" data-type="badge" title="Remove filter">✕</span>
        </span>
      `);
    }

    if (state.tag) {
      chips.push(`
        <span class="dir-chip">
          <span>🏷️ ${state.tag}</span>
          <span class="dir-chip-remove" data-type="tag" title="Remove tag">✕</span>
        </span>
      `);
    }

    if (state.searchQuery) {
      chips.push(`
        <span class="dir-chip">
          <span>🔍 "${state.searchQuery}"</span>
          <span class="dir-chip-remove" data-type="query" title="Clear query">✕</span>
        </span>
      `);
    }

    if (chips.length > 0) {
      chipsList.innerHTML = chips.join('') + `
        <button type="button" class="btn-sidebar-reset" id="btnClearAllChips" style="font-size: 11px; padding: 2px 6px;">Clear All</button>
      `;
      document.getElementById('btnClearAllChips')?.addEventListener('click', resetAllFilters);
      if (chipsRow) chipsRow.style.display = 'flex';
    } else {
      chipsList.innerHTML = '';
      if (chipsRow) chipsRow.style.display = 'none';
    }
  }

  function renderToolsView(tools) {
    if (!toolsContainer) return;

    if (tools.length === 0) {
      toolsContainer.innerHTML = `
        <div class="directory-empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No tools match your criteria</div>
          <div class="empty-desc">We couldn't find any tool matching your active filters or search terms.</div>
          <button type="button" class="btn btn-primary" id="btnResetEmpty" style="padding: 10px 22px; font-size: 14px;">
            🔄 Reset All Filters
          </button>
        </div>
      `;
      document.getElementById('btnResetEmpty')?.addEventListener('click', resetAllFilters);
      return;
    }

    if (state.viewMode === 'list') {
      toolsContainer.className = 'directory-list';
      toolsContainer.innerHTML = tools.map(tool => {
        const url = getToolUrl(tool);
        const badgeHtml = tool.badge
          ? `<span class="dir-card-badge ${tool.badge.toLowerCase().includes('popular') ? 'badge-popular' : 'badge-new'}">${tool.badge}</span>`
          : '';

        return `
          <a href="${url}" class="directory-list-item" aria-label="${tool.name}">
            <div class="dir-list-left">
              <div class="dir-card-icon ${tool.iconBg}">${tool.icon}</div>
              <div class="dir-list-info">
                <div class="dir-list-name-row">
                  <span class="dir-list-name">${tool.name}</span>
                  ${badgeHtml}
                </div>
                <div class="dir-list-desc">${tool.description}</div>
              </div>
            </div>
            <div class="dir-list-right">
              <span class="ocr-badge status-ready" style="font-size: 11px;">${tool.categoryLabel}</span>
              <span class="dir-card-arrow" style="font-size: 13px;">Open Tool →</span>
            </div>
          </a>
        `;
      }).join('');
    } else {
      // Grid Mode
      toolsContainer.className = 'directory-grid';
      toolsContainer.innerHTML = tools.map(tool => {
        const url = getToolUrl(tool);
        const badgeHtml = tool.badge
          ? `<span class="dir-card-badge ${tool.badge.toLowerCase().includes('popular') ? 'badge-popular' : 'badge-new'}">${tool.badge}</span>`
          : '';

        return `
          <a href="${url}" class="directory-tool-card" aria-label="${tool.name}">
            <div>
              <div class="dir-card-top">
                <div class="dir-card-icon ${tool.iconBg}">${tool.icon}</div>
                ${badgeHtml}
              </div>
              <div class="dir-card-title">${tool.name}</div>
              <div class="dir-card-desc">${tool.description}</div>
            </div>
            <div class="dir-card-footer">
              <span class="dir-card-cat">${tool.categoryLabel}</span>
              <span class="dir-card-arrow">Open Tool →</span>
            </div>
          </a>
        `;
      }).join('');
    }
  }

  function getToolUrl(tool) {
    if (!tool.url) return '#';
    // tools.html is in root directory, tool.url is 'tools/image-resizer.html'
    return tool.url;
  }

  function getCategoryIcon(catId) {
    switch (catId) {
      case 'all': return '⚡';
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'calculator': return '📅';
      case 'exam': return '⌨️';
      case 'document': return '📝';
      case 'utility': return '🔐';
      case 'video': return '🎬';
      case 'seo': return '🚀';
      default: return '🛠️';
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.category !== 'all') params.set('category', state.category);
    if (state.badge !== 'all') params.set('badge', state.badge);
    if (state.tag) params.set('tag', state.tag);
    if (state.searchQuery) params.set('q', state.searchQuery);
    if (state.sortBy !== 'newest') params.set('sort', state.sortBy);

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
    window.history.replaceState({}, '', newUrl);
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
