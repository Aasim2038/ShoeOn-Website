/* =========================================
   CHECKOUT.JS (Mock Payment - Direct Success)
   ========================================= */

function renderCheckoutSummary() {
  const cart = getCart();
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
      if (!isNaN(priceNumber)) total += priceNumber;
      
      itemsHTML += `
        <div class="summary-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="summary-item-details">
            <p class="item-brand">${item.brand}</p>
            <p class="item-name">${item.name}</p>
          </div>
          <p class="item-price">₹${item.price}</p>
        </div>`;
    });
    summaryList.innerHTML = itemsHTML;
  }
  
  const finalTotal = total.toFixed(2);
  if(summarySubtotal) summarySubtotal.innerText = `₹${finalTotal}`;
  if(summaryGrandTotal) summaryGrandTotal.innerText = `₹${finalTotal}`;
}


document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();

  const user = JSON.parse(localStorage.getItem('shoeonUser'));

  if (user) {
    // Agar user login hai, toh fields dhoondo
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    // Data bharo (Agar field maujood hai)
    if (nameInput) nameInput.value = user.name;
    if (phoneInput) phoneInput.value = user.phone;
    
    // Address me hum Shop Name aur Shop Address dono mila kar daal denge
    if (addressInput) {
      // Example: "Aasim Footwear, Shop No 5, MG Road..."
      addressInput.value = `${user.shopName}, ${user.shopAddress}`; 
    }
  }
  // ----------------------------------
  
  const placeOrderBtn = document.getElementById('place-order-btn');
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const addressEl = document.getElementById('address');

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async (e) => {
      e.preventDefault(); 
      
      if (!nameEl || !phoneEl || !addressEl) {
        showToast("Form error: ID missing");
        return;
      }
      
      const customerName = nameEl.value;
      const customerPhone = phoneEl.value;
      const shippingAddress = addressEl.value;

      if (!customerName || !customerPhone || !shippingAddress) {
        showToast('Please fill all address details'); 
        return; 
      }

      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
      }
      
      let totalAmount = 0;
      cart.forEach(item => {
        const priceNumber = parseFloat(String(item.price).replace('₹', '').replace(',', ''));
        if (!isNaN(priceNumber)) totalAmount += priceNumber;
      });

      placeOrderBtn.innerText = 'Processing Payment...';
      placeOrderBtn.style.opacity = '0.7';

      try {
        // --- STEP 1: CREATE ORDER (Fake/Mock) ---
        const orderResponse = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount })
        });
        const orderData = await orderResponse.json();
        
        if (!orderData.id) {
          showToast('Payment initiation failed');
          placeOrderBtn.innerText = 'Place Order';
          placeOrderBtn.style.opacity = '1';
          return;
        }

        // --- STEP 2: MOCK PAYMENT (Direct Success) ---
        // Hum maan lete hain ki popup khula aur payment ho gaya
        const fakePaymentResponse = {
          razorpay_order_id: orderData.id,
          razorpay_payment_id: "pay_" + Math.floor(Math.random() * 1000000),
          razorpay_signature: "fake_signature"
        };

        // --- STEP 3: VERIFY KARO ---
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fakePaymentResponse)
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.status === 'success') {
          // --- STEP 4: ORDER SAVE KARO ---
          saveOrderToDatabase(customerName, customerPhone, shippingAddress, cart, totalAmount, fakePaymentResponse.razorpay_payment_id);
        } else {
          showToast('Payment Verification Failed');
          placeOrderBtn.innerText = 'Place Order';
          placeOrderBtn.style.opacity = '1';
        }

      } catch (err) {
        console.error(err);
        showToast('Error processing payment');
        placeOrderBtn.innerText = 'Place Order';
        placeOrderBtn.style.opacity = '1';
      }
    });
  }
});

// Helper Function: Order Save Karna
function saveOrderToDatabase(name, phone, address, cart, total, paymentId) {
  const orderData = {
    customerName: name,
    customerPhone: phone,
    shippingAddress: address,
    orderItems: cart, 
    totalAmount: total,
    paymentMethod: 'Online (Mock)',
    paymentId: paymentId 
  };

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showToast('Payment hua par Order Save nahi hua!');
    } else {
      localStorage.removeItem('shoeonCart'); 
      // Success Page par bhejo (Order ID ke saath)
      window.location.href = `order-success.html?order_id=${data.orderNumber}`; 
    }
  })
  .catch(err => console.error(err));
}