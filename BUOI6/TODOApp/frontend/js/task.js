"use strict";

// Frontend can be opened through Express or a separate Live Server instance.
const API_URL = "http://localhost:3001/api/tasks";
const taskList = document.getElementById("task-list");
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const searchInput = document.getElementById("search-task");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const sortDate = document.getElementById("sort-date");
const emptyState = document.getElementById("empty-state");
let tasks = [];
let editingTaskId = null;

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Yêu cầu không thành công.");
    return result;
}

function normalizeTask(task) {
    return {
        ...task,
        id: String(task.id),
        startTime: task.startTime ?? task.start ?? "",
        endTime: task.endTime ?? task.end ?? ""
    };
}

async function loadTasks() {
    try {
        const result = await request(API_URL);
        tasks = (result.data || []).map(normalizeTask);
        renderTasks();
        const calendarEditId = localStorage.getItem("myday_edit_task_id");
        if (calendarEditId) {
            localStorage.removeItem("myday_edit_task_id");
            editTask(calendarEditId);
        }
    } catch (error) {
        console.error("Không thể tải công việc:", error);
        emptyState.style.display = "block";
        emptyState.querySelector("h3").textContent = "Không kết nối được máy chủ";
        emptyState.querySelector("p").textContent = "Hãy khởi động backend rồi tải lại trang.";
        alert("Không thể kết nối máy chủ. Hãy chạy backend tại thư mục TODOApp.");
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function formatDate(value) {
    if (!value) return "Chưa có hạn";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

const statusLabels = { todo: "To Do", progress: "In Progress", completed: "Completed" };
const priorityLabels = { high: "High", medium: "Medium", low: "Low" };

function renderTasks() {
    const keyword = searchInput.value.trim().toLocaleLowerCase();
    const status = filterStatus.value;
    const priority = filterPriority.value;
    const rows = tasks.filter((task) =>
        (task.title || "").toLocaleLowerCase().includes(keyword) ||
        (task.description || "").toLocaleLowerCase().includes(keyword)
    ).filter((task) => status === "all" || task.status === status)
        .filter((task) => priority === "all" || task.priority === priority)
        .sort((a, b) => sortDate.value === "asc"
            ? (a.date || "").localeCompare(b.date || "")
            : (b.date || "").localeCompare(a.date || ""));

    taskList.innerHTML = "";
    emptyState.style.display = rows.length ? "none" : "block";
    document.getElementById("result-count").textContent = `${rows.length} tasks`;
    rows.forEach((task) => {
        const row = document.createElement("tr");
        const done = task.status === "completed";
        row.innerHTML = `
            <td><div class="task-name ${done ? "task-completed" : ""}">
                <input type="checkbox" class="task-check" data-id="${escapeHTML(task.id)}" ${done ? "checked" : ""} aria-label="Mark task completed">
                <div><div class="task-name-text">${escapeHTML(task.title)}</div>
                <div class="task-description-text">${escapeHTML(task.description)}</div></div>
            </div></td>
            <td><span class="category-tag">${escapeHTML(task.category)}</span></td>
            <td>${formatDate(task.date)}</td>
            <td><span class="priority-tag ${escapeHTML(task.priority)}">${priorityLabels[task.priority] || escapeHTML(task.priority)}</span></td>
            <td><span class="status-tag ${escapeHTML(task.status)}">${statusLabels[task.status] || escapeHTML(task.status)}</span></td>
            <td><div class="task-actions">
                <button class="action-btn edit-btn" data-action="edit" data-id="${escapeHTML(task.id)}" title="Sửa" aria-label="Sửa"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete-btn" data-action="delete" data-id="${escapeHTML(task.id)}" title="Xóa" aria-label="Xóa"><i class="fa-solid fa-trash"></i></button>
            </div></td>`;
        taskList.appendChild(row);
    });
    document.getElementById("total-count").textContent = tasks.length;
    document.getElementById("completed-count").textContent = tasks.filter((task) => task.status === "completed").length;
    document.getElementById("progress-count").textContent = tasks.filter((task) => task.status === "progress").length;
    document.getElementById("todo-count").textContent = tasks.filter((task) => task.status === "todo").length;
}

function openModal() { taskModal.classList.add("show"); }
function closeTaskModal() {
    taskModal.classList.remove("show");
    taskForm.reset();
    editingTaskId = null;
    modalTitle.textContent = "Create New Task";
}

document.getElementById("open-add-modal").addEventListener("click", () => {
    closeTaskModal();
    openModal();
});
document.getElementById("close-modal").addEventListener("click", closeTaskModal);
document.getElementById("cancel-modal").addEventListener("click", closeTaskModal);
taskModal.addEventListener("click", (event) => { if (event.target === taskModal) closeTaskModal(); });

function editTask(id) {
    const task = tasks.find((item) => String(item.id) === String(id));
    if (!task) return;
    editingTaskId = String(id);
    modalTitle.textContent = "Edit Task";
    document.getElementById("task-title").value = task.title || "";
    document.getElementById("task-description").value = task.description || "";
    document.getElementById("task-date").value = task.date || "";
    document.getElementById("task-category").value = task.category || "Other";
    document.getElementById("task-start").value = task.startTime || "";
    document.getElementById("task-end").value = task.endTime || "";
    document.getElementById("task-priority").value = task.priority || "medium";
    document.getElementById("task-status").value = task.status || "todo";
    openModal();
}

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const start = document.getElementById("task-start").value;
    const end = document.getElementById("task-end").value;
    if (start && end && end <= start) return alert("Giờ kết thúc phải sau giờ bắt đầu.");
    const data = {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("task-description").value.trim(),
        date: document.getElementById("task-date").value,
        category: document.getElementById("task-category").value,
        start, end,
        priority: document.getElementById("task-priority").value,
        status: document.getElementById("task-status").value
    };
    try {
        if (editingTaskId !== null) await request(`${API_URL}/${encodeURIComponent(editingTaskId)}`, { method: "PUT", body: JSON.stringify(data) });
        else await request(API_URL, { method: "POST", body: JSON.stringify(data) });
        closeTaskModal();
        await loadTasks();
    } catch (error) { alert(error.message); }
});

taskList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "edit") return editTask(id);
    if (button.dataset.action === "delete" && confirm("Bạn có chắc muốn xóa công việc này không?")) {
        try {
            await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
            await loadTasks();
        } catch (error) { alert(error.message); }
    }
});

taskList.addEventListener("change", async (event) => {
    if (!event.target.matches(".task-check")) return;
    const task = tasks.find((item) => String(item.id) === event.target.dataset.id);
    if (!task) return;
    try {
        await request(`${API_URL}/${encodeURIComponent(task.id)}`, {
            method: "PUT",
            body: JSON.stringify({ ...task, start: task.startTime, end: task.endTime, status: event.target.checked ? "completed" : "todo" })
        });
        await loadTasks();
    } catch (error) { alert(error.message); await loadTasks(); }
});

searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);
filterPriority.addEventListener("change", renderTasks);
sortDate.addEventListener("change", renderTasks);
loadTasks();
