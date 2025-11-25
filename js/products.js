/* =========================================
   PRODUCTS.JS (FINAL & STABILIZED)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Variables (Sahi Scope me) ---
  const productGrid = document.getElementById('product-grid');
  const pageTitle = document.getElementById('page-category-title');
  const styleCount = document.getElementById('style-count');
  const cartOverlay = document.getElementById('cart-overlay');
  
  // Filter Drawer Elements
  const filterOpenBtn = document.getElementById('filter-open-btn'); // <--- YEH FIX HAI
  const filterDrawer = document.getElementById('filter-drawer');
  const filterCloseBtn = document.getElementById('filter-close-btn');
  const filterApplyBtn = document.getElementById('filter-apply-btn');
  const filterClearBtn = document.getElementById('filter-clear-btn');
  
  // URL Params
  const params = new URLSearchParams(window.location.search);
  const categoryKey = params.get('category') || '';
  const searchQuery = params.get('search');
  const sortValue = params.get('sort');
  const materialValue = params.get('material');
  const isUserLoggedIn = localStorage.getItem('shoeonUser') ? true : false;


  // --- 2. Load Products Function (Core Logic) ---

  function loadProducts(filters = {}) {
    if (!productGrid) return; 

    // Query String banana
    let query = `?category=${categoryKey}`; 
    
    // Sort options add karo
    if (filters.sort || sortValue) {
      query += `&sort=${filters.sort || sortValue}`;
    }
    
    // Material options add karo
    if (filters.materials && filters.materials.length > 0) {
      query += `&material=${filters.materials.join(',')}`;
    } else if (materialValue) {
        query += `&material=${materialValue}`;
    }
    
    // Search query add karo
    if (searchQuery) {
      query += `&search=${searchQuery}`;
      pageTitle.innerText = `Search results for "${searchQuery}"`;
    } else {
        pageTitle.innerText = categoryKey ? categoryKey.replace('-', ' ') : "All Products";
    }

    productGrid.innerHTML = `<p style="text-align:center; color:#555;">Loading products...</p>`; 

    // Server se data fetch karo
    fetch(`/api/products${query}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(products => {
        
        styleCount.innerText = `${products.length} Styles`;
        productGrid.innerHTML = '';
        
        // ... (HTML rendering logic remains the same) ...
        if (products.length === 0) {
          productGrid.innerHTML = "<p style='text-align: center; color: #777; width: 100%;'>No products found matching your filters.</p>";
          return;
        }

        products.forEach(product => {
          const productLink = `product-detail.html?id=${product._id}`; 
          
          const mrp = parseFloat(product.mrp);
          const salePrice = parseFloat(product.salePrice);
          const marginPercent = ((mrp - salePrice) / mrp) * 100;
          
          const displayPrice = isUserLoggedIn 
                               ? `₹${salePrice.toFixed(2)}` 
                               : `<span style="color:#d3a14b; font-weight:bold;">Login to View Price</span>`;
          
          const displayMrp = isUserLoggedIn
                               ? `<del>₹${mrp.toFixed(2)}</del>`
                               : ``;

          productGrid.innerHTML += `
            <a href="${productLink}" class="plp-card">
              <div class="plp-image-box">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
              </div>
              <div class="plp-details">
                <h3 class="plp-brand">${product.brand}</h3>
                <p class="plp-title">${product.name}</p>
                
                <div class="plp-price-compare-info">
                    <p class="plp-mrp-line">MRP: ${displayMrp}</p>
                    <p class="plp-your-price-line">Our Rate: <strong>${displayPrice}</strong></p>
                </div>

                <div class="plp-b2b-info">
                    <span>MOQ: ${product.moq}</span>
                    <span style="color: #2e7d32;">Margin: ${marginPercent.toFixed(0)}%</span>
                </div>
              </div>
            </a>`;
        });
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
      document.querySelectorAll('#sort-options input').forEach(input => input.checked = false);
      document.querySelectorAll('#material-options input').forEach(input => input.checked = false);
      // Default (Newest) ko wapas check kar do
      document.querySelector('input[value="latest"]').checked = true;
      
      loadProducts(); // Bina filter ke load karo
      closeFilter();
    });
  }

  // --- 4. Initial Load ---
  loadProducts();
  
});