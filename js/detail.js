/* =========================================
   DETAIL.JS (Amazon Slider Logic)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Page ke elements ko pakdo
  const pdpBrand = document.getElementById('pdp-brand');
  const pdpName = document.getElementById('pdp-name');
  const pdpPrice = document.getElementById('pdp-price');
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
      
      // Basic Details bharo
      pdpBrand.innerText = product.brand;
      pdpName.innerText = product.name;
      pdpPrice.innerText = `₹${product.salePrice}`;
      pdpMoq.innerText = product.moq + " Pairs";
      
      // --- 2. SLIDER IMAGES FILL KARO ---
     const sliderImages = document.querySelectorAll('#productSlider .slide img');
          const imageUrls = product.images || []; // Database se saari URLs lo
          const placeholder = 'images/placeholder.jpg';

          sliderImages.forEach((sImg, index) => {
            // Check karo ki us index par koi URL hai ya nahi
            if (index < imageUrls.length) {
              // Agar URL hai, toh woh use karo
              sImg.src = imageUrls[index];
            } else if (imageUrls.length > 0) {
              // Agar 4 se kam images hain, toh pehli image ko repeat kar do
              sImg.src = imageUrls[0]; 
            } else {
              // Agar database me koi image hi nahi hai, toh placeholder use karo
              sImg.src = placeholder;
            }
          });

      // --- 3. LISTENERS LAGAO ---
      addSliderListeners(); // Slider dots ko chalu karo
      
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          if (!isUserLoggedIn()) {
            showToast('Please Login to see price and buy.');
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
            return; 
          }
          product.id = product._id; 
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
      document.querySelector('.pdp-info').innerHTML = "<h1>Error loading product details.</h1>";
      console.error(err);
    });

  // --- 4. SLIDER DOTS LOGIC (Scroll event) ---
  function addSliderListeners() {
      if (slider && dots.length > 0) {
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
  }
});