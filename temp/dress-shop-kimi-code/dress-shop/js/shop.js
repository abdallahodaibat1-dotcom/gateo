/* ============================================
   Dress Shop — Shop / Catalog JS
   ============================================ */

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
const catParam = urlParams.get('cat') || 'all';

// All products (expanded)
const allProducts = [
    { id: 1, name: 'NUYASA MIUAYSE', cat: 'wedding', catLabel: 'فستان زفاف', image: 'images/wedding/0.jpg', price: 1800, oldPrice: null, badge: 'new', rating: 5, reviews: 128, service: 'both' },
    { id: 2, name: 'MIUAYSE', cat: 'wedding', catLabel: 'فستان زفاف', image: 'images/wedding/2.jpg', price: 2100, oldPrice: 2400, badge: 'sale', rating: 4.9, reviews: 95, service: 'both' },
    { id: 3, name: 'KYTRAS MUAST', cat: 'wedding', catLabel: 'فستان زفاف', image: 'images/wedding/princess/5.jpg', price: 2100, oldPrice: null, badge: '', rating: 5, reviews: 215, service: 'both' },
    { id: 4, name: 'YASMINE DREAM', cat: 'wedding', catLabel: 'فستان زفاف', image: 'images/wedding/8.jpg', price: 1900, oldPrice: null, badge: '', rating: 4.8, reviews: 82, service: 'both' },
    { id: 5, name: 'VENETIAN RED', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/red/2.jpg', price: 950, oldPrice: null, badge: 'new', rating: 4.9, reviews: 88, service: 'both' },
    { id: 6, name: 'VENICE BLUE', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/blue/2.jpg', price: 850, oldPrice: null, badge: '', rating: 4.7, reviews: 67, service: 'buy' },
    { id: 7, name: 'CRYSTAL GALA', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/3.jpg', price: 1200, oldPrice: null, badge: 'new', rating: 4.8, reviews: 73, service: 'rent' },
    { id: 8, name: 'BURGUNDY NIGHT', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/red/5.jpg', price: 780, oldPrice: 1200, badge: 'sale', rating: 4.8, reviews: 67, service: 'buy' },
    { id: 9, name: 'PRINCESS TIARA', cat: 'accessories', catLabel: 'إكسسوار', image: 'images/accessories/0.jpg', price: 280, oldPrice: null, badge: 'new', rating: 4.8, reviews: 67, service: 'both' },
    { id: 10, name: 'BRIDAL BOUQUET', cat: 'accessories', catLabel: 'باقة', image: 'images/accessories/bouquet/2.jpg', price: 85, oldPrice: null, badge: '', rating: 4.9, reviews: 156, service: 'both' },
    { id: 11, name: 'BRIDAL VEIL', cat: 'accessories', catLabel: 'طرحة', image: 'images/accessories/3.jpg', price: 350, oldPrice: null, badge: '', rating: 4.7, reviews: 92, service: 'both' },
    { id: 12, name: 'CRYSTAL SHOES', cat: 'accessories', catLabel: 'حذاء', image: 'images/accessories/5.jpg', price: 220, oldPrice: null, badge: 'new', rating: 4.6, reviews: 54, service: 'both' },
    { id: 13, name: 'BRIDAL JEWELRY SET', cat: 'accessories', catLabel: 'مجوهرات', image: 'images/accessories/8.jpg', price: 480, oldPrice: 600, badge: 'sale', rating: 4.9, reviews: 73, service: 'both' },
    { id: 14, name: 'ROYAL TIARA', cat: 'accessories', catLabel: 'تاج', image: 'images/accessories/1.jpg', price: 320, oldPrice: null, badge: '', rating: 4.7, reviews: 88, service: 'buy' },
    { id: 15, name: 'LACE FAN', cat: 'accessories', catLabel: 'مروحة', image: 'images/accessories/6.jpg', price: 75, oldPrice: null, badge: 'new', rating: 4.5, reviews: 32, service: 'buy' },
    { id: 16, name: 'WHITE ROSES', cat: 'accessories', catLabel: 'باقة', image: 'images/accessories/bouquet/5.jpg', price: 120, oldPrice: null, badge: '', rating: 4.9, reviews: 112, service: 'both' },
    { id: 17, name: 'PEARL NECKLACE', cat: 'accessories', catLabel: 'عقد', image: 'images/accessories/2.jpg', price: 195, oldPrice: null, badge: 'new', rating: 4.8, reviews: 64, service: 'both' },
    { id: 18, name: 'EVENING CLUTCH', cat: 'accessories', catLabel: 'حقيبة', image: 'images/accessories/9.jpg', price: 145, oldPrice: null, badge: '', rating: 4.6, reviews: 48, service: 'buy' },
    { id: 19, name: 'SATIN GLOVES', cat: 'accessories', catLabel: 'قفازات', image: 'images/accessories/4.jpg', price: 65, oldPrice: null, badge: 'new', rating: 4.5, reviews: 28, service: 'buy' },
    { id: 20, name: 'EMERALD EARRINGS', cat: 'accessories', catLabel: 'أقراط', image: 'images/accessories/7.jpg', price: 280, oldPrice: null, badge: '', rating: 4.8, reviews: 58, service: 'both' },
    { id: 21, name: 'OFF SHOULDER GOWN', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/red/0.jpg', price: 890, oldPrice: null, badge: 'new', rating: 4.7, reviews: 76, service: 'both' },
    { id: 22, name: 'GOLDEN HOUR', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/blue/4.jpg', price: 1100, oldPrice: null, badge: '', rating: 4.9, reviews: 94, service: 'rent' },
    { id: 23, name: 'MIDNIGHT BLUE', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/blue/5.jpg', price: 750, oldPrice: null, badge: 'new', rating: 4.6, reviews: 52, service: 'buy' },
    { id: 24, name: 'ROYAL ELEGANCE', cat: 'evening', catLabel: 'فستان سهرة', image: 'images/evening/0.jpg', price: 920, oldPrice: 1200, badge: 'sale', rating: 4.8, reviews: 81, service: 'both' }
];

// Category labels
const catNames = {
    all: { title: 'Our <em>Collection</em>', sub: 'اكتشفي تشكيلتنا الكاملة من فساتين الزفاف والسهرة', name: 'جميع المنتجات' },
    wedding: { title: 'Wedding <em>Dresses</em>', sub: 'فساتين الزفاف الفاخرة لحلمكِ الذي ينتظركِ', name: 'فساتين الزفاف' },
    evening: { title: 'Evening <em>Gowns</em>', sub: 'فساتين السهرة الراقية لكل مناسبة', name: 'فساتين السهرة' },
    accessories: { title: 'Bridal <em>Accessories</em>', sub: 'لمسات تكمل إطلالتكِ', name: 'مستلزمات العروس' }
};

// Set page title based on cat
const currentCat = catNames[catParam] || catNames.all;
document.getElementById('shopTitle').innerHTML = currentCat.title;
document.getElementById('shopSub').textContent = currentCat.sub;
document.getElementById('bc-cat').textContent = currentCat.name;

// ============================
// Render Products
// ============================
function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

function renderShopProducts(filterCat = 'all', sortBy = 'default') {
    let products = filterCat === 'all' ? allProducts : allProducts.filter(p => p.cat === filterCat);
    
    // Sort
    if (sortBy === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (sortBy === 'popular') products.sort((a, b) => b.reviews - a.reviews);
    
    const container = document.getElementById('shopProducts');
    container.innerHTML = products.map(p => `
        <a href="product.html?id=${p.id}" class="product-card" style="text-decoration:none;color:inherit;">
            <div class="product-img-wrap">
                <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'new' ? 'New!' : 'Sale'}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.preventDefault();showToast('أضيف للمفضلة 💕', 'heart');"><i class="far fa-heart"></i></button>
                    <button class="product-action-btn" onclick="event.preventDefault();showToast('عرض سريع', 'eye');"><i class="far fa-eye"></i></button>
                </div>
                <div class="product-quick">
                    <button class="product-quick-btn" onclick="event.preventDefault();window.location='product.html?id=${p.id}';">
                        <i class="fas fa-shopping-bag"></i> عرض التفاصيل
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">
                    <span class="stars">${renderStars(p.rating)}</span>
                    <span>${p.rating} (${p.reviews})</span>
                </div>
                <div class="product-prices">
                    <span class="price">$${p.price.toLocaleString('en-US')}</span>
                    ${p.oldPrice ? `<span class="price-old">$${p.oldPrice.toLocaleString('en-US')}</span>` : ''}
                </div>
            </div>
        </a>
    `).join('');
    
    document.getElementById('resultsCount').textContent = `عرض ${products.length} من أصل ${allProducts.length} منتج`;
}

renderShopProducts(catParam);

// ============================
// Filters
// ============================
document.querySelectorAll('input[data-filter="cat"]').forEach(cb => {
    cb.addEventListener('change', () => {
        if (cb.value === 'all' && cb.checked) {
            document.querySelectorAll('input[data-filter="cat"]').forEach(c => {
                if (c.value !== 'all') c.checked = false;
            });
        } else if (cb.value !== 'all' && cb.checked) {
            document.querySelector('input[data-filter="cat"][value="all"]').checked = false;
        }
        
        // Determine selected cat
        let selected = 'all';
        document.querySelectorAll('input[data-filter="cat"]:checked').forEach(c => {
            if (c.value !== 'all') selected = c.value;
        });
        
        renderShopProducts(selected);
    });
});

// Set initial category checkbox
if (catParam !== 'all') {
    const cb = document.querySelector(`input[data-filter="cat"][value="${catParam}"]`);
    if (cb) {
        cb.checked = true;
        document.querySelector('input[data-filter="cat"][value="all"]').checked = false;
    }
}

// ============================
// Sort
// ============================
document.getElementById('sortSelect').addEventListener('change', (e) => {
    renderShopProducts(catParam, e.target.value);
});

// ============================
// View Toggle
// ============================
document.querySelectorAll('.vt').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.vt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        document.getElementById('shopProducts').className = `shop-products ${view}`;
    });
});

// ============================
// Size Chips
// ============================
document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('active');
    });
});

// ============================
// Color Chips
// ============================
document.querySelectorAll('.color-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
    });
});

// ============================
// Price Range
// ============================
const priceRange = document.getElementById('priceRange');
priceRange.addEventListener('input', (e) => {
    document.getElementById('priceMax').textContent = `$${parseInt(e.target.value).toLocaleString('en-US')}`;
});

// ============================
// Newsletter
// ============================
document.querySelector('.news-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('شكراً لاشتراككِ! 💌', 'envelope');
    e.target.reset();
});

// ============================
// Toast
// ============================
function showToast(message, icon = 'check-circle') {
    const toast = document.getElementById('toast');
    clearTimeout(window.toastTimeout);
    toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    toast.classList.add('show');
    window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================
// Scroll to Top
// ============================
document.getElementById('scrollTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    if (window.scrollY > 600) btn.classList.add('visible');
    else btn.classList.remove('visible');
});

console.log('%c🛍️ Shop Page Loaded', 'font-size: 18px; color: #c5a572;');