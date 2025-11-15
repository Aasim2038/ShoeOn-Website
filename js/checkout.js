/* =========================================
   CHECKOUT.JS (FIXED - Sirf 3 Fields)
   ========================================= */

// Is function ko global.js se access milega
function renderCheckoutSummary() {
  const cart = getCart(); // getCart() global.js me hai
  
  const summaryList = document.getElementById('summary-items-list');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryGrandTotal = document.getElementById('summary-grandtotal');

  if (!summaryList) return; 

  let total = 0;
  let itemsHTML = '';

  if (cart.length === 0) {
    summaryList.innerHTML = '<p style="text-align:center; color:#777;">Your cart is empty.</p>';
  } else {
    cart.forEach(item => {
      const priceNumber = parseFloat(String(item.price).replace('₹', '').replace(',', ''));
      if (!isNaN(priceNumber)) {
        total += priceNumber;
      }
      itemsHTML += `
        <div class="summary-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="summary-item-details">
            <p class="item-brand">${item.brand}</p>
            <p class="item-name">${item.name}</p>
          </div>
          <p class="item-price">₹${item.price}</p>
        </div>
      `;
    });
    summaryList.innerHTML = itemsHTML;
  }
  
  const finalTotal = total.toFixed(2);
  summarySubtotal.innerText = `₹${finalTotal}`;
  summaryGrandTotal.innerText = `₹${finalTotal}`; 
}


// --- Order Place Karne Ka Logic (FIXED) ---
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Page load hote hi summary update karo
  renderCheckoutSummary();
  
  // 2. Button aur Form ke fields ko pakdo
  const placeOrderBtn = document.getElementById('place-order-btn');
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const addressEl = document.getElementById('address');
  // Pincode aur City yahaan se hata diye

  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      
      if (!nameEl || !phoneEl || !addressEl) {
        showToast("HTML me koi ID missing hai ('name', 'phone', 'address')");
        return;
      }
      
      const customerName = nameEl.value;
      const customerPhone = phoneEl.value;
      const shippingAddress = addressEl.value;

      // Validation me se Pincode hata diya
      if (!customerName || !customerPhone || !shippingAddress) {
        showToast('Please fill all address details'); 
        return; 
      }

      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
      }
      
      // Total amount calculate karo
      let totalAmount = 0;
      cart.forEach(item => {
        const priceNumber = parseFloat(String(item.price).replace('₹', '').replace(',', ''));
        if (!isNaN(priceNumber)) {
          totalAmount += priceNumber;
        }
      });
      
      // orderData me se Pincode aur City hata diye
      const orderData = {
        customerName: customerName,
        customerPhone: customerPhone,
        shippingAddress: shippingAddress,
        orderItems: cart, 
        totalAmount: totalAmount,
        paymentMethod: 'Online'
      };

      placeOrderBtn.innerText = 'Placing Order...';
      placeOrderBtn.style.opacity = '0.7';

      // Server ke API ko data bhejo
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showToast('Error placing order. Please try again.');
          placeOrderBtn.innerText = 'Place Order';
          placeOrderBtn.style.opacity = '1';
        } else {
          showToast('Order placed successfully!');
          localStorage.removeItem('shoeonCart'); 
         window.location.href = `order-success.html?order_id=${data.orderNumber}`;
        }
      })
      .catch(err => {
        console.error('Fetch Error:', err);
        showToast('Network Error. Check console.');
        placeOrderBtn.innerText = 'Place Order';
        placeOrderBtn.style.opacity = '1';
      });
    });
  }
});