document.addEventListener('DOMContentLoaded', function () {
    const boardSize = 4;
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const resetButton = document.getElementById('reset-button');
    const initialTiles = ['flour', 'water', 'tomato'];
    const toppingTiles = ['pepperoni', 'mushroom', 'olive', 'pineapple', , 'flour', 'water', 'tomato'];
    let tiles = Array(boardSize * boardSize).fill(null);
    let score = 0;
    let pizzaCreated = false;
    let baseCreated = false;
    let lastThreeTiles = [];


    const combinations = {
        'flour-water': 'dough',
        'water-flour': 'dough',
        'tomato-water': 'sauce',
        'water-tomato': 'sauce',
        'dough-sauce': 'base',
        'sauce-dough': 'base',
        'base-cheese': 'pizza',
        'cheese-base': 'pizza',
        'pizza-pepperoni': 'pepperoni pizza',
        'pepperoni-pizza': 'pepperoni pizza',
        'pizza-mushroom': 'mushroom pizza',
        'mushroom-pizza': 'mushroom pizza',
        'pizza-olive': 'olive pizza',
        'olive-pizza': 'olive pizza',
        'pizza-pineapple': 'pineapple pizza',
        'pineapple-pizza': 'pineapple pizza',
        'pepperoni pizza-olive': 'pepperoni olive pizza',
        'olive-pepperoni pizza': 'pepperoni olive pizza',
        'pepperoni pizza-mushroom': 'mushroom pepperoni pizza',
        'mushroom-pepperoni pizza': 'mushroom pepperoni pizza',
        'pepperoni pizza-pineapple': 'pepperoni pineapple pizza',
        'pineapple-pepperoni pizza': 'pepperoni pineapple pizza',
        'mushroom pizza-olive': 'mushroom olive pizza',
        'olive-mushroom pizza': 'mushroom olive pizza',
        'mushroom pizza-pineapple': 'mushroom pineapple pizza',
        'pineapple-mushroom pizza': 'mushroom pineapple pizza',
        'olive pizza-pineapple': 'olive pineapple pizza',
        'pineapple-olive pizza': 'olive pineapple pizza',
        'pepperoni olive pizza-mushroom': 'pepperoni olive mushroom pizza',
        'pepperoni mushroom pizza-olive': 'pepperoni olive mushroom pizza',
        'mushroom olive pizza-pepperoni': 'pepperoni olive mushroom pizza',
        'pepperoni pizza-mushroom olive': 'pepperoni olive mushroom pizza',
        'mushroom pizza-pepperoni olive': 'pepperoni olive mushroom pizza',
        'olive pizza-pepperoni mushroom': 'pepperoni olive mushroom pizza',
        'pepperoni olive mushroom pizza-pineapple': 'ultimate pizza',
        'pepperoni mushroom pizza-olive pineapple': 'ultimate pizza',
        'mushroom olive pizza-pepperoni pineapple': 'ultimate pizza',
        'pizza-pepperoni olive mushroom pineapple': 'ultimate pizza',
        'pepperoni olive pizza-pineapple': 'pepperoni olive pineapple pizza',
        'pepperoni mushroom pizza-pineapple': 'pepperoni mushroom pineapple pizza',
        'mushroom olive pizza-pineapple': 'olive mushroom pineapple pizza',
        'pepperoni mushroom pineapple pizza-olive': 'pepperoni mushroom pineapple pizza',
        'pepperoni olive pineapple pizza-mushroom': 'pepperoni olive pineapple pizza',
        'mushroom olive pineapple pizza-pepperoni': 'olive mushroom pineapple pizza',
        'pepperoni pizza-mushroom olive pineapple': 'ultimate pizza',
        'mushroom pizza-pepperoni olive pineapple': 'ultimate pizza',
        'olive pizza-pepperoni mushroom pineapple': 'ultimate pizza'
    };

    const points = {
        'dough': 10,
        'sauce': 10,
        'base': 20,
        'pizza': 50,
        'pepperoni pizza': 150,
        'mushroom pizza': 150,
        'olive pizza': 150,
        'pineapple pizza': 150,
        'pepperoni olive pizza': 300,
        'mushroom pepperoni pizza': 300,
        'pepperoni pineapple pizza': 300,
        'mushroom olive pizza': 300,
        'mushroom pineapple pizza': 300,
        'olive pineapple pizza': 300,
        'pepperoni olive mushroom pizza': 500,
        'pepperoni olive pineapple pizza': 500,
        'pepperoni mushroom pineapple pizza': 500,
        'olive mushroom pineapple pizza': 500,
        'ultimate pizza': 1000
    };


    function initGame() {
        for (let i = 0; i < initialTiles.length; i++) {
            placeRandomTile(initialTiles[i]);
        }
        drawBoard();
        document.addEventListener('keydown', handleInput);
        resetButton.addEventListener('click', resetGame);
    }

    function drawBoard() {
        gameBoard.innerHTML = '';
        tiles.forEach((tile, index) => {
            const cell = document.createElement('div');
            cell.className = 'tile';
            if (tile) {
                cell.classList.add(tile.replace(/ /g, '-'));
                cell.innerText = tile;
            }
            gameBoard.appendChild(cell);
        });
        scoreDisplay.innerText = score;
    }

    function placeRandomTile(type) {
        let emptyCells = tiles.map((tile, index) => tile === null ? index : null).filter(index => index !== null);
        if (emptyCells.length === 0) return false;

        // Filter positions where the tile can combine with an existing tile
        let possiblePositions = emptyCells.filter(index => {
            let adjacentIndices = getAdjacentIndices(index);
            return adjacentIndices.some(adjIndex => tiles[adjIndex] && isValidCombination(type, tiles[adjIndex]));
        });

        let randomCell;
        if (possiblePositions.length > 0) {
            randomCell = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        } else {
            // If no such position, place it in any empty cell
            randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        tiles[randomCell] = type;
        updateLastThreeTiles(type);
        return true;
    }

    function combineTiles(a, b) {
        return combinations[`${a}-${b}`] || combinations[`${b}-${a}`] || null;
    }

    function isValidCombination(a, b) {
        return combinations[`${a}-${b}`] || combinations[`${b}-${a}`];
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
            let newTile;
            do {
                if (baseCreated) {
                    newTile = pizzaCreated ? toppingTiles[Math.floor(Math.random() * toppingTiles.length)] : (Math.random() < 0.5 ? 'cheese' : initialTiles[Math.floor(Math.random() * initialTiles.length)]);
                } else {
                    newTile = initialTiles[Math.floor(Math.random() * initialTiles.length)];
                }
            } while (isTileRepeated(newTile));
            placeRandomTile(newTile);
            drawBoard();
            if (isGameOver()) {
                alert('Game Over!');
                resetGame();
            }
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
                        score += points[combinedTile];
                        moved = true;
                        if (combinedTile === 'base') {
                            baseCreated = true;
                        }
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
            if (i % boardSize < boardSize - 1 && combineTiles(tiles[i], tiles[i + 1])) return false;
            if (i < tiles.length - boardSize && combineTiles(tiles[i], tiles[i + boardSize])) return false;
        }
        return true;
    }

    function resetGame() {
        tiles = Array(boardSize * boardSize).fill(null);
        score = 0;
        pizzaCreated = false;
        baseCreated = false;
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

    initGame();
});
