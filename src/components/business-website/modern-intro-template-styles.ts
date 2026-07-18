export const TEMPLATE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap');

/* ============ Reset & Base ============ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scroll-padding-top: 90px; }
body {
  font-family: 'Cairo', sans-serif;
  background: var(--theme-background, #ffffff);
  color: var(--theme-text, #0f172a);
  line-height: 1.7;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }

.modern-intro-template {
  --mi-primary: var(--theme-primary, #4f46e5);
  --mi-secondary: var(--theme-secondary, #06b6d4);
  --mi-accent: var(--theme-accent, #f59e0b);
  --mi-bg: var(--theme-background, #ffffff);
  --mi-surface: var(--theme-surface, #f8fafc);
  --mi-text: var(--theme-text, #0f172a);
  --mi-muted: #64748b;
  --mi-line: rgba(15, 23, 42, 0.08);
  --mi-radius: var(--theme-radius, 1rem);
  --mi-font: var(--theme-font, 'Cairo');
  background: var(--mi-bg);
  color: var(--mi-text);
  font-family: var(--mi-font), 'Cairo', sans-serif;
}

.container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }
.section { padding: clamp(4rem, 9vw, 7rem) 0; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  color: var(--mi-primary);
  font-weight: 600;
  font-size: .95rem;
  margin-bottom: .75rem;
}
.eyebrow::before {
  content: '';
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: var(--mi-primary);
}
h1 { font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1.15; font-weight: 800; }
h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); line-height: 1.25; font-weight: 700; margin-bottom: .75rem; }
h3 { font-size: clamp(1.15rem, 2vw, 1.5rem); line-height: 1.35; font-weight: 700; }
p { color: var(--mi-muted); }

/* ============ Buttons ============ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .9rem 1.8rem;
  border-radius: 999px;
  font-size: .95rem;
  font-weight: 600;
  transition: all .25s ease;
}
.btn-primary {
  background: var(--mi-primary);
  color: #fff;
  box-shadow: 0 10px 28px -10px color-mix(in srgb, var(--mi-primary) 55%, transparent);
}
.btn-primary:hover { transform: translateY(-2px); filter: brightness(1.08); }
.btn-secondary {
  background: var(--mi-secondary);
  color: #fff;
  box-shadow: 0 10px 28px -10px color-mix(in srgb, var(--mi-secondary) 45%, transparent);
}
.btn-secondary:hover { transform: translateY(-2px); filter: brightness(1.08); }
.btn-ghost {
  background: transparent;
  color: var(--mi-text);
  border: 1.5px solid var(--mi-line);
}
.btn-ghost:hover { border-color: var(--mi-primary); color: var(--mi-primary); }

/* ============ Nav ============ */
.mi-nav {
  position: fixed; top: 0; right: 0; left: 0;
  z-index: 100;
  padding: 1.1rem 0;
  transition: all .35s ease;
  background: transparent;
}
.mi-nav.scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  box-shadow: 0 1px 0 var(--mi-line);
  padding: .75rem 0;
}
.mi-nav-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem;
}
.mi-brand {
  display: flex; align-items: center; gap: .75rem;
  flex-shrink: 0;
}
.mi-brand-mark {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 1.1rem;
}
.mi-brand-name { font-weight: 800; font-size: 1.25rem; color: var(--mi-text); }
.mi-nav-links { display: flex; align-items: center; gap: .25rem; }
.mi-nav-links a, .mi-nav-links button {
  color: var(--mi-text);
  font-size: .9rem;
  font-weight: 500;
  padding: .5rem .85rem;
  border-radius: .5rem;
  transition: all .2s;
  white-space: nowrap;
}
.mi-nav-links a:hover, .mi-nav-links button:hover {
  color: var(--mi-primary);
  background: rgba(79, 70, 229, 0.06);
}
.mi-nav-links a.active {
  color: var(--mi-primary);
  background: rgba(79, 70, 229, 0.1);
  font-weight: 600;
}
.mi-nav-cta {
  background: var(--mi-primary);
  color: #fff !important;
  padding: .65rem 1.4rem !important;
  border-radius: 999px !important;
}
.mi-nav-cta:hover { filter: brightness(1.1); background: var(--mi-primary) !important; }

