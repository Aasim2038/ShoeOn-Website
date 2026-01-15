/* =========================================
   ADMIN-CUSTOMER-EDIT.JS (FINAL FIXED)
   Includes: Offline, Cash Allowed & Advance %
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('customer-update-form'); 
    const responseDiv = document.getElementById('update-message');
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    // Elements Select Karo
    const isOfflineCustomerInput = document.getElementById('isOfflineCustomer'); 
    const isCashAllowedInput = document.getElementById('isCashAllowed'); 
    const advancePercentInput = document.getElementById('advancePercent'); // 👈 Ye Naya Hai

    if (!userId) { 
        if(responseDiv) responseDiv.innerText = 'Error: User ID not found.'; 
        return; 
    }

    // --- LOAD DATA ---
    function loadCustomer(id) {
        fetch(`/api/users/${id}`)
            .then(res => res.json())
            .then(user => {
                if (user.error || !user.name) throw new Error("Could not load user data.");
                
                // 1. Checkboxes Set
                if(isOfflineCustomerInput) isOfflineCustomerInput.checked = user.isOfflineCustomer || false;
                if(isCashAllowedInput) isCashAllowedInput.checked = user.isCashAllowed || false;

                // 2. Advance Percent Set
                if(advancePercentInput) advancePercentInput.value = user.advancePercent || 20;

                // 3. Info Display
                const infoDisplay = document.getElementById('customer-info-display');
                if(infoDisplay) {
                    infoDisplay.innerHTML = `
                        <div><strong>Full Name:</strong><span>${user.name}</span></div>
                        <div><strong>Phone:</strong><span>${user.phone}</span></div>
                        <div><strong>Shop Name:</strong><span>${user.shopName}</span></div>
                        <div><strong>Shop Address:</strong><span>${user.shopAddress}</span></div>
                        
                        <div style="margin-top:15px; padding:10px; background: #f9f9f9; border: 1px solid #ddd; border-radius:5px;">
                            <p><strong>Customer Type:</strong> ${user.isOfflineCustomer ? '<span style="color:#d35400;">Offline (Low Rate)</span>' : 'Online'}</p>
                            <p><strong>Payment:</strong> ${user.isCashAllowed ? '<span style="color:green;">Cash Allowed</span>' : 'Prepaid Only'}</p>
                            <p><strong>Advance:</strong> <strong>${user.advancePercent || 20}%</strong> Required</p>
                        </div>
                    `;
                }

                // 4. Status Badge
                const currentStatusDisplay = document.getElementById('current-approval-status');
                if(currentStatusDisplay) {
                    const statusText = user.isApproved ? 'Approved' : 'Pending Approval';
                    const statusClass = user.isApproved ? 'status-delivered' : 'status-cancelled'; 
                    currentStatusDisplay.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
                }
            })
            .catch(err => {
                console.error(err);
                if(responseDiv) responseDiv.innerText = `Error loading data.`;
            });
    }

    // --- SAVE BUTTON ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            responseDiv.innerText = 'Updating...';
            responseDiv.style.color = 'blue';

            const updateData = {
                isApproved: true,
                isOfflineCustomer: isOfflineCustomerInput ? isOfflineCustomerInput.checked : false,
                isCashAllowed: isCashAllowedInput ? isCashAllowedInput.checked : false, // 👈 Ab ye Server jayega
                advancePercent: advancePercentInput ? parseInt(advancePercentInput.value) : 20
            };

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
                    responseDiv.innerText = 'Saved Successfully!';
                    responseDiv.style.color = 'green';
                    loadCustomer(userId); 
                }
            })
            .catch(err => {
                console.error(err);
                responseDiv.innerText = 'Server Error.';
            });
        });
    }

    loadCustomer(userId);
});