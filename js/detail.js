/* =========================================
   DETAIL.JS (MRP and Margin FIX)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Page ke elements ko pakdo
  const pdpBrand = document.getElementById('pdp-brand');
  const pdpName = document.getElementById('pdp-name');
  const pdpPriceEl = document.getElementById('pdp-price'); // Final price
  const pdpMrpEl = document.getElementById('pdp-mrp-display'); // Naya element
  const pdpMarginEl = document.querySelector('.margin-row strong'); // Margin ko pakdo
  const pdpMoq = document.getElementById('pdp-moq');
  const addToCartBtn = document.querySelector('.btn-cart');
  
  // Slider ke elements
  const slider = document.getElementById('productSlider');
  const dots = document.querySelectorAll('.dot');


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
      
      // --- FINAL CALCULATIONS ---
      let marginAmount = 0;
      let marginPercent = 0;

      if (mrp > salePrice) {
          marginAmount = mrp - salePrice;
          marginPercent = (marginAmount / mrp) * 100;
      }
      // Agar Sale Price zyada hai, toh margin 0 dikhao
      else if (salePrice >= mrp) {
          marginAmount = 0;
          marginPercent = 0;
      }

      // 1. Basic Details bharo
      pdpBrand.innerText = product.brand;
      pdpName.innerText = product.name;
      pdpMoq.innerText = product.moq + " Pairs";
      
      // 2. Price aur Margin Update karo
      pdpPriceEl.innerText = `₹${salePrice.toFixed(2)}`; // Final Price
      pdpMrpEl.innerText = `₹${mrp.toFixed(2)}`; // MRP FIX kiya

      // 3. Margin Update karo
      if (pdpMarginEl) {
        if (mrp > salePrice) {
            pdpMarginEl.innerHTML = `₹${marginAmount.toFixed(2)} (${marginPercent.toFixed(0)}%)`;
        } else {
            // Agar Sale Price > MRP, toh loss dikhao ya margin hata do
            pdpMarginEl.innerHTML = `<span style="color:red;">Price Error</span>`; 
        }
      }
      
      // ... (baki ka slider aur add to cart logic waisa hi rahega) ...

      // Slider images fill karo
      const sliderImages = document.querySelectorAll('#productSlider .slide img');
      const imageUrls = product.images || []; 
      sliderImages.forEach((sImg, index) => {
        const url = (index < imageUrls.length) ? imageUrls[index] : imageUrls[0] || 'images/placeholder.jpg';
        sImg.src = url;
      });

      // Add to Cart Logic (Same as before)
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          if (!isUserLoggedIn()) { /* ... (login check) ... */ return; }
          product.id = product._id; 
          
          // CRUCIAL: Price ko Sale Price se set karo (kyunki yahi save hota hai)
          product.price = product.salePrice; 

          addItemToCart(product); 
          // ... (open cart logic) ...
        });
      }

      const specsList = document.getElementById('pdp-specs-list');
if (specsList) {
    specsList.innerHTML = ''; // Pehle khaali karo

    // Data object banakar dikhao
    const specsData = [
        { key: 'Material', value: product.material },
        { key: 'Sole', value: product.sole },
        { key: 'Closure', value: product.closure },
        { key: 'Origin', value: product.origin }
    ];

    specsData.forEach(spec => {
        if (spec.value) { // Agar value database me hai toh hi dikhao
            const li = document.createElement('li');
            li.innerHTML = `<strong>${spec.key}:</strong> ${spec.value}`;
            specsList.appendChild(li);
        }
    });

    // Agar koi spec nahi hai toh message dikhao
    if (specsList.children.length === 0) {
        specsList.innerHTML = '<li>No technical details available.</li>';
    }
}
    })
    .catch(err => {
      document.querySelector('.pdp-info').innerHTML = "<h1>Error loading product details.</h1>";
      console.error(err);
    });
});