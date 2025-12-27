/* =========================================
   ADMIN-ORDER-DETAIL.JS (WITH WORDS CONVERTER & SHOP NAME)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    // DOM Elements
    const orderIdEl = document.getElementById('order-id');
    const paymentIdEl = document.getElementById('payment-id');
    const customerNameEl = document.getElementById('customer-name');
    const customerPhoneEl = document.getElementById('customer-phone');
    const customerAddressEl = document.getElementById('customer-address');
    const orderStatusEl = document.getElementById('order-status');
    const itemsTableBody = document.getElementById('order-items-list'); 
    const updateStatusBtn = document.getElementById('update-status-btn');
    const printInvoiceBtn = document.getElementById('print-invoice-btn');

    if (!orderId) {
        document.body.innerHTML = "<h2 style='color:red; text-align:center; margin-top:20px;'>Error: Order ID Missing</h2>";
        return;
    }

    // --- 1. FETCH ORDER ---
    fetch(`/api/orders/${orderId}`)
        .then(res => {
            if (!res.ok) throw new Error('Order not found');
            return res.json();
        })
        .then(order => {
            renderOrderDetails(order);
        })
        .catch(err => console.error(err));

    // --- 2. RENDER DETAILS ---
    function renderOrderDetails(order) {
        if(orderIdEl) orderIdEl.innerText = `#${order.orderNumber}`;
        if(paymentIdEl) paymentIdEl.innerText = order.paymentId || 'COD/Manual';
        
        // Admin Panel pe Customer Name hi rehne do (Invoice me change karenge)
        if(customerNameEl) customerNameEl.innerText = order.customerName;
        if(customerPhoneEl) customerPhoneEl.innerText = order.customerPhone;
        
        let fullAddress = order.shippingAddress || '';
        if (order.city) fullAddress += `, ${order.city}`;
        if (order.pincode) fullAddress += ` - ${order.pincode}`;
        if(customerAddressEl) customerAddressEl.innerText = fullAddress;
        
        if(orderStatusEl) orderStatusEl.value = order.status;

        // --- Render Admin Table ---
        if (itemsTableBody) {
            itemsTableBody.innerHTML = '';
            const items = order.orderItems || [];
            
            items.forEach(item => {
                const moq = parseInt(item.moq) || 1;
                let packs = parseInt(item.packs) || 0;
                let totalQty = parseInt(item.quantity || item.qty) || 0;

                if (totalQty > moq && (packs <= 1)) {
                    packs = Math.floor(totalQty / moq);
                }
                if (totalQty === 0 || totalQty < moq) {
                    packs = packs || 1;
                    totalQty = packs * moq;
                }

                const price = parseFloat(item.price || 0);

                const rowHTML = `
                <tr>
                    <td>
                        <div class="item-info">
                            <img src="${item.img}" onerror="this.style.display='none'" style="width:40px; margin-right:10px;">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${totalQty} Pairs <small>(${packs} Packs x ${moq})</small></td>
                    <td>₹${price.toFixed(2)}</td>
                    <td>₹${(price * totalQty).toFixed(2)}</td>
                </tr>`;
                itemsTableBody.innerHTML += rowHTML;
            });
        }

        // --- Invoice Button Click ---
        if (printInvoiceBtn) {
            const newBtn = printInvoiceBtn.cloneNode(true);
            printInvoiceBtn.parentNode.replaceChild(newBtn, printInvoiceBtn);
            newBtn.addEventListener('click', () => generateSuccessStyleInvoice(order));
        }
    }

    // --- 3. STATUS UPDATE LOGIC ---
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', () => {
            const newStatus = orderStatusEl.value;
            updateStatusBtn.innerText = 'Updating...';
            fetch(`/api/orders/status/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            .then(res => res.json())
            .then(() => {
                alert('Status Updated!');
                window.location.reload();
            });
        });
    }
});


/* =================================================================
   INVOICE GENERATOR (UPDATED: SHOP NAME & WORDS)
   ================================================================= */
