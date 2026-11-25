const Database = require("better-sqlite3");
const path = require("path");

// Kết nối database
const dbPath = path.join(__dirname, "database", "myday.db");
const db = new Database(dbPath);

// Tạo bảng tasks nếu chưa tồn tại
db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        date TEXT DEFAULT '',
        category TEXT DEFAULT '',
        start TEXT DEFAULT '',
        end TEXT DEFAULT '',
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'To Do'
    )
`);

console.log("MyDay Database connected successfully!");

module.exports = db;
