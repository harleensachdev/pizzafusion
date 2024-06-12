document.addEventListener('DOMContentLoaded', function () {
    const boardSize = 4;
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const resetButton = document.getElementById('reset-button');
    const resetHighScoreButton = document.getElementById('reset-high-score-button');
    const initialTiles = ['flour', 'water', 'tomato'];
    const toppingTiles = ['pepperoni', 'mushroom', 'pineapple', 'cheese', 'ham'];
    let tiles = Array(boardSize * boardSize).fill(null);
    let score = 0;
    let highScore = 0;
    let pizzaCreated = false;
    let lastThreeTiles = [];

    const points = {
        'dough': 10,
        'sauce': 10,
        'pizza': 50,
        'pizza pepperoni': 200,
        'pizza cheese': 200,
        'pizza mushroom': 200,
        'pizza pineapple': 200,
        'pizza ham': 200,
        'pizza pepperoni cheese': 350,
        'pizza pepperoni mushroom': 350,
        'pizza pepperoni pineapple': 350,
        'pizza pepperoni ham': 350,
        'pizza cheese mushroom': 350,
        'pizza cheese pineapple': 350,
        'pizza cheese ham': 350,
        'pizza mushroom pineapple': 350,
        'pizza mushroom ham': 350,
        'pizza pineapple ham': 350,
        'pizza pepperoni cheese mushroom': 600,
        'pizza pepperoni cheese pineapple': 600,
        'pizza pepperoni cheese ham': 600,
        'pizza pepperoni mushroom pineapple': 600,
        'pizza pepperoni mushroom ham': 600,
        'pizza pepperoni pineapple ham': 600,
        'pizza cheese mushroom pineapple': 600,
        'pizza cheese mushroom ham': 600,
        'pizza cheese pineapple ham': 600,
        'pizza mushroom pineapple ham': 600,
        'pizza pepperoni cheese mushroom pineapple': 1200,
        'pizza pepperoni cheese mushroom ham': 1200,
        'pizza pepperoni cheese pineapple ham': 1200,
        'pizza pepperoni mushroom pineapple ham': 1200,
        'pizza cheese mushroom pineapple ham': 1200,
        'pizza pepperoni cheese mushroom pineapple ham': 1500,
    };

    function initGame() {
        loadHighScore();
        for (let i = 0; i < initialTiles.length; i++) {
            placeRandomTile(initialTiles[i]);
        }
        drawBoard();
        document.addEventListener('keydown', handleInput);
        resetButton.addEventListener('click', function () {
            updateHighScore();
            resetGame();
        });
        resetHighScoreButton.addEventListener('click', resetHighScore);
        setupTouchControls();
    }

    function drawBoard() {
        gameBoard.innerHTML = '';
        tiles.forEach((tile, index) => {
            const cell = document.createElement('div');
            cell.className = 'tile';
            if (tile) {
                cell.classList.add(tile.replace(/ /g, '-'));
                cell.innerText = tile;
                if (tile.length > 10) {
                    cell.style.fontSize = '0.8em';
                } else if (tile.length > 6) {
                    cell.style.fontSize = '1em';
                } else {
                    cell.style.fontSize = '1.5em';
                }
            }
            gameBoard.appendChild(cell);
        });
        scoreDisplay.innerText = score;
        highScoreDisplay.innerText = highScore;
    }

    function placeRandomTile(type) {
        let emptyCells = tiles.map((tile, index) => tile === null ? index : null).filter(index => index !== null);
        if (emptyCells.length === 0) return false;

        let possiblePositions = emptyCells.filter(index => {
            let adjacentIndices = getAdjacentIndices(index);
            return adjacentIndices.some(adjIndex => tiles[adjIndex] && isValidCombination(type, tiles[adjIndex]));
        });

        let randomCell;
        if (possiblePositions.length > 0) {
            randomCell = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        } else {
            randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        tiles[randomCell] = type;
        updateLastThreeTiles(type);
        return true;
    }

    function combineTiles(a, b) {
        if ((a === 'flour' && b === 'water') || (a === 'water' && b === 'flour')) return 'dough';
        if ((a === 'tomato' && b === 'water') || (a === 'water' && b === 'tomato')) return 'sauce';
        if ((a === 'dough' && b === 'sauce') || (a === 'sauce' && b === 'dough')) return 'pizza';

        if (a.startsWith('pizza') && toppingTiles.includes(b)) {
            let toppings = a.split(' ').slice(1);
            if (toppings.includes(b)) return null;
            let newPizza = 'pizza ' + toppings.concat(b).sort().join(' ');
            return newPizza;
        }

        if (b.startsWith('pizza') && toppingTiles.includes(a)) {
            let toppings = b.split(' ').slice(1);
            if (toppings.includes(a)) return null;
            let newPizza = 'pizza ' + toppings.concat(a).sort().join(' ');
            return newPizza;
        }

        if (a === 'pizza' && toppingTiles.includes(b)) return 'pizza ' + b;
        if (b === 'pizza' && toppingTiles.includes(a)) return 'pizza ' + a;

        return null;
    }

    function isValidCombination(a, b) {
        return combineTiles(a, b) !== null;
    }

    function handleInput(event) {
        let moved = false;
        switch (event.key) {
            case 'ArrowUp':
                moved = slideTiles(0, -1);
                break;
            case 'ArrowDown':
                moved = slideTiles(0, 1);
                break;
            case 'ArrowLeft':
                moved = slideTiles(-1, 0);
                break;
            case 'ArrowRight':
                moved = slideTiles(1, 0);
                break;
        }
        if (moved) {
            handleTileAddition();
        }
    }

    function handleTileAddition() {
        let newTile;
        do {
            if (pizzaCreated) {
                if (Math.random() < 0.5) {
                    newTile = initialTiles[Math.floor(Math.random() * initialTiles.length)];
                } else {
                    newTile = toppingTiles[Math.floor(Math.random() * toppingTiles.length)];
                }
            } else {
                newTile = initialTiles[Math.floor(Math.random() * initialTiles.length)];
            }
        } while (isTileRepeated(newTile));
        placeRandomTile(newTile);
        drawBoard();
        if (isGameOver()) {
            alert('Game Over! Your score: ' + score);
            updateHighScore();
            resetGame();
        }
    }

    function slideTiles(dx, dy) {
        let moved = false;
        for (let i = 0; i < boardSize; i++) {
            let row = Array(boardSize).fill(null);
            let index = 0;
            for (let j = 0; j < boardSize; j++) {
                let x = i * boardSize + j;
                let y = i + j * boardSize;
                let pos = dx !== 0 ? x : y;
                let tile = tiles[pos];
                if (tile) {
                    if (row[index] && combineTiles(row[index], tile)) {
                        let combinedTile = combineTiles(row[index], tile);
                        row[index] = combinedTile;
                        score += points[combinedTile] || 0;
                        moved = true;
                        if (combinedTile.includes('pizza')) {
                            pizzaCreated = true;
                        }
                    } else if (row[index]) {
                        row[++index] = tile;
                    } else {
                        row[index] = tile;
                        moved = true;
                    }
                }
            }
            for (let j = 0; j < boardSize; j++) {
                let x = i * boardSize + j;
                let y = i + j * boardSize;
                let pos = dx !== 0 ? x : y;
                tiles[pos] = row[j];
            }
        }
        return moved;
    }

    function getAdjacentIndices(index) {
        let indices = [];
        if (index % boardSize > 0) indices.push(index - 1); // Left
        if (index % boardSize < boardSize - 1) indices.push(index + 1); // Right
        if (index >= boardSize) indices.push(index - boardSize); // Up
        if (index < boardSize * (boardSize - 1)) indices.push(index + boardSize); // Down
        return indices;
    }

    function isGameOver() {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] === null) return false;
            if (i % boardSize < boardSize - 1 && isValidCombination(tiles[i], tiles[i + 1])) return false;
            if (i < tiles.length - boardSize && isValidCombination(tiles[i], tiles[i + boardSize])) return false;
        }
        return true;
    }

    function resetGame() {
        updateHighScore();
        tiles = Array(boardSize * boardSize).fill(null);
        score = 0;
        pizzaCreated = false;
        lastThreeTiles = [];
        initGame();
    }

    function updateLastThreeTiles(tile) {
        lastThreeTiles.push(tile);
        if (lastThreeTiles.length > 3) {
            lastThreeTiles.shift();
        }
    }

    function isTileRepeated(tile) {
        return lastThreeTiles.filter(t => t === tile).length >= 3;
    }

    function loadHighScore() {
        highScore = localStorage.getItem('highScore') || 0;
        highScoreDisplay.innerText = highScore;
    }

    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.innerText = highScore;
        }
    }

    function resetHighScore() {
        highScore = 0;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.innerText = highScore;
    }

    function setupTouchControls() {
        let touchstartX = 0;
        let touchstartY = 0;
        let touchendX = 0;
        let touchendY = 0;

        gameBoard.addEventListener('touchstart', function (event) {
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
        });

        gameBoard.addEventListener('touchend', function (event) {
            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            handleSwipeGesture();
        });

        function handleSwipeGesture() {
            let dx = touchendX - touchstartX;
            let dy = touchendY - touchstartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    handleInput({ key: 'ArrowRight' });
                } else {
                    handleInput({ key: 'ArrowLeft' });
                }
            } else {
                if (dy > 0) {
                    handleInput({ key: 'ArrowDown' });
                } else {
                    handleInput({ key: 'ArrowUp' });
                }
            }
        }
    }

    initGame();
});
