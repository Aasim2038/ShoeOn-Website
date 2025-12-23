/* =========================================
   CHECKOUT.JS (FINAL MERGED CODE - NO MISSING LINES)
   ========================================= */

// --- 1. GLOBAL VARIABLES ---
window.finalGrandTotal = 0; // Global Total Amount variable

// --- 2. CORE HELPER FUNCTIONS ---

function saveOrderToDatabase(name, phone, address, shopName, cart, total, paymentId) {
    const finalTotalAmount = parseFloat(total);

    // Cart items ko map karte waqt 'packs' ko explicit roop se add karo
    const mappedItems = cart.map((item, index) => {
        // 1. Packs aur MOQ ko pakka number banao
        const p_packs = parseInt(item.packs) || 1; 
        const p_moq = parseInt(item.moq) || 1;
        
        // 2. Quantity calculate karo (Safety ke liye)
        // Agar item.quantity pehle se hai (110) toh wahi lo, nahi toh calculate karo
        const p_qty = (item.quantity && parseInt(item.quantity) > p_packs) 
                      ? parseInt(item.quantity) 
                      : (p_packs * p_moq);

        return {
            productId: item.id || item.productId || item._id,
            name: String(item.name || item.productName || `Item ${index + 1}`),
            brand: item.brand || "N/A",
            price: parseFloat(item.unitPrice || item.price || 0),
            moq: p_moq,
            
            // --- YE HAI MAIN LINE (Server ko Packs bhejo) ---
            packs: p_packs, 
            quantity: p_qty,
            // -----------------------------------------------
            
            img: item.img // Image bhi bhejo
        };
    });

    const orderData = {
        customerName: name,
        customerPhone: phone,
        shippingAddress: address,
        shopName: shopName,
        orderItems: mappedItems, // Updated items array
        totalAmount: finalTotalAmount,
        paymentMethod: "Online (Mock)",
        paymentId: paymentId,
    };

    fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.error || !data.order) {
            showToast("Error: Order Save nahi hua!");
            return;
        }
        localStorage.removeItem("shoeonCart");
        window.location.href = `order-success.html?order_id=${data.order.orderNumber}`;
    })
    .catch((err) => {
        console.error("ORDER ERROR:", err);
        showToast("Server error during order processing.");
    });
}

// --- 3. UI RENDER FUNCTION (Old code restored) ---
function renderCheckoutSummary() {
    const cart = getCart();
    const summaryList = document.getElementById("summary-items-list");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryGst = document.getElementById("summary-gst");
    const summaryGrandTotal = document.getElementById("summary-grandtotal");

    if (!summaryList) return;

    let subtotal = 0;
    let itemsHTML = "";

    if (cart.length === 0) {
        summaryList.innerHTML =
            '<p style="text-align:center; color:#777;">Your cart is empty.</p>';
    } else {
        cart.forEach((item) => {
            const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
            const quantity = parseInt(item.quantity) || parseInt(item.moq) || 0;
            const packs = parseInt(item.packs) || 1;

            const itemTotal = unitPrice * quantity;
            subtotal += itemTotal;

            itemsHTML += `
                <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <img src="${item.img}" alt="${item.name
                }" style="width: 50px; height: 50px; border-radius: 5px;">
                    <div class="summary-item-details" style="flex: 1; margin-left: 15px;">
                        <p class="item-name" style="margin: 0; font-weight: bold;">${item.name
                }</p>
                        <p style="margin: 0; font-size: 0.85rem; color: #666;">
                            ₹${unitPrice.toFixed(
                    2
                )}/pc × ${quantity} pcs (${item.packs} Packs)
                        </p>
                    </div>
                    <p class="item-price" style="font-weight: bold;">₹${itemTotal.toFixed(
                    2
                )}</p>
                </div>`;
        });
        summaryList.innerHTML = itemsHTML;
    }

    // TAX CALCULATIONS (5% GST)
    const gstAmount = subtotal * 0.05;
    const grandTotal = subtotal + gstAmount;

    // Update Totals in UI
    if (summarySubtotal) summarySubtotal.innerText = `₹${subtotal.toFixed(2)}`;
    if (summaryGst) summaryGst.innerText = `₹${gstAmount.toFixed(2)} (5% GST)`;
    if (summaryGrandTotal)
        summaryGrandTotal.innerText = `₹${grandTotal.toFixed(2)}`;

    window.finalGrandTotal = grandTotal;
}

