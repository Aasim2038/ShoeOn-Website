/* =========================================
   HOME.JS (Sirf index.html par chalega)
   ========================================= */

// allCategoryData object ab database.js se aa raha hai

document.addEventListener('DOMContentLoaded', () => {
  const categoryTriggers = document.querySelectorAll('.category-trigger');
  const sheetOverlay = document.getElementById('sheet-overlay');
  const bottomSheet = document.getElementById('category-sheet-modal');

  // Check karo ki allCategoryData load hua ya nahi
  if (categoryTriggers.length > 0 && sheetOverlay && bottomSheet && typeof allCategoryData !== 'undefined') {
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
});