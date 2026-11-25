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


(function () {
    const products = window.CANDYPOP_CATALOG || {};

    const requestedKey = new URLSearchParams(window.location.search).get("product");
    const productAliases = {
        "banh-mi-meo": "moe-di-tay",
        "trai-dua": "moery-xmas",
        "flan": "tuihoa",
        "pho-mai-vaseline": "set-qua-anh-hung",
        "khoai-tay": "ma-may",
        "pho-mai-foam": "bua-dam-them",
        "taba": "set-qua-anh-hung-bua-may-man"
    };
    const key = productAliases[requestedKey] || requestedKey;
    const product = products[key];
    const page = document.getElementById("product-detail");

    if (!page) return;

    if (!product) {
        page.innerHTML = '<div class="detail-not-found"><h1>Không tìm thấy sản phẩm</h1><p>Vui lòng chọn sản phẩm từ danh mục CANDYPOP.</p><a href="ecommerce.html#products">Quay lại danh mục</a></div>';
        return;
    }

    const reviewStorageKey = "candypop-reviews-" + key;

    function loadCustomerReviews() {
        try {
            const reviews = JSON.parse(window.localStorage.getItem(reviewStorageKey) || "[]");
            return Array.isArray(reviews) ? reviews : [];
        } catch (error) {
            return [];
        }
    }

    document.title = product.name + " | CANDYPOP";
    document.getElementById("detail-name").textContent = product.name;
    document.getElementById("detail-breadcrumb-name").textContent = product.name;
    document.getElementById("detail-category").textContent = product.category.toUpperCase();
    document.getElementById("detail-meta-category").textContent = product.category;
    document.getElementById("detail-category-link").textContent = product.category;
    document.getElementById("detail-category-link").href = "ecommerce.html#" + encodeURIComponent(product.categoryId);
    document.getElementById("detail-price").textContent = product.price;
    const originalPrice = document.getElementById("detail-original-price");
    if (product.originalPrice) {
        originalPrice.textContent = product.originalPrice;
        originalPrice.hidden = false;
    }
    document.getElementById("detail-sku").textContent = product.sku;
    document.getElementById("detail-description").textContent = product.description;
    const reviewSummaryRating = $("#review-summary-rating");
    reviewSummaryRating.val(0).rating({
        theme: "krajee-svg",
        size: "sm",
        step: 0.1,
        displayOnly: true,
        showClear: false,
        showCaption: false
    });

    function updateReviewSummary(reviews) {
        if (!reviews.length) {
            document.getElementById("detail-rating-summary").textContent = "Chưa có đánh giá";
            document.getElementById("review-average").textContent = "—";
            document.getElementById("review-count").textContent = "Chưa có đánh giá";
            reviewSummaryRating.rating("update", 0);
            return;
        }
        const scoreTotal = reviews.reduce(function (sum, review) {
            return sum + Number(review.rating || 0);
        }, 0);
        const average = scoreTotal / reviews.length;
        document.getElementById("detail-rating-summary").textContent = average.toFixed(1) + "/5 · " + reviews.length + " đánh giá";
        document.getElementById("review-average").textContent = average.toFixed(1);
        document.getElementById("review-count").textContent = reviews.length + " đánh giá";
        reviewSummaryRating.rating("update", average);
    }

    const reviewList = document.getElementById("customer-review-list");
    const reviewForm = document.getElementById("customer-review-form");
    const reviewMessage = document.getElementById("review-submit-message");
    const customerRating = $("#customer-review-rating").rating({
        theme: "krajee-svg",
        size: "sm",
        step: 1,
        showClear: false,
        showCaption: true,
        starCaptions: { 1: "Kém", 2: "Tạm", 3: "Bình thường", 4: "Tốt", 5: "Rất tốt" }
    });

    function renderCustomerReviews() {
        const reviews = loadCustomerReviews();
        reviewList.replaceChildren();
        if (!reviews.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "customer-review-empty";
            emptyMessage.textContent = "Chưa có nhận xét nào từ khách hàng. Hãy chia sẻ đánh giá đầu tiên!";
            reviewList.appendChild(emptyMessage);
        } else {
            reviews.slice().reverse().forEach(function (review) {
                const item = document.createElement("article");
                item.className = "customer-review-item";
                const name = document.createElement("h4");
                name.textContent = review.name;
                const meta = document.createElement("p");
                meta.className = "customer-review-meta";
                const score = document.createElement("span");
                score.className = "customer-review-score";
                score.textContent = review.rating + "/5";
                const date = document.createElement("span");
                date.textContent = " · " + review.date;
                meta.append(score, date);
                const comment = document.createElement("p");
                comment.className = "customer-review-text";
                comment.textContent = review.comment;
                item.append(name, meta, comment);
                reviewList.appendChild(item);
            });
        }

        updateReviewSummary(reviews);
    }

    renderCustomerReviews();
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("customer-review-name").value.trim();
        const comment = document.getElementById("customer-review-comment").value.trim();
        const rating = Number(customerRating.val());
        if (!name || !comment || rating < 1 || rating > 5) {
            reviewMessage.textContent = "Vui lòng nhập tên, chọn số sao và viết nhận xét.";
            return;
        }

        const reviews = loadCustomerReviews();
        reviews.push({
            name: name,
            comment: comment,
            rating: rating,
            date: new Date().toLocaleDateString("vi-VN")
        });
        try {
            window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
        } catch (error) {
            reviewMessage.textContent = "Không thể lưu đánh giá trên thiết bị này.";
            return;
        }

        reviewForm.reset();
        customerRating.rating("update", 5);
        reviewMessage.textContent = "Cảm ơn bạn đã gửi đánh giá!";
        renderCustomerReviews();
    });

    const relatedList = document.getElementById("related-products-list");
    const allProducts = Object.keys(products).map(function (productKey) {
        return Object.assign({ key: productKey }, products[productKey]);
    });
    const sameCategory = allProducts.filter(function (item) {
        return item.key !== key && item.categoryId === product.categoryId;
    });
    const otherProducts = allProducts.filter(function (item) {
        return item.key !== key && item.categoryId !== product.categoryId;
    });
    sameCategory.concat(otherProducts).slice(0, 3).forEach(function (item) {
        const column = document.createElement("div");
        column.className = "col-xs-6 col-sm-4";
        const card = document.createElement("article");
        card.className = "related-product-card";
        const imageLink = document.createElement("a");
        imageLink.href = "ecommerce-detail.html?product=" + encodeURIComponent(item.key);
        const image = document.createElement("img");
        image.src = item.images[0];
        image.alt = item.name;
        imageLink.appendChild(image);
        const info = document.createElement("div");
        info.className = "related-product-info";
        const category = document.createElement("p");
        category.textContent = item.category.toUpperCase();
        const name = document.createElement("h3");
        name.textContent = item.name;
        const price = document.createElement("strong");
        price.textContent = item.price;
        const detailLink = document.createElement("a");
        detailLink.href = imageLink.href;
        detailLink.textContent = "Xem chi tiết";
        info.append(category, name, price, detailLink);
        card.append(imageLink, info);
        column.appendChild(card);
        relatedList.appendChild(column);
    });

    const stockPercent = Math.round((product.stock / product.stockCapacity) * 100);
    const stockProgress = document.getElementById("stock-progress");
    const stockCount = document.getElementById("stock-count");
    const quantityInput = document.getElementById("detail-quantity");
    const addToCartButton = document.querySelector(".detail-add-cart");
    stockCount.textContent = product.stock > 0 ? product.stock + " sản phẩm" : "Hết hàng";
    stockProgress.style.width = stockPercent + "%";
    stockProgress.setAttribute("aria-valuenow", String(stockPercent));
    stockProgress.setAttribute("aria-valuetext", product.stock + " sản phẩm còn lại");
    document.getElementById("stock-progress-label").textContent = stockCount.textContent;
    stockProgress.classList.remove("progress-bar-success", "progress-bar-warning", "progress-bar-danger");
    stockProgress.classList.add(product.stock === 0 ? "progress-bar-danger" : stockPercent <= 20 ? "progress-bar-danger" : stockPercent <= 40 ? "progress-bar-warning" : "progress-bar-success");
    quantityInput.max = String(product.stock);
    quantityInput.disabled = product.stock === 0;
    addToCartButton.disabled = product.stock === 0;

    let selectedVariant = "";
    const variantFieldset = document.getElementById("detail-variants");
    const variantOptions = document.getElementById("detail-variant-options");
    if (product.variants && product.variants.length && variantFieldset && variantOptions) {
        variantFieldset.hidden = false;
        product.variants.forEach(function (variant, index) {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "detail-variant-option" + (index === 0 ? " selected" : "");
            option.textContent = variant;
            option.setAttribute("aria-pressed", index === 0 ? "true" : "false");
            if (index === 0) selectedVariant = variant;
            option.addEventListener("click", function () {
                variantOptions.querySelectorAll(".detail-variant-option").forEach(function (item) {
                    item.classList.remove("selected");
                    item.setAttribute("aria-pressed", "false");
                });
                option.classList.add("selected");
                option.setAttribute("aria-pressed", "true");
                selectedVariant = variant;
            });
            variantOptions.appendChild(option);
        });
    }

    const mainImage = document.getElementById("main-product-image");
    const thumbnails = document.getElementById("detail-thumbnails");
    mainImage.src = product.images[0];
    mainImage.setAttribute("xoriginal", product.images[0]);
    mainImage.alt = product.name;
    product.images.forEach(function (src, index) {
        const link = document.createElement("a");
        link.href = src;
        link.className = "detail-thumb" + (index === 0 ? " active" : "");
        link.setAttribute("aria-label", "Xem ảnh " + (index + 1) + " của " + product.name);
        link.addEventListener("click", function (event) {
            event.preventDefault();
            thumbnails.querySelectorAll(".detail-thumb").forEach(function (thumb) { thumb.classList.remove("active"); });
            link.classList.add("active");
            mainImage.src = src;
            mainImage.setAttribute("xoriginal", src);
        });
        const image = document.createElement("img");
        image.className = "xzoom-gallery";
        image.width = 76;
        image.src = src;
        image.setAttribute("xpreview", src);
        image.alt = product.name + " - ảnh " + (index + 1);
        link.appendChild(image);
        thumbnails.appendChild(link);
    });

    $("#main-product-image, .xzoom-gallery").xzoom({
        position: "right",
        mposition: "inside",
        Xoffset: 12,
        fadeIn: true,
        fadeTrans: true
    });

    const quantity = quantityInput;
    document.getElementById("quantity-minus").addEventListener("click", function () {
        quantity.value = Math.max(1, Number(quantity.value) - 1);
    });
    document.getElementById("quantity-plus").addEventListener("click", function () {
        quantity.value = Math.min(product.stock, Number(quantity.value) + 1);
    });
    document.getElementById("detail-product-form").addEventListener("submit", function (event) {
        event.preventDefault();
        quantity.value = Math.max(1, Math.min(product.stock, Number(quantity.value) || 1));
        const variantMessage = selectedVariant ? " · Phân loại: " + selectedVariant : "";
        document.getElementById("detail-cart-message").textContent = product.name + variantMessage + " × " + quantity.value + " đã được thêm vào giỏ hàng.";
    });
}());