.mi-dropdown { position: relative; }
.mi-dropdown-menu {
  position: absolute; top: calc(100% + .5rem); right: 0;
  min-width: 180px;
  background: #fff;
  border: 1px solid var(--mi-line);
  border-radius: .75rem;
  box-shadow: 0 20px 40px -16px rgba(15,23,42,0.18);
  padding: .5rem;
  opacity: 0; visibility: hidden; transform: translateY(8px);
  transition: all .2s ease;
}
.mi-dropdown:hover .mi-dropdown-menu,
.mi-dropdown:focus-within .mi-dropdown-menu {
  opacity: 1; visibility: visible; transform: translateY(0);
}
.mi-dropdown-menu a {
  display: block;
  padding: .55rem .9rem;
  border-radius: .5rem;
  font-size: .88rem;
}

.menu-toggle { display: none; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: .5rem; }
.menu-toggle:hover { background: rgba(15,23,42,0.05); }

@media (max-width: 1020px) {
  .mi-nav-links { display: none; }
  .menu-toggle { display: inline-flex; }
}

/* ============ Hero ============ */
.mi-hero {
  position: relative;
  min-height: 100vh; min-height: 100dvh;
  display: flex; align-items: center;
  overflow: hidden;
  padding: 8rem 0 5rem;
  background: linear-gradient(135deg, var(--mi-bg) 0%, var(--mi-surface) 100%);
}
.mi-hero-grid {
  display: grid; grid-template-columns: 1.05fr .95fr;
  gap: 4rem; align-items: center;
}
.mi-hero-content { position: relative; z-index: 2; }
.mi-hero-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(79, 70, 229, 0.08);
  color: var(--mi-primary);
  padding: .4rem 1rem;
  border-radius: 999px;
  font-size: .85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}
.mi-hero h1 { margin-bottom: 1.25rem; color: var(--mi-text); }
.mi-hero h1 span { color: var(--mi-primary); }
.mi-hero-lead { font-size: 1.1rem; max-width: 540px; margin-bottom: 2rem; }
.mi-hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
.mi-hero-stats {
  display: flex; gap: 2.5rem; margin-top: 3rem;
  padding-top: 1.5rem; border-top: 1px solid var(--mi-line);
}
.mi-hero-stats .num { font-size: 1.9rem; font-weight: 800; color: var(--mi-primary); line-height: 1; }
.mi-hero-stats .lbl { font-size: .85rem; color: var(--mi-muted); margin-top: .25rem; }

.mi-hero-media {
  position: relative;
  border-radius: var(--mi-radius);
  overflow: hidden;
  box-shadow: 0 40px 80px -30px rgba(15,23,42,0.25);
}
.mi-hero-media::before {
  content: '';
  position: absolute; inset: -2px;
  background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%);
  z-index: -1;
  border-radius: calc(var(--mi-radius) + 2px);
  opacity: .4;
}
.mi-hero-media img {
  width: 100%; aspect-ratio: 4/3; object-fit: cover;
}
.mi-hero-float {
  position: absolute; bottom: -1.5rem; left: -1.5rem;
  background: #fff;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 20px 45px -12px rgba(15,23,42,0.2);
  display: flex; align-items: center; gap: .75rem;
}
.mi-hero-float .icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(79, 70, 229, 0.1);
  color: var(--mi-primary);
  display: flex; align-items: center; justify-content: center;
}

@media (max-width: 900px) {
  .mi-hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .mi-hero { padding-top: 7rem; }
  .mi-hero-media { order: -1; }
  .mi-hero-float { left: 1rem; bottom: -1rem; }
}

/* ============ Section header ============ */
.mi-section-head { text-align: center; max-width: 640px; margin: 0 auto 3.5rem; }
.mi-section-head.left { text-align: right; margin: 0 0 3rem; }
.mi-section-head p { margin-top: .75rem; }

/* ============ Features ============ */
.mi-features { background: var(--mi-surface); }
.mi-features-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;
}
.mi-feature {
  background: #fff;
  border: 1px solid var(--mi-line);
  border-radius: var(--mi-radius);
  padding: 1.75rem;
  transition: all .3s ease;
}
.mi-feature:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -20px rgba(15,23,42,0.12); border-color: transparent; }
.mi-feature .ic {
  width: 50px; height: 50px; border-radius: 14px;
  background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
}
.mi-feature h3 { margin-bottom: .35rem; }
.mi-feature p { font-size: .9rem; line-height: 1.6; }

@media (max-width: 1020px) { .mi-features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .mi-features-grid { grid-template-columns: 1fr; } }

