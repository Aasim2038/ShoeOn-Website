/* =========================================
   ADMIN ADD PRODUCT JS (FULL CODE - NO CUTS)
   ========================================= */

// --- 0. CATEGORY & SIZE DATA ---
const CATEGORY_DATA = {
    "men": ["Casual", "PU-Chappal", "Sandals", "Sports-Shoes", "Crocks", "Safty Shoe", "Loose-products"],
    "women": ["Bellies", "PU-Chappal", "PU-Sandals", "Crocks", "Safty Shoe", "Loose-products"],
    "boys": ["Sports-Shoes", "PU-Chappal", "Sandals", "School-Shoes", "Crocks", "Loose-Products"],
    "girls": ["Bellies", "PU-Chappal", "PU-Sandals", "School-Bellies", "Crocks", "Loose-Products"],
    "Loose": ["Womens", "Men", "Boys", "Gilrs", "Kids"],
    "party": ["Womens", "Gilrs"],
};

const SOLE_OPTIONS = ['PU', 'Eva', 'PVC', 'Airmax', 'TPR', 'Phylon', 'Double Density'];
const ORIGIN_OPTIONS = ['Made in India', 'Made in China'];
const SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', "17", "18", "19"];

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Variables & Elements ---
    
    const form = document.getElementById('add-product-form');
    const responseDiv = document.getElementById('form-response');
    
    // Inputs
    const mrpInput = document.getElementById('mrp');
    const salePriceInput = document.getElementById('salePrice');
    const comparePriceInput = document.getElementById('comparePrice');
    const offlinePriceInput = document.getElementById('offlinePrice');
    const stockInput = document.getElementById('stock');
    
    const imagesFileInput = document.getElementById('images');
    const isLooseCheckbox = document.getElementById('isLoose');
    
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const finalCategoryInput = document.getElementById('category');
    
    const sizeCheckboxesContainer = document.getElementById('size-checkboxes-container');

    // Helper Functions
    function renderSelectOptions(elementId, optionsArray, selectedValue = null) {
        const selectEl = document.getElementById(elementId);
        if (!selectEl) return;
        let html = '<option value="">-- Select --</option>';
        optionsArray.forEach(opt => {
            html += `<option value="${opt}">${opt}</option>`;
        });
        selectEl.innerHTML = html;
    }

    function renderSizeCheckboxes() {
        if (!sizeCheckboxesContainer) return;
        sizeCheckboxesContainer.innerHTML = '';
        SIZE_OPTIONS.forEach(size => {
            sizeCheckboxesContainer.innerHTML += `<label><input type="checkbox" name="sizes" value="${size}"><span>${size}</span></label>`;
        });
    }

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

    // Event Listeners
    if (mainCategorySelect) {
        mainCategorySelect.addEventListener('change', () => {
            updateSubCategories(mainCategorySelect.value);
            finalCategoryInput.value = '';
        });
    }
    if (subCategorySelect) {
        subCategorySelect.addEventListener('change', () => {
            finalCategoryInput.value = subCategorySelect.value;
        });
    }

    // Initialize
    renderSizeCheckboxes();
    renderSelectOptions('sole', SOLE_OPTIONS);
    renderSelectOptions('origin', ORIGIN_OPTIONS, 'Made in India');

    // --- 2. FORM SUBMIT LOGIC ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            responseDiv.innerText = 'Uploading... Please wait.';
            responseDiv.style.color = 'blue';

            const formData = new FormData();

            // Basic Fields
            formData.append('name', document.getElementById('name').value);
            formData.append('brand', document.getElementById('brand').value);
            formData.append('description', document.getElementById('description').value);
            
            // Numbers
            formData.append('mrp', parseFloat(mrpInput.value));
            formData.append('salePrice', parseFloat(salePriceInput.value));
            formData.append('offlinePrice', parseFloat(offlinePriceInput ? offlinePriceInput.value : 0));
            formData.append('comparePrice', comparePriceInput.value);
            formData.append('moq', parseInt(document.getElementById('moq').value));
            
            // --- STOCK LOGIC (Bilkul Sahi Hai) ---
            const stockVal = stockInput ? stockInput.value : 0;
            formData.append('stock', parseInt(stockVal));
            // -------------------------------------

            formData.append('category', finalCategoryInput.value);
            formData.append('material', document.getElementById('material').value);
            formData.append('isLoose', isLooseCheckbox.checked);

            // Tech Specs
            formData.append('sole', document.getElementById('sole').value);
            formData.append('origin', document.getElementById('origin').value);

            // Sizes
            const selectedSizes = [];
            document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
                selectedSizes.push(checkbox.value);
            });
            formData.append('sizes', selectedSizes.join(','));

            // Tags
            const tags = [];
            if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');
            if (document.getElementById('tag-top-best').checked) tags.push('Top Best');
            if (document.getElementById('tag-featured').checked) tags.push('Featured');
            formData.append('tags', tags.join(','));

            // Images
            for (let i = 0; i < imagesFileInput.files.length; i++) {
                formData.append('images', imagesFileInput.files[i]);
            }

            // API Call
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
                    responseDiv.innerText = 'Success! Product Added.';
                    responseDiv.style.color = 'green';
                    form.reset();
                    // Reset Checkboxes
                    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
                }
            })
            .catch(err => {
                console.error(err);
                responseDiv.innerText = 'Server Error.';
                responseDiv.style.color = 'red';
            });
        });
    }
});