/* =========================================
   ADMIN-CUSTOMER-EDIT.JS (FINAL WORKING CODE)
   ========================================= */

   const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    const isCreditApprovedInput = document.getElementById('isCreditApproved');
    
    const creditTermsDaysInput = document.getElementById('creditTermsDays');

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Variables & Elements ---
    const form = document.getElementById('customer-update-form'); // Corrected Form ID
    const responseDiv = document.getElementById('update-message');
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    // Display Elements
    const infoDisplay = document.getElementById('customer-info-display');
    const currentStatusDisplay = document.getElementById('current-approval-status');
    
    // Editable Inputs
    const isCreditApprovedInput = document.getElementById('isCreditApproved');
    const creditTermsDaysInput = document.getElementById('creditTermsDays');
    const creditLimitInput = document.getElementById('creditLimit');


    if (!userId) { responseDiv.innerText = 'Error: User ID not found.'; return; }

    // --- 2. Data Load & Display ---
    function loadCustomer(id) {
        fetch(`/api/users/${id}`)
            .then(res => res.json())
            .then(user => {
                if (user.error || !user.name) throw new Error("Could not load user data.");
                
                // Set editable inputs
                isCreditApprovedInput.checked = user.isCreditApproved;
                creditTermsDaysInput.value = String(user.creditTermsDays || 0); 
                creditLimitInput.value = user.creditLimit || 0;

                // Set status badge and information (Puraana design)
                const statusText = user.isApproved ? 'Approved' : 'Pending Approval';
                const statusClass = user.isApproved ? 'status-delivered' : 'status-cancelled';
                
                currentStatusDisplay.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;

                // Fill static customer info (purane design jaisa)
                infoDisplay.innerHTML = `
                    <div><strong>Full Name:</strong><span>${user.name}</span></div>
                    <div><strong>Phone:</strong><span>${user.phone}</span></div>
                    <div><strong>Shop Name:</strong><span>${user.shopName}</span></div>
                    <div><strong>Shop Address:</strong><span>${user.shopAddress}</span></div>
                    <div><strong>GST:</strong><span>${user.gstNumber || 'N/A'}</span></div>
                `;
            })
            .catch(err => {
                responseDiv.innerText = `Error loading user data.`;
            });
    }


    // --- 3. Form Submission Logic (Credit Update) ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Collect only credit and approval data
            const updateData = {
                isCreditApproved: isCreditApprovedInput.checked,
                creditTermsDays: parseInt(creditTermsDaysInput.value) || 0,
                creditLimit: parseFloat(creditLimitInput.value) || 0
            };

            responseDiv.innerText = 'Saving...';

            // PUT Request to server
            fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    responseDiv.innerText = `Error: ${data.error}`;
                } else {
                    responseDiv.innerText = 'Credit terms updated successfully!';
                    responseDiv.style.color = 'green';
                    loadCustomer(userId); // Page ko refresh karke naya status dikhao
                }
            })
            .catch(err => {
                responseDiv.innerText = 'Server Error during update.';
            });
        });
    }

    loadCustomer(userId); // Page load hote hi data fetch karo
});