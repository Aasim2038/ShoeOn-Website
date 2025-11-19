document.addEventListener('DOMContentLoaded', () => {
  
  const saleEl = document.getElementById('total-sale');
  const ordersEl = document.getElementById('total-orders');
  const productsEl = document.getElementById('total-products');

  fetch('/api/dashboard-stats')
    .then(res => res.json())
    .then(data => {
      // Numbers ko update karo
      if(data.totalSale) saleEl.innerText = `₹${data.totalSale.toLocaleString('en-IN')}`;
      if(data.orderCount) ordersEl.innerText = data.orderCount;
      if(data.productCount) productsEl.innerText = data.productCount;
    })
    .catch(err => {
      console.error('Stats Error:', err);
    });

});