/* ============ About ============ */
.mi-about { background: var(--mi-bg); }
.mi-about-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
}
.mi-about-image {
  position: relative;
  border-radius: var(--mi-radius);
  overflow: hidden;
  box-shadow: 0 30px 60px -25px rgba(15,23,42,0.2);
}
.mi-about-image img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.mi-about-image .float {
  position: absolute; bottom: -1.25rem; right: -1.25rem;
  background: #fff;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 16px 36px -12px rgba(15,23,42,0.18);
}
.mi-about-image .float .num { font-size: 2rem; font-weight: 800; color: var(--mi-primary); line-height: 1; }
.mi-about-image .float .txt { font-size: .85rem; color: var(--mi-muted); }
.mi-about-text .lead { font-size: 1.05rem; margin: 1rem 0 1.5rem; }
.mi-values { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.5rem; }
.mi-values span {
  background: rgba(79, 70, 229, 0.08);
  color: var(--mi-primary);
  padding: .4rem .9rem;
  border-radius: 999px;
  font-size: .85rem;
  font-weight: 600;
}

@media (max-width: 900px) {
  .mi-about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .mi-about-image .float { right: 1rem; }
}

/* ============ Services ============ */
.mi-services { background: var(--mi-bg); }
.mi-services-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.mi-service {
  background: var(--mi-surface);
  border-radius: var(--mi-radius);
  overflow: hidden;
  border: 1px solid var(--mi-line);
  transition: all .3s ease;
}
.mi-service:hover { transform: translateY(-5px); box-shadow: 0 22px 45px -22px rgba(15,23,42,0.14); }
.mi-service-img { aspect-ratio: 16/10; overflow: hidden; }
.mi-service-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
.mi-service:hover .mi-service-img img { transform: scale(1.06); }
.mi-service-body { padding: 1.5rem; }
.mi-service-body h3 { margin-bottom: .4rem; }
.mi-service-body p { font-size: .9rem; line-height: 1.6; margin-bottom: .75rem; }
.mi-service-meta { display: flex; align-items: center; justify-content: space-between; }
.mi-service-price { font-weight: 800; color: var(--mi-primary); }
.mi-service-link { color: var(--mi-primary); font-weight: 600; font-size: .85rem; display: inline-flex; align-items: center; gap: .25rem; }

@media (max-width: 900px) { .mi-services-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .mi-services-grid { grid-template-columns: 1fr; } }

/* ============ Stats ============ */
.mi-stats { background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%); color: #fff; }
.mi-stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
}
.mi-stat { text-align: center; }
.mi-stat .num { font-size: 2.5rem; font-weight: 800; line-height: 1; }
.mi-stat .lbl { font-size: .95rem; opacity: .85; margin-top: .4rem; }

@media (max-width: 760px) { .mi-stats-grid { grid-template-columns: repeat(2, 1fr); } }

/* ============ Gallery ============ */
.mi-gallery { background: var(--mi-surface); }
.mi-gallery-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
}
.mi-gallery-grid > *:first-child { grid-column: span 2; grid-row: span 2; }
.mi-gallery-item {
  aspect-ratio: 1; border-radius: var(--mi-radius); overflow: hidden;
  position: relative; cursor: pointer;
}
.mi-gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
.mi-gallery-item:hover img { transform: scale(1.08); }
.mi-gallery-item .overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.7) 100%);
  opacity: 0; transition: opacity .3s;
  display: flex; align-items: flex-end; padding: 1rem;
}
.mi-gallery-item:hover .overlay { opacity: 1; }
.mi-gallery-item .overlay span { color: #fff; font-weight: 600; font-size: .9rem; }

@media (max-width: 760px) {
  .mi-gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .mi-gallery-grid > *:first-child { grid-column: span 2; }
}

/* ============ Testimonials ============ */
.mi-testimonials { background: var(--mi-bg); }
.mi-test-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.mi-test-card {
  background: var(--mi-surface);
  border: 1px solid var(--mi-line);
  border-radius: var(--mi-radius);
  padding: 1.75rem;
  transition: all .3s ease;
}
.mi-test-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px -18px rgba(15,23,42,0.12); }
.mi-stars { display: flex; gap: 3px; color: var(--mi-accent); margin-bottom: 1rem; }
.mi-stars svg { width: 18px; height: 18px; }
.mi-test-text { font-size: .98rem; line-height: 1.8; color: var(--mi-text); margin-bottom: 1.25rem; }
.mi-test-author { display: flex; align-items: center; gap: .75rem; }
.mi-test-author .avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .95rem;
}
.mi-test-author .name { font-weight: 700; color: var(--mi-text); }
.mi-test-author .role { font-size: .82rem; color: var(--mi-muted); }

@media (max-width: 900px) { .mi-test-grid { grid-template-columns: 1fr; } }

