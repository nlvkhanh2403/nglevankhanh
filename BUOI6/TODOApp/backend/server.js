
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ==============================
// 1. MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ==============================
// 2. KIỂM TRA BACKEND
// ==============================

app.get("/api/health", (req, res) => {
    res.json({
        message: "MyDay Backend is running!",
        status: "success"
    });
});

// ==============================
// 3. API GET - LẤY DANH SÁCH TASK
// ==============================

app.get("/api/tasks", (req, res) => {
    try {
        const tasks = db.prepare(
            "SELECT * FROM tasks ORDER BY date ASC"
        ).all();

        res.json({
            message: "Lấy danh sách công việc thành công!",
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            message: "Không thể lấy danh sách công việc!",
            error: error.message
        });
    }
});

// ==============================
// 4. API POST - THÊM TASK
// ==============================

app.post("/api/tasks", (req, res) => {
    try {
        const newTask = req.body;

        if (!newTask.title || !newTask.title.trim()) {
            return res.status(400).json({
                message: "Tên công việc không được để trống!"
            });
        }

        const task = {
            id: Date.now().toString(),
            title: newTask.title.trim(),
            description: newTask.description || "",
            date: newTask.date || "",
            category: newTask.category || "",
            start: newTask.start || "",
            end: newTask.end || "",
            priority: newTask.priority || "Medium",
            status: newTask.status || "To Do"
        };

        const insertTask = db.prepare(`
            INSERT INTO tasks (
                id, title, description, date,
                category, start, end, priority, status
            )
            VALUES (
                @id, @title, @description, @date,
                @category, @start, @end, @priority, @status
            )
        `);

        insertTask.run(task);

        res.status(201).json({
            message: "Thêm công việc thành công!",
            data: task
        });

    } catch (error) {
        res.status(500).json({
            message: "Không thể thêm công việc!",
            error: error.message
        });
    }
});

// ==============================
// 5. API PUT - CẬP NHẬT TASK
// ==============================

app.put("/api/tasks/:id", (req, res) => {
    try {
        const taskId = req.params.id;

        const oldTask = db.prepare(
            "SELECT * FROM tasks WHERE id = ?"
        ).get(taskId);

        if (!oldTask) {
            return res.status(404).json({
                message: "Không tìm thấy công việc!"
            });
        }

        const updatedTask = {
            ...oldTask,
            ...req.body,
            id: taskId
        };

        if (!updatedTask.title || !updatedTask.title.trim()) {
            return res.status(400).json({
                message: "Tên công việc không được để trống!"
            });
        }

        const updateTask = db.prepare(`
            UPDATE tasks SET
                title = @title,
                description = @description,
                date = @date,
                category = @category,
                start = @start,
                end = @end,
                priority = @priority,
                status = @status
            WHERE id = @id
        `);

        updateTask.run(updatedTask);

        res.json({
            message: "Cập nhật công việc thành công!",
            data: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Không thể cập nhật công việc!",
            error: error.message
        });
    }
});

// ==============================
// 6. API DELETE - XÓA TASK
// ==============================

app.delete("/api/tasks/:id", (req, res) => {
    try {
        const taskId = req.params.id;

        const result = db.prepare(
            "DELETE FROM tasks WHERE id = ?"
        ).run(taskId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Không tìm thấy công việc!"
            });
        }

        res.json({
            message: "Xóa công việc thành công!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Không thể xóa công việc!",
            error: error.message
        });
    }
});

// ==============================
// 7. KHỞI ĐỘNG SERVER
// ==============================

app.listen(PORT, () => {
    console.log(
        `MyDay server is running at http://localhost:${PORT}`
    );
});
