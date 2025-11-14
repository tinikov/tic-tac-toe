// Set up Google GenAI
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });

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
    if (gameState.currentPlayer === 'X') {
        display.innerHTML = `<span><span class="mark">${gameState.currentPlayer}</span> play</span> <span class="mark">⛄︎</span> <span>轮到 <span class="mark">${gameState.currentPlayer}</span></span>`;
    } else {
        display.innerHTML = `<span class="mark">X</span> <span>AI 思考中...</span><span class="mark">O</span>`;
    }
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

// AI makes a random move
async function aiMakeMove(gameState) {
    // Send board state to AI and get its move
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "The current board state is " + gameState.boardState + ". Where do you want to place your O?",
        config: {
            systemInstruction: "We are now playing tic-tac-toe game. The cells of the board are numbered from 0 to 8. For example: top-left is 0, top-middle is 1, top-right is 2,... You are playing as 'O' and I am playing as 'X'. I will give you the board state array. The array index represent the cell number. Please respond with the index of the cell where you want to place your 'O'. You can only choose an empty cell. You have to respond with only the index number. You have to play to win.",
        },
    });
    const cellIndex = parseInt(response.text);
    console.log("AI chose cell index: ", cellIndex);

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
    cell.onclick = async () => {
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
                const aiState = await aiMakeMove(gameState);
                gameState = aiState;
                renderGame(gameState, cells, statusDisplay);
            }
        }
    };
});

restartButton.onclick = () => {
    gameState = resetGame(initialStatus, cells, statusDisplay);
}

gameState = resetGame(initialStatus, cells, statusDisplay);