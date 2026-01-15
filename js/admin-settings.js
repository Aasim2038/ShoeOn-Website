/* =========================================
   ADMIN-SETTINGS.JS (FIXED: Delete & Max 10)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.getElementById('settings-form');
  const responseDiv = document.getElementById('form-response');
  const bannersPreview = document.getElementById('current-banners');
  
  let currentBannersCount = 0; // Track karne ke liye ki abhi kitne hain

  // 1. Load Current Settings
  window.loadSettings = function() { // Global banaya taaki delete ke baad call kar sakein
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { 
        
        bannersPreview.innerHTML = '';
        if (data.banners && data.banners.length > 0) {
          currentBannersCount = data.banners.length; // Count Update

          data.banners.forEach(url => {
            // Har image ke sath Delete Button
            bannersPreview.innerHTML += `
              <div style="position: relative; display: inline-block; margin: 5px;">
                  <img src="${url}" style="width:120px; height:70px; object-fit:cover; border:1px solid #ccc; border-radius:4px;">
                  <button onclick="deleteBanner('${url}')" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">&times;</button>
              </div>
            `;
          });
        } else {
          currentBannersCount = 0;
          bannersPreview.innerHTML = '<p style="color:#999; font-size:0.9rem;">No banners uploaded yet.</p>';
        }
      })
      .catch(err => console.error(err));
  }

  // 2. Delete Banner Function
  window.deleteBanner = function(url) {
      if(!confirm("Are you sure you want to delete this banner?")) return;

      fetch('/api/settings/delete-banner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url })
      })
      .then(res => res.json())
      .then(data => {
          if(data.banners) {
              alert("Banner Deleted!");
              loadSettings(); // List refresh karo
          } else {
              alert("Error deleting banner");
          }
      })
      .catch(err => console.error(err));
  }

  // 3. Save New Banners
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById('banners');
      const newFilesCount = fileInput.files.length;

      // 🔥 Check: Max 10 Limit
      if (currentBannersCount + newFilesCount > 10) {
          alert(`You can only have 10 banners total. You already have ${currentBannersCount}. Delete some first.`);
          return;
      }

      responseDiv.innerText = 'Uploading...';
      responseDiv.style.color = 'blue';
      
      const formData = new FormData();
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('banners', fileInput.files[i]);
      }
      
      fetch('/api/settings', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        responseDiv.innerText = 'Banners Added Successfully!';
        responseDiv.style.color = 'green';
        loadSettings(); 
        form.reset(); 
      })
      .catch(err => {
        responseDiv.innerText = 'Error uploading banners.';
        responseDiv.style.color = 'red';
      });
    });
  }

  loadSettings();

  /* =========================================
   HIGHLIGHTS LOGIC (UPDATED FOR MULTIPLE & UI)
   ========================================= */

const highlightList = document.getElementById('highlights-list');
const highlightBtn = document.getElementById('btn-upload-highlight');
const highlightRes = document.getElementById('highlight-response');

// 1. Load Highlights
function loadAdminHighlights() {
    if (!highlightList) return;

    fetch('/api/highlights')
        .then(res => res.json())
        .then(data => {
            highlightList.innerHTML = '';

            // Error Handling: Agar data array nahi hai (matlab error object aaya hai)
            if (!Array.isArray(data)) {
                console.error("API Error:", data);
                highlightList.innerHTML = '<p style="color:red;">Server Error loading highlights.</p>';
                return;
            }

            if (data.length === 0) {
                highlightList.innerHTML = '<p style="color:#999;">No active stories.</p>';
                return;
            }

            data.forEach(item => {
                let mediaElement = '';
                if (item.type === 'video') {
                    mediaElement = `<video src="${item.url}" muted loop style="width:100%; height:100%; object-fit:cover;"></video>`;
                } else {
                    mediaElement = `<img src="${item.url}" style="width:100%; height:100%; object-fit:cover;">`;
                }

                const div = document.createElement('div');
                // 🔥 STYLE FIX: 9:16 Aspect Ratio (Mobile Story Style)
                div.style.cssText = `
                    flex: 0 0 100px; 
                    height: 180px; 
                    position: relative; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    border: 2px solid #eee; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    background: #000;
                `;
                
                div.innerHTML = `
                    ${mediaElement}
                    <div style="position: absolute; bottom:0; left:0; width:100%; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding:5px;">
                        <p style="color:white; font-size:10px; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${item.title || 'Story'}
                        </p>
                    </div>
                    <button onclick="deleteHighlight('${item._id}')" 
                            style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size:14px;">
                        &times;
                    </button>
                `;
                highlightList.appendChild(div);
            });
        })
        .catch(err => {
            console.error(err);
            highlightList.innerHTML = '<p style="color:red;">Connection Failed.</p>';
        });
}

// 2. Upload Highlight (Supports Multiple)
if (highlightBtn) {
    highlightBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('highlight-media');
        const titleInput = document.getElementById('highlight-title');

        if (fileInput.files.length === 0) {
            alert("Select at least one file!");
            return;
        }

        highlightRes.innerText = `Uploading ${fileInput.files.length} files... Please wait.`;
        highlightRes.style.color = "blue";
        highlightBtn.disabled = true;

        const formData = new FormData();
        // 🔥 Loop karke saari files add karo
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('mediaFiles', fileInput.files[i]);
        }
        formData.append('title', titleInput.value);

        fetch('/api/highlights', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            highlightRes.innerText = "Upload Successful!";
            highlightRes.style.color = "green";

            // Reset Form
            fileInput.value = "";
            titleInput.value = "";
            highlightBtn.disabled = false;

            loadAdminHighlights(); // Refresh List
        })
        .catch(err => {
            highlightRes.innerText = "Error: " + err.message;
            highlightRes.style.color = "red";
            highlightBtn.disabled = false;
        });
    });
}

// 3. Delete Highlight
window.deleteHighlight = function (id) {
    if (!confirm("Delete this story?")) return;

    fetch(`/api/highlights/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            loadAdminHighlights();
        })
        .catch(err => alert("Delete failed"));
}

// Initial Load
loadAdminHighlights();
});