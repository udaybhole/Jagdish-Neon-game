let currentGameState = null;
let showingOptimalPath = false;

function startGame() {
    fetch("/init")
        .then((res) => res.json())
        .then((data) => {
            currentGameState = data.gameState;  // Store initial game state
            showingOptimalPath = false;  // Reset optimal path flag
            
            // Hide all cards and overlays
            document.getElementById("start-button").style.display = "none";
            document.getElementById("victory-card").style.display = "none";
            document.getElementById("victory-overlay").style.display = "none";
            document.getElementById("solution-stats-card").style.display = "none";
            
            // Show grid and controls
            const grid = document.getElementById("grid");
            grid.style.display = "grid";  // Set display to grid
            grid.style.gridTemplateColumns = `repeat(10, 45px)`;  // Force 10x10 grid
            grid.style.gridTemplateRows = `repeat(10, 45px)`;
            
            // Show controls
            document.getElementById("controls-1").style.display = "block";
            document.getElementById("controls-2").style.display = "block";
            document.getElementById("controls-3").style.display = "block";
            document.getElementById("controls-4").style.display = "block";
            
            renderGrid(data.gameState);
        })
        .catch(error => {
            console.error('Error starting game:', error);
        });
}

function move(playerId, direction) {
    fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, direction }),
    })
        .then((res) => res.json())
        .then((data) => {
            currentGameState = data.gameState;  // Store the game state
            renderGrid(data.gameState);
            updateScoreCard(data.gameState.moveCounts);
            
            if (data.status === "win") {
                showVictoryCard(data);
            }
        });
}

function updateMoveCounters(moveCounts) {
    Object.keys(moveCounts).forEach(playerId => {
        const counter = document.getElementById(`counter-${playerId}`);
        if (counter) {
            counter.textContent = `Moves: ${moveCounts[playerId]}`;
        }
    });
}

function renderGrid(gameState) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    
    gameState.maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.className = `cell ${cell}`;
            
            // Add path classes for each player
            Object.keys(gameState.playerPaths).forEach(playerId => {
                if (gameState.playerPaths[playerId].some(pos => pos.x === x && pos.y === y)) {
                    div.classList.add(`path${playerId}`);
                }
            });
            
            // Add player positions
            Object.keys(gameState.players).forEach(playerId => {
                const player = gameState.players[playerId];
                if (player.x === x && player.y === y) {
                    div.classList.add(`player${playerId}`);
                }
            });
            
            grid.appendChild(div);
        });
    });
    
    updateScoreCard(gameState.moveCounts);
}

function updateScoreCard(moveCounts) {
    // Update individual player moves
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`p${i}-moves`).textContent = moveCounts[i];
        document.getElementById(`counter-${i}`).textContent = `Moves: ${moveCounts[i]}`;
    }
    
    // Update total moves and calculate current score
    const totalMoves = Object.values(moveCounts).reduce((a, b) => a + b, 0);
    const maxPossibleMoves = 100 * 4; // Adjust based on your game's maximum
    const currentScore = Math.round((1 - totalMoves / maxPossibleMoves) * 1000);
    
    // Update team score
    document.getElementById('current-score').textContent = Math.max(currentScore, 0);
}

function showOptimalPath() {
    if (!currentGameState || !currentGameState.bestSolution) return;
    
    showingOptimalPath = !showingOptimalPath;
    const grid = document.getElementById("grid");
    const victoryCard = document.getElementById("victory-card");
    const solutionStats = document.getElementById("solution-stats-card");
    const overlay = document.getElementById("victory-overlay");
    
    if (showingOptimalPath) {
        // Hide victory card and show solution stats
        victoryCard.style.display = "none";
        solutionStats.style.display = "block";
        overlay.style.display = "none";
        
        // Update solution stats
        const solution = currentGameState.bestSolution;
        document.getElementById("optimal-total-distance").textContent = solution.totalDistance;
        
        solution.paths.forEach(path => {
            document.getElementById(`optimal-p${path.playerId}-moves`).textContent = path.distance;
        });

        const actualTotalMoves = Object.values(currentGameState.moveCounts).reduce((a, b) => a + b, 0);
        const optimalTotalMoves = solution.totalDistance;
        const efficiency = Math.round((optimalTotalMoves / actualTotalMoves) * 100);

        document.getElementById("actual-total-moves").textContent = actualTotalMoves;
        document.getElementById("optimal-total-moves").textContent = optimalTotalMoves;
        document.getElementById("path-efficiency").textContent = efficiency;
        
        grid.innerHTML = "";
        
        // Render optimal paths
        currentGameState.maze.forEach((row, y) => {
            row.forEach((cell, x) => {
                const div = document.createElement("div");
                div.className = `cell ${cell}`;
                
                if (currentGameState.bestSolution.paths) {
                    currentGameState.bestSolution.paths.forEach(pathData => {
                        if (pathData.path && pathData.path.some(([py, px]) => py === y && px === x)) {
                            div.classList.add(`optimal-path${pathData.playerId}`);
                        }
                    });
                }
                
                const [meetY, meetX] = currentGameState.bestSolution.meetingPoint;
                if (y === meetY && x === meetX) {
                    div.classList.add('meeting-point');
                }
                
                grid.appendChild(div);
            });
        });
    } else {
        // Show victory card and hide solution stats
        victoryCard.style.display = "block";
        solutionStats.style.display = "none";
        overlay.style.display = "block";
        renderGrid(currentGameState);
    }
}

function showVictoryCard(data) {
    const grid = document.getElementById("grid");
    const victoryCard = document.getElementById("victory-card");
    const overlay = document.getElementById("victory-overlay");
    const solutionStats = document.getElementById("solution-stats-card");
    
    // Hide solution stats if showing
    solutionStats.style.display = "none";
    showingOptimalPath = false;
    
    // Update final stats
    document.getElementById("final-score").textContent = data.score;
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`final-p${i}-moves`).textContent = 
            data.gameState.moveCounts[i];
    }
    document.getElementById("final-total-moves").textContent = 
        Object.values(data.gameState.moveCounts).reduce((a, b) => a + b, 0);

    // Show victory card with overlay
    overlay.style.display = "block";
    victoryCard.style.display = "block";
}