function generateSuccessStyleInvoice(order) {
    try {
        const items = order.orderItems || [];
        if (items.length === 0) { alert("No items found"); return; }

        let itemsRows = '';
        let grossTotal = 0;
        let serialNumber = 1;

        // --- ITEM LOOP ---
        items.forEach(item => {
            const unitPrice = parseFloat(item.price || 0);
            const hsn = item.hsn || "64029990";

            const moq = parseInt(item.moq) || 1;
            let packs = parseInt(item.packs) || 0;
            let totalQty = parseInt(item.quantity || item.qty) || 0;

            if (totalQty > moq && packs <= 1) {
                packs = Math.floor(totalQty / moq);
            }
            if (totalQty === 0) {
                packs = packs || 1;
                totalQty = packs * moq;
            }

            const lineTotal = unitPrice * totalQty;
            grossTotal += lineTotal;

            itemsRows += `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee; font-size:12px; text-align:center;">${serialNumber++}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; font-size:12px;">
                    <strong>${item.name}</strong><br>
                    <span style="color:#555; font-size:11px;">Brand: ${item.brand || 'N/A'}</span>
                </td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:center; font-size:12px;">${hsn}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:center; font-size:12px;">
                    ${totalQty} Pairs<br>
                    <span style="color:#555; font-size:11px;">(${packs} Sets)</span>
                </td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:right; font-size:12px;">₹${unitPrice.toFixed(2)}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:right; font-size:12px;">₹${lineTotal.toFixed(2)}</td>
            </tr>`;
        });

        // --- CALCULATION LOGIC ---
        const taxableRaw = grossTotal / 1.05; 
        const totalTaxRaw = grossTotal - taxableRaw;
        
        const d_Gross = parseFloat(grossTotal.toFixed(2));
        const d_Discount = parseFloat(totalTaxRaw.toFixed(2)); 

        const cgstRaw = totalTaxRaw / 2;
        const sgstRaw = totalTaxRaw / 2;
        
        const d_CGST = parseFloat(cgstRaw.toFixed(2));
        const d_SGST = parseFloat(sgstRaw.toFixed(2));

        const visibleTotal = d_Gross - d_Discount + d_CGST + d_SGST;
        const grandTotalRounded = Math.round(d_Gross); 
        const roundOffDiff = grandTotalRounded - visibleTotal;

        // 🔥 NEW: Convert Amount to Words
        const amountInWords = numberToWords(grandTotalRounded);

        // 🔥 NEW: Shop Name Logic (Agar shopName empty hai to CustomerName dikhayega)
       let billedToName = order.customerName; 
        let contactPerson = '';

        // Agar Shop Name asli hai (Empty nahi hai AUR "Guest Shop" nahi hai)
        if (order.shopName && order.shopName.trim().toUpperCase() !== "GUEST SHOP" && order.shopName !== "undefined") {
            billedToName = order.shopName; // To Dukaan ka naam bada dikhao
            // Aur Customer ko Contact Person bana do
            contactPerson = `<br><span style="font-size:11px; font-weight:normal;">Contact: ${order.customerName}</span>`; 
        }

        // --- HTML TEMPLATE ---
        const invoiceHTML = `
        <html>
        <head>
            <title>Invoice #${order.orderNumber}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; max-width: 850px; margin: auto; }
                .invoice-container { border: 1px solid #000; padding: 0; }
                
                .header-box { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #000; }
                
                .company-details h2 { margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 800; line-height: 1; }
                .company-details p { margin: 2px 0; line-height: 1.2; }
                
                .address-grid { display: flex; border-bottom: 1px solid #000; }
                .address-col { width: 50%; padding: 10px; font-size: 13px; border-right: 1px solid #000; }
                .address-col:last-child { border-right: none; }

                table { width: 100%; border-collapse: collapse; }
                th { background: #f0f0f0; border-bottom: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; border-right: 1px solid #ccc; }
                th:last-child { border-right: none; text-align: right; }
                td { border-right: 1px solid #eee; }
                td:last-child { border-right: none; }
                
                .totals-container { display: flex; justify-content: flex-end; border-top: 1px solid #000; }
                .totals-table { width: 55%; border-collapse: collapse; }
                .totals-table td { padding: 4px 10px; text-align: right; font-size: 13px; }
                
                .grand-total-row td { 
                    border-top: 1px solid #000; font-weight: bold; font-size: 16px; padding: 10px; background: #f9f9f9;
                }
                .btn-print { background: #333; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 20px auto; display: block; }
                @media print { .btn-print { display: none; } }
            </style>
        </head>
        <body>

            <div class="invoice-container">
                <div class="header-box">
                    <div class="company-details">
                        <h2>ShoeOn</h2>
                        <p style="font-size: 14px; font-weight: bold; color: #555;">We Connects You</p>
                    </div>
                    <div style="text-align: right;">
                        <h3>TAX INVOICE</h3>
                        <p style="font-size:12px;">No: #SHO-${order.orderNumber}<br>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>

                <div class="address-grid">
                    <div class="address-col">
                        <strong>Billed To:</strong><br>
                        <span style="font-size:14px; font-weight:bold; text-transform:uppercase;">${billedToName}</span>
                        ${contactPerson}
                        <br>Ph: ${order.customerPhone}
                    </div>
                    <div class="address-col">
                        <strong>Shipped To:</strong><br>${order.shippingAddress || 'Same as Billing'}<br>State: 27 (MH)
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width:5%">SN</th>
                            <th style="width:40%">Description</th>
                            <th style="width:10%">HSN</th>
                            <th style="width:15%">Qty / Packs</th>
                            <th style="width:15%; text-align:right;">Rate</th>
                            <th style="width:15%; text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody style="min-height: 200px;">
                        ${itemsRows}
                        <tr><td colspan="6" style="height: 40px;"></td></tr>
                    </tbody>
                </table>

                <div class="totals-container">
                    <table class="totals-table">
                        <tr>
                            <td>Total Amount:</td>
                            <td>₹${d_Gross.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Less: Discount (4.76%):</td>
                            <td>- ₹${d_Discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Add: CGST (2.5%):</td>
                            <td>+ ₹${d_CGST.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Add: SGST (2.5%):</td>
                            <td>+ ₹${d_SGST.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Round Off:</td>
                            <td>${roundOffDiff > 0 ? '+' : ''}${roundOffDiff.toFixed(2)}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td>Grand Total:</td>
                            <td>₹${grandTotalRounded.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <div style="padding:10px; font-size:11px; border-top:1px solid #000; background:#fcfcfc;">
                    <strong>Amount in Words:</strong> ${amountInWords} Only.
                </div>
            </div>

            <button class="btn-print" onclick="window.print()">Print Invoice</button>

        </body>
        </html>`;

        const win = window.open('', '_blank');
        win.document.write(invoiceHTML);
        win.document.close();

    } catch (e) {
        console.error(e);
        alert("Invoice generation failed");
    }
}

// ==========================================
// 🛠️ HELPER: NUMBER TO WORDS (INDIAN FORMAT)
// ==========================================
function numberToWords(num) {
    if (num === 0) return "Zero";
    
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

    function inWords(n) {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 === 0 ? "" : "and " + inWords(n % 100));
        
        // Indian System: Lakhs & Crores
        if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? inWords(n % 1000) : "");
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? inWords(n % 100000) : "");
        
        return inWords(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? inWords(n % 10000000) : "");
    }

    return inWords(num).trim();
}