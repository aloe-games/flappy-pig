let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let backgroundImage;
let grassImage;

let cactusImage;
let cactusReverseImage;

const GameStates = Object.freeze({NOT_STARTED: 1, PLAYING: 2, LOST: 3, WON: 4});
let gameState = GameStates.NOT_STARTED;

let positionOffset = 0;
let backgroundParallax = 0.75;

let score = 0;

let defaultDy = 2;
let defaultDx = 3;
let player;

let frame = 0;
let step = 0;

let agent = {
    w: [[-0.099252, 0.577531], [-2.340253, -4.562271]],
    b: [0.145681, -0.008051],
    forward: function (observations, action) {
        return observations[0] * this.w[action][0] + observations[1] * this.w[action][1] + this.b[action]
    },
    act: function (observations) {
        return this.forward(observations, 1) > this.forward(observations, 0);
    },
    learn: function (observations, action, reward, next_observations) {
        console.log(observations, action, reward, next_observations)
    }
};

function resetGame() {
    positionOffset = 0;
    score = 0;
    player.x = (canvas.width - player.image.width) / 2;
    player.y = (canvas.height - grassImage.height - player.image.height) / 2;
    frame = 0;
    step = 0;
}

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
    let rectCollision = player.x + player.image.width >= cactus.x && player.x <= cactus.x + cactusImage.width && (player.y <= cactus.top - cactusRadius || player.y + player.image.height >= cactus.top + cactus.gap + cactusRadius);
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

let prev_observations;
let action;
let reward;

function draw() {
    reward = 1;
    if (gameState === GameStates.PLAYING) {
        positionOffset += defaultDx;
        player.move();

        if (collision()) {
            gameState = GameStates.LOST;
            reward = -100;
        }

        if (player.x > cacti[score].x + cactusImage.width) {
            score++;
            if (score === cacti.length) {
                gameState = GameStates.WON;
                reward = 100;
            }
        }
    }

    if (gameState !== GameStates.PLAYING) {
        if (gameState === GameStates.LOST || gameState === GameStates.WON) {
            resetGame();
            generateCacti();
        }
        gameState = GameStates.PLAYING;
    }

    if (frame % 3 === 0) {
        let observations = [cacti[score].x - (player.x + player.image.width), cacti[score].top + cacti[score].gap - (player.y + player.image.height)];

        if (prev_observations) {
            agent.learn(prev_observations, action, reward, observations)
        }

        action = agent.act(observations);
        if (action) {
            player.jump();
        }

        prev_observations = observations
        step++;
    }

    drawBackground();
    drawCacti();
    drawGrass();
    player.draw();
    drawScore();

    frame++;
    requestAnimationFrame(draw);
}

function startGame(images) {
    backgroundImage = images[0];
    grassImage = images[1];

    cactusImage = images[3];
    cactusReverseImage = images[4];

    player = {
        x: 0, y: 0, dx: defaultDx, dy: defaultDy, move: function () {
            this.x += this.dx;
            this.y += this.dy;

            if (this.dy < defaultDy) {
                this.dy += 0.5;
            }
        }, image: images[2], draw: function () {
            ctx.drawImage(this.image, this.x - positionOffset, this.y);
        }, jump: function () {
            this.dy = -4 * defaultDy;
        }
    };

    resetGame();
    generateCacti();
    draw();
}

function loadImages(imagePaths, callback) {
    let images = [];
    for (let i = 0; i < imagePaths.length; i++) {
        images[i] = new Image();
    }
    for (let i = 0; i < imagePaths.length - 1; i++) {
        images[i].onload = function () {
            images[i + 1].src = imagePaths[i + 1];
        }
    }
    images[imagePaths.length - 1].onload = function () {
        callback(images)
    };
    images[0].src = imagePaths[0];
}

loadImages(["img/background.png", "img/grass.png", "img/player.png", "img/cactus.png", "img/cactus_revert.png"], startGame);
