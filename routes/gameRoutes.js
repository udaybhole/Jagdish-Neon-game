const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get("/", gameController.renderGame);
router.get("/init", gameController.initGame);
router.post("/move", gameController.movePlayer);

module.exports = router;
