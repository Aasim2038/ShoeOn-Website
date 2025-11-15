/* =========================================
   ADMIN-PRODUCTS.JS (Edit + Delete Logic)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const tableBody = document.getElementById('product-list-body');

  // --- FUNCTION 1: Products laana aur table bharna ---
  function loadProducts() {
    if (!tableBody) return; 

    // Cache fix (Hamesha naya data laao)
    const fetchOptions = {
      method: 'GET',
      cache: 'no-store' 
    };

    fetch('/api/products', fetchOptions) 
      .then(response => response.json())
      .then(products => {
        tableBody.innerHTML = ''; // Table khaali karo
        
        if (products.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found. Add one!</td></tr>';
          return;
        }

        products.forEach(product => {
          const row = `
            <tr>
              <td>
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.name}">
              </td>
              <td>${product.name}</td>
              <td>${product.brand}</td>
              <td>${product.category}</td>
              <td>₹${product.salePrice}</td>
              <td>${product.moq} Pairs</td>
              <td>
                <button class="btn-action btn-edit" data-id="${product._id}"><i class="fa-solid fa-pencil"></i> Edit</button>
                <button class="btn-action btn-delete" data-id="${product._id}"><i class="fa-solid fa-trash"></i> Delete</button>
              </td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
        
        // Table bharne ke baad, buttons par click listener lagao
        addDeleteListeners(); // Delete button logic
        addEditListeners();   // <-- YEH NAYA ADD HUA HAI
        
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      });
  }

  // --- FUNCTION 2: DELETE LOGIC ---
  function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-delete').dataset.id;
        if (confirm('Kya aap sach me is product ko delete karna chahte hain?')) {
          fetch(`/api/products/${id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              showToast(data.error); 
            } else {
              showToast(data.message);
              // location.reload(); // Isse abhi chhod dete hain
              loadProducts(); // Table refresh
            }
          })
          .catch(err => showToast('Delete karne me error aaya.'));
        }
      });
    });
  }

  // --- FUNCTION 3: (NAYA) EDIT LOGIC ---
  function addEditListeners() {
    // Saare edit buttons dhoondo
    const editButtons = document.querySelectorAll('.btn-edit');
    
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Button se product ID nikalo
        const id = e.target.closest('.btn-edit').dataset.id;
        
        // User ko naye page par bhej do ID ke saath
        window.location.href = `admin-edit-product.html?id=${id}`;
      });
    });
  }

  // Page load hote hi products load karo
  loadProducts();

});