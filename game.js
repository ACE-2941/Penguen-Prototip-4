const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const puanYazisi = document.getElementById("puanTablosu");
const menuDiv = document.getElementById("menu");
const btnNewGame = document.getElementById("btnNewGame");

/* --------- SES UI EK --------- */
const soundUI = document.getElementById("soundUI");
const menuVideo = document.getElementById("menuVideo");
let soundEnabled = localStorage.getItem("sound") !== "off";

function updateSoundUI() {
    soundUI.textContent = soundEnabled ? "🔊 Ses" : "🔇 Ses";
    if (menuVideo) menuVideo.muted = !soundEnabled;
}
updateSoundUI();

soundUI.onclick = () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("sound", soundEnabled ? "on" : "off");
    updateSoundUI();
};
/* -------------------------------- */

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = false;

// SES
const passSound = new Audio("assets/rise1.aif");

function playPassSound() {
    if (!soundEnabled) return;
    passSound.currentTime = 0;
    passSound.play().catch(()=>{});
}

// Görseller
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const backgroundImg = new Image();
backgroundImg.src = "assets/arka-plan.jpg";

const iceImg = new Image();
iceImg.src = "assets/buz.png";

const penguin = {
    x: 148,
    y: 540,
    w: 64,
    h: 64,
    frameX: 0,
    maxFrames: 6,
    fps: 0,
    stagger: 8,
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

/* ---------------- MENU START ---------------- */

btnNewGame.onclick = () => {
    if (menuVideo) menuVideo.muted = !soundEnabled; // EKLENDİ
    menuDiv.style.display = "none";
    puanYazisi.style.display = "block";
    resetGame();
    gameActive = true;
    gameLoop();
};

function resetGame() {
    puan = 0;
    puanYazisi.innerText = "PUAN: 0";
    obstacles = [];
    timer = 0;
    penguin.x = 148;
}

/* ---------------- CONTROLS ---------------- */

window.onkeydown = (e) => {
    if (!gameActive) return;
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
};

window.onkeyup = () => moveDir = 0;

canvas.ontouchstart = (e) => {
    if (!gameActive) return;
    e.preventDefault();
    const tx = e.touches[0].clientX;
    moveDir = tx < window.innerWidth / 2 ? -1 : 1;
};

canvas.ontouchend = () => moveDir = 0;

/* ---------------- UPDATE ---------------- */

function update() {
    if (!gameActive) return;

    penguin.x += moveDir * 8;

    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w)
        penguin.x = canvas.width - penguin.w;

    if (++timer > 55) {
        obstacles.push({
            x: Math.random() * (canvas.width - 40),
            y: -80,
            w: 40,
            h: 80,
        });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += 6 + puan / 20;

        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
            puanYazisi.innerText = "PUAN: " + puan;
            playPassSound(); // DEĞİŞTİ
        }

        if (
            penguin.x + 15 < o.x + o.w &&
            penguin.x + 49 > o.x &&
            penguin.y + 15 < o.y + o.h &&
            penguin.y + 60 > o.y
        ) {
            gameActive = false;
            alert("PUANIN: " + puan);
            location.reload();
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

/* ---------------- DRAW ---------------- */

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImg.complete) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }

    if (iceImg.complete) {
        obstacles.forEach(o => {
            ctx.drawImage(iceImg, o.x, o.y, o.w, o.h);
        });
    }

    if (penguinImg.complete) {
        const spriteWidth = penguinImg.width / penguin.maxFrames;

        ctx.drawImage(
            penguinImg,
            penguin.frameX * spriteWidth,
            0,
            spriteWidth,
            penguinImg.height,
            penguin.x,
            penguin.y,
            penguin.w,
            penguin.h
        );
    }
}

/* ---------------- LOOP ---------------- */

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}
