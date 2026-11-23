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
