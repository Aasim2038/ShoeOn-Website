/* =========================================
   HOME.JS (Dynamic Slider + Popups)
   ========================================= */

// 1. Categories Data (Pop-ups ke liye - Waisa hi hai)
const allCategoryData = {
  'men-sheet': {
    title: 'Men Footwear',
    items: [
      { name: 'Casual Shoes', img: 'images/sub-cat/casual-shoes.jpeg', url: 'products.html?category=men-casual' },
      { name: 'PU Chappals', img: 'images/sub-cat/PU-Chappal.jpg', url: 'products.html?category=men-pu-chappal' },
      { name: 'Sandals', img: 'images/sub-cat/sandals.png', url: 'products.html?category=men-sandals' },
      { name: 'Sports Shoes', img: 'images/sub-cat/sports-shoes.jpeg', url: 'products.html?category=men-sports' },
      { name: 'Crocks', img: 'images/sub-cat/crock.jpg', url: 'products.html?category=men-crock' },
      { name: ' Safety Shoe', img: 'images/sub-cat/msafety-shoes.jpeg', url: 'products.html?category=men-safty' },
    ]
  },
  'women-sheet': {
    title: 'Women Footwear',
    items: [
      { name: 'Bellies', img: 'images/sub-cat/women-bellies.jpg', url: 'products.html?category=women-bellies' },
      { name: 'PU-chappal', img: 'images/sub-cat/women-pu-chappal.jpg', url: 'products.html?category=women-pu-chappal' },
      { name: 'PU-sandals', img: 'images/sub-cat/women-pu-sandals.jpg', url: 'products.html?category=women-pu-sandals' },
      { name: 'crocks', img: 'images/sub-cat/crock.jpg', url: 'products.html?category=women-crockss' },
      { name: 'Safety Shoe', img: 'images/sub-cat/wsafety-shoes.png', url: 'products.html?category=women-safty' },
    ]
  },
  'boys-sheet': { title: 'Boys Footwear', items: [
    { name: 'Sports-shoes', img: 'images/sub-cat/chapple.jpg', url: 'products.html?category=boys-Sports-shoes' },
      { name: 'PU Chappals', img: 'images/sub-cat/PU-Chappal.jpg', url: 'products.html?category=boys-PU Chappals' },
      { name: 'Sandals', img: 'images/sub-cat/sandals.png', url: 'products.html?category=boys-sandals' },
      { name: 'School shoes', img: 'images/sub-cat/shool-shoe.jpg', url: 'products.html?category=boys-School shoes' },
      { name: 'Crocks', img: 'images/sub-cat/crock.jpg', url: 'products.html?category=boys-crocks' },
  ] },
  'girl-sheet': { title: 'Girls Footwear', items: [
      { name: 'Bellies', img: 'images/sub-cat/women-bellies.jpg', url: 'products.html?category=girl-bellies' },     
      { name: 'PU-chappal', img: 'images/sub-cat/women-pu-chappal.jpg', url: 'products.html?category=girl-pu-chappal' },
      { name: 'PU-sandals', img: 'images/sub-cat/women-pu-sandals.jpg', url: 'products.html?category=girl-pu-sandals' },
      { name: 'School ballies', img: 'images/sub-cat/girl-school-ballies.jpg', url: 'products.html?category=girl-School ballies' },
      { name: 'Crocks', img: 'images/sub-cat/crock.jpg', url: 'products.html?category=girl-crocks' },
      { name: 'Safty Shoe', img: '', url: 'products.html?category= -safty' },  ] },
  
  'girl-sheet': { title: 'Girls Footwear', items: [
      { name: 'Bellies', img: 'images/sub-cat/women-bellies.jpg', url: 'products.html?category=girl-bellies' },     
      { name: 'PU-chappal', img: 'images/sub-cat/women-pu-chappal.jpg', url: 'products.html?category=girl-pu-chappal' },
      { name: 'PU-sandals', img: 'images/sub-cat/women-pu-sandals.jpg', url: 'products.html?category=girl-pu-sandals' },
      { name: 'School ballies', img: 'images/sub-cat/girl-school-ballies.jpg', url: 'products.html?category=girl-School ballies' },
      { name: 'Crocks', img: 'images/sub-cat/crock.jpg', url: 'products.html?category=girl-crocks' }
   ]},
 'loose-sheet': { 
  title: 'Loose Footwear',
  items: [
    // Hum sub-categories ko bhi 'women-loose' jaisa naam de rahe hain taaki unique rahe
    { name: 'Womens', img: 'images/catogywomen.png', url: 'products.html?isLoose=true&category=women-loose' }, 
    { name: 'Mens', img: 'images/catogyman.png', url: 'products.html?isLoose=true&category=men-loose' },
    { name: 'Boys', img: 'images/catogyboy.png', url: 'products.html?isLoose=true&category=boys-loose' },
    { name: 'Girls', img: 'images/catogygirl.png', url: 'products.html?isLoose=true&category=girls-loose' },
    { name: 'Kids', img: 'images/sub-cat/crock.jpg', url: 'products.html?isLoose=true&category=kids-loose' }
  ]
}
};


