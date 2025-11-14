/* =========================================
   HOME.JS (Sirf index.html par chalega)
   (FIXED - Data ke saath)
   ========================================= */

// 1. Categories ka Data (Pop-ups ke liye)
// Humne data wapas is file me daal diya hai
const allCategoryData = {
  "men-sheet": {
    title: "Men Footwear",
    items: [
      {
        name: "Casual Shoes",
        img: "images/sub-cat/casual-shoes.jpeg",
        url: "products.html?category=men-casual",
      },
      {
        name: "Sports Shoes",
        img: "images/sub-cat/sports-shoes.jpeg",
        url: "products.html?category=men-sports",
      },
      {
        name: "chapple",
        img: "images/sub-cat/chapple.jpg",
        url: "products.html?category=men-chapple",
      },
      {
        name: "formal",
        img: "images/sub-cat/formal.jpeg",
        url: "products.html?category=men-formal",
      },
    ],
  },
  "women-sheet": {
    title: "Women Footwear",
    items: [
      {
        name: "Sandals",
        img: "images/sub-cat/women-sandals.jpeg",
        url: "products.html?category=women-sandals",
      },
      {
        name: "Heels",
        img: "images/sub-cat/women-heels.jpeg",
        url: "products.html?category=women-heels",
      },
    ],
  },
  "boys-sheet": {
    title: "Boys Footwear",
    items: [
      {
        name: "flipflop",
        img: "images/sub-cat/flipflop.jpeg",
        url: "products.html?category=men-flipflop",
      },
      {
        name: "sandals",
        img: "images/sub-cat/sandals.jpeg",
        url: "products.html?category=men-flipflop",
      },
    ],
  },
  "girl-sheet": {
    title: "Girls Footwear",
    items: [
      {
        name: "flats",
        img: "images/sub-cat/women-flats.jpeg",
        url: "products.html?category=women-flats",
      },
      {
        name: "sneakers",
        img: "images/sub-cat/women-sneakers.jpeg",
        url: "products.html?category=women-sneakers",
      },
    ],
  },
};

// 2. Pop-up ka Logic
document.addEventListener("DOMContentLoaded", () => {
  const categoryTriggers = document.querySelectorAll(".category-trigger");
  const sheetOverlay = document.getElementById("sheet-overlay");
  const bottomSheet = document.getElementById("category-sheet-modal");

  // Check karo ki allCategoryData hai (jo humne upar define kiya)
  if (
    categoryTriggers.length > 0 &&
    sheetOverlay &&
    bottomSheet &&
    typeof allCategoryData !== "undefined"
  ) {
    const sheetTitle = document.getElementById("sheet-title");
    const sheetGrid = document.getElementById("sheet-grid-content");
    const closeSheetBtn = document.getElementById("universal-sheet-close-btn");

    function openSheet(categoryKey) {
      const data = allCategoryData[categoryKey];
      if (!data) return;
      sheetTitle.innerText = data.title;
      sheetGrid.innerHTML = "";
      let itemsHTML = "";
      data.items.forEach((item) => {
        itemsHTML += `<a href="${item.url}" class="subcategory-item"><img src="${item.img}" alt="${item.name}" loading="lazy"><p>${item.name}</p></a>`;
      });
      sheetGrid.innerHTML = itemsHTML;
      bottomSheet.classList.add("active");
      sheetOverlay.classList.add("active");
    }
    function closeSheet() {
      bottomSheet.classList.remove("active");
      sheetOverlay.classList.remove("active");
    }
    categoryTriggers.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const key = button.dataset.target;
        openSheet(key);
      });
    });
    closeSheetBtn.addEventListener("click", closeSheet);
    sheetOverlay.addEventListener("click", closeSheet);
  }
});
