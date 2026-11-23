(function () {
    var filterButtons = document.querySelectorAll(".order-filter-btn[data-status]");
    var orderCards = document.querySelectorAll(".order-list .order-card[data-status]");
    var emptyMessage = document.getElementById("order-filter-empty");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var selectedStatus = button.dataset.status;
            var visibleCount = 0;

            filterButtons.forEach(function (filterButton) {
                var isActive = filterButton === button;
                filterButton.classList.toggle("active", isActive);
                filterButton.setAttribute("aria-pressed", isActive ? "true" : "false");
            });

            orderCards.forEach(function (card) {
                var isVisible = selectedStatus === "all" || card.dataset.status === selectedStatus;
                card.hidden = !isVisible;
                if (isVisible) visibleCount++;
            });

            if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
        });
    });

    filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
    });
}());
