/* =========================================
   ADMIN ORDERS JS (FINAL: SEARCH + FILTER + COUNTS)
   ========================================= */

let allOrdersData = []; // Data store karne ke liye
let currentFilter = 'All'; // Abhi kaunsa tab active hai

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('orderSearchInput');

    // 1. Page Load hote hi orders laao
    fetchOrders();

    // 2. Search Bar Listener
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                fetchOrders(searchTerm); // Server se search karega
            }, 500);
        });
    }
});

// --- FUNCTION 1: FETCH ORDERS (Server se data laana) ---
function fetchOrders(searchTerm = "") {
    const tableBody = document.getElementById('order-list-body'); // ID check karlena HTML me
    if(tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

    // Agar search term hai to URL me add karo
    const url = searchTerm 
        ? `/api/orders?search=${encodeURIComponent(searchTerm)}` 
        : '/api/orders';

    fetch(url)
        .then(res => res.json())
        .then(data => {
            allOrdersData = data; // Data global variable me save
            
            updateCounts();       // Badges ke number update karo
            filterOrders(currentFilter); // Jo tab khula tha wahi dikhao
        })
        .catch(err => console.error("Error fetching orders:", err));
}

// --- FUNCTION 2: UPDATE COUNTS (Pending: 4, Shipped: 2 etc.) ---
function updateCounts() {
    const counts = {
        All: allOrdersData.length,
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0
    };

    allOrdersData.forEach(order => {
        // Status match karke count badhao (Case insensitive check)
        const status = order.status ? order.status : 'Pending';
        // Capitalize first letter logic agar status small me aa raha ho
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        if (counts[formattedStatus] !== undefined) {
            counts[formattedStatus]++;
        }
    });

    // HTML Badges update karo
    if(document.getElementById('count-all')) document.getElementById('count-all').innerText = counts.All;
    if(document.getElementById('count-pending')) document.getElementById('count-pending').innerText = counts.Pending;
    if(document.getElementById('count-processing')) document.getElementById('count-processing').innerText = counts.Processing;
    if(document.getElementById('count-shipped')) document.getElementById('count-shipped').innerText = counts.Shipped;
    if(document.getElementById('count-delivered')) document.getElementById('count-delivered').innerText = counts.Delivered;
    if(document.getElementById('count-cancelled')) document.getElementById('count-cancelled').innerText = counts.Cancelled;
}

// --- FUNCTION 3: FILTER CLICK LOGIC (Buttons dabane par) ---
window.filterOrders = function(status) {
    currentFilter = status; // Selection save karo

    // 1. Buttons ka color highlight karo
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${status.toLowerCase()}`);
    if(activeBtn) activeBtn.classList.add('active');

    // 2. Data Filter Karo
    let filteredOrders = [];
    if (status === 'All') {
        filteredOrders = allOrdersData;
    } else {
        filteredOrders = allOrdersData.filter(order => {
            const orderStatus = order.status || 'Pending';
            return orderStatus.toLowerCase() === status.toLowerCase();
        });
    }

    renderOrders(filteredOrders);
};

// --- FUNCTION 4: TABLE RENDER KARNA ---
function renderOrders(orders) {
    const tableBody = document.getElementById('order-list-body'); // Wahi ID jo aapke HTML me hai
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
        
        // Status Colors Logic
        const statusLower = (order.status || 'pending').toLowerCase();
        let statusColor = '#333'; // Default
        if(statusLower === 'pending') statusColor = '#f39c12';
        if(statusLower === 'processing') statusColor = '#3498db';
        if(statusLower === 'shipped') statusColor = '#9b59b6';
        if(statusLower === 'delivered') statusColor = '#27ae60';
        if(statusLower === 'cancelled') statusColor = '#e74c3c';

        // Row HTML
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

// --- FUNCTION 5: STATUS UPDATE ---
window.updateStatus = function(orderId, newStatus) {
    if(!confirm(`Change status to ${newStatus}?`)) {
        filterOrders(currentFilter); // Cancel kiya to wapis reset karo
        return;
    }

    fetch(`/api/orders/${orderId}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        // Status update hone ke baad wapas fetch karo taaki Counts aur List update ho jaye
        fetchOrders(document.getElementById('orderSearchInput')?.value || ""); 
    })
    .catch(err => {
        console.error(err);
        alert("Failed to update status");
    });
};

// View Redirect Helper
window.viewOrder = function(id) {
    window.location.href = `admin-order-detail.html?id=${id}`;
};