let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let images = loadImages(["img/background.png", "img/grass.png", "img/player.png", "img/cactus.png", "img/cactus_revert.png"]);

let jumpChannel = 0;
let jumpSound = [document.getElementById("jump"), document.getElementById("jump2")];
let failSound = document.getElementById("fail");
let jumpVolume = 0.5;
jumpSound[0].volume = jumpVolume;
jumpSound[1].volume = jumpVolume;
failSound.volume = jumpVolume * 2;

let backgroundImage = images[0];
let grassImage = images[1];

let cactusImage = images[3];
let cactusReverseImage = images[4];

const GameStates = Object.freeze({NOT_STARTED: 1, PLAYING: 2, LOST: 3, WON: 4});
let gameState = GameStates.NOT_STARTED;

let positionOffset = 0;
let backgroundParallax = 0.75;

let score = 0;

let defaultDy = 2;
let defaultDx = 3;
let player = {
    x: 0,
    y: 0,
    dx: defaultDx,
    dy: defaultDy,
    move: function () {
        this.x += this.dx;
        this.y += this.dy;

        if (this.dy < defaultDy) {
            this.dy += 0.5;
        }
    },
    image: images[2],
    draw: function () {
        ctx.drawImage(this.image, this.x - positionOffset, this.y);
    },
    jump: function () {
        this.dy = -4 * defaultDy;
    }
};

function resetGame() {
    positionOffset = 0;
    score = 0;
    player.x = (canvas.width - player.image.width) / 2;
    player.y = (canvas.height - grassImage.height - player.image.height) / 2;
}
resetGame();

let cactusCount = 100;
let cacti = [];
function generateCacti() {
    cacti = [];
    for (let i = 0; i < cactusCount; i++) {
        let gap = 200 - i;
        let cactus = {
            x: (canvas.width / 2 - i) * (i + 2),
            top: (canvas.height - grassImage.height - gap) / 2 + Math.floor((Math.random() * 100) + 1) - 50,
            gap: gap
        };
        cacti.push(cactus);
    }
}
generateCacti();

function drawBackground() {
    ctx.drawImage(backgroundImage, -((positionOffset * backgroundParallax) % backgroundImage.width), 0);
    ctx.drawImage(backgroundImage, -((positionOffset * backgroundParallax) % backgroundImage.width) + backgroundImage.width, 0);
}

function drawGrass() {
    ctx.drawImage(grassImage, -(positionOffset % grassImage.width), canvas.height - grassImage.height);
    ctx.drawImage(grassImage, -(positionOffset % grassImage.width) + grassImage.width, canvas.height - grassImage.height);
}

function drawCacti() {
    let start = score;
    for (let i = start - 2; i < start + 2; i++) {
        if (i < cactusCount && i >= 0) {
            let cactus = cacti[i];
            ctx.drawImage(cactusReverseImage, cactus.x - positionOffset, cactus.top - cactusImage.height);
            ctx.drawImage(cactusImage, cactus.x - positionOffset, cactus.top + cactus.gap);
        }
    }
}

function drawScore() {
    ctx.font = "bold 32px Trebuchet MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(score.toString(), canvas.width - 8, 32);
}

function drawGameState() {
    let text = "";
    if (gameState === GameStates.NOT_STARTED) {
        text = "Click to start!"
    }
    if (gameState === GameStates.LOST) {
        text = "GAME OVER!"
    }
    if (gameState === GameStates.WON) {
        text = "You WON!"
    }

    ctx.font = "bold 32px Trebuchet MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, (canvas.height - 32) / 2);
}

function collisionGrass() {
    return canvas.height - grassImage.height < player.y + player.image.height;
}

function collisionSky() {
    return player.y < 0;
}

function collisionCactus() {
    let cactus = cacti[score];
    let cactusRadius = cactusImage.width / 2;
    let playerRadius = player.image.width / 2;
    let rectCollision = player.x + player.image.width >= cactus.x &&
        player.x <= cactus.x + cactusImage.width &&
        (player.y <= cactus.top - cactusRadius || player.y + player.image.height >= cactus.top + cactus.gap + cactusRadius);
    let topMiddle = {x: cactus.x + cactusRadius, y: cactus.top - cactusRadius};
    let topDistance = Math.sqrt(Math.pow(player.x + playerRadius - topMiddle.x, 2) + Math.pow(player.y + playerRadius - topMiddle.y, 2));
    let bottomMiddle = {x: cactus.x + cactusRadius, y: cactus.top + cactus.gap + cactusRadius};
    let bottomDistance = Math.sqrt(Math.pow(player.x + playerRadius - bottomMiddle.x, 2) + Math.pow(player.y + playerRadius - bottomMiddle.y, 2));

    let radialCollision = topDistance <= cactusRadius + playerRadius || bottomDistance <= cactusRadius + playerRadius;

    return rectCollision || radialCollision;
}

function collision() {
    return collisionGrass() || collisionSky() || collisionCactus();
}

function draw() {
    if (gameState === GameStates.PLAYING) {
        positionOffset += defaultDx;
        player.move();

        if (collision()) {
            failSound.play();
            gameState = GameStates.LOST;
        }

        if (player.x > cacti[score].x + cactusImage.width) {
            score++;
            if (score === cacti.length) {
                gameState = GameStates.WON;
            }
        }
    }

    drawBackground();
    drawCacti();
    drawGrass();
    player.draw();
    drawScore();
    drawGameState();

    requestAnimationFrame(draw);
}

canvas.addEventListener("click", function () {
    if (gameState !== GameStates.PLAYING) {
        if (gameState === GameStates.LOST || gameState === GameStates.WON) {
            resetGame();
            generateCacti();
        }
        gameState = GameStates.PLAYING;
    }
    jumpSound[jumpChannel++ % 2].play();
    player.jump();
});
draw();