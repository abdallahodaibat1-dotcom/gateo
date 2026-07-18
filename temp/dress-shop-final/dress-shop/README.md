# Dress Shop · Wedding Dress Fashion Website

موقع متجر إلكتروني متكامل لبيع وتأجير فساتين الزفاف والسهرة، مستوحى من تصميم **Lovesry** الشهير بتصميمه الرومانسي الأنيق.

---

## 📦 محتويات المشروع

```
dress-shop/
├── index.html              # الصفحة الرئيسية
├── shop.html               # صفحة المتجر/الكتالوج مع فلاتر
├── product.html            # صفحة تفاصيل المنتج (مع Tabs + Accordion)
├── css/
│   ├── style.css           # التصميم الأساسي (40 KB)
│   ├── product.css         # تصميم صفحة المنتج
│   └── shop.css            # تصميم صفحة المتجر
├── js/
│   ├── main.js             # JavaScript الصفحة الرئيسية
│   ├── product.js          # JavaScript صفحة المنتج
│   └── shop.js             # JavaScript صفحة المتجر
└── images/
    ├── evening/            # صور فساتين السهرة
    ├── wedding/            # صور فساتين الزفاف
    ├── wedding/princess/   # فساتين منفوشة
    ├── evening/red/        # فساتين حمراء
    ├── evening/blue/       # فساتين زرقاء
    └── accessories/        # مستلزمات العروس
        └── bouquet/        # باقات الزهور
```

---

## 🎨 المواصفات التقنية

- **اللغة:** HTML5 + CSS3 + Vanilla JavaScript (لا توجد مكتبات خارجية ثقيلة)
- **الخطوط:** Google Fonts (Pinyon Script, Cormorant Garamond, Tajawal, Playfair Display)
- **الأيقونات:** Font Awesome 6.4 (CDN)
- **اللغة:** العربية مع دعم RTL كامل
- **Responsive:** متوافق مع جميع الشاشات (موبايل، تابلت، ديسكتوب)
- **المتصفحات:** Chrome, Safari, Firefox, Edge (حديثة)

---

## 🎯 الميزات الرئيسية

### 1. الصفحة الرئيسية (`index.html`)
- ✅ Top bar مع اختيار اللغة والعملة
- ✅ Header مع Logo + Search + Cart + Wishlist
- ✅ قائمة أفقية مع Mega Menu
- ✅ Hero Slider مع 3 صور
- ✅ 3 Category Cards (Bridal Shoes, Wedding Bouquets, Bridal Jewelry)
- ✅ Featured Products (12 منتج) مع فلاتر
- ✅ Promo Banner
- ✅ Services Section (4 خدمات)
- ✅ About Section مع إحصائيات
- ✅ Accessories Grid (6 مستلزمات)
- ✅ Reviews مع Rating Bars
- ✅ Booking Form
- ✅ Newsletter
- ✅ Footer كامل (5 أعمدة)

### 2. صفحة المتجر (`shop.html`)
- ✅ Sidebar مع فلاتر: الفئة، نوع الخدمة، السعر، المقاس، اللون
- ✅ Sort dropdown (السعر، الأحدث، الأكثر مبيعاً)
- ✅ View toggle (Grid ↔ List)
- ✅ 24 منتج
- ✅ Pagination

### 3. صفحة المنتج (`product.html`)
- ✅ Gallery مع 6 صور + thumbnails
- ✅ Color swatches (4 ألوان)
- ✅ Size selector (XS-XXL)
- ✅ Service toggle (شراء / إيجار)
- ✅ Quantity picker
- ✅ Size Guide Modal
- ✅ **5 Tabs:** Details / Specs / Shipping / Reviews / Care
- ✅ **Accordion داخل Tab:** Material & Capacity / Size & Fit / Care Instructions / Alterations
- ✅ Reviews Summary + 4 Reviews
- ✅ Related Products
- ✅ Sticky Add-to-Cart Bar (يظهر مع السكرول)
- ✅ Trust badges

---

## 🔗 الروابط والملاحة

### المنيو الرئيسي:
- `index.html` - الرئيسية
- `shop.html?cat=wedding` - فساتين الزفاف
- `shop.html?cat=evening` - فساتين السهرة
- `shop.html?cat=accessories` - مستلزمات العروس
- `#services` - خدماتنا
- `#reviews` - آراء العميلات
- `#about` - من نحن
- `#contact` - تواصلي معنا

### Mega Menu Sub-items:
- `shop.html?cat=wedding&style=princess` - أميرة منفوش
- `shop.html?cat=wedding&style=mermaid` - حورية البحر
- `shop.html?cat=evening&color=red` - أحمر
- إلخ...

---

