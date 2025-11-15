/* =========================================
   ADMIN-EDIT-PRODUCT.JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Discount Logic (Same as add-product) ---
  const mrpInput = document.getElementById('mrp');
  const discountInput = document.getElementById('discount');
  const salePriceInput = document.getElementById('salePrice');

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
  

  // --- 2. (NAYA) URL se ID nikalo ---
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  const form = document.getElementById('add-product-form');
  const responseDiv = document.getElementById('form-response');
  
  if (!productId) {
    // Agar URL me ID nahi hai, toh error dikhao
    responseDiv.innerText = 'ERROR: No Product ID found in URL.';
    responseDiv.style.color = 'red';
    return; // Code ko wahi rok do
  }

  // --- 3. (NAYA) Purana Data Fetch karo aur Form me bharo ---
  fetch(`/api/products/${productId}`)
    .then(res => {
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    })
    .then(product => {
      // Form ke fields me data bharo
      document.getElementById('name').value = product.name;
      document.getElementById('brand').value = product.brand;
      document.getElementById('description').value = product.description || '';
      mrpInput.value = product.mrp;
      salePriceInput.value = product.salePrice;
      discountInput.value = (((product.mrp - product.salePrice) / product.mrp) * 100).toFixed(2); // Discount calculate karo
      document.getElementById('moq').value = product.moq;
      document.getElementById('category').value = product.category;
      document.getElementById('material').value = product.material || '';
      
      // Images bharo
      if (product.images && product.images.length > 0) {
        document.getElementById('image1').value = product.images[0] || '';
        document.getElementById('image2').value = product.images[1] || '';
      }
      
      // Tags (Checkboxes) set karo
      if (product.tags) {
        if (product.tags.includes('New Arrival')) document.getElementById('tag-new-arrival').checked = true;
        if (product.tags.includes('Top Best')) document.getElementById('tag-top-best').checked = true;
        if (product.tags.includes('Featured')) document.getElementById('tag-featured').checked = true;
      }
    })
    .catch(err => {
      responseDiv.innerText = `Error loading product: ${err.message}`;
      responseDiv.style.color = 'red';
    });


  // --- 4. (UPDATE) Form Submit Logic ko 'PUT' me badlo ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); 
      responseDiv.innerText = 'Updating...';
      responseDiv.style.color = 'blue';

      // 1. Saare Tags jama karo
      const tags = [];
      if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
      if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
      if (document.getElementById('tag-featured').checked) tags.push('Featured');
      
      // 2. Saari Images jama karo
      const images = [];
      const img1 = document.getElementById('image1').value;
      const img2 = document.getElementById('image2').value;
      if (img1) images.push(img1);
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

      // 4. Server ke 'PUT' API ko data bhejo
      fetch(`/api/products/${productId}`, { // ID URL me bhejo
        method: 'PUT', // Method ko 'PUT' karo
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData) // Naya data body me bhejo
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
        responseDiv.innerText = 'Server Error. Check terminal.';
        responseDiv.style.color = 'red';
      });
    });
  }
});