/* =========================================
   ADMIN-PRODUCTS.JS (FINAL COMPLETE CODE)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('product-list-body');
    const searchInput = document.getElementById('productSearchInput'); 

    // --- FUNCTION 1: Products laana (FETCH & SEARCH) ---
    async function fetchProducts(searchTerm = "") { 
        if (!tableBody) return; 

        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading Products...</td></tr>';
        
        try {
            // URL banao (Search query ke sath)
            const url = searchTerm 
                ? `/api/products?search=${encodeURIComponent(searchTerm)}` 
                : '/api/products';
            
            const fetchOptions = { method: 'GET', cache: 'no-store' };

            const response = await fetch(url, fetchOptions); 
            
            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }

            const products = await response.json();
            
            tableBody.innerHTML = ''; // Table khaali karo
            
            // Agar products nahi mile
            if (!Array.isArray(products) || products.length === 0) {
                if (searchTerm) {
                     tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No search results found.</td></tr>';
                } else {
                     tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products available.</td></tr>';
                }
                return;
            }

            // Table Rows Generate karo
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
            
            // Row banne ke baad hi buttons par logic lagayenge
            addDeleteListeners(); 
            addEditListeners();   
            
        } catch (err) {
            console.error('Error fetching products:', err);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading products. Check console.</td></tr>';
        }
    }

    // --- FUNCTION 2: DELETE LOGIC (FULL CODE ADDED) ---
    function addDeleteListeners() {
        const deleteBtns = document.querySelectorAll('.btn-delete');
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Button ke andar icon bhi ho sakta hai, isliye closest button dhundo
                const targetBtn = e.target.closest('.btn-delete');
                const productId = targetBtn.getAttribute('data-id');

                // Confirmation mango
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        const res = await fetch(`/api/products/${productId}`, {
                            method: 'DELETE'
                        });

                        if (res.ok) {
                            alert('Product Deleted Successfully!');
                            fetchProducts(); // Table refresh karo
                        } else {
                            alert('Failed to delete product');
                        }
                    } catch (error) {
                        console.error('Delete Error:', error);
                        alert('Error deleting product');
                    }
                }
            });
        });
    }

    // --- FUNCTION 3: EDIT LOGIC (FULL CODE ADDED) ---
    function addEditListeners() {
        const editBtns = document.querySelectorAll('.btn-edit');

        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.target.closest('.btn-edit');
                const productId = targetBtn.getAttribute('data-id');

                // User ko Edit page par bhejo (ID ke sath)
                // Note: Make sure tumhare page ka naam 'add-product.html' hi ho
                window.location.href = `admin-edit-product.html?id=${productId}`;
            });
        });
    }
  
    // --- FUNCTION 4: SEARCH BAR EVENT LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            // Debounce: User ke rukne ke 500ms baad search karega
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                fetchProducts(searchTerm); 
            }, 500); 
        });
    }

    // Page load hote hi products load karo
    fetchProducts(); 

});