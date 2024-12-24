const Game = require("../models/game");

const game = new Game(10);

exports.renderGame = (req, res) => {
    res.render("index");
};

exports.initGame = (req, res) => {
    game.resetGame();
    res.json({ gameState: game.getGameState() });
};

exports.movePlayer = (req, res) => {
    const { playerId, direction } = req.body;
    const moves = {
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
        upLeft: { dx: -1, dy: -1 },
        upRight: { dx: 1, dy: -1 },
        downLeft: { dx: -1, dy: 1 },
        downRight: { dx: 1, dy: 1 },
    };

    const move = moves[direction];
    if (move && game.movePlayer(playerId, move.dx, move.dy)) {
        if (game.arePlayersAdjacent()) {
            game.gameWon = true;
            return res.json({
                status: "win",
                gameState: game.getGameState(),
                score: game.calculateScore(),
            });
        }
        return res.json({ status: "success", gameState: game.getGameState() });
    }

    res.json({ status: "blocked", gameState: game.getGameState() });
};