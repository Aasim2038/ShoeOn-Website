/* =========================================
   ADMIN-EDIT-PRODUCT.JS (FULL FINAL LOGIC - Button Fix)
   ========================================= */

// --- 0. CATEGORY DATA STRUCTURE (Bohot Zaroori) ---
const CATEGORY_DATA = {
    "men": ["Casual", "Sports", "PU-Chappal", "Sandals" , "Loose-products"],
    "women": ["Bellies", "PU-Chappal", "PU-Sandals", "Loose-products"],
    "boys": ["Sports", "PU-Chappal", "Sandals" , "School-Shoes" , "Loose-products"],
    "girls": ["Bellies", "PU-Chappal", "PU-Sandals", "School-Shoes" , "Loose-products"]
};
const SOLE_OPTIONS = ['PU', 'Eva', 'PVC', 'Airmax', 'TPR','Phylon', 'Double Density'];
const ORIGIN_OPTIONS = ['Made in India', 'Made in China'];

const SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ,'11' , '12' , '13' , '14' , '15' , '16' , "17" ,"18" , "19"];
// --------------------------------------------------------

// Helper: Dropdown ko array se bharna (Sole, Origin ke liye)
function renderSelectOptions(elementId, optionsArray, selectedValue = null) {
    const selectEl = document.getElementById(elementId);
    if (!selectEl) return;
    
    let html = '<option value="">-- Select --</option>';
    
    optionsArray.forEach(optionText => {
        const value = optionText.toLowerCase().replace(/\s/g, ''); // Value ko clean karke save karna
        const isSelected = (selectedValue === optionText || selectedValue === value) ? 'selected' : '';
        html += `<option value="${optionText}" ${isSelected}>${optionText}</option>`;
    });
    
    selectEl.innerHTML = html;
}

