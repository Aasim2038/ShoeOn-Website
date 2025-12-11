/* =========================================
   ADMIN-PRODUCTS.JS (FINAL CODE - SYNTAX & SEARCH FIXED)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('product-list-body');
    // Search Input field ko access karo (ID: productSearchInput)
    const searchInput = document.getElementById('productSearchInput'); 

    // --- FUNCTION 1: Products laana aur table bharna (FETCH & SEARCH) ---
    async function fetchProducts(searchTerm = "") { 
        if (!tableBody) return; 

        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading Products...</td></tr>';
        
        try { // <--- TRY BLOCK START
            // Search term ke saath URL banao
            const url = searchTerm 
                ? `/api/products?search=${encodeURIComponent(searchTerm)}` 
                : '/api/products';
            
            const fetchOptions = { method: 'GET', cache: 'no-store' };

            const response = await fetch(url, fetchOptions); 
            
            // Check for non-OK status (e.g., 404 or 500)
            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }

            const products = await response.json();
            
            tableBody.innerHTML = ''; // Table khaali karo
            
            if (!Array.isArray(products) || products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
                // Agar search ke baad koi product nahi milta
                if (searchTerm) {
                     tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Search results not found.</td></tr>';
                }
                return;
            }

            products.forEach(product => {
                const row = `
                    <tr>
                        <td>
                          <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.brand}</td>
                        <td>${product.category}</td>
                        <td>₹${product.salePrice}</td>
                        <td>${product.moq} Pairs</td>
                        <td>
                          <button class="btn-action btn-edit" data-id="${product._id}"><i class="fa-solid fa-pencil"></i> Edit</button>
                          <button class="btn-action btn-delete" data-id="${product._id}"><i class="fa-solid fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            
            addDeleteListeners(); 
            addEditListeners();   
            
        } catch (err) { // <--- CATCH BLOCK START (Ln 64 - Syntax Error Fix)
            console.error('Error fetching products:', err);
            // Display error to the user
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading products. Check console.</td></tr>';
        } // <--- CATCH BLOCK END
    }

    // --- FUNCTION 2: DELETE LOGIC (Waisa hi rahega) ---
    function addDeleteListeners() { /* ... (Logic) ... */ }

    // --- FUNCTION 3: EDIT LOGIC (Waisa hi rahega) ---
    function addEditListeners() { /* ... (Logic) ... */ }
  
    // --- FUNCTION 4: SEARCH BAR EVENT LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                fetchProducts(searchTerm); // Search term ke saath call karo
            }, 500); // 500 milliseconds ka delay
        });
    }

    // Page load hote hi products load karo
    fetchProducts(); 

});