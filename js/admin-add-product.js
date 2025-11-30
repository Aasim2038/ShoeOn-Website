/* =========================================
   ADMIN ADD PRODUCT.JS (FINAL CODE - All Features)
   ========================================= */

// --- 0. CATEGORY & SIZE DATA STRUCTURE ---
const CATEGORY_DATA = {
    "men": ["Casual", "Sports", "Formal", "Boots"],
    "women": ["bellies", "PU-chappal", "PU-sandals", "Loose-products"],
    "boys": ["Casual", "Sports", "Sandals"],
    "girls": ["Party", "Casual", "School"],
    "Loose": ["Womens", "Men", "Boys", "Gilrs", "Kids"],
};

const SOLE_OPTIONS = ['PU', 'Eva', 'PVC', 'Airmax', 'TPR','Phylon', 'Double Density'];
const ORIGIN_OPTIONS = ['Made in India', 'Made in China'];

const SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ,'11' , '12' , '13' , '14' , '15' , '16' , "17" ,"18" , "19"];
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  
    // --- 1. Variables & Elements (Updated for 3-Price Model) ---
    const mrpInput = document.getElementById('mrp');
    const salePriceInput = document.getElementById('salePrice');
    const comparePriceInput = document.getElementById('comparePrice'); // <--- NAYA INPUT
    const discountInput = document.getElementById('discount'); // <--- OUTPUT FIELD
    
    // ... (rest of form variables) ...
    const form = document.getElementById('add-product-form');
    const responseDiv = document.getElementById('form-response');
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
    
    // Technical Specs Elements
    const soleInput = document.getElementById('sole');
    const closureInput = document.getElementById('closure');
    const originInput = document.getElementById('origin');
    
    // Size Elements
    const sizeCheckboxesContainer = document.getElementById('size-checkboxes-container');


    // --- Discount Logic Functions (FINAL CLEANUP) ---
    
    // YEH FUNCTION 'calculateSalePrice' KO REPLACE KAREGA
    // Ab hum sirf Discount calculate karenge
    function calculateDiscount() {
        const mrp = parseFloat(mrpInput.value);
        const salePrice = parseFloat(salePriceInput.value);
        
        // Validation: Hamesha check karo ki MRP > Sale Price ho
        if (!isNaN(mrp) && !isNaN(salePrice) && mrp > salePrice && mrp > 0) {
            // Discount hamesha MRP aur Final Sale Price ke beech me calculate hota hai
            const discount = ((mrp - salePrice) / mrp) * 100;
            discountInput.value = discount.toFixed(2);
        } else {
            // Agar Sale Price zyada hai, toh discount 0.00 set karo
            discountInput.value = '0.00';
        }
    }
    
    // --- Event Listeners (Corrected Flow) ---
    // Sirf Discount function ko call karo, calculateSalePrice ko nahi
    if(mrpInput) mrpInput.addEventListener('input', calculateDiscount); 
    if(salePriceInput) salePriceInput.addEventListener('input', calculateDiscount);
    // ------------------------------------------


    // --- 2. SIZE & CATEGORY LOGIC ---
    // Function: Size Checkboxes Render (Initial Load)
    function renderSizeCheckboxes(selectedSizes = []) {
        if (!sizeCheckboxesContainer) return;
        sizeCheckboxesContainer.innerHTML = '';
        SIZE_OPTIONS.forEach(size => {
            const isChecked = selectedSizes.includes(String(size)) ? 'checked' : ''; 
            sizeCheckboxesContainer.innerHTML += `<label><input type="checkbox" name="sizes" value="${size}" ${isChecked}><span>${size}</span></label>`;
        });
    }
    
    // Function: Sub-category dropdown ko bharna
    function updateSubCategories(mainKey) {
        subCategorySelect.innerHTML = '<option value="">-- Select Sub Category --</option>'; 
        subCategorySelect.disabled = true;
        const subcategories = CATEGORY_DATA[mainKey];
        if (subcategories) {
             subcategories.forEach(sub => {
                const subKey = mainKey + '-' + sub.toLowerCase(); 
                const option = document.createElement('option');
                let finalKey = subKey;
    if (sub.toLowerCase().includes('loose')) {
    }
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
            finalCategoryInput.value = ''; 
        });
    }
    if (subCategorySelect) {
        subCategorySelect.addEventListener('change', () => {
            finalCategoryInput.value = subCategorySelect.value;
        });
    }
    
    // --- INITIALIZE ---
    renderSizeCheckboxes(); 

    renderSelectOptions('sole', SOLE_OPTIONS);
    renderSelectOptions('origin', ORIGIN_OPTIONS, 'Made in India');

    // --- 3. Form Submit Logic (FINAL SUBMISSION) ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Validation check (Minimum requirements)
            if (!finalCategoryInput.value || !mrpInput.value || !document.getElementById('name').value) {
                responseDiv.innerText = 'Error: Please select both Main Category and Sub-Category.';
                responseDiv.style.color = 'red';
                return;
            }
            
            responseDiv.innerText = 'Uploading images and saving...';
            
            const formData = new FormData();
            
            // --- DATA APPENDING ---
            formData.append('name', document.getElementById('name').value);
            formData.append('brand', document.getElementById('brand').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('mrp', parseFloat(mrpInput.value));
            formData.append('salePrice', parseFloat(salePriceInput.value));
            formData.append('comparePrice', comparePriceInput.value);
            formData.append('moq', parseInt(document.getElementById('moq').value));
            
            // --- CATEGORY & MATERIAL ---
            formData.append('category', finalCategoryInput.value); 
            formData.append('material', document.getElementById('material').value);
            formData.append('isLoose', isLooseCheckbox.checked);

            // --- TECHNICAL SPECIFICATIONS (THE FIX) ---
            formData.append('sole', document.getElementById('sole').value);
            formData.append('origin', document.getElementById('origin').value);
            // --------------------------------------------
            
            // Sizes collection
            const selectedSizes = [];
            document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
                selectedSizes.push(checkbox.value);
            });
            if (selectedSizes.length === 0) {
                responseDiv.innerText = 'Error: Please select at least one size.';
                responseDiv.style.color = 'red';
                return;
            }
            formData.append('sizes', selectedSizes.join(',')); 

            // Tags collection
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