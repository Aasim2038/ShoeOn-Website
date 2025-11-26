/* =========================================
   DETAIL.JS (FINAL CODE - Consolidated & Verified)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Page ke elements ko pakdo
  const staticSizeDisplay = document.getElementById('static-size-display-container');
  const pdpBrand = document.getElementById('pdp-brand');
  const pdpName = document.getElementById('pdp-name');
  const pdpPriceEl = document.getElementById('pdp-sale-price'); // Sale price display
  const pdpMrpEl = document.getElementById('pdp-market-price'); // MRP display
  const pdpMarginEl = document.getElementById('pdp-margin-display'); // Margin box
  const pdpMoq = document.getElementById('pdp-moq-display'); // MOQ display
  const addToCartBtn = document.querySelector('.btn-cart');
  const sliderImages = document.querySelectorAll('#productSlider .slide img');
  const specsList = document.getElementById('pdp-specs-list'); // Specifications List ID


  if (!productId) { return; } 

  // --- 1. DATA FETCH KARO ---
  fetch(`/api/products/${productId}`)
    .then(res => {
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    })
    .then(product => {
      
      // Data ko number me convert karo
      const mrp = parseFloat(product.mrp);
      const salePrice = parseFloat(product.salePrice);
      
      // --- 2. PRICE AND MARGIN CALCULATIONS ---
      let marginAmount = 0;
      let marginPercent = 0;
      if (mrp > salePrice) {
          marginAmount = mrp - salePrice;
          marginPercent = (marginAmount / mrp) * 100;
      }

      // 3. Details bharo
      pdpBrand.innerText = product.brand;
      pdpName.innerText = product.name;
      
      // Price aur Margin Update
      if (pdpPriceEl) pdpPriceEl.innerText = `₹${salePrice.toFixed(2)}`;
      if (pdpMrpEl) pdpMrpEl.innerText = `₹${mrp.toFixed(2)}`;
      if (pdpMoq) pdpMoq.innerHTML = `</i>📦 MOQ: ${product.moq} Pairs (1 Set)`;


      if (pdpMarginEl) {
        if (mrp > salePrice) {
            pdpMarginEl.innerHTML = `Your Margin: ₹${marginAmount.toFixed(2)} (${marginPercent.toFixed(0)}%)`;
        } else {
            pdpMarginEl.innerHTML = `<span style="color:red;">WARNING: Sale price is higher than MRP.</span>`; 
        }
      }

      const soleValueEl = document.getElementById('spec-sole-value');
const closureValueEl = document.getElementById('spec-closure-value');
const originValueEl = document.getElementById('spec-origin-value');

if (soleValueEl) {
    soleValueEl.innerText = product.sole || 'N/A';
}
if (closureValueEl) {
    closureValueEl.innerText = product.closure || 'N/A';
}
if (originValueEl) {
    originValueEl.innerText = product.origin || 'N/A';
}
      
// --- SIZE SET DYNAMIC DISPLAY (FINAL FIX) ---
      
      if (staticSizeDisplay && product.sizes) {
    const sizeArray = product.sizes; 
    
    staticSizeDisplay.innerHTML = ''; // Pehle khaali karo
    
    sizeArray.forEach(size => {
        const span = document.createElement('span');
        span.className = 'static-size';
        span.innerText = size.trim(); 
        staticSizeDisplay.appendChild(span);
    });
}
      // --- END SIZE DISPLAY LOGIC ---

      // --- 4. PRODUCT SPECIFICATIONS (FINAL FIX) ---
      if (specsList) {
          specsList.innerHTML = ''; 
          
          const specsData = [
              { key: 'Material', value: product.material },
              { key: 'Sole', value: product.sole },
              { key: 'Closure', value: product.closure },
              { key: 'Origin', value: product.origin }
          ];

          specsData.forEach(spec => {
              if (spec.value) { 
                  const li = document.createElement('li');
                  li.innerHTML = `<strong>${spec.key}:</strong> ${spec.value}`;
                  specsList.appendChild(li);
              }
          });

          if (specsList.children.length === 0) {
              specsList.innerHTML = '<li>No technical details available.</li>';
          }
      }
      
      // --- 5. SLIDER IMAGES FILL KARO ---
      const imageUrls = product.images || []; 
      sliderImages.forEach((sImg, index) => {
        const url = (index < imageUrls.length) ? imageUrls[index] : imageUrls[0] || 'images/placeholder.jpg';
        sImg.src = url;
      });


      // --- 6. ADD TO CART LOGIC ---
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          if (!isUserLoggedIn()) { /* ... (login check) ... */ return; }
          product.id = product._id; 
          product.price = product.salePrice; 

          addItemToCart(product); 
          renderCartDrawerItems(); 
          const cartDrawer = document.getElementById('cart-drawer');
          const cartOverlay = document.getElementById('cart-overlay');
          if (cartDrawer) cartDrawer.classList.add('active');
          if (cartOverlay) cartOverlay.classList.add('active');
        });
      }

    })
    .catch(err => {
      // YEH ERROR HAI JO AAPKO DIKH RAHA HAI
      document.querySelector('.pdp-info').innerHTML = "<h1>Error loading product details.</h1><p>Please check the server console for Mongoose errors.</p>";
      console.error('Final Fetch Error:', err);
    });
});