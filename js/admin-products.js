/* =========================================
   ADMIN-PRODUCTS.JS (WITH PAGINATION)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('product-list-body');
    const searchInput = document.getElementById('productSearchInput'); 
    
    // Pagination Elements
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    let currentPage = 1;
    let totalPages = 1;

    // --- FUNCTION 1: Products laana (FETCH & SEARCH with Pagination) ---
    async function fetchProducts(searchTerm = "", page = 1) { 
        if (!tableBody) return; 

        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading Products...</td></tr>';
        
        try {
            // URL Banao: Ab hum hamesha 'page' aur 'limit' bhejenge
            let url = `/api/products?page=${page}&limit=20`;
            
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }
            
            const fetchOptions = { method: 'GET', cache: 'no-store' };
            const response = await fetch(url, fetchOptions); 
            
            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();
            
            // Server ab Object bhej raha hai { products: [], currentPage: 1, ... }
            // Lekin agar search kiya to shayad seedha Array aye (Customer side logic), 
            // isliye safety check lagayenge.
            
            let products = [];
            
            if (data.products) {
                // Pagination Wala Response
                products = data.products;
                currentPage = data.currentPage;
                totalPages = data.totalPages;
                
                // UI Update Karo (Page 1 of 5)
                if (pageInfo) pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
                
                // Buttons Enable/Disable
                if (prevBtn) prevBtn.disabled = currentPage <= 1;
                if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

            } else if (Array.isArray(data)) {
                // Bina Pagination Wala Response (Fallback)
                products = data;
            }

            tableBody.innerHTML = ''; // Table khaali karo
            
            if (products.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
                 if (pageInfo) pageInfo.innerText = "Page 1 of 1";
                 if (prevBtn) prevBtn.disabled = true;
                 if (nextBtn) nextBtn.disabled = true;
                 return;
            }

            // Table Rows Generate karo
            products.forEach(product => {
                const row = `
                    <tr>
                        <td>
                          <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.brand}</td>
                        <td>${product.category}</td>
                        <td>₹${product.salePrice}</td>
                        <td>${product.moq} Pairs</td>
                        <td>
                          <button class="btn-action btn-edit" data-id="${product._id}" style="margin-right: 5px; cursor: pointer;"><i class="fa-solid fa-pencil"></i></button>
                          <button class="btn-action btn-delete" data-id="${product._id}" style="color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            
            addDeleteListeners(); 
            addEditListeners();   
            
        } catch (err) {
            console.error('Error fetching products:', err);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading products.</td></tr>';
        }
    }

    // --- PAGINATION LISTENERS ---
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchProducts(searchInput.value.trim(), currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                fetchProducts(searchInput.value.trim(), currentPage + 1);
            }
        });
    }

    // --- SEARCH LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const term = searchInput.value.trim(); 
                currentPage = 1; // Search karte waqt wapis Page 1 par jao
                fetchProducts(term, 1); 
            }, 500); 
        });
    }

    // --- DELETE FUNCTION ---
    function addDeleteListeners() {
        const deleteBtns = document.querySelectorAll('.btn-delete');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const targetBtn = e.target.closest('.btn-delete');
                const productId = targetBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert('Product Deleted Successfully!');
                            fetchProducts("", currentPage); // Current page refresh karo
                        } else {
                            alert('Failed to delete product');
                        }
                    } catch (error) {
                        alert('Error deleting product');
                    }
                }
            });
        });
    }

    // --- EDIT FUNCTION ---
    function addEditListeners() {
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.target.closest('.btn-edit');
                const productId = targetBtn.getAttribute('data-id');
                window.location.href = `admin-edit-product.html?id=${productId}`;
            });
        });
    }

    // Initial Load
    fetchProducts(); 
});