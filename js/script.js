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

// Saare elements ko select kar rahe hain
// IMPORTANT: Humne ID change kar di hai
const menCategoryBtn = document.getElementById('my-range-men-btn'); 
const bottomSheet = document.getElementById('men-footwear-sheet');
const sheetOverlay = document.getElementById('sheet-overlay');
const sheetCloseBtn = document.getElementById('sheet-close-btn');

// Function jo sheet ko kholega
function openMenSheet() {
  bottomSheet.classList.add('active');
  sheetOverlay.classList.add('active');
}

// Function jo sheet ko band karega
function closeMenSheet() {
  bottomSheet.classList.remove('active');
  sheetOverlay.classList.remove('active');
}

// Check karo ki elements page par hain ya nahi (error se bachne ke liye)
if (menCategoryBtn && bottomSheet && sheetOverlay && sheetCloseBtn) {
  
  // "Men" category par click karne se sheet khulegi
  menCategoryBtn.addEventListener('click', function(event) {
    event.preventDefault(); // Default link behaviour ko roko
    openMenSheet();
  });

  // Close button par click karne se sheet band hogi
  sheetCloseBtn.addEventListener('click', closeMenSheet);

  // Overlay (bahar) click karne se bhi sheet band hogi
  sheetOverlay.addEventListener('click', closeMenSheet);
}