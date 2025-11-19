/* =========================================
   ADMIN-EDIT-PRODUCT.JS (Full File Upload Logic)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Discount Logic (Same) ---
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
  

  // --- 2. Data Elements ---
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  const form = document.getElementById('add-product-form');
  const responseDiv = document.getElementById('form-response');
  const existingImagesHidden = document.getElementById('existingImagesHidden'); // Hidden field
  const imagesPreview = document.getElementById('image-preview'); // Preview div
  const imagesFileInput = document.getElementById('images'); // File input

  if (!productId) {
    responseDiv.innerText = 'ERROR: No Product ID found.';
    responseDiv.style.color = 'red';
    return;
  }

  // --- 3. Purana Data Fetch karo aur Form me bharo ---
  fetch(`/api/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      // 1. Text fields bharo
      document.getElementById('name').value = product.name;
      document.getElementById('brand').value = product.brand;
      document.getElementById('description').value = product.description || '';
      mrpInput.value = product.mrp;
      salePriceInput.value = product.salePrice;
      discountInput.value = (((product.mrp - product.salePrice) / product.mrp) * 100).toFixed(2);
      document.getElementById('moq').value = product.moq;
      document.getElementById('category').value = product.category;
      document.getElementById('material').value = product.material || '';
      
      // 2. Tags set karo
      if (product.tags) {
        if (product.tags.includes('New Arrival')) document.getElementById('tag-new-arrival').checked = true;
        if (product.tags.includes('Top Best')) document.getElementById('tag-top-best').checked = true;
        if (product.tags.includes('Featured')) document.getElementById('tag-featured').checked = true;
      }
      
      // 3. Images ko Preview aur Hidden Field me bharo
      if (product.images && product.images.length > 0) {
        existingImagesHidden.value = product.images.join(','); // Purane URLs ko hidden field me save kiya
        
        imagesPreview.innerHTML = product.images.map(url => `
          <div style="position:relative;">
            <img src="${url}" style="width:100px; height:60px; object-fit:cover; border-radius:4px;">
            <span style="position:absolute; top:-8px; right:-8px; background:red; color:white; border-radius:50%; width:15px; height:15px; font-size:10px; text-align:center; cursor:pointer;" data-url="${url}">x</span>
          </div>
        `).join('');
      } else {
        imagesPreview.innerHTML = '<p style="color:#999;">No current images.</p>';
      }
    })
    .catch(err => {
      responseDiv.innerText = `Error loading product.`;
      responseDiv.style.color = 'red';
    });


  // --- 4. Form Submit Logic (PUT - File Upload) ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); 
      responseDiv.innerText = 'Updating...';
      
      // 1. FormData object banao
      const formData = new FormData();
      
      // 2. Saara text data aur tags FormData me daalo
      formData.append('name', document.getElementById('name').value);
      formData.append('brand', document.getElementById('brand').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('mrp', parseFloat(mrpInput.value));
      formData.append('salePrice', parseFloat(salePriceInput.value));
      formData.append('moq', parseInt(document.getElementById('moq').value));
      formData.append('category', document.getElementById('category').value);
      formData.append('material', document.getElementById('material').value);

      const tags = [];
      if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
      if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
      if (document.getElementById('tag-featured').checked) tags.push('Featured');
      formData.append('tags', tags.join(','));
      
      // 3. Files ko FormData me daalo (images array)
      for (let i = 0; i < imagesFileInput.files.length; i++) {
        formData.append('images', imagesFileInput.files[i]);
      }
      
      // 4. Purani URLs ko bhi FormData me daalo (Server ko batane ke liye)
      // Server ise "existingImages" field me check karega
      formData.append('existingImages', existingImagesHidden.value);


      // 5. Server ke 'PUT' API ko data bhejo
      fetch(`/api/products/${productId}`, {
        method: 'PUT', // Method 'PUT'
        // Content-Type NAHI lagate jab FormData bhejte hain
        body: formData 
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
        console.error(err);
        responseDiv.style.color = 'red';
      });
    });
  }
});