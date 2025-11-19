/* =========================================
   ADMIN-CUSTOMERS.JS (Delete + Block Features)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const tableBody = document.getElementById('customer-list-body');

  // --- 1. Customers Load Karo ---
  function loadCustomers() {
    if (!tableBody) return;

    // Cache fix
    fetch('/api/users', { cache: 'no-store' })
      .then(res => res.json())
      .then(users => {
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customers registered yet.</td></tr>';
          return;
        }

        users.forEach(user => {
          const date = new Date(user.createdAt).toLocaleDateString('en-GB');
          
          let statusBadge = '';
          let actionBtn = '';

          if (user.isApproved) {
            // Agar Approved hai: Green Badge + Block Button
            statusBadge = `<span class="status-badge status-delivered">Active</span>`;
            actionBtn = `
              <button class="btn-action btn-delete btn-toggle" data-id="${user._id}" data-status="false" style="background-color:#f39c12;">
                <i class="fa-solid fa-ban"></i> Block
              </button>
            `;
          } else {
            // Agar Pending/Blocked hai: Red Badge + Approve Button
            statusBadge = `<span class="status-badge status-cancelled">Pending</span>`;
            actionBtn = `
              <button class="btn-action btn-edit btn-toggle" data-id="${user._id}" data-status="true">
                <i class="fa-solid fa-check"></i> Approve
              </button>
            `;
          }

          // Delete Button hamesha rahega
          const deleteBtn = `
            <button class="btn-action btn-delete btn-remove" data-id="${user._id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          `;

          const row = `
            <tr>
              <td>${date}</td>
              <td>${user.name}</td>
              <td>${user.shopName}</td>
              <td>${user.phone}</td>
              <td>${statusBadge}</td>
              <td>
                <div style="display:flex; gap:5px;">
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
    
    // A. Approve/Block Logic
    const toggleBtns = document.querySelectorAll('.btn-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.closest('.btn-toggle').dataset.id;
        const newStatus = e.target.closest('.btn-toggle').dataset.status === 'true'; // String ko boolean banao
        
        // Server ko update bhejo
        fetch(`/api/users/status/${userId}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved: newStatus })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          loadCustomers(); // Table refresh karo
        })
        .catch(err => alert('Error updating status'));
      });
    });

    // B. Delete Logic
    const removeBtns = document.querySelectorAll('.btn-remove');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.closest('.btn-remove').dataset.id;
        
        if(confirm('Kya aap sach me is customer ko DELETE karna chahte hain?')) {
          fetch(`/api/users/${userId}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
              alert('Customer Deleted!');
              loadCustomers(); // Table refresh karo
            })
            .catch(err => alert('Error deleting customer'));
        }
      });
    });
  }

  loadCustomers();
});