// ======= Functions =======
// Renderers
function renderStatusDisplay(display, gameState) {
    if (!gameState.isGameActive) {
        if (gameState.winner) {
            display.innerHTML = `<span><span class="mark">${gameState.winner}</span> wins</span> <span class="mark">☺︎</span> <span><span class="mark">${gameState.winner}</span> 获胜</span>`;
        } else {
            display.innerHTML = `<span>Draw</span> <span><span class="mark">XO</span></span> <span>平局</span>`;
        }
        return;
    }
    display.innerHTML = `<span><span class="mark">${gameState.currentPlayer}</span> play</span> <span class="mark">⛄︎</span> <span>轮到 <span class="mark">${gameState.currentPlayer}</span></span>`;
}

function renderBoard(board, size, cellSize = 120, gapSize = 10) {
    // Create grid layout
    board.innerHTML = ''; // Clear existing board
    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
    board.style.gap = `${gapSize}px`;

    // Create cells
    const cells = [];
    for (let i = 0; i < size ** 2; i++) {
        const cell = document.createElement('button');
        cell.classList.add('cell');
        cell.textContent = '';
        cell.dataset.index = i;
        cells.push(cell);

        board.appendChild(cell);
    }

    return cells;
}

function renderGame(gameState, cells, display) {
    //Update cells
    cells.forEach((cell, index) => {
        cell.textContent = gameState.boardState[index] || '';
        cell.disabled = gameState.boardState[index] !== null || !gameState.isGameActive;
        // Highlight winning combination
        if (gameState.winningCombination?.includes(index)) {
            cell.classList.add('winning');
        } else {
            cell.classList.remove('winning');
        }
    });
    // Update status display
    renderStatusDisplay(display, gameState);
}

// Game logic
function makeMove(index, gameState) {

    if (!gameState.isGameActive || gameState.boardState[index] !== null) {
        return gameState;
    }

    const nextState = {
        ...gameState,
        boardState: [...gameState.boardState]
    };

    nextState.boardState[index] = gameState.currentPlayer;

    // Check for winner
    const { winner, winningCombination } = checkWinner(nextState);
    if (winner) {
        nextState.isGameActive = false;
        nextState.winner = winner;
        nextState.winningCombination = winningCombination;
        return nextState;
    }

    // Check for draw
    if (checkDraw(nextState)) {
        nextState.isGameActive = false;
        nextState.winner = null;
        return nextState;
    }

    // Switch player
    nextState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

    return nextState;
}

function checkWinner(gameState) {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.boardState[a] &&
            gameState.boardState[a] === gameState.boardState[b] &&
            gameState.boardState[a] === gameState.boardState[c]) {
            return {
                winner: gameState.boardState[a],
                winningCombination: combination
            };
        }
    }

    return { winner: null, winningCombination: null };
}

function checkDraw(gameState) {
    return gameState.boardState.every(cell => cell !== null);
}

// Reset game
function resetGame(initialStatus, cells, statusDisplay) {
    const newState = {
        ...initialStatus,
        boardState: [...initialStatus.boardState]
    };
    renderGame(newState, cells, statusDisplay);
    return newState;
}

// ======== Main =======
// Game constants
const BOARD_SIZE = 3;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const CELL_SIZE_PX = 120;
const CELL_GAP_PX = 12;
const BOARD_MAX_WIDTH_PX = BOARD_SIZE * CELL_SIZE_PX + (BOARD_SIZE - 1) * CELL_GAP_PX;

// DOM elements
const container = document.querySelector('.container');
const statusDisplay = document.getElementById('status-display');
const board = document.getElementById('board');
const restartButton = document.getElementById('restart-button');

const initialStatus = {
    boardState: Array(CELL_COUNT).fill(null),
    currentPlayer: 'X',
    isGameActive: true,
    winner: null,
    winningCombination: null
};

let gameState;

// Initialize game
container.style.maxWidth = `${BOARD_MAX_WIDTH_PX}px`;

const cells = renderBoard(board, BOARD_SIZE, CELL_SIZE_PX, CELL_GAP_PX);
cells.forEach((cell, index) => {
    cell.onclick = () => {
        const newState = makeMove(index, gameState);
        if (newState !== gameState) {
            gameState = newState;
            renderGame(gameState, cells, statusDisplay);
        }
    };
});

restartButton.onclick = () => {
    gameState = resetGame(initialStatus, cells, statusDisplay);
}

gameState = resetGame(initialStatus, cells, statusDisplay);
