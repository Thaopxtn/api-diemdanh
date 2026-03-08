const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Mật khẩu bảo mật
const SECRET_KEY = process.env.SECRET_KEY || "matkhau123";

// Cấu hình CORS để cho phép frontend gọi API
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));

// Nơi lưu trữ file JSON
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Đọc dữ liệu
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Lỗi đọc file:", err);
  }
  return null;
}

// Ghi dữ liệu
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Lỗi ghi file:", err);
  }
}

// 1. Tải về (Pull)
app.get("/", (req, res) => {
  const key = req.query.key;
  if (key !== SECRET_KEY) {
    return res.status(401).json({ error: "Sai mã bảo mật" });
  }
  res.json({ data: readData() });
});

// Hỗ trợ do thói quen dán link có /exec
app.get("/exec", (req, res) => {
  res.redirect(`/?key=${req.query.key}&action=${req.query.action}`);
});

// 2. Tải lên (Push)
app.post("/", (req, res) => {
  const body = req.body;
  
  if (!body || !body.data || body.data.key !== SECRET_KEY) {
    return res.status(401).json({ error: "Sai mã bảo mật" });
  }

  if (body.action === "push") {
    writeData(body.data);
    return res.json({ success: true, message: "Đã lưu thành công" });
  }
  
  res.status(400).json({ error: "Thao tác không hợp lệ" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
