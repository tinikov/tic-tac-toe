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
