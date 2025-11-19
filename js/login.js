/* =========================================
   LOGIN.JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('login-message');

  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const loginData = {
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value
      };
      
      messageDiv.innerText = 'Checking...';
      messageDiv.style.color = 'blue';
      
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          messageDiv.innerText = data.error;
          messageDiv.style.color = 'red';
        } else {
          // Success!
          messageDiv.innerText = 'Login Successful! Redirecting...';
          messageDiv.style.color = 'green';
          
          // IMPORTANT: User ko browser me yaad rakho (Session)
          // Hum user ka data 'shoeonUser' naam se save karenge
          localStorage.setItem('shoeonUser', JSON.stringify(data.user));
          
          // Home Page par bhejo
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
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