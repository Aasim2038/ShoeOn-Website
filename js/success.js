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
    try {
        // 1. ITEMS LIST
        const itemsList = Array.isArray(order.orderItems) ? order.orderItems : [];
        if (itemsList.length === 0) {
            alert("No items found!");
            return;
        }

        // 2. CALCULATE GROSS TOTAL
        let grossTotal = 0;
        let itemsRows = '';
        let serialNumber = 1;

        itemsList.forEach((item) => {
            const unitPrice = parseFloat(item.price || item.unitPrice || 0); 
            const qty = parseInt(item.quantity || item.moq || 0);
            const packs = parseInt(item.packs || 1);
            const hsn = item.hsn || "64029990"; 

            const lineTotal = unitPrice * qty;
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
                        ${qty} piece<br>
                        <span style="color:#555; font-size:11px;">(${packs} Sets)</span>
                    </td>
                    <td style="padding:8px; border-bottom:1px solid #eee; text-align:right; font-size:12px;">₹${unitPrice.toFixed(2)}</td>
                    <td style="padding:8px; border-bottom:1px solid #eee; text-align:right; font-size:12px;">₹${lineTotal.toFixed(2)}</td>
                </tr>
            `;
        });

        // 3. SPECIAL CALCULATION LOGIC (FIX FOR 0.01 DIFFERENCE)
        // Hum wahi values use karenge jo screen par dikhni hain (toFixed(2))
        
        // A. Raw Calculations (Internal)
        const taxableRaw = grossTotal / 1.05; 
        const totalTaxRaw = grossTotal - taxableRaw;
        
        // B. Display Values (Jo Bill par print honge) - INKO FIX KARO
        const d_Gross = parseFloat(grossTotal.toFixed(2));
        
        // Requirement: Discount = Tax Amount
        const d_Discount = parseFloat(totalTaxRaw.toFixed(2)); 

        const cgstRaw = totalTaxRaw / 2;
        const sgstRaw = totalTaxRaw / 2;
        
        const d_CGST = parseFloat(cgstRaw.toFixed(2));
        const d_SGST = parseFloat(sgstRaw.toFixed(2));
        
        const d_Taxable = parseFloat(taxableRaw.toFixed(2));

        // C. Visible Total Calculation (Manual Check)
        // Formula: Gross - Discount + CGST + SGST
        // Example: 776.00 - 36.95 + 18.48 + 18.48 = 776.01
        const visibleTotal = d_Gross - d_Discount + d_CGST + d_SGST;

        // D. Grand Total (Wanted Result)
        const grandTotalRounded = Math.round(d_Gross); // Should be 776
        
        // E. Round Off (Difference between User Calc and Wanted Result)
        // 776.00 - 776.01 = -0.01
        const roundOffDiff = grandTotalRounded - visibleTotal;

        let billedToHTML = `<strong>${order.customerName}</strong>`;
        if (order.shopName && order.shopName.trim().toUpperCase() !== "GUEST SHOP" && order.shopName !== "undefined") {
            billedToHTML = `<strong style="font-size: 14px; text-transform: uppercase;">${order.shopName}</strong><br>
                            <span style="font-size: 12px; font-weight: normal;">Contact: ${order.customerName}</span>`;
        }

        // 4. HTML GENERATION
        const invoiceWindow = window.open('', '_blank');
        if (!invoiceWindow) return;

       const invoiceHTML = `
    <html>
    <head>
        <title>Invoice #${order.orderNumber}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; max-width: 850px; margin: auto; }
            .invoice-container { border: 1px solid #000; padding: 0; }
            
            .header-box { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #000; }
            
            /* FIX: Margin aur Line Height control kiya */
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
                    <p style="font-size:12px;">No: #SHO-${order.orderNumber}<br>Date: ${new Date().toLocaleDateString('en-IN')}</p>
                </div>
            </div>

           <div class="address-grid">
                <div class="address-col">
                    <strong>Billed To:</strong><br>
                    ${billedToHTML} <br>
                    Ph: ${order.customerPhone}
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
                        <th style="width:15%">Qty</th>
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

            <div style="padding:10px; font-size:11px; border-top:1px solid #000;">
                <strong>Amount in Words:</strong> ₹${grandTotalRounded} Only.
            </div>
        </div>

        <button class="btn-print" onclick="window.print()">Print Invoice</button>

    </body>
    </html>`;

        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();

    } catch (e) {
        console.error(e);
        alert("Error generating invoice");
    }
}
});