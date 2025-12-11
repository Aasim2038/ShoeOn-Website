/* =========================================
   MY-ACCOUNT.JS (Final Fix - All Dynamic Data)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. AUTH CHECK & VARIABLES ---
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('shoeonUser'));
    
    // Redirection agar login nahi hai
    if (!authToken || !loggedInUser) {
        window.location.href = 'login.html'; 
        return;
    }

    // UI Selections
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const ordersTbody = document.getElementById('orders-tbody');
    const addressDisplay = document.getElementById('address-display');
    // Note: Logout button ki ID 'logout-btn' aapki HTML mein nahi hai. Agar hai toh use kar lena.
    const logoutBtn = document.getElementById('logout-btn'); 

    // --- 2. TAB SWITCHING (Waisa hi rahega) ---
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            this.classList.add('active');
            const targetTab = this.getAttribute('data-tab'); 
            const targetSection = document.getElementById(targetTab);

            if (targetSection) targetSection.classList.add('active');

            // CRITICAL: Tab switch par data load karo
            if (targetTab === 'orders') loadOrderHistory();
            if (targetTab === 'profile') loadUserData(); 
            if (targetTab === 'address') loadUserData(); // Address data bhi profile se hi aayega
        });
    });

    // --- 3. LOAD PROFILE DATA (ADDRESS FIX) ---
    function loadUserData() {
        // Request ko secure karne ke liye user ID bhej sakte hain (agar server allow karta hai)
        fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Auth session expired');
            return res.json();
        })
        .then(user => {
            // PROFILE TAB DATA
            document.getElementById('profile-name').innerText = user.name || 'N/A';
            document.getElementById('profile-phone').innerText = user.phone || 'N/A';
            document.getElementById('profile-shopname').innerText = user.shopName || 'N/A';
            document.getElementById('profile-gst').innerText = user.gstNumber || 'N/A';
            document.getElementById('full-address-view').innerText = user.shopAddress || 'Address not updated';

            // ADDRESS TAB DATA (CRITICAL FIX)
            if (addressDisplay) {
                addressDisplay.innerText = user.shopAddress || 'Address not updated. Please update your details.';
            }

            // Approval Status (waisa hi rahega)
            const statusBadge = document.getElementById('profile-status');
            const statusClass = user.isApproved ? 'status-delivered' : 'status-pending';
            const statusText = user.isApproved ? 'Approved Account' : 'Pending Admin Approval';
            statusBadge.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
        })
        .catch(err => {
            console.error(err);
        });
    }

    // --- 4. LOAD ORDER HISTORY ---
    function loadOrderHistory() {
        if (!ordersTbody) return;
        if (ordersTbody.dataset.loaded === 'true') return; 

        ordersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Fetching orders...</td></tr>';
        
        // CRITICAL FIX: Sahi route aur userPhone use karo
        const userPhone = loggedInUser.phone; // Jo DOMContentLoaded ke shuruat mein define kiya tha
        
        if (!userPhone) {
            ordersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Phone number missing for order history.</td></tr>';
            return;
        }
        
        fetch(`/api/user/my-orders/${userPhone}`, { // <-- FIX: YEH ROUTE AB SAHI HAI!
            headers: { 'Authorization': `Bearer ${authToken}` } // Auth token bhejo (though server abhi phone se filter kar raha hai)
        })
        .then(res => {
             if (!res.ok) throw new Error('Order history fetch failed from API.');
             return res.json();
        })
        .then(orders => {
            ordersTbody.innerHTML = '';
            const noOrdersMsg = document.getElementById('no-orders-message');

            if (!Array.isArray(orders) || orders.length === 0) {
                if (noOrdersMsg) noOrdersMsg.style.display = 'block';
                return;
            }

            if (noOrdersMsg) noOrdersMsg.style.display = 'none';
            
            orders.forEach(order => {
                const date = new Date(order.createdAt).toLocaleDateString('en-GB');
                const row = `
                    <tr>
                        <td><strong>#SHO-${order.orderNumber || order._id.substring(0,6)}</strong></td>
                        <td>${date}</td>
                        <td>₹${(order.totalAmount || order.total || 0).toFixed(2)}</td>
                        <td><span class="status-badge status-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</span></td>
                        <td><a href="/order-success.html?order_id=${order.orderNumber || order._id}" style="color:#e84c3d; font-weight:bold;">View Invoice</a></td>
                    </tr>
                `;
                ordersTbody.insertAdjacentHTML('beforeend', row);
            });
            ordersTbody.dataset.loaded = 'true';
        })
        .catch(err => {
             console.error("Error orders:", err);
             ordersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Orders load nahi ho sake. Check server logs.</td></tr>';
        });
    }

    // --- 5. LOGOUT ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Kya aap logout karna chahte hain?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('shoeonUser');
                localStorage.removeItem('shoeonCart');
                window.location.href = 'index.html'; 
            }
        });
    }

    // Initial load: Profile data pehle bharo
    loadUserData();
});