const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuVideo = document.getElementById("menuVideo");
const menuDiv = document.getElementById("menu");
const btnNewGame = document.getElementById("btnNewGame");
const puanYazisi = document.getElementById("puanTablosu");
const soundUI = document.getElementById("soundUI");

canvas.width = 360;
canvas.height = 640;

let soundEnabled = localStorage.getItem("sound") !== "off";
let gameActive = false;
let moveDir = 0;
let puan = 0;

/* ---------- 1. VİDEO & SES SİSTEMİ ---------- */
function videoVeSesDuzenle() {
    menuVideo.muted = true; // Tarayıcı izin versin diye önce sessiz yap
    menuVideo.play().catch(e => console.log("Video başlatılamadı"));

    // Kullanıcı ekrana dokunduğu an sesi aç
    const sesAc = () => {
        if (soundEnabled) menuVideo.muted = false;
        document.removeEventListener('touchstart', sesAc);
        document.removeEventListener('mousedown', sesAc);
    };
    document.addEventListener('touchstart', sesAc);
    document.addEventListener('mousedown', sesAc);
}
window.addEventListener('load', videoVeSesDuzenle);

const passSound = new Audio("assets/rise1.mp3");
function playPassSound() {
    if (!soundEnabled) return;
    let s = passSound.cloneNode();
    s.play().catch(() => {});
}

soundUI.onclick = () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("sound", soundEnabled ? "on" : "off");
    soundUI.textContent = soundEnabled ? "🔊 Ses" : "🔇 Ses";
    if (menuVideo) menuVideo.muted = !soundEnabled;
};

/* ---------- 2. KONTROLLER (MOBİL & PC) ---------- */
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
};
window.onkeyup = () => moveDir = 0;

// Mobilde dokunma
canvas.addEventListener('touchstart', (e) => {
    if (!gameActive) return;
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    moveDir = touchX < window.innerWidth / 2 ? -1 : 1;
}, {passive: false});
canvas.addEventListener('touchend', () => moveDir = 0);

/* ---------- 3. GÖRSELLER ---------- */
const penguinImg = new Image(); penguinImg.src = "assets/penguin.png";
const backgroundImg = new Image(); backgroundImg.src = "assets/arka-plan.jpg";
const iceImg = new Image(); iceImg.src = "assets/buz.png";

const penguin = { x: 148, y: 540, w: 64, h: 64, frameX: 0, maxFrames: 6, fps: 0, stagger: 8 };
let obstacles = [];
let timer = 0;

/* ---------- 4. OYUN DÖNGÜSÜ ---------- */
btnNewGame.onclick = () => {
    menuVideo.pause();
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

function update() {
    if (!gameActive) return;
    penguin.x += moveDir * 8;
    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    if (++timer > 55) {
        obstacles.push({ x: Math.random() * (canvas.width - 40), y: -80, w: 40, h: 80 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += 6 + puan / 20;
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
            puanYazisi.innerText = "PUAN: " + puan;
            playPassSound(); // ✅ BURADA ÇALIYOR
        }
        if (penguin.x + 15 < o.x + o.w && penguin.x + 49 > o.x && 
            penguin.y + 15 < o.y + o.h && penguin.y + 60 > o.y) {
            gameActive = false;
            alert("PUANIN: " + puan);
            location.reload();
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImg.complete) ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    if (iceImg.complete) obstacles.forEach(o => ctx.drawImage(iceImg, o.x, o.y, o.w, o.h));
    if (penguinImg.complete) {
        const sw = penguinImg.width / penguin.maxFrames;
        ctx.drawImage(penguinImg, penguin.frameX * sw, 0, sw, penguinImg.height, penguin.x, penguin.y, penguin.w, penguin.h);
    }
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}
