// Oyuncu isimleri
let player1Name = '';
let player2Name = '';

// Canvas ve context tanımlamaları
const canvas1 = document.getElementById('tetris1');
const canvas2 = document.getElementById('tetris2');
const context1 = canvas1.getContext('2d');
const context2 = canvas2.getContext('2d');

// Hold ve Next piece canvas'ları
const holdCanvas1 = document.getElementById('hold1');
const holdCanvas2 = document.getElementById('hold2');
const nextCanvas1 = document.getElementById('next1');
const nextCanvas2 = document.getElementById('next2');
const holdContext1 = holdCanvas1.getContext('2d');
const holdContext2 = holdCanvas2.getContext('2d');
const nextContext1 = nextCanvas1.getContext('2d');
const nextContext2 = nextCanvas2.getContext('2d');

function startGame() {
    // İsimleri al
    player1Name = document.getElementById('player1').value.trim() || 'Oyuncu 1';
    player2Name = document.getElementById('player2').value.trim() || 'Oyuncu 2';

    // Form ve oyun alanını göster/gizle
    document.getElementById('name-form').style.display = 'none';
    document.querySelector('.game-container').style.display = 'flex';

    // Oyunu başlat
    createPiece(players.p1);
    createPiece(players.p2);
    update();
}

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

// Tetris parçaları
const PIECES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

const COLORS = [
    '#FF0D72', '#0DC2FF', '#0DFF72',
    '#F538FF', '#FF8E0D', '#FFE138',
    '#3877FF'
];

// Her oyuncu için ayrı oyun durumu
const players = {
    p1: {
        board: Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)),
        score: 0,
        level: 1,
        gameOver: false,
        dropCounter: 0,
        lastTime: 0,
        dropInterval: 1000,
        context: context1,
        piece: {
            position: {x: 0, y: 0},
            shape: null,
            color: null
        },
        holdPiece: {
            shape: null,
            color: null
        },
        nextPiece: {
            shape: null,
            color: null
        },
        canHold: true
    },
    p2: {
        board: Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)),
        score: 0,
        level: 1,
        gameOver: false,
        dropCounter: 0,
        lastTime: 0,
        dropInterval: 1000,
        context: context2,
        piece: {
            position: {x: 0, y: 0},
            shape: null,
            color: null
        },
        holdPiece: {
            shape: null,
            color: null
        },
        nextPiece: {
            shape: null,
            color: null
        },
        canHold: true
    }
};

function createPiece(player) {
    // If we have a next piece, use it; otherwise generate a new one
    if (player.nextPiece.shape) {
        player.piece.shape = player.nextPiece.shape;
        player.piece.color = player.nextPiece.color;
    } else {
        const pieceIndex = Math.floor(Math.random() * PIECES.length);
        player.piece.shape = PIECES[pieceIndex];
        player.piece.color = COLORS[pieceIndex];
    }
    
    // Generate next piece
    const nextPieceIndex = Math.floor(Math.random() * PIECES.length);
    player.nextPiece.shape = PIECES[nextPieceIndex];
    player.nextPiece.color = COLORS[nextPieceIndex];
    
    player.piece.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.piece.shape[0].length / 2);
    player.piece.position.y = 0;
    player.canHold = true; // Reset hold ability

    if (checkCollision(player)) {
        player.gameOver = true;
        playSound('gameOverSound');
    }
}

