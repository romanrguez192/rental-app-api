const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Movies Route");
});

module.exports = router;
