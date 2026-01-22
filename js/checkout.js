/* =========================================
   CHECKOUT.JS (FULL COMPLETE CODE - FIXED)
   ========================================= */

// --- 1. GLOBAL VARIABLES ---
window.finalGrandTotal = 0; 
window.finalAdvanceAmount = 0;

// --- 2. CORE HELPER FUNCTIONS ---

// A. SAVE ORDER FUNCTION (Database me bhejne ke liye)
function saveOrderToDatabase(name, phone, address, shopName, cart, total, paymentId, paymentMethod, status, advancePaid, balanceAmount) {
    const finalTotalAmount = parseFloat(total);

    const mappedItems = cart.map((item, index) => {
        const p_packs = parseInt(item.packs) || 1; 
        const p_moq = parseInt(item.moq) || 1;
        
        const p_qty = (item.quantity && parseInt(item.quantity) > p_packs) 
                      ? parseInt(item.quantity) 
                      : (p_packs * p_moq);

        return {
            productId: item.id || item.productId || item._id,
            name: String(item.name || item.productName || `Item ${index + 1}`),
            brand: item.brand || "N/A",
            price: parseFloat(item.unitPrice || item.price || 0),
            moq: p_moq,
            packs: p_packs, 
            quantity: p_qty,
            img: item.img
        };
    });

    const orderData = {
        customerName: name,
        customerPhone: phone,
        shippingAddress: address,
        shopName: shopName,
        orderItems: mappedItems,
        totalAmount: finalTotalAmount,
        
        // 🔥 Payment Fields
        advancePaid: parseFloat(advancePaid) || 0,
        balanceAmount: parseFloat(balanceAmount) || 0,
        paymentMethod: paymentMethod, 
        paymentId: paymentId,
        status: status || "Pending"
    };

    fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
    })
    .then((res) => res.json())
   .then((data) => {
        console.log("SERVER RESPONSE:", data);

        if (data.error || !data.order) {
            alert("Error: " + (data.error || "Order failed"));
            const btn = document.getElementById('place-order-btn');
            if(btn) { btn.disabled = false; btn.innerText = "Try Again"; }
            return;
        }
        
        // Success: Cart clear karo
        localStorage.removeItem("shoeonCart");
        
        // Success page par bhejo
        setTimeout(() => {
             // Agar orderNumber nahi hai to undefined mat bhejo, 0000 bhejo
             const orderNo = data.order.orderNumber || "0000";
             window.location.href = `order-success.html?order_id=${orderNo}`;
        }, 1000);
    })
    .catch((err) => {
        console.error("ORDER ERROR:", err);
        alert("Server error during order processing.");
        const btn = document.getElementById('place-order-btn');
        if(btn) { btn.disabled = false; btn.innerText = "Try Again"; }
    });
}

// B. RENDER CHECKOUT SUMMARY (Cart List Dikhane ke liye)
function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('shoeonCart')) || [];
    const summaryList = document.getElementById("summary-items-list");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryGst = document.getElementById("summary-gst");
    const summaryGrandTotal = document.getElementById("summary-grandtotal");

    if (!summaryList) return;

    let subtotal = 0;
    let itemsHTML = "";

    if (cart.length === 0) {
        summaryList.innerHTML = '<p style="text-align:center; color:#777;">Your cart is empty.</p>';
    } else {
        cart.forEach((item) => {
            const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
            const quantity = parseInt(item.quantity) || parseInt(item.moq) || 0;
            const packs = parseInt(item.packs) || 1;

            const itemTotal = unitPrice * quantity;
            subtotal += itemTotal;

            itemsHTML += `
                <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <img src="${item.img}" style="width: 50px; height: 50px; border-radius: 5px;">
                    <div class="summary-item-details" style="flex: 1; margin-left: 15px;">
                        <p class="item-name" style="margin: 0; font-weight: bold;">${item.name}</p>
                        <p style="margin: 0; font-size: 0.85rem; color: #666;">
                            ₹${unitPrice.toFixed(2)}/pc × ${quantity} pcs (${packs} Packs)
                        </p>
                    </div>
                    <p class="item-price" style="font-weight: bold;">₹${itemTotal.toFixed(2)}</p>
                </div>`;
        });
        summaryList.innerHTML = itemsHTML;
    }

    const gstAmount = subtotal * 0.05;
    const grandTotal = subtotal + gstAmount;

    if (summarySubtotal) summarySubtotal.innerText = `₹${subtotal.toFixed(2)}`;
    if (summaryGst) summaryGst.innerText = `₹${gstAmount.toFixed(2)} (5% GST)`;
    if (summaryGrandTotal) summaryGrandTotal.innerText = `₹${grandTotal.toFixed(2)}`;

    window.finalGrandTotal = grandTotal;
}

