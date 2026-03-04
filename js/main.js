/* Cart data is stored in localStorage under key "chandellure_cart" */
const CART_KEY = 'chandellure_cart';

/* ─── helpers ─── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  // Force reflow so the CSS transition replays from the hidden state each time
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ─── add to cart ─── */
function addToCart(id, name, price, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, qty });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`"${name}" added to cart`);
}

/* ─── hamburger menu ─── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

/* ─── filter pills (shop page) ─── */
function initFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!pills.length || !cards.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.filter;
      cards.forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat)
          ? '' : 'none';
      });
    });
  });
}

/* ─── sort select (shop page) ─── */
function initSort() {
  const sel = document.getElementById('sort-select');
  const grid = document.querySelector('.products-grid');
  if (!sel || !grid) return;

  sel.addEventListener('change', () => {
    const cards = [...grid.querySelectorAll('.product-card')];
    cards.sort((a, b) => {
      const pa = parseFloat(a.dataset.price || 0);
      const pb = parseFloat(b.dataset.price || 0);
      if (sel.value === 'price-asc')  return pa - pb;
      if (sel.value === 'price-desc') return pb - pa;
      return parseFloat(a.dataset.order || 0) - parseFloat(b.dataset.order || 0);
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

/* ─── cart page ─── */
function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:4rem;margin-bottom:1rem">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a href="shop.html" class="btn btn-primary">Browse the Shop</a>
      </div>`;
    updateSummary(0, 0);
    return;
  }

  const rows = cart.map(item => `
    <tr data-id="${item.id}">
      <td>
        <div class="cart-product">
          <div class="cart-product-img img-placeholder" style="font-size:.6rem">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <span class="cart-product-name">${item.name}</span>
        </div>
      </td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <div class="qty-control">
          <button class="qty-btn" data-action="dec">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
        </div>
      </td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="remove-btn" title="Remove item">✕</button></td>
    </tr>`).join('');

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  updateSummary(subtotal, shipping);

  /* events */
  container.querySelectorAll('[data-id]').forEach(row => {
    const id = row.dataset.id;

    row.querySelector('.remove-btn').addEventListener('click', () => {
      const c = getCart().filter(i => i.id !== id);
      saveCart(c);
      updateCartBadge();
      renderCart();
    });

    row.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = getCart();
        const item = c.find(i => i.id === id);
        if (!item) return;
        if (btn.dataset.action === 'inc') item.qty += 1;
        else item.qty = Math.max(1, item.qty - 1);
        saveCart(c);
        updateCartBadge();
        renderCart();
      });
    });
  });
}

function updateSummary(subtotal, shipping) {
  const el = id => document.getElementById(id);
  if (el('summary-subtotal')) el('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  if (el('summary-shipping')) el('summary-shipping').textContent = subtotal > 0 ? `$${shipping.toFixed(2)}` : 'Free';
  if (el('summary-total'))    el('summary-total').textContent    = `$${(subtotal + (subtotal > 0 ? shipping : 0)).toFixed(2)}`;
}

/* ─── newsletter / contact forms – prevent default ─── */
function initForms() {
  document.querySelectorAll('.newsletter-form, .contact-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      showToast(form.classList.contains('newsletter-form')
        ? 'Thanks for subscribing! 🌸'
        : 'Message sent! We\'ll be in touch soon.');
      form.reset();
    });
  });
}

/* ─── active nav link ─── */
function initActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ─── checkout button (cart page) ─── */
function initCheckoutBtn() {
  const btn = document.getElementById('checkout-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty. Add some items first!');
      return;
    }
    // Placeholder – integrate a real payment processor here (e.g. Stripe, PayPal)
    showToast('Checkout coming soon! Contact hello@chandellure.com to complete your order.');
  });
}

/* ─── product media carousel ─── */
function initProductCarousels() {
  document.querySelectorAll('.product-media-carousel').forEach(carousel => {
    const items = carousel.querySelectorAll('.product-media');
    const dots  = carousel.querySelectorAll('.dot');
    if (items.length <= 1) return;
    let current = 0;

    function showItem(index) {
      const prev = current;
      current = ((index % items.length) + items.length) % items.length;
      items[prev].classList.remove('active');
      if (dots[prev]) dots[prev].classList.remove('active');
      if (items[prev].tagName === 'VIDEO') items[prev].pause();
      items[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
      if (items[current].tagName === 'VIDEO') {
        items[current].currentTime = 0;
        items[current].play().catch(() => {});
      }
    }

    setInterval(() => showItem(current + 1), 3000);
  });
}

/* ─── init ─── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initHamburger();
  initFilters();
  initSort();
  renderCart();
  initForms();
  initActiveNav();
  initCheckoutBtn();
  initProductCarousels();

  /* wire up "Add to cart" buttons that have data-* attributes */
  document.querySelectorAll('.add-to-cart-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price));
    });
  });
});
