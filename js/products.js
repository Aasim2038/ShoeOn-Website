document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Top Level Elements (Global access within DOMContentLoaded) ---
  const productGrid = document.getElementById('product-grid');
  const pageTitle = document.getElementById('page-category-title');
  const styleCount = document.getElementById('style-count');
  const cartOverlay = document.getElementById('cart-overlay');
  
  // Filter Drawer Elements
  const filterOpenBtn = document.getElementById('filter-open-btn');
  const filterDrawer = document.getElementById('filter-drawer');
  const filterCloseBtn = document.getElementById('filter-close-btn');
  const filterApplyBtn = document.getElementById('filter-apply-btn');
  const filterClearBtn = document.getElementById('filter-clear-btn');
  
  const isUserLoggedIn = localStorage.getItem('shoeonUser') ? true : false;


  // --- 2. Load Products Function (Core Logic) ---

  function loadProducts(filters = {}) {
    if (!productGrid) return; 

    const params = new URLSearchParams(window.location.search);
    const categoryKey = params.get('category') || '';
    const searchQuery = params.get('search');
    const sortValue = params.get('sort');
    const materialValue = params.get('material');


    // Query String banana start karo
    let query = `?category=${categoryKey}`; 
    
    // Page Title Logic
    pageTitle.innerText = categoryKey ? categoryKey.replace('-', ' ') : (searchQuery ? `Search results for "${searchQuery}"` : "All Products");
    
    // Loose product filter logic
    const isLooseFilter = params.get('isLoose'); 
    
    if (isLooseFilter === 'true') {
        query += '&isLoose=true';
        pageTitle.innerText = categoryKey ? `Loose Products / ${categoryKey.replace('-', ' ')}` : "All Loose Products";
    }


    // --- SORT FILTER ---
    if (filters.sort || sortValue) {
      query += `&sort=${filters.sort || sortValue}`;
    }
    
    // --- NEW: PRICE RANGE FILTER ---
    if (filters.minPrice) {
      query += `&minPrice=${filters.minPrice}`;
    }
    if (filters.maxPrice) {
      query += `&maxPrice=${filters.maxPrice}`;
    }
    // -----------------------------

    // --- MATERIAL FILTER ---
    if (filters.materials && filters.materials.length > 0) {
      query += `&material=${filters.materials.join(',')}`;
    } else if (materialValue) {
        query += `&material=${materialValue}`;
    }
    
    // --- SEARCH QUERY ---
    if (searchQuery) {
      query += `&search=${searchQuery}`;
      pageTitle.innerText = `Search results for "${searchQuery}"`; 
    }

    productGrid.innerHTML = `<p style="text-align:center; color:#555;">Loading products...</p>`; 

    // Server se data fetch karo
    fetch(`/api/products${query}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(products => {
        
        let cardsHTML = ''; 
        styleCount.innerText = `${products.length} Styles`;
        productGrid.innerHTML = '';
        
        if (products.length === 0) {
          cardsHTML = "<p style='text-align: center; color: #777; width: 100%;'>No products found matching your filters.</p>";
        }

        const user = JSON.parse(localStorage.getItem('shoeonUser'));
        const isOffline = user && user.isOfflineCustomer;

        products.forEach(product => {
          const productLink = `product-detail.html?id=${product._id}`; 
          
          const mrp = parseFloat(product.mrp);
          
          // 🔥 2. PRICE LOGIC (Offline vs Online)
          let finalPrice = parseFloat(product.salePrice);
          let priceColorStyle = ""; // Normal color

          // Agar Offline User hai AUR Offline Price set hai
          if (isOffline && product.offlinePrice && product.offlinePrice > 0) {
              finalPrice = parseFloat(product.offlinePrice);
              priceColorStyle = "color: #d35400; font-weight: bold;"; // Orange Color (Alag dikhne ke liye)
          }

          const salePrice = finalPrice; // Nayi price use karo calculations me
          const marginPercent = ((mrp - salePrice) / mrp) * 100;
          
          const displayPrice = isUserLoggedIn 
                               ? `<span style="${priceColorStyle}">₹${salePrice.toFixed(2)}</span>` 
                               : `<span style="color:#d3a14b; font-weight:bold;">Login to View Price</span>`;
          
          const displayMrp = isUserLoggedIn
                               ? `₹${mrp.toFixed(2)}`
                               : ``;

          cardsHTML += `
            <a href="${productLink}" class="plp-card">
              <div class="plp-image-box">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
              </div>
              <div class="plp-details">
                <h3 class="plp-brand">${product.brand}</h3>
                <p class="plp-title">${product.name}</p>
                
                <div class="plp-price-compare-info">
                    <p class="plp-mrp-line">MRP: ${displayMrp}</p>
                    <p class="plp-your-price-line">Your Rate: <strong>${displayPrice}</strong></p>
                </div>

                <div class="plp-b2b-info">
                    <span>MOQ: ${product.moq}</span>
                    <span style="color: #2e7d32;">Margin: ${marginPercent.toFixed(0)}%</span>
                </div>
              </div>
            </a>`;
        });
        
        // Final Injection
        productGrid.innerHTML = cardsHTML;
      })
      .catch(err => {
        console.error('Products fetch karne me error:', err);
        productGrid.innerHTML = "<p>Error loading products. Server se connect nahi ho raha.</p>";
      });
  }

  // --- 3. Filter Drawer Logic (Kholna/Band Karna) ---
  if (filterOpenBtn && filterDrawer && filterCloseBtn && cartOverlay) {
    
    const closeFilter = () => {
      filterDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    };
    
    filterOpenBtn.addEventListener('click', () => {
      filterDrawer.classList.add('active');
      cartOverlay.classList.add('active');
    });
    
    filterCloseBtn.addEventListener('click', closeFilter);
    
    // "Apply" button par click karne se kya hoga
    filterApplyBtn.addEventListener('click', () => {
      
      const filters = {};
      
      // Sort ki value
      const sortValueEl = document.querySelector('input[name="sort"]:checked');
      if (sortValueEl) {
        filters.sort = sortValueEl.value;
      }
      
      // --- NEW: Price Range Values Uthao ---
      const minVal = document.getElementById('min-price').value;
      const maxVal = document.getElementById('max-price').value;
      
      if(minVal) filters.minPrice = minVal;
      if(maxVal) filters.maxPrice = maxVal;
      // -------------------------------------

      // Material ki values
      const materials = [];
      const materialCheckboxes = document.querySelectorAll('#material-options input:checked');
      materialCheckboxes.forEach(box => {
        materials.push(box.value);
      });
      filters.materials = materials;

      // Naye filters ke saath products load karo
      loadProducts(filters);
      
      closeFilter();
    });
    
    // "Clear" button ka logic
    filterClearBtn.addEventListener('click', () => {
      // Checkboxes clear karo
      document.querySelectorAll('#sort-options input').forEach(input => input.checked = false);
      document.querySelectorAll('#material-options input').forEach(input => input.checked = false);
      
      // --- NEW: Price Inputs Empty karo ---
      const minInput = document.getElementById('min-price');
      const maxInput = document.getElementById('max-price');
      if(minInput) minInput.value = '';
      if(maxInput) maxInput.value = '';
      // ------------------------------------

      // Default (Newest) ko wapas check kar do
      document.querySelector('input[value="latest"]').checked = true;
      
      loadProducts(); // Bina filter ke load karo
      closeFilter();
    });
  }

  // --- 4. Initial Load ---
  loadProducts(); // Pehli baar bina kisi filter ke load karo
  
});