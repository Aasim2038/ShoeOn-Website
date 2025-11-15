/* =========================================
   ADMIN-ORDERS.JS (TYPO FIXED)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const tableBody = document.getElementById('order-list-body');

  // --- FUNCTION 1: Orders laana aur table bharna ---
  function loadOrders() {
    if (!tableBody) return; 

    fetch('/api/orders', { cache: 'no-store' })
      .then(response => response.json())
      .then(orders => {
        
        tableBody.innerHTML = ''; // Table khaali karo
        
        if (orders.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Abhi tak koi order nahi aaya hai.</td></tr>';
          return;
        }

        orders.forEach(order => {
          
          // --- YEH HAI ASLI FIX ---
          // 'toLocaleDateDateString' ko 'toLocaleDateString' kar diya
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          });
          // ------------------------

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
        
        addViewListeners(); 
        
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading orders.</td></tr>';
      });
  }

  // --- FUNCTION 2: VIEW BUTTONS KA LOGIC ---
  function addViewListeners() {
    const viewButtons = document.querySelectorAll('.btn-view');
    
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-view').dataset.id;
        window.location.href = `admin-order-detail.html?id=${id}`;
      });
    });
  }

  // Page load hote hi orders load karo
  loadOrders();

});