document.addEventListener('DOMContentLoaded', () => {
  
  // --- A. LOAD SETTINGS (Slider & Contact) ---
  function loadSiteSettings() {
    const sliderTrack = document.getElementById('slider-track');
    const footerEmail = document.getElementById('footer-email');
    const footerPhone = document.getElementById('footer-phone');

    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        
        // 1. Update Footer Info
        if (settings.supportEmail && footerEmail) footerEmail.innerText = settings.supportEmail;
        if (settings.supportPhone && footerPhone) footerPhone.innerText = settings.supportPhone;

        // 2. Build Slider
        if (sliderTrack && settings.banners && settings.banners.length > 0) {
          sliderTrack.innerHTML = ''; // Clear default
          
          settings.banners.forEach(imgUrl => {
            // Cloudinary URL se image banao
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.innerHTML = `<img src="${imgUrl}" alt="Banner">`;
            sliderTrack.appendChild(slideDiv);
          });

          // Images load hone ke baad Slider Animation start karo
          startSliderAnimation(settings.banners.length);
        }
      })
      .catch(err => console.error('Settings load error:', err));
  }

  // --- B. SLIDER ANIMATION LOGIC ---
  function startSliderAnimation(slideCount) {
    if (slideCount <= 1) return; // Agar 1 hi image hai toh slide mat karo

    const sliderTrack = document.getElementById('slider-track');
    let currentSlideIndex = 0;

    // Track ki width set karo (e.g., 3 images = 300%)
    sliderTrack.style.width = `${slideCount * 100}%`;
    
    // Har slide ki width set karo
    Array.from(sliderTrack.children).forEach(slide => {
      slide.style.width = `${100 / slideCount}%`;
    });

    // Auto Slide Interval (Har 3 second me)
    setInterval(() => {
      currentSlideIndex = (currentSlideIndex + 1) % slideCount;
      const amountToMove = currentSlideIndex * (100 / slideCount);
      sliderTrack.style.transform = `translateX(-${amountToMove}%)`;
    }, 3000);
  }

  // --- C. POPUP LOGIC (Waisa hi hai) ---
  const categoryTriggers = document.querySelectorAll('.category-trigger');
  const sheetOverlay = document.getElementById('sheet-overlay');
  const bottomSheet = document.getElementById('category-sheet-modal');

  if (categoryTriggers.length > 0 && sheetOverlay && bottomSheet) {
    const sheetTitle = document.getElementById('sheet-title');
    const sheetGrid = document.getElementById('sheet-grid-content');
    const closeSheetBtn = document.getElementById('universal-sheet-close-btn');

    function openSheet(categoryKey) {
      const data = allCategoryData[categoryKey];
      if (!data) return;
      sheetTitle.innerText = data.title;
      sheetGrid.innerHTML = ''; 
      let itemsHTML = '';
      data.items.forEach(item => {
        itemsHTML += `<a href="${item.url}" class="subcategory-item"><img src="${item.img}" alt="${item.name}" loading="lazy"><p>${item.name}</p></a>`;
      });
      sheetGrid.innerHTML = itemsHTML;
      bottomSheet.classList.add('active');
      sheetOverlay.classList.add('active');
    }
    function closeSheet() {
      bottomSheet.classList.remove('active');
      sheetOverlay.classList.remove('active');
    }
    categoryTriggers.forEach(button => {
      button.addEventListener('click', (e) => { e.preventDefault(); const key = button.dataset.target; openSheet(key); });
    });
    closeSheetBtn.addEventListener('click', closeSheet);
    sheetOverlay.addEventListener('click', closeSheet);
  }
  
  // --- D. HOME SECTIONS (New Arrival etc.) ---
  // (Yeh code bhi humne pehle add kiya tha)
  function loadHomeSection(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Check login status (global.js se function mil sakta hai, nahi toh localStorage check karo)
    const isUserLoggedIn = localStorage.getItem('shoeonUser') ? true : false;

    fetch(`/api/products?tag=${tag}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(products => {
        if (products.length === 0) {
          container.innerHTML = '<p style="padding:20px; color:#999;">Coming Soon...</p>';
          return;
        }
        let html = '';
        products.forEach(product => {
          html += `
            <div class="product-card-b2b" onclick="window.location.href='product-detail.html?id=${product._id}'" style="cursor:pointer;">
              <div class="card-image-container">
                <img src="${product.images[0] || 'images/placeholder.jpg'}" alt="${product.name}" class="product-image" loading="lazy">
              </div>
              <div class="card-info-container">
                <h3 class="product-brand">${product.brand}</h3>
                <p class="product-category">${product.name}</p>
                <div class="b2b-info">
                  <div class="info-left">
                    <span class="product-price-label">Price</span>
                    <span class="product-price">
                       ${isUserLoggedIn ? '₹'+product.salePrice : 'Login'}
                    </span>
                  </div>
                  <div class="info-right">
                    <span class="moq-label">MOQ</span>
                    <span class="moq-value">${product.moq} Prs</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
      })
      .catch(err => console.error(err));
  }

  // Load Sections
  loadHomeSection('Top Best', 'top-best-container');
  loadHomeSection('New Arrival', 'new-arrival-container');
  loadHomeSection('Featured', 'featured-container');
  
  // Load Settings (Banner) - Sabse last me call karo
  loadSiteSettings();

});/* =========================================
   INTRO VIDEO LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('intro-overlay');
    const introVideo = document.getElementById('intro-video');

    // Sirf tab chalega jab HTML uncommented ho
    if (introOverlay && introVideo) {
        
        // 1. Jab video khatam ho jaye, to overlay hata do
        introVideo.onended = function() {
            closeIntro();
        };

        // 2. Safety: Agar 5 second mein video load na ho to hata do (Fallback)
        setTimeout(() => {
            // Agar video atak gaya to 6 second baad auto close
           // closeIntro(); 
        }, 8000); 
    }
});

// Function to close intro
function closeIntro() {
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
        introOverlay.style.opacity = '0'; // Smooth fade out
        setTimeout(() => {
            introOverlay.style.display = 'none'; // Remove from screen
        }, 500); // 0.5 sec ka fade animation
    }
}