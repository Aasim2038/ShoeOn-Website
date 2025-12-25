/* =========================================
   REGISTER.JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.getElementById('register-form');
  const messageDiv = document.getElementById('auth-message');

  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // 1. Data jama karo
      const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        shopName: document.getElementById('shopName').value,
        shopAddress: document.getElementById('shopAddress').value,
        gstNumber: document.getElementById('gstNumber').value
      };
      
      messageDiv.innerText = 'Registering...';
      messageDiv.style.color = 'blue';
      
      // 2. Server ko bhejo
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          messageDiv.innerText = data.error;
          messageDiv.style.color = 'red';
        } else {
          // Success!
          messageDiv.innerText = 'Registration Successful! Please wait for Admin approval.';
          messageDiv.style.color = 'green';
          form.reset();
        }
      })
      .catch(err => {
        console.error(err);
        messageDiv.innerText = 'Server Error';
        messageDiv.style.color = 'red';
      });
      
    });
  }
});