function checkCollision(player) {
    for (let y = 0; y < player.piece.shape.length; y++) {
        for (let x = 0; x < player.piece.shape[y].length; x++) {
            if (player.piece.shape[y][x] !== 0) {
                const boardX = player.piece.position.x + x;
                const boardY = player.piece.position.y + y;

                if (boardX < 0 || boardX >= BOARD_WIDTH ||
                    boardY >= BOARD_HEIGHT ||
                    (boardY >= 0 && player.board[boardY][boardX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function calculateGhostPosition(player) {
    let ghostY = player.piece.position.y;
    
    // Keep moving down until we hit something
    while (true) {
        // Create a temporary piece to test collision
        const originalY = player.piece.position.y;
        player.piece.position.y = ghostY + 1;
        
        if (checkCollision(player)) {
            player.piece.position.y = originalY; // Restore original position
            return ghostY;
        }
        
        ghostY++;
        player.piece.position.y = originalY; // Restore original position
    }
}

function mergePiece(player) {
    player.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                player.board[y + player.piece.position.y][x + player.piece.position.x] = player.piece.color;
            }
        });
    });
}

// Encouragement messages in Turkish
const ENCOURAGEMENT_MESSAGES = [
    "Harika! 🌟",
    "Mükemmel! ✨", 
    "Çok iyi! 🎉",
    "Süper! 🚀",
    "Bravo! 👏",
    "Enfes! 🌈",
    "Aferin! ⭐",
    "Muhteşem! 🎊"
];

const MILESTONE_MESSAGES = {
    100: "İlk 100 puan! 🎯",
    500: "500 puan! Devam! 🔥",
    1000: "1000 puan! İnanılmaz! 🏆",
    2000: "2000 puan! Champion! 👑",
    5000: "5000 puan! Efsane! ⚡"
};

function showEncouragementMessage(player, message) {
    const playerId = player === players.p1 ? '1' : '2';
    const messageElement = document.getElementById(`message${playerId}`);
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messageElement.textContent = '';
    }, 3000);
}

function clearLines(player) {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (player.board[y].every(value => value !== 0)) {
            player.board.splice(y, 1);
            player.board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }

    if (linesCleared > 0) {
        playSound('lineClearSound');
        const oldScore = player.score;
        player.score += linesCleared * 100 * player.level;
        document.getElementById(`score${player === players.p1 ? '1' : '2'}`).textContent = player.score;
        
        // Show encouragement message for line clear
        const randomMessage = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
        showEncouragementMessage(player, randomMessage);
        
        // Check for milestone achievements
        for (const milestone in MILESTONE_MESSAGES) {
            if (oldScore < milestone && player.score >= milestone) {
                setTimeout(() => {
                    showEncouragementMessage(player, MILESTONE_MESSAGES[milestone]);
                }, 1500);
                break;
            }
        }
        
        if (player.score >= player.level * 1000) {
            player.level++;
            document.getElementById(`level${player === players.p1 ? '1' : '2'}`).textContent = player.level;
            player.dropInterval = Math.max(100, 1000 - (player.level - 1) * 100);
        }
    }
}

