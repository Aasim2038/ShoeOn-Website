/* =========================================
   ADMIN ADD PRODUCT.JS (FINAL FIX: Calculator + Cascading Category)
   ========================================= */

// --- 0. CATEGORY DATA STRUCTURE (Zaroori hai) ---
const CATEGORY_DATA = {
    "men": ["Casual", "Sports", "PU-Chappal", "Sandals" , "Loose-products"],
    "women": ["Bellies", "PU-Chappal", "PU-Sandals", "Loose-products"],
    "boys": ["Sports-shoes", "PU-Chappal", "Sandals" , "School-Shoes" , "Loose-products"],
    "girls": ["Bellies", "PU-Chappal", "PU-Sandals", "School-Shoes" , "Loose-products"]
};
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  
    // --- 1. Discount Logic ---
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
    // --- End Discount Logic ---

    
    // --- 2. Category Dropdown Elements & Logic ---
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const finalCategoryInput = document.getElementById('category'); // Hidden field
    
    // Function: Sub-category dropdown ko bharna
    function updateSubCategories(mainKey) {
        subCategorySelect.innerHTML = '<option value="">-- Select Sub Category --</option>'; 
        subCategorySelect.disabled = true;
        
        const subcategories = CATEGORY_DATA[mainKey];

        if (subcategories) {
            subcategories.forEach(sub => {
                const subKey = mainKey + '-' + sub.toLowerCase(); 
                const option = document.createElement('option');
                option.value = subKey;
                option.innerText = sub;
                subCategorySelect.appendChild(option);
            });
            subCategorySelect.disabled = false;
        }
    }
    
    // Event Listener: Jab Main Category badle
    if (mainCategorySelect) {
        mainCategorySelect.addEventListener('change', () => {
            const mainKey = mainCategorySelect.value;
            updateSubCategories(mainKey);
            finalCategoryInput.value = ''; // Final value clear karo
        });
    }

    // Event Listener: Jab Sub Category badle, toh Final Hidden field bharo
    if (subCategorySelect) {
        subCategorySelect.addEventListener('change', () => {
            finalCategoryInput.value = subCategorySelect.value;
        });
    }
    // --- End Category Logic ---

    
    // --- 3. Form Submit Logic (File Upload) ---
    const form = document.getElementById('add-product-form');
    const responseDiv = document.getElementById('form-response');
    const imagesFileInput = document.getElementById('images'); 
    const isLooseCheckbox = document.getElementById('isLoose'); 

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Final Category check
            if (!finalCategoryInput.value) {
                responseDiv.innerText = 'Error: Please select both Main Category and Sub-Category.';
                responseDiv.style.color = 'red';
                return;
            }
            
            responseDiv.innerText = 'Uploading images and saving...';
            
            const formData = new FormData();
            
            // Data appending 
            formData.append('name', document.getElementById('name').value);
            formData.append('brand', document.getElementById('brand').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('mrp', parseFloat(mrpInput.value));
            formData.append('salePrice', parseFloat(salePriceInput.value));
            formData.append('moq', parseInt(document.getElementById('moq').value));
            formData.append('category', finalCategoryInput.value); 
            formData.append('material', document.getElementById('material').value);
            
            if (isLooseCheckbox) formData.append('isLoose', isLooseCheckbox.checked); // isLoose flag
            
            const tags = [];
            if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
            if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
            if (document.getElementById('tag-featured').checked) tags.push('Featured');
            formData.append('tags', tags.join(','));

            // Files ko FormData me daalo
            for (let i = 0; i < imagesFileInput.files.length; i++) {
                formData.append('images', imagesFileInput.files[i]);
            }
            
            // Server ke API ko FormData bhejo
            fetch('/api/products', {
                method: 'POST',
                body: formData 
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    responseDiv.innerText = `Error: ${data.error}`;
                    responseDiv.style.color = 'red';
                } else {
                    responseDiv.innerText = 'Product Saved Successfully!';
                    responseDiv.style.color = 'green';
                    form.reset();
                }
            })
            .catch(err => {
                responseDiv.innerText = 'Server Error. Check terminal.';
                console.error(err);
                responseDiv.style.color = 'red';
            });
        });
    }
});