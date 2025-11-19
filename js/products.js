/* =========================================
   PRODUCTS.JS (Full Filter Logic)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Page Elements ---
  const productGrid = document.getElementById('product-grid');
  const pageTitle = document.getElementById('page-category-title');
  const styleCount = document.getElementById('style-count');
  
  // Filter Drawer Elements
  const filterOpenBtn = document.getElementById('filter-open-btn');
  const filterDrawer = document.getElementById('filter-drawer');
  const filterCloseBtn = document.getElementById('filter-close-btn');
  const filterApplyBtn = document.getElementById('filter-apply-btn');
  const filterClearBtn = document.getElementById('filter-clear-btn');
  const cartOverlay = document.getElementById('cart-overlay'); 

  // --- 2. Load Products Function (Ab ye Query lega) ---
  
  // By default, category URL se aayegi
  const params = new URLSearchParams(window.location.search);
  const baseCategory = params.get('category') || ''; // e.g., "men-casual"

  function loadProducts(filters = {}) {
    if (!productGrid) return; 

    // 1. Query String banana
    let query = `?category=${baseCategory}`; 
    
    // --- NAYA: Search Query Add Karo ---
    const searchQuery = params.get('search');
    if (searchQuery) {
      query += `&search=${searchQuery}`;
      // Title bhi badal do taaki user ko pata chale
      pageTitle.innerText = `Search results for "${searchQuery}"`;
    }
    // -----------------------------------
    
    // Sort options add karo
    if (filters.sort) {
      query += `&sort=${filters.sort}`;
    }
    
    // Material options add karo
    if (filters.materials && filters.materials.length > 0) {
      query += `&material=${filters.materials.join(',')}`; // e.g., material=Leather,Canvas
    }

    // 2. Title set karo
    pageTitle.innerText = baseCategory ? baseCategory.replace('-', ' ') : "All Products";
    productGrid.innerHTML = `<p style="text-align:center; color:#555;">Loading products...</p>`; // Loading message

    // 3. Server se data fetch karo (Naye Query ke saath)
    console.log('Fetching data from:', `/api/products${query}`);
    
    
    fetch(`/api/products${query}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(products => {
        
        styleCount.innerText = `${products.length} Styles`;
        productGrid.innerHTML = ''; // Grid khaali karo
        
        if (products.length === 0) {
          productGrid.innerHTML = "<p style='text-align: center; color: #777; width: 100%;'>No products found matching your filters.</p>";
          return;
        }

        products.forEach(product => {
          const productLink = `product-detail.html?id=${product._id}`; 
          
          productGrid.innerHTML += `
            <a href="${productLink}" class="plp-card">
              <div class="plp-image-box">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
              </div>
              <div class="plp-details">
                <h3 class="plp-brand">${product.brand}</h3>
                <p class="plp-title">${product.name}</p>
                <div class="plp-b2b-info"><span>MOQ: ${product.moq}</span></div>
                <div class="plp-b2b-info"><span>MOQ: ${product.moq}</span></div>
              
              ${isUserLoggedIn() 
                ? `<p class="plp-price">₹${product.salePrice}</p>` 
                : `<p class="plp-price" style="color:#d3a14b; font-size:0.8rem;">Login to View Price</p>`
              }
              
            </div>
            </a>`;
        });
      })
      .catch(err => {
        console.error('Products fetch karne me error:', err);
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
      
      // 1. Saare selected filters ki values nikalo
      const filters = {};
      
      // Sort ki value
      const sortValue = document.querySelector('input[name="sort"]:checked');
      if (sortValue) {
        filters.sort = sortValue.value;
      }
      
      // Material ki values
      const materials = [];
      const materialCheckboxes = document.querySelectorAll('#material-options input:checked');
      materialCheckboxes.forEach(box => {
        materials.push(box.value);
      });
      filters.materials = materials;

      // 2. Naye filters ke saath products load karo
      loadProducts(filters);
      
      // 3. Filter band kar do
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

  // --- 4. Page Load Hote Hi Products Load Karo ---
  loadProducts(); // Pehli baar bina kisi filter ke load karo
  
});