// --- 4. INVOICE GENERATOR FUNCTION (Restored) ---
function generateInvoice(order) {
    const invoiceWindow = window.open("", "_blank");
    const itemsToDisplay = Array.isArray(order.orderItems)
        ? order.orderItems
        : [];
        let itemsRows = "";

    itemsToDisplay.forEach((item) => {
        // --- CRITICAL FIX 2: Qty ke liye item.moq use karo ---
        const name = item.name || "Product Missing Name";
        const price = parseFloat(item.price || item.unitPrice || 0); // Price
        const qty = parseInt(item.quantity || item.qty || item.moq || 0); // FIX: moq ya quantity use karo
        const packs = parseInt(item.packs || 1);
        const itemTotal = price * qty;
        // ----------------------------------------------------

        itemsRows += `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${price.toFixed(
            2
        )}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${qty} pcs (${packs} Packs)</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${itemTotal.toFixed(
            2
        )}</td>
        </tr>
        `;
    });


    const subtotal = order.totalAmount / 1.05;
    const gst = order.totalAmount - subtotal;
        // Invoice HTML Structure (Simplified for clarity)
    const invoiceHTML = `
    <html>
    <head>
        <title>Invoice - ShoeOn</title>
        <style>/* ... (styles) ... */</style>
    </head>
    <body>
        <div class="header">
            <h1>ShoeOn B2B Wholesale</h1>
            <p>Invoice #SHO-${order.orderNumber}</p>
        </div>
        
        <div class="info">
            <div>
                <p><strong>Billed To:</strong><br>
                ${order.customerName}<br>
                Shop: ${order.shopName}<br>
                Ph: ${order.customerPhone}</p>
            </div>
            <div>
                <p><strong>Date:</strong> ${new Date(
        order.createdAt
    ).toLocaleDateString()}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Rate/pc</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>

        <div class="totals">
            <p>Total: <strong>₹${order.totalAmount.toFixed(2)}</strong></p>
        </div>

        <button class="print-btn" onclick="window.print()">Print Invoice</button>
    </body>
    </html>`;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

// --- 5. DOM CONTENT LOADED LOGIC (Events) ---
document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();

    const user = JSON.parse(localStorage.getItem("shoeonUser"));

    // Old Code Restore (Filling fields based on user object)
    if (user) {
        if (document.getElementById("name"))
            document.getElementById("name").value = user.name;
        if (document.getElementById("phone"))
            document.getElementById("phone").value = user.phone;
        if (document.getElementById("address"))
            document.getElementById(
                "address"
            ).value = `${user.shopName}, ${user.shopAddress}`;
        // Agar shopName field alag se hai, use bhi set karein (optional)
        // if (document.getElementById("shopName")) document.getElementById("shopName").value = user.shopName;
    }

    const placeOrderBtn = document.getElementById("place-order-btn");

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            // UI update
            placeOrderBtn.innerText = "Checking Details...";
            placeOrderBtn.style.opacity = "0.7";

            // CRITICAL FIX: User data ko upar define karein
            const user = JSON.parse(localStorage.getItem("shoeonUser"));

            try {
                // --- 1. Customer Details Collect Karo (Using Simple and Standard IDs) ---
                const customerName = document.getElementById("name").value;
                const customerPhone = document.getElementById("phone").value;
                const shippingAddress = document.getElementById("address").value;

                // FIX: Shop Name ko sabse safe tarike se nikalenge
                const shopNameEl = document.getElementById("shopName");
                const shopName = shopNameEl
                    ? shopNameEl.value
                    : user && user.shopName
                        ? user.shopName
                        : "Guest Shop";

                if (!customerName || !customerPhone || !shippingAddress || !shopName) {
                    throw new Error("Form details are incomplete.");
                }

                const cart = getCart();
                if (cart.length === 0) {
                    throw new Error("Cart is empty.");
                }

                // --- 2. FINAL TOTAL CHECK ---
                const totalAmount = window.finalGrandTotal || 0;

                if (totalAmount === 0) {
                    throw new Error("Cart total is zero.");
                }

                // UI update
                placeOrderBtn.innerText = "Processing Order...";

                // --- 3. MOCK PAYMENT & SAVE ---
                const fakePaymentResponse = {
                    razorpay_order_id: "mock_order_" + Math.random(),
                    razorpay_payment_id: "mock_pay_" + Math.random(),
                    razorpay_signature: "fake_signature",
                };
                const verifyData = { status: "success" }; // MOCK SUCCESS STATUS

                if (verifyData.status === "success") {
                    saveOrderToDatabase(
                        customerName,
                        customerPhone,
                        shippingAddress,
                        shopName,
                        cart,
                        totalAmount,
                        fakePaymentResponse.razorpay_payment_id
                    );
                }
            } catch (error) {
                console.error("ORDER PLACEMENT BLOCKED:", error.message, error);
                showToast("Error: " + error.message);
                placeOrderBtn.innerText = "Place Order";
                placeOrderBtn.style.opacity = "1";
            }
        });
    }
}); // <--- document.addEventListener ka closing bracket

// --- QR CODE ZOOM LOGIC ---

function openQrModal() {
    var modal = document.getElementById("qrModal");
    var img = document.getElementById("myQrImage");
    var modalImg = document.getElementById("img01");
    
    modal.style.display = "block";
    modalImg.src = img.src; // Jo choti image hai wahi badi dikhegi
}

function closeQrModal() {
    var modal = document.getElementById("qrModal");
    modal.style.display = "none";
}