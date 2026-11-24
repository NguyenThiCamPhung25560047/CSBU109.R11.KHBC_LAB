const API_BASE = 'http://localhost:5002/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  loadGallery();

  const fileInput = document.getElementById('avatar-input');
  const fileNameDisplay = document.getElementById('file-name');
  const dropZone = document.getElementById('drop-zone');

  // Hiển thị tên file khi chọn từ dialog
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileNameDisplay.textContent = e.target.files[0].name;
    }
  });

  // Hỗ trợ kéo & thả file (Drag & Drop)
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      fileInput.files = dt.files;
      fileNameDisplay.textContent = dt.files[0].name;
    }
  });

  // Xử lý gửi form upload
  document.getElementById('upload-form').addEventListener('submit', handleUpload);
});

function showError(msg) {
  const errBox = document.getElementById('error-msg');
  const successBox = document.getElementById('success-msg');
  successBox.style.display = 'none';
  errBox.textContent = msg;
  errBox.style.display = 'block';
}

function showSuccess(msg) {
  const errBox = document.getElementById('error-msg');
  const successBox = document.getElementById('success-msg');
  errBox.style.display = 'none';
  successBox.textContent = msg;
  successBox.style.display = 'block';
  setTimeout(() => {
    successBox.style.display = 'none';
  }, 4000);
}

function clearMessages() {
  document.getElementById('error-msg').style.display = 'none';
  document.getElementById('success-msg').style.display = 'none';
}

// Xử lý Upload Avatar
async function handleUpload(e) {
  e.preventDefault();
  clearMessages();

  const fileInput = document.getElementById('avatar-input');
  if (!fileInput.files || fileInput.files.length === 0) {
    showError('Vui lòng chọn một file ảnh trước khi upload!');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/upload-avatar`, {
      method: 'POST',
      body: formData
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const result = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new Error((result && result.message) || `Lỗi server (${res.status}). Hãy chắc chắn server cổng 5002 đang chạy.`);
    }

    showSuccess(result.message || 'Upload thành công!');
    document.getElementById('upload-form').reset();
    document.getElementById('file-name').textContent = '';
    loadGallery();
  } catch (err) {
    showError(err.message);
  }
}

// Tải danh sách Gallery
async function loadGallery() {
  const galleryEl = document.getElementById('gallery');
  try {
    const res = await fetch(`${API_BASE}/files`);
    if (!res.ok) return;

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (!isJson) return;

    const result = await res.json();
    galleryEl.innerHTML = '';

    if (!result.data || result.data.length === 0) {
      galleryEl.innerHTML = '<p class="empty-msg">Chưa có ảnh nào được upload.</p>';
      return;
    }

    result.data.forEach(file => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${file.url}" alt="${file.filename}">
        <p style="font-size: 11px; margin: 8px 0; color: #555;">${(file.size / 1024).toFixed(1)} KB</p>
        <div class="gallery-actions">
          <a href="${file.downloadUrl}" class="link-btn link-dl" target="_blank">Download</a>
          <span class="link-btn link-del" onclick="deleteFile('${file.filename}')">Delete</span>
        </div>
      `;
      galleryEl.appendChild(item);
    });
  } catch (err) {
    console.error('Lỗi tải gallery:', err);
  }
}

// Xóa file
async function deleteFile(filename) {
  if (!confirm(`Bạn có chắc muốn xóa ảnh ${filename}?`)) {
    return;
  }

  clearMessages();
  try {
    const res = await fetch(`${API_BASE}/files/${filename}`, {
      method: 'DELETE'
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const result = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new Error((result && result.message) || 'Không thể xóa file!');
    }

    showSuccess(result.message || 'Xóa ảnh thành công!');
    loadGallery();
  } catch (err) {
    showError(err.message);
  }
}
