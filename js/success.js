// js/success.js (Final Cleaned Code)

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Variables & Elements ---
    const params = new URLSearchParams(window.location.search);
    const orderNo = params.get('order_id');
    const displayId = document.getElementById('display-order-id');
    const invoiceBtn = document.getElementById('view-invoice-btn');

    // --- 2. Initial Setup (Order ID Display) ---
    if (orderNo && displayId) { 
        displayId.innerText = `Order ID: #SHO-${orderNo}`; // FIX: Yahan se Order ID page par dikhega
    }

    // --- 3. Invoice Button Click Listener ---
  invoiceBtn.addEventListener('click', () => {
        if (!orderNo) {
            alert("Order ID missing. Cannot generate invoice.");
            return;
        }

        invoiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

        // Prefix hata kar sirf number bhejo (clean handling)
        let cleanedOrderNo = orderNo.replace('SH-', '').replace('#SHO-', '').trim();
        
        // Backend API call (Order Details ke liye)
        fetch(`/api/orders/details/${cleanedOrderNo}`)
            .then(res => {
                if (!res.ok) {
                    // Agar server 404/500 de raha hai, toh error throw karo
                    throw new Error("Order details not found or Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data.order) {
                    generateDigitalInvoice(data.order);
                    invoiceBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> View & Download Invoice';
                } else {
                    throw new Error("Order data incomplete or empty.");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error: Order details load nahi ho saki. Naya order place karke try karein.");
                invoiceBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> View & Download Invoice';
            });
    });

    // --- 4. generateDigitalInvoice Function (Same as before) ---
    function generateDigitalInvoice(order) {
    // CRITICAL FIX: Ensure 'items' is an array, checking for orderItems
    const itemsList = Array.isArray(order.orderItems) ? order.orderItems : [];
    
    const invoiceWindow = window.open('', '_blank');
    let itemsRows = '';

    itemsList.forEach(item => {
        // FIX 1: Qty/Price properties ko robustly access karein
        const price = parseFloat(item.price || item.unitPrice || 0);
        const qty = parseInt(item.quantity || item.moq || 0); // Use moq/quantity
        const packs = parseInt(item.packs || 1); 

        const itemSum = (price * qty).toFixed(2);
        
        // FIX 2: Template ko update karo taaki 'Rate/pc' bhi dikhe
        itemsRows += `
            <tr>
                <td style="padding:10px; border-bottom:1px solid #eee;">${item.name}</td>
                <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${qty} pcs (${packs} Packs)</td>
                <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">₹${itemSum}</td>
            </tr>
        `;
    });

    // ... (rest of the HTML content remains the same) ...

    const invoiceHTML = `
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${order.orderNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 15px; margin: 0; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #e84c3d; padding-bottom: 10px; margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; line-height: 1.5; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f4f4f4; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            .totals { text-align: right; margin-top: 20px; font-size: 16px; border-top: 1px solid #eee; padding-top: 10px; }
            .btn-print { background: #e84c3d; color: white; padding: 15px; border: none; width: 100%; font-weight: bold; margin-top: 30px; border-radius: 5px; font-size: 16px; cursor: pointer; }
            @media print { .btn-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h2 style="margin:0;">ShoeOn Wholesale</h2>
            <p style="margin:5px 0;">Invoice #SHO-${order.orderNumber}</p>
        </div>
        <div class="customer-info">
            <strong>Bill To:</strong><br>
            ${order.customerName}<br>
            Shop: ${order.shopName || order.shippingAddress.split(',')[0].trim() || 'N/A'}<br>
            Phone: ${order.customerPhone}
        </div>
        <table>
            <thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>${itemsRows}</tbody>
        </table>
        <div class="totals">
            <p style="margin:5px 0;">Subtotal: ₹${(order.totalAmount / 1.05).toFixed(2)}</p>
            <p style="margin:5px 0;">GST (5%): ₹${(order.totalAmount - (order.totalAmount / 1.05)).toFixed(2)}</p>
            <p style="margin:5px 0; font-size: 18px; color: #e84c3d;"><strong>Grand Total: ₹${order.totalAmount.toFixed(2)}</strong></p>
        </div>
        <button class="btn-print" onclick="window.print()">Download / Save PDF</button>
    </body>
    </html>`;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close(); // Black page fix: Document ko close karna
}
});