/* =========================================
   DETAIL.JS (FINAL CODE - Consolidated & Verified)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Page ke elements ko pakdo
  const staticSizeDisplay = document.getElementById(
    "static-size-display-container"
  );
  const pdpBrand = document.getElementById("pdp-brand");
  const pdpName = document.getElementById("pdp-name");
  const pdpPriceEl = document.getElementById("pdp-sale-price"); // Sale price display
  const pdpMrpEl = document.getElementById("pdp-market-price"); // MRP display
  const pdpRetailPriceEl = document.getElementById("pdp-retail-price"); // Retail price display
  const pdpDiscountEl = document.getElementById("pdp-discount-display"); // Discount display
  const pdpMarginEl = document.getElementById("pdp-margin-display"); // Margin box
  const pdpMoq = document.getElementById("pdp-moq-display"); // MOQ display
  const addToCartBtn = document.querySelector(".btn-cart");
  const sliderImages = document.querySelectorAll("#productSlider .slide img");
  const specsList = document.getElementById("pdp-specs-list"); // Specifications List ID

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

      // --- 2. PRICE AND MARGIN CALCULATIONS ---
      let marginAmount = 0;
      let marginPercent = 0;
      let discountPercent = 0;

      if (mrp > salePrice) {
        marginAmount = mrp - salePrice;
        marginPercent = (marginAmount / mrp) * 100;
        discountPercent = marginPercent;
      }

      // 3. Details bharo (No error here as variables are defined above)
      pdpBrand.innerText = product.brand;
      pdpName.innerText = product.name;

      // Price Mapping
      if (pdpPriceEl) pdpPriceEl.innerText = `₹${salePrice.toFixed(2)}`;
      if (pdpMrpEl) pdpMrpEl.innerText = `₹${comparePrice.toFixed(2)}`;
      if (pdpRetailPriceEl) pdpRetailPriceEl.innerText = `₹${mrp.toFixed(2)}`;
      if (pdpMoq)
        pdpMoq.innerHTML = `<i class="fa-solid fa-box"></i> MOQ: ${product.moq} Pairs (1 Set)`;
      if (pdpDiscountEl)
        pdpDiscountEl.innerText = `${discountPercent.toFixed(0)}% off`;

      if (pdpMarginEl) {
        if (mrp > salePrice) {
          pdpMarginEl.innerHTML = `Your Margin: ₹${marginAmount.toFixed(
            2
          )} (${marginPercent.toFixed(0)}%)`;
        } else {
          pdpMarginEl.innerHTML = `<span style="color:red;">WARNING: Sale price is higher than MRP.</span>`;
        }
      }

      const soleValueEl = document.getElementById("spec-sole-value");
      const closureValueEl = document.getElementById("spec-closure-value");
      const originValueEl = document.getElementById("spec-origin-value");

      if (soleValueEl) {
        soleValueEl.innerText = product.sole || "N/A";
      }
      if (closureValueEl) {
        closureValueEl.innerText = product.closure || "N/A";
      }
      if (originValueEl) {
        originValueEl.innerText = product.origin || "N/A";
      }

      // --- SIZE SET DYNAMIC DISPLAY (FINAL FIX) ---

      if (staticSizeDisplay && product.sizes) {
        const sizeArray = product.sizes;

        staticSizeDisplay.innerHTML = ""; // Pehle khaali karo

        sizeArray.forEach((size) => {
          const span = document.createElement("span");
          span.className = "static-size";
          span.innerText = size.trim();
          staticSizeDisplay.appendChild(span);
        });
      }
      // --- END SIZE DISPLAY LOGIC ---

      // --- 4. PRODUCT SPECIFICATIONS (FINAL FIX) ---
      if (specsList) {
        specsList.innerHTML = "";

        const specsData = [
          { key: "Material", value: product.material },
          { key: "Sole", value: product.sole },
          { key: "Closure", value: product.closure },
          { key: "Origin", value: product.origin },
        ];

        specsData.forEach((spec) => {
          if (spec.value) {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${spec.key}:</strong> ${spec.value}`;
            specsList.appendChild(li);
          }
        });

        if (specsList.children.length === 0) {
          specsList.innerHTML = "<li>No technical details available.</li>";
        }
      }

      // --- 5. SLIDER IMAGES FILL KARO ---
      const imageUrls = product.images || [];
      sliderImages.forEach((sImg, index) => {
        const url =
          index < imageUrls.length
            ? imageUrls[index]
            : imageUrls[0] || "images/placeholder.jpg";
        sImg.src = url;
      });

      // --- BUY NOW BUTTON LOGIC ---
     const buyNowBtn = document.querySelector(".btn-buy");

      if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
          // Login check
          if (!isUserLoggedIn()) {
            showToast("Please Login to buy.");
            setTimeout(() => {
              window.location.href = "login.html";
            }, 1000);
            return;
          }

          // Validation check: Agar loose product hai aur size select nahi kiya
          if (product.isLoose && !selectedSize) {
            if (sizeWarning) sizeWarning.style.display = "block";
            return;
          }

          // --- MISSING LOGIC ADDED HERE ---
          // 1. Pack Selector se value uthao (Jaise Add to Cart me kiya tha)
          const packSelector = document.getElementById('pack-count');
          const packs = packSelector ? parseInt(packSelector.value) : 1;
          const moq = parseInt(product.moq) || 1;

          if (typeof addItemToCart === "function") {
            // 2. Product Object banate time quantity calculate karo
            const productToBuy = {
              id: product._id,
              name: product.name,        // Name add kiya for consistency
              brand: product.brand,      // Brand add kiya
              img: product.images && product.images.length > 0 ? product.images[0] : "images/placeholder.jpg",
              unitPrice: parseFloat(product.salePrice),
              moq: moq,
              packs: packs,
              quantity: packs * moq,     // YEH MAIN FIX HAI (10 packs * 4 moq = 40)
              price: product.salePrice,
              selectedSize: product.isLoose ? selectedSize : "Set",
            };

            // 3. Item add karo
            addItemToCart(productToBuy);

            // 4. Checkout page par bhejo
            setTimeout(() => {
              window.location.href = "checkout.html";
            }, 200); 
          } else {
            console.error("addItemToCart function missing.");
          }
        });
      }

      // --- 6. ADD TO CART LOGIC ---
      if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        if (!isUserLoggedIn()) { 
            showToast('Please Login to order'); 
            return; 
        }

        // 1. Pack Selector se value uthao
        const packSelector = document.getElementById('pack-count');
        const packs = packSelector ? parseInt(packSelector.value) : 1;
        const moq = parseInt(product.moq) || 1;

        // 2. Naya "Cart Ready" product object banao
        const productToCart = {
            id: product._id,
            name: product.name,
            brand: product.brand,
            img: product.images[0],
            unitPrice: parseFloat(product.salePrice), // Ek jodi ka rate
            moq: moq,
            packs: packs,
            quantity: packs * moq, // Total pieces (E.g. 10 packs * 4 moq = 40)
            price: product.salePrice // Compatibility ke liye original price field
        };

        // 3. Cart mein add karo aur UI update karo
        addItemToCart(productToCart); 
        renderCartDrawerItems(); 

        // 4. Drawer kholo
        const cartDrawer = document.getElementById('cart-drawer');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartDrawer) cartDrawer.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
    });
}
    })
    .catch((err) => {
      // YEH ERROR HAI JO AAPKO DIKH RAHA HAI
      document.querySelector(".pdp-info").innerHTML =
        "<h1>Error loading product details.</h1><p>Please check the server console for Mongoose errors.</p>";
      console.error("Final Fetch Error:", err);
    });
});