// --- UPDATED INVOICE GENERATOR (With Advance & Balance) ---
function generateInvoice(order) {
    if(!order || !order.orderNumber) {
        alert("Order ID missing. Cannot generate invoice.");
        return;
    }

    const invoiceWindow = window.open("", "_blank");
    const itemsToDisplay = Array.isArray(order.orderItems) ? order.orderItems : [];
    let itemsRows = "";

    itemsToDisplay.forEach((item) => {
        const name = item.name || "Product";
        const price = parseFloat(item.price || item.unitPrice || 0);
        const qty = parseInt(item.quantity || item.qty || item.moq || 0);
        const packs = parseInt(item.packs || 1);
        const itemTotal = price * qty;

        itemsRows += `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${qty} pcs (${packs} Packs)</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${itemTotal.toFixed(2)}</td>
        </tr>`;
    });

    // 🔥 Calculations for Invoice
    const totalAm = parseFloat(order.totalAmount) || 0;
    const advance = parseFloat(order.advancePaid) || 0;
    const balance = parseFloat(order.balanceAmount) || (totalAm - advance);

    const invoiceHTML = `
    <html>
    <head>
        <title>Invoice - ShoeOn</title>
        <style>
            body{font-family:sans-serif; padding:20px;} 
            table{width:100%; border-collapse:collapse; margin-top: 20px;} 
            th{text-align:left; background:#eee; padding:10px;}
            .totals { margin-top: 20px; text-align: right; width: 100%; }
            .totals p { margin: 5px 0; font-size: 14px; }
            .totals h3 { border-top: 2px solid #333; display: inline-block; padding-top: 5px; margin-top: 5px; }
            .badge { background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
            .badge-warn { background: #ffc107; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header" style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin:0;">ShoeOn B2B Wholesale</h1>
            <p style="margin:5px 0;">Invoice #SHO-${order.orderNumber}</p>
            <p style="font-size: 12px; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div class="info" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
                <strong>Billed To:</strong><br>
                ${order.customerName}<br>
                ${order.shopName || ""}<br>
                Phone: ${order.customerPhone}
            </div>
            <div style="text-align: right;">
                <strong>Payment Mode:</strong><br>
                ${order.paymentMethod === 'online' ? 'Online / UPI' : 'Cash / Agent'}<br>
                <span style="font-size:12px; color:#555;">ID: ${order.paymentId || 'N/A'}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr><th>Product</th><th>Rate</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>${itemsRows}</tbody>
        </table>

        <div class="totals">
            <p>Subtotal: ₹${(totalAm / 1.05).toFixed(2)}</p>
            <p>GST (5%): ₹${(totalAm - (totalAm / 1.05)).toFixed(2)}</p>
            <h4 style="margin: 10px 0;">Grand Total: ₹${totalAm.toFixed(2)}</h4>
            
            <p style="color: green;">
                Less: Advance Paid <span class="badge">Received</span> : - ₹${advance.toFixed(2)}
            </p>
            <h3 style="color: #d35400;">
                Balance to Pay: ₹${balance.toFixed(2)}
            </h3>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #777;">
            <p>Thank you for your business!</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; margin-top: 10px;">Print Invoice</button>
        </div>
    </body>
    </html>`;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

// D. ADVANCE CALCULATION LOGIC (Dynamic & Corrected)
function updatePaymentBreakdown(userOverride = null) {
    const cart = JSON.parse(localStorage.getItem('shoeonCart')) || [];
    
    // Agar naya user data aaya hai to wo use karo, warna LocalStorage wala
    let user = userOverride;
    if (!user) {
        user = JSON.parse(localStorage.getItem('shoeonUser'));
    }

    // 🔥 DYNAMIC PERCENTAGE (Naya data aate hi change hoga)
    const userAdvanceRate = (user && user.advancePercent) ? parseInt(user.advancePercent) : 20;

    let total = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price || item.unitPrice || 0);
        const qty = parseInt(item.quantity || 1);
        total += price * qty;
    });

    const totalWithGst = total + (total * 0.05);

    // Calculation
    const advanceAmount = Math.ceil(totalWithGst * (userAdvanceRate / 100)); 
    const balanceAmount = totalWithGst - advanceAmount;

    // HTML Update
    const totalEl = document.getElementById('summary-total');
    const advanceEl = document.getElementById('summary-advance');
    const balanceEl = document.getElementById('summary-balance');
    const qrAmountEl = document.getElementById('qr-pay-amount');
    
    // Text Update
    const advanceLabel = document.querySelector("#summary-advance")?.previousElementSibling;
    if(advanceLabel) advanceLabel.innerText = `Advance to Pay Now (${userAdvanceRate}%):`;

    const qrHeader = document.querySelector("#qr-section h3");
    if(qrHeader) qrHeader.innerText = `Pay ${userAdvanceRate}% Advance`;

    if (totalEl) totalEl.innerText = `₹${totalWithGst.toFixed(2)}`;
    if (advanceEl) advanceEl.innerText = `₹${advanceAmount}`;
    if (balanceEl) balanceEl.innerText = `₹${balanceAmount.toFixed(2)}`;
    if (qrAmountEl) qrAmountEl.innerText = `₹${advanceAmount}`;

    window.finalAdvanceAmount = advanceAmount;
}

