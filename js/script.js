const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio("../assets/audio.mp3");

const size = 30; // Tamanho do bloco da cobra e da comida
const initialPosition = { x: 270, y: 240 }; // Posição inicial da cobra
const gridSize = 30; // Tamanho da grade do grid

let snake = [initialPosition];
let direction = null;
let food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
};
let scoreValue = 0;
let isGameOver = false;

// Velocidade do jogo em milissegundos (quanto menor, mais rápido)
let speed = 150;
let lastFrameTime = 0;

// Função para gerar números aleatórios dentro de um intervalo
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Função para gerar uma nova posição aleatória para a comida
function randomPosition() {
    return Math.floor(Math.random() * (canvas.width / size)) * size;
}

// Função para gerar uma cor aleatória para a comida
function randomColor() {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
}

// Desenha a comida no canvas
function drawFood() {
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, size, size);
    ctx.shadowBlur = 0;
}

// Desenha a cobra no canvas
function drawSnake() {
    ctx.fillStyle = "#ddd";
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === snake.length - 1 ? "white" : "#ddd";
        ctx.fillRect(segment.x, segment.y, size, size);
    });
}

// Move a cobra de acordo com a direção atual
function moveSnake() {
    if (!direction) return;

    const head = { ...snake[snake.length - 1] };

    switch (direction) {
        case "right": head.x += size; break;
        case "left": head.x -= size; break;
        case "down": head.y += size; break;
        case "up": head.y -= size; break;
    }

    snake.push(head);

    // Verifica se a cobra comeu a comida
    if (head.x === food.x && head.y === food.y) {
        incrementScore();
        food.x = randomPosition();
        food.y = randomPosition();
        food.color = randomColor();
        updateSpeed(); // Atualiza a velocidade do jogo
        audio.play(); // Reproduz o áudio quando a comida é comida
    } else {
        snake.shift(); // Remove a cauda da cobra
    }
}

// Incrementa a pontuação
function incrementScore() {
    scoreValue += 10;
    score.innerText = scoreValue.toString().padStart(2, '0');
}

// Desenha a grade do canvas
function drawGrid() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// Verifica se a cobra colidiu com as bordas do canvas ou com ela mesma
function checkCollision() {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const selfCollision = snake.slice(0, -1).some(segment => segment.x === head.x && segment.y === head.y);

    if (head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit || selfCollision) {
        gameOver();
    }
}

// Finaliza o jogo e mostra a tela de game over
function gameOver() {
    isGameOver = true;
    direction = null;
    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
    audio.pause(); // Pausa a música ao final do jogo
    audio.currentTime = 0; // Reseta o tempo da música
}

// Atualiza a velocidade do jogo com base na pontuação
function updateSpeed() {
    if (scoreValue % 50 === 0 && scoreValue !== 0) {
        speed = Math.max(50, speed - 10); // Aumenta a velocidade a cada 50 pontos, mas não abaixo de 50 ms
    }
}

// Função principal de loop do jogo
function gameLoop(currentTime) {
    if (isGameOver) return;

    // Calcula o tempo decorrido desde o último frame
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime > speed) {
        lastFrameTime = currentTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawFood();
        moveSnake();
        drawSnake();
        checkCollision();
    }

    // Solicita o próximo frame
    requestAnimationFrame(gameLoop);
}

// Adiciona controle de teclas para mudar a direção da cobra
document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") direction = "right";
    if (key === "ArrowLeft" && direction !== "right") direction = "left";
    if (key === "ArrowDown" && direction !== "up") direction = "down";
    if (key === "ArrowUp" && direction !== "down") direction = "up";
});

// Reinicia o jogo ao clicar no botão "Jogar novamente"
buttonPlay.addEventListener("click", () => {
    scoreValue = 0;
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    snake = [initialPosition];
    food = {
        x: randomPosition(),
        y: randomPosition(),
        color: randomColor()
    };
    direction = null;
    isGameOver = false;
    lastFrameTime = 0; // Reseta o tempo do último frame
    audio.play(); // Reproduz a música quando o jogo é reiniciado
    requestAnimationFrame(gameLoop);
});

// Inicia o loop do jogo
requestAnimationFrame(gameLoop);

