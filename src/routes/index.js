const express = require("express");
const genres = require("./genres");
const actors = require("./actors");
const customers = require("./customers");
const movies = require("./movies");
const rentals = require("./rentals");
const studios = require("./studios");
const auth = require("./auth");
const _return = require("./return");
const router = express.Router();

router.use("/genres", genres);
router.use("/actors", actors);
router.use("/customers", customers);
router.use("/movies", movies);
router.use("/rentals", rentals);
router.use("/studios", studios);
router.use("/return", _return);
router.use("/auth", auth);

module.exports = router;