// E. QR ZOOM FUNCTIONS
function openQrModal() {
    var modal = document.getElementById("qrModal");
    var img = document.getElementById("myQrImage");
    var modalImg = document.getElementById("img01");
    if(modal && img && modalImg) {
        modal.style.display = "block";
        modalImg.src = img.src;
    }
}
function closeQrModal() {
    var modal = document.getElementById("qrModal");
    if(modal) modal.style.display = "none";
}


// --- 3. MAIN LOGIC (DOM LOADED) ---
document.addEventListener("DOMContentLoaded", () => {
    
    // Elements
    const placeOrderBtn = document.getElementById("place-order-btn");
    const paymentModeContainer = document.getElementById('payment-mode-container');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const qrSection = document.getElementById('qr-section');
    const cashSection = document.getElementById('cash-section');
    const onlineInput = document.getElementById('payment-ref-online');
    const cashInput = document.getElementById('payment-ref-cash');

    // Initial Render
    renderCheckoutSummary();

    // --- HELPER: UI UPDATE FUNCTION (Jo turant screen badal dega) ---
    function refreshUI(currentUser) {
        if (!currentUser) return;

        console.log("REFRESHING UI... Cash Allowed:", currentUser.isCashAllowed, "Percent:", currentUser.advancePercent);

        // 1. Dropdown Toggle (Sabse Important)
        if (currentUser.isCashAllowed) {
            if(paymentModeContainer) paymentModeContainer.style.display = 'block'; 
        } else {
            // Permission hat gayi -> Force Online
            if(paymentModeContainer) paymentModeContainer.style.display = 'none'; 
            if(paymentMethodSelect) paymentMethodSelect.value = 'online';
            if(qrSection) qrSection.style.display = 'block';
            if(cashSection) cashSection.style.display = 'none';
        }

        // 2. Form Fill
        if (document.getElementById("name")) document.getElementById("name").value = currentUser.name || "";
        if (document.getElementById("phone")) document.getElementById("phone").value = currentUser.phone || "";
        if (document.getElementById("address")) {
            const sName = currentUser.shopName || ""; 
            const sAddr = currentUser.shopAddress || "";
            let finalAddr = sName;
            if (sName && sAddr) finalAddr += ", " + sAddr;
            else if (!sName) finalAddr = sAddr;
            document.getElementById("address").value = finalAddr;
        }

        // 3. Percentage Recalculate
        updatePaymentBreakdown(currentUser);
    }

    // --- STEP A: Pehle Purane Data se Load karo (Fast) ---
    let localUser = JSON.parse(localStorage.getItem("shoeonUser"));
    if (localUser) {
        refreshUI(localUser);
    }

    // --- STEP B: Background me Naya Data Mangwao (Cache Fix ke sath) ---
    const token = localStorage.getItem('token'); 
    
    // 🔍 DEBUG 1: Token Check
    if (!token) {
        // alert("❌ ERROR: Token nahi mila! Iska matlab aap Logged In nahi ho.");
    } 
    else {
        // alert("✅ Token Mil gaya! Server ko call kar raha hoon..."); // Step 1 Pass

        fetch(`/api/user/profile?t=${Date.now()}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        })
        .then(res => {
            // 🔍 DEBUG 2: Response Check
            if (!res.ok) {
                alert(`❌ Server Error! Status Code: ${res.status} (Check Server Console)`);
                throw new Error(`Server Error: ${res.status}`);
            }
            return res.json();
        })
        .then(freshUser => {
            // 🔍 DEBUG 3: Data Check
            // alert(`🎉 SUCCESS! Data Aaya: Advance=${freshUser.advancePercent}% | Cash=${freshUser.isCashAllowed}`); 
            
            if (freshUser && !freshUser.error) {
                // Naya data save karo
                localStorage.setItem('shoeonUser', JSON.stringify(freshUser));
                
                // UI Update karo
                refreshUI(freshUser); 
            } else {
                alert("❌ Data Aaya par usme Error hai: " + JSON.stringify(freshUser));
            }
        })
        .catch(err => {
            // 🔍 DEBUG 4: Fetch Failure
            alert("❌ FETCH FAILED: " + err.message + "\n(Kya Server chal raha hai?)");
            console.error("Fetch Error:", err);
        });
    }

    // --- Listeners ---
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', () => {
            if (paymentMethodSelect.value === 'cash') {
                if(qrSection) qrSection.style.display = 'none';
                if(cashSection) cashSection.style.display = 'block';
            } else {
                if(qrSection) qrSection.style.display = 'block';
                if(cashSection) cashSection.style.display = 'none';
            }
        });
    }

    // --- 🛡️ NEW VALIDATION LOGIC (BUTTON LOCK) ---
    function validateForm() {
        // Mode check karo (Online ya Cash)
        const mode = (paymentMethodSelect && paymentModeContainer.style.display !== 'none') 
                     ? paymentMethodSelect.value 
                     : 'online';
        
        let isValid = false;

        // 1. Agar 'Online' hai to UTR check karo (5 digit se zyada)
        if (mode === 'online') {
            const utr = onlineInput ? onlineInput.value.trim() : "";
            if (utr.length >= 5) isValid = true;
        } 
        // 2. Agar 'Cash' hai to Note check karo (3 letter se zyada)
        else if (mode === 'cash') {
            const note = cashInput ? cashInput.value.trim() : "";
            if (note.length >= 3) isValid = true;
        }

        // Button Enable/Disable Logic
        const btn = document.getElementById("place-order-btn");
        if (btn) {
            if (isValid) {
                btn.disabled = false;
                btn.style.background = '#333'; // Active Color (Black)
                btn.style.cursor = 'pointer';
                btn.innerText = "Place Order Now";
            } else {
                btn.disabled = true;
                btn.style.background = '#ccc'; // Disabled Color (Grey)
                btn.style.cursor = 'not-allowed';
                btn.innerText = mode === 'online' ? "Enter UTR to Continue" : "Enter Agent Name";
            }
        }
    }

    // Input par nazar rakho (Type karte hi button khulega)
    if (onlineInput) onlineInput.addEventListener('input', validateForm);
    if (cashInput) cashInput.addEventListener('input', validateForm);
    
    // Dropdown badalne par bhi check karo
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', () => {
            validateForm();
        });
    }

    // Page load hote hi ek baar run karo taaki button shuru me Grey ho
    validateForm();

    // --- PLACE ORDER BUTTON LOGIC (FULL) ---
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            // Click karte waqt Latest Data uthao
            const latestUser = JSON.parse(localStorage.getItem("shoeonUser"));

            const customerName = document.getElementById("name").value;
            const customerPhone = document.getElementById("phone").value;
            const shippingAddress = document.getElementById("address").value;
            
            // Shop Name Check
            const shopNameEl = document.getElementById("shopName");
            let shopName = "Guest Shop";
            if(shopNameEl) shopName = shopNameEl.value;
            else if (latestUser && latestUser.shopName) shopName = latestUser.shopName;

            if (!customerName || !customerPhone || !shippingAddress) {
                alert("Please fill name, phone, and address.");
                return;
            }

            const cart = JSON.parse(localStorage.getItem('shoeonCart')) || [];
            if (cart.length === 0) {
                alert("Cart is empty.");
                return;
            }

            // Mode Check (Safe)
            const mode = (paymentMethodSelect && paymentModeContainer.style.display !== 'none') 
                         ? paymentMethodSelect.value 
                         : 'online';

            let finalPaymentId = "";
            let finalMethodName = "";
            let finalStatus = "";
            let advanceToSave = 0;
            let balanceToSave = 0;

            const totalAmount = window.finalGrandTotal || 0;
            const calculatedAdvance = window.finalAdvanceAmount || 0;
            const userRate = (latestUser && latestUser.advancePercent) ? latestUser.advancePercent : 20;

            if (mode === 'cash') {
                // CASH LOGIC
                const cashNote = cashInput ? cashInput.value.trim() : "Pay Later";
                
                // 🔥 SECURITY: ID me likh do ki ye user ka claim hai
                finalPaymentId = "CLAIMED_CASH: " + cashNote; 
                
                finalMethodName = "Agent / Pay Later";
                
                // 🔥 IMPORTANT: Status 'Processing' mat rakho, 'Pending' rakho
                // Taaki Admin panel me aapko dikhe ki paisa verify karna baki hai
                finalStatus = "Pending Verification"; 
                
                // Calculation waisi hi rahegi
                advanceToSave = calculatedAdvance; 
                balanceToSave = totalAmount - advanceToSave;

            }else {
                // ONLINE LOGIC
                const utr = onlineInput ? onlineInput.value.trim() : "";
                if(!utr || utr.length < 5) {
                    alert("Please enter valid Transaction ID (UTR)");
                    return;
                }
                finalPaymentId = utr;
                finalMethodName = `Online UPI (${userRate}% Advance)`;
                finalStatus = "Pending Verification";
                
                advanceToSave = calculatedAdvance;
                balanceToSave = totalAmount - advanceToSave;
            }

            // Disable button
            placeOrderBtn.innerText = "Placing Order...";
            placeOrderBtn.disabled = true;

            // Final Call
            saveOrderToDatabase(
                customerName,
                customerPhone,
                shippingAddress,
                shopName,
                cart,
                totalAmount,
                finalPaymentId,   
                finalMethodName,  
                finalStatus,      
                advanceToSave,
                balanceToSave
            );
        });
    }
});