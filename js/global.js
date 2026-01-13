/* =========================================
   GLOBAL.JS (Har page par load hoga)
   (FIXED - openCart ko global banaya hai)
   ========================================= */

     (function checkLogin() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    // Ye wo pages hain jaha bina login ke ja sakte hain (Inhe rokna nahi hai)
    const allowedPages = ['login.html', 'register.html', 'forgot-password.html', 'admin-login.html'];

    // Check: Agar hum allowed page par nahi hain
    const isAllowedPage = allowedPages.some(page => currentPath.includes(page));

    // Agar Token nahi hai AUR hum protected page par hain -> Login pe bhejo
    if (!token && !isAllowedPage) {
        window.location.href = 'login.html';
    }
})();
/* ========================================= */

// --- A. UNIVERSAL HELPER FUNCTIONS ---

// Check karo user logged in hai ya nahi
function isUserLoggedIn() {
  const user = localStorage.getItem("shoeonUser");
  return user ? true : false; // Agar user hai to TRUE, nahi to FALSE
}

// User ko Logout karna
function logoutUser() {
  localStorage.removeItem("shoeonUser");
  window.location.href = "login.html";
}

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
  
  // 1. Check karo kya wahi product already cart mein hai
  const index = cart.findIndex((item) => item.id === productToAdd.id);

  if (index > -1) {
    // Agar hai, toh sirf packs ko add kar do
    const extraPacks = parseInt(productToAdd.packs) || 1;
    cart[index].packs = (parseInt(cart[index].packs) || 1) + extraPacks;
    
    // Nayi quantity update karo
    cart[index].quantity = cart[index].packs * cart[index].moq;
    
    showToast(`Updated! Now ${cart[index].packs} packs in cart.`);
  } else {
    // 2. Agar naya product hai, toh packs aur pieces ke saath add karo
    const cartItem = {
      id: productToAdd.id,
      name: productToAdd.name,
      brand: productToAdd.brand,
      unitPrice: parseFloat(productToAdd.salePrice || productToAdd.price), // Rate per pair
      img: productToAdd.img || (productToAdd.images && productToAdd.images[0]) || "images/placeholder.jpg",
      moq: parseInt(productToAdd.moq),
      packs: parseInt(productToAdd.packs) || 1, // Default 1 pack agar na ho
      quantity: (parseInt(productToAdd.packs) || 1) * parseInt(productToAdd.moq)
    };
    cart.push(cartItem);
    showToast("Added to cart!");
  }

  // 3. Save as always
  saveCart(cart);
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

  if (!cartContainer || !emptyMsg) return;

  // 1. Clear container and reset variables
  cartContainer.innerHTML = "";
  let total = 0; // Hamesha loop ke bahar initialize karein

  if (cart.length === 0) {
    emptyMsg.style.display = "block";
    if (subtotalEl) subtotalEl.innerText = "₹0.00";
  } else {
    emptyMsg.style.display = "none";

    cart.forEach((item) => {
      // 2. Unit price and MOQ extraction
      const unitPrice =
        parseFloat(
          String(item.unitPrice || item.price)
            .replace("₹", "")
            .replace(",", "")
        ) || 0;
      const packs = parseInt(item.packs) || 1;
      const moq = parseInt(item.moq) || 1;
      const totalPieces = packs * moq;

      // 3. Calculation for this item (Set total)
      const setTotalPrice = unitPrice * totalPieces;

      // 4. Add to Grand Total
      total += setTotalPrice;

      // 5. Build HTML
      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="item-details">
            <p class="item-brand">${item.brand || ""}</p>
            <p class="item-name">${item.name}</p>
            <p class="item-price">
               ₹${unitPrice.toFixed(2)}/pc × ${totalPieces} <br>
               <strong>Total: ₹${setTotalPrice.toFixed(2)}</strong>
            </p>
          </div>
          <button class="item-remove-btn" data-id="${
            item.id
          }"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
  }

  // 6. Final subtotal (Now total is guaranteed to be defined)
  if (subtotalEl) {
    subtotalEl.innerText = `₹${total.toFixed(2)}`;
  }
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

// --- 5. DYNAMIC MENU (Login/Logout) ---
function updateMenuAuth() {
  const authContainer = document.getElementById("auth-buttons-container");
  if (!authContainer) return;

  // Check karo user login hai ya nahi
  const user = JSON.parse(localStorage.getItem("shoeonUser"));

  if (user) {
    // Agar User Logged In hai -> "Logout" dikhao
    authContainer.innerHTML = `
        <div style="width: 100%; text-align: center;">
          <p style="margin-bottom: 10px; font-weight: bold; color: #333;">Hi, ${user.name}</p>
          <button id="btn-logout" style="width: 100%; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; font-weight: bold;">
            Logout
          </button>
        </div>
      `;

    // Logout button par click logic
    document.getElementById("btn-logout").addEventListener("click", () => {
      // 1. Data delete karo
      localStorage.removeItem("shoeonUser");
      localStorage.removeItem("shoeonCart"); // Cart bhi khaali kar do (Safety)

      // 2. Message dikhao
      showToast("Logged out successfully");

      // 3. Page reload karo (taaki prices chup jayein)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  } else {
    // Agar User Guest hai -> Wapas Login/Register dikhao
    authContainer.innerHTML = `
        <a href="login.html" class="btn btn-login" style="flex:1; text-align:center; padding:12px; border:2px solid #d3a14b; color:#d3a14b; border-radius:6px; text-decoration:none; font-weight:bold;">Login</a>
        <a href="register.html" class="btn btn-register" style="flex:1; text-align:center; padding:12px; background:#d3a14b; color:white; border:2px solid #d3a14b; border-radius:6px; text-decoration:none; font-weight:bold;">Register</a>
      `;
  }
}

// Page load hote hi menu update karo
updateMenuAuth();

// --- 6. SEARCH BAR & SUGGESTIONS LOGIC ---
const searchInput = document.getElementById("search-input");
const suggestionsBox = document.getElementById("suggestions-box");
const searchIcon = document.querySelector(".search-bar i");

function performSearch(query) {
  if (!query) query = searchInput.value.trim();
  if (query) {
    window.location.href = `products.html?search=${query}`;
  }
}

if (searchInput && suggestionsBox) {
  let debounceTimer; // Taaki har akshar par request na jaye (Speed badhane ke liye)

  // 1. Jab user type kare
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Purana timer clear karo
    clearTimeout(debounceTimer);

    if (query.length < 2) {
      suggestionsBox.classList.remove("active"); // Agar 2 letter se kam hai toh chupao
      return;
    }

    // 300ms ruk kar server ko request bhejo (Debouncing)
    debounceTimer = setTimeout(() => {
      fetch(`/api/suggestions?q=${query}`)
        .then((res) => res.json())
        .then((products) => {
          suggestionsBox.innerHTML = ""; // Purana list saaf karo

          if (products.length > 0) {
            suggestionsBox.classList.add("active"); // List dikhao

            products.forEach((product) => {
              const li = document.createElement("li");

              // Text: "Nike Air Jordan" (Brand)
              li.innerHTML = `
                  <span>${product.name}</span>
                  <span class="suggestion-type">${product.brand}</span>
                `;

              // Click karne par search karo
              li.addEventListener("click", () => {
                searchInput.value = product.name;
                performSearch(product.name);
              });

              suggestionsBox.appendChild(li);
            });
          } else {
            suggestionsBox.classList.remove("active");
          }
        })
        .catch((err) => console.error(err));
    }, 300); // 300ms delay
  });

  // 2. Enter dabane par search
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      suggestionsBox.classList.remove("active");
      performSearch();
    }
  });

  // 3. Bahar click karne par list band karo
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.remove("active");
    }
  });
}

