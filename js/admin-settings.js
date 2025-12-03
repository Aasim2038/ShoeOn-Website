/* =========================================
   ADMIN-SETTINGS.JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.getElementById('settings-form');
  const responseDiv = document.getElementById('form-response');
  const bannersPreview = document.getElementById('current-banners');
  
  // 1. Load Current Settings
  function loadSettings() {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { d
        
        // Images dikhao
        bannersPreview.innerHTML = '';
        if (data.banners && data.banners.length > 0) {
          data.banners.forEach(url => {
            bannersPreview.innerHTML += `
              <img src="${url}" style="width:100px; height:60px; object-fit:cover; border:1px solid #ccc; border-radius:4px;">
            `;
          });
        } else {
          bannersPreview.innerHTML = '<p style="color:#999; font-size:0.9rem;">No banners uploaded yet.</p>';
        }
      })
      .catch(err => console.error(err));
  }

  // 2. Save Settings
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      responseDiv.innerText = 'Saving...';
      responseDiv.style.color = 'blue';
      
      const formData = new FormData();
      
      const fileInput = document.getElementById('banners');
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('banners', fileInput.files[i]);
      }
      
      fetch('/api/settings', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        responseDiv.innerText = 'Settings Updated Successfully!';
        responseDiv.style.color = 'green';
        loadSettings(); // Wapas load karo taaki nayi images dikhein
        form.reset(); // Input clear karo
      })
      .catch(err => {
        responseDiv.innerText = 'Error updating settings.';
        responseDiv.style.color = 'red';
      });
    });
  }

  loadSettings();
});