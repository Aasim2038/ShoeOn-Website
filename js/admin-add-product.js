/* =========================================
   ADMIN ADD PRODUCT.JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Discount Logic ---
  const mrpInput = document.getElementById('mrp');
  const discountInput = document.getElementById('discount');
  const salePriceInput = document.getElementById('salePrice');

  // Function: % se Price calculate karna
  function calculateSalePrice() {
    const mrp = parseFloat(mrpInput.value);
    const discount = parseFloat(discountInput.value);
    
    if (!isNaN(mrp) && !isNaN(discount)) {
      const salePrice = mrp - (mrp * (discount / 100));
      salePriceInput.value = salePrice.toFixed(2);
    }
  }
  
  // Function: Price se % calculate karna
  function calculateDiscount() {
    const mrp = parseFloat(mrpInput.value);
    const salePrice = parseFloat(salePriceInput.value);
    
    if (!isNaN(mrp) && !isNaN(salePrice) && mrp > 0) {
      const discount = ((mrp - salePrice) / mrp) * 100;
      discountInput.value = discount.toFixed(2);
    }
  }
  
  // Event Listeners: Jab koi type kare toh calculate ho
  if(mrpInput) mrpInput.addEventListener('input', calculateSalePrice);
  if(discountInput) discountInput.addEventListener('input', calculateSalePrice);
  if(salePriceInput) salePriceInput.addEventListener('input', calculateDiscount);
  

  // --- 2. Form Submit Logic ---
  const form = document.getElementById('add-product-form');
  const responseDiv = document.getElementById('form-response');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Page reload hone se roko
      responseDiv.innerText = 'Saving...';
      responseDiv.style.color = 'blue';

      // 1. Saare Tags (Checkboxes) jama karo
      const tags = [];
      if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
      if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
      if (document.getElementById('tag-featured').checked) tags.push('Featured');
      
      // 2. Saari Images jama karo
      const images = [];
      const img1 = document.getElementById('image1').value;
      const img2 = document.getElementById('image2').value;
      if (img1) images.push(img1); // Agar URL daala hai toh hi add karo
      if (img2) images.push(img2);

      // 3. Poora Product Data JSON banao
      const productData = {
        name: document.getElementById('name').value,
        brand: document.getElementById('brand').value,
        description: document.getElementById('description').value,
        mrp: parseFloat(mrpInput.value),
        salePrice: parseFloat(salePriceInput.value),
        moq: parseInt(document.getElementById('moq').value),
        category: document.getElementById('category').value,
        material: document.getElementById('material').value,
        images: images,
        tags: tags
      };

      // 4. Server ke API ko data bhejo
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          responseDiv.innerText = `Error: ${data.error}`;
          responseDiv.style.color = 'red';
        } else {
          responseDiv.innerText = 'Product Saved Successfully!';
          responseDiv.style.color = 'green';
          form.reset(); // Form khaali kar do
        }
      })
      .catch(err => {
        responseDiv.innerText = 'Server Error. Check terminal.';
        responseDiv.style.color = 'red';
      });
    });
  }
});