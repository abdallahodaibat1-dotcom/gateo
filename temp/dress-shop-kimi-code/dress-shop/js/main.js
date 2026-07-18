/* ============================================
   Dress Shop — LoveSry Inspired JS
   ============================================ */

// ============================
// Products Data
// ============================
const products = [
    {
        id: 1,
        name: 'NUYASA MIUAYSE',
        desc: 'may.as.fusianenasa.kerry.aira.jahwas',
        category: 'wedding',
        image: 'images/wedding/0.jpg',
        badges: ['new'],
        rating: 5,
        reviews: 128,
        rentPrice: 350,
        salePrice: 1800,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 2,
        name: 'MIUAYSE',
        desc: 'may.as.fusianenasa.kerry.aira.jahwas',
        category: 'wedding',
        image: 'images/wedding/2.jpg',
        badges: ['sale'],
        oldPrice: 2400,
        rating: 4.9,
        reviews: 95,
        rentPrice: 280,
        salePrice: 2100,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 3,
        name: 'KYTRAS MUAST',
        desc: 'may.as.fusianenasa.kerry.aira.jahwas',
        category: 'wedding',
        image: 'images/wedding/princess/5.jpg',
        badges: [],
        rating: 5,
        reviews: 215,
        rentPrice: 380,
        salePrice: 2100,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 4,
        name: 'KYTRAS MUAST',
        desc: 'may.as.fusianenasa.kerry.aira.jahwas',
        category: 'wedding',
        image: 'images/wedding/8.jpg',
        badges: [],
        rating: 4.8,
        reviews: 82,
        rentPrice: 320,
        salePrice: 1900,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 5,
        name: 'YASMINE DREAM',
        desc: 'evening.dress.luxury.crystal',
        category: 'evening',
        image: 'images/evening/red/2.jpg',
        badges: ['new'],
        rating: 4.9,
        reviews: 88,
        rentPrice: 180,
        salePrice: 950,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 6,
        name: 'VENICE BLUE',
        desc: 'evening.royal.blue.gown',
        category: 'evening',
        image: 'images/evening/blue/2.jpg',
        badges: [],
        rating: 4.7,
        reviews: 67,
        rentPrice: null,
        salePrice: 850,
        rentAvailable: false,
        saleAvailable: true
    },
    {
        id: 7,
        name: 'CRYSTAL GALA',
        desc: 'evening.beaded.luxury',
        category: 'evening',
        image: 'images/evening/3.jpg',
        badges: ['new'],
        rating: 4.8,
        reviews: 73,
        rentPrice: 220,
        salePrice: null,
        rentAvailable: true,
        saleAvailable: false
    },
    {
        id: 8,
        name: 'BURGUNDY NIGHT',
        desc: 'evening.burgundy.elegant',
        category: 'evening',
        image: 'images/evening/red/5.jpg',
        badges: ['sale'],
        oldPrice: 1200,
        rating: 4.8,
        reviews: 67,
        rentPrice: null,
        salePrice: 780,
        rentAvailable: false,
        saleAvailable: true
    },
    {
        id: 9,
        name: 'PRINCESS TIARA',
        desc: 'accessory.crown.crystal',
        category: 'accessories',
        image: 'images/accessories/0.jpg',
        badges: ['new'],
        rating: 4.8,
        reviews: 67,
        rentPrice: 45,
        salePrice: 280,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 10,
        name: 'BRIDAL BOUQUET',
        desc: 'flowers.white.roses',
        category: 'accessories',
        image: 'images/accessories/bouquet/2.jpg',
        badges: [],
        rating: 4.9,
        reviews: 156,
        rentPrice: 25,
        salePrice: 85,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 11,
        name: 'BRIDAL VEIL',
        desc: 'veil.long.cathedral',
        category: 'accessories',
        image: 'images/accessories/3.jpg',
        badges: [],
        rating: 4.7,
        reviews: 92,
        rentPrice: 60,
        salePrice: 350,
        rentAvailable: true,
        saleAvailable: true
    },
    {
        id: 12,
        name: 'CRYSTAL SHOES',
        desc: 'shoes.bridal.heels',
        category: 'accessories',
        image: 'images/accessories/5.jpg',
        badges: ['new'],
        rating: 4.6,
        reviews: 54,
        rentPrice: 35,
        salePrice: 220,
        rentAvailable: true,
        saleAvailable: true
    }
];

