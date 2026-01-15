/* =========================================
                  HOME.JS (FIXED & CLEANED)
   ========================================= */

// --- 1. CONFIGURATION & DATA ---

const allCategoryData = {
  'men-sheet': {
    title: 'Men Footwear',
    items: [
      { name: 'Casual Shoes', img: 'images/sub-cat/casual-shoes.webp', url: 'products.html?category=men-casual' },
      { name: 'PU Chappals', img: 'images/sub-cat/PU-Chappal.jpeg', url: 'products.html?category=men-pu-chappal' },
      { name: 'Sandals', img: 'images/sub-cat/sandals.webp', url: 'products.html?category=men-sandals' },
      { name: 'Sports Shoes', img: 'images/sub-cat/sports-shoes.webp', url: 'products.html?category=men-sports-shoes' },
      { name: 'Crocks', img: 'images/sub-cat/crock.webp', url: 'products.html?category=men-crocks' },
      { name: 'Safety Shoe', img: 'images/sub-cat/msafety-shoes.webp', url: 'products.html?category=men-safty%20shoe' },    ]
  },
  'women-sheet': {
    title: 'Women Footwear',
    items: [
      { name: 'Bellies', img: 'images/sub-cat/women-bellies.webp', url: 'products.html?category=women-bellies' },
      { name: 'PU-chappal', img: 'images/sub-cat/women-pu-chappal.jpeg', url: 'products.html?category=women-pu-chappal' },
      { name: 'PU-sandals', img: 'images/sub-cat/women-pu-sandals.webp', url: 'products.html?category=women-pu-sandals' },
      { name: 'Crocks', img: 'images/sub-cat/crock.webp', url: 'products.html?category=women-crocks' },
      { name: 'Safety Shoe', img: 'images/sub-cat/wsafety-shoes.webp', url: 'products.html?category=women-safty%20shoe' },
    ]
  },
  'boys-sheet': {
    title: 'Boys Footwear',
    items: [
      { name: 'Sports-shoes', img: 'images/sub-cat/boyssportsshoe.webp', url: 'products.html?category=boys-sports-shoes' },
      { name: 'PU Chappals', img: 'images/sub-cat/PU-Chappal.jpeg', url: 'products.html?category=boys-pu-chappal' },
      { name: 'Sandals', img: 'images/sub-cat/sandals.webp', url: 'products.html?category=boys-sandals' },
      { name: 'School shoes', img: 'images/sub-cat/shool-shoe.webp', url: 'products.html?category=boys-school-shoes' },
      { name: 'Crocks', img: 'images/sub-cat/crock.webp', url: 'products.html?category=boys-crocks' },
    ]
  },
  'girl-sheet': {
    title: 'Girls Footwear',
    items: [
      { name: 'Bellies', img: 'images/sub-cat/women-bellies.webp', url: 'products.html?category=girls-bellies' },
      { name: 'PU-chappal', img: 'images/sub-cat/women-pu-chappal.jpeg', url: 'products.html?category=girls-pu-chappal' },
      { name: 'PU-sandals', img: 'images/sub-cat/women-pu-sandals.webp', url: 'products.html?category=girls-pu-sandals' },
      { name: 'School Bellies', img: 'images/sub-cat/girl-school-ballies.webp', url: 'products.html?category=girls-school-bellies' },
      { name: 'Crocks', img: 'images/sub-cat/crock.webp', url: 'products.html?category=girls-crocks' }
    ]
  },
  'loose-sheet': {
    title: 'Loose Footwear',
    items: [
      { name: 'Womens', img: 'images/catogywomen.webp', url: 'products.html?category=Loose-womens' },
      { name: 'Mens', img: 'images/catogyman.webp', url: 'products.html?category=Loose-men' },
      { name: 'Boys', img: 'images/catogyboy.webp', url: 'products.html?category=Loose-boys' },
      { name: 'Girls', img: 'images/catogygirl.webp', url: 'products.html?category=Loose-girls' },
      { name: 'Kids', img: 'images/sub-cat/crock.webp', url: 'products.html?category=Loose-kids' }
    ]
  },
  'party-sheet': {
    title: 'Party Wear Footwear',
    items: [
      { name: 'Womens', img: 'images/sub-cat/women-party.webp', url: 'products.html?category=party-womens' },
      { name: 'Girls', img: 'images/sub-cat/girl-party.webp', url: 'products.html?category=party-girls' },
    ]
  },
  'lot-sheet': {
    title: 'Lot & Surplus Footwear',
    items: [
      { name: 'Mens', img: 'images/sub-cat/PU-Chappal.jpeg', url: 'products.html?category=lot-mens' },
      { name: 'Womens', img: 'images/sub-cat/women-party.webp', url: 'products.html?category=lot-womens' },
    ]
  }
};

// --- 2. GLOBAL HELPER FUNCTIONS ---

function getOptimizedUrl(url, width = 600) {
  if (!url) return 'images/puma-logo.webp';
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
}

