/* =========================================
   ADMIN ADD PRODUCT.JS (File Upload Logic)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Discount Logic (Yeh same hai) ---
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
  

  // --- 2. Form Submit Logic (Yeh poora badal gaya hai) ---
  const form = document.getElementById('add-product-form');
  const responseDiv = document.getElementById('form-response');
  const imageInput = document.getElementById('images'); // Naya file input

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); 
      responseDiv.innerText = 'Uploading images and saving...';
      responseDiv.style.color = 'blue';

      // 1. Ab hum JSON nahi, FormData banayenge
      const formData = new FormData();
      
      // 2. Saara text data FormData me daalo
      formData.append('name', document.getElementById('name').value);
      formData.append('brand', document.getElementById('brand').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('mrp', parseFloat(mrpInput.value));
      formData.append('salePrice', parseFloat(salePriceInput.value));
      formData.append('moq', parseInt(document.getElementById('moq').value));
      formData.append('category', document.getElementById('category').value);
      formData.append('material', document.getElementById('material').value);

      // 3. Saare Tags ko comma (,) se jod kar daalo
      const tags = [];
      if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
      if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
      if (document.getElementById('tag-featured').checked) tags.push('Featured');
      formData.append('tags', tags.join(',')); // 'New Arrival,Top Best'

      // 4. Saari Files ko FormData me daalo
      for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
      }
      
      // 5. Server ke API ko FormData bhejo
      // (Note: Jab FormData bhejte hain, tab 'Content-Type' header NAHI lagate)
      fetch('/api/products', {
        method: 'POST',
        body: formData // JSON.stringify nahi, seedha formData
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