// Data: sample menu
const MENU_ITEMS = [
  { id: 'm1', name: 'Spicy Veg Pizza', price: 8.99, desc: 'Thin crust, bell peppers, olives, jalapeños.', img: 'https://images.unsplash.com/photo-1542282811-943ef1a977c3?q=80&w=1600&auto=format&fit=crop', badge: 'Best Seller' },
  { id: 'm2', name: 'Cheesy Burger', price: 6.49, desc: 'Juicy patty, melted cheddar, fresh veggies.', img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1600&auto=format&fit=crop', badge: 'Hot' },
  { id: 'm3', name: 'Garden Salad', price: 5.25, desc: 'Crunchy greens with tangy vinaigrette.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop', badge: 'Fresh' },
  { id: 'm4', name: 'Pasta Alfredo', price: 9.50, desc: 'Creamy garlic sauce with parmesan.', img: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?q=80&w=1600&auto=format&fit=crop' },
  { id: 'm5', name: 'Chicken Tacos', price: 7.75, desc: 'Zesty lime chicken with salsa.', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1600&auto=format&fit=crop' },
  { id: 'm6', name: 'Sushi Platter', price: 12.00, desc: 'Assorted rolls, wasabi, and ginger.', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop' }
];

// State
const cart = new Map(); // id -> { item, qty }

// Elements
const menuGridEl = document.getElementById('menu-grid');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const cartDeliveryEl = document.getElementById('cart-delivery');
const checkoutBtn = document.getElementById('checkout-btn');
const navToggleBtn = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');
const toastContainerEl = document.getElementById('toast-container');

const DELIVERY_FEE = 2.5;

function formatCurrency(num){
  return `$${num.toFixed(2)}`;
}

function renderMenu(){
  const fragment = document.createDocumentFragment();
  MENU_ITEMS.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        <img src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${item.id}/600/400';">
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">
          <h3>${item.name}</h3>
          <span class="price">${formatCurrency(item.price)}</span>
        </div>
        <p class="desc">${item.desc}</p>
        <div class="card-actions">
          <button class="add-btn" data-id="${item.id}"><i class="fa-solid fa-plus"></i> Order Now</button>
        </div>
      </div>
    `;
    fragment.appendChild(card);
  });
  menuGridEl.appendChild(fragment);
}

function updateCartBadge(){
  let totalQty = 0;
  cart.forEach(({ qty }) => totalQty += qty);
  cartCountEl.textContent = totalQty.toString();
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  let subtotal = 0;

  cart.forEach(({ item, qty }) => {
    subtotal += item.price * qty;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${item.id}-cart/160/160';">
      <div>
        <h4>${item.name}</h4>
        <div class="ci-price">${formatCurrency(item.price)}</div>
      </div>
      <div class="ci-controls">
        <button aria-label="decrease" data-action="dec" data-id="${item.id}">-</button>
        <span>${qty}</span>
        <button aria-label="increase" data-action="inc" data-id="${item.id}">+</button>
        <button aria-label="remove" data-action="remove" data-id="${item.id}" title="Remove">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    fragment.appendChild(li);
  });

  cartItemsEl.appendChild(fragment);
  cartSubtotalEl.textContent = formatCurrency(subtotal);
  cartDeliveryEl.textContent = formatCurrency(cart.size > 0 ? DELIVERY_FEE : 0);
  const total = subtotal + (cart.size > 0 ? DELIVERY_FEE : 0);
  cartTotalEl.textContent = formatCurrency(total);
}

function addToCart(id){
  const item = MENU_ITEMS.find(m => m.id === id);
  if(!item) return;
  if(cart.has(id)){
    cart.get(id).qty += 1;
  } else {
    cart.set(id, { item, qty: 1 });
  }
  updateCartBadge();
  renderCart();

  // Feedback: toast + cart pulse
  showToast(`${item.name} added to cart`);
  pulseCartIcon();
}

function changeQty(id, delta){
  if(!cart.has(id)) return;
  const entry = cart.get(id);
  entry.qty += delta;
  if(entry.qty <= 0){
    cart.delete(id);
  }
  updateCartBadge();
  renderCart();
}

function removeFromCart(id){
  cart.delete(id);
  updateCartBadge();
  renderCart();
}

// Event delegation
document.addEventListener('click', (e) => {
  const target = e.target;
  if(!(target instanceof HTMLElement)) return;

  // Add to cart
  if(target.closest('.add-btn')){
    const btn = target.closest('.add-btn');
    const id = btn.getAttribute('data-id');
    if(id) addToCart(id);
  }

  // Cart control buttons
  if(target.matches('[data-action]') || target.closest('[data-action]')){
    const btn = target.matches('[data-action]') ? target : target.closest('[data-action]');
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if(!id || !action) return;
    if(action === 'inc') changeQty(id, +1);
    if(action === 'dec') changeQty(id, -1);
    if(action === 'remove') removeFromCart(id);
  }
});

// Mobile nav toggle
navToggleBtn?.addEventListener('click', () => {
  navLinksEl?.classList.toggle('open');
});

// Simple checkout
checkoutBtn?.addEventListener('click', () => {
  if(cart.size === 0){
    alert('Your cart is empty. Add something tasty!');
    return;
  }
  alert('Thank you! Your order is being processed.');
  cart.clear();
  updateCartBadge();
  renderCart();
});

// Footer year
const yearEl = document.getElementById('year');
if(yearEl){ yearEl.textContent = String(new Date().getFullYear()); }

// Init
renderMenu();
updateCartBadge();
renderCart();

function showToast(message){
  if(!toastContainerEl) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;
  toastContainerEl.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 250);
  }, 1600);
}

function pulseCartIcon(){
  const cartLink = document.querySelector('.cart-link');
  if(!cartLink) return;
  cartLink.classList.add('pulse');
  setTimeout(() => cartLink.classList.remove('pulse'), 600);
}


