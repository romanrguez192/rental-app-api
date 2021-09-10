const express = require("express");
const movies = require("./movies");
const router = express.Router();

router.use("/movies", movies);

module.exports = router;
