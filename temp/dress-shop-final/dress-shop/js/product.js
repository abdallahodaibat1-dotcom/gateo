/* ============================================
   Dress Shop — Product Detail JS
   ============================================ */

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id')) || 1;

// Default product data (would normally come from server)
const defaultProduct = {
    id: productId,
    name: 'فستان الأميرة روز',
    category: 'wedding',
    catLabel: 'فستان زفاف',
    image: 'images/wedding/princess/0.jpg',
    images: [
        'images/wedding/princess/0.jpg',
        'images/wedding/princess/2.jpg',
        'images/wedding/princess/5.jpg',
        'images/wedding/2.jpg',
        'images/wedding/8.jpg',
        'images/wedding/0.jpg'
    ],
    badges: ['new'],
    rating: 5,
    reviews: 128,
    rentPrice: 350,
    salePrice: 1800,
    oldPrice: null,
    rentAvailable: true,
    saleAvailable: true
};

// Product page reviews
const productReviews = [
    { name: 'سارة الخوري', role: 'عروس · عمّان', text: 'الفستان فاق توقعاتي! التطريز يدوي والتفاصيل دقيقة جداً. استمتعت بكل لحظة.', rating: 5, initial: 'س', date: 'قبل شهر' },
    { name: 'نور الحريري', role: 'عروس · بيروت', text: 'اشتريته لمناسبة خطوبتي وكان مناسب جداً. الخامة فخمة والمقاس مضبوط.', rating: 5, initial: 'ن', date: 'قبل شهرين' },
    { name: 'هدى الزعبي', role: 'عروس · عمّان', text: 'خدمة عملاء ممتازة وتعديلات مجانية خلال شهر. تجربة رائعة.', rating: 4, initial: 'ه', date: 'قبل ٣ أشهر' },
    { name: 'ليلى عبد الله', role: 'عروس · الرياض', text: 'الفستان يشبه الصور تماماً. استلمته في الوقت المحدد وبحالة ممتازة.', rating: 5, initial: 'ل', date: 'قبل ٤ أشهر' }
];

// ============================
// Render Product
// ============================
function renderProduct() {
    const p = defaultProduct;
    
    document.getElementById('pdName').textContent = p.name;
    document.getElementById('pdCategory').textContent = p.catLabel;
    document.getElementById('bc-product-name').textContent = p.name;
    document.getElementById('bc-cat-link').textContent = p.catLabel;
    document.getElementById('mainProductImg').src = p.images[0];
    document.title = `${p.name} · Dress Shop`;
    
    // Badge
    const badge = document.getElementById('mainBadge');
    if (p.badges.length) {
        badge.textContent = p.badges[0] === 'new' ? 'New!' : 'Sale';
        badge.className = `pd-badge ${p.badges[0]}`;
    } else {
        badge.style.display = 'none';
    }
    
    // Rating
    const starsHtml = renderStars(p.rating);
    document.getElementById('pdStars').innerHTML = starsHtml;
    document.getElementById('pdRating').textContent = p.rating.toFixed(1);
    document.getElementById('pdReviewsCount').textContent = `(${p.reviews} تقييم)`;
    
    // Price
    document.getElementById('pdPriceNow').textContent = `$${p.salePrice.toLocaleString('en-US')}`;
    if (p.oldPrice) {
        document.getElementById('pdPriceOld').textContent = `$${p.oldPrice.toLocaleString('en-US')}`;
        document.getElementById('pdDiscount').textContent = `-${Math.round((1 - p.salePrice / p.oldPrice) * 100)}%`;
    }
    
    // Thumbnails
    const thumbsContainer = document.getElementById('pdThumbs');
    thumbsContainer.innerHTML = p.images.map((img, i) => `
        <div class="pd-thumb ${i === 0 ? 'active' : ''}" data-img="${img}">
            <img src="${img}" alt="صورة ${i + 1}">
        </div>
    `).join('');
    
    // Thumbnail click
    thumbsContainer.querySelectorAll('.pd-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbsContainer.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            document.getElementById('mainProductImg').src = thumb.dataset.img;
        });
    });
    
    // Sticky cart
    document.getElementById('stickyImg').src = p.images[0];
    document.getElementById('stickyName').textContent = p.name;
    document.getElementById('stickyPrice').textContent = `$${p.salePrice.toLocaleString('en-US')}`;
}

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

// ============================
// Quantity
// ============================
const qtyInput = document.getElementById('qtyInput');
document.getElementById('qtyMinus').addEventListener('click', () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
});
document.getElementById('qtyPlus').addEventListener('click', () => {
    qtyInput.value = Math.min(10, parseInt(qtyInput.value) + 1);
});

// ============================
// Color & Size Selection
// ============================
document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        document.getElementById('colorLabel').textContent = sw.dataset.color;
    });
});

document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.querySelectorAll('.service-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.service-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const mode = opt.dataset.mode;
        const p = defaultProduct;
        if (mode === 'buy' && p.saleAvailable) {
            document.getElementById('pdPriceNow').textContent = `$${p.salePrice.toLocaleString('en-US')}`;
        } else if (mode === 'rent' && p.rentAvailable) {
            document.getElementById('pdPriceNow').textContent = `$${p.rentPrice} / يوم`;
        }
    });
});

// ============================
// Size Guide Modal
// ============================
const sizeModal = document.getElementById('sizeGuideModal');
document.getElementById('openSizeGuide').addEventListener('click', (e) => {
    e.preventDefault();
    sizeModal.classList.add('show');
});
document.getElementById('closeSizeGuide').addEventListener('click', () => {
    sizeModal.classList.remove('show');
});
sizeModal.querySelector('.modal-overlay').addEventListener('click', () => {
    sizeModal.classList.remove('show');
});

