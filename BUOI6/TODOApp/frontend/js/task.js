
/* =====================================
   1. INITIALIZE
===================================== */

// Lấy các phần tử HTML
const taskList = document.getElementById("task-list");

const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");

const openAddModal = document.getElementById("open-add-modal");
const closeModal = document.getElementById("close-modal");
const cancelModal = document.getElementById("cancel-modal");

const modalTitle = document.getElementById("modal-title");

const searchInput = document.getElementById("search-task");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const sortDate = document.getElementById("sort-date");

const emptyState = document.getElementById("empty-state");


// Lấy dữ liệu từ Local Storage
let tasks = JSON.parse(localStorage.getItem("myday_tasks")) || [];

let editingTaskId = null;


// Tạo dữ liệu mẫu nếu chưa có
if (tasks.length === 0) {

    const today = new Date();

    function getDate(offset) {
        const date = new Date(today);
        date.setDate(date.getDate() + offset);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    tasks = [
        {
            id: 1,
            title: "Complete Marketing Report",
            description: "Finish the marketing research assignment.",
            date: getDate(0),
            startTime: "09:00",
            endTime: "10:00",
            category: "Study",
            priority: "high",
            status: "progress"
        },

        {
            id: 2,
            title: "Practice English Speaking",
            description: "Practice speaking for 30 minutes.",
            date: getDate(0),
            startTime: "10:30",
            endTime: "11:00",
            category: "Personal",
            priority: "medium",
            status: "todo"
        },

        {
            id: 3,
            title: "Read a Book",
            description: "Read 20 pages of a book.",
            date: getDate(1),
            startTime: "14:00",
            endTime: "15:00",
            category: "Personal",
            priority: "low",
            status: "todo"
        },

        {
            id: 4,
            title: "Build TODO App",
            description: "Complete the frontend interface.",
            date: getDate(2),
            startTime: "16:00",
            endTime: "17:00",
            category: "Work",
            priority: "high",
            status: "completed"
        },

        {
            id: 5,
            title: "Learn Chinese Vocabulary",
            description: "Review new vocabulary.",
            date: getDate(3),
            startTime: "08:00",
            endTime: "09:00",
            category: "Study",
            priority: "medium",
            status: "progress"
        }
    ];

    saveTasks();
}


// =====================================
// 2. SAVE DATA
// =====================================

function saveTasks() {

    localStorage.setItem("myday_tasks", JSON.stringify(tasks));

}


// =====================================
// 3. FORMAT DATA
// =====================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


function formatDate(dateString) {

    if (!dateString) return "No deadline";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


function getStatusLabel(status) {

    const labels = {
        todo: "To Do",
        progress: "In Progress",
        completed: "Completed"
    };

    return labels[status] || status;

}


function getPriorityLabel(priority) {

    const labels = {
        high: "High",
        medium: "Medium",
        low: "Low"
    };

    return labels[priority] || priority;

}


// =====================================
// 4. DISPLAY TASKS
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    // Lấy giá trị tìm kiếm và bộ lọc
    const keyword = searchInput.value.trim().toLowerCase();

    const statusValue = filterStatus.value;
    const priorityValue = filterPriority.value;

    const sortValue = sortDate.value;


    // Tìm kiếm và lọc
    let filteredTasks = tasks.filter(function (task) {

        const matchesSearch =
            task.title.toLowerCase().includes(keyword) ||
            (task.description || "").toLowerCase().includes(keyword);

        const matchesStatus =
            statusValue === "all" || task.status === statusValue;

        const matchesPriority =
            priorityValue === "all" || task.priority === priorityValue;

        return matchesSearch && matchesStatus && matchesPriority;

    });


    // Sắp xếp theo deadline
    filteredTasks.sort(function (a, b) {

        if (sortValue === "asc") {
            return a.date.localeCompare(b.date);
        }

        return b.date.localeCompare(a.date);

    });


    // Hiển thị trạng thái rỗng
    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";


    // Cập nhật số lượng kết quả
    document.getElementById("result-count").textContent =
        filteredTasks.length + " tasks";


    // Hiển thị danh sách
    filteredTasks.forEach(function (task) {

        const row = document.createElement("tr");

        const completedClass =
            task.status === "completed" ? "task-completed" : "";

        row.innerHTML = `

            <td>
                <div class="task-name ${completedClass}">

                    <input
                        type="checkbox"
                        class="task-check"
                        data-id="${task.id}"
                        ${task.status === "completed" ? "checked" : ""}
                        aria-label="Mark ${escapeHTML(task.title)} as completed"
                    >

                    <div>
                        <div class="task-name-text">
                            ${escapeHTML(task.title)}
                        </div>

                        <div class="task-description-text">
                            ${escapeHTML(task.description || "")}
                        </div>
                    </div>

                </div>
            </td>


            <td>
                <span class="category-tag">
                    ${escapeHTML(task.category)}
                </span>
            </td>


            <td>
                ${formatDate(task.date)}
            </td>


            <td>
                <span class="priority-tag ${task.priority}">
                    ${getPriorityLabel(task.priority)}
                </span>
            </td>


            <td>
                <span class="status-tag ${task.status}">
                    ${getStatusLabel(task.status)}
                </span>
            </td>


            <td>
                <div class="task-actions">

                    <button
                        class="action-btn edit-btn"
                        data-action="edit"
                        data-id="${task.id}"
                        title="Edit task"
                        aria-label="Edit task"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${task.id}"
                        title="Delete task"
                        aria-label="Delete task"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>

        `;

        taskList.appendChild(row);

    });


    updateStatistics();

}


// =====================================
// 5. UPDATE STATISTICS
// =====================================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.status === "completed";
    }).length;

    const progress = tasks.filter(function (task) {
        return task.status === "progress";
    }).length;

    const todo = tasks.filter(function (task) {
        return task.status === "todo";
    }).length;


    document.getElementById("total-count").textContent = total;

    document.getElementById("completed-count").textContent = completed;

    document.getElementById("progress-count").textContent = progress;

    document.getElementById("todo-count").textContent = todo;

}


