import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'ar-SA' });

  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`[page error] ${err.message}`));

  await page.goto('http://localhost:3000/business/rt-lg-health-demo-spa', { waitUntil: 'networkidle', timeout: 60000 });

  // Scroll to bottom slowly
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 80);
    });
  });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const sections = ['about', 'services', 'gallery', 'booking'];
    const testimonials = document.querySelector('.testimonials');
    return sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const rect = el.getBoundingClientRect();
      const children = Array.from(el.children).map((c) => ({
        tag: c.tagName,
        class: (c as HTMLElement).className,
        height: (c as HTMLElement).getBoundingClientRect().height,
        opacity: window.getComputedStyle(c).opacity,
      }));
      return {
        id,
        found: true,
        rect: { top: rect.top, height: rect.height },
        childCount: children.length,
        children: children.slice(0, 4),
      };
    });
  });

  const supportsInfo = await page.evaluate(() => {
    return {
      supportsAnimationTimeline: CSS.supports('animation-timeline', 'view()'),
      supportsView: CSS.supports('(animation-timeline: view())'),
    };
  });
  console.log(JSON.stringify(supportsInfo, null, 2));

  const revealInfo = await page.evaluate(() => {
    const testimonials = document.querySelector('.testimonials');
    const firstGalleryItem = document.querySelector('.gallery-item');
    const firstGalleryItemStyle = firstGalleryItem ? {
      opacity: window.getComputedStyle(firstGalleryItem).opacity,
      transform: window.getComputedStyle(firstGalleryItem).transform,
      classList: Array.from(firstGalleryItem.classList),
      rect: firstGalleryItem.getBoundingClientRect(),
    } : null;
    return {
      testimonialsExists: !!testimonials,
      testimonialsDisplay: testimonials ? window.getComputedStyle(testimonials).display : null,
      testimonialsOpacity: testimonials ? window.getComputedStyle(testimonials).opacity : null,
      testimonialsRect: testimonials ? testimonials.getBoundingClientRect() : null,
      revealCount: document.querySelectorAll('.reveal').length,
      inCount: document.querySelectorAll('.reveal.in').length,
      galleryItems: document.querySelectorAll('.gallery-item').length,
      galleryItemsHidden: Array.from(document.querySelectorAll('.gallery-item')).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '0' || style.transform !== 'none';
      }).length,
      firstGalleryItemStyle,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  console.log(JSON.stringify(revealInfo, null, 2));

  await browser.close();
})();
