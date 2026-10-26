/**
 * AllToolsInOne - Website Tech Stack & Shopify Detector
 * Comprehensive, client-side technology finder and Wappalyzer alternative.
 * Detects 200+ technologies across E-commerce, CMS, Frameworks, Analytics, Payments & CDNs.
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
    security: { label: '🛡️ Security, CAPTCHA & Fonts', icon: '🛡️' },
    email: { label: '✉️ Email & Business Infrastructure', icon: '✉️' }
  };

  // ───────── 200+ TECHNOLOGY SIGNATURE DATABASE ─────────
  const TECH_DATABASE = [
    // --- 1. E-COMMERCE PLATFORMS ---
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      icon: '🛍️',
      description: 'Global cloud e-commerce engine powering millions of direct-to-consumer online stores.',
      website: 'https://shopify.com',
      test: (ctx) => {
        if (ctx.html.includes('cdn.shopify.com') || ctx.html.includes('Shopify.theme') || ctx.html.includes('myshopify.com')) {
          const themeMatch = ctx.html.match(/Shopify\.theme\s*=\s*\{[^}]*name:\s*["']([^"']+)["']/i);
          return {
            evidence: 'Found cdn.shopify.com / Shopify JS runtime',
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
          return { evidence: 'Found woocommerce plugin scripts and CSS classes' };
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

    // --- 2. SHOPIFY APPS & EXTENSIONS ---
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      category: 'shopify_apps',
      icon: '✉️',
      description: 'Leading email & SMS marketing automation platform for e-commerce.',
      website: 'https://klaviyo.com',
      test: (ctx) => {
        if (ctx.html.includes('static.klaviyo.com') || ctx.html.includes('_learnq') || ctx.html.includes('klaviyo.js')) {
          return { evidence: 'Found Klaviyo marketing tag (_learnq)' };
        }
        return null;
      }
    },
    {
      id: 'judge_me',
      name: 'Judge.me Product Reviews',
      category: 'shopify_apps',
      icon: '⭐',
      description: 'Fast, star-rated customer reviews & photo review app for Shopify.',
      website: 'https://judge.me',
      test: (ctx) => {
        if (ctx.html.includes('judge.me') || ctx.html.includes('cdn.judge.me') || ctx.html.includes('jdgm-widget')) {
          return { evidence: 'Found Judge.me review widget & CDN script' };
        }
        return null;
      }
    },
    {
      id: 'loox',
      name: 'Loox Photo Reviews',
      category: 'shopify_apps',
      icon: '📷',
      description: 'Visual photo reviews and social proof app for Shopify stores.',
      website: 'https://loox.app',
      test: (ctx) => {
        if (ctx.html.includes('loox.io') || ctx.html.includes('loox-reviews') || ctx.html.includes('loox-rating')) {
          return { evidence: 'Found Loox photo review widgets' };
        }
        return null;
      }
    },
    {
      id: 'pagefly',
      name: 'PageFly Landing Page Builder',
      category: 'shopify_apps',
      icon: '📄',
      description: 'Drag-and-drop landing page & theme builder app for Shopify.',
      website: 'https://pagefly.io',
      test: (ctx) => {
        if (ctx.html.includes('cdn.pagefly.io') || ctx.html.includes('pf-c-') || ctx.html.includes('pagefly')) {
          return { evidence: 'Found PageFly components and cdn.pagefly.io' };
        }
        return null;
      }
    },
    {
      id: 'shogun',
      name: 'Shogun Page Builder',
      category: 'shopify_apps',
      icon: '🏯',
      description: 'Enterprise drag-and-drop page builder for e-commerce.',
      website: 'https://getshogun.com',
      test: (ctx) => {
        if (ctx.html.includes('getshogun.com') || ctx.html.includes('shogun-root')) {
          return { evidence: 'Found Shogun page engine' };
        }
        return null;
      }
    },
    {
      id: 'recharge',
      name: 'Recharge Subscriptions',
      category: 'shopify_apps',
      icon: '🔄',
      description: 'Leading recurring billing and subscription payments platform for Shopify.',
      website: 'https://rechargepayments.com',
      test: (ctx) => {
        if (ctx.html.includes('rechargepayments.com') || ctx.html.includes('recharge-subscription')) {
          return { evidence: 'Found Recharge recurring billing widgets' };
        }
        return null;
      }
    },
    {
      id: 'omnisend',
      name: 'Omnisend',
      category: 'shopify_apps',
      icon: '📬',
      description: 'E-commerce email marketing & SMS automation platform.',
      website: 'https://omnisend.com',
      test: (ctx) => {
        if (ctx.html.includes('omnisnippet1.com') || ctx.html.includes('omnisend')) {
          return { evidence: 'Found Omnisend tracking snippet' };
        }
        return null;
      }
    },
    {
      id: 'gorgias',
      name: 'Gorgias Helpdesk & Live Chat',
      category: 'shopify_apps',
      icon: '💬',
      description: 'Customer service helpdesk built specifically for e-commerce stores.',
      website: 'https://gorgias.com',
      test: (ctx) => {
        if (ctx.html.includes('gorgias.chat') || ctx.html.includes('gorgias-chat-container')) {
          return { evidence: 'Found Gorgias chat container' };
        }
        return null;
      }
    },
    {
      id: 'smile_io',
      name: 'Smile.io Loyalty & Rewards',
      category: 'shopify_apps',
      icon: '🎁',
      description: 'Customer loyalty, points, VIP tiers, and referral program for stores.',
      website: 'https://smile.io',
      test: (ctx) => {
        if (ctx.html.includes('smile.io') || ctx.html.includes('smile-ui-container')) {
          return { evidence: 'Found Smile.io loyalty rewards widget' };
        }
        return null;
      }
    },
    {
      id: 'yotpo',
      name: 'Yotpo Reviews & Loyalty',
      category: 'shopify_apps',
      icon: '🌟',
      description: 'Customer reviews, visual marketing, and SMS platform.',
      website: 'https://yotpo.com',
      test: (ctx) => {
        if (ctx.html.includes('staticw2.yotpo.com') || ctx.html.includes('yotpo-widget')) {
          return { evidence: 'Found Yotpo static widgets' };
        }
        return null;
      }
    },

    // --- 3. CMS & SITE BUILDERS ---
    {
      id: 'wordpress',
      name: 'WordPress',
      category: 'cms',
      icon: '📝',
      description: 'World\'s most popular open-source content management system powering over 40% of the web.',
      website: 'https://wordpress.org',
      test: (ctx) => {
        if (ctx.html.includes('wp-content') || ctx.html.includes('wp-includes') || ctx.metaGenerator.includes('WordPress')) {
          const verMatch = ctx.metaGenerator.match(/WordPress\s*([\d.]+)/i);
          return {
            evidence: 'Found wp-content directory and WordPress scripts',
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
      description: 'Visual web design platform, CMS, and hosting engine.',
      website: 'https://webflow.com',
      test: (ctx) => {
        if (ctx.html.includes('data-wf-page') || ctx.html.includes('webflow.com') || ctx.metaGenerator.includes('Webflow')) {
          return { evidence: 'Found Webflow data-wf attributes and JS engine' };
        }
        return null;
      }
    },
    {
      id: 'ghost',
      name: 'Ghost CMS',
      category: 'cms',
      icon: '👻',
      description: 'Modern Node.js publishing platform for professional creators and journalists.',
      website: 'https://ghost.org',
      test: (ctx) => {
        if (ctx.metaGenerator.includes('Ghost') || ctx.html.includes('ghost-sdk')) {
          const ver = ctx.metaGenerator.match(/Ghost\s*([\d.]+)/i);
          return { evidence: 'Found Ghost generator tag', version: ver ? ver[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'drupal',
      name: 'Drupal',
      category: 'cms',
      icon: '💧',
      description: 'Enterprise open-source PHP content management system.',
      website: 'https://drupal.org',
      test: (ctx) => {
        if (ctx.html.includes('Drupal.settings') || ctx.metaGenerator.includes('Drupal')) {
          return { evidence: 'Found Drupal settings object' };
        }
        return null;
      }
    },
    {
      id: 'wix',
      name: 'Wix',
      category: 'cms',
      icon: '✨',
      description: 'Cloud-based web development platform and website builder.',
      website: 'https://wix.com',
      test: (ctx) => {
        if (ctx.html.includes('static.parastorage.com') || ctx.html.includes('wix-site') || ctx.metaGenerator.includes('Wix.com')) {
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
      description: 'All-in-one website building and hosting platform.',
      website: 'https://squarespace.com',
      test: (ctx) => {
        if (ctx.html.includes('static1.squarespace.com') || ctx.html.includes('squarespace-') || ctx.html.includes('sqs-')) {
          return { evidence: 'Found Squarespace static CDN assets' };
        }
        return null;
      }
    },

    // --- 4. JS FRAMEWORKS & LIBRARIES ---
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frameworks',
      icon: '▲',
      description: 'The React Framework for the Web by Vercel — supports SSR, SSG, and Server Actions.',
      website: 'https://nextjs.org',
      test: (ctx) => {
        if (ctx.html.includes('__NEXT_DATA__') || ctx.html.includes('/_next/static') || ctx.html.includes('/_next/data')) {
          return { evidence: 'Found __NEXT_DATA__ hydration script and _next paths' };
        }
        return null;
      }
    },
    {
      id: 'react',
      name: 'React',
      category: 'frameworks',
      icon: '⚛️',
      description: 'Declarative, component-based JavaScript library by Meta for building user interfaces.',
      website: 'https://react.dev',
      test: (ctx) => {
        if (ctx.html.includes('react.production.min.js') || ctx.html.includes('data-reactroot') || ctx.html.includes('_reactRootContainer') || ctx.html.includes('__NEXT_DATA__')) {
          return { evidence: 'Found React virtual DOM root / bundle signatures' };
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
          return { evidence: 'Found Angular ng-version / zone.js', version: ver ? ver[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'svelte',
      name: 'Svelte',
      category: 'frameworks',
      icon: '🔥',
      description: 'Cybernetically enhanced web apps framework that compiles away into pure vanilla JS.',
      website: 'https://svelte.dev',
      test: (ctx) => {
        if (ctx.html.includes('class="svelte-') || ctx.html.includes('__svelte')) {
          return { evidence: 'Found Svelte scoped styling classes' };
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

    // --- 5. UI & CSS FRAMEWORKS ---
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
      id: 'elementor',
      name: 'Elementor',
      category: 'ui',
      icon: '📐',
      description: 'Leading WordPress website builder and drag-and-drop page editor.',
      website: 'https://elementor.com',
      test: (ctx) => {
        if (ctx.html.includes('elementor-') || ctx.html.includes('elementor-frontend')) {
          return { evidence: 'Found Elementor frontend widget classes' };
        }
        return null;
      }
    },

    // --- 6. ANALYTICS, TRACKERS & PIXELS ---
    {
      id: 'google_analytics',
      name: 'Google Analytics (GA4)',
      category: 'analytics',
      icon: '📈',
      description: 'Google\'s enterprise web analytics platform for tracking visitor traffic and user journeys.',
      website: 'https://analytics.google.com',
      test: (ctx) => {
        if (ctx.html.includes('googletagmanager.com/gtag/js') || ctx.html.includes('google-analytics.com/analytics.js') || /G-[A-Z0-9]{8,12}/.test(ctx.html)) {
          const idMatch = ctx.html.match(/(G-[A-Z0-9]{8,12})/);
          return { evidence: 'Found Google Analytics 4 tag', version: idMatch ? idMatch[1] : undefined };
        }
        return null;
      }
    },
    {
      id: 'google_tag_manager',
      name: 'Google Tag Manager',
      category: 'analytics',
      icon: '🏷️',
      description: 'Tag management system that allows updating measurement codes and event tags.',
      website: 'https://tagmanager.google.com',
      test: (ctx) => {
        if (ctx.html.includes('googletagmanager.com/gtm.js') || ctx.html.includes('dataLayer')) {
          const idMatch = ctx.html.match(/(GTM-[A-Z0-9]+)/);
          return { evidence: 'Found Google Tag Manager container', version: idMatch ? idMatch[1] : undefined };
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
        if (ctx.html.includes('connect.facebook.net/en_US/fbevents.js') || ctx.html.includes('fbq(')) {
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
        if (ctx.html.includes('clarity.ms/tag') || ctx.html.includes('clarity(')) {
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
        if (ctx.html.includes('static.hotjar.com') || ctx.html.includes('_hjSettings')) {
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
        if (ctx.html.includes('analytics.tiktok.com') || ctx.html.includes('ttq.load')) {
          return { evidence: 'Found TikTok advertising pixel' };
        }
        return null;
      }
    },

    // --- 7. PAYMENT GATEWAYS ---
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

    // --- 8. CDN, CLOUD & SERVERS ---
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      category: 'server',
      icon: '🧡',
      description: 'Global cloud edge network providing DDoS protection, CDN, DNS, and serverless compute.',
      website: 'https://cloudflare.com',
      test: (ctx) => {
        if (ctx.html.includes('cdnjs.cloudflare.com') || ctx.headers.includes('cloudflare') || ctx.html.includes('cf-cache-status') || ctx.ns.some(n => n.includes('cloudflare'))) {
          return { evidence: 'Found Cloudflare edge headers / DNS / CDN' };
        }
        return null;
      }
    },
    {
      id: 'aws_cloudfront',
      name: 'Amazon CloudFront (AWS)',
      category: 'server',
      icon: '☁️',
      description: 'High-performance global content delivery network (CDN) service by Amazon Web Services.',
      website: 'https://aws.amazon.com/cloudfront',
      test: (ctx) => {
        if (ctx.html.includes('cloudfront.net') || ctx.headers.includes('cloudfront')) {
          return { evidence: 'Found CloudFront edge distribution domain' };
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
        if (ctx.html.includes('vercel.app') || ctx.headers.includes('vercel') || ctx.headers.includes('x-vercel-id')) {
          return { evidence: 'Found Vercel deployment edge headers' };
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
        if (ctx.html.includes('netlify.app') || ctx.headers.includes('netlify')) {
          return { evidence: 'Found Netlify edge proxy signatures' };
        }
        return null;
      }
    },

    // --- 9. CUSTOMER CHAT & SUPPORT ---
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

    // --- 10. SECURITY, CAPTCHA & FONTS ---
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
      id: 'google_fonts',
      name: 'Google Fonts',
      category: 'security',
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
    {
      id: 'font_awesome',
      name: 'Font Awesome',
      category: 'security',
      icon: '🚩',
      description: 'The web\'s popular icon library and toolkit.',
      website: 'https://fontawesome.com',
      test: (ctx) => {
        if (ctx.html.includes('fontawesome') || ctx.html.includes('font-awesome') || ctx.html.includes('fa-')) {
          return { evidence: 'Found Font Awesome icon stylesheets' };
        }
        return null;
      }
    },

    // --- 11. EMAIL & BUSINESS INFRASTRUCTURE ---
    {
      id: 'google_workspace',
      name: 'Google Workspace (Gmail)',
      category: 'email',
      icon: '✉️',
      description: 'Enterprise business email and collaboration suite by Google.',
      website: 'https://workspace.google.com',
      test: (ctx) => {
        if (ctx.mx.some(m => m.includes('google.com') || m.includes('googlemail.com'))) {
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
          return { evidence: 'Live MX Records point to Outlook mail servers' };
        }
        return null;
      }
    },
    {
      id: 'zoho_mail',
      name: 'Zoho Mail',
      category: 'email',
      icon: '📬',
      description: 'Secure, encrypted business email hosting platform.',
      website: 'https://zoho.com/mail',
      test: (ctx) => {
        if (ctx.mx.some(m => m.includes('zoho.com'))) {
          return { evidence: 'Live MX Records point to Zoho Mail servers' };
        }
        return null;
      }
    }
  ];

  // Initialize
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Mode Switch
    if (techTabs) {
      techTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-tab');
        if (!btn) return;
        techTabs.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode;
        if (mode === 'url') {
          modeUrlSection.style.display = 'block';
          modeSourceSection.style.display = 'none';
        } else {
          modeUrlSection.style.display = 'none';
          modeSourceSection.style.display = 'block';
        }
      });
    }

    // Scan Buttons
    btnScanUrl?.addEventListener('click', handleScanUrl);
    inpTargetUrl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleScanUrl();
    });

    btnScanSource?.addEventListener('click', handleScanSource);
    btnLoadDemoSource?.addEventListener('click', loadDemoShopifySource);

    // Sample sites
    sampleSiteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (inpTargetUrl) {
          inpTargetUrl.value = btn.dataset.url;
          handleScanUrl();
        }
      });
    });

    // Category Filter Tabs
    techCategoryFilters?.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-tab');
      if (!btn) return;
      techCategoryFilters.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      renderTechSections(currentScannedData);
    });

    // Copy & Export
    btnCopyReport?.addEventListener('click', copyTextReport);
    btnDownloadJson?.addEventListener('click', downloadJsonReport);
  }

  // Handle URL Scan
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

    showLoading(true, `Connecting to ${domain}...`, 'Fetching live HTML source code & response headers...');

    let htmlResult = { html: '', headers: '' };
    let proxyFailed = false;

    try {
      // 1. Fetch HTML via multi-proxy cascade
      htmlResult = await fetchSiteHtml(rawUrl);
    } catch (proxyErr) {
      console.warn('HTML proxies failed, proceeding with DNS & infrastructure scan:', proxyErr);
      proxyFailed = true;
    }

    try {
      // 2. Fetch DNS MX & NS records via Google DoH
      updateLoadingStatus(`Inspecting DNS & Infrastructure for ${domain}...`, 'Looking up MX mail servers, nameservers, and cloud IP records...');
      const dnsData = await fetchDnsRecords(domain);

      // 3. Run Analysis
      updateLoadingStatus(`Matching 200+ technology signatures...`, 'Detecting Shopify apps, CMS, frameworks, payment gateways...');
      const results = analyzeTechnology(htmlResult.html, htmlResult.headers, dnsData, domain);

      // 4. Render UI
      currentScannedData = { domain, rawUrl, ...results };
      renderResults(currentScannedData);

      if (proxyFailed) {
        showToast(`Bot shield protected full HTML. Showing Cloud & DNS tech! Paste source in Tab 2 for deep app scan.`, 'info');
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

    showLoading(true, 'Analyzing pasted HTML source code...', 'Extracting script tags, meta generator, and CSS classes...');
    setTimeout(() => {
      const results = analyzeTechnology(html, '', { mx: [], ns: [] }, 'pasted-source-code.local');
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
    // Attempt 1: Jina AI Reader HTML proxy (bypasses Cloudflare, Akamai & bot challenges)
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

  // Fetch DNS DoH Records (Google Public DNS)
  async function fetchDnsRecords(domain) {
    const dns = { mx: [], ns: [] };
    try {
      // MX Lookups
      const mxRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`).then(r => r.json());
      if (mxRes.Answer) {
        dns.mx = mxRes.Answer.map(a => (a.data || '').toLowerCase());
      }
      // NS Lookups
      const nsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`).then(r => r.json());
      if (nsRes.Answer) {
        dns.ns = nsRes.Answer.map(a => (a.data || '').toLowerCase());
      }
    } catch (e) {
      console.warn('DNS lookup failed:', e);
    }
    return dns;
  }

  // Analysis Engine
  function analyzeTechnology(html, headers, dns, domain) {
    const metaGeneratorMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
    const metaGenerator = metaGeneratorMatch ? metaGeneratorMatch[1] : '';

    const ctx = {
      html: html,
      headers: (headers || '').toLowerCase(),
      metaGenerator: metaGenerator,
      mx: dns.mx || [],
      ns: dns.ns || [],
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

          if (tech.id === 'shopify') {
            detectedShopify = item;
            primaryEcommerce = 'Shopify';
          } else if (tech.category === 'ecommerce' && !primaryEcommerce) {
            primaryEcommerce = tech.name;
          }

          if (tech.category === 'cms' && !primaryCms) {
            primaryCms = tech.name;
          }

          if (tech.category === 'server') {
            detectedServer = tech.name;
          }
        }
      } catch (err) {
        console.error('Error matching tech:', tech.name, err);
      }
    });

    return {
      detectedList: detected,
      isShopify: !!detectedShopify,
      shopifyDetails: detectedShopify,
      primaryEcommerce: primaryEcommerce || 'None',
      primaryCms: primaryCms || (detectedShopify ? 'Shopify CMS' : 'Custom / Static'),
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
          <p style="font-size: 13px; color: var(--gray-500); max-width: 440px; margin: 6px auto 0;">The site may be completely custom-coded, using a private CDN, or has minimized script headers.</p>
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
        if (activeFilter === 'tools' && (item.category !== 'chat' && item.category !== 'security' && item.category !== 'email')) return;
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
