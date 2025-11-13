/* =========================================
   1. MOBILE MENU TOGGLE (Home Page)
   ========================================= */
const menuToggleBtn = document.getElementById('menu-toggle');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileNavMenu = document.getElementById('mobile-nav-menu');
const overlay = document.getElementById('overlay');

if (menuToggleBtn && closeMenuBtn && mobileNavMenu && overlay) {
  function openMenu() {
    mobileNavMenu.classList.add('active');
    overlay.classList.add('active');
  }
  function closeMenu() {
    mobileNavMenu.classList.remove('active');
    overlay.classList.remove('active');
  }
  menuToggleBtn.addEventListener('click', (e) => { e.preventDefault(); openMenu(); });
  closeMenuBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
}


/* =========================================
   2. HOME PAGE: DYNAMIC BOTTOM SHEETS
   ========================================= */
// Categories ka Data
const allCategoryData = {
  'men-sheet': {
    title: 'Men Footwear',
    items: [
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-casual.jpeg', url: 'products.html?category=men-casual' },
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg', url: 'products.html?category=men-sports' },
      { name: 'Formal Shoes', img: 'images/sub-cat/subcat-formal.jpeg', url: 'products.html?category=men-formal' },
      { name: 'Sandals', img: 'images/sub-cat/subcat-sandals.jpeg', url: 'products.html?category=men-sandals' },
    ]
  },
  'women-sheet': {
    title: 'Women Footwear',
    items: [
      { name: 'Heels', img: 'images/sub-cat/women-heels.jpeg', url: 'products.html?category=women-heels' },
      { name: 'Flats', img: 'images/sub-cat/women-flats.jpeg', url: 'products.html?category=women-flats' },
      { name: 'Sandals', img: 'images/sub-cat/women-sandals.jpeg', url: 'products.html?category=women-sandals' },
    ]
  },
  'boys-sheet': {
    title: 'Boys Footwear',
    items: [
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg', url: 'products.html?category=boys-sports' },
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-casual.jpeg', url: 'products.html?category=boys-casual' },
    ]
  },
  'girl-sheet': {
    title: 'girl Footwear',
    items: [
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg', url: 'products.html?category=boys-sports' },
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-casual.jpeg', url: 'products.html?category=boys-casual' },
    ]
  }
};

// Elements Select Karna
const categoryTriggers = document.querySelectorAll('.category-trigger');
const sheetOverlay = document.getElementById('sheet-overlay');
const bottomSheet = document.getElementById('category-sheet-modal');

if (categoryTriggers.length > 0 && sheetOverlay && bottomSheet) {
  
  const sheetTitle = document.getElementById('sheet-title');
  const sheetGrid = document.getElementById('sheet-grid-content');
  const closeSheetBtn = document.getElementById('universal-sheet-close-btn');

  // Function: Sheet ko bharna aur kholna
  function openSheet(categoryKey) {
    const data = allCategoryData[categoryKey];
    if (!data) return;

    sheetTitle.innerText = data.title;
    sheetGrid.innerHTML = ''; // Purana content saaf karo

    let itemsHTML = '';
    data.items.forEach(item => {
      // Yahaan humne href (link) daal diya hai
      itemsHTML += `
        <a href="${item.url}" class="subcategory-item">
          <img src="${item.img}" alt="${item.name}">
          <p>${item.name}</p>
        </a>
      `;
    });
    sheetGrid.innerHTML = itemsHTML;

    bottomSheet.classList.add('active');
    sheetOverlay.classList.add('active');
  }

  // Function: Sheet band karna
  function closeSheet() {
    bottomSheet.classList.remove('active');
    sheetOverlay.classList.remove('active');
  }

  // Click Listeners lagana
  categoryTriggers.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryKey = button.dataset.target;
      openSheet(categoryKey);
    });
  });

  closeSheetBtn.addEventListener('click', closeSheet);
  sheetOverlay.addEventListener('click', closeSheet);
}


/* =========================================
   3. PRODUCT LISTING PAGE (products.html)
   ========================================= */

// Products ka Database
const productsDatabase = {
  'men-casual': {
    title: "Men's Casual Shoes",
    count: '12 Styles',
    products: [
      { brand: 'Liberty', name: 'Synthetic Upper Casual', price: '₹1,585', img: 'images/plp-shoe-2.jpeg', moq: '10' },
      { brand: 'Bata', name: 'Daily Wear Loafers', price: '₹999', img: 'images/plp-shoe-1.jpeg', moq: '12' },
      { brand: 'Sparx', name: 'Canvas Sneakers', price: '₹750', img: 'images/cartimg-spark.jpg', moq: '8' },
      { brand: 'Adidas', name: 'Street Run', price: '₹2,100', img: 'images/cartimg-adidas.jpg', moq: '6' },
    ]
  },
  'men-sports': {
    title: "Men's Sports Shoes",
    count: '8 Styles',
    products: [
      { brand: 'Nike', name: 'Air Zoom Pegasus', price: '₹4,500', img: 'images/cartimg-nike.jpg', moq: '5' },
      { brand: 'Puma', name: 'Nitro Runner', price: '₹3,200', img: 'images/cartimg-puma.jpg', moq: '5' },
    ]
  },
  'women-sandals': {
    title: "Women's Sandals & Flats",
    count: '20 Styles',
    products: [
      { brand: 'Catwalk', name: 'Golden Strap Sandals', price: '₹1,200', img: 'images/sub-cat/women-flats.jpeg', moq: '10' },
      { brand: 'Bata', name: 'Comfy Flats', price: '₹599', img: 'images/sub-cat/women-heels.jpeg', moq: '15' },
    ]
  },
  // Fallback (Agar kuch na mile)
  'default': {
    title: "All Products",
    count: '0 Styles',
    products: []
  }
};

// Page Load hone par chalne wala logic
document.addEventListener('DOMContentLoaded', function() {
  
  // Check karo ki hum 'products.html' par hain
  const productGrid = document.getElementById('product-grid');
  
  if (productGrid) {
    const pageTitle = document.getElementById('page-category-title');
    const styleCount = document.getElementById('style-count');

    // URL se category nikalo (?category=...)
    const params = new URLSearchParams(window.location.search);
    const categoryKey = params.get('category');

    console.log("Current Category:", categoryKey); // Checking for errors

    // Database se match karo, nahi toh 'men-casual' dikhao (Fallback)
    const data = productsDatabase[categoryKey] || productsDatabase['men-casual'];

    if (data) {
      pageTitle.innerText = data.title;
      styleCount.innerText = data.count;

      let cardsHTML = '';
      data.products.forEach(product => {
        cardsHTML += `
          <a href="product-detail.html" class="plp-card">
            
            <div class="plp-image-box">
              <img src="${product.img}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/150'">
              
              <object><div class="wishlist-icon"><i class="fa-regular fa-heart"></i></div></object>
            </div>
            
            <div class="plp-details">
              <h3 class="plp-brand">${product.brand}</h3>
              <p class="plp-title">${product.name}</p>
              <div class="plp-meta-info">
                <span><i class="fa-solid fa-palette"></i> 1 Color</span>
                <span><i class="fa-solid fa-ruler"></i> All Sizes</span>
              </div>
              <div class="plp-b2b-info">
                <span>MOQ: ${product.moq}</span>
                <span>Margin: 25%</span>
              </div>
              <p class="plp-price">${product.price}</p>
            </div>
            
          </a>
        `;
      });
      productGrid.innerHTML = cardsHTML;
    } else {
      pageTitle.innerText = "Product Not Found";
    }
  }
});