/* =========================================
   PRODUCTS.JS (Sirf products.html par chalega)
   ========================================= */

// productsDatabase object ab database.js se aa raha hai

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  
  // Check karo ki database load hua ya nahi
  if (productGrid && typeof productsDatabase !== 'undefined') { 
    const pageTitle = document.getElementById('page-category-title');
    const styleCount = document.getElementById('style-count');
    const params = new URLSearchParams(window.location.search);
    const categoryKey = params.get('category');
    
    // Ab ye database me se 'women-sandals' bhi dhoond payega
    const data = productsDatabase[categoryKey] || productsDatabase['default']; 

    if (data) {
      pageTitle.innerText = data.title;
      styleCount.innerText = data.count;
      let cardsHTML = '';
      data.products.forEach(product => {
        const productLink = `product-detail.html?id=${product.id}`; 
        cardsHTML += `
          <a href="${productLink}" class="plp-card">
            <div class="plp-image-box"><img src="${product.img}" alt="${product.name}" loading="lazy"></div>
            <div class="plp-details">
              <h3 class="plp-brand">${product.brand}</h3>
              <p class="plp-title">${product.name}</p>
              <div class="plp-b2b-info"><span>MOQ: ${product.moq}</span></div>
              <p class="plp-price">${product.price}</p>
            </div>
          </a>`;
      });
      productGrid.innerHTML = cardsHTML;
    }
  }
});