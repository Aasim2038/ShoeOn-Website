// DOM elements ko select kar rahe hain
const menuToggleBtn = document.getElementById('menu-toggle');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileNavMenu = document.getElementById('mobile-nav-menu');
const overlay = document.getElementById('overlay');

// Function jo menu ko kholegi
function openMenu() {
  mobileNavMenu.classList.add('active');
  overlay.classList.add('active');
}

// Function jo menu ko band karegi
function closeMenu() {
  mobileNavMenu.classList.remove('active');
  overlay.classList.remove('active');
}

// Hamburger icon par click karne se menu khulega
menuToggleBtn.addEventListener('click', function(event) {
  event.preventDefault(); // Link ko follow karne se rokega
  openMenu();
});

// Close button par click karne se menu band hoga
closeMenuBtn.addEventListener('click', function() {
  closeMenu();
});

// Overlay (bahar) click karne se bhi menu band hoga
overlay.addEventListener('click', function() {
  closeMenu();
});

/* ===== HERO BANNER SLIDER CODE ===== */

// Pehle zaroori cheezein select kar lo
const sliderTrack = document.getElementById('slider-track');
const slides = Array.from(sliderTrack.children);
const slideCount = slides.length;

// Agar slides hain tabhi code chalao
if (slideCount > 0) {
  let currentSlideIndex = 0;

  // Slider track ki width ko slides ke hisaab se set karo
  // Agar 4 slides hain, toh width 400% hogi
  sliderTrack.style.width = `${slideCount * 100}%`;

  // Har slide ki width ko bhi set karo
  slides.forEach(slide => {
    slide.style.width = `${100 / slideCount}%`;
  });

  // Function jo slide ko change karega
  function moveToNextSlide() {
    // Agli slide ka index calculate karo
    currentSlideIndex = (currentSlideIndex + 1) % slideCount;
    
    // Slider ko left me move karo
    // Har slide 100% / slideCount jitni jagah leti hai
    // To slide 2 pe jaane ke liye - (1 * (100 / slideCount))%
    const amountToMove = currentSlideIndex * (100 / slideCount);
    sliderTrack.style.transform = `translateX(-${amountToMove}%)`;
  }

  // Har 3 second (3000ms) me slide change karo
  setInterval(moveToNextSlide, 3000);
}

/* ===== BOTTOM SHEET ("My Range") CODE ===== */

/* ===== DYNAMIC BOTTOM SHEET CODE (The "Brain") ===== */

// 1. Saara Data yahaan store karenge
// FUTURE ME AAPKO BAS YAHIN NAYI CATEGORY ADD KARNI HAI
const allCategoryData = {
  
  'men-sheet': {
    title: 'Men Footwear',
    items: [
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-casual.jpeg' },
      { name: 'Chappals', img: 'images/sub-cat/subcat-chapple.jpg' },
      { name: 'Flip Flops', img: 'images/sub-cat/subcat-flipflop.jpeg' },
      { name: 'Formal Shoes', img: 'images/sub-cat/subcat-formal.jpeg' },
      { name: 'Sandals', img: 'images/sub-cat/subcat-sandals.jpeg' },
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg' },
    ]
  },
  
  'women-sheet': {
    title: 'Women Footwear',
    items: [
      { name: 'Heels', img: 'images/sub-cat/women-heels.jpeg' },
      { name: 'Flats', img: 'images/sub-cat/women-flats.jpeg' },
      { name: 'Sandals', img: 'images/sub-cat/women-sandals.jpeg' },
      { name: 'Sneakers', img: 'images/sub-cat/women-sneakers.jpeg' },
    ]
  },
  
  'infant-sheet': {
    title: 'Infant Footwear',
    items: [
      { name: 'Booties', img: 'images/sub-cat/subcat-casual.jpeg' },
      { name: 'Soft Shoes', img: 'images/sub-cat/subcat-formal.jpeg' },
      { name: 'First Walkers', img: 'images/sub-cat/subcat-casual.jpeg' },
    ]
  },
  
  'boys-sheet': {
    title: 'Boys Footwear',
    items: [
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg' },
      { name: 'Sandals', img: 'images/sub-cat/subcat-formal.jpeg' },
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg' },
    ]
  },

  'girl-sheet': {
    title: 'girl Footwear',
    items: [
      { name: 'Sports Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg' },
      { name: 'Sandals', img: 'images/sub-cat/subcat-formal.jpeg' },
      { name: 'Casual Shoes', img: 'images/sub-cat/subcat-sportsshoe.jpeg' },
    ]
  }
  
  // Nayi category add karne ke liye bas yahaan copy-paste karo
  
};


// 2. HTML Elements ko pakdo
const categoryTriggers = document.querySelectorAll('.category-trigger');
const sheetOverlay = document.getElementById('sheet-overlay');
const bottomSheet = document.getElementById('category-sheet-modal');
const sheetTitle = document.getElementById('sheet-title');
const sheetGrid = document.getElementById('sheet-grid-content');
const closeSheetBtn = document.getElementById('universal-sheet-close-btn');

// 3. Function: Pop-up ko data se bharne ke liye
function openSheet(categoryKey) {
  // Data object se category ka data nikalo
  const data = allCategoryData[categoryKey];
  
  if (!data) {
    console.error('Data not found for category:', categoryKey);
    return; // Agar data na mile toh ruk jao
  }
  
  // 1. Title set karo
  sheetTitle.innerText = data.title;
  
  // 2. Grid ko khali karo
  sheetGrid.innerHTML = ''; 
  
  // 3. Grid ko naye items se bharo
  let itemsHTML = ''; // Saare items ka HTML string
  data.items.forEach(item => {
    itemsHTML += `
      <div class="subcategory-item">
        <img src="${item.img}" alt="${item.name}">
        <p>${item.name}</p>
      </div>
    `;
  });
  
  sheetGrid.innerHTML = itemsHTML; // HTML ko grid me daalo
  
  // 4. Pop-up ko dikhao
  bottomSheet.classList.add('active');
  sheetOverlay.classList.add('active');
}

// 4. Function: Pop-up ko band karne ke liye
function closeSheet() {
  bottomSheet.classList.remove('active');
  sheetOverlay.classList.remove('active');
}

// 5. Saare Click events
// Har category trigger (Men, Women..) par click
categoryTriggers.forEach(button => {
  button.addEventListener('click', function(event) {
    event.preventDefault();
    const categoryKey = button.dataset.target; // 'men-sheet' ya 'women-sheet'
    openSheet(categoryKey); // Uss key ke data se pop-up kholo
  });
});

// Close button par click
closeSheetBtn.addEventListener('click', closeSheet);

// Overlay (bahar) par click
sheetOverlay.addEventListener('click', closeSheet);