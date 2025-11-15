/* =========================================
   GLOBAL.JS (Har page par load hoga)
   (FIXED - openCart ko global banaya hai)
   ========================================= */

// --- A. UNIVERSAL HELPER FUNCTIONS ---

// Browser ki memory se cart laana
function getCart() {
  return JSON.parse(localStorage.getItem("shoeonCart")) || [];
}

// Cart ko browser ki memory me save karna
function saveCart(cart) {
  localStorage.setItem("shoeonCart", JSON.stringify(cart));
  updateCartBadge(); // Save karte hi Badge update karo
}

// Naya item cart me daalna (product object chahiye)
function addItemToCart(productToAdd) {
  let cart = getCart();
  const existingProduct = cart.find((item) => item.id === productToAdd.id);

  if (existingProduct) {
    showToast("Product is already in your cart!");
  } else {
    const cartItem = {
      id: productToAdd.id,
      name: productToAdd.name,
      brand: productToAdd.brand,
      price: productToAdd.salePrice, // <-- YEH HAI FIX
      img: (productToAdd.images && productToAdd.images.length > 0) ? productToAdd.images[0] : 'images/placeholder.jpg', // Image ko bhi fix kar diya
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
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCartDrawerItems(); // Cart ko update karo
  if (typeof renderCheckoutSummary === "function") {
    renderCheckoutSummary();
  }
}

// Toast (Sandwich Popup) dikhana
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast-popup");
  const toastMsg = document.getElementById("toast-message");
  if (!toast || !toastMsg) return;

  toastMsg.innerText = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Header par Cart Count Badge update karna
function updateCartBadge() {
  const cart = getCart();
  const cartCountBadge = document.getElementById("cart-item-count");
  if (cartCountBadge) {
    cartCountBadge.innerText = cart.length;
  }
}

// Cart Drawer ko HTML se bharna
function renderCartDrawerItems() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items-container");
  const emptyMsg = document.getElementById("cart-empty-msg");
  const subtotalEl = document.getElementById("cart-subtotal");

  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
    cart.forEach((item) => {
      const priceNumber = parseFloat(
        String(item.price).replace("₹", "").replace(",", "")
      );
      if (!isNaN(priceNumber)) {
        total += priceNumber;
      }
      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="item-details">
            <p class="item-brand">${item.brand}</p>
            <p class="item-name">${item.name}</p>
            <p class="item-price">${item.price} <span class="item-moq">(MOQ: ${item.moq})</span></p>
          </div>
          <button class="item-remove-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
  }
  if (subtotalEl) subtotalEl.innerText = `₹${total.toFixed(2)}`;
}

// =========================================
//  ASLI FIX YAHAN HAI:
// 'openCart' function ab global hai
// =========================================
function openCart() {
  renderCartDrawerItems(); // 1. Pehle Cart ko update karo

  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");

  if (cartDrawer) cartDrawer.classList.add("active"); // 2. Fir Cart ko dikhao
  if (cartOverlay) cartOverlay.classList.add("active");
}

// --- B. GLOBAL EVENT LISTENERS (Jo har page par chalenge) ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Menu Logic
  const menuToggleBtn = document.getElementById("menu-toggle");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const mobileNavMenu = document.getElementById("mobile-nav-menu");
  const overlay = document.getElementById("overlay");

  if (menuToggleBtn && closeMenuBtn && mobileNavMenu && overlay) {
    function openMenu() {
      mobileNavMenu.classList.add("active");
      overlay.classList.add("active");
    }
    function closeMenu() {
      mobileNavMenu.classList.remove("active");
      overlay.classList.remove("active");
    }
    menuToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openMenu();
    });
    closeMenuBtn.addEventListener("click", closeMenu);
  }

  // 2. Cart Drawer Logic (Kholna/Band Karna)
  const cartIconBtn = document.getElementById("cart-icon-btn");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartCloseBtn = document.getElementById("cart-close-btn");

  // closeCart function abhi bhi private (andar) hi hai
  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartOverlay) cartOverlay.classList.remove("active");
    if (mobileNavMenu) mobileNavMenu.classList.remove("active"); // Mobile menu bhi band karo
  }

  // Cart icon ab global 'openCart' ko call karega
  if (cartIconBtn)
    cartIconBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // 3. Cart me se delete button ka logic
  const cartContent = document.getElementById("cart-items-container");
  if (cartContent) {
    cartContent.addEventListener("click", function (event) {
      const removeBtn = event.target.closest(".item-remove-btn");
      if (removeBtn) {
        removeItemFromCart(removeBtn.dataset.id);
      }
    });
  }

  // 4. Page load hote hi Badge update karo
  updateCartBadge();
});
