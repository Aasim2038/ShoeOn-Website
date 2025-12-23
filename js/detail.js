/* =========================================
   DETAIL.JS (FINAL FIX - NO CODE REMOVED)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Elements select karo
  const staticSizeDisplay = document.getElementById("static-size-display-container");
  const pdpBrand = document.getElementById("pdp-brand");
  const pdpName = document.getElementById("pdp-name");
  const pdpPriceEl = document.getElementById("pdp-sale-price"); 
  const pdpMrpEl = document.getElementById("pdp-market-price"); 
  const pdpRetailPriceEl = document.getElementById("pdp-retail-price"); 
  const pdpDiscountEl = document.getElementById("pdp-discount-display"); 
  const pdpMarginEl = document.getElementById("pdp-margin-display"); 
  const pdpMoq = document.getElementById("pdp-moq-display");
  const pdpStockDisplay = document.getElementById("pdp-stock-display");
  
  const addToCartBtn = document.querySelector(".btn-cart");
  const buyNowBtn = document.querySelector(".btn-buy");
  const sliderImages = document.querySelectorAll("#productSlider .slide img");
  const specsList = document.getElementById("pdp-specs-list"); 
  const sliderTrack = document.getElementById("productSlider");

  if (!productId) return;

  // --- 1. DATA FETCH KARO ---
  fetch(`/api/products/${productId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then((product) => {
      
      // 🔥 [LOGIC START] DUAL PRICE SYSTEM 🔥
      const user = JSON.parse(localStorage.getItem('shoeonUser'));
      const isOfflineUser = user && user.isOfflineCustomer; 

      // Default: Online Price
      let finalPrice = parseFloat(product.salePrice);
      let isUsingOfflinePrice = false;

      // Agar User Offline hai AUR Product ka Offline Price set hai
      if (isOfflineUser && product.offlinePrice && product.offlinePrice > 0) {
          finalPrice = parseFloat(product.offlinePrice);
          isUsingOfflinePrice = true;
      }
      // 🔥 [LOGIC END] 🔥

      const mrp = parseFloat(product.mrp);
      // NOTE: Ab hum har jagah 'finalPrice' use karenge instead of 'salePrice'
      
      const comparePrice = parseFloat(product.comparePrice) || mrp;
      const currentStock = parseInt(product.stock) || 0; 
      const packSelect = document.getElementById('pack-count');
      const customInput = document.getElementById('custom-pack-input');
      const stockMsg = document.getElementById('pack-stock-msg');
      
      const moq = parseInt(product.moq) || 1;
      const maxPacksAvailable = Math.floor(currentStock / moq);

      // --- Pack Selector Logic (Same as before) ---
      if (packSelect) {
          packSelect.innerHTML = ""; 

          if (maxPacksAvailable === 0) {
              packSelect.innerHTML = `<option value="0">Out of Stock</option>`;
              packSelect.disabled = true;
          } else {
              packSelect.disabled = false;
              const limit = Math.min(10, maxPacksAvailable); 
              for (let i = 1; i <= limit; i++) {
                  const option = document.createElement('option');
                  option.value = i;
                  option.innerText = `${i} Pack${i > 1 ? 's' : ''} (${i * moq} Pairs)`;
                  packSelect.appendChild(option);
              }
              if (maxPacksAvailable > 10) {
                  const customOpt = document.createElement('option');
                  customOpt.value = "custom";
                  customOpt.innerText = "Custom / Enter Quantity";
                  customOpt.style.fontWeight = "bold";
                  packSelect.appendChild(customOpt);
              }
          }

          packSelect.addEventListener('change', function() {
              if (this.value === 'custom') {
                  customInput.style.display = 'block'; 
                  customInput.focus();
                  stockMsg.innerText = `You can order up to ${maxPacksAvailable} packs.`;
              } else {
                  customInput.style.display = 'none'; 
                  customInput.value = '';
                  stockMsg.innerText = "";
              }
          });
      }

      function getSelectedPacks() {
          const selectVal = packSelect.value;
          if (selectVal === 'custom') {
              const val = parseInt(customInput.value);
              if (!val || val <= 0) {
                  alert("Please enter a valid quantity.");
                  return 0;
              }
              if (val > maxPacksAvailable) {
                  alert(`We only have stock for ${maxPacksAvailable} packs right now.`);
                  return 0;
              }
              return val;
          }
          return parseInt(selectVal);
      }

      // --- 2. DISPLAY UPDATE (Using finalPrice) ---
      let marginAmount = 0;
      let marginPercent = 0;
      let discountPercent = 0;

      if (mrp > finalPrice) {
        marginAmount = mrp - finalPrice;
        marginPercent = (marginAmount / mrp) * 100;
        discountPercent = marginPercent;
      }

      if(pdpBrand) pdpBrand.innerText = product.brand;
      if(pdpName) pdpName.innerText = product.name;

      // Price Display
      if (pdpPriceEl) {
          pdpPriceEl.innerText = `₹${finalPrice.toFixed(2)}`;
          if(isUsingOfflinePrice) pdpPriceEl.style.color = "#d35400"; // Alag color taaki pata chale
      }

      if (pdpMrpEl) pdpMrpEl.innerText = `₹${comparePrice.toFixed(2)}`;
      if (pdpRetailPriceEl) pdpRetailPriceEl.innerText = `₹${mrp.toFixed(2)}`;
      if (pdpMoq) pdpMoq.innerHTML = `<i class="fa-solid fa-box"></i> MOQ: ${product.moq} Pairs (1 Set)`;
      if (pdpDiscountEl) pdpDiscountEl.innerText = `${discountPercent.toFixed(0)}% off`;

      if (pdpMarginEl) {
        if (mrp > finalPrice) {
          pdpMarginEl.innerHTML = `Your Margin: ₹${marginAmount.toFixed(2)} (${marginPercent.toFixed(0)}%)`;
        } else {
          pdpMarginEl.innerHTML = `<span style="color:red;">WARNING: Sale price is higher than MRP.</span>`;
        }
      }

      // Stock Display
      if (pdpStockDisplay) {
          if (currentStock > 0) {
              pdpStockDisplay.innerHTML = `<span style="color: #2e7d32; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> In Stock (${currentStock} pieces)</span>`;
          } else {
              pdpStockDisplay.innerHTML = `<span style="color: #d32f2f; font-weight: bold;"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
              if(buyNowBtn) { buyNowBtn.style.opacity = "0.5"; buyNowBtn.innerText = "Sold Out"; }
              if(addToCartBtn) { addToCartBtn.style.opacity = "0.5"; }
          }
      }

      // Specs
      const soleValueEl = document.getElementById("spec-sole-value");
      const originValueEl = document.getElementById("spec-origin-value");
      if (soleValueEl) soleValueEl.innerText = product.sole || "N/A";
      if (originValueEl) originValueEl.innerText = product.origin || "N/A";

      // Sizes
      if (staticSizeDisplay && product.sizes) {
        const sizeArray = product.sizes;
        staticSizeDisplay.innerHTML = ""; 
        sizeArray.forEach((size) => {
          const span = document.createElement("span");
          span.className = "static-size";
          span.innerText = size.trim();
          staticSizeDisplay.appendChild(span);
        });
      }

      // Specs List
      if (specsList) {
        specsList.innerHTML = "";
        const specsData = [
          { key: "Material", value: product.material },
          { key: "Sole", value: product.sole },
          { key: "Origin", value: product.origin },
        ];
        specsData.forEach((spec) => {
          if (spec.value) {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${spec.key}:</strong> ${spec.value}`;
            specsList.appendChild(li);
          }
        });
      }

      // Slider
      if (sliderTrack && product.images && product.images.length > 0) {
          let slidesHTML = "";
          product.images.forEach(img => {
              slidesHTML += `<div class="slide"><img src="${img}" alt="${product.name}"></div>`;
          });
          sliderTrack.innerHTML = slidesHTML;
      }

      // ===============================================
      // BUTTON LISTENERS (AAPKA PURANA LOGIC SAME HAI)
      // ===============================================

      // 1. BUY NOW BUTTON
      if (buyNowBtn) {
        buyNowBtn.replaceWith(buyNowBtn.cloneNode(true));
        const newBuyBtn = document.querySelector(".btn-buy");

        newBuyBtn.addEventListener("click", () => {
            // 🔥 LOGIN CHECK (Waisa ka waisa)
            if (!isUserLoggedIn()) { 
                showToast("Please Login to buy."); 
                setTimeout(() => window.location.href = "login.html", 1000); 
                return; 
            }

            if (product.isLoose && !selectedSize) { 
               // Warning logic... (assuming var exists globally or ignored)
               const warning = document.getElementById("size-warning");
               if(warning) warning.style.display = "block";
            }
            
            const packs = getSelectedPacks(); 
            if (packs === 0) return; 

            const requiredQty = packs * moq;

            if (typeof addItemToCart === "function") {
                const productToBuy = {
                  id: product._id,
                  name: product.name,        
                  brand: product.brand,      
                  img: product.images && product.images.length > 0 ? product.images[0] : "images/placeholder.jpg",
                  
                  // 🔥 Updated Price
                  unitPrice: finalPrice,
                  price: finalPrice,

                  moq: moq,
                  packs: packs,
                  quantity: requiredQty,     
                  selectedSize: product.isLoose ? "Loose" : "Set",
                };
                addItemToCart(productToBuy);
                setTimeout(() => { window.location.href = "checkout.html"; }, 200); 
            }
        });
      }

      // 2. ADD TO CART BUTTON
      if (addToCartBtn) {
        addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
        const newCartBtn = document.querySelector(".btn-cart");

        newCartBtn.addEventListener('click', () => {
            // 🔥 LOGIN CHECK
            if (!isUserLoggedIn()) { showToast('Please Login first'); return; }

            const packs = getSelectedPacks();
            if (packs === 0) return;

            const requiredQty = packs * moq;

            const productToCart = {
                id: product._id,
                name: product.name,
                brand: product.brand,
                img: product.images[0],
                
                // 🔥 Updated Price
                unitPrice: finalPrice, 
                price: finalPrice,
                
                moq: moq,
                packs: packs,
                quantity: requiredQty, 
                selectedSize: product.isLoose ? "Loose" : "Set" 
            };

            addItemToCart(productToCart); 
            renderCartDrawerItems(); 
            const cartDrawer = document.getElementById('cart-drawer');
            const cartOverlay = document.getElementById('cart-overlay');
            if (cartDrawer) cartDrawer.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
        });
      }
    })
    .catch((err) => {
      document.querySelector(".pdp-info").innerHTML =
        "<h1>Error loading product details.</h1><p>Please check the server console for Mongoose errors.</p>";
      console.error("Final Fetch Error:", err);
    });
});