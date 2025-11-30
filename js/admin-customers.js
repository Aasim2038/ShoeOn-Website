/* =========================================
   ADMIN-CUSTOMERS.JS (FINAL CODE - Credit Terms Display)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const tableBody = document.getElementById('customer-list-body');

  // --- 1. Customers Load Karo ---
  function loadCustomers() {
    if (!tableBody) return;

    fetch('/api/users', { cache: 'no-store' })
      .then(res => res.json())
      .then(users => {
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No customers registered yet.</td></tr>';
          return;
        }

        users.forEach(user => {
          const date = new Date(user.createdAt).toLocaleDateString('en-GB');
          
          // CRITICAL: isApproved aur isCreditApproved alag-alag hain
          const isApproved = user.isApproved;
          const isCreditApproved = user.isCreditApproved;
          
          let creditStatus = isCreditApproved ? 'Credit' : 'None';
          let statusBadge = '';
          let actionBtn = '';

          // A. MAIN B2B APPROVAL STATUS
          if (isApproved) {
            statusBadge = `<span class="status-badge status-delivered">Active</span>`;
            // Agar Active hai, toh Block ka option do
            actionBtn = `
              <button class="btn-action btn-delete btn-toggle" data-id="${user._id}" data-status="false" data-field="isApproved" style="background-color:#e74c3c;">
                <i class="fa-solid fa-ban"></i> Block
              </button>
            `;
          } else {
            // Agar Pending hai, toh Approve ka option do
            statusBadge = `<span class="status-badge status-cancelled">Pending</span>`;
            actionBtn = `
              <button class="btn-action btn-edit btn-toggle" data-id="${user._id}" data-status="true" data-field="isApproved">
                <i class="fa-solid fa-check"></i> Approve
              </button>
            `;
          }

          // Naya Edit button jise hum pehle banaya tha
          const editBtn = `
            <a href="admin-customer-edit.html?id=${user._id}" class="btn-action btn-edit" style="background-color: #3498db; color: white;">
              <i class="fa-solid fa-pencil"></i> Edit
            </a>
          `;
          
          // Delete Button (Hamesha rahega)
          const deleteBtn = `<button class="btn-action btn-delete btn-remove" data-id="${user._id}"><i class="fa-solid fa-trash"></i></button>`;

          // FINAL ROW (NEW COLUMNS)
          const row = `
            <tr>
              <td>${date}</td>
              <td>${user.name}</td>
              <td>${user.shopName}</td>
              <td>${user.phone}</td>
              
              <td>₹${user.creditLimit.toLocaleString('en-IN') || 0}</td>

              <td>${user.creditTermsDays || 0} Days</td>
              
              <td>${statusBadge}</td>
              
              <td>
                <div style="display:flex; gap:5px;">
                  ${editBtn}
                  ${actionBtn}
                  ${deleteBtn}
                </div>
              </td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
        
        // Listeners lagao
        addListeners();
      })
      .catch(err => console.error(err));
  }

  // --- 2. Button Logic (Toggle & Delete) ---
  function addListeners() {
    
    // A. Approve/Block Logic (Ab yeh sirf isApproved field update karega)
    const toggleBtns = document.querySelectorAll('.btn-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.closest('.btn-toggle').dataset.id;
        const newStatus = e.target.closest('.btn-toggle').dataset.status === 'true'; 
        
        if(confirm(`Kya aap is customer ko ${newStatus ? 'Approve' : 'Block'} karna chahte hain?`)) {
          
          fetch(`/api/users/${userId}`, { // New generic PUT API for user update
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isApproved: newStatus }) // Sirf isApproved field bhej rahe hain
          })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              loadCustomers(); // Refresh table
            })
            .catch(err => alert('Error updating status'));
        }
      });
    });

    // B. Delete Logic (Waisa hi rahega)
    const removeBtns = document.querySelectorAll('.btn-remove');
    removeBtns.forEach(btn => { /* ... (Logic) ... */ });
  }

  loadCustomers();
});