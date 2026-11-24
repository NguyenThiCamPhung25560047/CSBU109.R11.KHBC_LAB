const express = require('express');
const cors = require('cors');
const path = require('path');
const weatherRoutes = require('./routes/weather.routes');

const app = express();
// Đổi sang cổng 5003 để tránh xung đột với bài 1 (5001) và bài 2 (5002)
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Phục vụ giao diện tĩnh (HTML, CSS, JS) từ thư mục hiện tại
app.use(express.static(__dirname));

// Đăng ký route thời tiết
app.use('/api/v1/weather', weatherRoutes);

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Could not get the weather right now'
  });
});

app.listen(PORT, () => {
  console.log(`Backend API Bài 3 đang chạy tại: http://localhost:${PORT}`);
  console.log(`Kiểm tra API: http://localhost:${PORT}/api/v1/weather?city=Hanoi`);
});
