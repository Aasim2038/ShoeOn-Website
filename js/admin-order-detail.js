/* =========================================
   ADMIN-ORDER-DETAIL.JS (Poora Sahi Code)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  console.log('admin-order-detail.js file LOADED'); // DEBUG 1: Check karo file load hui

  // 1. URL se Order ID nikalo
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');

  // Page ke elements ko pakdo
  const orderIdEl = document.getElementById('order-id');
  const paymentIdEl = document.getElementById('payment-id');
  const customerNameEl = document.getElementById('customer-name');
  const customerPhoneEl = document.getElementById('customer-phone');
  const customerAddressEl = document.getElementById('customer-address');
  const orderStatusEl = document.getElementById('order-status');
  const itemsTableBody = document.getElementById('order-items-list');
  const updateStatusBtn = document.getElementById('update-status-btn'); // Button ko pakdo

  // Check karo ki ID mili ya nahi
  if (!orderId) {
    document.querySelector('.admin-content').innerHTML = "<h1>Error: Order ID nahi mili. URL check karo.</h1>";
    return; // Code ko wahi rok do
  }
  
  // Check karo ki saare zaroori elements HTML me hain
  if (!orderIdEl || !customerNameEl || !updateStatusBtn || !orderStatusEl) {
    console.error("HTML me koi zaroori ID (jaise 'update-status-btn') missing hai!");
    return;
  }

  // 2. Server se uss ID ka data fetch karo
  console.log('Fetching data for Order ID:', orderId); // DEBUG 2: Check karo ID sahi hai
  
  fetch(`/api/orders/${orderId}`)
    .then(res => {
      if (!res.ok) throw new Error('Order not found');
      return res.json();
    })
    .then(order => {
      console.log('Data mil gaya:', order); // DEBUG 3: Check karo data aaya
      
      // 3. Data ko HTML me bharo
      orderIdEl.innerText = `#${order.orderNumber}`;
      paymentIdEl.innerText = order.paymentId || 'N/A';
      customerNameEl.innerText = order.customerName;
      customerPhoneEl.innerText = order.customerPhone;
      
      let address = order.shippingAddress;
      if (order.city) address += `, ${order.city}`;
      if (order.pincode) address += ` - ${order.pincode}`;
      customerAddressEl.innerText = address;
      
      orderStatusEl.value = order.status;
      
      itemsTableBody.innerHTML = ''; 
      order.orderItems.forEach(item => {
        const row = `
          <tr>
            <td>
              <div class="item-info">
                <img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'; this.closest('.item-info').innerText='Image not found';">
                <div>
                  <p class="item-brand">${item.brand}</p>
                  <p class="item-name">${item.name}</p>
                </div>
              </div>
            </td>
            <td>${item.moq} Pairs</td>
            <td>₹${item.price}</td>
          </tr>
        `;
        itemsTableBody.innerHTML += row;
      });
      
    })
    .catch(err => {
      console.error('Error fetching order:', err);
      document.querySelector('.admin-content').innerHTML = `<h1>Error: ${err.message}</h1>`;
    });
  

  // --- 4. UPDATE STATUS BUTTON KA LOGIC ---
  console.log('Update Status button par click listener lagaya ja raha hai...'); // DEBUG 4
  
  updateStatusBtn.addEventListener('click', () => {
    
    console.log('Update Status button CLICKED!'); // DEBUG 5: Check karo click register hua
    
    // 1. Dropdown se naya status nikalo
    const newStatus = orderStatusEl.value;
    
    updateStatusBtn.innerText = 'Updating...';
    
    // 2. Server ke PUT API ko call karo
    fetch(`/api/orders/status/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }) // Naya status bhejo
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showToast(`Error: ${data.error}`); // showToast global.js se aayega
      } else {
        showToast('Status Updated Successfully!');
        
        // Status update hone ke 2 second baad wapas list par bhej do
        setTimeout(() => {
          window.location.href = 'admin-orders.html';
        }, 2000);
      }
      updateStatusBtn.innerText = 'Update Status';
    })
    .catch(err => {
      console.error('Update Error:', err);
      showToast('Server error, update nahi hua.');
      updateStatusBtn.innerText = 'Update Status';
    });
  });
  
});