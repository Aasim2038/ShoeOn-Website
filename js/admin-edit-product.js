/* =========================================
   ADMIN-EDIT-PRODUCT.JS (Simple - No File Upload)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Discount Logic (Same) ---
  const mrpInput = document.getElementById('mrp');
  const discountInput = document.getElementById('discount');
  const salePriceInput = document.getElementById('salePrice');

  function calculateSalePrice() { /* ... (puraana code waisa hi) ... */ }
  function calculateDiscount() { /* ... (puraana code waisa hi) ... */ }
  
  // Copy-paste discount logic from admin-add-product.js
  function calculateSalePrice() {
    const mrp = parseFloat(mrpInput.value);
    const discount = parseFloat(discountInput.value);
    if (!isNaN(mrp) && !isNaN(discount)) {
      const salePrice = mrp - (mrp * (discount / 100));
      salePriceInput.value = salePrice.toFixed(2);
    }
  }
  function calculateDiscount() {
    const mrp = parseFloat(mrpInput.value);
    const salePrice = parseFloat(salePriceInput.value);
    if (!isNaN(mrp) && !isNaN(salePrice) && mrp > 0) {
      const discount = ((mrp - salePrice) / mrp) * 100;
      discountInput.value = discount.toFixed(2);
    }
  }
  if(mrpInput) mrpInput.addEventListener('input', calculateSalePrice);
  if(discountInput) discountInput.addEventListener('input', calculateSalePrice);
  if(salePriceInput) salePriceInput.addEventListener('input', calculateDiscount);
  // --- End Discount Logic ---

  
  // --- 2. URL se ID nikalo ---
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  const form = document.getElementById('add-product-form');
  const responseDiv = document.getElementById('form-response');
  
  if (!productId) {
    responseDiv.innerText = 'ERROR: No Product ID found.';
    responseDiv.style.color = 'red';
    return;
  }

  // --- 3. Purana Data Fetch karo aur Form me bharo ---
  fetch(`/api/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById('name').value = product.name;
      document.getElementById('brand').value = product.brand;
      document.getElementById('description').value = product.description || '';
      mrpInput.value = product.mrp;
      salePriceInput.value = product.salePrice;
      discountInput.value = (((product.mrp - product.salePrice) / product.mrp) * 100).toFixed(2);
      document.getElementById('moq').value = product.moq;
      document.getElementById('category').value = product.category;
      document.getElementById('material').value = product.material || '';
      
      if (product.images && product.images.length > 0) {
        document.getElementById('image1').value = product.images[0] || '';
        if (product.images[1]) document.getElementById('image2').value = product.images[1] || '';
      }
      
      if (product.tags) {
        if (product.tags.includes('New Arrival')) document.getElementById('tag-new-arrival').checked = true;
        if (product.tags.includes('Top Best')) document.getElementById('tag-top-best').checked = true;
        if (product.tags.includes('Featured')) document.getElementById('tag-featured').checked = true;
      }
    })
    .catch(err => {
      responseDiv.innerText = `Error loading product.`;
      responseDiv.style.color = 'red';
    });


  // --- 4. Form Submit Logic ko 'PUT' (JSON) me badlo ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); 
      responseDiv.innerText = 'Updating...';
      
      const tags = [];
      if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
      if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
      if (document.getElementById('tag-featured').checked) tags.push('Featured');
      
      // Images ko hum update nahi kar rahe hain, isliye unhe wapas nahi bhejenge
      
      const productData = {
        name: document.getElementById('name').value,
        brand: document.getElementById('brand').value,
        description: document.getElementById('description').value,
        mrp: parseFloat(mrpInput.value),
        salePrice: parseFloat(salePriceInput.value),
        moq: parseInt(document.getElementById('moq').value),
        category: document.getElementById('category').value,
        material: document.getElementById('material').value,
        tags: tags
        // Hum 'images' field ko nahi bhej rahe, taaki woh overwrite na ho
      };

      // Server ke 'PUT' API ko JSON data bhejo
      fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData) // Wapas JSON
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          responseDiv.innerText = `Error: ${data.error}`;
          responseDiv.style.color = 'red';
        } else {
          responseDiv.innerText = 'Product Updated Successfully!';
          responseDiv.style.color = 'green';
        }
      })
      .catch(err => {
        responseDiv.innerText = 'Server Error.';
        responseDiv.style.color = 'red';
      });
    });
  }
});