/* =========================================
   ADMIN-CUSTOMER-EDIT.JS (CLEAN VERSION)
   Only Offline Status & Approval
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Variables & Elements ---
    const form = document.getElementById('customer-update-form'); 
    const responseDiv = document.getElementById('update-message');
    
    // URL se ID nikalo
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    // Inputs (Sirf Offline wala rakha hai)
    const isOfflineCustomerInput = document.getElementById('isOfflineCustomer'); 

    // Error check
    if (!userId) { 
        if(responseDiv) responseDiv.innerText = 'Error: User ID not found.'; 
        return; 
    }

    // --- 2. Data Load & Display ---
    function loadCustomer(id) {
        fetch(`/api/users/${id}`)
            .then(res => res.json())
            .then(user => {
                if (user.error || !user.name) throw new Error("Could not load user data.");
                
                // 1. Checkbox set karo (Agar DB mein true hai to tick dikhega)
                if(isOfflineCustomerInput) {
                    isOfflineCustomerInput.checked = user.isOfflineCustomer || false;
                }

                // 2. Info Display (Naam, Shop, etc.)
                const infoDisplay = document.getElementById('customer-info-display');
                if(infoDisplay) {
                    infoDisplay.innerHTML = `
                        <div><strong>Full Name:</strong><span>${user.name}</span></div>
                        <div><strong>Phone:</strong><span>${user.phone}</span></div>
                        <div><strong>Shop Name:</strong><span>${user.shopName}</span></div>
                        <div><strong>Shop Address:</strong><span>${user.shopAddress}</span></div>
                        <div><strong>GST:</strong><span>${user.gstNumber || 'N/A'}</span></div>
                        
                        <div style="margin-top:15px; padding:10px; background:${user.isOfflineCustomer ? '#fff3cd' : '#d4edda'}; border-radius:5px;">
                            <strong>Current Type:</strong> 
                            <span style="color:${user.isOfflineCustomer ? '#856404' : '#155724'}; font-weight:bold;">
                                ${user.isOfflineCustomer ? '🛑 Existing/Offline Customer' : '✅ New/Online Customer'}
                            </span>
                        </div>
                    `;
                }

                // 3. Status Badge Update
                const currentStatusDisplay = document.getElementById('current-approval-status');
                if(currentStatusDisplay) {
                    const statusText = user.isApproved ? 'Approved' : 'Pending Approval';
                    const statusClass = user.isApproved ? 'status-delivered' : 'status-cancelled';
                    currentStatusDisplay.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
                }
            })
            .catch(err => {
                console.error(err);
                if(responseDiv) responseDiv.innerText = `Error loading user data.`;
            });
    }

    // --- 3. SAVE BUTTON LOGIC ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            responseDiv.innerText = 'Updating...';
            responseDiv.style.color = 'blue';

            // Sirf ye data bhejenge
            const updateData = {
                // Checkbox ki value (True/False)
                isOfflineCustomer: isOfflineCustomerInput ? isOfflineCustomerInput.checked : false,
                
                // Button dabane ka matlab hai Admin ne Approve kar diya
                isApproved: true 
            };

            // Server ko bhejo
            fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    responseDiv.innerText = `Error: ${data.error}`;
                    responseDiv.style.color = 'red';
                } else {
                    responseDiv.innerText = 'Saved & User Approved!';
                    responseDiv.style.color = 'green';
                    
                    // Data refresh karo taaki naya status dikhe
                    loadCustomer(userId); 
                }
            })
            .catch(err => {
                console.error(err);
                responseDiv.innerText = 'Server Error.';
                responseDiv.style.color = 'red';
            });
        });
    } else {
        console.error("Form not found!");
    }

    // Page khulte hi data load karo
    loadCustomer(userId);
});