/* =========================================
   DETAIL.JS (Sirf product-detail.html par chalega)
   ========================================= */

// productsDatabase object ab database.js se aa raha hai

document.addEventListener('DOMContentLoaded', () => {
  const pdpBrand = document.getElementById('pdp-brand');
  
  // Check karo ki database load hua ya nahi
  if (pdpBrand && typeof productsDatabase !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    let product;
    // Ab ye poore database me se dhoondega
    Object.keys(productsDatabase).forEach(key => {
      const found = productsDatabase[key].products.find(p => p.id === productId);
      if (found) product = found;
    });

    if (product) {
      // Page par details bharo
      document.getElementById('pdp-brand').innerText = product.brand;
      document.getElementById('pdp-name').innerText = product.name;
      document.getElementById('pdp-price').innerText = product.price;
      document.getElementById('pdp-moq').innerText = product.moq + " Pairs";
      
      const sliderImages = document.querySelectorAll('.slide img');
      sliderImages.forEach(sImg => { sImg.src = product.img; });
      
      // "Add to Cart" button ko event listener do
      const addToCartBtn = document.querySelector('.btn-cart');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          // 1. Item add karo (Global function)
          addItemToCart(product); 
          
          // 2. Cart kholo (Global function)
          // YEH NAYI LINE HAI (Error fixed)
          openCart(); 
        });
      }
    }
  }

  // Slider ka Dots Logic
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