// =====================================
// 6. OPEN AND CLOSE MODAL
// =====================================

function openModal() {

    taskModal.classList.add("show");

}


function closeTaskModal() {

    taskModal.classList.remove("show");

    taskForm.reset();

    editingTaskId = null;

    modalTitle.textContent = "Create New Task";

}


openAddModal.addEventListener("click", function () {

    closeTaskModal();

    modalTitle.textContent = "Create New Task";

    openModal();

});


closeModal.addEventListener("click", closeTaskModal);

cancelModal.addEventListener("click", closeTaskModal);


taskModal.addEventListener("click", function (event) {

    if (event.target === taskModal) {
        closeTaskModal();
    }

});


// =====================================
// 7. ADD AND EDIT TASK
// =====================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Lấy dữ liệu từ form
    const title = document.getElementById("task-title").value.trim();

    const description =
        document.getElementById("task-description").value.trim();

    const date = document.getElementById("task-date").value;

    const category = document.getElementById("task-category").value;

    const startTime = document.getElementById("task-start").value;

    const endTime = document.getElementById("task-end").value;

    const priority = document.getElementById("task-priority").value;

    const status = document.getElementById("task-status").value;


    // Kiểm tra thời gian
    if (startTime && endTime && endTime <= startTime) {

        alert("End time must be later than start time!");

        return;

    }


    // Tạo object task
    const taskData = {

        title,
        description,
        date,
        category,
        startTime,
        endTime,
        priority,
        status

    };


    // Nếu đang chỉnh sửa
    if (editingTaskId !== null) {

        tasks = tasks.map(function (task) {

            if (task.id === editingTaskId) {

                return {
                    ...task,
                    ...taskData
                };

            }

            return task;

        });

    }


    // Nếu thêm mới
    else {

        const newTask = {

            id: Date.now(),

            ...taskData

        };

        tasks.push(newTask);

    }


    saveTasks();

    renderTasks();

    closeTaskModal();

});


// =====================================
// 8. EDIT TASK
// =====================================

function editTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });

    if (!task) return;


    editingTaskId = id;

    modalTitle.textContent = "Edit Task";


    document.getElementById("task-title").value = task.title;

    document.getElementById("task-description").value =
        task.description || "";

    document.getElementById("task-date").value = task.date;

    document.getElementById("task-category").value = task.category;

    document.getElementById("task-start").value = task.startTime || "";

    document.getElementById("task-end").value = task.endTime || "";

    document.getElementById("task-priority").value = task.priority;

    document.getElementById("task-status").value = task.status;


    openModal();

}


// =====================================
// 9. DELETE TASK
// =====================================

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;


    tasks = tasks.filter(function (task) {

        return task.id !== id;

    });


    saveTasks();

    renderTasks();

}


// =====================================
// 10. COMPLETE TASK
// =====================================

function toggleComplete(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            return {
                ...task,

                status: task.status === "completed"
                    ? "todo"
                    : "completed"

            };

        }

        return task;

    });


    saveTasks();

    renderTasks();

}


// =====================================
// 11. HANDLE TABLE ACTIONS
// =====================================

taskList.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;


    const id = Number(button.dataset.id);

    const action = button.dataset.action;


    if (action === "edit") {

        editTask(id);

    }


    if (action === "delete") {

        deleteTask(id);

    }

});


// =====================================
// 12. HANDLE CHECKBOX
// =====================================

taskList.addEventListener("change", function (event) {

    if (event.target.classList.contains("task-check")) {

        const id = Number(event.target.dataset.id);

        toggleComplete(id);

    }

});


// =====================================
// 13. SEARCH AND FILTER
// =====================================

searchInput.addEventListener("input", renderTasks);

filterStatus.addEventListener("change", renderTasks);

filterPriority.addEventListener("change", renderTasks);

sortDate.addEventListener("change", renderTasks);


// =====================================
// 14. INITIAL RENDER
// =====================================

renderTasks();


/* =====================================
   15. EDIT TASK FROM CALENDAR
===================================== */

const editTaskId = localStorage.getItem("myday_edit_task_id");

if (editTaskId !== null) {

    localStorage.removeItem("myday_edit_task_id");

    editTask(Number(editTaskId));

}