// ============================
// Add to Cart & Wishlist
// ============================
function showToast(message, icon = 'check-circle') {
    const toast = document.getElementById('toast');
    clearTimeout(window.toastTimeout);
    toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    toast.classList.add('show');
    window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

document.getElementById('addToCart').addEventListener('click', () => {
    const qty = qtyInput.value;
    showToast(`تمت إضافة ${qty} من "${defaultProduct.name}" للسلة ✨`, 'check-circle');
    const badges = document.querySelectorAll('.header-action .badge');
    if (badges.length) {
        const cartBadge = badges[badges.length - 1];
        cartBadge.textContent = parseInt(cartBadge.textContent) + parseInt(qty);
    }
    createConfetti();
});

document.getElementById('stickyAdd').addEventListener('click', () => {
    document.getElementById('addToCart').click();
});

document.getElementById('addWishlist').addEventListener('click', function() {
    const icon = this.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        this.classList.add('active');
        showToast('تمت الإضافة إلى المفضلة 💕', 'heart');
        const favBadge = document.querySelectorAll('.header-action .badge')[0];
        if (favBadge) favBadge.textContent = parseInt(favBadge.textContent) + 1;
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        this.classList.remove('active');
        const favBadge = document.querySelectorAll('.header-action .badge')[0];
        if (favBadge) favBadge.textContent = Math.max(0, parseInt(favBadge.textContent) - 1);
    }
});

// ============================
// Tabs
// ============================
document.querySelectorAll('.pd-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Buttons
        document.querySelectorAll('.pd-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Panels
        document.querySelectorAll('.pd-tab-panel').forEach(p => p.classList.remove('active'));
        const targetPanel = document.getElementById(`tab-${tab}`);
        if (targetPanel) targetPanel.classList.add('active');
    });
});

// ============================
// Accordion
// ============================
document.querySelectorAll('.pd-acc-head').forEach(head => {
    head.addEventListener('click', () => {
        const item = head.parentElement;
        const isOpen = item.classList.contains('open');
        
        // Close all
        document.querySelectorAll('.pd-acc-item').forEach(i => i.classList.remove('open'));
        
        // Open clicked (if was closed)
        if (!isOpen) item.classList.add('open');
    });
});

// ============================
// Reviews List
// ============================
function renderProductReviews() {
    const container = document.getElementById('reviewsList');
    container.innerHTML = productReviews.map(r => `
        <article class="review-item">
            <div class="review-item-head">
                <div class="review-item-avatar">${r.initial}</div>
                <div class="review-item-info">
                    <h4>${r.name} ${r.rating === 5 ? '<span class="verified-tag"><i class="fas fa-check-circle"></i> مشتراة موثقة</span>' : ''}</h4>
                    <p>${r.role} · ${r.date}</p>
                </div>
            </div>
            <div class="stars">${renderStars(r.rating)}</div>
            <p class="review-text">${r.text}</p>
        </article>
    `).join('');
}

renderProductReviews();

// Reviews summary
document.getElementById('rs-stars').innerHTML = renderStars(defaultProduct.rating);

// ============================
// Related Products
// ============================
function renderRelated() {
    const related = [
        { id: 2, name: 'MIUAYSE', image: 'images/wedding/2.jpg', price: 2100, oldPrice: 2400, badge: 'sale' },
        { id: 3, name: 'KYTRAS MUAST', image: 'images/wedding/princess/5.jpg', price: 2100, badge: '' },
        { id: 5, name: 'YASMINE DREAM', image: 'images/evening/red/2.jpg', price: 950, badge: 'new' },
        { id: 9, name: 'PRINCESS TIARA', image: 'images/accessories/0.jpg', price: 280, badge: 'new' }
    ];
    
    const container = document.getElementById('relatedGrid');
    container.innerHTML = related.map(p => `
        <a href="product.html?id=${p.id}" class="product-card" style="text-decoration:none;">
            <div class="product-img-wrap">
                <img src="${p.image}" alt="${p.name}" class="product-img">
                ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'new' ? 'New!' : 'Sale'}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.preventDefault();"><i class="far fa-heart"></i></button>
                    <button class="product-action-btn" onclick="event.preventDefault();"><i class="far fa-eye"></i></button>
                </div>
                <div class="product-quick">
                    <button class="product-quick-btn">عرض سريع</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">
                    <span class="stars">${renderStars(4.8)}</span>
                    <span>4.8</span>
                </div>
                <div class="product-prices">
                    <span class="price">$${p.price.toLocaleString('en-US')}</span>
                    ${p.oldPrice ? `<span class="price-old">$${p.oldPrice.toLocaleString('en-US')}</span>` : ''}
                </div>
            </div>
        </a>
    `).join('');
}

renderRelated();

// ============================
// Sticky Cart Visibility
// ============================
const stickyCart = document.getElementById('stickyCart');
window.addEventListener('scroll', () => {
    if (window.scrollY > 600) stickyCart.classList.add('visible');
    else stickyCart.classList.remove('visible');
});

// ============================
// Confetti
// ============================
function createConfetti() {
    const colors = ['#c5a572', '#d4a89e', '#ecd9d2', '#f5e4dd'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);
    
    for (let i = 0; i < 40; i++) {
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

// Init
renderProduct();
console.log('%c✨ Product Page Loaded', 'font-size: 18px; color: #c5a572;');