const reviews = [
    {
        name: 'سارة الخوري',
        role: 'عروس · عمّان',
        text: 'تجربتي مع Dress Shop كانت أحلى من أحلامي! الفستان كان مثالي والخادمات كنّ رائعات. شكراً لجعل يومي مميزاً 💕',
        rating: 5,
        initial: 'س'
    },
    {
        name: 'نور الحريري',
        role: 'عروس · بيروت',
        text: 'استأجرت فستان سهرة لمناسبة خطوبتي، الفستان كان بحالة ممتازة وكان السعر معقول جداً. أنصح بهم بشدة!',
        rating: 5,
        initial: 'ن'
    },
    {
        name: 'رنا المصري',
        role: 'عروس · دمشق',
        text: 'اشتريت فستان عرسي من عندهم، والتعديلات كانت مجانية والاحترافية عالية. شغل يستاهل كل ريال 💎',
        rating: 5,
        initial: 'ر'
    },
    {
        name: 'ليلى عبد الله',
        role: 'عروس · الرياض',
        text: 'الطاقم ساعدني اختار الفستان المثالي لجسمي. مش بس فستان، تجربة كاملة من البداية حتى النهاية 👰',
        rating: 5,
        initial: 'ل'
    },
    {
        name: 'هدى الزعبي',
        role: 'عروس · عمّان',
        text: 'المستلزمات كانت فخمة جداً، التاج والمجوهرات أضافوا لمسة سحرية لإطلالتي. شكراً Dress Shop!',
        rating: 4,
        initial: 'ه'
    },
    {
        name: 'مريم الناصر',
        role: 'عروس · جدة',
        text: 'خمس نجوم وما بوفي حقهم! من الاستقبال للاستشارة للقياس حتى الاستلام، كل شيء كان احترافي ومريح',
        rating: 5,
        initial: 'م'
    }
];

// ============================
// Hero Slider
// ============================
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dots .dot');
let currentSlide = 0;

function goToSlide(index) {
    heroSlides.forEach(s => s.classList.remove('active'));
    heroDots.forEach(d => d.classList.remove('active'));
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
    heroDots[currentSlide].classList.add('active');
}

document.querySelector('.hero-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
document.querySelector('.hero-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));

heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
});

// Auto-play
setInterval(() => goToSlide(currentSlide + 1), 6500);