function startSliderAnimation(slideCount) {
  if (slideCount <= 1) return; 
  const sliderTrack = document.getElementById('slider-track');
  let currentSlideIndex = 0;
  setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % slideCount;
    if(sliderTrack) {
        sliderTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }
  }, 3000); 
}

function loadSiteSettings() {
  const sliderTrack = document.getElementById('slider-track');
  const footerEmail = document.getElementById('footer-email');
  const footerPhone = document.getElementById('footer-phone');

  fetch('/api/settings')
    .then(res => res.json())
    .then(settings => {
      // Update Footer
      if (settings.supportEmail && footerEmail) footerEmail.innerText = settings.supportEmail;
      if (settings.supportPhone && footerPhone) footerPhone.innerText = settings.supportPhone;

      // Build Slider
      if (sliderTrack && settings.banners && settings.banners.length > 0) {
        sliderTrack.innerHTML = ''; 
        settings.banners.forEach((imgUrl, index) => {
          const slideDiv = document.createElement('div');
          slideDiv.className = 'slide';
          slideDiv.innerHTML = `<img src="${getOptimizedUrl(imgUrl, 800)}" alt="Banner ${index+1}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
          sliderTrack.appendChild(slideDiv);
        });
        startSliderAnimation(settings.banners.length);
      }
    })
    .catch(err => console.error('Settings load error:', err));
}

function loadHighlights() {
  const track = document.getElementById('highlights-track');
  const section = document.getElementById('highlights-section');

  if (!track || !section) return; // Safety Check

  fetch('/api/highlights')
      .then(res => res.json())
      .then(items => {
          if (Array.isArray(items) && items.length > 0) {
              section.style.display = 'block'; // Data hai to dikhao
              track.innerHTML = '';

              items.forEach(item => {
                  let mediaHTML = '';
                  
                  if (item.type === 'video') {
                      mediaHTML = `<video src="${item.url}" muted loop playsinline onclick="this.paused ? this.play() : this.pause()"></video>`;
                  } else {
                      mediaHTML = `<img src="${item.url}" alt="Highlight">`;
                  }

                  const card = document.createElement('div');
                  card.className = 'highlight-card';
                  card.innerHTML = `
                      ${mediaHTML}
                      <div style="position:absolute; bottom:0; left:0; width:100%; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding:10px;">
                          <p style="color:white; font-size:0.8rem; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title || ''}</p>
                      </div>
                  `;
                  track.appendChild(card);
              });
          } else {
            section.style.display = 'none'; // Data nahi hai to chupao
          }
      })
      .catch(err => console.error("Highlights error:", err));
}

function loadHomeSection(tag, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const userData = JSON.parse(localStorage.getItem('shoeonUser'));
  const isUserLoggedIn = userData ? true : false;
  const isOffline = userData && userData.isOfflineCustomer; 

  fetch(`/api/products?tag=${tag}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(products => {
      if (products.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#999;">Coming Soon...</p>';
        return;
      }
      let html = '';
      products.forEach(product => {
        let finalPrice = product.salePrice; 
        let priceStyle = "";

        if (isOffline && product.offlinePrice && product.offlinePrice > 0) {
          finalPrice = product.offlinePrice;
          priceStyle = "color: #d35400;"; 
        }

        html += `
          <div class="product-card-b2b" onclick="window.location.href='product-detail.html?id=${product._id}'" style="cursor:pointer;">
            <div class="card-image-container">
              <img src="${getOptimizedUrl(product.images[0], 400)}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="card-info-container">
              <h3 class="product-brand">${product.brand}</h3>
              <p class="product-category">${product.name}</p>
              <div class="b2b-info">
                <div class="info-left">
                  <span class="product-price-label">Price</span>
                  <span class="product-price" style="${priceStyle}">
                     ${isUserLoggedIn ? '₹' + finalPrice : 'Login'}
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

function closeIntro() {
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
      introOverlay.style.opacity = '0';
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 500);
    }
}


// --- 3. MAIN INITIALIZATION (DOM LOADED) ---

document.addEventListener('DOMContentLoaded', () => {

  // A. Load Sections
  loadHomeSection('Top Best', 'top-best-container');
  loadHomeSection('New Arrival', 'new-arrival-container');
  loadHomeSection('Featured', 'featured-container');

  // B. Load Banners & Highlights
  loadSiteSettings();
  loadHighlights(); // 🔥 Ab ye Error nahi dega

  // C. Category Sheet Logic
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
        itemsHTML += `<a href="${item.url}" class="subcategory-item">
            <img src="${getOptimizedUrl(item.img, 200)}" alt="${item.name}" loading="lazy">
            <p>${item.name}</p>
        </a>`;
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

  // D. Intro Video Logic
  const introOverlay = document.getElementById('intro-overlay');
  const introVideo = document.getElementById('intro-video');

  if (introOverlay && introVideo) {
    introVideo.onended = function () {
      closeIntro();
    };
    // Fallback: 5 sec baad auto close
    setTimeout(() => {
       // closeIntro(); 
    }, 5000);
  }

});