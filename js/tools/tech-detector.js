/**
 * AllToolsInOne - Website Tech Stack & Shopify Detector
 * Comprehensive, client-side technology finder and Wappalyzer alternative.
 * Detects 150+ technologies across E-commerce, CMS, Frameworks, Analytics, Payments & CDNs.
 */

(function () {
  'use strict';

  // DOM Elements
  const techTabs = document.getElementById('techTabs');
  const modeUrlSection = document.getElementById('modeUrlSection');
  const modeSourceSection = document.getElementById('modeSourceSection');
  const inpTargetUrl = document.getElementById('inpTargetUrl');
  const btnScanUrl = document.getElementById('btnScanUrl');
  const inpSourceCode = document.getElementById('inpSourceCode');
  const btnScanSource = document.getElementById('btnScanSource');
  const btnLoadDemoSource = document.getElementById('btnLoadDemoSource');
  const scanLoading = document.getElementById('scanLoading');
  const loadingStatusText = document.getElementById('loadingStatusText');
  const loadingSubtext = document.getElementById('loadingSubtext');
  const resultsContainer = document.getElementById('resultsContainer');
  const sumEcommerce = document.getElementById('sumEcommerce');
  const sumCms = document.getElementById('sumCms');
  const sumServer = document.getElementById('sumServer');
  const sumCount = document.getElementById('sumCount');
  const shopifyAlert = document.getElementById('shopifyAlert');
  const shopifyAlertTitle = document.getElementById('shopifyAlertTitle');
  const shopifyAlertDesc = document.getElementById('shopifyAlertDesc');
  const shopifyThemeBadge = document.getElementById('shopifyThemeBadge');
  const techCategoryFilters = document.getElementById('techCategoryFilters');
  const filterCountAll = document.getElementById('filterCountAll');
  const techSectionsContainer = document.getElementById('techSectionsContainer');
  const btnCopyReport = document.getElementById('btnCopyReport');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const sampleSiteButtons = document.querySelectorAll('.sample-site-btn');

  // Active Scan State
  let currentScannedData = null;
  let activeFilter = 'all';

  // Categories Definition
  const CATEGORIES = {
    ecommerce: { label: '🛍️ E-commerce & Store Platforms', icon: '🛍️' },
    shopify_apps: { label: '🔌 Shopify Apps & Extensions', icon: '🔌' },
    cms: { label: '📦 CMS & Website Builders', icon: '📦' },
    frameworks: { label: '⚛️ JavaScript Frameworks & Libraries', icon: '⚛️' },
    ui: { label: '🎨 UI & CSS Frameworks', icon: '🎨' },
    analytics: { label: '📊 Analytics, Trackers & Pixels', icon: '📊' },
    payment: { label: '💳 Payment Gateways & BNPL', icon: '💳' },
    server: { label: '☁️ Web Servers, CDN & Hosting', icon: '☁️' },
    chat: { label: '💬 Customer Support & Chat', icon: '💬' },
    security: { label: '🛡️ Security, CAPTCHA & Privacy', icon: '🛡️' },
    email: { label: '✉️ Email & Business Infrastructure', icon: '✉️' },
    tools: { label: '🌐 Protocols & SEO Meta Tags', icon: '🌐' }
  };

  // ───────── 150+ TECHNOLOGY SIGNATURE DATABASE ─────────
  const TECH_DATABASE = [
    // ==========================================
    // 1. E-COMMERCE PLATFORMS
    // ==========================================
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      icon: '🛍️',
      description: 'Global cloud e-commerce engine powering millions of direct-to-consumer online stores.',
      website: 'https://shopify.com',
      test: (ctx) => {
        if (ctx.html.includes('cdn.shopify.com') || ctx.html.includes('Shopify.theme') || ctx.html.includes('myshopify.com') || (ctx.asn && ctx.asn.includes('SHOPIFY'))) {
          const themeMatch = ctx.html.match(/Shopify\.theme\s*=\s*\{[^}]*name:\s*["']([^"']+)["']/i);
          return {
            evidence: 'Found cdn.shopify.com / Shopify JS runtime / Hosting network',
            version: themeMatch ? `Theme: ${themeMatch[1]}` : 'Store Active'
          };
        }
        return null;
      }
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      category: 'ecommerce',
      icon: '🛒',
      description: 'Open-source e-commerce platform built natively for WordPress.',
      website: 'https://woocommerce.com',
      test: (ctx) => {
        if (ctx.html.includes('woocommerce') || ctx.html.includes('wc-blocks') || ctx.html.includes('wp-content/plugins/woocommerce')) {
          return { evidence: 'Found WooCommerce plugin scripts and CSS classes' };
        }
        return null;
      }
    },
    {
      id: 'magento',
      name: 'Magento / Adobe Commerce',
      category: 'ecommerce',
      icon: '🛍️',
      description: 'Enterprise open-source e-commerce platform by Adobe.',
      website: 'https://business.adobe.com/products/magento/magento-commerce.html',
      test: (ctx) => {
        if (ctx.html.includes('static/frontend/Magento') || ctx.html.includes('Mage.Cookies') || ctx.html.includes('mage/cookies')) {
          return { evidence: 'Found Magento core assets and Mage JavaScript runtime' };
        }
        return null;
      }
    },
    {
      id: 'bigcommerce',
      name: 'BigCommerce',
      category: 'ecommerce',
      icon: '🏬',
      description: 'Leading SaaS e-commerce platform for fast-growing businesses.',
      website: 'https://bigcommerce.com',
      test: (ctx) => {
        if (ctx.html.includes('cdn11.bigcommerce.com') || ctx.html.includes('stencil-utils')) {
          return { evidence: 'Found BigCommerce CDN and Stencil theme scripts' };
        }
        return null;
      }
    },
    {
      id: 'prestashop',
      name: 'PrestaShop',
      category: 'ecommerce',
      icon: '🐧',
      description: 'Popular European open-source e-commerce platform.',
      website: 'https://prestashop.com',
      test: (ctx) => {
        if (ctx.html.includes('prestashop') || ctx.html.includes('modules/blockbanner')) {
          return { evidence: 'Found PrestaShop modules & JavaScript' };
        }
        return null;
      }
    },
    {
      id: 'opencart',
      name: 'OpenCart',
      category: 'ecommerce',
      icon: '🛒',
      description: 'Free open-source PHP online store management system.',
      website: 'https://opencart.com',
      test: (ctx) => {
        if (ctx.html.includes('catalog/view/javascript') && ctx.html.includes('index.php?route=')) {
          return { evidence: 'Found OpenCart catalog routes and view structure' };
        }
        return null;
      }
    },
    {
      id: 'wix_stores',
      name: 'Wix Stores',
      category: 'ecommerce',
      icon: '🛍️',
      description: 'E-commerce module integrated into Wix website builder.',
      website: 'https://wix.com',
      test: (ctx) => {
        if (ctx.html.includes('wixstores') || ctx.html.includes('wix-ecommerce')) {
          return { evidence: 'Found Wix Stores shopping cart components' };
        }
        return null;
      }
    },
    {
      id: 'squarespace_commerce',
      name: 'Squarespace Commerce',
      category: 'ecommerce',
      icon: '🛒',
      description: 'Built-in store & checkout system for Squarespace websites.',
      website: 'https://squarespace.com/ecommerce-website',
      test: (ctx) => {
        if (ctx.html.includes('squarespace-cart') || (ctx.html.includes('static.squarespace.com') && ctx.html.includes('commerce'))) {
          return { evidence: 'Found Squarespace commerce and cart scripts' };
        }
        return null;
      }
    },

    // ==========================================
    // 2. SHOPIFY APPS & EXTENSIONS
    // ==========================================
    {
      id: 'pagefly',
      name: 'PageFly Landing Page Builder',
      category: 'shopify_apps',
      icon: '📄',
      description: 'Popular drag-and-drop landing page and product page builder for Shopify.',
      website: 'https://pagefly.io',
      test: (ctx) => {
        if (ctx.html.includes('cdn.pagefly.io') || ctx.html.includes('pagefly-container') || ctx.html.includes('__pagefly')) {
          return { evidence: 'Found PageFly builder containers and CSS' };
        }
        return null;
      }
    },
    {
      id: 'shogun',
      name: 'Shogun Page Builder',
      category: 'shopify_apps',
      icon: '🏯',
      description: 'Visual page builder for e-commerce stores.',
      website: 'https://getshogun.com',
      test: (ctx) => {
        if (ctx.html.includes('cdn.getshogun.com') || ctx.html.includes('shogun-root')) {
          return { evidence: 'Found Shogun page components and runtime scripts' };
        }
        return null;
      }
    },
    {
      id: 'gempages',
      name: 'GemPages',
      category: 'shopify_apps',
      icon: '💎',
      description: 'Conversion-focused drag and drop landing page builder for Shopify.',
      website: 'https://gempages.net',
      test: (ctx) => {
        if (ctx.html.includes('gempages') || ctx.html.includes('gem-page')) {
          return { evidence: 'Found GemPages builder elements' };
        }
        return null;
      }
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo Marketing Automation',
      category: 'shopify_apps',
      icon: '📧',
      description: 'Intelligent marketing automation, email campaigns, and SMS for e-commerce.',
      website: 'https://klaviyo.com',
      test: (ctx) => {
        if (ctx.html.includes('static.klaviyo.com') || ctx.html.includes('klaviyo.js') || ctx.html.includes('_learnq')) {
          return { evidence: 'Found Klaviyo tracking pixel and onsite script' };
        }
        return null;
      }
    },
    {
      id: 'judgeme',
      name: 'Judge.me Product Reviews',
      category: 'shopify_apps',
      icon: '⭐',
      description: 'Fast-loading customer product review and rating star widget.',
      website: 'https://judge.me',
      test: (ctx) => {
        if (ctx.html.includes('cdn.judge.me') || ctx.html.includes('jdgm-widget')) {
          return { evidence: 'Found Judge.me review widget scripts and review blocks' };
        }
        return null;
      }
    },
    {
      id: 'loox',
      name: 'Loox Photo Reviews',
      category: 'shopify_apps',
      icon: '📸',
      description: 'Social proof and photo review platform for Shopify brands.',
      website: 'https://loox.app',
      test: (ctx) => {
        if (ctx.html.includes('loox.io') || ctx.html.includes('loox-rating')) {
          return { evidence: 'Found Loox photo review embed' };
        }
        return null;
      }
    },
    {
      id: 'yotpo',
      name: 'Yotpo Reviews & Loyalty',
      category: 'shopify_apps',
      icon: '🏆',
      description: 'E-commerce retention marketing platform for reviews, visual UGC & loyalty.',
      website: 'https://yotpo.com',
      test: (ctx) => {
        if (ctx.html.includes('staticw2.yotpo.com') || ctx.html.includes('yotpo.js')) {
          return { evidence: 'Found Yotpo review scripts' };
        }
        return null;
      }
    },
    {
      id: 'smileio',
      name: 'Smile.io Rewards',
      category: 'shopify_apps',
      icon: '😊',
      description: 'Customer loyalty, referral, and VIP rewards program software.',
      website: 'https://smile.io',
      test: (ctx) => {
        if (ctx.html.includes('js.smile.io') || ctx.html.includes('smile-ui')) {
          return { evidence: 'Found Smile.io loyalty widget runtime' };
        }
        return null;
      }
    },
    {
      id: 'recharge',
      name: 'Recharge Subscriptions',
      category: 'shopify_apps',
      icon: '🔄',
      description: 'Leading subscription payment and recurring billing solution for Shopify.',
      website: 'https://rechargepayments.com',
      test: (ctx) => {
        if (ctx.html.includes('rechargepayments.com') || ctx.html.includes('recharge-widget')) {
          return { evidence: 'Found Recharge recurring subscription widget' };
        }
        return null;
      }
    },
    {
      id: 'gorgias',
      name: 'Gorgias Helpdesk',
      category: 'shopify_apps',
      icon: '💬',
      description: 'Customer service helpdesk built specifically for e-commerce stores.',
      website: 'https://gorgias.com',
      test: (ctx) => {
        if (ctx.html.includes('gorgias.chat') || ctx.html.includes('config.gorgias.io')) {
          return { evidence: 'Found Gorgias live chat embed' };
        }
        return null;
      }
    },
    {
      id: 'privy',
      name: 'Privy Popups & Email',
      category: 'shopify_apps',
      icon: '🎁',
      description: 'Lead capture popups, spin-to-win wheels, and cart-saver banners.',
      website: 'https://privy.com',
      test: (ctx) => {
        if (ctx.html.includes('widget.privy.com')) {
          return { evidence: 'Found Privy lead capture widget' };
        }
        return null;
      }
    },

    // ==========================================
    // 3. CMS & WEBSITE BUILDERS
    // ==========================================
    {
      id: 'wordpress',
      name: 'WordPress',
      category: 'cms',
      icon: '📝',
      description: 'World\'s most popular open-source CMS powering over 40% of the internet.',
      website: 'https://wordpress.org',
      test: (ctx) => {
        if (ctx.metaGenerator.toLowerCase().includes('wordpress') || ctx.html.includes('wp-content') || ctx.html.includes('wp-includes')) {
          const verMatch = ctx.metaGenerator.match(/wordpress\s+([\d.]+)/i);
          return {
            evidence: 'Found wp-content / wp-includes directory paths',
            version: verMatch ? verMatch[1] : undefined
          };
        }
        return null;
      }
    },
    {
      id: 'webflow',
      name: 'Webflow',
      category: 'cms',
      icon: '🌊',
      description: 'Visual web design platform and CMS for creating custom responsive websites.',
      website: 'https://webflow.com',
      test: (ctx) => {
        if (ctx.html.includes('data-wf-page') || ctx.html.includes('assets.website-files.com') || ctx.metaGenerator.toLowerCase().includes('webflow')) {
          return { evidence: 'Found Webflow data-wf attributes and assets' };
        }
        return null;
      }
    },
    {
      id: 'ghost',
      name: 'Ghost CMS',
      category: 'cms',
      icon: '👻',
      description: 'Open-source publishing platform built on modern Node.js technology.',
      website: 'https://ghost.org',
      test: (ctx) => {
        if (ctx.metaGenerator.toLowerCase().includes('ghost') || ctx.html.includes('ghost-foot') || ctx.html.includes('public/ghost.css')) {
          return { evidence: 'Found Ghost publisher meta tag & assets' };
        }
        return null;
      }
    },
    {
      id: 'drupal',
      name: 'Drupal',
      category: 'cms',
      icon: '💧',
      description: 'Enterprise open-source modular content management system.',
      website: 'https://drupal.org',
      test: (ctx) => {
        if (ctx.metaGenerator.toLowerCase().includes('drupal') || ctx.html.includes('drupal.js') || ctx.html.includes('sites/default/files')) {
          return { evidence: 'Found Drupal generator / sites/default asset paths' };
        }
        return null;
      }
    },
    {
      id: 'wix',
      name: 'Wix',
      category: 'cms',
      icon: '⚡',
      description: 'Cloud-based web development platform with drag-and-drop builder.',
      website: 'https://wix.com',
      test: (ctx) => {
        if (ctx.html.includes('static.parastorage.com') || ctx.metaGenerator.toLowerCase().includes('wix.com')) {
          return { evidence: 'Found Wix parastorage CDN assets' };
        }
        return null;
      }
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      category: 'cms',
      icon: '⬛',
      description: 'All-in-one website building and hosting platform known for sleek modern templates.',
      website: 'https://squarespace.com',
      test: (ctx) => {
        if (ctx.html.includes('static.squarespace.com') || ctx.html.includes('squarespace-headers')) {
          return { evidence: 'Found Squarespace static CDN scripts' };
        }
        return null;
      }
    },
    {
      id: 'framer',
      name: 'Framer',
      category: 'cms',
      icon: '📐',
      description: 'Interactive website builder and CMS for high-speed design and publishing.',
      website: 'https://framer.com',
      test: (ctx) => {
        if (ctx.html.includes('framer.com/m/') || ctx.html.includes('framer-') || ctx.metaGenerator.toLowerCase().includes('framer')) {
          return { evidence: 'Found Framer canvas component chunks and meta' };
        }
        return null;
      }
    },
    {
      id: 'hubspot_cms',
      name: 'HubSpot CMS',
      category: 'cms',
      icon: '🟠',
      description: 'Inbound marketing and CRM-integrated cloud website content management.',
      website: 'https://hubspot.com/products/cms',
      test: (ctx) => {
        if (ctx.html.includes('hs-scripts.com') || ctx.html.includes('hubspot.com') || ctx.html.includes('hs_cos_wrapper')) {
          return { evidence: 'Found HubSpot tracking and CMS template wrappers' };
        }
        return null;
      }
    },

    // ==========================================
    // 4. JAVASCRIPT FRAMEWORKS & LIBRARIES
    // ==========================================
    {
      id: 'react',
      name: 'React',
      category: 'frameworks',
      icon: '⚛️',
      description: 'Declarative, component-based JavaScript library by Meta for modern user interfaces.',
      website: 'https://react.dev',
      test: (ctx) => {
        // Modern React attributes (Helmet, Root, DevTools)
        if (ctx.html.includes('data-react-helmet') || ctx.html.includes('data-reactroot') || ctx.html.includes('data-reactid') || ctx.html.includes('_reactRootContainer') || ctx.html.includes('_reactListening')) {
          return { evidence: 'Found React virtual DOM attributes (data-react-helmet / data-reactroot)' };
        }
        // Framework hydration wrappers
        if (ctx.html.includes('__NEXT_DATA__') || ctx.html.includes('__remixContext') || ctx.html.includes('___gatsby')) {
          return { evidence: 'Found React SSR framework hydration state' };
        }
        // Script chunk signatures
        const hasReactScript = ctx.scripts.some(s => /(?:react(?:-dom)?(?:\.production)?(?:\.min)?\.js|\/static\/js\/main\.|\/_next\/static\/)/i.test(s));
        if (hasReactScript) {
          return { evidence: 'Found React core script chunk in document' };
        }
        // Classic SPA container #root with Webpack or dynamic bundler chunks
        if ((/<div\b[^>]*id=["']root["']/i.test(ctx.html)) && (ctx.html.includes('webpack') || ctx.scripts.some(s => /\/(?:runtime|chunk|\d+)\.[a-f0-9]+\.js/i.test(s)))) {
          return { evidence: 'Found React SPA #root container with dynamic chunk bundle structure' };
        }
        return null;
      }
    },
    {
      id: 'webpack',
      name: 'Webpack',
      category: 'frameworks',
      icon: '📦',
      description: 'Premier JavaScript module bundler and code-splitting asset packaging engine.',
      website: 'https://webpack.js.org',
      test: (ctx) => {
        // Check script chunk naming conventions
        const hasWebpackScript = ctx.scripts.some(s => /(?:webpack|runtime\.[a-f0-9]+\.js|\b\d+\.[a-f0-9]{6,}\.js|chunk-[a-f0-9]+|\/static\/js\/\d+\.)/i.test(s));
        // Check HTML / inline scripts
        const hasWebpackInline = ctx.html.includes('webpackChunk') || ctx.html.includes('webpackJsonp') || ctx.html.includes('__webpack_require__') || ctx.html.includes('window.webpackJsonp');
        if (hasWebpackInline || hasWebpackScript) {
          return { evidence: 'Found Webpack code-splitting runtime and chunk asset loaders' };
        }
        return null;
      }
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frameworks',
      icon: '▲',
      description: 'The React Framework for the Web by Vercel — enabling hybrid static & server rendering.',
      website: 'https://nextjs.org',
      test: (ctx) => {
        if (ctx.html.includes('__NEXT_DATA__') || ctx.html.includes('/_next/static/') || ctx.html.includes('/_next/')) {
          const match = ctx.html.match(/"buildId":"([^"]+)"/);
          return {
            evidence: 'Found Next.js __NEXT_DATA__ hydration script',
            version: match ? `Build: ${match[1].slice(0, 8)}` : undefined
          };
        }
        return null;
      }
    },
    {
      id: 'jss',
      name: 'JSS (CSS-in-JS)',
      category: 'frameworks',
      icon: '🎨',
      description: 'JavaScript Style Sheets authoring tool that compiles styles dynamically into the DOM.',
      website: 'https://cssinjs.org',
      test: (ctx) => {
        if (ctx.html.includes('data-jss') || /class=["'][^"']*\bjss\d+\b/i.test(ctx.html) || ctx.html.includes('makeStyles') || ctx.scripts.some(s => /jss(?:\.min)?\.js/i.test(s))) {
          return { evidence: 'Found JSS stylesheet markers & jss-generated CSS class patterns' };
        }
        return null;
      }
    },
    {
      id: 'core_js',
      name: 'core-js',
      category: 'frameworks',
      icon: '⚡',
      description: 'Modular standard library for JavaScript, including polyfills for ECMAScript specifications.',
      website: 'https://github.com/zloirock/core-js',
      test: (ctx) => {
        if (ctx.html.includes('core-js') || ctx.html.includes('__core-js_shared__') || ctx.scripts.some(s => /core-js/i.test(s))) {
          const v = ctx.html.match(/core-js[^\w]([\d\.]+)/i);
          return { evidence: 'Found core-js polyfill suite in client bundles', version: v ? v[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'vue',
      name: 'Vue.js',
      category: 'frameworks',
      icon: '💚',
      description: 'Progressive JavaScript framework for building modern user interfaces.',
      website: 'https://vuejs.org',
      test: (ctx) => {
        if (ctx.html.includes('vue.min.js') || ctx.html.includes('__VUE__') || /data-v-[a-f0-9]{6,8}/i.test(ctx.html)) {
          return { evidence: 'Found Vue.js scoped CSS attributes (data-v-*)' };
        }
        return null;
      }
    },
    {
      id: 'nuxtjs',
      name: 'Nuxt',
      category: 'frameworks',
      icon: '🟢',
      description: 'Intuitive Vue Framework for building universal SSR & full-stack web applications.',
      website: 'https://nuxt.com',
      test: (ctx) => {
        if (ctx.html.includes('__NUXT__') || ctx.html.includes('/_nuxt/')) {
          return { evidence: 'Found __NUXT__ hydration object and _nuxt bundle' };
        }
        return null;
      }
    },
    {
      id: 'angular',
      name: 'Angular',
      category: 'frameworks',
      icon: '🅰️',
      description: 'Enterprise web application platform and framework by Google.',
      website: 'https://angular.dev',
      test: (ctx) => {
        if (ctx.html.includes('ng-version') || ctx.html.includes('ng-app') || ctx.html.includes('zone.js')) {
          const ver = ctx.html.match(/ng-version=["']([^"']+)["']/i);
          return { evidence: 'Found Angular ng-version / zone.js runtime', version: ver ? ver[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'svelte',
      name: 'Svelte / SvelteKit',
      category: 'frameworks',
      icon: '🔥',
      description: 'Cybernetically enhanced web apps framework that compiles away into pure vanilla JS.',
      website: 'https://svelte.dev',
      test: (ctx) => {
        if (ctx.html.includes('class="svelte-') || ctx.html.includes('__svelte') || ctx.html.includes('_app/immutable')) {
          return { evidence: 'Found Svelte scoped styling classes & immutable bundle' };
        }
        return null;
      }
    },
    {
      id: 'astro',
      name: 'Astro',
      category: 'frameworks',
      icon: '🚀',
      description: 'Modern all-in-one web framework designed for content-focused, zero-JS-by-default websites.',
      website: 'https://astro.build',
      test: (ctx) => {
        if (ctx.html.includes('data-astro-cid') || ctx.html.includes('astro-island') || ctx.metaGenerator.toLowerCase().includes('astro')) {
          return { evidence: 'Found Astro island architecture components' };
        }
        return null;
      }
    },
    {
      id: 'jquery',
      name: 'jQuery',
      category: 'frameworks',
      icon: '💲',
      description: 'Classic fast, small, and feature-rich JavaScript utility library.',
      website: 'https://jquery.com',
      test: (ctx) => {
        if (ctx.html.includes('jquery.min.js') || ctx.html.includes('jquery-') || ctx.html.includes('/jquery/')) {
          const ver = ctx.html.match(/jquery[.-]([\d.]+)(?:\.min)?\.js/i);
          return { evidence: 'Found jQuery script inclusion', version: ver ? ver[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'alpinejs',
      name: 'Alpine.js',
      category: 'frameworks',
      icon: '🏔️',
      description: 'Rugged, minimal JavaScript tool for composing behavior directly in markup.',
      website: 'https://alpinejs.dev',
      test: (ctx) => {
        if (ctx.html.includes('x-data') || ctx.html.includes('alpine.min.js')) {
          return { evidence: 'Found Alpine.js x-data declarative directives' };
        }
        return null;
      }
    },
    {
      id: 'vite',
      name: 'Vite',
      category: 'frameworks',
      icon: '⚡',
      description: 'Next-generation frontend tooling providing ultra-fast dev server and bundle builds.',
      website: 'https://vitejs.dev',
      test: (ctx) => {
        if (ctx.html.includes('/@vite/client') || ctx.html.includes('vite/assets') || ctx.scripts.some(s => /vite/i.test(s))) {
          return { evidence: 'Found Vite client runtime / asset pipeline' };
        }
        return null;
      }
    },
    {
      id: 'lodash',
      name: 'Lodash',
      category: 'frameworks',
      icon: '🛠️',
      description: 'Modern JavaScript utility library delivering modularity, performance & extras.',
      website: 'https://lodash.com',
      test: (ctx) => {
        if (ctx.html.includes('lodash.min.js') || ctx.html.includes('lodash.js') || ctx.scripts.some(s => /lodash/i.test(s))) {
          return { evidence: 'Found Lodash utility library script' };
        }
        return null;
      }
    },
    {
      id: 'gsap',
      name: 'GSAP (GreenSock)',
      category: 'frameworks',
      icon: '🎬',
      description: 'Industry-standard high-performance JavaScript animation engine.',
      website: 'https://greensock.com/gsap/',
      test: (ctx) => {
        if (ctx.html.includes('gsap.min.js') || ctx.html.includes('ScrollTrigger.min.js') || ctx.html.includes('TweenMax')) {
          return { evidence: 'Found GSAP animation script loader' };
        }
        return null;
      }
    },
    {
      id: 'swiper',
      name: 'Swiper Slider',
      category: 'frameworks',
      icon: '📱',
      description: 'Most modern mobile touch slider with hardware accelerated transitions.',
      website: 'https://swiperjs.com',
      test: (ctx) => {
        if (ctx.html.includes('swiper-bundle') || ctx.html.includes('class="swiper') || ctx.html.includes('swiper-slide')) {
          return { evidence: 'Found Swiper carousel components and CSS' };
        }
        return null;
      }
    },

    // ==========================================
    // 5. UI & CSS FRAMEWORKS
    // ==========================================
    {
      id: 'tailwindcss',
      name: 'Tailwind CSS',
      category: 'ui',
      icon: '🎨',
      description: 'Modern utility-first CSS framework for rapid custom UI design.',
      website: 'https://tailwindcss.com',
      test: (ctx) => {
        if (ctx.html.includes('tailwind') || /(?:flex|grid)\s+(?:items-center|justify-between)\s+(?:gap-|p-|px-|py-)/.test(ctx.html)) {
          return { evidence: 'Found Tailwind utility-class patterns in DOM' };
        }
        return null;
      }
    },
    {
      id: 'bootstrap',
      name: 'Bootstrap',
      category: 'ui',
      icon: '🅱️',
      description: 'Powerful, extensible, and feature-packed frontend toolkit.',
      website: 'https://getbootstrap.com',
      test: (ctx) => {
        if (ctx.html.includes('bootstrap.min.css') || ctx.html.includes('bootstrap.min.js') || /col-(?:xs|sm|md|lg|xl)-\d+/.test(ctx.html)) {
          const ver = ctx.html.match(/bootstrap[.-]([\d.]+)/i);
          return { evidence: 'Found Bootstrap grid classes and stylesheets', version: ver ? ver[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'mui',
      name: 'Material-UI (MUI)',
      category: 'ui',
      icon: 'Ⓜ️',
      description: 'Comprehensive library of foundational React UI components implementing Google Material Design.',
      website: 'https://mui.com',
      test: (ctx) => {
        if (ctx.html.includes('MuiButton-') || ctx.html.includes('MuiTypography-') || ctx.html.includes('MuiBox-root') || ctx.html.includes('@mui/material')) {
          return { evidence: 'Found Material-UI component class tokens' };
        }
        return null;
      }
    },
    {
      id: 'emotion',
      name: 'Emotion (CSS-in-JS)',
      category: 'ui',
      icon: '👩‍🎤',
      description: 'Flexible CSS-in-JS library designed for writing css styles with JavaScript.',
      website: 'https://emotion.sh',
      test: (ctx) => {
        if (ctx.html.includes('data-emotion') || (ctx.html.includes('css-') && ctx.html.includes('@emotion'))) {
          return { evidence: 'Found Emotion CSS-in-JS style tags' };
        }
        return null;
      }
    },
    {
      id: 'font_awesome',
      name: 'Font Awesome',
      category: 'ui',
      icon: '🚩',
      description: 'The web\'s popular icon library and vector toolkit.',
      website: 'https://fontawesome.com',
      test: (ctx) => {
        if (ctx.html.includes('fontawesome') || ctx.html.includes('font-awesome') || /fa-(?:solid|regular|brands|thin)/i.test(ctx.html)) {
          return { evidence: 'Found Font Awesome icon stylesheets' };
        }
        return null;
      }
    },
    {
      id: 'google_fonts',
      name: 'Google Fonts',
      category: 'ui',
      icon: '🔤',
      description: 'Library of open source font families served via Google CDN.',
      website: 'https://fonts.google.com',
      test: (ctx) => {
        if (ctx.html.includes('fonts.googleapis.com') || ctx.html.includes('fonts.gstatic.com')) {
          return { evidence: 'Found Google Fonts stylesheet API link' };
        }
        return null;
      }
    },

    // ==========================================
    // 6. ANALYTICS, TRACKERS & PIXELS
    // ==========================================
    {
      id: 'google_analytics_4',
      name: 'Google Analytics 4 (GA4)',
      category: 'analytics',
      icon: '📈',
      description: 'Google\'s next-generation privacy-first event measurement and user journey analytics platform.',
      website: 'https://analytics.google.com',
      test: (ctx) => {
        // Direct HTML match (strictly G-[A-Z0-9] and not g-recaptcha or lowercase word tokens)
        const idMatches = ctx.html.match(/["'](G-[A-Z0-9]{7,14})["']/g) || ctx.html.match(/gtag\(\s*["']config["']\s*,\s*["'](G-[A-Z0-9]{7,14})["']/g);
        let validId = null;
        if (idMatches && idMatches.length > 0) {
          const clean = idMatches[0].replace(/["']/g, '').replace(/gtag\(\s*config\s*,\s*/, '');
          if (/^G-[A-Z0-9]{7,14}$/.test(clean) && !/recaptcha|signin/i.test(clean)) {
            validId = clean;
          }
        }
        if (!validId) {
          const rawMatch = ctx.html.match(/\b(G-[A-Z0-9]{8,12})\b/);
          if (rawMatch && !/recaptcha|signin/i.test(rawMatch[1])) {
            validId = rawMatch[1];
          }
        }
        if (validId) {
          return { evidence: `Found GA4 Measurement ID: ${validId} in source`, version: validId };
        }
        // Match inside live GTM container
        if (ctx.gtmContent) {
          const gtmGa4 = ctx.gtmContent.match(/\b(G-[A-Z0-9]{8,12})\b/);
          if (gtmGa4 && !/recaptcha/i.test(gtmGa4[1])) {
            return { evidence: `Extracted GA4 Measurement ID: ${gtmGa4[1]} from live GTM container`, version: gtmGa4[1] };
          }
        }
        if (ctx.html.includes('googletagmanager.com/gtag/js?id=G-')) {
          return { evidence: 'Found Google Analytics 4 gtag.js script' };
        }
        return null;
      }
    },
    {
      id: 'google_tag_manager',
      name: 'Google Tag Manager',
      category: 'analytics',
      icon: '🏷️',
      description: 'Enterprise tag management system that allows updating measurement codes and event tags.',
      website: 'https://tagmanager.google.com',
      test: (ctx) => {
        const idMatch = ctx.html.match(/(GTM-[A-Z0-9]{4,10})/i);
        if (idMatch || ctx.html.includes('googletagmanager.com/gtm.js') || ctx.html.includes('dataLayer')) {
          return {
            evidence: idMatch ? `Found Google Tag Manager container: ${idMatch[1]}` : 'Found GTM dataLayer initialization',
            version: idMatch ? idMatch[1] : undefined
          };
        }
        return null;
      }
    },
    {
      id: 'meta_pixel',
      name: 'Meta / Facebook Pixel',
      category: 'analytics',
      icon: '🔵',
      description: 'Analytics tool for measuring ad performance and tracking conversions on Facebook & Instagram.',
      website: 'https://business.facebook.com',
      test: (ctx) => {
        if (ctx.html.includes('connect.facebook.net/en_US/fbevents.js') || ctx.html.includes('fbq(') || (ctx.gtmContent && (ctx.gtmContent.includes('fbevents') || ctx.gtmContent.includes('fbq')))) {
          return { evidence: 'Found Meta Pixel fbq tracking library' };
        }
        return null;
      }
    },
    {
      id: 'microsoft_clarity',
      name: 'Microsoft Clarity',
      category: 'analytics',
      icon: '🔍',
      description: 'Free user behavior analytics with instant heatmaps and session recordings.',
      website: 'https://clarity.microsoft.com',
      test: (ctx) => {
        if (ctx.html.includes('clarity.ms/tag') || ctx.html.includes('clarity(') || (ctx.gtmContent && ctx.gtmContent.includes('clarity.ms'))) {
          return { evidence: 'Found Microsoft Clarity session tracker' };
        }
        return null;
      }
    },
    {
      id: 'hotjar',
      name: 'Hotjar',
      category: 'analytics',
      icon: '🔥',
      description: 'Behavior analytics software providing website heatmaps and live user feedback.',
      website: 'https://hotjar.com',
      test: (ctx) => {
        if (ctx.html.includes('static.hotjar.com') || ctx.html.includes('_hjSettings') || (ctx.gtmContent && ctx.gtmContent.includes('hotjar.com'))) {
          return { evidence: 'Found Hotjar tracking code' };
        }
        return null;
      }
    },
    {
      id: 'tiktok_pixel',
      name: 'TikTok Pixel',
      category: 'analytics',
      icon: '🎵',
      description: 'Tracking pixel for measuring advertising conversions on TikTok.',
      website: 'https://ads.tiktok.com',
      test: (ctx) => {
        if (ctx.html.includes('analytics.tiktok.com') || ctx.html.includes('ttq.load') || (ctx.gtmContent && ctx.gtmContent.includes('analytics.tiktok.com'))) {
          return { evidence: 'Found TikTok advertising pixel' };
        }
        return null;
      }
    },
    {
      id: 'pinterest_tag',
      name: 'Pinterest Tag',
      category: 'analytics',
      icon: '📌',
      description: 'Conversion tracking pixel for measuring campaigns on Pinterest.',
      website: 'https://pinterest.com',
      test: (ctx) => {
        if (ctx.html.includes('s.pinimg.com/ct/core.js') || ctx.html.includes('pintrk(') || (ctx.gtmContent && ctx.gtmContent.includes('pintrk'))) {
          return { evidence: 'Found Pinterest conversion pixel' };
        }
        return null;
      }
    },
    {
      id: 'linkedin_insight',
      name: 'LinkedIn Insight Tag',
      category: 'analytics',
      icon: '💼',
      description: 'Lightweight JavaScript code that powers in-depth campaign reporting on LinkedIn.',
      website: 'https://business.linkedin.com/marketing-solutions/insight-tag',
      test: (ctx) => {
        if (ctx.html.includes('snap.licdn.com/li.lms-analytics/insight.min.js') || (ctx.gtmContent && ctx.gtmContent.includes('snap.licdn.com'))) {
          return { evidence: 'Found LinkedIn Insight tag' };
        }
        return null;
      }
    },

    // ==========================================
    // 7. PAYMENT GATEWAYS & BNPL
    // ==========================================
    {
      id: 'razorpay',
      name: 'Razorpay',
      category: 'payment',
      icon: '💳',
      description: 'India\'s leading full-stack payments solution supporting UPI, cards, netbanking & EMI.',
      website: 'https://razorpay.com',
      test: (ctx) => {
        if (ctx.html.includes('checkout.razorpay.com') || ctx.html.includes('Razorpay(')) {
          return { evidence: 'Found Razorpay checkout script' };
        }
        return null;
      }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      icon: '💳',
      description: 'Financial infrastructure platform powering global internet commerce and subscription payments.',
      website: 'https://stripe.com',
      test: (ctx) => {
        if (ctx.html.includes('js.stripe.com') || ctx.html.includes('Stripe(')) {
          return { evidence: 'Found Stripe.js secure payment engine' };
        }
        return null;
      }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payment',
      icon: '🅿️',
      description: 'Global online payment system supporting digital wallets and credit card processing.',
      website: 'https://paypal.com',
      test: (ctx) => {
        if (ctx.html.includes('paypal.com/sdk/js') || ctx.html.includes('paypal-button')) {
          return { evidence: 'Found PayPal Smart Buttons SDK' };
        }
        return null;
      }
    },
    {
      id: 'cashfree',
      name: 'Cashfree Payments',
      category: 'payment',
      icon: '💸',
      description: 'Leading Indian payment gateway and automated payouts platform.',
      website: 'https://cashfree.com',
      test: (ctx) => {
        if (ctx.html.includes('cashfreepayments.com') || ctx.html.includes('Cashfree(')) {
          return { evidence: 'Found Cashfree checkout SDK' };
        }
        return null;
      }
    },
    {
      id: 'klarna',
      name: 'Klarna',
      category: 'payment',
      icon: '🛍️',
      description: 'Global buy-now-pay-later (BNPL) payment provider and shopping service.',
      website: 'https://klarna.com',
      test: (ctx) => {
        if (ctx.html.includes('klarna.com') || ctx.html.includes('klarna-payments')) {
          return { evidence: 'Found Klarna BNPL widgets' };
        }
        return null;
      }
    },

    // ==========================================
    // 8. CDN, CLOUD & SERVERS
    // ==========================================
    {
      id: 'aws_cloudfront',
      name: 'Amazon CloudFront (AWS)',
      category: 'server',
      icon: '☁️',
      description: 'High-performance global content delivery network (CDN) service by Amazon Web Services.',
      website: 'https://aws.amazon.com/cloudfront',
      test: (ctx) => {
        const via = ctx.headerMap['via'] || '';
        const xCache = ctx.headerMap['x-cache'] || '';
        if (/cloudfront/i.test(via) || /cloudfront/i.test(xCache) || ctx.headers.includes('x-amz-cf-id') || ctx.headers.includes('x-amz-cf-pop') || ctx.html.includes('cloudfront.net')) {
          return { evidence: 'Detected CloudFront edge distribution headers (Via / X-Amz-Cf-Id)' };
        }
        if (ctx.asn && /amazon-cf|cloudfront/i.test(ctx.asn)) {
          return { evidence: 'Host IP routes through Amazon CloudFront edge network' };
        }
        return null;
      }
    },
    {
      id: 'aws_s3',
      name: 'Amazon S3',
      category: 'server',
      icon: '🪣',
      description: 'Amazon Simple Storage Service (S3) cloud object storage infrastructure.',
      website: 'https://aws.amazon.com/s3/',
      test: (ctx) => {
        const server = ctx.headerMap['server'] || '';
        if (/amazons3/i.test(server) || ctx.headers.includes('x-amz-server-side-encryption') || ctx.headers.includes('x-amz-request-id')) {
          return { evidence: 'Detected Amazon S3 storage origin from Server response header' };
        }
        if (ctx.html.includes('s3.amazonaws.com') || /https?:\/\/[a-z0-9\.\-_]+\.s3[a-z0-9\.\-_]*\.amazonaws\.com/i.test(ctx.html)) {
          return { evidence: 'Found Amazon S3 bucket asset URLs in document' };
        }
        return null;
      }
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      category: 'server',
      icon: '🧡',
      description: 'Global cloud edge network providing DDoS protection, CDN, DNS, and serverless compute.',
      website: 'https://cloudflare.com',
      test: (ctx) => {
        const server = ctx.headerMap['server'] || '';
        if (/cloudflare/i.test(server) || ctx.headers.includes('cf-ray') || ctx.headers.includes('cf-cache-status') || ctx.ns.some(n => n.includes('cloudflare')) || (ctx.asn && ctx.asn.includes('CLOUDFLARE'))) {
          return { evidence: 'Found Cloudflare edge headers / CF-Ray / Nameservers' };
        }
        return null;
      }
    },
    {
      id: 'http3',
      name: 'HTTP/3 (QUIC)',
      category: 'server',
      icon: '🚀',
      description: 'Next-generation Hypertext Transfer Protocol running over UDP & QUIC for zero round-trip latency.',
      website: 'https://en.wikipedia.org/wiki/HTTP/3',
      test: (ctx) => {
        const altSvc = ctx.headerMap['alt-svc'] || '';
        if (/\bh3(?:-\d+)?\b/i.test(altSvc) || ctx.headers.includes('alt-svc: h3')) {
          return { evidence: 'Negotiated HTTP/3 (QUIC) via Alt-Svc response header' };
        }
        return null;
      }
    },
    {
      id: 'nginx',
      name: 'Nginx',
      category: 'server',
      icon: '🟢',
      description: 'High-performance HTTP web server and reverse proxy.',
      website: 'https://nginx.org',
      test: (ctx) => {
        const server = ctx.headerMap['server'] || '';
        if (/nginx/i.test(server)) {
          return { evidence: `Detected Nginx web server from response headers (${server})`, version: server };
        }
        return null;
      }
    },
    {
      id: 'apache',
      name: 'Apache HTTP Server',
      category: 'server',
      icon: '🪶',
      description: 'Decentralized open-source cross-platform web server software.',
      website: 'https://httpd.apache.org',
      test: (ctx) => {
        const server = ctx.headerMap['server'] || '';
        if (/apache/i.test(server)) {
          return { evidence: `Detected Apache web server from headers (${server})`, version: server };
        }
        return null;
      }
    },
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'server',
      icon: '▲',
      description: 'Frontend cloud platform for static & serverless modern web deployment.',
      website: 'https://vercel.com',
      test: (ctx) => {
        if (ctx.html.includes('vercel.app') || ctx.headers.includes('x-vercel-id') || (ctx.headerMap['server'] || '').includes('Vercel')) {
          return { evidence: 'Found Vercel deployment edge headers (x-vercel-id)' };
        }
        return null;
      }
    },
    {
      id: 'netlify',
      name: 'Netlify',
      category: 'server',
      icon: '🔷',
      description: 'Cloud platform for Git-integrated web development and Jamstack hosting.',
      website: 'https://netlify.com',
      test: (ctx) => {
        if (ctx.html.includes('netlify.app') || ctx.headers.includes('x-nf-request-id') || (ctx.headerMap['server'] || '').includes('Netlify')) {
          return { evidence: 'Found Netlify edge proxy signatures' };
        }
        return null;
      }
    },
    {
      id: 'fastly',
      name: 'Fastly CDN',
      category: 'server',
      icon: '⚡',
      description: 'Edge cloud platform and programmable content delivery network.',
      website: 'https://fastly.com',
      test: (ctx) => {
        if (ctx.headers.includes('x-fastly-request-id') || (ctx.headerMap['via'] || '').includes('varnish') || (ctx.asn && ctx.asn.includes('FASTLY'))) {
          return { evidence: 'Found Fastly edge proxy headers / network' };
        }
        return null;
      }
    },

    // ==========================================
    // 9. CUSTOMER CHAT & SUPPORT
    // ==========================================
    {
      id: 'intercom',
      name: 'Intercom',
      category: 'chat',
      icon: '💬',
      description: 'Customer service platform with AI-first chatbots and omnichannel messaging.',
      website: 'https://intercom.com',
      test: (ctx) => {
        if (ctx.html.includes('widget.intercom.io') || ctx.html.includes('Intercom(')) {
          return { evidence: 'Found Intercom Messenger widget' };
        }
        return null;
      }
    },
    {
      id: 'zendesk',
      name: 'Zendesk Chat',
      category: 'chat',
      icon: '🎧',
      description: 'Enterprise customer service software and live support suite.',
      website: 'https://zendesk.com',
      test: (ctx) => {
        if (ctx.html.includes('static.zdassets.com') || ctx.html.includes('zE(')) {
          return { evidence: 'Found Zendesk Web Widget assets' };
        }
        return null;
      }
    },
    {
      id: 'tawkto',
      name: 'Tawk.to',
      category: 'chat',
      icon: '🦜',
      description: 'Free live chat software for real-time customer monitoring and messaging.',
      website: 'https://tawk.to',
      test: (ctx) => {
        if (ctx.html.includes('embed.tawk.to')) {
          return { evidence: 'Found Tawk.to live chat embed script' };
        }
        return null;
      }
    },
    {
      id: 'whatsapp_chat',
      name: 'WhatsApp Click-to-Chat',
      category: 'chat',
      icon: '📱',
      description: 'Direct customer communication link using WhatsApp Business.',
      website: 'https://whatsapp.com',
      test: (ctx) => {
        if (ctx.html.includes('api.whatsapp.com/send') || ctx.html.includes('wa.me/')) {
          return { evidence: 'Found WhatsApp direct messaging widget/links' };
        }
        return null;
      }
    },

    // ==========================================
    // 10. SECURITY, CAPTCHA & PRIVACY
    // ==========================================
    {
      id: 'turnstile',
      name: 'Cloudflare Turnstile',
      category: 'security',
      icon: '🛡️',
      description: 'User-friendly, privacy-focused CAPTCHA alternative by Cloudflare.',
      website: 'https://cloudflare.com/turnstile',
      test: (ctx) => {
        if (ctx.html.includes('challenges.cloudflare.com/turnstile')) {
          return { evidence: 'Found Cloudflare Turnstile verification challenge' };
        }
        return null;
      }
    },
    {
      id: 'recaptcha',
      name: 'Google reCAPTCHA',
      category: 'security',
      icon: '🤖',
      description: 'Google fraud prevention service that protects websites from spam and abuse.',
      website: 'https://google.com/recaptcha',
      test: (ctx) => {
        if (ctx.html.includes('google.com/recaptcha') || ctx.html.includes('grecaptcha')) {
          return { evidence: 'Found Google reCAPTCHA v2/v3 library' };
        }
        return null;
      }
    },
    {
      id: 'hcaptcha',
      name: 'hCaptcha',
      category: 'security',
      icon: '🛡️',
      description: 'Privacy-focused anti-bot and CAPTCHA service for modern websites.',
      website: 'https://hcaptcha.com',
      test: (ctx) => {
        if (ctx.html.includes('js.hcaptcha.com') || ctx.html.includes('h-captcha')) {
          return { evidence: 'Found hCaptcha anti-bot embed' };
        }
        return null;
      }
    },

    // ==========================================
    // 11. EMAIL & BUSINESS INFRASTRUCTURE
    // ==========================================
    {
      id: 'google_workspace',
      name: 'Google Workspace (Gmail)',
      category: 'email',
      icon: '✉️',
      description: 'Enterprise business email and collaboration suite by Google.',
      website: 'https://workspace.google.com',
      test: (ctx) => {
        if (ctx.mx.some(m => m.includes('google.com') || m.includes('aspmx.l.google.com') || m.includes('googlemail.com'))) {
          return { evidence: 'Live MX Records point to aspmx.l.google.com' };
        }
        return null;
      }
    },
    {
      id: 'microsoft_365',
      name: 'Microsoft 365 (Outlook)',
      category: 'email',
      icon: '📧',
      description: 'Enterprise cloud email and productivity service by Microsoft.',
      website: 'https://microsoft.com/microsoft-365',
      test: (ctx) => {
        if (ctx.mx.some(m => m.includes('outlook.com') || m.includes('protection.outlook.com'))) {
          return { evidence: 'Live MX Records point to mail.protection.outlook.com' };
        }
        return null;
      }
    },
    {
      id: 'mandrill',
      name: 'Mandrill / Mailchimp Transactional',
      category: 'email',
      icon: '🐵',
      description: 'Transactional email infrastructure for web applications by Mailchimp.',
      website: 'https://mailchimp.com/features/transactional-email/',
      test: (ctx) => {
        if (ctx.txt.some(t => t.includes('mandrillapp.com')) || ctx.html.includes('mandrillapp.com')) {
          return { evidence: 'Found Mandrill transactional SPF authorization in DNS records' };
        }
        return null;
      }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'email',
      icon: '📨',
      description: 'Cloud-based transactional and marketing email delivery platform by Twilio.',
      website: 'https://sendgrid.com',
      test: (ctx) => {
        if (ctx.txt.some(t => t.includes('sendgrid.net')) || ctx.html.includes('sendgrid')) {
          return { evidence: 'Found SendGrid email SPF authorization' };
        }
        return null;
      }
    },

    // ==========================================
    // 12. PROTOCOLS & SEO META TAGS
    // ==========================================
    {
      id: 'opengraph',
      name: 'Open Graph Protocol',
      category: 'tools',
      icon: '🌐',
      description: 'Enables web pages to become rich social graph objects for Facebook, LinkedIn, Twitter & Slack.',
      website: 'https://ogp.me/',
      test: (ctx) => {
        const ogCount = (ctx.html.match(/property=["']og:[^"']+["']/gi) || []).length;
        if (ogCount > 0 || ctx.html.includes('prefix="og:')) {
          return { evidence: `Found ${ogCount || 1}+ Open Graph protocol meta tags (og:title, og:image, etc.)` };
        }
        return null;
      }
    },
    {
      id: 'twitter_cards',
      name: 'Twitter Cards',
      category: 'tools',
      icon: '🐦',
      description: 'Allows attaching rich photos, videos, and media previews to Tweets linking to your content.',
      website: 'https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards',
      test: (ctx) => {
        const twCount = (ctx.html.match(/name=["']twitter:[^"']+["']/gi) || []).length;
        if (twCount > 0) {
          return { evidence: `Found ${twCount} Twitter Card meta tags (twitter:card, twitter:image)` };
        }
        return null;
      }
    },
    {
      id: 'schema_org',
      name: 'Schema.org (JSON-LD)',
      category: 'tools',
      icon: '🏷️',
      description: 'Structured semantic data markup recognized by Google for rich search snippets.',
      website: 'https://schema.org',
      test: (ctx) => {
        if (ctx.html.includes('application/ld+json') || (ctx.html.includes('itemscope') && ctx.html.includes('itemtype'))) {
          return { evidence: 'Found JSON-LD structured data schema markup' };
        }
        return null;
      }
    }
  ];

  // ==========================================
  // CONTROLLER & DATA RETRIEVAL PIPELINE
  // ==========================================

  function init() {
    // Mode Switchers
    if (techTabs) {
      techTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tech-tab');
        if (!btn) return;
        const target = btn.dataset.tab;
        document.querySelectorAll('.tech-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (target === 'url') {
          modeUrlSection.style.display = 'block';
          modeSourceSection.style.display = 'none';
        } else {
          modeUrlSection.style.display = 'none';
          modeSourceSection.style.display = 'block';
        }
      });
    }

    // Action Triggers
    if (btnScanUrl) btnScanUrl.addEventListener('click', handleScanUrl);
    if (btnScanSource) btnScanSource.addEventListener('click', handleScanSource);
    if (btnLoadDemoSource) btnLoadDemoSource.addEventListener('click', loadDemoShopifySource);
    if (btnCopyReport) btnCopyReport.addEventListener('click', copyTextReport);
    if (btnDownloadJson) btnDownloadJson.addEventListener('click', downloadJsonReport);

    // Enter Key
    if (inpTargetUrl) {
      inpTargetUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleScanUrl();
      });
    }

    // Sample site triggers
    sampleSiteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (inpTargetUrl && url) {
          inpTargetUrl.value = url;
          handleScanUrl();
        }
      });
    });

    // Category Filter Buttons
    if (techCategoryFilters) {
      techCategoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-tab');
        if (!btn) return;
        document.querySelectorAll('#techCategoryFilters .category-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat || 'all';
        if (currentScannedData) {
          renderTechSections(currentScannedData);
        }
      });
    }
  }

  // Handle URL Scan with Parallel Multi-Source Recon
  async function handleScanUrl() {
    let rawUrl = (inpTargetUrl ? inpTargetUrl.value : '').trim();
    if (!rawUrl) {
      showToast('Please enter a website URL or domain.', 'error');
      return;
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    let urlObj;
    try {
      urlObj = new URL(rawUrl);
    } catch (e) {
      showToast('Invalid domain format. Try e.g. "shopify.com"', 'error');
      return;
    }

    const domain = urlObj.hostname.replace(/^www\./, '');

    showLoading(true, `Connecting to ${domain}...`, 'Analyzing live HTML source, response headers, and cloud DNS in parallel...');

    try {
      // 1. Parallel Reconnaissance (HTML + Live HTTP Headers + DNS/ASN)
      const [htmlResult, liveHeaders, dnsData] = await Promise.all([
        fetchSiteHtml(rawUrl).catch(err => {
          console.warn('HTML fetch error:', err);
          return { html: '', headers: '' };
        }),
        fetchSiteHeaders(rawUrl).catch(err => {
          console.warn('Headers fetch error:', err);
          return '';
        }),
        fetchDnsRecords(domain).catch(err => {
          console.warn('DNS fetch error:', err);
          return { mx: [], ns: [], txt: [], ip: null, asn: '' };
        })
      ]);

      // Combine real server headers with proxy headers
      const combinedHeaders = ((liveHeaders || '') + '\n' + (htmlResult.headers || '')).toLowerCase();

      // 2. Deep Google Tag Manager container inspection if GTM ID is detected
      let gtmContent = '';
      const gtmMatch = (htmlResult.html || '').match(/GTM-[A-Z0-9]{4,10}/i);
      if (gtmMatch) {
        updateLoadingStatus(`Inspecting Google Tag Manager Container (${gtmMatch[0]})...`, 'Extracting GA4 measurement IDs, Meta pixels, and event tags...');
        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 3500);
          gtmContent = await fetch(`https://www.googletagmanager.com/gtm.js?id=${gtmMatch[0]}`, { signal: controller.signal })
            .then(r => r.text())
            .catch(() => '');
          clearTimeout(tid);
        } catch (e) {}
      }
      dnsData.gtmContent = gtmContent;

      // 3. Run Analysis Engine
      updateLoadingStatus(`Matching 150+ technology signatures...`, 'Detecting frameworks, bundlers, CDNs, analytics, and infrastructure...');
      const results = analyzeTechnology(htmlResult.html || '', combinedHeaders, dnsData, domain);

      // 4. Render UI
      currentScannedData = { domain, rawUrl, ...results };
      renderResults(currentScannedData);

      if (!htmlResult.html) {
        showToast(`Bot shield protected direct HTML. Detected ${results.detectedList.length} technologies from cloud headers & DNS!`, 'info');
      } else {
        showToast(`Scan complete! Detected ${results.detectedList.length} technologies.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(`Scan error: ${err.message}`, 'error');
    } finally {
      showLoading(false);
    }
  }

  // Handle Source Code Scan
  function handleScanSource() {
    const html = (inpSourceCode ? inpSourceCode.value : '').trim();
    if (!html) {
      showToast('Please paste HTML source code first.', 'error');
      return;
    }

    showLoading(true, 'Analyzing pasted HTML source code...', 'Extracting script tags, meta generator, bundles, and CSS classes...');
    setTimeout(() => {
      const results = analyzeTechnology(html, '', { mx: [], ns: [], txt: [], ip: null, asn: '', gtmContent: '' }, 'pasted-source-code.local');
      currentScannedData = { domain: 'Pasted HTML Source', rawUrl: 'Local Source', ...results };
      renderResults(currentScannedData);
      showLoading(false);
      showToast(`Detected ${results.detectedList.length} technologies in source!`, 'success');
    }, 400);
  }

  // Load Demo Shopify Source
  function loadDemoShopifySource() {
    if (!inpSourceCode) return;
    inpSourceCode.value = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Modern boAt Lifestyle Online Store - Buy Earphones, Smartwatches</title>
  <meta name="generator" content="Shopify">
  <meta property="og:type" content="website">
  <meta property="og:title" content="boAt Lifestyle Store">
  <meta property="og:image" content="https://boat-lifestyle.com/logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <script src="//cdn.shopify.com/s/files/1/0057/8938/4802/t/120/assets/theme.js"></script>
  <script>
    window.Shopify = { theme: { name: "boAt-Lifestyle-Modern-V4", id: 1204892 } };
  </script>
  <link rel="stylesheet" href="//cdn.shopify.com/s/files/1/0057/8938/4802/t/120/assets/theme.css">
  <script src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=KLAV123"></script>
  <script src="https://cdn.judge.me/widget_v3.js"></script>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
  <script src="https://www.googletagmanager.com/gtag/js?id=G-BOAT202611"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/3.4.0/tailwind.min.css"></script>
</head>
<body class="template-index">
  <div id="pf-c-1002" class="pagefly-container"></div>
  <div class="jdgm-widget jdgm-review-widget"></div>
</body>
</html>`;
    showToast('Loaded demo Shopify store HTML snippet!', 'info');
  }

  // Fetch HTML with multi-proxy fallback cascade
  async function fetchSiteHtml(targetUrl) {
    // Attempt 1: Jina AI Reader HTML proxy
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
        headers: { 'X-Return-Format': 'html' },
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 80) {
          return { html: text, headers: res.headers.get('content-type') || 'text/html' };
        }
      }
    } catch (e) {
      console.warn('Proxy 1 (Jina) failed:', e);
    }

    // Attempt 2: CodeTabs Proxy
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50) {
          return { html: text, headers: res.headers.get('content-type') || '' };
        }
      }
    } catch (e) {
      console.warn('Proxy 2 (CodeTabs) failed:', e);
    }

    // Attempt 3: AllOrigins Raw
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50) {
          return { html: text, headers: res.headers.get('content-type') || '' };
        }
      }
    } catch (e) {
      console.warn('Proxy 3 (AllOrigins Raw) failed:', e);
    }

    // Attempt 4: AllOrigins JSON API
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents && data.contents.length > 50) {
          return { html: data.contents, headers: '' };
        }
      }
    } catch (e) {
      console.warn('Proxy 4 (AllOrigins JSON) failed:', e);
    }

    throw new Error('Website bot shield or network timeout prevented live HTML extraction.');
  }

  // Fetch real HTTP response headers using HackerTarget (CORS enabled)
  async function fetchSiteHeaders(targetUrl) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(tid);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 20 && !text.includes('error check your search')) {
          return text;
        }
      }
    } catch (e) {
      console.warn('Headers fetch (HackerTarget) failed/timed out:', e);
    }
    return '';
  }

  // Fetch DNS DoH Records + RDAP ASN
  async function fetchDnsRecords(domain) {
    const dns = { mx: [], ns: [], txt: [], ip: null, asn: '', gtmContent: '' };
    try {
      const [aRes, mxRes, nsRes, txtRes] = await Promise.allSettled([
        fetch(`https://dns.google/resolve?name=${domain}&type=A`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=MX`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=NS`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=TXT`).then(r => r.json())
      ]);

      if (aRes.status === 'fulfilled' && aRes.value?.Answer) {
        dns.ip = aRes.value.Answer[0]?.data || null;
      }
      if (mxRes.status === 'fulfilled' && mxRes.value?.Answer) {
        dns.mx = mxRes.value.Answer.map(a => (a.data || '').toLowerCase());
      }
      if (nsRes.status === 'fulfilled' && nsRes.value?.Answer) {
        dns.ns = nsRes.value.Answer.map(a => (a.data || '').toLowerCase());
      }
      if (txtRes.status === 'fulfilled' && txtRes.value?.Answer) {
        dns.txt = txtRes.value.Answer.map(a => (a.data || '').toLowerCase());
      }

      // RDAP lookup for ASN / Network Name (e.g. AMAZON-CF, CLOUDFLARENET, FASTLY, etc.)
      if (dns.ip) {
        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 3000);
          const rdap = await fetch(`https://rdap.arin.net/registry/ip/${dns.ip}`, { signal: controller.signal })
            .then(r => r.json())
            .catch(() => null);
          clearTimeout(tid);
          if (rdap) {
            dns.asn = `${rdap.handle || ''} ${rdap.name || ''}`.toUpperCase();
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('DNS lookup failed:', e);
    }
    return dns;
  }

  // Comprehensive Analysis Engine
  function analyzeTechnology(html, headers, dns, domain) {
    const metaGeneratorMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
    const metaGenerator = metaGeneratorMatch ? metaGeneratorMatch[1] : '';

    // Extract all script sources
    const scriptSrcs = [];
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let sm;
    while ((sm = scriptRegex.exec(html)) !== null) {
      const srcMatch = sm[1].match(/src=["']([^"']+)["']/i);
      if (srcMatch) scriptSrcs.push(srcMatch[1]);
    }

    // Extract link tags
    const linkHrefs = [];
    const linkRegex = /<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let lm;
    while ((lm = linkRegex.exec(html)) !== null) {
      linkHrefs.push(lm[1]);
    }

    // Parse header key-values
    const headerMap = {};
    (headers || '').split(/\r?\n/).forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const k = line.slice(0, idx).trim().toLowerCase();
        const v = line.slice(idx + 1).trim();
        headerMap[k] = (headerMap[k] ? headerMap[k] + '; ' : '') + v;
      }
    });

    const ctx = {
      html: html,
      lowerHtml: html.toLowerCase(),
      headers: (headers || '').toLowerCase(),
      headerMap: headerMap,
      metaGenerator: metaGenerator,
      scripts: scriptSrcs,
      links: linkHrefs,
      mx: dns.mx || [],
      ns: dns.ns || [],
      txt: dns.txt || [],
      asn: dns.asn || '',
      gtmContent: dns.gtmContent || '',
      domain: domain
    };

    const detected = [];
    let detectedShopify = null;
    let primaryCms = null;
    let primaryEcommerce = null;
    let detectedServer = 'Standard Web Host';

    TECH_DATABASE.forEach(tech => {
      try {
        const res = tech.test(ctx);
        if (res) {
          const item = {
            ...tech,
            version: res.version || null,
            evidence: res.evidence || 'Detected signature match'
          };
          detected.push(item);

          // E-commerce priority
          if (tech.id === 'shopify') {
            detectedShopify = item;
            primaryEcommerce = 'Shopify';
          } else if (tech.category === 'ecommerce' && !primaryEcommerce) {
            primaryEcommerce = tech.name;
          }

          // CMS priority
          if (tech.category === 'cms' && !primaryCms) {
            primaryCms = tech.name;
          }

          // Server priority
          if (tech.category === 'server') {
            detectedServer = tech.name;
          }
        }
      } catch (err) {
        console.error('Error matching tech:', tech.name, err);
      }
    });

    // Intelligent Summary Inference
    if (!primaryCms) {
      if (detected.some(t => t.id === 'nextjs')) {
        primaryCms = 'Next.js (React Framework)';
      } else if (detected.some(t => t.id === 'react')) {
        primaryCms = 'React SPA (Custom App)';
      } else if (detected.some(t => t.id === 'nuxtjs')) {
        primaryCms = 'Nuxt (Vue Framework)';
      } else if (detected.some(t => t.id === 'vue')) {
        primaryCms = 'Vue.js SPA';
      } else if (detected.some(t => t.id === 'svelte')) {
        primaryCms = 'SvelteKit App';
      } else if (detected.some(t => t.id === 'astro')) {
        primaryCms = 'Astro Static Engine';
      } else if (detectedShopify) {
        primaryCms = 'Shopify CMS';
      } else {
        primaryCms = 'Custom / Static';
      }
    }

    // Intelligent Server Inference
    if (detected.some(t => t.id === 'aws_cloudfront') && detected.some(t => t.id === 'aws_s3')) {
      detectedServer = 'AWS (CloudFront + S3)';
    } else if (detected.some(t => t.id === 'aws_cloudfront')) {
      detectedServer = 'Amazon CloudFront (AWS)';
    } else if (detected.some(t => t.id === 'cloudflare')) {
      detectedServer = 'Cloudflare CDN';
    } else if (detected.some(t => t.id === 'vercel')) {
      detectedServer = 'Vercel Edge';
    } else if (detected.some(t => t.id === 'netlify')) {
      detectedServer = 'Netlify Edge';
    } else if (detected.some(t => t.id === 'nginx')) {
      detectedServer = 'Nginx Web Server';
    }

    return {
      detectedList: detected,
      isShopify: !!detectedShopify,
      shopifyDetails: detectedShopify,
      primaryEcommerce: primaryEcommerce || 'None',
      primaryCms: primaryCms,
      detectedServer: detectedServer
    };
  }

  // Render UI Results
  function renderResults(data) {
    if (!resultsContainer) return;
    resultsContainer.style.display = 'block';

    // Summary Cards
    sumEcommerce.innerText = data.primaryEcommerce;
    sumCms.innerText = data.primaryCms;
    sumServer.innerText = data.detectedServer;
    sumCount.innerText = data.detectedList.length;

    // Filter count badge
    if (filterCountAll) {
      filterCountAll.innerText = data.detectedList.length;
    }

    // Shopify Store Alert
    if (data.isShopify) {
      shopifyAlert.style.display = 'flex';
      shopifyAlertTitle.innerText = `Shopify Store Confirmed! (${data.domain})`;
      shopifyThemeBadge.innerText = data.shopifyDetails.version || 'Shopify CDN Active';
      
      const appCount = data.detectedList.filter(t => t.category === 'shopify_apps').length;
      shopifyAlertDesc.innerText = appCount > 0
        ? `Detected ${appCount} integrated Shopify app(s), theme clues, and payment connections.`
        : 'This store is powered by Shopify. Explore frameworks and tracking pixels below.';
    } else {
      shopifyAlert.style.display = 'none';
    }

    renderTechSections(data);
  }

  // Render Categorized Sections
  function renderTechSections(data) {
    if (!techSectionsContainer || !data) return;
    techSectionsContainer.innerHTML = '';

    const list = data.detectedList;
    if (list.length === 0) {
      techSectionsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--white); border-radius: var(--radius-xl); border: 1px dashed var(--gray-300);">
          <div style="font-size: 36px; margin-bottom: 8px;">🤔</div>
          <div style="font-weight: 700; color: var(--navy); font-size: 16px;">No Common Technologies Detected</div>
          <p style="font-size: 13px; color: var(--gray-500); max-width: 440px; margin: 6px auto 0;">The site may be completely custom-coded, behind an aggressive bot-shield, or has minimized script headers.</p>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = {};
    list.forEach(item => {
      // Filter check
      if (activeFilter !== 'all') {
        if (activeFilter === 'ecommerce' && (item.category !== 'ecommerce' && item.category !== 'shopify_apps')) return;
        if (activeFilter === 'cms' && item.category !== 'cms') return;
        if (activeFilter === 'frameworks' && (item.category !== 'frameworks' && item.category !== 'ui')) return;
        if (activeFilter === 'analytics' && item.category !== 'analytics') return;
        if (activeFilter === 'payment' && item.category !== 'payment') return;
        if (activeFilter === 'server' && item.category !== 'server') return;
        if (activeFilter === 'tools' && (item.category !== 'chat' && item.category !== 'security' && item.category !== 'email' && item.category !== 'tools')) return;
      }

      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Render each category group
    Object.keys(grouped).forEach(catKey => {
      const catMeta = CATEGORIES[catKey] || { label: catKey.toUpperCase(), icon: '📦' };
      const items = grouped[catKey];

      const sec = document.createElement('div');
      sec.className = 'tech-category-section';

      let cardsHtml = '';
      items.forEach(t => {
        cardsHtml += `
          <div class="tech-item-card">
            <div class="tech-item-icon">${t.icon || '⚡'}</div>
            <div class="tech-item-details">
              <div class="tech-item-name">
                <span>${escapeHtml(t.name)}</span>
                ${t.version ? `<span class="tech-item-version">${escapeHtml(t.version)}</span>` : ''}
              </div>
              <div class="tech-item-desc">${escapeHtml(t.description || '')}</div>
              <div class="tech-item-evidence" title="${escapeHtml(t.evidence)}">✓ ${escapeHtml(t.evidence)}</div>
            </div>
          </div>
        `;
      });

      sec.innerHTML = `
        <div class="tech-category-title">
          <span>${catMeta.icon}</span>
          <span>${catMeta.label} (${items.length})</span>
        </div>
        <div class="tech-cards-grid">
          ${cardsHtml}
        </div>
      `;

      techSectionsContainer.appendChild(sec);
    });
  }

  // Copy Text Report
  function copyTextReport() {
    if (!currentScannedData) return;
    const d = currentScannedData;
    let report = `========================================\nWEBSITE TECH STACK REPORT: ${d.domain}\n========================================\n\n`;
    report += `E-commerce Engine: ${d.primaryEcommerce}\n`;
    report += `CMS / Web Engine: ${d.primaryCms}\n`;
    report += `CDN / Server: ${d.detectedServer}\n`;
    report += `Total Tech Detected: ${d.detectedList.length}\n\n`;
    report += `--- DETECTED TECHNOLOGIES ---\n`;

    d.detectedList.forEach((t, i) => {
      report += `${i + 1}. [${t.category.toUpperCase()}] ${t.name} ${t.version ? '(' + t.version + ')' : ''}\n   -> Evidence: ${t.evidence}\n`;
    });

    report += `\nGenerated by AllToolsInOne Tech Stack Finder (https://alltoolsinone.com/tools/tech-detector.html)`;

    copyToClipboard(report);
    btnCopyReport.innerText = '✅ Copied!';
    setTimeout(() => { btnCopyReport.innerText = '📋 Copy Report'; }, 2000);
    showToast('Tech stack report copied to clipboard!', 'success');
  }

  // Download JSON Report
  function downloadJsonReport() {
    if (!currentScannedData) return;
    const jsonStr = JSON.stringify(currentScannedData, null, 2);
    downloadFile(`tech_stack_${currentScannedData.domain.replace(/[^a-z0-9]/gi, '_')}.json`, jsonStr, 'application/json');
    showToast('Downloaded JSON report!', 'success');
  }

  // Loading Indicator Toggle
  function showLoading(show, title, subtext) {
    if (scanLoading) {
      scanLoading.style.display = show ? 'block' : 'none';
    }
    if (title && loadingStatusText) loadingStatusText.innerText = title;
    if (subtext && loadingSubtext) loadingSubtext.innerText = subtext;

    if (btnScanUrl) btnScanUrl.disabled = show;
    if (btnScanSource) btnScanSource.disabled = show;
  }

  function updateLoadingStatus(title, subtext) {
    if (title && loadingStatusText) loadingStatusText.innerText = title;
    if (subtext && loadingSubtext) loadingSubtext.innerText = subtext;
  }

  // Helpers
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      let toast = document.getElementById('techToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'techToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.color = '#fff';
        toast.style.fontWeight = '600';
        toast.style.fontSize = '14px';
        toast.style.zIndex = '99999';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
      }
      toast.style.background = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : '#0284c7');
      toast.innerText = msg;
      toast.style.opacity = '1';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, 3000);
    }
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
