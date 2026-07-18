'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, User, Heart, ShoppingBag, Phone, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import type { TemplateBusiness } from '@/components/business-website/template-types';
import { getSectionSettings, getSetting } from '../section-settings';
import { FASHION_ONE_DEFAULTS } from '@/lib/fashion-one-content';
import styles from './fashion-one.module.css';

interface FashionOneLayoutProps {
  business: TemplateBusiness;
  children: React.ReactNode;
  activeCategory?: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  pinterest: string;
  youtube: string;
}

const defaultCategoryImage = '/uploads/placeholder.jpg';

export function FashionOneLayout({ business, children, activeCategory }: FashionOneLayoutProps) {
  const { totalCount: cartCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const slug = business.slug || business.id;
  const phone = business.phone || '079-000-0000';
  const workingHours =
    typeof business.workingHours === 'string'
      ? business.workingHours
      : 'يومياً ١٠ص - ١٠م';

  // ---- Branding / fonts ----
  const brandingSettings = getSectionSettings(business, 'branding');
  const fontHeading = getSetting(brandingSettings, 'fontHeading', FASHION_ONE_DEFAULTS.branding.fontHeading);
  const fontBody = getSetting(brandingSettings, 'fontBody', FASHION_ONE_DEFAULTS.branding.fontBody);
  const logoStyle = getSetting<'script' | 'serif' | 'sans'>(brandingSettings, 'logoStyle', FASHION_ONE_DEFAULTS.branding.logoStyle);
  const showTopBar = getSetting<boolean>(brandingSettings, 'showTopBar', true);
  const showLanguageCurrency = getSetting<boolean>(brandingSettings, 'showLanguageCurrency', true);

  // ---- Footer ----
  const footerSettings = getSectionSettings(business, 'footer');
  const footerBrandDescription = getSetting(
    footerSettings,
    'brandDescription',
    business.description || 'متجر متخصص بفساتين الزفاف والسهرة ومستلزمات العروس الفاخرة.'
  );
  const showSocial = getSetting<boolean>(footerSettings, 'showSocial', FASHION_ONE_DEFAULTS.footer.showSocial);
  const showPayment = getSetting<boolean>(footerSettings, 'showPayment', FASHION_ONE_DEFAULTS.footer.showPayment);
  const copyright = getSetting(
    footerSettings,
    'copyright',
    `© ${new Date().getFullYear()} ${business.name || 'Dress Shop'} · جميع الحقوق محفوظة`
  );
  const socialLinks = getSetting<SocialLinks>(
    footerSettings,
    'socialLinks',
    FASHION_ONE_DEFAULTS.footer.socialLinks as unknown as SocialLinks
  );

  // ---- Contact column ----
  const contactSettings = getSectionSettings(business, 'contact');
  const contactAddress = getSetting(contactSettings, 'address', business.address || 'شارع الموضة، المدينة');
  const contactPhone = getSetting(contactSettings, 'phone', phone);
  const contactWhatsapp = getSetting(contactSettings, 'whatsapp', phone);
  const contactEmail = business.email || 'info@dressshop.com';
  const contactHours = getSetting(contactSettings, 'hours', workingHours);

  // ---- SEO ----
  const seoSettings = getSectionSettings(business, 'seo');
  const metaTitle = getSetting(seoSettings, 'metaTitle', business.name || 'Dress Shop');
  const metaDescription = getSetting(seoSettings, 'metaDescription', business.description || '');
  const metaKeywords = getSetting(seoSettings, 'keywords', '');

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Inject Google Fonts for the configured heading/body families.
  useEffect(() => {
    const families = Array.from(new Set([fontHeading, fontBody].filter(Boolean)));
    if (!families.length) return;
    const query = families
      .map((f) => `family=${f.trim().replace(/\s+/g, '+')}:wght@400;500;600;700`)
      .join('&');
    const id = 'fashion-one-fonts-' + families.join('-').replace(/[^a-zA-Z0-9-]/g, '');
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    document.head.appendChild(link);
  }, [fontHeading, fontBody]);

  // Load Font Awesome 6 for the template's icon classes (services, footer, etc.)
  useEffect(() => {
    const id = 'fashion-one-fontawesome';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    link.integrity = 'sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    document.head.appendChild(link);
  }, []);

  // Client-side SEO meta.
  useEffect(() => {
    if (metaTitle) document.title = metaTitle;
    const setMeta = (name: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('description', metaDescription);
    setMeta('keywords', metaKeywords);
  }, [metaTitle, metaDescription, metaKeywords]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const getFirstImage = (product: { images?: { url: string }[] | null }) =>
    product.images?.[0]?.url || defaultCategoryImage;

  const weddingProducts = (business.products || []).filter((p) =>
    (p.category || '').toLowerCase().includes('wedding')
  );
  const eveningProducts = (business.products || []).filter((p) =>
    (p.category || '').toLowerCase().includes('evening')
  );
  const weddingImage = getFirstImage(weddingProducts[0] || {});
  const eveningImage = getFirstImage(eveningProducts[0] || {});

  const isActive = (cat?: string) => activeCategory === cat;

  const logoClass =
    logoStyle === 'serif'
      ? styles['logo-serif']
      : logoStyle === 'sans'
      ? styles['logo-sans']
      : styles['logo-script'];

  return (
    <div
      className={styles['fashionOne']}
      style={
        {
          ...(fontHeading ? { ['--font-heading']: `'${fontHeading}', serif` } : {}),
          ...(fontBody ? { ['--font-body']: `'${fontBody}', sans-serif` } : {}),
          ['--theme-primary']: business.theme?.primaryColor || '#c5a572',
          ['--theme-secondary']: business.theme?.secondaryColor || '#d39b87',
          ['--theme-accent']: business.theme?.accentColor || '#924c35',
          ['--theme-bg']: business.theme?.backgroundColor || '#ffffff',
          ['--theme-surface']: business.theme?.surfaceColor || '#ffffff',
          ['--theme-text']: business.theme?.textColor || '#2a2a2a',
        } as React.CSSProperties
      }
    >
      {/* Top Bar */}
      {showTopBar && (
        <div className={styles['top-bar']}>
          <div className={`${styles['container']} ${styles['top-inner']}`}>
            <div className={styles['top-left']}>
              <span>
                أهلاً بكِ، <Link href={`/business/${slug}/account/login`} className={styles['top-link']}>تسجيل الدخول</Link>
              </span>
              <span className={styles['sep']}>|</span>
              <Link href={`/business/${slug}/account`} className={styles['top-link']}>حسابي</Link>
              <span className={styles['sep']}>|</span>
              <Link href={`/business/${slug}/wishlist`} className={styles['top-link']}>قائمة الأمنيات</Link>
            </div>
            {showLanguageCurrency && (
              <div className={styles['top-right']}>
                <select className={styles['top-select']} aria-label="اللغة">
                  <option>AR</option>
                  <option>EN</option>
                  <option>FR</option>
                </select>
                <span className={styles['sep']}>|</span>
                <select className={styles['top-select']} aria-label="العملة">
                  <option>USD $</option>
                  <option>SAR ر.س</option>
                  <option>AED د.إ</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={styles['main-header']}>
        <div className={`${styles['container']} ${styles['header-inner']}`}>
          <Link href={`/business/${slug}`} className={styles['logo']}>
            <span className={logoClass}>{business.name || 'Dress Shop'}</span>
          </Link>

          <div className={styles['header-search']}>
            <input type="search" placeholder="ابحثي عن فستانكِ..." aria-label="بحث" />
            <button type="submit" aria-label="بحث">
              <Search size={14} />
            </button>
          </div>

          <div className={styles['header-right']}>
            <a href={`tel:${phone}`} className={styles['header-contact']}>
              <Phone size={22} />
              <div>
                <span>اتصلي بنا</span>
                <strong>{phone}</strong>
              </div>
            </a>
            <Link href={`/business/${slug}/account`} className={styles['header-action']} aria-label="حسابي">
              <User size={20} />
              <span>حسابي</span>
            </Link>
            <Link href={`/business/${slug}/wishlist`} className={styles['header-action']} aria-label="المفضلة">
              <Heart size={20} />
              {wishlistCount > 0 && <span className={styles['badge']}>{wishlistCount}</span>}
            </Link>
            <Link href={`/business/${slug}/cart`} className={styles['header-action']} aria-label="السلة">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={styles['badge']}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className={styles['main-nav']}>
        <div className={styles['container']}>
          <ul className={styles['nav-list']}>
            <li>
              <Link href={`/business/${slug}`} className={isActive(undefined) ? styles['active'] : ''}>
                <Home size={14} /> الرئيسية
              </Link>
            </li>
            <li className={styles['has-mega']}>
              <Link href={`/business/${slug}/shop?cat=wedding`} className={isActive('wedding') ? styles['active'] : ''}>
                فساتين الزفاف <ChevronDown size={9} />
              </Link>
              <div className={styles['mega-menu']}>
                <div className={styles['mega-col']}>
                  <h4>حسب الستايل</h4>
                  <ul>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&style=princess`}>أميرة منفوش</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&style=mermaid`}>حورية البحر</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&style=aline`}>A-Line</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&style=sheath`}>مستقيم</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&style=short`}>قصير</Link></li>
                  </ul>
                </div>
                <div className={styles['mega-col']}>
                  <h4>حسب الكم</h4>
                  <ul>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&sleeve=sleeveless`}>بدون أكمام</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&sleeve=long`}>أكمام طويلة</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&sleeve=lace`}>دانتيل</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&sleeve=one`}>كتف واحد</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=wedding&sleeve=off`}>كتف مكشوف</Link></li>
                  </ul>
                </div>
                <div className={`${styles['mega-col']} ${styles['mega-img']}`}>
                  <Link href={`/business/${slug}/shop?cat=wedding`}>
                    <img src={weddingImage} alt="تشكيلة الزفاف" />
                    <div className={styles['mega-img-text']}>
                      <span>تشكيلة 2026</span>
                      <strong>اكتشفي الجديد</strong>
                    </div>
                  </Link>
                </div>
              </div>
            </li>
            <li className={styles['has-mega']}>
              <Link href={`/business/${slug}/shop?cat=evening`} className={isActive('evening') ? styles['active'] : ''}>
                فساتين السهرة <ChevronDown size={9} />
              </Link>
              <div className={styles['mega-menu']}>
                <div className={styles['mega-col']}>
                  <h4>حسب المناسبة</h4>
                  <ul>
                    <li><Link href={`/business/${slug}/shop?cat=evening&occ=engagement`}>خطوبة</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&occ=wedding`}>زفاف</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&occ=graduation`}>تخرج</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&occ=birthday`}>عيد ميلاد</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&occ=formal`}>رسمية</Link></li>
                  </ul>
                </div>
                <div className={styles['mega-col']}>
                  <h4>حسب اللون</h4>
                  <ul>
                    <li><Link href={`/business/${slug}/shop?cat=evening&color=red`}>أحمر</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&color=black`}>أسود</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&color=blue`}>أزرق ملكي</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&color=pink`}>وردي</Link></li>
                    <li><Link href={`/business/${slug}/shop?cat=evening&color=gold`}>ذهبي</Link></li>
                  </ul>
                </div>
                <div className={`${styles['mega-col']} ${styles['mega-img']}`}>
                  <Link href={`/business/${slug}/shop?cat=evening`}>
                    <img src={eveningImage} alt="تشكيلة السهرة" />
                    <div className={styles['mega-img-text']}>
                      <span>تشكيلة حصرية</span>
                      <strong>فساتين السهرة</strong>
                    </div>
                  </Link>
                </div>
              </div>
            </li>
            <li><Link href={`/business/${slug}/shop?cat=accessories`} className={isActive('accessories') ? styles['active'] : ''}>مستلزمات العروس</Link></li>
            <li><Link href={`/business/${slug}#services`}>خدماتنا</Link></li>
            <li><Link href={`/business/${slug}#reviews`}>آراء العميلات</Link></li>
            <li><Link href={`/business/${slug}#about`}>من نحن</Link></li>
            <li><Link href={`/business/${slug}#contact`}>تواصلي معنا</Link></li>
            <li><Link href={`/business/${slug}/shop`} className={isActive('shop') ? styles['active'] : ''}>المتجر</Link></li>
          </ul>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className={styles['footer']} id="contact">
        <div className={styles['footer-top']}>
          <div className={`${styles['container']} ${styles['footer-grid']}`}>
            <div className={`${styles['footer-col']} ${styles['footer-brand']}`}>
              <Link href={`/business/${slug}`} className={`${styles['logo']} ${styles['footer-logo']}`}>
                <span className={logoClass}>{business.name || 'Dress Shop'}</span>
              </Link>
              <p>{footerBrandDescription}</p>
              {showSocial && (
                <div className={styles['social']}>
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} aria-label="Instagram"><i className="fab fa-instagram" /></a>
                  )}
                  {socialLinks.tiktok && (
                    <a href={socialLinks.tiktok} aria-label="TikTok"><i className="fab fa-tiktok" /></a>
                  )}
                  {socialLinks.pinterest && (
                    <a href={socialLinks.pinterest} aria-label="Pinterest"><i className="fab fa-pinterest-p" /></a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} aria-label="YouTube"><i className="fab fa-youtube" /></a>
                  )}
                </div>
              )}
            </div>

            <div className={styles['footer-col']}>
              <h4>INFORMATION</h4>
              <ul>
                <li><Link href={`/business/${slug}#about`}>من نحن</Link></li>
                <li><Link href={`/business/${slug}/shipping`}>التوصيل</Link></li>
                <li><Link href={`/business/${slug}/returns`}>الإرجاع والاستبدال</Link></li>
                <li><Link href={`/business/${slug}/terms`}>الشروط والأحكام</Link></li>
                <li><Link href={`/business/${slug}/privacy`}>سياسة الخصوصية</Link></li>
                <li><Link href={`/business/${slug}/faq`}>الأسئلة الشائعة</Link></li>
              </ul>
            </div>

            <div className={styles['footer-col']}>
              <h4>OUR OFFERS</h4>
              <ul>
                <li><Link href={`/business/${slug}/shop?sort=newest`}>تشكيلة جديدة</Link></li>
                <li><Link href={`/business/${slug}/shop?sort=popular`}>الأكثر مبيعاً</Link></li>
                <li><Link href={`/business/${slug}/shop?filter=sale`}>العروض الخاصة</Link></li>
                <li><Link href={`/business/${slug}/designers`}>المصممون</Link></li>
                <li><Link href={`/business/${slug}/gift-cards`}>بطاقات الإهداء</Link></li>
                <li><Link href={`/business/${slug}/stories`}>قصص العرائس</Link></li>
              </ul>
            </div>

            <div className={styles['footer-col']}>
              <h4>YOUR ACCOUNT</h4>
              <ul>
                <li><Link href={`/business/${slug}/account`}>حسابي</Link></li>
                <li><Link href={`/business/${slug}/account/profile`}>معلومات شخصية</Link></li>
                <li><Link href={`/business/${slug}/account/addresses`}>عناويني</Link></li>
                <li><Link href={`/business/${slug}/account/orders`}>تاريخ الطلبات</Link></li>
                <li><Link href={`/business/${slug}/wishlist`}>قائمة الأمنيات</Link></li>
                <li><Link href={`/business/${slug}/newsletter`}>النشرة البريدية</Link></li>
              </ul>
            </div>

            <div className={`${styles['footer-col']} ${styles['footer-contact']}`}>
              <h4>CONTACT US</h4>
              <ul>
                <li><i className="fas fa-map-marker-alt" /> {contactAddress}</li>
                <li><i className="fas fa-phone" /> {contactPhone}</li>
                <li><i className="fab fa-whatsapp" /> {contactWhatsapp}</li>
                <li><i className="fas fa-envelope" /> {contactEmail}</li>
                <li><i className="far fa-clock" /> {contactHours}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles['footer-bottom']}>
          <div className={styles['container']}>
            <div className={styles['footer-bottom-inner']}>
              <p>{copyright}</p>
              {showPayment && (
                <div className={styles['payment']}>
                  <span>طرق الدفع:</span>
                  <i className="fab fa-cc-visa" />
                  <i className="fab fa-cc-mastercard" />
                  <i className="fab fa-cc-amex" />
                  <i className="fab fa-cc-paypal" />
                  <i className="fab fa-cc-apple-pay" />
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Actions */}
      <div className={styles['float-actions']}>
        <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} className={`${styles['float-btn']} ${styles['whatsapp']}`} aria-label="واتساب">
          <i className="fab fa-whatsapp" />
        </a>
        <button
          className={`${styles['float-btn']} ${styles['scroll-top']} ${showScrollTop ? styles['visible'] : ''}`}
          onClick={scrollToTop}
          aria-label="للأعلى"
        >
          <ChevronUp size={20} />
        </button>
      </div>
    </div>
  );
}
