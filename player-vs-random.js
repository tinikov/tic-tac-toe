// ======= Functions =======

// AI makes a random move
function aiMakeMove(gameState) {
    // Find all empty cells
    const emptyCells = [];
    for (let i = 0; i < gameState.boardState.length; i++) {
        if (gameState.boardState[i] === null) {
            emptyCells.push(i);
        }
    }

    // If no empty cells, return current state
    if (emptyCells.length === 0) {
        return gameState;
    }

    // Randomly select an empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cellIndex = emptyCells[randomIndex];

    // Make the move for AI
    return makeMove(cellIndex, gameState);
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
        // Player makes a move (X)
        const newState = makeMove(index, gameState);
        if (newState !== gameState) {
            gameState = newState;
            renderGame(gameState, cells, statusDisplay);

            // If game is still active and it's AI's turn (O), let AI make a move
            if (gameState.isGameActive && gameState.currentPlayer === 'O') {
                // Disable all cells during AI's turn
                cells.forEach(c => c.disabled = true);

                // Add a slight delay so player can see their move
                setTimeout(() => {
                    const aiState = aiMakeMove(gameState);
                    gameState = aiState;
                    renderGame(gameState, cells, statusDisplay);
                }, 500); // 500ms delay
            }
        }
    };
});

restartButton.onclick = () => {
    gameState = resetGame(initialStatus, cells, statusDisplay);
}

gameState = resetGame(initialStatus, cells, statusDisplay);