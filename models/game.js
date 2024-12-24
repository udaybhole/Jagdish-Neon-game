const findOptimalPaths = require('./bestSolution');

class Game {
    constructor(size = 10) {
        this.size = size;
        this.maze = [];
        this.players = {};
        this.moveCounts = {};
        this.gameWon = false;
        this.playerPaths = {
            1: [],
            2: [],
            3: [],
            4: []
        };
    }

    initMaze() {
        this.maze = Array.from({ length: this.size }, () =>
            Array(this.size).fill("empty")
        );
        this.generateObstacles();
    }

    initPlayer() {
        // Place players at corners
        this.players[1] = { x: 0, y: 0 };
        this.players[2] = { x: this.size-1, y: 0 };
        this.players[3] = { x: 0, y: this.size-1 };
        this.players[4] = { x: this.size-1, y: this.size-1 };
        
        // Initialize move counts and paths
        for (let i = 1; i <= 4; i++) {
            this.moveCounts[i] = 0;
            this.playerPaths[i] = [{ x: this.players[i].x, y: this.players[i].y }];
        }
    }

    generateObstacles() {
        let placed = 0;
        const maxObstacles = Math.floor(this.size * this.size * 0.20);
        while (placed < maxObstacles) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            
           
           
            // Check other conditions
            if (this.maze[y][x] === "empty" && 
                !this.isCornerOrAdjacent(x, y) &&
                !this.wouldBlockPath(x, y)) {
                this.maze[y][x] = "obstacle";
                placed++;
            }
        }
    }

    wouldBlockPath(x, y) {
        const adjacentCells = [
            [x-1, y], [x+1, y],
            [x, y-1], [x, y+1]
        ];

        let blockedCount = 0;
        for (let [adjX, adjY] of adjacentCells) {
            if (adjX < 0 || adjX >= this.size || 
                adjY < 0 || adjY >= this.size || 
                this.maze[adjY][adjX] === "obstacle") {
                blockedCount++;
            }
        }

        return blockedCount >= 3;
    }

    isCornerOrAdjacent(x, y) {
        const corners = [
            [0,0], [0,1], [1,0], [1,1],
            [this.size-1,0], [this.size-2,0], [this.size-1,1], [this.size-2,1],
            [0,this.size-1], [0,this.size-2], [1,this.size-1], [1,this.size-2],
            [this.size-1,this.size-1], [this.size-2,this.size-1], 
            [this.size-1,this.size-2], [this.size-2,this.size-2],
            [2,0], [0,2], [2,1], [1,2],
            [this.size-3,0], [this.size-1,2],
            [0,this.size-3], [2,this.size-1],
            [this.size-1,this.size-3], [this.size-3,this.size-1]
        ];
        return corners.some(([cx, cy]) => cx === x && cy === y);
    }

    movePlayer(playerId, dx, dy) {
        if (this.gameWon) return false;
    
        const player = this.players[playerId];
        const newX = player.x + dx;
        const newY = player.y + dy;
    
        if (
            newX >= 0 &&
            newX < this.size &&
            newY >= 0 &&
            newY < this.size &&
            this.maze[newY][newX] !== "obstacle"
        ) {
            
            player.x = newX;
            player.y = newY;
    
            this.moveCounts[playerId]++;
            this.playerPaths[playerId].push({ x: newX, y: newY });
    
            console.log(`Player ${playerId} moved to (${newX}, ${newY})`);
            return true;
        }
    
        return false;
    }
    

    arePlayersAdjacent() {
        const positions = Object.values(this.players);
        const firstPlayer = positions[0];
        
        // Check if all players are in the exact same position
        return positions.every(player => 
            player.x === firstPlayer.x && player.y === firstPlayer.y
        );
    }

    calculateScore() {
        const totalMoves = Object.values(this.moveCounts).reduce((a, b) => a + b, 0);
        const maxPossibleMoves = this.size * this.size * 4; // Theoretical maximum moves
        const score = Math.round((1 - totalMoves / maxPossibleMoves) * 1000);
        return Math.max(score, 0); // Ensure score doesn't go negative
    }

    calculateOptimalPath() {
        // Convert maze to binary grid (0: empty, 1: obstacle)
        const binaryGrid = this.maze.map(row => 
            row.map(cell => cell === "obstacle" ? 1 : 0)
        );

        // Get all optimal paths for every point
        const solution = findOptimalPaths(binaryGrid);

        // Check if a valid solution was found
        if (!solution.meetingPoint || !solution.paths) {
            return null;
        }

        return {
            meetingPoint: solution.meetingPoint,
            paths: solution.paths,
            totalDistance: solution.totalDistance
        };
    }

    getGameState() {
        const bestSolution = this.gameWon ? this.calculateOptimalPath() : null;
        
        return {
            maze: this.maze,
            players: this.players,
            moveCounts: this.moveCounts,
            gameWon: this.gameWon,
            score: this.gameWon ? this.calculateScore() : null,
            playerPaths: this.playerPaths,
            bestSolution: bestSolution
        };
    }

    resetGame() {
        this.maze = [];
        this.players = {};
        this.moveCounts = {};
        this.gameWon = false;
        this.playerPaths = {
            1: [],
            2: [],
            3: [],
            4: []
        };
        this.initMaze();
        this.initPlayer();
    }
}

module.exports = Game;
