
$(function () {

    // ==============================
    // 1. KHAI BÁO CÁC OBJECT
    // ==============================

    var container = $('#container');
    var bird = $('#bird');
    var pole = $('.pole');
    var pole_1 = $('#pole_1');
    var pole_2 = $('#pole_2');
    var score = $('#score');
    var level = $('#level');

    // ==============================
    // 2. THÔNG SỐ GAME
    // ==============================

    var current_level = 1;
    var game_interval = 40;
    var game_timer = null;

    var container_width = parseInt(container.width());
    var container_height = parseInt(container.height());
    var pole_initial_position = parseInt(pole.css('right'));
    var pole_initial_height = parseInt(pole_1.css('height'));
    var bird_left = parseInt(bird.css('left'));
    var bird_height = parseInt(bird.height());

    // Tốc độ di chuyển của ống
    var speed = 10;

    // ==============================
    // 3. TRẠNG THÁI GAME
    // ==============================

    var go_up = null;
    var score_updated = false;
    var game_over = false;
    var game_started = false;

    // ==============================
    // 4. CẬP NHẬT LEVEL
    // ==============================

    function updateLevel() {

        var current_score = parseInt(score.text());

        var new_level = 1;
        var new_interval = 40;

        if (current_score >= 40) {
            new_level = 4;
            new_interval = 20;
        }
        else if (current_score >= 20) {
            new_level = 3;
            new_interval = 25;
        }
        else if (current_score >= 5) {
            new_level = 2;
            new_interval = 30;
        }

        // Kiểm tra nếu Level thay đổi
        if (new_level !== current_level) {

            current_level = new_level;
            game_interval = new_interval;

            // Hiển thị Level mới
            level.text('Level: ' + current_level);

            // Thay đổi Interval
            if (game_timer !== null && !game_over) {

                clearInterval(game_timer);

                game_timer = setInterval(gameLoop, game_interval);
            }

            console.log('Level: ' + current_level);
            console.log('Interval: ' + game_interval);
        }
    }

    // ==============================
    // 5. BẮT ĐẦU GAME
    // ==============================

    function playGame() {

        if (game_started || game_over) return;

        game_started = true;

        game_timer = setInterval(gameLoop, game_interval);
    }

    // ==============================
    // 6. VÒNG LẶP GAME
    // ==============================

    function gameLoop() {

        // Kiểm tra va chạm
        if (
            collision(bird, pole_1) ||
            collision(bird, pole_2) ||
            parseInt(bird.css('top')) <= 0 ||
            parseInt(bird.css('top')) > container_height - bird_height
        ) {

            stop_the_game();
            return;
        }

        // Lấy vị trí hiện tại của ống
        var pole_current_position = parseInt(pole.css('right'));

        // Cộng điểm khi chim vượt qua ống
        if (pole_current_position > container_width - bird_left) {

            if (score_updated === false) {

                var current_score = parseInt(score.text()) + 1;

                score.text(current_score);

                score_updated = true;

                // Kiểm tra chiến thắng
                if (current_score >= 50) {

                    win_the_game();
                    return;
                }

                // Cập nhật Level
                updateLevel();
            }
        }

        // Khi ống đi ra khỏi màn hình
        if (pole_current_position > container_width) {

            var new_height = parseInt(Math.random() * 100);

            pole_1.css('height', pole_initial_height + new_height);
            pole_2.css('height', pole_initial_height - new_height);

            score_updated = false;

            pole_current_position = pole_initial_position;
        }

        // Di chuyển ống
        pole.css('right', pole_current_position + speed);

        // Chim rơi xuống nếu không bay lên
        if (go_up === null) {

            go_down();
        }
    }

    // ==============================
    // 7. CHIM RƠI XUỐNG
    // ==============================

    function go_down() {

        bird.css('top', parseInt(bird.css('top')) + 8);

        bird.css('transform', 'rotate(30deg)');
    }

    // ==============================
    // 8. CHIM BAY LÊN
    // ==============================

    function up() {

        if (game_over || !game_started) return;

        bird.css('top', parseInt(bird.css('top')) - 12);

        bird.css('transform', 'rotate(-10deg)');
    }

    // ==============================
    // 9. DỪNG CHUYỂN ĐỘNG CHIM
    // ==============================

    function stopBird() {

        clearInterval(go_up);

        go_up = null;
    }

    // ==============================
    // 10. HIỂN THỊ MÀN HÌNH KẾT QUẢ
    // ==============================

    function showResult(isWin) {

        // Hiển thị điểm số
        $('#final_score').text(score.text());

        // Hiển thị Level đạt được
        $('#final_level').text('Level ' + current_level);

        // Thay đổi tiêu đề theo kết quả
        if (isWin) {

            $('#result_title').text('CHÚC MỪNG! BẠN ĐÃ CHIẾN THẮNG!');

        }
        else {

            $('#result_title').text('GAME OVER!');

        }

        // Hiển thị màn hình kết quả
        $('#result_screen').css('display', 'flex');
    }

    // ==============================
    // 11. THUA GAME
    // ==============================

    function stop_the_game() {

        if (game_over) return;

        clearInterval(game_timer);

        stopBird();

        game_timer = null;

        game_over = true;

        // Hiển thị kết quả khi thua
        showResult(false);
    }

    // ==============================
    // 12. CHIẾN THẮNG
    // ==============================

    function win_the_game() {

        if (game_over) return;

        clearInterval(game_timer);

        stopBird();

        game_timer = null;

        game_over = true;

        // Hiển thị kết quả khi thắng
        showResult(true);
    }

    // ==============================
    // 13. ĐIỀU KHIỂN CHIM BẰNG ARROWDOWN
    // ==============================

    $(document).keydown(function (e) {

        if (e.key === 'ArrowDown') {

            e.preventDefault();

            if (game_over || !game_started) return;

            if (go_up === null) {

                go_up = setInterval(up, 40);
            }
        }
    });

    $(document).keyup(function (e) {

        if (e.key === 'ArrowDown') {

            stopBird();
        }
    });

    // ==============================
    // 14. NÚT BẮT ĐẦU GAME
    // ==============================

    $('#play_btn').click(function () {

        playGame();

        $(this).hide();
    });

    // ==============================
    // 15. NÚT CHƠI LẠI
    // ==============================

    $('#restart_btn, #result_restart_btn').click(function () {

        location.reload();
    });

    // ==============================
    // 16. KIỂM TRA VA CHẠM
    // ==============================

    function collision($div1, $div2) {

        var x1 = $div1.offset().left;
        var y1 = $div1.offset().top;
        var h1 = $div1.outerHeight(true);
        var w1 = $div1.outerWidth(true);

        var b1 = y1 + h1;
        var r1 = x1 + w1;

        var x2 = $div2.offset().left;
        var y2 = $div2.offset().top;
        var h2 = $div2.outerHeight(true);
        var w2 = $div2.outerWidth(true);

        var b2 = y2 + h2;
        var r2 = x2 + w2;

        if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) {

            return false;
        }
        else {

            return true;
        }
    }

});
