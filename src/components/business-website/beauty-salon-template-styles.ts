export const TEMPLATE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

/* ============ Reset & Base ============ */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; scroll-padding-top: 90px; }
  body {
    font-family: 'Tajawal', sans-serif;
    background: #fbf7f4;
    color: #2a1f24;
    line-height: 1.7;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; border: none; background: none; }
  :root {
    --rose: #b76e79;
    --rose-soft: #d9a1a8;
    --rose-bg: #f7e1e7;
    --gold: #c79b6b;
    --gold-light: #e6c89a;
    --cream: #fbf7f4;
    --cream-deep: #f3ebe3;
    --ink: #2a1f24;
    --ink-soft: #5a4a50;
    --line: #e9dfd5;
  }

  /* ============ Typography ============ */
  .display { font-family: 'Aref Ruqaa', serif; font-weight: 700; letter-spacing: -0.01em; }
  .serif-en { font-family: 'Playfair Display', serif; }
  h1 { font-size: clamp(2.4rem, 5.5vw, 4.5rem); line-height: 1.15; }
  h2 { font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.2; margin-bottom: 1rem; }
  h3 { font-size: clamp(1.3rem, 2.5vw, 1.7rem); line-height: 1.3; margin-bottom: .5rem; }
  p  { font-size: 1.05rem; color: var(--ink-soft); }
  .eyebrow {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    color: var(--rose);
    font-size: 1rem;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
    text-transform: lowercase;
  }
  .container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }
  .section { padding: clamp(4rem, 9vw, 8rem) 0; }

  /* ============ Nav ============ */
  .nav {
    position: fixed; top: 0; right: 0; left: 0;
    z-index: 100;
    padding: 1.25rem 0;
    transition: all .35s ease;
    backdrop-filter: blur(0px);
    background: transparent;
  }
  .nav.scrolled {
    background: rgba(251,247,244,0.92);
    backdrop-filter: blur(14px);
    box-shadow: 0 1px 0 var(--line);
    padding: .85rem 0;
  }
  .nav-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 2rem;
  }
  .brand { display: flex; align-items: center; gap: .65rem; }
  .brand-mark {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Aref Ruqaa', serif; font-size: 1.4rem; font-weight: 700;
    box-shadow: 0 6px 18px rgba(183,110,121,0.25);
  }
  .brand-name { font-family: 'Aref Ruqaa', serif; font-size: 1.6rem; color: var(--ink); }
  .nav.scrolled .brand-name { color: var(--ink); }
  .nav:not(.scrolled) .brand-name { color: var(--ink); }
  .nav-links { display: flex; gap: 2.2rem; align-items: center; }
  .nav-links a {
    color: var(--ink); font-size: .95rem; font-weight: 500;
    position: relative; transition: color .2s;
  }
  .nav-links a:hover { color: var(--rose); }
  .nav-cta {
    background: var(--ink); color: #fff;
    padding: .7rem 1.6rem; border-radius: 999px;
    font-weight: 500; font-size: .95rem;
    transition: all .25s;
  }
  .nav-cta:hover { background: var(--rose); transform: translateY(-1px); }
  .menu-toggle { display: none; width: 32px; height: 32px; }
  @media (max-width: 880px) {
    .nav-links { display: none; }
    .menu-toggle { display: flex; align-items: center; justify-content: center; }
    .menu-toggle svg { width: 24px; height: 24px; color: var(--ink); }
  }

  /* ============ Hero ============ */
  .hero {
    position: relative;
    min-height: 100vh; min-height: 100dvh;
    display: flex; align-items: center;
    overflow: hidden;
    background: var(--cream);
  }
  .hero-bg {
    position: absolute; inset: 0;
    background-image: var(--hero-image, url('/templates/beauty-salon/hero-hair.jpg'));
    background-size: cover;
    background-position: center;
    z-index: 0;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(115deg, rgba(251,247,244,0.95) 0%, rgba(251,247,244,0.78) 38%, rgba(251,247,244,0.25) 70%, rgba(251,247,244,0) 100%);
    z-index: 1;
  }
  .hero-content {
    position: relative; z-index: 2;
    max-width: 640px;
    padding-top: 6rem;
  }
  .hero-eyebrow-row {
    display: inline-flex; align-items: center; gap: .75rem;
    background: rgba(255,255,255,0.7);
    border: 1px solid var(--line);
    padding: .5rem 1rem; border-radius: 999px;
    font-family: 'Playfair Display', serif; font-style: italic;
    color: var(--rose); margin-bottom: 1.5rem;
    backdrop-filter: blur(8px);
  }
  .hero-eyebrow-row .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rose); }
  .hero h1 { color: var(--ink); margin-bottom: 1.25rem; }
  .hero h1 .accent { color: var(--rose); font-style: italic; font-family: 'Aref Ruqaa', serif; }
  .hero-lead { font-size: 1.15rem; color: var(--ink-soft); margin-bottom: 2rem; max-width: 540px; }
  .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn {
    display: inline-flex; align-items: center; gap: .55rem;
    padding: .95rem 2rem; border-radius: 999px;
    font-size: 1rem; font-weight: 500;
    transition: all .25s;
  }
  .btn-primary { background: var(--ink); color: #fff; }
  .btn-primary:hover { background: var(--rose); transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(183,110,121,0.5); }
  .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--ink); }
  .btn-ghost:hover { background: var(--ink); color: #fff; }
  .hero-stats {
    display: flex; gap: 2.5rem; margin-top: 3.5rem;
    border-top: 1px solid var(--line); padding-top: 1.75rem;
    max-width: 540px;
  }
  .hero-stats .num { font-family: 'Aref Ruqaa', serif; font-size: 2.2rem; color: var(--rose); line-height: 1; }
  .hero-stats .lbl { font-size: .85rem; color: var(--ink-soft); margin-top: .25rem; }

  /* Floating badge */
  .hero-badge {
    position: absolute; bottom: 2rem; left: 2rem; z-index: 3;
    background: #fff; border-radius: 1rem; padding: 1.1rem 1.3rem;
    box-shadow: 0 18px 40px -16px rgba(42,31,36,0.25);
    display: flex; align-items: center; gap: .9rem;
    max-width: 280px;
  }
  .hero-badge svg { width: 36px; height: 36px; color: var(--rose); flex-shrink: 0; }
  .hero-badge .b-title { font-weight: 700; color: var(--ink); font-size: .95rem; }
  .hero-badge .b-sub { font-size: .8rem; color: var(--ink-soft); }

  @media (max-width: 720px) {
    .hero-overlay { background: linear-gradient(180deg, rgba(251,247,244,0.85) 0%, rgba(251,247,244,0.55) 100%); }
    .hero-badge { display: none; }
  }

  /* ============ Section header ============ */
  .section-head { text-align: center; max-width: 680px; margin: 0 auto 4rem; }
  .section-head p { margin-top: 1rem; }
  .section-head.left { text-align: right; margin: 0 0 3rem; }

  /* ============ About ============ */
  .about { background: var(--cream); }
  .about-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  }
  .about-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 30px 60px -25px rgba(42,31,36,0.3);
  }
  .about-image img { width: 100%; height: 100%; object-fit: cover; }
  .about-image .float {
    position: absolute; bottom: -1.5rem; right: -1.5rem;
    width: 180px; height: 180px;
    background: var(--rose-bg); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 8px solid var(--cream);
  }
  .about-image .float-inner { text-align: center; }
  .about-image .float-inner .y { font-family: 'Aref Ruqaa', serif; font-size: 2.5rem; color: var(--rose); line-height: 1; }
  .about-image .float-inner .t { font-size: .85rem; color: var(--ink); font-weight: 500; margin-top: .25rem; }
  .about-text .lead { font-size: 1.15rem; color: var(--ink-soft); margin: 1.5rem 0 2rem; }
  .about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
  .about-feat { display: flex; gap: 1rem; }
  .about-feat .ic {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--rose-bg); color: var(--rose);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .about-feat .ic svg { width: 22px; height: 22px; }
  .about-feat h4 { font-size: 1rem; font-weight: 700; margin-bottom: .2rem; }
  .about-feat p { font-size: .9rem; }

  @media (max-width: 880px) {
    .about-grid { grid-template-columns: 1fr; gap: 3rem; }
    .about-image .float { right: 1rem; bottom: -1rem; width: 140px; height: 140px; }
  }

  /* ============ Services ============ */
  .services { background: #fff; }
  .services-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  }
  .service {
    background: var(--cream); border-radius: 1.5rem;
    overflow: hidden; transition: all .3s ease;
    border: 1px solid transparent;
  }
  .service:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -20px rgba(183,110,121,0.35); border-color: var(--rose-bg); }
  .service-img {
    aspect-ratio: 4/3; overflow: hidden;
  }
  .service-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .service:hover .service-img img { transform: scale(1.06); }
  .service-body { padding: 1.5rem 1.5rem 1.75rem; }
  .service-body .ic {
    display: inline-flex; align-items: center; justify-content: center;
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--rose-bg); color: var(--rose);
    margin-bottom: .85rem;
  }
  .service-body .ic svg { width: 22px; height: 22px; }
  .service-body h3 { font-size: 1.25rem; margin-bottom: .35rem; }
  .service-body p { font-size: .92rem; line-height: 1.6; }
  .service-link {
    display: inline-flex; align-items: center; gap: .35rem;
    margin-top: 1rem; color: var(--rose); font-weight: 500; font-size: .9rem;
  }
  .service-link svg { width: 16px; height: 16px; transition: transform .25s; }
  .service-link:hover svg { transform: translateX(-4px); }

  @media (max-width: 880px) {
    .services-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 580px) {
    .services-grid { grid-template-columns: 1fr; }
  }

  /* ============ Bridal spotlight ============ */
  .bridal {
    background: linear-gradient(135deg, #f7e1e7 0%, #fbf7f4 100%);
    position: relative;
    overflow: hidden;
  }
  .bridal-grid {
    display: grid; grid-template-columns: 1.1fr 1fr; gap: 5rem; align-items: center;
  }
  .bridal-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 30px 60px -20px rgba(183,110,121,0.45);
  }
  .bridal-image img { width: 100%; height: 100%; object-fit: cover; }
  .bridal-tag {
    position: absolute; top: 1.5rem; right: 1.5rem;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
    padding: .6rem 1.1rem; border-radius: 999px;
    font-family: 'Playfair Display', serif; font-style: italic;
    color: var(--rose); font-size: .9rem;
  }
  .bridal-text h2 { color: var(--ink); }
  .bridal-text h2 .accent { color: var(--rose); font-style: italic; font-family: 'Aref Ruqaa', serif; }
  .bridal-list { list-style: none; margin: 2rem 0; }
  .bridal-list li {
    display: flex; gap: 1rem; padding: 1rem 0;
    border-bottom: 1px solid rgba(183,110,121,0.18);
  }
  .bridal-list li:last-child { border-bottom: none; }
  .bridal-list .check {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--rose); color: #fff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .bridal-list .check svg { width: 14px; height: 14px; }
  .bridal-list strong { display: block; font-weight: 700; color: var(--ink); margin-bottom: .15rem; }
  .bridal-list span { font-size: .9rem; color: var(--ink-soft); }

  @media (max-width: 880px) {
    .bridal-grid { grid-template-columns: 1fr; gap: 3rem; }
  }

  /* ============ Pricing ============ */
  .pricing { background: var(--cream); }
  .pricing-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  }
  .price-card {
    background: #fff; border-radius: 1.5rem; padding: 2.5rem 2rem;
    border: 1px solid var(--line);
    transition: all .3s ease;
    position: relative;
  }
  .price-card.featured {
    background: var(--ink); color: #fff;
    border-color: var(--ink);
    transform: scale(1.03);
    box-shadow: 0 25px 50px -20px rgba(42,31,36,0.5);
  }
  .price-card.featured h3, .price-card.featured .price { color: #fff; }
  .price-card.featured p, .price-card.featured li { color: rgba(255,255,255,0.75); }
  .price-card.featured .price-sub { color: var(--rose-soft); }
  .price-card:hover { transform: translateY(-4px); }
  .price-card.featured:hover { transform: scale(1.03) translateY(-4px); }
  .price-card .badge {
    position: absolute; top: -12px; right: 50%; transform: translateX(50%);
    background: linear-gradient(135deg, var(--rose), var(--gold));
    color: #fff; padding: .35rem 1rem; border-radius: 999px;
    font-size: .75rem; font-weight: 600;
  }
  .price-card h3 { font-family: 'Aref Ruqaa', serif; font-size: 1.6rem; }
  .price-card .price {
    font-family: 'Aref Ruqaa', serif; font-size: 3rem; line-height: 1;
    margin: 1.5rem 0 .25rem;
  }
  .price-card .price-sub { font-size: .85rem; color: var(--ink-soft); margin-bottom: 1.5rem; }
  .price-card ul { list-style: none; margin: 1.5rem 0; }
  .price-card li {
    display: flex; align-items: center; gap: .65rem;
    padding: .55rem 0; font-size: .95rem;
  }
  .price-card li svg { width: 18px; height: 18px; color: var(--rose); flex-shrink: 0; }
  .price-card.featured li svg { color: var(--gold-light); }
  .price-card .btn { width: 100%; justify-content: center; margin-top: 1rem; }
  .price-card.featured .btn-primary { background: var(--rose); }
  .price-card.featured .btn-primary:hover { background: #fff; color: var(--ink); }
  .price-card .btn-ghost { border-color: var(--ink); color: var(--ink); }
  .price-card .btn-ghost:hover { background: var(--ink); color: #fff; }

  @media (max-width: 880px) {
    .pricing-grid { grid-template-columns: 1fr; }
    .price-card.featured { transform: none; }
    .price-card.featured:hover { transform: translateY(-4px); }
  }

  /* ============ Gallery ============ */
  .gallery { background: #fff; }
  .gallery-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
  }
  .gallery-grid > *:nth-child(1) { grid-column: span 2; grid-row: span 2; }
  .gallery-item {
    aspect-ratio: 1; border-radius: 1rem; overflow: hidden;
    position: relative; cursor: pointer;
  }
  .gallery-grid > *:nth-child(1) { aspect-ratio: 1; }
  .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .gallery-item:hover img { transform: scale(1.08); }
  .gallery-item .overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(42,31,36,0.7) 100%);
    opacity: 0; transition: opacity .3s;
    display: flex; align-items: flex-end; padding: 1.25rem;
  }
  .gallery-item:hover .overlay { opacity: 1; }
  .gallery-item .overlay span {
    color: #fff; font-family: 'Playfair Display', serif; font-style: italic;
  }

  @media (max-width: 720px) {
    .gallery-grid { grid-template-columns: 1fr 1fr; }
    .gallery-grid > *:nth-child(1) { grid-column: span 2; }
  }

  /* ============ Testimonials ============ */
  .testimonials {
    background: var(--rose-bg);
    position: relative;
    overflow: hidden;
  }
  .testimonials::before {
    content: '"';
    position: absolute; top: -3rem; right: -2rem;
    font-family: 'Aref Ruqaa', serif; font-size: 18rem;
    color: rgba(183,110,121,0.12); line-height: 1;
  }
  .test-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
    position: relative;
  }
  .test-card {
    background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
    border-radius: 1.5rem; padding: 2rem;
    border: 1px solid rgba(255,255,255,0.6);
  }
  .test-stars { display: flex; gap: 3px; color: var(--gold); margin-bottom: 1rem; }
  .test-stars svg { width: 18px; height: 18px; fill: currentColor; }
  .test-text { font-size: 1.02rem; line-height: 1.8; color: var(--ink); margin-bottom: 1.5rem; }
  .test-author { display: flex; align-items: center; gap: .85rem; }
  .test-author .avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: linear-gradient(135deg, var(--rose), var(--gold));
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1.05rem; font-family: 'Aref Ruqaa', serif;
  }
  .test-author .name { font-weight: 700; color: var(--ink); }
  .test-author .role { font-size: .82rem; color: var(--ink-soft); }

  @media (max-width: 880px) {
    .test-grid { grid-template-columns: 1fr; }
  }

  /* ============ Booking ============ */
  .booking {
    background: var(--ink); color: #fff;
    position: relative; overflow: hidden;
  }
  .booking-grid {
    display: grid; grid-template-columns: 1fr 1.2fr; gap: 4rem; align-items: start;
  }
  .booking-info h2 { color: #fff; }
  .booking-info h2 .accent { color: var(--rose-soft); font-style: italic; font-family: 'Aref Ruqaa', serif; }
  .booking-info p { color: rgba(255,255,255,0.7); margin: 1.5rem 0 2rem; }
  .info-list { list-style: none; }
  .info-list li { display: flex; gap: 1rem; padding: 1.1rem 0; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .info-list li:last-child { border-bottom: none; }
  .info-list .ic {
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(183,110,121,0.15); color: var(--rose-soft);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .info-list .ic svg { width: 20px; height: 20px; }
  .info-list strong { display: block; color: #fff; font-weight: 600; margin-bottom: .15rem; }
  .info-list span { color: rgba(255,255,255,0.65); font-size: .92rem; }

  .booking-form {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem; padding: 2.5rem;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-group label {
    display: block; font-size: .85rem; color: rgba(255,255,255,0.7);
    margin-bottom: .45rem; font-weight: 500;
  }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%; padding: .85rem 1rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: .65rem;
    color: #fff; font-family: inherit; font-size: .95rem;
    transition: all .2s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none; border-color: var(--rose);
    background: rgba(183,110,121,0.08);
  }
  .form-group input::placeholder, .form-group textarea::placeholder { color: rgba(255,255,255,0.35); }
  .form-group select option { background: var(--ink); color: #fff; }
  .booking-form .btn-primary { background: var(--rose); width: 100%; justify-content: center; margin-top: .5rem; padding: 1.05rem; font-size: 1.05rem; }
  .booking-form .btn-primary:hover { background: #fff; color: var(--ink); }

  @media (max-width: 880px) {
    .booking-grid { grid-template-columns: 1fr; gap: 3rem; }
    .form-row { grid-template-columns: 1fr; }
  }

  /* ============ Footer ============ */
  .footer { background: #1a1216; color: #fff; padding: 4rem 0 2rem; }
  .footer-grid {
    display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 3rem;
    margin-bottom: 3rem;
  }
  .footer-brand { max-width: 320px; }
  .footer-brand .brand-mark { margin-bottom: 1rem; }
  .footer-brand p { color: rgba(255,255,255,0.6); margin-top: 1rem; font-size: .95rem; }
  .socials { display: flex; gap: .65rem; margin-top: 1.5rem; }
  .socials a {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .socials a:hover { background: var(--rose); transform: translateY(-2px); }
  .socials svg { width: 18px; height: 18px; color: #fff; }
  .footer-col h4 {
    font-size: 1rem; margin-bottom: 1.2rem;
    color: #fff; font-weight: 600;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { padding: .4rem 0; }
  .footer-col a { color: rgba(255,255,255,0.6); font-size: .92rem; transition: color .2s; }
  .footer-col a:hover { color: var(--rose-soft); }
  .footer-col p { color: rgba(255,255,255,0.6); font-size: .92rem; line-height: 1.7; }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 1.5rem;
    display: flex; justify-content: space-between; align-items: center;
    color: rgba(255,255,255,0.45); font-size: .85rem;
    flex-wrap: wrap; gap: 1rem;
  }
  .footer-bottom .serif-en { color: var(--rose-soft); font-style: italic; }

  @media (max-width: 880px) {
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
    .footer-brand { grid-column: span 2; }
  }
  @media (max-width: 580px) {
    .footer-grid { grid-template-columns: 1fr; }
    .footer-brand { grid-column: span 1; }
  }

  /* ============ Reveal animation (progressive enhancement) ============ */
  .js-reveal .reveal {
    opacity: 0; transform: translateY(30px);
    transition: opacity .9s ease, transform .9s ease;
  }
  .js-reveal .reveal.in { opacity: 1; transform: none; }
  .js-reveal .reveal.delay-1 { transition-delay: .15s; }
  .js-reveal .reveal.delay-2 { transition-delay: .3s; }
  .js-reveal .reveal.delay-3 { transition-delay: .45s; }
  @media (prefers-reduced-motion: reduce) {
    .js-reveal .reveal { opacity: 1 !important; transform: none !important; }
  }
`;
