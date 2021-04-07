var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var images = loadImages(["img/background.png", "img/grass.png", "img/player.png", "img/cactus.png", "img/cactus_revert.png"]);

var jumpChannel = 0;
var jumpSound = [document.getElementById("jump"), document.getElementById("jump2")];
var failSound = document.getElementById("fail");
var jumpVolume = 0.5;
jumpSound[0].volume = jumpVolume;
jumpSound[1].volume = jumpVolume;
failSound.volume = jumpVolume * 2;

var backgroundImage = images[0];
var grassImage = images[1];

var cactusImage = images[3];
var cactusReverseImage = images[4];

var positionOffset = 0;
var backgroundParalax = 0.75;

var score = 0;

var defaultDy = 2;
var defaultDx = 3;
var player = {
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

player.x = (canvas.width - player.image.width) / 2;
player.y = (canvas.height - grassImage.height - player.image.height) / 2;

var cactusCount = 100;
var cactuses = [];
for (var i = 0; i < cactusCount; i++) {
    var gap = 200 - i;
    var cactus = {
        x: (canvas.width / 2 - i) * (i + 2),
        top: (canvas.height - grassImage.height - gap) / 2 + Math.floor((Math.random() * 100) + 1)  - 50,
        gap: gap
    };
    cactuses.push(cactus);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, -((positionOffset * backgroundParalax) % backgroundImage.width), 0);
    ctx.drawImage(backgroundImage, -((positionOffset * backgroundParalax) % backgroundImage.width) + backgroundImage.width, 0);
}

function drawGrass() {
    ctx.drawImage(grassImage, -(positionOffset % grassImage.width), canvas.height - grassImage.height);
    ctx.drawImage(grassImage, -(positionOffset % grassImage.width) + grassImage.width, canvas.height - grassImage.height);
}

function drawCactuses() {
    var start = score;
    for (var i = start - 2; i < start + 2; i++) {
        if (i < cactusCount && i >= 0) {
            var cactus = cactuses[i];
            ctx.drawImage(cactusReverseImage, cactus.x - positionOffset, cactus.top - cactusImage.height);
            ctx.drawImage(cactusImage, cactus.x - positionOffset, cactus.top + cactus.gap);
        }
    }
}

function drawScore() {
    ctx.font = "bold 32px Trebuchet MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(score, canvas.width - 8, 32); 
}

function colisionGrass() {
    return canvas.height - grassImage.height < player.y + player.image.height;
}

function colisionSky() {
    return player.y < 0;
}

function colisionCactus() {
    cactus = cactuses[score];
    var cactusRadius = cactusImage.width / 2;
    var playerRadius = player.image.width / 2;
    var rectColision = player.x + player.image.width >= cactus.x &&
        player.x <= cactus.x + cactusImage.width &&
        (player.y <= cactus.top - cactusRadius || player.y + player.image.height >= cactus.top + cactus.gap + cactusRadius);
    var topMiddle = {x: cactus.x + cactusRadius, y: cactus.top - cactusRadius}; 
    var topDistance = Math.sqrt(Math.pow(player.x + playerRadius - topMiddle.x, 2) + Math.pow(player.y + playerRadius - topMiddle.y, 2));
    var bottomMiddle = {x: cactus.x + cactusRadius, y: cactus.top + cactus.gap + cactusRadius};
    var bottomDistance = Math.sqrt(Math.pow(player.x + playerRadius - bottomMiddle.x, 2) + Math.pow(player.y + playerRadius - bottomMiddle.y, 2));

    var radialColision = topDistance <= cactusRadius + playerRadius || bottomDistance <= cactusRadius + playerRadius;
    
    return rectColision || radialColision;
}

function colision() {
    return colisionGrass() || colisionSky() || colisionCactus();
}

function draw() {
    positionOffset += defaultDx;
    player.move();
    
    if (player.x > cactuses[score].x + cactusImage.width) {
        score++;
    }

    drawBackground();
    drawCactuses();
    drawGrass();
    player.draw();
    drawScore();

    if (colision()) {
        failSound.play();
        alert("GAME OVER");
        document.location.reload();
    }

    requestAnimationFrame(draw);
}

canvas.addEventListener("click", function () {
    jumpSound[jumpChannel++ % 2].play();
    player.jump();
});
draw();