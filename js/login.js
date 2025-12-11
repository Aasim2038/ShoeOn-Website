/* =========================================
   LOGIN.JS - UPDATED FIXED CODE
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const messageDiv = document.getElementById('login-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loginData = {
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            
            messageDiv.innerText = 'Checking...';
            messageDiv.style.color = 'blue';
            
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                
                const data = await res.json();
                
                if (!res.ok) { 
                    messageDiv.innerText = data.error || data.message || 'Login failed.';
                    messageDiv.style.color = 'red';
                    return; 
                } 
                
                // data.token ka check yahan zaroori hai
                if (data.token && data.user) {
                    // ✅ TOKEN SAVE KARNA ZAROORI HAI
                    localStorage.setItem('authToken', data.token); 
                    localStorage.setItem('shoeonUser', JSON.stringify(data.user)); 

                    messageDiv.innerText = 'Login Successful! Redirecting...';
                    messageDiv.style.color = 'green';
                    
                    setTimeout(() => {
                        window.location.href = 'index.html'; 
                    }, 1000);
                } else {
                    messageDiv.innerText = 'Token not found in response!';
                    messageDiv.style.color = 'orange';
                }
                
            } catch(err) {
                console.error("Fetch Error:", err);
                messageDiv.innerText = 'Server Error: Connection failed.';
                messageDiv.style.color = 'red';
            }
        });
    }
});