if (searchIcon) {
  searchIcon.style.cursor = "pointer";
  searchIcon.addEventListener("click", () => performSearch());
}
// --- 7. MY ACCOUNT CLICK LOGIC ---
function handleMyAccount(e) {
  e.preventDefault(); // Link ko roko

  const user = JSON.parse(localStorage.getItem("shoeonUser"));

  if (user) {
    // Agar user Login hai
    if (user.isAdmin) {
      // Agar Admin hai toh Admin Panel bhejo
      window.location.href = "admin-dashboard.html";
    } else {
      // Agar normal customer hai toh Order History dikhao (Future scope)
      // Abhi ke liye ek Toast dikha dete hain
      showToast(`Hi ${user.name}, Profile page coming soon!`);
    }
  } else {
    // Agar user Guest hai toh Login page bhejo
    window.location.href = "login.html";
  }
}


document.addEventListener("DOMContentLoaded", () => {
    syncUserStatus();
});

function syncUserStatus() {
    // 1. Check karo user login hai ya nahi
    const localUserJSON = localStorage.getItem('shoeonUser');
    if (!localUserJSON) return; // Agar login nahi hai to kuch mat karo

    const localUser = JSON.parse(localUserJSON);
    const userId = localUser.id || localUser._id; // ID nikalo

    if (!userId) return;

    // 2. Server se latest status pucho
    fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(serverUser => {
            if (serverUser.error) return;

            // 3. CHECK: Kya Browser ka data aur Server ka data alag hai?
            // (Note: Server se 'true' aayega, Local me shayad 'false' ya missing ho)
            
            const serverStatus = serverUser.isOfflineCustomer === true;
            const localStatus = localUser.isOfflineCustomer === true;

            if (serverStatus !== localStatus) {
                console.log("🔄 Status changed! Updating local data...");

                // 4. Chup-chap LocalStorage update kar do
                localUser.isOfflineCustomer = serverStatus;
                
                // Agar aur bhi kuch update hua ho to wo bhi le lo
                localUser.name = serverUser.name;
                localUser.isApproved = serverUser.isApproved;

                localStorage.setItem('shoeonUser', JSON.stringify(localUser));

                // 5. PAGE RELOAD KARO (Taaki naya price dikhe)
                // Hum thoda delay denge taaki user ko confusion na ho
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        })
        .catch(err => {
            console.log("Sync check failed (Internet issue maybe):", err);
        });
}