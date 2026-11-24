(function () {
    var container = document.getElementById("container");
    var bird = document.getElementById("bird");
    var poles = Array.prototype.slice.call(document.querySelectorAll(".pole"));
    var topPole = document.getElementById("pole_1");
    var bottomPole = document.getElementById("pole_2");
    var scoreLabel = document.getElementById("score");
    var levelLabel = document.getElementById("level");
    var levelUpNotice = document.getElementById("level-up-notice");
    var bestScoreLabel = document.getElementById("best_score");
    var playButton = document.getElementById("play_btn");
    var resultScreen = document.getElementById("result_screen");

    if (!container || !bird || poles.length !== 2) return;

    var containerRect = container.getBoundingClientRect();
    var birdRect = bird.getBoundingClientRect();
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;
    var birdStartTop = birdRect.top - containerRect.top;
    var birdStartLeft = birdRect.left - containerRect.left;
    var pipeStartRight = parseFloat(window.getComputedStyle(topPole).right) || -64;
    var pipeRight = pipeStartRight;
    var topPipeStartHeight = parseFloat(window.getComputedStyle(topPole).height);
    var bottomPipeStartHeight = parseFloat(window.getComputedStyle(bottomPole).height);

    var score = 0;
    var bestScore = 0;
    var level = 1;
    var birdTop = birdStartTop;
    var birdVelocity = 0;
    var gameStarted = false;
    var gameOver = false;
    var isFlapping = false;
    var pipeScored = false;
    var lastFrameTime = 0;
    var animationFrame = null;
    var levelNoticeTimer = null;

    var gravity = 1100;
    var flapSpeed = -250;
    var heldFlapSpeed = -180;
    var speedByLevel = { 1: 250, 2: 330, 3: 410, 4: 490 };

    try {
        bestScore = Number(window.localStorage.getItem("flappy-bird-best-score")) || 0;
    } catch (error) {
        bestScore = 0;
    }
    if (bestScoreLabel) bestScoreLabel.textContent = bestScore;

    function setPipePosition() {
        var offsetX = -(pipeRight - pipeStartRight);
        var transform = "translate3d(" + offsetX + "px, 0, 0)";
        poles.forEach(function (pole) {
            pole.style.transform = transform;
        });
    }

    function setBirdPosition() {
        var offsetY = birdTop - birdStartTop;
        var tilt = Math.max(-28, Math.min(65, birdVelocity * 0.075));
        bird.style.transform = "translate3d(0, " + offsetY + "px, 0) rotate(" + tilt + "deg)";
    }

    function movePipePair() {
        var randomHeight = Math.floor(Math.random() * 100);
        topPole.style.height = (topPipeStartHeight + randomHeight) + "px";
        bottomPole.style.height = (bottomPipeStartHeight - randomHeight) + "px";
        pipeRight = pipeStartRight;
        pipeScored = false;
        setPipePosition();
    }

    function updateLevel() {
        var newLevel = score >= 40 ? 4 : score >= 20 ? 3 : score >= 5 ? 2 : 1;
        if (newLevel === level) return;
        level = newLevel;
        levelLabel.textContent = "Level: " + level;
        if (levelUpNotice) {
            levelUpNotice.textContent = "LEVEL UP!";
            levelUpNotice.classList.add("is-visible");
            window.clearTimeout(levelNoticeTimer);
            levelNoticeTimer = window.setTimeout(function () {
                levelUpNotice.classList.remove("is-visible");
            }, 1400);
        }
    }

    function hasCollision() {
        var birdRectNow = bird.getBoundingClientRect();
        var containerRectNow = container.getBoundingClientRect();
        if (birdRectNow.top <= containerRectNow.top || birdRectNow.bottom >= containerRectNow.bottom) return true;

        for (var i = 0; i < poles.length; i++) {
            var poleRect = poles[i].getBoundingClientRect();
            var overlaps = birdRectNow.right > poleRect.left &&
                birdRectNow.left < poleRect.right &&
                birdRectNow.bottom > poleRect.top &&
                birdRectNow.top < poleRect.bottom;
            if (overlaps) return true;
        }
        return false;
    }

    function finishGame(won) {
        if (gameOver) return;
        gameOver = true;
        gameStarted = false;
        isFlapping = false;
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        animationFrame = null;

        document.getElementById("final_score").textContent = score;
        document.getElementById("final_level").textContent = "Level " + level;
        document.getElementById("result_title").textContent = won ? "CHÚC MỪNG! BẠN ĐÃ CHIẾN THẮNG!" : "GAME OVER!";
        if (score > bestScore) {
            bestScore = score;
            if (bestScoreLabel) bestScoreLabel.textContent = bestScore;
            try {
                window.localStorage.setItem("flappy-bird-best-score", String(bestScore));
            } catch (error) {
                // The game remains playable when browser storage is unavailable.
            }
        }
        resultScreen.style.display = "flex";
    }

    function frame(now) {
        if (!gameStarted || gameOver) return;

        if (!lastFrameTime) lastFrameTime = now;
        // Cap frame delta to avoid a large jump after the tab was inactive.
        var delta = Math.min((now - lastFrameTime) / 1000, 0.04);
        lastFrameTime = now;

        if (isFlapping) {
            birdVelocity = Math.min(birdVelocity, heldFlapSpeed);
        } else {
            birdVelocity += gravity * delta;
        }
        birdTop += birdVelocity * delta;
        setBirdPosition();

        pipeRight += speedByLevel[level] * delta;
        setPipePosition();

        var scoreThreshold = containerWidth - birdStartLeft;
        if (!pipeScored && pipeRight > scoreThreshold) {
            pipeScored = true;
            score++;
            scoreLabel.textContent = score;
            updateLevel();
            if (score >= 50) {
                finishGame(true);
                return;
            }
        }

        if (pipeRight > containerWidth) movePipePair();

        if (hasCollision()) {
            finishGame(false);
            return;
        }

        animationFrame = window.requestAnimationFrame(frame);
    }

    function startGame() {
        if (gameStarted || gameOver) return;
        gameStarted = true;
        lastFrameTime = 0;
        if (playButton) playButton.style.display = "none";
        animationFrame = window.requestAnimationFrame(frame);
    }

    function flap() {
        if (!gameStarted || gameOver) return;
        isFlapping = true;
        birdVelocity = flapSpeed;
    }

    function releaseFlap() {
        isFlapping = false;
    }

    if (playButton) {
        playButton.addEventListener("click", startGame);
    }

    document.addEventListener("keydown", function (event) {
        if (event.code !== "ArrowDown" && event.code !== "Space") return;
        event.preventDefault();
        if (event.repeat) return;
        flap();
    });
    document.addEventListener("keyup", function (event) {
        if (event.code === "ArrowDown" || event.code === "Space") releaseFlap();
    });

    container.addEventListener("pointerdown", function (event) {
        if (event.target === playButton || !gameStarted) return;
        event.preventDefault();
        flap();
    });
    window.addEventListener("pointerup", releaseFlap);
    window.addEventListener("pointercancel", releaseFlap);
    window.addEventListener("blur", releaseFlap);

    var restartButtons = document.querySelectorAll("#restart_btn, #result_restart_btn");
    restartButtons.forEach(function (button) {
        button.addEventListener("click", function () { window.location.reload(); });
    });

    // Keep the initial layout stable before the player starts.
    setPipePosition();
    setBirdPosition();
}());
