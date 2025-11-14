/* =========================================
   PRODUCTS.JS (FIXED - Frontend Filter ke Saath)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  
  if (productGrid) {
    const pageTitle = document.getElementById('page-category-title');
    const styleCount = document.getElementById('style-count');
    
    // 1. URL se category nikalo (jaise "men-casual")
    const params = new URLSearchParams(window.location.search);
    const categoryKey = params.get('category');
    
    // Title set kar do
    pageTitle.innerText = categoryKey ? categoryKey.replace('-', ' ') : "All Products";

    // 2. Server se SAARA data fetch karo
    fetch('/api/products')
      .then(response => response.json())
      .then(allProducts => {
        
        // 3. === ASLI FIX ===
        // Ab hum 5000 product me se sirf woh product dhoondhenge
        // jinki category URL waali category se match karti hai
        const productsToShow = allProducts.filter(product => {
          return product.category === categoryKey;
        });
        
        styleCount.innerText = `${productsToShow.length} Styles`;
        let cardsHTML = '';

        if (productsToShow.length === 0) {
          cardsHTML = "<p style='text-align: center; color: #777; width: 100%;'>Is category me koi product nahi mila. Admin panel se add karein.</p>";
        }

        productsToShow.forEach(product => {
          const productLink = `product-detail.html?id=${product._id}`;
          
          cardsHTML += `
            <a href="${productLink}" class="plp-card">
              <div class="plp-image-box">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/shoe1.jpg'}" alt="${product.name}" loading="lazy">
              </div>
              <div class="plp-details">
                <h3 class="plp-brand">${product.brand}</h3>
                <p class="plp-title">${product.name}</p>
                <div class="plp-b2b-info"><span>MOQ: ${product.moq}</span></div>
                <p class="plp-price">₹${product.salePrice}</p> 
              </div>
            </a>`;
        });
        
        productGrid.innerHTML = cardsHTML;
      })
      .catch(err => {
        console.error('Products fetch karne me error:', err);
        productGrid.innerHTML = "<p>Error loading products. Server se connect nahi ho raha.</p>";
      });
  }
});