function drawMiniPiece(context, shape, color, canvasWidth, canvasHeight) {
    context.fillStyle = '#1a252f';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    
    if (shape) {
        const blockSize = 15; // Smaller blocks for mini display
        const offsetX = (canvasWidth - shape[0].length * blockSize) / 2;
        const offsetY = (canvasHeight - shape.length * blockSize) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = color;
                    context.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
}

function draw(player) {
    const isPlayer1 = player === players.p1;
    player.context.fillStyle = '#000';
    player.context.fillRect(0, 0, canvas1.width, canvas1.height);

    // İsmi çiz
    player.context.fillStyle = '#fff';
    player.context.font = '20px "Press Start 2P"';
    player.context.textAlign = 'center';
    player.context.fillText(
        isPlayer1 ? player1Name : player2Name,
        canvas1.width / 2,
        35
    );

    // Oyun alanını aşağı kaydır
    player.context.save();
    player.context.translate(0, 40);

    // Oyun tahtasını çiz
    player.board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                player.context.fillStyle = value;
                player.context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });

    // Aktif parçayı çiz
    if (player.piece.shape) {
        // Ghost piece'i çiz (yarı saydam)
        const ghostY = calculateGhostPosition(player);
        if (ghostY > player.piece.position.y) {
            player.piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        player.context.fillStyle = player.piece.color;
                        player.context.globalAlpha = 0.3; // Yarı saydam
                        player.context.fillRect(
                            (player.piece.position.x + x) * BLOCK_SIZE,
                            (ghostY + y) * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                        player.context.globalAlpha = 1.0; // Normal opaklık
                    }
                });
            });
        }
        
        // Normal parçayı çiz
        player.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    player.context.fillStyle = player.piece.color;
                    player.context.fillRect(
                        (player.piece.position.x + x) * BLOCK_SIZE,
                        (player.piece.position.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    if (player.gameOver) {
        player.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        player.context.fillRect(0, 0, canvas1.width, canvas1.height);
        player.context.fillStyle = '#fff';
        player.context.font = '20px "Press Start 2P"';
        player.context.textAlign = 'center';
        player.context.fillText('OYUN BİTTİ', canvas1.width / 2, canvas1.height / 2);
        
        // Diğer oyuncu hala oynuyorsa tebrik mesajını göster
        const otherPlayer = player === players.p1 ? players.p2 : players.p1;
        if (!otherPlayer.gameOver) {
            player.context.fillStyle = '#FFD700';
            player.context.font = '16px "Press Start 2P"';
            player.context.fillText('Birbirinizi tebrik edin!', canvas1.width / 2, canvas1.height / 2 + 40);
        }
    }

    player.context.restore();
}

function holdPiece(player) {
    if (!player.canHold) return;
    
    if (player.holdPiece.shape === null) {
        // First time holding - store current piece and create new one
        player.holdPiece.shape = player.piece.shape;
        player.holdPiece.color = player.piece.color;
        createPiece(player);
    } else {
        // Swap current piece with held piece
        const tempShape = player.piece.shape;
        const tempColor = player.piece.color;
        
        player.piece.shape = player.holdPiece.shape;
        player.piece.color = player.holdPiece.color;
        player.piece.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.piece.shape[0].length / 2);
        player.piece.position.y = 0;
        
        player.holdPiece.shape = tempShape;
        player.holdPiece.color = tempColor;
    }
    
    player.canHold = false; // Can only hold once per piece
}

function moveDown(player) {
    player.piece.position.y++;
    if (checkCollision(player)) {
        player.piece.position.y--;
        playSound('landSound');
        mergePiece(player);
        clearLines(player);
        createPiece(player);
    }
}

function moveLeft(player) {
    player.piece.position.x--;
    if (checkCollision(player)) {
        player.piece.position.x++;
    }
}

function moveRight(player) {
    player.piece.position.x++;
    if (checkCollision(player)) {
        player.piece.position.x--;
    }
}