(function () {
    var catalog = window.CANDYPOP_CATALOG || {};
    var productAliases = {
        "banh-mi-meo": "moe-di-tay",
        "trai-dua": "moery-xmas",
        "flan": "tuihoa",
        "pho-mai-vaseline": "set-qua-anh-hung",
        "khoai-tay": "ma-may",
        "pho-mai-foam": "bua-dam-them",
        "taba": "set-qua-anh-hung-bua-may-man"
    };

    function getProductKey(href) {
        var key = window.CANDYPOP_PRODUCT_KEY(href);
        return productAliases[key] || key;
    }

    function setProductImage(image, product) {
        if (!image || !product || !product.images || !product.images.length) return;
        image.src = product.images[0];
        image.alt = product.name;
    }

    function getCustomerReviews(key) {
        try {
            var reviews = JSON.parse(window.localStorage.getItem("candypop-reviews-" + key) || "[]");
            return Array.isArray(reviews) ? reviews : [];
        } catch (error) {
            return [];
        }
    }

    document.querySelectorAll("#product-grid .product-item").forEach(function (item) {
        var link = item.querySelector("h4 a[href*='product=']");
        if (!link) return;
        var key = getProductKey(link.href);
        var product = catalog[key];
        if (!product) return;

        link.textContent = product.name;
        link.href = "ecommerce-detail.html?product=" + encodeURIComponent(key);
        item.querySelectorAll(".product-detail").forEach(function (detailLink) { detailLink.href = link.href; });
        var category = item.querySelector(".product-category");
        if (category) category.textContent = product.category.toUpperCase();
        setProductImage(item.querySelector(".product-image img"), product);

        var currentPrice = item.querySelector(".product-price");
        if (currentPrice) currentPrice.textContent = product.price;
        var originalPrice = item.querySelector(".product-price-original");
        if (originalPrice) {
            if (product.originalPrice) {
                originalPrice.textContent = product.originalPrice;
                originalPrice.style.display = "";
            } else {
                originalPrice.style.display = "none";
            }
        }
        var discountBadge = item.querySelector(".product-discount");
        if (discountBadge && product.originalPrice) {
            var originalAmount = Number(product.originalPrice.replace(/\D/g, ""));
            var currentAmount = Number(product.price.replace(/\D/g, ""));
            discountBadge.textContent = "-" + Math.round((originalAmount - currentAmount) / originalAmount * 100) + "%";
        }

        var card = item.querySelector(".product-card");
        if (card) {
            card.dataset.stock = product.stock;
            card.dataset.stockCapacity = product.stockCapacity;
        }
        var ratingInput = item.querySelector(".product-rating input.rating");
        var reviews = getCustomerReviews(key);
        var reviewAverage = reviews.length ? reviews.reduce(function (sum, review) {
            return sum + Number(review.rating || 0);
        }, 0) / reviews.length : 0;
        if (ratingInput) {
            ratingInput.value = reviewAverage;
            ratingInput.setAttribute("value", reviewAverage);
            ratingInput.dataset.hasReviews = reviews.length ? "true" : "false";
            ratingInput.style.display = reviews.length ? "" : "none";
            ratingInput.setAttribute("aria-label", "Đánh giá " + product.name);
        }
        var reviewCount = item.querySelector(".product-rating small");
        if (reviewCount) reviewCount.textContent = reviews.length ? reviews.length + " đánh giá" : "Chưa có đánh giá";

        var description = item.querySelector(".product-description");
        if (!description) {
            description = document.createElement("p");
            description.className = "product-description";
            var rating = item.querySelector(".product-rating");
            if (rating) rating.insertAdjacentElement("afterend", description);
        }
        if (description) description.textContent = product.description;
    });

    if (window.jQuery && jQuery.fn.rating) {
        jQuery("#product-grid .product-rating input.rating[data-has-reviews='true']").rating({
            theme: "krajee-svg",
            size: "xs",
            step: 0.1,
            displayOnly: true,
            showClear: false,
            showCaption: false
        });
    }

    var orderKeys = ["moe-di-tay", "set-qua-anh-hung-bua-may-man", "moery-xmas"];
    document.querySelectorAll(".order-list .order-card").forEach(function (order, index) {
        var product = catalog[orderKeys[index]];
        if (!product) return;
        setProductImage(order.querySelector(".order-image"), product);
        var name = order.querySelector(".order-product-name");
        if (name) {
            name.textContent = product.name;
            name.href = "ecommerce-detail.html?product=" + encodeURIComponent(orderKeys[index]);
        }
        var category = order.querySelector(".order-product-category");
        if (category) category.textContent = product.category;

        var description = order.querySelector(".order-product-description");
        if (!description && category) {
            description = document.createElement("p");
            description.className = "order-product-description";
            category.insertAdjacentElement("afterend", description);
        }
        if (description) description.textContent = product.description;

        var quantity = Number((order.querySelector(".order-quantity") || {}).textContent.replace(/\D/g, "")) || 1;
        var price = Number(product.price.replace(/\D/g, ""));
        var total = (quantity * price).toLocaleString("vi-VN") + "đ";
        var linePrice = order.querySelector(".order-price");
        if (linePrice) linePrice.innerHTML = '<span class="mobile-label">Thành tiền:</span> ' + total;
        var grandTotal = order.querySelector(".order-card-footer strong");
        if (grandTotal) grandTotal.textContent = total;
    });
}());



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
