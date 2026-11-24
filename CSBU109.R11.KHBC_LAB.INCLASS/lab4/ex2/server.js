const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5002; // Dùng cổng 5002 để không bị xung đột với bài 1 (cổng 5001)

app.use(cors());
app.use(express.json());

// Thư mục lưu trữ file upload
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình static để có thể xem ảnh trực tiếp qua URL
app.use('/uploads', express.static(UPLOAD_DIR));

// Cấu hình Multer lưu file vào ổ đĩa với tên duy nhất
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Bộ lọc chỉ cho phép các định dạng ảnh hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP, GIF!');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Tối đa 2MB
  fileFilter: fileFilter
});

// 1. API Upload ảnh avatar
app.post('/api/v1/upload-avatar', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File quá lớn! Dung lượng tối đa là 2 MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn 1 file ảnh!' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Upload ảnh thành công!',
      fileInfo: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  });
});

// 2. API lấy danh sách ảnh đã upload (Gallery)
app.get('/api/v1/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Không thể đọc thư mục uploads' });
    }

    const fileList = files
      .filter(file => !file.startsWith('.'))
      .map(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
          downloadUrl: `${req.protocol}://${req.get('host')}/api/v1/download/${file}`
        };
      });

    res.json({ success: true, count: fileList.length, data: fileList });
  });
});

// 3. API Download ảnh
app.get('/api/v1/download/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File không tồn tại!' });
  }

  res.download(filePath, safeFilename);
});

// 4. API Xóa ảnh
app.delete('/api/v1/files/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File không tồn tại!' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Không thể xóa file này' });
    }
    res.json({ success: true, message: `Đã xóa file ${safeFilename} thành công!` });
  });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Lỗi Server' });
});

app.listen(PORT, () => {
  console.log(`Backend Server Bài 2 đang chạy tại: http://localhost:${PORT}`);
});
