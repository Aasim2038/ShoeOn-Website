/* =========================================
   CHECKOUT.JS (Sirf checkout.html par chalega)
   ========================================= */

// Is function ko global.js se access milega
function renderCheckoutSummary() {
  const cart = getCart(); // getCart() global.js me hai
  
  const summaryList = document.getElementById('summary-items-list');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryGrandTotal = document.getElementById('summary-grandtotal');

  if (!summaryList) return; // Agar page par summary box nahi hai

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
          <p class="item-price">${item.price}</p>
        </div>
      `;
    });
    summaryList.innerHTML = itemsHTML;
  }
  
  summarySubtotal.innerText = `₹${total.toFixed(2)}`;
  summaryGrandTotal.innerText = `₹${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Page load hote hi summary update karo
  renderCheckoutSummary();
});