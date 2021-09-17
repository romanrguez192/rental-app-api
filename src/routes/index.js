const express = require("express");
const genres = require("./genres");
const actors = require("./actors");
const customers = require("./customers");
const movies = require("./movies");
// const rentals = require("./rentals");
const studios = require("./studios");
const router = express.Router();

router.use("/genres", genres);
router.use("/actors", actors);
router.use("/customers", customers);
router.use("/movies", movies);
// router.use("/rentals", rentals);
router.use("/studios", studios);

module.exports = router;