## 🛠️ التشغيل المحلي

### الطريقة 1: فتح مباشر
فقط افتحي `index.html` في المتصفح.

### الطريقة 2: باستخدام Server (مستحسن)
```bash
cd dress-shop
python3 -m http.server 8000
# ثم افتحي http://localhost:8000
```

أو باستخدام Node.js:
```bash
npx serve dress-shop
```

أو Live Server في VS Code.

---

## 📝 التعليمات لـ Kimi (انسخيها)

```
أنا أعطيكِ موقع متجر إلكتروني متكامل جاهز في ملف ZIP. 
المشروع يحتوي على:

1. ثلاث صفحات HTML:
   - index.html (الصفحة الرئيسية)
   - shop.html (صفحة المتجر/الكتالوج)
   - product.html (صفحة تفاصيل المنتج)

2. ثلاث ملفات CSS:
   - css/style.css (التصميم الأساسي)
   - css/product.css (تصميم صفحة المنتج)
   - css/shop.css (تصميم صفحة المتجر)

3. ثلاث ملفات JavaScript:
   - js/main.js (للصفحة الرئيسية)
   - js/product.js (لصفحة المنتج)
   - js/shop.js (لصفحة المتجر)

4. مجلد images/ يحتوي على جميع الصور.

المطلوب:
1. فكي ضغط الـ ZIP
2. حافظي على نفس بنية المجلدات
3. شغّلي الموقع على local server (python3 -m http.server)
4. تأكدي إن جميع الروابط تشتغل بشكل صحيح:
   - من المنيو إلى shop.html?cat=wedding
   - من بطاقات المنتجات إلى product.html?id=X
   - بين الصفحات الثلاث

ميزات الموقع:
- نظام بيع وإيجار للفساتين
- 24 منتج مع صور حقيقية
- نظام تقييم ومراجعات
- تصميم رومانسي بألوان كريمي وذهبي
- خط Pinyon Script للشعار
- Tabs و Accordion في صفحة المنتج
- Sticky add-to-cart bar
- Modal لدليل المقاسات
- Responsive كامل

اللغة الأساسية: العربية مع دعم RTL
```

---

## 🎨 لوحة الألوان (CSS Variables)

```css
--color-bg: #ffffff;           /* خلفية بيضاء */
--color-bg-soft: #faf6f0;      /* خلفية كريمي ناعمة */
--color-bg-cream: #f5ede1;     /* كريمي */
--color-bg-pink: #f7eee8;      /* وردي بودرة */

--color-gold-deep: #a4844c;    /* ذهبي غامق */
--color-gold: #c5a572;         /* ذهبي */
--color-gold-light: #d9bc8a;   /* ذهبي فاتح */

--color-rose-deep: #b08276;    /* وردي غامق */
--color-rose: #d4a89e;         /* وردي */

--color-text: #2a2a2a;         /* نص أساسي */
--color-text-soft: #6b6b6b;    /* نص ثانوي */
```

لتغيير الألوان، عدّلي المتغيرات في `css/style.css` فقط.

---

## 🔧 التخصيصات الشائعة

### تغيير رقم الهاتف:
ابحثي في جميع الملفات عن `079-000-0000` واستبدليه برقمكِ.

### تغيير الأسعار:
- افتحي `js/main.js` → مصفوفة `products`
- افتحي `js/shop.js` → مصفوفة `allProducts`

### إضافة منتج جديد:
في `js/main.js`:
```javascript
{
    id: 13,
    name: 'اسم المنتج',
    desc: 'وصف مختصر',
    category: 'wedding', // أو evening أو accessories
    image: 'images/wedding/xxx.jpg',
    badges: ['new'], // أو ['sale'] أو []
    rating: 5,
    reviews: 100,
    rentPrice: 200,
    salePrice: 1500,
    rentAvailable: true,
    saleAvailable: true
}
```

### تغيير الخطوط:
في `<head>` من كل صفحة HTML:
```html
<link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
```

---

## 📱 Responsive Breakpoints

- `> 1024px` - ديسكتوب
- `768px - 1024px` - تابلت
- `< 768px` - موبايل

---

## 🌐 النشر

الموقع static بالكامل ويمكن نشره على:
- Netlify
- Vercel
- GitHub Pages
- أي hosting يدعم ملفات static

---

## 📞 معلومات التواصل (عدّليها)

- Phone: 079-000-0000
- WhatsApp: 079-000-0000
- Email: info@dressshop.com
- Address: شارع الموضة، المدينة

---

## 📄 الترخيص

المشروع للاستخدام التجاري الحر.
الصور من Unsplash (مجانية للاستخدام التجاري).

صُنع بحب 💕 لـ Dress Shop