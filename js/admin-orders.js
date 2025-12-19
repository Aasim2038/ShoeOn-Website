/* =========================================
   ADMIN ORDERS JS (FULL: SEARCH + FILTER + PAGINATION)
   ========================================= */

let allOrdersData = []; 
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
let currentFilter = "All"; // Filter track karne ke liye

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('orderSearchInput');

    // 1. Load Page 1 (All Orders)
    fetchOrders(1);
    
    // Counts alag se fetch kar lete hain taaki badges update rahein
    fetchCounts();

    // 2. Search Listener
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                currentSearch = searchInput.value.trim();
                currentPage = 1; 
                fetchOrders(1);
            }, 500);
        });
    }
});

// --- FUNCTION 1: FETCH ORDERS (With Page & Filter) ---
function fetchOrders(page) {
    const tableBody = document.getElementById('order-list-body');
    if(tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

    // URL me Page + Limit + Status + Search sab bhejo
    let url = `/api/orders?page=${page}&limit=20&status=${currentFilter}`;
    
    if (currentSearch) {
        url += `&search=${encodeURIComponent(currentSearch)}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            allOrdersData = data.orders;
            currentPage = data.currentPage;
            totalPages = data.totalPages;
            
            renderOrders(allOrdersData);
            updatePaginationControls();
        })
        .catch(err => console.error("Error fetching orders:", err));
}

// --- FUNCTION 2: COUNTS UPDATE (Separate Call for Accuracy) ---
function fetchCounts() {
    fetch('/api/orders/stats')
        .then(res => res.json())
        .then(data => {
            // HTML Badges me value daalo
            if(document.getElementById('count-all')) document.getElementById('count-all').innerText = data.All || 0;
            if(document.getElementById('count-pending')) document.getElementById('count-pending').innerText = data.Pending || 0;
            if(document.getElementById('count-processing')) document.getElementById('count-processing').innerText = data.Processing || 0;
            if(document.getElementById('count-shipped')) document.getElementById('count-shipped').innerText = data.Shipped || 0;
            if(document.getElementById('count-delivered')) document.getElementById('count-delivered').innerText = data.Delivered || 0;
            if(document.getElementById('count-cancelled')) document.getElementById('count-cancelled').innerText = data.Cancelled || 0;
        })
        .catch(err => console.error("Error fetching counts:", err));
}

// --- FUNCTION 3: FILTER TAB LOGIC ---
window.filterOrders = function(status) {
    currentFilter = status;
    currentPage = 1; // Filter change hone par Page 1 par jao

    // Buttons Highlight Logic
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${status.toLowerCase()}`);
    if(activeBtn) activeBtn.classList.add('active');

    // Naye status ke hisab se data fetch karo
    fetchOrders(1);
};

// --- FUNCTION 4: RENDER TABLE ---
function renderOrders(orders) {
    const tableBody = document.getElementById('order-list-body');
    if(!tableBody) return;
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No Orders Found.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        
        const statusLower = (order.status || 'pending').toLowerCase();
        let statusColor = '#333';
        if(statusLower === 'pending') statusColor = '#f39c12';
        if(statusLower === 'processing') statusColor = '#3498db';
        if(statusLower === 'shipped') statusColor = '#9b59b6';
        if(statusLower === 'delivered') statusColor = '#27ae60';
        if(statusLower === 'cancelled') statusColor = '#e74c3c';

        const row = `
            <tr>
                <td><strong>#${order.orderNumber || order._id.slice(-6)}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.customerPhone || 'N/A'}</td> 
                <td><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
                
                <td>
                    <select onchange="updateStatus('${order._id}', this.value)" 
                            style="border: 1px solid ${statusColor}; color: ${statusColor}; font-weight:bold; padding:5px; border-radius:5px;">
                        <option value="Pending" ${statusLower === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${statusLower === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${statusLower === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${statusLower === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${statusLower === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                
                <td>${orderDate}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewOrder('${order._id}')" style="background:#00b894; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- FUNCTION 5: PAGINATION CONTROLS ---
function updatePaginationControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    if(pageInfo) pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

    if(prevBtn) prevBtn.disabled = (currentPage <= 1);
    if(nextBtn) nextBtn.disabled = (currentPage >= totalPages);
}

window.changePage = function(direction) {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        fetchOrders(newPage);
    }
};

// --- FUNCTION 6: STATUS UPDATE ---
window.updateStatus = function(orderId, newStatus) {
    if(!confirm(`Change status to ${newStatus}?`)) return;

    fetch(`/api/orders/${orderId}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        // Status update hone ke baad current page refresh karo
        // Taaki agar Pending tab me the aur Shipped kiya, to wo order list se hat jaye
        fetchOrders(currentPage); 
    })
    .catch(err => {
        console.error(err);
        alert("Failed to update status");
    });
};

window.viewOrder = function(id) {
    window.location.href = `admin-order-detail.html?id=${id}`;
};