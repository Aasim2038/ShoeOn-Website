/* =========================================
   ADMIN-EDIT-PRODUCT.JS (CRASH-PROOF & FIXED)
   ========================================= */

// --- 0. CONSTANTS (Global Scope) ---
const CATEGORY_DATA = {
    "men": ["Casual", "PU-Chappal", "Sandals", "Sports-Shoes", "Crocks", "Safty Shoe", "Loose-products"],
    "women": ["Bellies", "PU-Chappal", "PU-Sandals", "Crocks", "Safty Shoe", "Loose-products"],
    "boys": ["Sports-Shoes", "PU-Chappal", "Sandals", "School-Shoes", "Crocks", "Loose-Products"],
    "girls": ["Bellies", "PU-Chappal", "PU-Sandals", "School-Bellies", "Crocks", "Loose-Products"],
    "Loose": ["Womens", "Men", "Boys", "Girls", "Kids"], 
    "party": ["Womens", "Girls"],
};

const SOLE_OPTIONS = ['PU', 'Eva', 'PVC', 'Airmax', 'TPR','Phylon', 'Double Density'];
const ORIGIN_OPTIONS = ['Made in India', 'Made in China'];
const SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ,'11' , '12' , '13' , '14' , '15' , '16' , "17" ,"18" , "19"];

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENTS ---
    const form = document.getElementById('add-product-form');
    const responseDiv = document.getElementById('form-response');
    
    // Form Inputs
    const nameInput = document.getElementById('name');
    const brandInput = document.getElementById('brand');
    const descInput = document.getElementById('description');
    const mrpInput = document.getElementById('mrp');
    const discountInput = document.getElementById('discount');
    const salePriceInput = document.getElementById('salePrice');
    const comparePriceInput = document.getElementById('comparePrice');
    const offlinePriceInput = document.getElementById('offlinePrice');
    const moqInput = document.getElementById('moq');
    const stockInput = document.getElementById('stock');
    
    // Category Elements
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const finalCategoryInput = document.getElementById('category'); 
    
    // Tech Specs
    const materialInput = document.getElementById('material');
    const soleSelect = document.getElementById('sole');
    const originSelect = document.getElementById('origin');
    
    // Sizes & Images
    const sizeCheckboxesContainer = document.getElementById('size-checkboxes-container'); 
    const existingImagesHidden = document.getElementById('existingImagesHidden'); 
    const imagesPreview = document.getElementById('image-preview'); 
    const imagesFileInput = document.getElementById('images');

    // Tags
    const tagNewArrival = document.getElementById('tag-new-arrival');
    const tagTopBest = document.getElementById('tag-top-best');
    const tagFeatured = document.getElementById('tag-featured');

    // URL Params
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // --- 2. HELPER FUNCTIONS ---

    // Function: Render Dropdown Options
    function renderSelectOptions(selectElement, optionsArray, selectedValue = null) {
        if (!selectElement) return; // Safety check
        
        let html = '<option value="">-- Select --</option>';
        optionsArray.forEach(optionText => {
            // Check strictly or loosely for selection
            const isSelected = (selectedValue && (selectedValue === optionText || selectedValue.toLowerCase() === optionText.toLowerCase())) ? 'selected' : '';
            html += `<option value="${optionText}" ${isSelected}>${optionText}</option>`;
        });
        selectElement.innerHTML = html;
    }

    // Function: Render Size Checkboxes
    function renderSizeCheckboxes(selectedSizes = []) {
        if (!sizeCheckboxesContainer) {
            console.error("Size container not found in HTML");
            return;
        }

        // DB se sizes kabhi array aate hain kabhi string, dono handle karo
        let sizesArray = [];
        if (Array.isArray(selectedSizes)) {
            sizesArray = selectedSizes;
        } else if (typeof selectedSizes === 'string') {
            sizesArray = selectedSizes.split(',').map(s => s.trim());
        }
        
        sizeCheckboxesContainer.innerHTML = ''; // Clear old checkboxes
        
        SIZE_OPTIONS.forEach(size => {
            // Check if this size is in the product's size list
            const isChecked = sizesArray.includes(String(size)) ? 'checked' : ''; 
            
            sizeCheckboxesContainer.innerHTML += `
                <label style="margin-right: 10px; display: inline-block;">
                    <input type="checkbox" name="sizes" value="${size}" ${isChecked}>
                    <span>${size}</span>
                </label>
            `;
        });
    }

    // Function: Discount Logic
    function calculateSalePrice() { 
        if(!mrpInput || !discountInput || !salePriceInput) return;
        const mrp = parseFloat(mrpInput.value);
        const discount = parseFloat(discountInput.value);
        if (!isNaN(mrp) && !isNaN(discount)) {
            const salePrice = mrp - (mrp * (discount / 100));
            salePriceInput.value = salePrice.toFixed(2);
        }
    }
    
    function calculateDiscount() {
        if(!mrpInput || !discountInput || !salePriceInput) return;
        const mrp = parseFloat(mrpInput.value);
        const salePrice = parseFloat(salePriceInput.value);
        if (!isNaN(mrp) && !isNaN(salePrice) && mrp > 0) {
            const discount = ((mrp - salePrice) / mrp) * 100;
            discountInput.value = discount.toFixed(2);
        }
    }

    // Attach Listeners safely
    if(mrpInput) mrpInput.addEventListener('input', calculateSalePrice);
    if(discountInput) discountInput.addEventListener('input', calculateSalePrice);
    if(salePriceInput) salePriceInput.addEventListener('input', calculateDiscount);


    // --- 3. CATEGORY LOGIC ---
    function updateSubCategories(mainKey, selectedSubKey = null) {
        if(!subCategorySelect) return;
        
        subCategorySelect.innerHTML = '<option value="">-- Select Sub Category --</option>'; 
        subCategorySelect.disabled = true;
        
        const subcategories = CATEGORY_DATA[mainKey];

        if (subcategories) {
            subcategories.forEach(sub => {
                const subKey = mainKey + '-' + sub.toLowerCase(); 
                const option = document.createElement('option');
                option.value = subKey;
                option.innerText = sub;
                
                // Compare values safely
                if (selectedSubKey && (selectedSubKey === subKey || selectedSubKey === sub)) {
                    option.selected = true;
                }
                subCategorySelect.appendChild(option);
            });
            subCategorySelect.disabled = false;
        }
    }
    
    if (mainCategorySelect) {
        mainCategorySelect.addEventListener('change', () => {
            const mainKey = mainCategorySelect.value;
            updateSubCategories(mainKey);
            if(finalCategoryInput) finalCategoryInput.value = '';
        });
    }

    if (subCategorySelect) {
        subCategorySelect.addEventListener('change', () => {
            if(finalCategoryInput) finalCategoryInput.value = subCategorySelect.value;
        });
    }

    // --- 4. IMAGE REMOVAL LOGIC ---
    if(imagesPreview && existingImagesHidden) {
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
    }


    // --- 5. FETCH AND POPULATE FORM ---
    if (!productId) {
        responseDiv.innerText = 'ERROR: No Product ID found in URL.';
        responseDiv.style.color = 'red';
        return;
    }


    fetch(`/api/products/${productId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return res.json();
        })
        .then(product => {

            // --- SAFELY POPULATE FIELDS ---
            if(nameInput) nameInput.value = product.name || '';
            if(brandInput) brandInput.value = product.brand || '';
            if(descInput) descInput.value = product.description || '';
            if(comparePriceInput) comparePriceInput.value = product.comparePrice || '';
            if(mrpInput) mrpInput.value = product.mrp || 0;
            if(salePriceInput) salePriceInput.value = product.salePrice || 0;
            if(offlinePriceInput) offlinePriceInput.value = product.offlinePrice || 0;
            
            // Calculate discount if missing
            if(discountInput) {
                if(product.mrp && product.salePrice) {
                    discountInput.value = (((product.mrp - product.salePrice) / product.mrp) * 100).toFixed(2);
                } else {
                    discountInput.value = 0;
                }
            }
            
            if(moqInput) moqInput.value = product.moq || 1;
            if(materialInput) materialInput.value = product.material || '';
            if(stockInput) stockInput.value = product.stock || 0;

            // --- POPULATE DROPDOWNS & CHECKBOXES ---
            renderSelectOptions(soleSelect, SOLE_OPTIONS, product.sole);
            renderSelectOptions(originSelect, ORIGIN_OPTIONS, product.origin);
            renderSizeCheckboxes(product.sizes || []);

            // --- POPULATE CATEGORY ---
            if (product.category && product.category.includes('-')) {
                const parts = product.category.split('-'); 
                const mainKey = parts[0]; 
                
                if(mainCategorySelect) mainCategorySelect.value = mainKey;
                updateSubCategories(mainKey, product.category); 
                if(finalCategoryInput) finalCategoryInput.value = product.category;
            } else {
                 if(finalCategoryInput) finalCategoryInput.value = product.category || '';
            }

            // --- POPULATE TAGS ---
            if (product.tags) {
                if (tagNewArrival && product.tags.includes('New Arrival')) tagNewArrival.checked = true;
                if (tagTopBest && product.tags.includes('Top Best')) tagTopBest.checked = true;
                if (tagFeatured && product.tags.includes('Featured')) tagFeatured.checked = true;
            }

            // --- POPULATE IMAGES ---
            if (product.images && product.images.length > 0) {
                if(existingImagesHidden) existingImagesHidden.value = product.images.join(','); 
                
                const timestamp = new Date().getTime(); 
                if(imagesPreview) {
                    imagesPreview.innerHTML = product.images.map(url => `
                        <div style="position:relative; display:inline-block; margin:5px;">
                            <img src="${url}?t=${timestamp}" style="width:100px; height:80px; object-fit:cover; border-radius:4px; border:1px solid #ddd;">
                            <span style="position:absolute; top:-8px; right:-8px; background:red; color:white; border-radius:50%; width:20px; height:20px; line-height:18px; text-align:center; cursor:pointer; font-weight:bold;" data-url="${url}">x</span>
                        </div>
                    `).join('');
                }
            } else {
                if(imagesPreview) imagesPreview.innerHTML = '<p style="color:#999;">No current images.</p>';
            }

        })
        .catch(err => {
            console.error('Fetch Error:', err);
            // Ab hum error console me dikhayenge, user ko sirf alert denge taaki form na tute
            responseDiv.innerHTML = `<strong>Error loading product data.</strong><br><small>${err.message}</small>`;
            responseDiv.style.color = 'red';
        });


    // --- 6. UPDATE (SUBMIT) LOGIC ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            responseDiv.innerText = 'Updating...';

            const selectedSizes = [];
            document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
                selectedSizes.push(checkbox.value);
            });
            
            // Validation
            if (selectedSizes.length === 0) {
                responseDiv.innerText = 'Error: Please select at least one size.';
                responseDiv.style.color = 'red';
                return;
            }
            if (finalCategoryInput && !finalCategoryInput.value) {
                responseDiv.innerText = 'Error: Category is missing.';
                responseDiv.style.color = 'red';
                return;
            }

            const formData = new FormData();
            
            // Append safely
            if(nameInput) formData.append('name', nameInput.value);
            if(brandInput) formData.append('brand', brandInput.value);
            if(descInput) formData.append('description', descInput.value);
            if(mrpInput) formData.append('mrp', parseFloat(mrpInput.value));
            if(comparePriceInput) formData.append('comparePrice', parseFloat(comparePriceInput.value));
            if(salePriceInput) formData.append('salePrice', parseFloat(salePriceInput.value));
            if(offlinePriceInput) formData.append('offlinePrice', parseFloat(offlinePriceInput.value));
            if(moqInput) formData.append('moq', parseInt(moqInput.value));
            if(finalCategoryInput) formData.append('category', finalCategoryInput.value); 
            if(materialInput) formData.append('material', materialInput.value);
            if(soleSelect) formData.append('sole', soleSelect.value);
            if(originSelect) formData.append('origin', originSelect.value); 
            if(stockInput) formData.append('stock', parseInt(stockInput.value));
            
            formData.append('sizes', selectedSizes.join(','));

            const tags = [];
            if (tagNewArrival && tagNewArrival.checked) tags.push('New Arrival');
            if (tagTopBest && tagTopBest.checked) tags.push('Top Best');
            if (tagFeatured && tagFeatured.checked) tags.push('Featured');
            formData.append('tags', tags.join(','));
            
            // Images
            if(imagesFileInput) {
                for (let i = 0; i < imagesFileInput.files.length; i++) {
                    formData.append('images', imagesFileInput.files[i]);
                }
            }
            if(existingImagesHidden) formData.append('existingImages', existingImagesHidden.value);

            // PUT Request
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
                    setTimeout(() => window.location.reload(), 1500);
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