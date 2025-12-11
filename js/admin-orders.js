/* =========================================
   ADMIN-ORDERS.JS (WITH SEARCH FUNCTIONALITY)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('order-list-body');
    // Naya element: Search input field ko access karne ke liye
    const searchInput = document.getElementById('orderSearchInput'); 

    // --- FUNCTION 1: Orders laana aur table bharna (Modified for Search) ---
    // Function ka naam 'fetchOrders' rakha
    async function fetchOrders(searchTerm = "") { 
        if (!tableBody) return;
        
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading orders...</td></tr>';

        try {
            // CRITICAL FIX: Agar search term hai, toh usko URL mein query parameter bana kar bhejo
            const url = searchTerm 
                ? `/api/orders?search=${encodeURIComponent(searchTerm)}` 
                : '/api/orders';

            const response = await fetch(url, { cache: 'no-store' });
            const orders = await response.json();

            tableBody.innerHTML = ''; // Table khaali karo

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Koi order nahi mila.</td></tr>';
                return;
            }

            orders.forEach(order => {
            
            // --- NEW ORDER HIGHLIGHT LOGIC ---
            const orderStatus = (order.status || 'Pending').toLowerCase();
            const isNew = orderStatus === 'pending';
            const rowClass = isNew ? 'highlight-new-order' : '';
            // ----------------------------------

            const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            const row = `
                <tr class="${rowClass}">  <td><strong>#${order.orderNumber}</strong></td>
                    <td>${order.customerName}</td>
                    <td>${order.customerPhone}</td>
                    <td><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
                    <td>
                        <span class="status-badge status-${orderStatus}">
                            ${order.status}
                        </span>
                    </td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn-action btn-view" data-id="${order._id}"><i class="fa-solid fa-eye"></i> View</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row; 
        });
            
            addViewListeners(); // View buttons ko active karo
            
        } catch (err) {
            console.error('Error fetching orders:', err);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading orders.</td></tr>';
        }
    }

    // --- FUNCTION 2: VIEW BUTTONS KA LOGIC ---
    function addViewListeners() {
        // ... (Aapka pura addViewListeners function waisa hi rahega) ...
        const viewButtons = document.querySelectorAll('.btn-view');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.btn-view').dataset.id;
                window.location.href = `admin-order-detail.html?id=${id}`;
            });
        });
    }

    // --- FUNCTION 3: SEARCH BAR EVENT LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                console.log("Searching for:", searchTerm); // <--- DEBUG LOG: Check ki value aayi ya nahi
                fetchOrders(searchTerm);
            }, 500);
        });
    }

    // Page load hote hi orders load karo
    fetchOrders(); 

});/* =========================================
   ADMIN-ORDERS.JS (WITH SEARCH FUNCTIONALITY)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('order-list-body');
    // Naya element: Search input field ko access karne ke liye
    const searchInput = document.getElementById('orderSearchInput'); 

    // --- FUNCTION 1: Orders laana aur table bharna (Modified for Search) ---
    // Function ka naam 'fetchOrders' rakha
    async function fetchOrders(searchTerm = "") { 
        if (!tableBody) return;
        
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading orders...</td></tr>';

        try {
            // CRITICAL FIX: Agar search term hai, toh usko URL mein query parameter bana kar bhejo
            const url = searchTerm 
                ? `/api/orders?search=${encodeURIComponent(searchTerm)}` 
                : '/api/orders';

            const response = await fetch(url, { cache: 'no-store' });
            const orders = await response.json();

            tableBody.innerHTML = ''; // Table khaali karo

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No Order Found.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                const row = `
                    <tr>
                        <td><strong>#${order.orderNumber}</strong></td>
                        <td>${order.customerName}</td>
                        <td>${order.customerPhone}</td>
                        <td><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
                        <td>
                            <span class="status-badge status-${order.status.toLowerCase()}">
                                ${order.status}
                            </span>
                        </td>
                        <td>${orderDate}</td>
                        <td>
                            <button class="btn-action btn-view" data-id="${order._id}"><i class="fa-solid fa-eye"></i> View</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row; 
            });
            
            addViewListeners(); // View buttons ko active karo
            
        } catch (err) {
            console.error('Error fetching orders:', err);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading orders.</td></tr>';
        }
    }

    // --- FUNCTION 2: VIEW BUTTONS KA LOGIC ---
    function addViewListeners() {
        // ... (Aapka pura addViewListeners function waisa hi rahega) ...
        const viewButtons = document.querySelectorAll('.btn-view');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.btn-view').dataset.id;
                window.location.href = `admin-order-detail.html?id=${id}`;
            });
        });
    }

    // --- FUNCTION 3: SEARCH BAR EVENT LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                fetchOrders(searchTerm); // Search term ke saath call karo
            }, 500); // 500 milliseconds ka delay
        });
    }

    // Page load hote hi orders load karo
    fetchOrders(); 

});