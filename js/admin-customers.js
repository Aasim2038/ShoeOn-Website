/* =========================================
   ADMIN-CUSTOMERS.JS (SEARCH INTEGRATED FIX)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('customer-list-body');
    // CRITICAL 1: Search Input field ko access karo (HTML mein ID: 'customerSearchInput' honi chahiye)
    const searchInput = document.getElementById('customerSearchInput'); 

    // --- 1. Customers Load Karo (Modified for Search) ---
    // Function ka naam badla aur searchTerm parameter add kiya
    async function fetchCustomers(searchTerm = "") { 
       try {
        // FIX: '/api/users' route use karo
        const url = searchTerm 
            ? `/api/users?search=${encodeURIComponent(searchTerm)}` 
            : '/api/users';

        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // FIX: Server se direct users array aayega (Step 1 ke hisaab se)
        const users = await response.json(); 
        
        // --- Yahan se aapka code waisa hi continue hoga ---
        tableBody.innerHTML = ''; 

        if (!Array.isArray(users) || users.length === 0) { // Safety check
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No customers found.</td></tr>';
            return;
        }

            users.forEach(user => {
            const date = new Date(user.createdAt).toLocaleDateString('en-GB');
            
            // New User Highlight Logic
            const isPending = user.isApproved === false;
            const rowClass = isPending ? 'highlight-new-user' : ''; 

            // --- 1. STATUS BADGE LOGIC (RESTORED) ---
            let statusBadge = '';
            if (user.isApproved) {
                statusBadge = '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">Active</span>';
            } else {
                statusBadge = '<span style="background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">Pending</span>';
            }

            // --- 2. APPROVE / BLOCK BUTTON LOGIC (RESTORED) ---
            let actionBtn = '';
            if (user.isApproved) {
                // Agar user Active hai -> BLOCK button dikhao
                actionBtn = `<button class="btn-action btn-toggle" data-id="${user._id}" data-status="false" style="background-color: #e74c3c; color: white;">
                                <i class="fa-solid fa-ban"></i> Block
                             </button>`;
            } else {
                // Agar user Pending hai -> APPROVE button dikhao
                actionBtn = `<button class="btn-action btn-toggle" data-id="${user._id}" data-status="true" style="background-color: #27ae60; color: white;">
                                <i class="fa-solid fa-check"></i> Approve
                             </button>`;
            }

            // Edit/Delete Buttons
            const editBtn = `<a href="admin-customer-edit.html?id=${user._id}" class="btn-action btn-edit" style="background-color: #3498db; color: white;"><i class="fa-solid fa-pencil"></i> Edit</a>`;
            const deleteBtn = `<button class="btn-action btn-delete btn-remove" data-id="${user._id}"><i class="fa-solid fa-trash"></i></button>`;

            // FINAL ROW (Credit Columns Hatane ke baad)
           const row = `
                <tr class="${rowClass}"> 
                    <td>${date}</td>
                    <td>${user.name}</td>
                    <td>${user.shopName}</td>
                    <td>${user.phone}</td>
                    <td>${statusBadge}</td> <td>
                        <div style="display:flex; gap:5px;">
                            ${editBtn}
                            ${actionBtn} ${deleteBtn}
                        </div>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
            
            addListeners(); // Listeners lagao
            
        } catch (err) {
            console.error('Error fetching customers:', err);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Error loading customers.</td></tr>';
        }
    }

    // --- 2. Button Logic (Toggle & Delete) ---
    function addListeners() {
        // ... (Aapka pura addListeners function waisa hi rahega) ...
        const toggleBtns = document.querySelectorAll('.btn-toggle');
        toggleBtns.forEach(btn => { 
             // ... (Toggle Logic waisa hi rahega) ...
             btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.btn-toggle').dataset.id;
                const newStatus = e.target.closest('.btn-toggle').dataset.status === 'true'; 
                
                if(confirm(`Kya aap is customer ko ${newStatus ? 'Approve' : 'Block'} karna chahte hain?`)) {
                    fetch(`/api/users/${userId}`, { 
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isApproved: newStatus }) 
                    })
                    .then(res => res.json())
                    .then(data => {
                      alert(data.message);
                      fetchCustomers(); // CRITICAL: loadCustomers ki jagah fetchCustomers call karo
                    })
                    .catch(err => alert('Error updating status'));
                }
            });
        });

        const removeBtns = document.querySelectorAll('.btn-remove');

        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.btn-remove').dataset.id;
                
                if(confirm('Kya aap sach me is customer ko delete karna chahte hain?')) {
                    fetch(`/api/users/${userId}`, { 
                        method: 'DELETE' // Delete API call
                    })
                    .then(res => {
                        if (!res.ok) throw new Error('Delete failed on server.');
                        return res.json();
                    })
                    .then(data => {
                        alert(data.message || "Customer successfully deleted.");
                        fetchCustomers(); // Table ko refresh karein
                    })
                    .catch(err => alert('Error deleting customer.'));
                }
            });
        });

    }
    
    // --- 3. SEARCH BAR EVENT LISTENER ---
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim(); 
                fetchCustomers(searchTerm); // Search term ke saath call karo
            }, 500); // 500 milliseconds ka delay
        });
    }

    // Page load hote hi customers load karo
    fetchCustomers(); // CRITICAL: loadCustomers ki jagah fetchCustomers call karo

});