// Sound effects
function playSound(soundId) {
    try {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
}

function rotate(player) {
    const originalShape = player.piece.shape;
    const rotated = player.piece.shape[0].map((_, i) =>
        player.piece.shape.map(row => row[i]).reverse()
    );
    player.piece.shape = rotated;

    if (checkCollision(player)) {
        player.piece.shape = originalShape;
    } else {
        playSound('rotateSound');
    }
}

// Oyuncu 1 kontrolleri
function moveLeft1() { moveLeft(players.p1); }
function moveRight1() { moveRight(players.p1); }
function moveDown1() { moveDown(players.p1); }
function rotate1() { rotate(players.p1); }
function hold1() { holdPiece(players.p1); }

// Oyuncu 2 kontrolleri
function moveLeft2() { moveLeft(players.p2); }
function moveRight2() { moveRight(players.p2); }
function moveDown2() { moveDown(players.p2); }
function rotate2() { rotate(players.p2); }
function hold2() { holdPiece(players.p2); }

function update(time = 0) {
    // Oyuncu 1 güncelleme
    const deltaTime1 = time - players.p1.lastTime;
    players.p1.lastTime = time;
    players.p1.dropCounter += deltaTime1;

    if (players.p1.dropCounter > players.p1.dropInterval) {
        moveDown(players.p1);
        players.p1.dropCounter = 0;
    }

    // Oyuncu 2 güncelleme
    const deltaTime2 = time - players.p2.lastTime;
    players.p2.lastTime = time;
    players.p2.dropCounter += deltaTime2;

    if (players.p2.dropCounter > players.p2.dropInterval) {
        moveDown(players.p2);
        players.p2.dropCounter = 0;
    }

    draw(players.p1);
    draw(players.p2);
    
    // Draw hold and next pieces
    const isPlayer1 = true;
    drawMiniPiece(holdContext1, players.p1.holdPiece.shape, players.p1.holdPiece.color, 80, 80);
    drawMiniPiece(nextContext1, players.p1.nextPiece.shape, players.p1.nextPiece.color, 80, 80);
    drawMiniPiece(holdContext2, players.p2.holdPiece.shape, players.p2.holdPiece.color, 80, 80);
    drawMiniPiece(nextContext2, players.p2.nextPiece.shape, players.p2.nextPiece.color, 80, 80);

    if (!players.p1.gameOver || !players.p2.gameOver) {
        requestAnimationFrame(update);
    }

    if (players.p1.gameOver && players.p2.gameOver) {
        document.getElementById('restart').style.display = 'block';
    }
}

function restartGame() {
    // Oyuncu 1'i sıfırla
    players.p1.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    players.p1.score = 0;
    players.p1.level = 1;
    players.p1.gameOver = false;
    players.p1.dropCounter = 0;
    players.p1.lastTime = 0;
    players.p1.dropInterval = 1000;
    players.p1.holdPiece = { shape: null, color: null };
    players.p1.nextPiece = { shape: null, color: null };
    players.p1.canHold = true;
    document.getElementById('score1').textContent = '0';
    document.getElementById('level1').textContent = '1';
    document.getElementById('message1').textContent = '';

    // Oyuncu 2'yi sıfırla
    players.p2.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    players.p2.score = 0;
    players.p2.level = 1;
    players.p2.gameOver = false;
    players.p2.dropCounter = 0;
    players.p2.lastTime = 0;
    players.p2.dropInterval = 1000;
    players.p2.holdPiece = { shape: null, color: null };
    players.p2.nextPiece = { shape: null, color: null };
    players.p2.canHold = true;
    document.getElementById('score2').textContent = '0';
    document.getElementById('level2').textContent = '1';
    document.getElementById('message2').textContent = '';

    // Yeniden başlat butonunu gizle
    document.getElementById('restart').style.display = 'none';

    // Yeni parçalar oluştur ve oyunu başlat
    createPiece(players.p1);
    createPiece(players.p2);
    update();
}

document.addEventListener('keydown', event => {
    // Oyuncu 1 kontrolleri (WASD + H for hold)
    if (!players.p1.gameOver) {
        switch (event.key.toLowerCase()) {
            case 'a':
                moveLeft(players.p1);
                break;
            case 'd':
                moveRight(players.p1);
                break;
            case 's':
                moveDown(players.p1);
                break;
            case 'w':
                rotate(players.p1);
                break;
            case 'h':
                holdPiece(players.p1);
                break;
        }
    }

    // Oyuncu 2 kontrolleri (Yön tuşları + Space for hold)
    if (!players.p2.gameOver) {
        switch (event.keyCode) {
            case 37: // Sol ok
                moveLeft(players.p2);
                break;
            case 39: // Sağ ok
                moveRight(players.p2);
                break;
            case 40: // Aşağı ok
                moveDown(players.p2);
                break;
            case 38: // Yukarı ok
                rotate(players.p2);
                break;
            case 32: // Space
                event.preventDefault(); // Prevent page scroll
                holdPiece(players.p2);
                break;
        }
    }
});

// Oyunu başlat
createPiece(players.p1);
createPiece(players.p2);
update();