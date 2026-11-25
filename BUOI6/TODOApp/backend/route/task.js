
const express = require("express");
const router = express.Router();
const db = require("../db");

// =====================================
// 1. GET ALL TASKS
// Lấy danh sách công việc
// =====================================

router.get("/", (req, res) => {
    try {
        const tasks = db.prepare(`
            SELECT * FROM tasks
            ORDER BY date ASC
        `).all();

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================
// 2. CREATE TASK
// Thêm công việc mới
// =====================================

router.post("/", (req, res) => {
    try {
        const {
            title,
            description,
            date,
            category,
            start,
            end,
            priority,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required!"
            });
        }

        const id = require("crypto").randomUUID();

        db.prepare(`
            INSERT INTO tasks (
                id, title, description, date,
                category, start, end, priority, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            title,
            description || "",
            date || "",
            category || "",
            start || "",
            end || "",
            priority || "Medium",
            status || "To Do"
        );

        const newTask = db.prepare(
            "SELECT * FROM tasks WHERE id = ?"
        ).get(id);

        res.status(201).json({
            success: true,
            message: "Task created successfully!",
            data: newTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================
// 3. UPDATE TASK
// Cập nhật công việc
// =====================================

router.put("/:id", (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            date,
            category,
            start,
            end,
            priority,
            status
        } = req.body;

        const result = db.prepare(`
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                date = ?,
                category = ?,
                start = ?,
                end = ?,
                priority = ?,
                status = ?
            WHERE id = ?
        `).run(
            title,
            description || "",
            date || "",
            category || "",
            start || "",
            end || "",
            priority || "Medium",
            status || "To Do",
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found!"
            });
        }

        const updatedTask = db.prepare(
            "SELECT * FROM tasks WHERE id = ?"
        ).get(id);

        res.json({
            success: true,
            message: "Task updated successfully!",
            data: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================
// 4. DELETE TASK
// Xóa công việc
// =====================================

router.delete("/:id", (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare(
            "DELETE FROM tasks WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found!"
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