// Function: Update Product Details Form
function renderSizeCheckboxes(selectedSizes = []) {
    const sizeCheckboxesContainer = document.getElementById('size-checkboxes-container'); 
    if (!sizeCheckboxesContainer) return;

    // Agar selectedSizes string hai (jo DB se aayi hai), toh array banao
    const sizesArray = Array.isArray(selectedSizes) ? selectedSizes : selectedSizes.split(',').map(s => s.trim());
    
    sizeCheckboxesContainer.innerHTML = '';
    
    SIZE_OPTIONS.forEach(size => {
        const isChecked = sizesArray.includes(String(size)) ? 'checked' : ''; 
        
        sizeCheckboxesContainer.innerHTML += `
            <label>
                <input type="checkbox" name="sizes" value="${size}" ${isChecked}>
                <span>${size}</span>
            </label>
        `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  
    // --- 1. Discount Logic Variables ---
    const mrpInput = document.getElementById('mrp');
    const discountInput = document.getElementById('discount');
    const salePriceInput = document.getElementById('salePrice');
    // ... (rest of form elements) ...
    const form = document.getElementById('add-product-form');
    const responseDiv = document.getElementById('form-response');
    const existingImagesHidden = document.getElementById('existingImagesHidden'); 
    const imagesPreview = document.getElementById('image-preview'); 
    const imagesFileInput = document.getElementById('images'); 
    const isLooseCheckbox = document.getElementById('isLoose'); 
    
    // Helper: Dropdown ko array se bharna
function renderSelectOptions(elementId, optionsArray, selectedValue = null) {
    const selectEl = document.getElementById(elementId);
    if (!selectEl) return;
    
    // Default option
    let html = '<option value="">-- Select --</option>';
    
    optionsArray.forEach(optionText => {
        const value = optionText.toLowerCase().replace(/\s/g, ''); // Value ko clean karke save karna
        const isSelected = (selectedValue === optionText || selectedValue === value) ? 'selected' : '';
        html += `<option value="${optionText}" ${isSelected}>${optionText}</option>`;
    });
    
    selectEl.innerHTML = html;
}
    // Category Elements
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const finalCategoryInput = document.getElementById('category'); 
    const materialInput = document.getElementById('material');
    
    // Size Elements (CRITICAL NEW VARIABLE)
    const sizeCheckboxesContainer = document.getElementById('size-checkboxes-container'); 
    
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');


    // --- Discount Logic Functions (Same) ---
    // (omitted for brevity)
    
    // --- 2. SIZE CHECKBOXES RENDERING (NEW) ---
    function renderSizeCheckboxes(selectedSizes = []) {
        if (!sizeCheckboxesContainer) return;
        
        // Agar selectedSizes string hai (jo DB se aayi hai), toh array banao
        const sizesArray = Array.isArray(selectedSizes) ? selectedSizes : selectedSizes.split(',').map(s => s.trim());
        
        sizeCheckboxesContainer.innerHTML = '';
        
        SIZE_OPTIONS.forEach(size => {
            const isChecked = sizesArray.includes(String(size)) ? 'checked' : ''; 
            
            sizeCheckboxesContainer.innerHTML += `
                <label>
                    <input type="checkbox" name="sizes" value="${size}" ${isChecked}>
                    <span>${size}</span>
                </label>
            `;
        });
    }


    // --- Discount Logic Functions ---
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

    
    // --- 4. Category Dropdown Logic ---
    function updateSubCategories(mainKey, selectedSubKey = null) {
        subCategorySelect.innerHTML = '<option value="">-- Select Sub Category --</option>'; 
        subCategorySelect.disabled = true;
        
        const subcategories = CATEGORY_DATA[mainKey];

        if (subcategories) {
            subcategories.forEach(sub => {
                const subKey = mainKey + '-' + sub.toLowerCase(); 
                const option = document.createElement('option');
                option.value = subKey;
                option.innerText = sub;
                if (selectedSubKey === subKey) {
                    option.selected = true;
                }
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
            finalCategoryInput.value = '';
        });
    }

    // Event Listener: Jab Sub Category badle, toh Final Hidden field bharo
    if (subCategorySelect) {
        subCategorySelect.addEventListener('change', () => {
            finalCategoryInput.value = subCategorySelect.value;
        });
    }
    
    // Function to remove single image preview and URL from hidden field
    imagesPreview.addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN') {
            const urlToRemove = e.target.dataset.url;
            const currentUrls = existingImagesHidden.value.split(',').filter(url => url !== urlToRemove);
            existingImagesHidden.value = currentUrls.join(',');
            e.target.closest('div').remove(); 
            responseDiv.innerText = 'Image removed. Click Update to save changes.';
            responseDiv.style.color = 'orange';
        }
    });


    // --- 5. Purana Data Fetch karo aur Form me bharo (CRITICAL FIX) ---
    if (!productId) {
        responseDiv.innerText = 'ERROR: No Product ID found.';
        responseDiv.style.color = 'red';
        return;
    }
    
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
            document.getElementById('material').value = product.material || '';
            renderSizeCheckboxes(product.sizes || []);
            renderSelectOptions('sole', SOLE_OPTIONS, product.sole);
            renderSelectOptions('origin', ORIGIN_OPTIONS, product.origin);
            // --- CATEGORY FIELD FIX: Purani value ko do dropdowns me set karna ---
            if (product.category && product.category.includes('-')) {
                const [mainKey, subName] = product.category.split('-'); 
                mainCategorySelect.value = mainKey; 
                updateSubCategories(mainKey, product.category); // Subcategories bharega aur set karega
                finalCategoryInput.value = product.category;
            } else {
                 finalCategoryInput.value = product.category || '';
            }
            // --- END CATEGORY FIX ---

            
            // 2. Tags load (Same as before)
            if (product.tags) {
                if (product.tags.includes('New Arrival')) document.getElementById('tag-new-arrival').checked = true;
                if (product.tags.includes('Top Best')) document.getElementById('tag-top-best').checked = true;
                if (product.tags.includes('Featured')) document.getElementById('tag-featured').checked = true;
            }
            
            // 3. Images load (Same as before)
            if (product.images && product.images.length > 0) {
                existingImagesHidden.value = product.images.join(','); 
                
                // Image preview with cache buster
                const timestamp = new Date().getTime(); 
                imagesPreview.innerHTML = product.images.map(url => `
                    <div style="position:relative;">
                        <img src="${url}?t=${timestamp}" style="width:100px; height:60px; object-fit:cover; border-radius:4px;">
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


    // --- 6. Form Submit Logic (PUT - File Upload) ---
    if (form) {
        form.addEventListener('submit', (e) => {
            console.log('Update Product button clicked!'); 
            e.preventDefault(); 

            const selectedSizes = [];
            document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
                selectedSizes.push(checkbox.value);
            });
            
            if (selectedSizes.length === 0) {
                responseDiv.innerText = 'Error: Please select at least one size.';
                return;
            }
            
            
            // Final Category check
            if (!finalCategoryInput.value) {
                responseDiv.innerText = 'Error: Please select both Main Category and Sub-Category.';
                responseDiv.style.color = 'red';
                return;
            }
            
            responseDiv.innerText = 'Updating...';
            
            const formData = new FormData();
            
            // Data appending (Same as before)
            formData.append('name', document.getElementById('name').value);
            formData.append('brand', document.getElementById('brand').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('mrp', parseFloat(mrpInput.value));
            formData.append('salePrice', parseFloat(salePriceInput.value));
            formData.append('moq', parseInt(document.getElementById('moq').value));
            formData.append('category', finalCategoryInput.value); 
            formData.append('material', document.getElementById('material').value);
            formData.append('sole', document.getElementById('sole').value);
            formData.append('origin', document.getElementById('origin').value); 
            formData.append('sizes', selectedSizes.join(','));

            const tags = [];
            if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
            if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
            if (document.getElementById('tag-featured').checked) tags.push('Featured');
            formData.append('tags', tags.join(','));
            
            // Files, Existing URLs Append (Same as before)
            for (let i = 0; i < imagesFileInput.files.length; i++) {
                formData.append('images', imagesFileInput.files[i]);
            }
            formData.append('existingImages', existingImagesHidden.value);


            // Server ke 'PUT' API ko data bhejo
            fetch(`/api/products/${productId}`, {
                method: 'PUT',
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
                    window.location.reload(); 
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