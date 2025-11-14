/* =========================================
   GLOBAL.JS (Har page par load hoga)
   ========================================= */

// --- A. UNIVERSAL HELPER FUNCTIONS ---

// Browser ki memory se cart laana
function getCart() {
  return JSON.parse(localStorage.getItem('shoeonCart')) || [];
}

// Cart ko browser ki memory me save karna
function saveCart(cart) {
  localStorage.setItem('shoeonCart', JSON.stringify(cart));
  updateCartBadge(); // Save karte hi Badge update karo
}

// Naya item cart me daalna (product object chahiye)
function addItemToCart(productToAdd) {
  let cart = getCart();
  const existingProduct = cart.find(item => item.id === productToAdd.id);
  
  if (existingProduct) {
    showToast('Product is already in your cart!');
  } else {
    // Sirf zaroori info save karo
    const cartItem = {
      id: productToAdd.id,
      name: productToAdd.name,
      brand: productToAdd.brand,
      price: productToAdd.price,
      img: productToAdd.img,
      moq: productToAdd.moq,
    };
    cart.push(cartItem);
    saveCart(cart);
    showToast('Product added to cart!');
  }
}

// Cart se item delete karna
function removeItemFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  
  // Cart Drawer ko update karo
  renderCartDrawerItems();
  
  // Agar hum checkout page par hain, toh wahaan bhi update karo
  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
}

// Toast (Sandwich Popup) dikhana
let toastTimer; 
function showToast(message) {
  const toast = document.getElementById('toast-popup');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return; 

  toastMsg.innerText = message;
  toast.classList.add('show'); 
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Header par Cart Count Badge update karna
function updateCartBadge() {
  const cart = getCart();
  const cartCountBadge = document.getElementById('cart-item-count');
  if (cartCountBadge) {
    cartCountBadge.innerText = cart.length;
  }
}

// Cart Drawer ko HTML se bharna
function renderCartDrawerItems() {
  const cart = getCart();
  
  // Naye structure ke hisaab se elements dhoondo
  const cartContainer = document.getElementById('cart-items-container'); // Ye ab sirf items ka wrapper hai
  const emptyMsg = document.getElementById('cart-empty-msg'); // Ye ab alag hai
  const subtotalEl = document.getElementById('cart-subtotal');

  if (!cartContainer || !emptyMsg || !subtotalEl) return; // Safety check

  cartContainer.innerHTML = ''; // Sirf items waale dibbe ko khaali karo
  let total = 0;
  
  if (cart.length === 0) {
    // Agar cart khaali hai, toh message dikhao
    emptyMsg.style.display = 'block';
  } else {
    // Agar cart me item hai, toh message chupao
    emptyMsg.style.display = 'none';
    
    cart.forEach(item => {
      // Total
      const priceNumber = parseFloat(String(item.price).replace('₹', '').replace(',', ''));
      if (!isNaN(priceNumber)) {
        total += priceNumber;
      }
      
      // HTML
      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="item-details">
            <p class="item-brand">${item.brand}</p>
            <p class="item-name">${item.name}</p>
            <p class="item-price">${item.price} <span class="item-moq">(MOQ: ${item.moq})</span></p>
          </div>
          <button class="item-remove-btn" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>`;
    });
  }
  
  if (subtotalEl) subtotalEl.innerText = `₹${total.toFixed(2)}`;
}


// --- B. GLOBAL EVENT LISTENERS (Jo har page par chalenge) ---
document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Menu Logic
  const menuToggleBtn = document.getElementById('menu-toggle');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const overlay = document.getElementById('overlay'); 
  
  if (menuToggleBtn && closeMenuBtn && mobileNavMenu && overlay) {
    function openMenu() {
      mobileNavMenu.classList.add('active');
      overlay.classList.add('active');
    }
    function closeMenu() {
      mobileNavMenu.classList.remove('active');
      overlay.classList.remove('active');
    }
    menuToggleBtn.addEventListener('click', (e) => { e.preventDefault(); openMenu(); });
    closeMenuBtn.addEventListener('click', closeMenu);
    // Note: Overlay click ab cart bhi band karega (neeche dekho)
  }

  // 2. Cart Drawer Logic (Kholna/Band Karna)
  const cartIconBtn = document.getElementById('cart-icon-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');

  function openCart() {
    renderCartDrawerItems(); // Kholne se pehle update karo
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  }
  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    if (mobileNavMenu) mobileNavMenu.classList.remove('active'); // Mobile menu bhi band karo
  }

  if (cartIconBtn) cartIconBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart); 

  // 3. Cart me se delete button ka logic
  const cartContent = document.getElementById('cart-items-container');
  if (cartContent) {
    cartContent.addEventListener('click', function(event) {
      const removeBtn = event.target.closest('.item-remove-btn');
      if (removeBtn) {
        removeItemFromCart(removeBtn.dataset.id);
      }
    });
  }
  
  // 4. Page load hote hi Badge update karo
  updateCartBadge();
});