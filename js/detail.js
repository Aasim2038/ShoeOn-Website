/* =========================================
   DETAIL.JS (Final Code - API se connected)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // Page ke main elements ko dhoondo
  const pdpBrand = document.getElementById('pdp-brand');
  const pdpName = document.getElementById('pdp-name');
  const pdpPrice = document.getElementById('pdp-price');
  const pdpMoq = document.getElementById('pdp-moq');
  const addToCartBtn = document.querySelector('.btn-cart');
  
  // Check karo ki hum Product Detail Page par hain
  if (pdpBrand) { 
    
    // 1. URL se ID nikalo
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    if (productId) {
      // 2. SERVER SE DATA FETCH KARO
      fetch(`/api/products/${productId}`)
        .then(response => {
          if (!response.ok) throw new Error('Product not found');
          return response.json();
        })
        .then(product => {
          
          // 3. Page par details bharo
          pdpBrand.innerText = product.brand;
          pdpName.innerText = product.name;
          pdpPrice.innerText = `₹${product.salePrice}`;
          pdpMoq.innerText = product.moq + " Pairs";
          
          // Slider ki images update karo
          const sliderImages = document.querySelectorAll('.slide img');
          if (product.images && product.images.length > 0) {
            sliderImages.forEach(sImg => { sImg.src = product.images[0]; });
          }
          
          // 4. "Add to Cart" button ko event listener do
          if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
              
              // product object me ID set karo (MongoDB _id deta hai)
              product.id = product._id; 
              
              // --- YEH HAI SAHI ORDER ---
              
              // 1. Item add karo (Global function)
              addItemToCart(product); 
              
              // 2. Cart ka HTML pehle update karo (Global function)
              renderCartDrawerItems(); 

              // 3. Ab Cart ko manually kholo
              const cartDrawer = document.getElementById('cart-drawer');
              const cartOverlay = document.getElementById('cart-overlay');
              if (cartDrawer) cartDrawer.classList.add('active');
              if (cartOverlay) cartOverlay.classList.add('active');
              // --- YAHAN TAK ---
            });
          }
        })
        .catch(err => {
          console.error('Error fetching product:', err);
          pdpName.innerText = "Product Not Found";
        });
    }
  }

  // --- 5. Slider ka Dots Logic (Yeh waisa hi rahega) ---
  const slider = document.getElementById('productSlider');
  const dots = document.querySelectorAll('.dot');

  if (slider) {
    slider.addEventListener('scroll', () => {
      const scrollPosition = slider.scrollLeft;
      const slideWidth = slider.clientWidth;
      const activeIndex = Math.round(scrollPosition / slideWidth);

      dots.forEach((dot, index) => {
        if (index === activeIndex) { dot.classList.add('active'); } 
        else { dot.classList.remove('active'); }
      });
    });
  }
});