# AllToolsInOne 🇮🇳

> A high-performance, mobile-first, client-side web application suite featuring 38+ free online utilities designed for Indian government exam applicants (SSC, UPSC, Railway, State PSC, Banking), students, freelancers, cyber cafes, and digital creators.

---

## ✨ Features & Tool Catalog

### 1. 🖼️ Government Exam Photo & Image Tools
- **Image Resizer:** Resize by pixels, cm/mm, percentage, or target file size (under 20KB, 50KB, 100KB) with instant preview.
- **Image Format Converter:** Batch conversion between JPG, PNG, WebP, and BMP.
- **Photo & Signature Joiner:** Standard horizontal and vertical presets for SSC, UPSC, and State PSC application portals.
- **Name & Date on Photo Maker:** Auto-generate compliant candidate name and photo capture date timestamps.
- **Passport Size Photo Maker:** Multi-photo grid generator (4, 6, 8, 12 photos) on A4 sheet ready for 4×6 / 6×8 printing.
- **Background Remover & Color Changer:** Canvas-based background replacement (White, Light Blue, Transparent).

### 2. 📄 Document & Career Builders
- **Resume / CV Maker:** 4 professional resume templates (Classic, Modern Blue, Minimal Clean, Corporate) with instant PDF export.
- **Shadi / Marriage Biodata Maker:** Hindu, Muslim, and modern matrimonial biodata generator with multilingual support.
- **Formal Application & Letter Writer:** Pre-formatted leave, transfer, complaint, and job application templates.
- **Invoice & Cyber Cafe Cash Receipt Maker:** Tax invoice and receipt generator with live preview and print layout.

### 3. 📱 Smart QR & Barcode Generators
- **Custom QR Generator:** Dynamic color customization, corner squircle styles, logo branding, and high-res vector/PNG download.
- **Image-to-QR Generator:** Turn full images into scanned visual QR codes.
- **Specialized QR Generators:** UPI Payment QR, WiFi Access QR, vCard Contact QR, WhatsApp Chat QR, Google Review & Google Maps Location QR.
- **Barcode & Label Generator:** Standard CODE128, EAN-13, and UPC barcodes with batch printing.
- **Camera & File QR Scanner:** Fast client-side QR decoding via WebRTC camera and file drag-and-drop.

### 4. 🧮 Government Exam & Financial Calculators
- **Exam Age Calculator:** Cutoff date eligibility checker for SSC CGL, CHSL, Railway, UPSC, and Bank PO with OBC/SC/ST/PwD relaxation.
- **Typing Speed Test:** SSC CHSL / CGL exam mode typing test in English & Hindi with real-time WPM, accuracy, and error tracking.
- **GST Tax & Profit Margin Calculator:** CGST, SGST, IGST inclusive/exclusive breakdown and trade margin planner.
- **Attendance & Minimum 75% Calculator:** College & school bunk planner to maintain strict minimum attendance.
- **Password Generator:** Cryptographically secure character generator for portal logins.

### 5. 🔍 SEO & Webmaster Tools
- **SEO Meta Tag & Open Graph Generator:** Real-time Google SERP, WhatsApp, Facebook, and Twitter card previews.
- **Schema Markup (JSON-LD) Generator:** Validated schema for FAQ, Local Business, Article, and Product rich snippets.
- **Robots.txt & XML Sitemap Builder:** Web crawler directive generator with visual rule testing.
- **Google SERP Simulator:** Desktop & mobile search snippet preview with pixel-width meters.
- **Domain Availability Checker:** Real-time DNS and whois availability lookups.
- **Keyword Density & Word Counter:** Character, word, reading time, and keyword concentration analysis.

---

## 🚀 Technology Stack

- **Frontend:** Pure Vanilla HTML5, CSS3, Modern ES6+ JavaScript.
- **Typography & Icons:** Inter, Poppins, JetBrains Mono, Feather SVGs.
- **Client-side Libraries:**
  - `QRCode.js` & Custom Canvas pixel transformers for QR rendering.
  - `jsPDF` & `html2canvas` for PDF and document printing.
  - `JsBarcode` for standard 1D barcodes.
  - `ZXing` / native Canvas image decoders for camera scanning.
- **Server / Deployment:** Production Nginx config, Cloudflare Tunnel compatible, 100% static hosting ready (GitHub Pages / Vercel / Netlify / Cloudflare Pages).

---

## 📱 Mobile & Responsive Architecture

All tools are engineered with zero horizontal overflow:
- Fully compliant across **320px** (iPhone SE), **375px**, **414px**, **768px** (Tablet), and **1024px+** (Desktop).
- Dynamic touch-friendly wrapping, responsive canvas scaling, and scroll-safe tab bars.

---

## 🔒 Security & Privacy

All image processing, document generation, resume drafting, and calculation logic occurs **100% client-side in the user's browser**. No user photos, signatures, or personal records are ever uploaded or stored on any external server.

---

## 🛠️ Local Development

To run locally with any HTTP server:

```bash
# Python simple server
python -m http.server 8080

# Or using Node.js http-server
npx http-server . -p 8080
```

Open `http://localhost:8080` in your browser.

---

## 👤 Author & Maintainer

- **Owner:** ARYANRAJS
- **Contact:** appmarket001@gmail.com
- **Repository:** Private GitHub Repository (`ARYANRAJS/sarkari-tools`)