// ============================
// Render Products
// ============================
function renderStarRating(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

function getBadgeLabel(badge) {
    const map = {
        new: 'New!',
        sale: 'Sale'
    };
    return map[badge] || badge;
}

function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    grid.innerHTML = filtered.map(p => {
        const showOld = p.badges.includes('sale') && p.oldPrice;
        const priceHTML = p.saleAvailable ? `
            <div class="product-prices">
                <span class="price-mode">Sale Price</span>
                <span class="price">$${p.salePrice.toLocaleString('en-US')}</span>
                ${showOld ? `<span class="price-old">$${p.oldPrice.toLocaleString('en-US')}</span>` : ''}
            </div>
        ` : `
            <div class="product-prices">
                <span class="price-mode">Rent / Day</span>
                <span class="price">$${p.rentPrice}</span>
            </div>
        `;
        
        return `
        <a href="product.html?id=${p.id}" class="product-card" data-cat="${p.category}" style="text-decoration:none;color:inherit;">
            <div class="product-img-wrap">
                <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                ${p.badges.length ? `<span class="product-badge ${p.badges[0]}">${getBadgeLabel(p.badges[0])}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.preventDefault();toggleFav(this)" title="أضيفي للمفضلة">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="product-action-btn" onclick="event.preventDefault();quickView(${p.id})" title="عرض سريع">
                        <i class="far fa-eye"></i>
                    </button>
                </div>
                <div class="product-quick">
                    <button class="product-quick-btn" onclick="event.preventDefault();window.location='product.html?id=${p.id}'">
                        <i class="fas fa-shopping-bag"></i> عرض التفاصيل
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">
                    <span class="stars">${renderStarRating(p.rating)}</span>
                    <span>${p.rating} (${p.reviews})</span>
                </div>
                <p class="product-desc">${p.desc}</p>
                ${priceHTML}
            </div>
        </a>`;
    }).join('');
}

renderProducts();

// ============================
// Filter Tabs
// ============================
let currentFilter = 'all';

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderProducts(currentFilter);
    });
});

// ============================
// Render Reviews
// ============================
function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    
    grid.innerHTML = reviews.map(r => `
        <article class="review-card">
            <span class="review-quote">"</span>
            <div class="review-stars">${renderStarRating(r.rating)}</div>
            <p class="review-text">${r.text}</p>
            <div class="review-author">
                <div class="review-avatar">${r.initial}</div>
                <div class="review-info">
                    <h4>${r.name}</h4>
                    <p>${r.role}</p>
                </div>
            </div>
        </article>
    `).join('');
}

renderReviews();

// ============================
// Quick View & Cart
// ============================
function quickView(id) {
    const p = products.find(x => x.id === id);
    if (p) showToast(`عرض سريع: ${p.name}`, 'eye');
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (p) {
        showToast(`تمت إضافة "${p.name}" للسلة بنجاح ✨`, 'check-circle');
        const badges = document.querySelectorAll('.header-action .badge');
        const cartBadge = badges[badges.length - 1];
        if (cartBadge) {
            cartBadge.textContent = parseInt(cartBadge.textContent) + 1;
        }
    }
}

function toggleFav(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.style.background = 'var(--color-gold-deep)';
        btn.style.color = '#fff';
        showToast('تمت الإضافة إلى المفضلة 💕', 'heart');
        const favBadge = document.querySelectorAll('.header-action .badge')[0];
        if (favBadge) favBadge.textContent = parseInt(favBadge.textContent) + 1;
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.style.background = '';
        btn.style.color = '';
        const favBadge = document.querySelectorAll('.header-action .badge')[0];
        if (favBadge) favBadge.textContent = Math.max(0, parseInt(favBadge.textContent) - 1);
    }
}

// ============================
// Toast
// ============================
const toast = document.getElementById('toast');
let toastTimeout;

function showToast(message, icon = 'check-circle') {
    clearTimeout(toastTimeout);
    toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================
// Booking Form
// ============================
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const name = formData.get('name');
        showToast(`شكراً ${name}! تم استلام طلبكِ 💕`, 'check-circle');
        bookingForm.reset();
        createConfetti();
    });
}

// ============================
// Confetti
// ============================
function createConfetti() {
    const colors = ['#c5a572', '#d4a89e', '#ecd9d2', '#f5e4dd'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        piece.style.cssText = `
            position: absolute;
            top: -20px;
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size * 0.4}px;
            background: ${color};
            transform: rotate(${Math.random() * 360}deg);
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        container.appendChild(piece);
    }
    
    setTimeout(() => container.remove(), 4000);
}

const confettiStyle = document.createElement('style');
confettiStyle.textContent = `@keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
document.head.appendChild(confettiStyle);

// ============================
// Newsletter
// ============================
document.querySelector('.news-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    showToast(`شكراً لاشتراككِ! 💌`, 'envelope');
    input.value = '';
});

// ============================
// Scroll to Top
// ============================
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 600) scrollTopBtn.classList.add('visible');
    else scrollTopBtn.classList.remove('visible');
});

scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================
// Active Nav Link on Scroll
// ============================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-list > li > a');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY > top && scrollY <= bottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) link.classList.add('active');
            });
        }
    });
});

// ============================
// Reveal on Scroll
// ============================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.cat-card, .product-card, .service-card, .acc-card, .review-card, .about-img, .about-content').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ============================
// Smooth Scroll
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length <= 1) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

console.log('%c✨ Dress Shop', 'font-size: 28px; font-weight: bold; color: #c5a572;');
console.log('%صُنع بحب لإطلالة أحلامكِ', 'font-size: 14px; color: #a4844c;');