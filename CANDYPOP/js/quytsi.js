
$(document).ready(function () {

    var categoryNames = {
        "charm/mockhoa": "CHARM - MÓC KHÓA",
        "tuixinh": "TÚI XINH",
        "buamayman": "BÙA MAY MẮN",
        "setqua": "SET QUÀ"
    };

    function getCategoryIdFromHash(hash) {
        try {
            return decodeURIComponent((hash || "").replace(/^#/, ""));
        } catch (error) {
            return (hash || "").replace(/^#/, "");
        }
    }

    function applyCategory(categoryId) {
        var categoryName = categoryNames[categoryId];
        var productCategoryName = categoryName;
        var visibleProducts = 0;
        $("#products .product-item").each(function () {
            var productCategory = $(this).find(".product-category").text().trim().toLocaleUpperCase("vi");
            var isVisible = !productCategoryName || productCategory === productCategoryName;
            $(this).toggle(isVisible);
            if (isVisible) visibleProducts++;
        });
        $("#product-grid").toggleClass("single-product-view", !!categoryName && visibleProducts === 1);

        $("#product-list-title").text(categoryName || "Sản phẩm nổi bật");
        $(".category-list a").removeClass("category-selected");
        if (categoryName) {
            $(".category-list a[href='#" + categoryId + "']").addClass("category-selected");
        }
    }

    $(".category-dropdown .dropdown-menu a[href^='#'], .category-list a[href^='#']").on("click", function (event) {
        event.preventDefault();
        var categoryId = getCategoryIdFromHash(this.hash);
        if (categoryNames[categoryId]) {
            window.location.hash = categoryId;
            applyCategory(categoryId);
        }
    });

    $(".category-all, .view-all").on("click", function () {
        window.location.hash = "products";
        applyCategory(null);
    });

    $(window).on("hashchange", function () {
        applyCategory(getCategoryIdFromHash(window.location.hash));
    });
    applyCategory(getCategoryIdFromHash(window.location.hash));

    // Mở và đóng ô tìm kiếm
    $("#search-toggle").click(function (e) {
        e.preventDefault();

        $("#search-box").toggleClass("active");

        // Cập nhật trạng thái icon
        var isExpanded = $("#search-box").hasClass("active");

        $(this).attr("aria-expanded", isExpanded);

        // Tự động focus vào ô tìm kiếm
        if (isExpanded) {
            $("#search-box input").focus();
        }
    });

    // Đóng ô tìm kiếm khi nhấn ra ngoài
    $(document).click(function (e) {

        if (!$(e.target).closest(".search-wrapper").length) {

            $("#search-box").removeClass("active");

            $("#search-toggle").attr("aria-expanded", "false");
        }

    });

    // Hiển thị số đã bán và trạng thái tồn kho bằng Bootstrap progress bar.
    $(".product-card[data-stock]").each(function () {
        var card = this;
        var stock = Number(card.dataset.stock);
        var capacity = Number(card.dataset.stockCapacity);
        var sold = Math.max(0, capacity - stock);
        var percentSold = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
        var bar = card.querySelector(".product-stock .progress-bar");
        var progress = card.querySelector(".product-stock .progress");
        var count = card.querySelector(".stock-count-on-bar");

        if (!bar || !progress || !count) return;
        bar.style.width = percentSold + "%";
        bar.setAttribute("aria-valuenow", String(percentSold));
        bar.setAttribute("aria-valuetext", "Đã bán " + sold + "; còn " + stock + " sản phẩm");
        bar.classList.remove("progress-bar-success", "progress-bar-warning", "progress-bar-danger");
        progress.classList.toggle("is-low-stock", stock > 0 && stock < 10);
        progress.classList.toggle("is-out-of-stock", stock <= 0);
        bar.classList.add(stock <= 0 ? "progress-bar-danger" : stock < 10 ? "progress-bar-warning" : "progress-bar-success");
        count.textContent = stock <= 0 ? "Hết hàng" : stock < 10 ? "Sắp bán hết" : "Đã bán " + sold;
    });

});
