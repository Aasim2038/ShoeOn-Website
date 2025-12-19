/* =========================================
   DETAIL.JS (FINAL CODE - Consolidated & Verified)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Page ke elements ko pakdo
  const staticSizeDisplay = document.getElementById("static-size-display-container");
  const pdpBrand = document.getElementById("pdp-brand");
  const pdpName = document.getElementById("pdp-name");
  const pdpPriceEl = document.getElementById("pdp-sale-price"); 
  const pdpMrpEl = document.getElementById("pdp-market-price"); 
  const pdpRetailPriceEl = document.getElementById("pdp-retail-price"); 
  const pdpDiscountEl = document.getElementById("pdp-discount-display"); 
  const pdpMarginEl = document.getElementById("pdp-margin-display"); 
  const pdpMoq = document.getElementById("pdp-moq-display");
  const pdpStockDisplay = document.getElementById("pdp-stock-display"); // <-- YE ELEMENT ZAROORI HAI
  
  const addToCartBtn = document.querySelector(".btn-cart");
  const buyNowBtn = document.querySelector(".btn-buy"); // Buy btn bhi pakdo
  const sliderImages = document.querySelectorAll("#productSlider .slide img");
  const specsList = document.getElementById("pdp-specs-list"); 
  const sliderTrack = document.getElementById("productSlider"); // Slider Track

  if (!productId) {
    return;
  }

  // --- 1. DATA FETCH KARO ---
  fetch(`/api/products/${productId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then((product) => {
      // Data ko number me convert karo
      const mrp = parseFloat(product.mrp);
      const salePrice = parseFloat(product.salePrice);
      const comparePrice = parseFloat(product.comparePrice) || mrp;
      const currentStock = parseInt(product.stock) || 0; // <-- STOCK VARIABLE
      const packSelect = document.getElementById('pack-count');
      const customInput = document.getElementById('custom-pack-input');
      const stockMsg = document.getElementById('pack-stock-msg');
      
      const moq = parseInt(product.moq) || 1;
      // Calculate: Total kitne packs ban sakte hain available stock se?
      const maxPacksAvailable = Math.floor(currentStock / moq);

      if (packSelect) {
          packSelect.innerHTML = ""; // Purane options saaf karo

          if (maxPacksAvailable === 0) {
              // Agar stock hi nahi hai
              packSelect.innerHTML = `<option value="0">Out of Stock</option>`;
              packSelect.disabled = true;
          } else {
              packSelect.disabled = false;
              
              // 1. Standard Options (1 to 10, ya kam agar stock kam hai)
              const limit = Math.min(10, maxPacksAvailable); 
              
              for (let i = 1; i <= limit; i++) {
                  const option = document.createElement('option');
                  option.value = i;
                  option.innerText = `${i} Pack${i > 1 ? 's' : ''} (${i * moq} Pairs)`;
                  packSelect.appendChild(option);
              }

              // 2. Custom Option (Sirf tab dikhao jab stock 10 packs se zyada ho)
              if (maxPacksAvailable > 10) {
                  const customOpt = document.createElement('option');
                  customOpt.value = "custom";
                  customOpt.innerText = "Custom / Enter Quantity";
                  customOpt.style.fontWeight = "bold";
                  packSelect.appendChild(customOpt);
              }
          }

          // Listener: Jab user dropdown change kare
          packSelect.addEventListener('change', function() {
              if (this.value === 'custom') {
                  customInput.style.display = 'block'; // Input dikhao
                  customInput.focus();
                  stockMsg.innerText = `You can order up to ${maxPacksAvailable} packs.`;
              } else {
                  customInput.style.display = 'none';  // Input chupao
                  customInput.value = '';
                  stockMsg.innerText = "";
              }
          });
      }

      // Helper function: Final quantity lene ke liye
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

      // --- 2. PRICE AND MARGIN CALCULATIONS ---
      let marginAmount = 0;
      let marginPercent = 0;
      let discountPercent = 0;

      if (mrp > salePrice) {
        marginAmount = mrp - salePrice;
        marginPercent = (marginAmount / mrp) * 100;
        discountPercent = marginPercent;
      }

      // 3. Details bharo
      if(pdpBrand) pdpBrand.innerText = product.brand;
      if(pdpName) pdpName.innerText = product.name;

      // Price Mapping
      if (pdpPriceEl) pdpPriceEl.innerText = `₹${salePrice.toFixed(2)}`;
      if (pdpMrpEl) pdpMrpEl.innerText = `₹${comparePrice.toFixed(2)}`;
      if (pdpRetailPriceEl) pdpRetailPriceEl.innerText = `₹${mrp.toFixed(2)}`;
      if (pdpMoq) pdpMoq.innerHTML = `<i class="fa-solid fa-box"></i> MOQ: ${product.moq} Pairs (1 Set)`;
      if (pdpDiscountEl) pdpDiscountEl.innerText = `${discountPercent.toFixed(0)}% off`;

      if (pdpMarginEl) {
        if (mrp > salePrice) {
          pdpMarginEl.innerHTML = `Your Margin: ₹${marginAmount.toFixed(2)} (${marginPercent.toFixed(0)}%)`;
        } else {
          pdpMarginEl.innerHTML = `<span style="color:red;">WARNING: Sale price is higher than MRP.</span>`;
        }
      }

      // --- NEW: STOCK DISPLAY UI LOGIC ---
      if (pdpStockDisplay) {
          if (currentStock > 0) {
              pdpStockDisplay.innerHTML = `<span style="color: #2e7d32; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> In Stock (${currentStock} pieces)</span>`;
          } else {
              pdpStockDisplay.innerHTML = `<span style="color: #d32f2f; font-weight: bold;"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
              
              // Agar stock nahi hai to buttons disable kar do (Optional but recommended)
              if(buyNowBtn) { 
                  buyNowBtn.style.opacity = "0.5"; 
                  buyNowBtn.innerText = "Sold Out";
              }
              if(addToCartBtn) {
                  addToCartBtn.style.opacity = "0.5"; 
              }
          }
      }
      // ----------------------------------

      // Specs Filling
      const soleValueEl = document.getElementById("spec-sole-value");
      const originValueEl = document.getElementById("spec-origin-value");

      if (soleValueEl) soleValueEl.innerText = product.sole || "N/A";
      if (originValueEl) originValueEl.innerText = product.origin || "N/A";

      // --- SIZE SET DYNAMIC DISPLAY ---
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

      // --- SPECS LIST LOGIC ---
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

      // --- SLIDER IMAGES ---
      // Slider fix: Naya HTML generate karo taaki slider sahi chale
      if (sliderTrack && product.images && product.images.length > 0) {
          let slidesHTML = "";
          product.images.forEach(img => {
              slidesHTML += `<div class="slide"><img src="${img}" alt="${product.name}"></div>`;
          });
          sliderTrack.innerHTML = slidesHTML;
      }

      // ===============================================
      // BUTTON LISTENERS (With Stock Check Logic)
      // ===============================================

      // BUY NOW
      if (buyNowBtn) {
        // Purana listener hataane ke liye naya clone bana rahe hain ya direct override kar rahe hain
        buyNowBtn.replaceWith(buyNowBtn.cloneNode(true));
        const newBuyBtn = document.querySelector(".btn-buy");

        newBuyBtn.addEventListener("click", () => {
            if (!isUserLoggedIn()) { showToast("Please Login to buy."); setTimeout(() => window.location.href = "login.html", 1000); return; }
            if (product.isLoose && !selectedSize) { if (sizeWarning) sizeWarning.style.display = "block"; return; }
            
            const packs = getSelectedPacks(); // Naya function use kar rahe hain
            if (packs === 0) return; // Agar quantity galat hai to ruk jao

            const requiredQty = packs * moq;

            if (typeof addItemToCart === "function") {
                const productToBuy = {
                  id: product._id,
                  name: product.name,        
                  brand: product.brand,      
                  img: product.images && product.images.length > 0 ? product.images[0] : "images/placeholder.jpg",
                  unitPrice: parseFloat(product.salePrice),
                  moq: moq,
                  packs: packs,
                  quantity: requiredQty,     
                  price: product.salePrice,
                  selectedSize: product.isLoose ? selectedSize : "Set",
                };
                addItemToCart(productToBuy);
                setTimeout(() => { window.location.href = "checkout.html"; }, 200); 
            }
        });
      }

      // 2. ADD TO CART
      if (addToCartBtn) {
        addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
        const newCartBtn = document.querySelector(".btn-cart");

        newCartBtn.addEventListener('click', () => {
            if (!isUserLoggedIn()) { showToast('Please Login first'); return; }
            if (product.isLoose && !selectedSize) { if (sizeWarning) sizeWarning.style.display = "block"; return; }

            const packs = getSelectedPacks();
            if (packs === 0) return;

            const requiredQty = packs * moq;

            const productToCart = {
                id: product._id,
                name: product.name,
                brand: product.brand,
                img: product.images[0],
                unitPrice: parseFloat(product.salePrice), 
                moq: moq,
                packs: packs,
                quantity: requiredQty, 
                price: product.salePrice,
                selectedSize: product.isLoose ? selectedSize : "Set" 
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