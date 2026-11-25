"use strict";

const TASKS_API = "http://localhost:3001/api/tasks";
const currentDate = document.getElementById("current-date");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(value) {
    if (!value) return "Chưa có hạn";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function renderDashboard(tasks) {
    const today = localDateString(new Date());
    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "progress").length;
    const overdue = tasks.filter((task) => task.date && task.date < today && task.status !== "completed").length;

    document.getElementById("total-tasks").textContent = tasks.length;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("progress-tasks").textContent = inProgress;
    document.getElementById("overdue-tasks").textContent = overdue;

    const todayTasks = tasks.filter((task) => task.date === today)
        .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const schedule = document.querySelector(".schedule-list");
    schedule.innerHTML = todayTasks.length ? todayTasks.map((task, index) => {
        const color = ["pink", "purple", "green", "yellow"][index % 4];
        const time = task.start || "--:--";
        const timeRange = task.start && task.end ? `${task.start} - ${task.end}` : (task.start || "Chưa đặt giờ");
        return `<div class="schedule-item">
            <div class="schedule-time">${escapeHTML(time)}</div>
            <div class="schedule-line ${color}-line"></div>
            <div class="schedule-content"><h3>${escapeHTML(task.title)}</h3>
                <p><i class="fa-regular fa-clock"></i> ${escapeHTML(timeRange)}</p></div>
            <span class="schedule-tag ${color}-tag">${escapeHTML(task.category || "Other")}</span>
        </div>`;
    }).join("") : "<p>Hôm nay chưa có công việc nào.</p>";

    const upcomingTasks = tasks.filter((task) => task.date >= today && task.status !== "completed")
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
        .slice(0, 3);
    const upcoming = document.querySelector(".upcoming-list");
    upcoming.innerHTML = upcomingTasks.length ? upcomingTasks.map((task, index) => {
        const color = ["pink", "purple", "green"][index % 3];
        const icon = ["fa-book", "fa-list-check", "fa-heart"][index % 3];
        const priority = ["high", "medium", "low"].includes(task.priority) ? task.priority : "low";
        return `<div class="upcoming-item">
            <div class="upcoming-icon ${color}-bg"><i class="fa-solid ${icon}"></i></div>
            <div class="upcoming-info"><h3>${escapeHTML(task.title)}</h3><p>${formatDate(task.date)}</p></div>
            <span class="priority ${priority}">${escapeHTML(priority[0].toUpperCase() + priority.slice(1))}</span>
        </div>`;
    }).join("") : "<p>Chưa có công việc sắp tới.</p>";
}

currentDate.textContent = new Date().toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric"
});

fetch(TASKS_API)
    .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then((result) => renderDashboard(result.data || []))
    .catch((error) => {
        console.error("Không thể tải dữ liệu dashboard:", error);
        document.querySelector(".schedule-list").innerHTML = "<p>Không thể kết nối máy chủ. Hãy chạy backend rồi tải lại trang.</p>";
        document.querySelector(".upcoming-list").innerHTML = "<p>Không thể kết nối máy chủ.</p>";
        ["total-tasks", "completed-tasks", "progress-tasks", "overdue-tasks"]
            .forEach((id) => { document.getElementById(id).textContent = "—"; });
    });