/* ============ Contact ============ */
.mi-contact { background: var(--mi-bg); }
.mi-contact-grid {
  display: grid; grid-template-columns: 1fr 1.2fr; gap: 4rem; align-items: start;
}
.mi-contact-info h2 { margin-bottom: .75rem; }
.mi-contact-info > p { margin-bottom: 2rem; }
.mi-info-list { list-style: none; }
.mi-info-list li { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--mi-line); }
.mi-info-list li:last-child { border-bottom: none; }
.mi-info-list .ic {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--mi-primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mi-info-list strong { display: block; color: var(--mi-text); font-weight: 700; margin-bottom: .15rem; }
.mi-info-list span { color: var(--mi-muted); font-size: .9rem; }

.mi-contact-form {
  background: var(--mi-surface);
  border: 1px solid var(--mi-line);
  border-radius: var(--mi-radius);
  padding: 2rem;
}
.mi-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.mi-form-row.full { grid-template-columns: 1fr; }
.mi-form-group label { display: block; font-size: .85rem; font-weight: 600; color: var(--mi-text); margin-bottom: .4rem; }
.mi-form-group input, .mi-form-group textarea {
  width: 100%; padding: .85rem 1rem;
  background: #fff;
  border: 1px solid var(--mi-line);
  border-radius: .65rem;
  color: var(--mi-text); font-family: inherit; font-size: .95rem;
  transition: all .2s;
}
.mi-form-group input:focus, .mi-form-group textarea:focus {
  outline: none; border-color: var(--mi-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}
.mi-form-group textarea { resize: vertical; min-height: 120px; }
.mi-contact-form .btn-primary { width: 100%; justify-content: center; padding: 1rem; }

@media (max-width: 900px) {
  .mi-contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .mi-form-row { grid-template-columns: 1fr; }
}

/* ============ CTA ============ */
.mi-cta {
  background: linear-gradient(135deg, var(--mi-primary) 0%, var(--mi-secondary) 100%);
  color: #fff;
  text-align: center;
}
.mi-cta h2 { color: #fff; }
.mi-cta p { color: rgba(255,255,255,0.85); max-width: 560px; margin: 0 auto 1.75rem; }
.mi-cta .btn-ghost { border-color: rgba(255,255,255,0.5); color: #fff; }
.mi-cta .btn-ghost:hover { background: #fff; color: var(--mi-primary); border-color: #fff; }

/* ============ Footer ============ */
.mi-footer { background: #0f172a; color: #fff; padding: 4rem 0 1.5rem; }
.mi-footer-grid {
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 3rem;
  margin-bottom: 3rem;
}
.mi-footer-brand { max-width: 300px; }
.mi-footer-brand .mi-brand-mark { margin-bottom: 1rem; }
.mi-footer-brand p { color: rgba(255,255,255,0.6); font-size: .92rem; margin-top: .75rem; }
.mi-socials { display: flex; gap: .65rem; margin-top: 1.25rem; }
.mi-socials a {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.mi-socials a:hover { background: var(--mi-primary); transform: translateY(-2px); }
.mi-footer-col h4 { font-size: 1rem; margin-bottom: 1.1rem; font-weight: 700; }
.mi-footer-col ul { list-style: none; }
.mi-footer-col li { padding: .35rem 0; }
.mi-footer-col a { color: rgba(255,255,255,0.6); font-size: .9rem; transition: color .2s; }
.mi-footer-col a:hover { color: #fff; }
.mi-footer-col p { color: rgba(255,255,255,0.6); font-size: .9rem; line-height: 1.7; }
.mi-footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 1.25rem;
  display: flex; justify-content: space-between; align-items: center;
  color: rgba(255,255,255,0.45); font-size: .85rem;
  flex-wrap: wrap; gap: 1rem;
}

@media (max-width: 900px) {
  .mi-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .mi-footer-brand { grid-column: span 2; }
}
@media (max-width: 560px) {
  .mi-footer-grid { grid-template-columns: 1fr; }
  .mi-footer-brand { grid-column: span 1; }
}

/* ============ Reveal animation ============ */
.js-reveal .reveal {
  opacity: 0; transform: translateY(28px);
  transition: opacity .8s ease, transform .8s ease;
}
.js-reveal .reveal.in { opacity: 1; transform: none; }
.js-reveal .reveal.delay-1 { transition-delay: .12s; }
.js-reveal .reveal.delay-2 { transition-delay: .24s; }
.js-reveal .reveal.delay-3 { transition-delay: .36s; }
@media (prefers-reduced-motion: reduce) {
  .js-reveal .reveal { opacity: 1 !important; transform: none !important; }
}
`;
