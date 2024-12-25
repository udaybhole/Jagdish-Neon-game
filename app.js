const express = require("express");
const app = express();
const path = require("path");
const gameRoutes = require("./routes/gameRoutes");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", gameRoutes);
app.post('/move', (req, res) => {
    const { playerId, direction } = req.body;

    if (!playerId || !['up', 'down', 'left', 'right'].includes(direction)) {
        return res.status(400).json({ error: 'Invalid move request.' });
    }

    const success = game.movePlayer(playerId, direction);
    if (success) {
        res.json({ gameState: game.getGameState(), status: game.checkWinCondition() ? 'win' : 'continue' });
    } else {
        res.status(400).json({ error: 'Move failed.' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
